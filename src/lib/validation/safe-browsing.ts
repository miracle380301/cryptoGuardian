import { ApiResponse, SafeBrowsingData } from '@/types/api.types';
import { logger } from '@/lib/logger';

// ========================================
// Google Safe Browsing API
// ========================================

export async function checkUrl(domain: string): Promise<ApiResponse<SafeBrowsingData & { score?: number; scoreBreakdown?: string[] }>> {
  try {
    const isServer = typeof window === 'undefined';

    if (isServer) {
      // Server-side: perform direct Google API check
      return await performGoogleSafeBrowsingCheck(domain);
    } else {
      // Client-side: use API endpoint
      const response = await fetch('/api/safe-browsing-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Safe Browsing check failed');
      }

      return data;
    }
  } catch (error) {
    logger.warn('Safe Browsing check failed', { domain, error: error instanceof Error ? error.message : String(error) });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Safe Browsing check failed',
      timestamp: new Date().toISOString()
    };
  }
}

async function performGoogleSafeBrowsingCheck(domain: string): Promise<ApiResponse<SafeBrowsingData & { score?: number; scoreBreakdown?: string[] }>> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  const scoreBreakdown: string[] = [];

  // Check if API key is configured
  if (!apiKey || apiKey === 'your_google_safe_browsing_api_key_here') {
    return {
      success: true,
      data: {
        safe: true,
        threats: [],
        score: 75, // Neutral score when API not available
        scoreBreakdown: ['Google Safe Browsing API not configured']
      },
      timestamp: new Date().toISOString()
    };
  }

  try {
    logger.debug('Safe Browsing: Checking domain', { domain });

    const requestBody = {
      client: {
        clientId: 'cryptoguardian',
        clientVersion: '1.0.0'
      },
      threatInfo: {
        threatTypes: [
          'MALWARE',
          'SOCIAL_ENGINEERING',
          'UNWANTED_SOFTWARE',
          'POTENTIALLY_HARMFUL_APPLICATION'
        ],
        platformTypes: ['ALL_PLATFORMS'],
        threatEntryTypes: ['URL'],
        threatEntries: [
          { url: `http://${domain}` },
          { url: `https://${domain}` },
          { url: `http://www.${domain}` },
          { url: `https://www.${domain}` }
        ]
      }
    };

    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (response.ok) {
      const data = await response.json();
      logger.debug('Safe Browsing: API response received', { domain, matchCount: data.matches?.length || 0 });

      if (data.matches?.length > 0) {
        // Google detected threat - immediate block
        return {
          success: true,
          data: {
            safe: false,
            threats: data.matches.map((match: any) => ({
              threatType: match.threatType,
              platformType: match.platformType,
              threatEntryType: match.threatEntryType
            })),
            score: 0,
            scoreBreakdown: ['Google Safe Browsing: Threat detected (BLOCKED)']
          },
          timestamp: new Date().toISOString()
        };
      } else {
        // No threats detected
        return {
          success: true,
          data: {
            safe: true,
            threats: [],
            score: 100,
            scoreBreakdown: ['Google Safe Browsing: No threats detected']
          },
          timestamp: new Date().toISOString()
        };
      }
    } else {
      const errorText = await response.text();
      logger.warn('Safe Browsing: API error', { domain, status: response.status, errorText });

      return {
        success: true,
        data: {
          safe: true,
          threats: [],
          score: 75, // Neutral score when API fails
          scoreBreakdown: ['Google Safe Browsing API error - neutral score']
        },
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    logger.error('Safe Browsing: API error', error instanceof Error ? error : undefined, { domain });

    return {
      success: true,
      data: {
        safe: true,
        threats: [],
        score: 75, // Neutral score when API fails
        scoreBreakdown: ['Google Safe Browsing API unavailable - neutral score']
      },
      timestamp: new Date().toISOString()
    };
  }
}