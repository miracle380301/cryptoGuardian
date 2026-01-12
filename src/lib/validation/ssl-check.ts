import { ApiResponse, SSLCertificate, ApiError } from '@/types/api.types';
import prisma from '@/lib/db/prisma';
import { logger } from '@/lib/logger';
import https from 'https';
import { TLSSocket } from 'tls';

// ============================================
// SSL Certificate Type Detection
// ============================================

// Known EV (Extended Validation) issuers
const EV_INDICATORS = [
  'EV SSL',
  'Extended Validation',
  'EV Server',
  'EV RSA',
  'EV Code'
];

// Premium CAs (typically used for OV/EV)
const PREMIUM_CAS = [
  'DigiCert',
  'Sectigo',
  'GlobalSign',
  'Entrust',
  'Comodo',
  'GeoTrust',
  'Thawte',
  'Symantec',
  'VeriSign'
];

// Free/DV CAs
const FREE_CAS = [
  "Let's Encrypt",
  'ZeroSSL',
  'Buypass',
  'SSL.com Free',
  'Cloudflare'
];

interface SSLDetails {
  valid: boolean;
  hasSSL: boolean;
  issuer: string;
  issuerOrg: string;
  type: 'EV' | 'OV' | 'DV' | 'unknown';
  validFrom?: Date;
  validTo?: Date;
  daysOld?: number;
  daysUntilExpiry?: number;
  subject?: string;
  trustScore: number;
  errors: string[];
}

// ============================================
// Get detailed SSL certificate info
// ============================================
async function getSSLDetails(domain: string): Promise<SSLDetails> {
  return new Promise((resolve) => {
    const options = {
      hostname: domain,
      port: 443,
      method: 'HEAD',
      rejectUnauthorized: false,
      timeout: 5000,
      agent: false
    };

    const req = https.request(options, (res) => {
      try {
        const socket = res.socket as TLSSocket;

        if (!socket.getPeerCertificate) {
          resolve(createBasicResult(true, 'SSL valid but details unavailable'));
          return;
        }

        const cert = socket.getPeerCertificate(true);

        if (!cert || Object.keys(cert).length === 0) {
          resolve(createBasicResult(true, 'Certificate details unavailable'));
          return;
        }

        const issuerOrg = cert.issuer?.O || '';
        const issuerCN = cert.issuer?.CN || '';
        const issuer = issuerOrg || issuerCN || 'unknown';

        const validFrom = cert.valid_from ? new Date(cert.valid_from) : undefined;
        const validTo = cert.valid_to ? new Date(cert.valid_to) : undefined;
        const now = new Date();

        const daysOld = validFrom
          ? Math.floor((now.getTime() - validFrom.getTime()) / (1000 * 60 * 60 * 24))
          : undefined;

        const daysUntilExpiry = validTo
          ? Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : undefined;

        // Determine certificate type
        const certType = detectCertType(issuer, issuerOrg, cert.subject?.O);

        // Calculate trust score
        const trustScore = calculateSSLTrustScore(certType, daysOld, daysUntilExpiry, socket.authorized);

        resolve({
          valid: socket.authorized !== false,
          hasSSL: true,
          issuer,
          issuerOrg,
          type: certType,
          validFrom,
          validTo,
          daysOld,
          daysUntilExpiry,
          subject: cert.subject?.CN || cert.subject?.O,
          trustScore,
          errors: []
        });

      } catch (err) {
        resolve(createBasicResult(true, 'Certificate parsing error'));
      }
    });

    req.on('error', (err) => {
      let errorMsg = 'HTTPS connection failed';

      if (err.message.includes('ENOTFOUND')) {
        errorMsg = 'Domain not found';
      } else if (err.message.includes('ECONNREFUSED')) {
        errorMsg = 'Connection refused';
      } else if (err.message.includes('CERT_')) {
        errorMsg = `Certificate error: ${err.message}`;
      }

      resolve({
        valid: false,
        hasSSL: false,
        issuer: 'unknown',
        issuerOrg: 'unknown',
        type: 'unknown',
        trustScore: 0,
        errors: [errorMsg]
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        valid: false,
        hasSSL: false,
        issuer: 'unknown',
        issuerOrg: 'unknown',
        type: 'unknown',
        trustScore: 0,
        errors: ['Connection timeout (>5s)']
      });
    });

    req.end();
  });
}

// ============================================
// Helper functions
// ============================================

function createBasicResult(valid: boolean, note: string): SSLDetails {
  return {
    valid,
    hasSSL: valid,
    issuer: 'unknown',
    issuerOrg: 'unknown',
    type: 'unknown',
    trustScore: valid ? 70 : 0,
    errors: valid ? [] : [note]
  };
}

function detectCertType(issuer: string, issuerOrg: string, subjectOrg?: string): 'EV' | 'OV' | 'DV' | 'unknown' {
  const combined = `${issuer} ${issuerOrg}`.toLowerCase();

  // Check for EV indicators
  if (EV_INDICATORS.some(ev => combined.includes(ev.toLowerCase()))) {
    return 'EV';
  }

  // Check if subject has organization (indicates OV or EV)
  if (subjectOrg && subjectOrg.length > 0) {
    // Premium CA with org = likely OV
    if (PREMIUM_CAS.some(ca => combined.includes(ca.toLowerCase()))) {
      return 'OV';
    }
  }

  // Free CAs are always DV
  if (FREE_CAS.some(ca => combined.includes(ca.toLowerCase()))) {
    return 'DV';
  }

  // Default to DV for unknown issuers
  return 'DV';
}

function calculateSSLTrustScore(
  certType: 'EV' | 'OV' | 'DV' | 'unknown',
  daysOld?: number,
  daysUntilExpiry?: number,
  isAuthorized?: boolean
): number {
  // Base score for valid SSL
  let score = 70;

  // Certificate type bonus
  if (certType === 'EV') {
    score += 20;
  } else if (certType === 'OV') {
    score += 10;
  }
  // DV gets no bonus

  // Certificate age penalty (too new = suspicious)
  if (daysOld !== undefined) {
    if (daysOld < 7) {
      score -= 20;  // Very new: suspicious
    } else if (daysOld < 30) {
      score -= 10;  // Somewhat new: slightly suspicious
    }
  }

  // Expiry warning
  if (daysUntilExpiry !== undefined) {
    if (daysUntilExpiry < 0) {
      score -= 30;  // Expired
    } else if (daysUntilExpiry < 7) {
      score -= 15;  // Expiring very soon
    } else if (daysUntilExpiry < 30) {
      score -= 5;   // Expiring soon
    }
  }

  // Authorization penalty
  if (isAuthorized === false) {
    score -= 20;
  }

  return Math.max(0, Math.min(100, score));
}

// ============================================
// Main SSL check function
// ============================================
export async function checkSSL(domain: string): Promise<ApiResponse<SSLCertificate & Partial<SSLDetails>>> {
  try {
    const isServer = typeof window === 'undefined';

    if (isServer) {
      // Check if we have cached data in DB
      const whitelistEntry = await prisma.whitelistedDomain.findUnique({
        where: { domain }
      }) as any;

      // Use cache if less than 24 hours old
      if (whitelistEntry?.sslData && whitelistEntry?.lastSSLCheck) {
        const cacheAge = Date.now() - new Date(whitelistEntry.lastSSLCheck).getTime();
        if (cacheAge < 24 * 60 * 60 * 1000) {
          logger.debug('SSL: Using DB cache', { domain });
          return whitelistEntry.sslData;
        }
      }

      logger.debug('SSL: Getting certificate details', { domain });

      // Get detailed SSL info
      const sslDetails = await getSSLDetails(domain);

      const sslData: SSLCertificate & Partial<SSLDetails> = {
        valid: sslDetails.valid,
        hasSSL: sslDetails.hasSSL,
        errors: sslDetails.errors,
        // Extended fields
        issuer: sslDetails.issuer,
        issuerOrg: sslDetails.issuerOrg,
        type: sslDetails.type,
        daysOld: sslDetails.daysOld,
        daysUntilExpiry: sslDetails.daysUntilExpiry,
        trustScore: sslDetails.trustScore
      };

      const apiResponse = {
        success: true,
        data: sslData,
        timestamp: new Date().toISOString()
      };

      // Store SSL data to DB
      try {
        await prisma.whitelistedDomain.upsert({
          where: { domain },
          update: {
            sslData: apiResponse,
            lastSSLCheck: new Date()
          } as any,
          create: {
            domain,
            name: domain,
            category: 'unknown',
            sslData: apiResponse,
            lastSSLCheck: new Date()
          } as any
        });
      } catch (error) {
        logger.error('Failed to store SSL data', error instanceof Error ? error : undefined, { domain });
      }

      return apiResponse;
    } else {
      // Client-side: call API
      try {
        const response = await fetch('/api/ssl-check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ domain }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'SSL check failed');
        }

        return data;
      } catch (error) {
        logger.warn('SSL API failed', { domain, error: error instanceof Error ? error.message : String(error) });
        return {
          success: false,
          error: error instanceof Error ? error.message : 'SSL check failed',
          timestamp: new Date().toISOString()
        };
      }
    }
  } catch (error) {
    logger.error('SSL Check error', error instanceof Error ? error : undefined, { domain });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}
