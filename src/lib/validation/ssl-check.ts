import { ApiResponse, SSLCertificate, ApiError } from '@/types/api.types';
import prisma from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

export async function checkSSL(domain: string): Promise<ApiResponse<SSLCertificate>> {
  try {
    const isServer = typeof window === 'undefined';

    if (isServer) {
      // Check if we have cached data in DB
      const whitelistEntry = await prisma.whitelistedDomain.findUnique({
        where: { domain }
      }) as any;

      if (whitelistEntry?.sslData) {
        logger.debug('SSL: Using DB cache', { domain });
        return whitelistEntry.sslData;
      }

      logger.debug('SSL: Calling API', { domain });

      let httpsSuccess = false;
      let error = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        await fetch(`https://${domain}`, {
          signal: controller.signal,
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        clearTimeout(timeoutId);
        httpsSuccess = true;

      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            error = 'Connection timeout (>5s)';
          } else if (err.message.includes('ENOTFOUND')) {
            error = 'Domain not found';
          } else if (err.message.includes('ECONNREFUSED')) {
            error = 'Connection refused';
          } else {
            error = err.message;
          }
        } else {
          error = 'HTTPS connection failed';
        }
      }

      const sslData: SSLCertificate = {
        valid: httpsSuccess,
        hasSSL: httpsSuccess,
        errors: error ? [error] : []
      };

      const apiResponse = {
        success: true,
        data: sslData,
        timestamp: new Date().toISOString()
      };

      // Store SSL data to DB
      try {
        if (whitelistEntry) {
          // Update existing whitelist entry
          await prisma.whitelistedDomain.update({
            where: { domain },
            data: {
              sslData: apiResponse,
              lastSSLCheck: new Date()
            } as any
          });
        } else {
          // Create new whitelist entry for SSL data
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
        }
      } catch (error) {
        // Log error but don't fail the main validation
        logger.error('Failed to store SSL data', error instanceof Error ? error : undefined, { domain });
      }

      return apiResponse;
    } else {
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