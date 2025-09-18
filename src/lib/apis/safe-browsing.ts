import { ApiResponse, SafeBrowsingData, ApiError } from '@/types/api.types';
import { getCache } from '@/lib/cache/memory-cache';

// Typosquatting detection utilities
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

export function checkSuspiciousPatterns(domain: string): number {
  const suspiciousKeywords = [
    'phishing', 'fake', 'scam', 'hack', 'steal',
    'verify', 'urgent', 'suspend', 'confirm',
    'secure-', '-support', '-help', 'customer-',
    'wallet-', 'exchange-', 'crypto-', 'bitcoin-'
  ];

  // Suspicious TLDs often used for scams
  const suspiciousTLDs = [
    '.tk', '.ml', '.ga', '.cf', '.gq',  // Free domains
    '.top', '.click', '.download', '.loan', '.work'  // Often abused
  ];

  // Suspicious patterns in domain structure
  const suspiciousPatterns = [
    /\d{4,}/,  // 4+ consecutive digits
    /[a-z]{2,}-[a-z]{2,}-[a-z]{2,}/,  // Multiple hyphens
    /[0-9]+[a-z]+[0-9]+/,  // Numbers mixed with letters
    /^[a-z]{1,2}[0-9]+[a-z]/,  // Short prefix + numbers + letters
  ];

  let penalty = 0;

  // Check suspicious keywords
  suspiciousKeywords.forEach(keyword => {
    if (domain.toLowerCase().includes(keyword)) {
      penalty -= 10;
      console.log(`[PATTERN DEBUG] Found suspicious keyword "${keyword}": -10`);
    }
  });

  // Check suspicious TLDs
  suspiciousTLDs.forEach(tld => {
    if (domain.toLowerCase().endsWith(tld)) {
      penalty -= 20;
      console.log(`[PATTERN DEBUG] Found suspicious TLD "${tld}": -20`);
    }
  });

  // Check suspicious patterns
  suspiciousPatterns.forEach((pattern, index) => {
    if (pattern.test(domain)) {
      penalty -= 15;
      console.log(`[PATTERN DEBUG] Found suspicious pattern ${index + 1}: -15`);
    }
  });

  // Extra penalty for very short domains (likely random)
  const domainName = domain.split('.')[0];
  if (domainName.length <= 4) {
    penalty -= 10;
    console.log(`[PATTERN DEBUG] Very short domain "${domainName}": -10`);
  }

  // Extra penalty for random-looking domains
  if (isRandomLooking(domainName)) {
    penalty -= 15;
    console.log(`[PATTERN DEBUG] Random-looking domain "${domainName}": -15`);
  }

  console.log(`[PATTERN DEBUG] Total pattern penalty for "${domain}": ${penalty}`);
  return penalty;
}

function isRandomLooking(domain: string): boolean {
  // Check for lack of vowels (suspicious)
  const vowels = domain.match(/[aeiou]/gi);
  const consonants = domain.match(/[bcdfghjklmnpqrstvwxyz]/gi);

  if (!vowels || vowels.length === 0) return true;
  if (consonants && vowels && consonants.length / vowels.length > 4) return true;

  // Check for repeating patterns
  const repeatingPattern = /(.{2,})\1/;
  if (repeatingPattern.test(domain)) return false; // Repeating is actually common

  // Check for alternating consonants/vowels (natural language pattern)
  const hasNaturalFlow = /[aeiou][bcdfghjklmnpqrstvwxyz][aeiou]|[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]/i.test(domain);

  return !hasNaturalFlow && domain.length > 6;
}

export function checkTyposquatting(domain: string): number {
  const knownExchanges = [
    'binance.com', 'coinbase.com', 'kraken.com',
    'bybit.com', 'okx.com', 'gate.io',
    'crypto.com', 'gemini.com', 'kucoin.com',
    'bitstamp.net', 'bitfinex.com', 'huobi.com'
  ];

  // Add popular financial sites that are often targeted
  const knownSites = [
    ...knownExchanges,
    'paypal.com', 'amazon.com', 'apple.com',
    'microsoft.com', 'google.com', 'facebook.com',
    'metamask.io', 'uniswap.org'
  ];

  let penalty = 0;
  let minDistance = Infinity;
  let suspiciousMatch = '';

  for (const site of knownSites) {
    // Check both case-sensitive and case-insensitive distances
    const caseSensitiveDistance = levenshteinDistance(domain, site);
    const caseInsensitiveDistance = levenshteinDistance(domain.toLowerCase(), site.toLowerCase());

    // Check for visual similarity attacks (I/l, 0/O, etc.)
    const visualSimilarity = checkVisualSimilarity(domain, site);

    if (caseSensitiveDistance === 0 || caseInsensitiveDistance === 0) {
      return 0; // Exact match - legitimate
    }

    // Use the smaller distance for penalty calculation
    const distance = Math.min(caseSensitiveDistance, caseInsensitiveDistance);

    if (distance < minDistance) {
      minDistance = distance;
      suspiciousMatch = site;
    }

    // Special penalty for visual similarity attacks
    if (visualSimilarity > 0) {
      penalty -= visualSimilarity;
      console.log(`[TYPO DEBUG] Visual similarity attack detected: "${domain}" vs "${site}" penalty: -${visualSimilarity}`);
    }
  }

  // Apply penalties based on closest match
  if (minDistance === 1) {
    penalty -= 50; // One character difference
    console.log(`[TYPO DEBUG] One character difference from "${suspiciousMatch}": -50`);
  } else if (minDistance === 2) {
    penalty -= 30; // Two characters difference
    console.log(`[TYPO DEBUG] Two character difference from "${suspiciousMatch}": -30`);
  } else if (minDistance === 3) {
    penalty -= 10; // Three characters difference
    console.log(`[TYPO DEBUG] Three character difference from "${suspiciousMatch}": -10`);
  }

  console.log(`[TYPO DEBUG] Total typosquatting penalty for "${domain}": ${penalty}`);
  return penalty;
}

function checkVisualSimilarity(domain1: string, domain2: string): number {
  // Visual similarity mappings (confusable characters)
  const confusableChars: Record<string, string[]> = {
    'I': ['l', '1', '|'],  // Capital I vs lowercase l, digit 1, pipe
    'l': ['I', '1', '|'],  // lowercase l vs capital I, digit 1, pipe
    '1': ['I', 'l', '|'],  // digit 1 vs capital I, lowercase l, pipe
    'O': ['0', 'Q'],       // Capital O vs digit 0, capital Q
    '0': ['O', 'Q'],       // digit 0 vs capital O, capital Q
    'rn': ['m'],           // "rn" sequence looks like "m"
    'vv': ['w'],           // "vv" sequence looks like "w"
    'cl': ['d'],           // "cl" sequence can look like "d"
  };

  if (domain1.toLowerCase() === domain2.toLowerCase()) {
    // Same domain but different case - check for visual attacks
    for (let i = 0; i < Math.min(domain1.length, domain2.length); i++) {
      const char1 = domain1[i];
      const char2 = domain2[i];

      if (char1 !== char2) {
        // Check if these are visually confusable
        const confusables = confusableChars[char1] || [];
        if (confusables.includes(char2)) {
          return 60; // High penalty for visual similarity attack
        }
      }
    }
  }

  // Check for character substitution attacks
  let substitutions = 0;
  const domain1Lower = domain1.toLowerCase();
  const domain2Lower = domain2.toLowerCase();

  if (Math.abs(domain1.length - domain2.length) <= 1) {
    for (let i = 0; i < Math.min(domain1.length, domain2.length); i++) {
      const char1 = domain1[i];
      const char2 = domain2[i];

      if (char1 !== char2) {
        // Check if visually similar
        const confusables = confusableChars[char1] || [];
        if (confusables.includes(char2)) {
          substitutions++;
        }
      }
    }
  }

  // Return penalty based on number of visual substitutions
  return substitutions > 0 ? substitutions * 20 : 0;
}

export class SafeBrowsingAPI {
  private cache = getCache();
  private apiKey: string;
  private apiUrl: string = 'https://safebrowsing.googleapis.com/v4';

  constructor() {
    this.apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY || '';
  }

  async checkUrl(domain: string): Promise<ApiResponse<SafeBrowsingData & { score?: number; scoreBreakdown?: string[] }>> {
    try {
      const cleanDomain = this.cleanDomain(domain);

      // Check cache first
      const cacheKey = `safebrowsing:${cleanDomain}`;
      const cached = this.cache.get<SafeBrowsingData & { score?: number; scoreBreakdown?: string[] }>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          cached: true,
          timestamp: new Date().toISOString()
        };
      }

      // Use server-side API for actual Google Safe Browsing check
      const isServer = typeof window === 'undefined';

      if (isServer) {
        // Server-side: perform direct check (avoid internal API call)
        const result = await this.performDirectSafeBrowsingCheck(cleanDomain);

        // Cache successful results for 10 minutes
        if (result.success && result.data) {
          this.cache.set(cacheKey, result.data, 600000);
        }

        return result;
      } else {
        // Client-side: use API endpoint
        const response = await fetch('/api/safe-browsing-check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ domain: cleanDomain }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Safe Browsing check failed');
        }

        // Cache successful results for 10 minutes
        if (data.success && data.data) {
          this.cache.set(cacheKey, data.data, 600000);
        }

        return data;
      }
    } catch (error) {
      console.warn('Safe Browsing API failed, using fallback:', error);
      // Fallback to pattern-based analysis
      return this.performPatternAnalysis(domain);
    }
  }

  private cleanDomain(input: string): string {
    let domain = input.replace(/^https?:\/\//, '');
    domain = domain.replace(/^www\./, '');
    domain = domain.split('/')[0];
    domain = domain.split(':')[0];
    // Preserve case for visual similarity detection
    return domain;
  }

  private async performDirectSafeBrowsingCheck(domain: string): Promise<ApiResponse<SafeBrowsingData & { score?: number; scoreBreakdown?: string[] }>> {
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

    // console.log(`[SAFE_BROWSING DEBUG] Starting check for domain: ${domain}`);
    // console.log(`[SAFE_BROWSING DEBUG] API key available: ${apiKey ? 'YES' : 'NO'}`);
    // console.log(`[SAFE_BROWSING DEBUG] API key length: ${apiKey ? apiKey.length : 0}`);

    // 새로운 보안 우선 점수 체계 (redesigned weighting system)
    let googleApiScore = 30; // Google API 기본 30점 (30% weight)
    let patternScore = 30;   // Pattern analysis 기본 30점 (30% weight)
    let typoScore = 40;      // Typosquatting 기본 40점 (40% weight)
    let googleApiThreats: any[] = [];
    const scoreBreakdown: string[] = [];

    // 1. Typosquatting Detection 먼저 검사 (40% weight - 최고 우선순위)
    console.log(`[SAFE_BROWSING DEBUG] Starting typosquatting analysis for: ${domain}`);
    const typoPenalty = checkTyposquatting(domain);
    console.log(`[SAFE_BROWSING DEBUG] Typosquatting penalty: ${typoPenalty}`);

    if (typoPenalty < 0) {
      // Visual similarity attacks like paypaI.com should be immediate 0
      if (typoPenalty <= -60) {
        console.log(`[SAFE_BROWSING DEBUG] Visual similarity attack detected - setting score to 0`);
        return {
          success: true,
          data: {
            safe: false,
            threats: [{
              threatType: 'SOCIAL_ENGINEERING',
              platformType: 'ALL_PLATFORMS',
              threatEntryType: 'URL'
            }],
            score: 0,
            scoreBreakdown: ['Visual similarity attack detected: 0 points (BLOCKED)', `Typosquatting penalty: ${typoPenalty}`]
          },
          timestamp: new Date().toISOString()
        };
      }

      typoScore = Math.max(0, typoScore + typoPenalty);
      scoreBreakdown.push(`Typosquatting detected: ${typoPenalty} points (Score: ${typoScore}/40)`);
    } else {
      scoreBreakdown.push(`✓ Typosquatting check: ${typoScore}/40 points`);
    }

    // 2. URL Pattern Analysis (30% weight)
    console.log(`[SAFE_BROWSING DEBUG] Starting pattern analysis for: ${domain}`);
    const patternPenalty = checkSuspiciousPatterns(domain);
    console.log(`[SAFE_BROWSING DEBUG] Pattern penalty: ${patternPenalty}`);

    if (patternPenalty < 0) {
      patternScore = Math.max(0, patternScore + patternPenalty);
      scoreBreakdown.push(`Suspicious patterns: ${patternPenalty} points (Score: ${patternScore}/30)`);
    } else {
      scoreBreakdown.push(`✓ Pattern analysis: ${patternScore}/30 points`);
    }

    // 3. Google Safe Browsing API check (30% weight - 보조 역할)
    if (apiKey && apiKey !== 'your_google_safe_browsing_api_key_here') {
      console.log(`[SAFE_BROWSING DEBUG] Using real Google Safe Browsing API`);
      try {
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

        // console.log(`[SAFE_BROWSING DEBUG] Request body:`, JSON.stringify(requestBody, null, 2));
        // console.log(`[SAFE_BROWSING DEBUG] Making API call to Google Safe Browsing...`);

        const response = await fetch(
          `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          }
        );

        // console.log(`[SAFE_BROWSING DEBUG] API response status: ${response.status}`);
        // console.log(`[SAFE_BROWSING DEBUG] API response headers:`, Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json();
          console.log(`[SAFE_BROWSING DEBUG] API response data:`, JSON.stringify(data, null, 2));

          if (data.matches && data.matches.length > 0) {
            // Google이 위협을 발견하면 전체 점수 0점 (완전 차단)
            console.log(`[SAFE_BROWSING DEBUG] Google detected threats - setting total score to 0`);
            googleApiThreats = data.matches.map((match: any) => ({
              threatType: match.threatType,
              platformType: match.platformType,
              threatEntryType: match.threatEntryType
            }));
            return {
              success: true,
              data: {
                safe: false,
                threats: googleApiThreats,
                score: 0,
                scoreBreakdown: ['Google threat detected: 0 points (BLOCKED)', ...scoreBreakdown]
              },
              timestamp: new Date().toISOString()
            };
          } else {
            scoreBreakdown.push('✓ Google Safe Browsing: 30/30 points');
            console.log(`[SAFE_BROWSING DEBUG] No Google threats detected`);
          }
        } else {
          const errorText = await response.text();
          console.warn('Google Safe Browsing API error:', response.status, errorText);
          console.log(`[SAFE_BROWSING DEBUG] API error response:`, errorText);
          googleApiScore = 15; // API 실패시 절반 점수
          scoreBreakdown.push('Google API unavailable: 15/30 points');
        }
      } catch (error) {
        console.error('Google Safe Browsing API error:', error);
        console.log(`[SAFE_BROWSING DEBUG] Exception details:`, error);
        googleApiScore = 15; // API 실패시 절반 점수
        scoreBreakdown.push('Google API error: 15/30 points');
      }
    } else {
      console.log(`[SAFE_BROWSING DEBUG] API key not configured or is placeholder - using pattern analysis only`);
      googleApiScore = 0; // API 키 없으면 0점
      scoreBreakdown.push('Google API key not configured: 0/30 points');
    }

    // Calculate final score with new weighting system
    const finalScore = googleApiScore + patternScore + typoScore;
    console.log(`[SAFE_BROWSING DEBUG] Final score calculation: Google(${googleApiScore}) + Pattern(${patternScore}) + Typo(${typoScore}) = ${finalScore}/100`)

    // Determine threats based on penalties
    const allThreats = [...googleApiThreats];

    if (typoPenalty < 0) {
      allThreats.push({
        threatType: 'SOCIAL_ENGINEERING',
        platformType: 'ALL_PLATFORMS',
        threatEntryType: 'URL'
      });
      console.log(`[SAFE_BROWSING DEBUG] Added SOCIAL_ENGINEERING threat due to typosquatting`);
    }

    if (patternPenalty < 0) {
      allThreats.push({
        threatType: 'UNWANTED_SOFTWARE',
        platformType: 'ALL_PLATFORMS',
        threatEntryType: 'URL'
      });
      console.log(`[SAFE_BROWSING DEBUG] Added UNWANTED_SOFTWARE threat due to suspicious patterns`);
    }

    // Add positive indicators
    if (finalScore >= 90) {
      scoreBreakdown.push('High confidence - likely safe');
    } else if (finalScore >= 70) {
      scoreBreakdown.push('Medium confidence - exercise caution');
    } else {
      scoreBreakdown.push('Low confidence - potentially dangerous');
    }

    const result = {
      success: true,
      data: {
        safe: finalScore >= 70, // 70점 이상만 안전으로 간주
        threats: allThreats,
        score: finalScore,
        scoreBreakdown
      },
      timestamp: new Date().toISOString()
    };

    // console.log(`[SAFE_BROWSING DEBUG] Final result:`, JSON.stringify(result, null, 2));

    return result;
  }

  private async performPatternAnalysis(domain: string): Promise<ApiResponse<SafeBrowsingData & { score?: number; scoreBreakdown?: string[] }>> {
    const cleanDomain = this.cleanDomain(domain);

    // Start with base score of 100 (safe)
    let score = 100;
    const scoreBreakdown: string[] = ['Base safe score: 100'];

    // Pattern analysis (-10 points per suspicious keyword)
    const patternPenalty = checkSuspiciousPatterns(cleanDomain);
    if (patternPenalty < 0) {
      score += patternPenalty;
      scoreBreakdown.push(`Suspicious keywords: ${patternPenalty}`);
    }

    // Typosquatting check
    const typoPenalty = checkTyposquatting(cleanDomain);
    if (typoPenalty < 0) {
      score += typoPenalty;
      scoreBreakdown.push(`Typosquatting similarity: ${typoPenalty}`);
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    // Determine if threats detected
    const threatsDetected = score < 100;
    const threats = [];

    if (threatsDetected) {
      if (typoPenalty < 0) {
        threats.push({
          threatType: 'SOCIAL_ENGINEERING',
          platformType: 'ALL_PLATFORMS',
          threatEntryType: 'URL'
        });
      }
      if (patternPenalty < 0) {
        threats.push({
          threatType: 'UNWANTED_SOFTWARE',
          platformType: 'ALL_PLATFORMS',
          threatEntryType: 'URL'
        });
      }
    }

    return {
      success: true,
      data: {
        safe: !threatsDetected,
        threats,
        score,
        scoreBreakdown
      },
      timestamp: new Date().toISOString()
    };
  }

  private ensureFullUrl(input: string): string {
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
      return `https://${input}`;
    }
    return input;
  }

  private parseResponse(data: any): SafeBrowsingData {
    if (!data.matches || data.matches.length === 0) {
      return {
        safe: true,
        threats: []
      };
    }

    return {
      safe: false,
      threats: data.matches.map((match: any) => ({
        threatType: match.threatType,
        platformType: match.platformType,
        threatEntryType: match.threat?.type || 'URL'
      }))
    };
  }

  private getMockData(url: string): ApiResponse<SafeBrowsingData> {
    // Known malicious patterns for demo
    const maliciousPatterns = [
      'phishing',
      'malware',
      'virus',
      'hack',
      'steal',
      'fake-',
      '-fake',
      'scam',
      '.tk', // Often used for scams
      '.ml', // Often used for scams
      '.ga', // Often used for scams
    ];

    const urlLower = url.toLowerCase();
    const isMalicious = maliciousPatterns.some(pattern => urlLower.includes(pattern));

    // Check for typosquatting
    const legitimateSites = [
      'binance.com',
      'coinbase.com',
      'kraken.com',
      'crypto.com',
      'metamask.io'
    ];

    const isTyposquatting = legitimateSites.some(legit => {
      const legitName = legit.split('.')[0];
      return urlLower.includes(legitName) && !urlLower.includes(legit);
    });

    if (isMalicious || isTyposquatting) {
      return {
        success: true,
        data: {
          safe: false,
          threats: [
            {
              threatType: isTyposquatting ? 'SOCIAL_ENGINEERING' : 'MALWARE',
              platformType: 'ANY_PLATFORM',
              threatEntryType: 'URL'
            }
          ]
        },
        cached: true,
        timestamp: new Date().toISOString()
      };
    }

    // Safe sites
    return {
      success: true,
      data: {
        safe: true,
        threats: []
      },
      cached: true,
      timestamp: new Date().toISOString()
    };
  }
}