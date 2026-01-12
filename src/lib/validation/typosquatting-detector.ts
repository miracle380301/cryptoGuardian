// Enhanced Typosquatting Detection with DB Integration

import { prisma } from '@/lib/db/prisma';

// ============================================
// Cache for legitimate sites (5 minutes TTL)
// ============================================
let cachedSites: string[] | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000;

// General sites often targeted (always included)
const GENERAL_SITES = [
  'paypal.com',
  'amazon.com',
  'apple.com',
  'microsoft.com',
  'google.com',
  'facebook.com',
  'metamask.io',
  'uniswap.org'
];

// ============================================
// Get legitimate sites from DB + cache
// ============================================
async function getLegitimaSites(): Promise<string[]> {
  const now = Date.now();

  if (cachedSites && (now - cacheTime) < CACHE_TTL) {
    return cachedSites;
  }

  try {
    const exchanges = await prisma.exchange.findMany({
      where: { isActive: true, url: { not: null } },
      select: { url: true, name: true }
    });

    const dbSites = exchanges
      .map(e => e.url)
      .filter((url): url is string => url !== null)
      .map(url => {
        try {
          return new URL(url).hostname.replace(/^www\./, '');
        } catch {
          return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
        }
      })
      .filter(domain => domain.length > 0);

    cachedSites = [...new Set([...dbSites, ...GENERAL_SITES])];
    cacheTime = now;

    return cachedSites;
  } catch {
    // Fallback if DB fails
    return GENERAL_SITES;
  }
}

// ============================================
// Levenshtein distance calculation
// ============================================
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// ============================================
// Visual similarity mappings (homoglyphs)
// ============================================
const CONFUSABLE_CHARS: Record<string, string[]> = {
  'I': ['l', '1', '|'],
  'l': ['I', '1', '|'],
  '1': ['I', 'l', '|'],
  'O': ['0', 'Q'],
  '0': ['O', 'Q'],
  'rn': ['m'],
  'vv': ['w'],
  'cl': ['d'],
};

function checkVisualSimilarity(domain1: string, domain2: string): number {
  if (domain1.toLowerCase() === domain2.toLowerCase()) {
    for (let i = 0; i < Math.min(domain1.length, domain2.length); i++) {
      const char1 = domain1[i];
      const char2 = domain2[i];
      if (char1 !== char2) {
        const confusables = CONFUSABLE_CHARS[char1] || [];
        if (confusables.includes(char2)) {
          return 60;
        }
      }
    }
  }

  let substitutions = 0;
  if (Math.abs(domain1.length - domain2.length) <= 1) {
    for (let i = 0; i < Math.min(domain1.length, domain2.length); i++) {
      const char1 = domain1[i];
      const char2 = domain2[i];
      if (char1 !== char2) {
        const confusables = CONFUSABLE_CHARS[char1] || [];
        if (confusables.includes(char2)) {
          substitutions++;
        }
      }
    }
  }

  return substitutions > 0 ? substitutions * 20 : 0;
}

// ============================================
// NEW: Subdomain phishing detection
// e.g., binance.com.evil-site.com
// ============================================
function extractBrandName(domain: string): string {
  return domain.split('.')[0].toLowerCase();
}

function detectSubdomainPhishing(
  inputDomain: string,
  legitimateSites: string[]
): { detected: boolean; matchedBrand: string; officialUrl: string } | null {
  const parts = inputDomain.toLowerCase().split('.');

  for (const site of legitimateSites) {
    const brand = extractBrandName(site);

    // Pattern: binance.com.evil.com (brand appears before actual domain)
    if (parts.length >= 3) {
      const subdomainPart = parts.slice(0, -2).join('.');
      if (subdomainPart.includes(brand) && inputDomain !== site) {
        return {
          detected: true,
          matchedBrand: brand,
          officialUrl: site
        };
      }
    }
  }

  return null;
}

// ============================================
// NEW: Hyphen pattern detection
// e.g., secure-binance.com, binance-login.com
// ============================================
const SUSPICIOUS_KEYWORDS = [
  'login', 'signin', 'secure', 'verify', 'account',
  'wallet', 'support', 'help', 'update', 'confirm',
  'authentication', 'recovery', 'unlock', 'validate',
  'airdrop', 'claim', 'reward', 'bonus', 'free'
];

function detectHyphenPhishing(
  inputDomain: string,
  legitimateSites: string[]
): { detected: boolean; matchedBrand: string; officialUrl: string; keyword?: string } | null {
  const domainName = inputDomain.split('.')[0].toLowerCase();

  if (!domainName.includes('-')) return null;

  const hyphenParts = domainName.split('-');

  for (const site of legitimateSites) {
    const brand = extractBrandName(site);

    for (const part of hyphenParts) {
      // Exact match or 1 char difference
      if (part === brand || (part.length > 3 && levenshteinDistance(part, brand) <= 1)) {
        // Check if contains suspicious keyword
        const foundKeyword = SUSPICIOUS_KEYWORDS.find(kw =>
          hyphenParts.some(p => p === kw || p.includes(kw))
        );

        return {
          detected: true,
          matchedBrand: brand,
          officialUrl: site,
          keyword: foundKeyword
        };
      }
    }
  }

  return null;
}

// ============================================
// NEW: Brand + Keyword combination detection
// e.g., binancelogin.com, loginbinance.com
// ============================================
function detectBrandKeywordCombo(
  inputDomain: string,
  legitimateSites: string[]
): { detected: boolean; matchedBrand: string; officialUrl: string; keyword: string } | null {
  const domainName = inputDomain.split('.')[0].toLowerCase();

  for (const site of legitimateSites) {
    const brand = extractBrandName(site);

    if (brand.length < 4) continue; // Skip short brands

    for (const keyword of SUSPICIOUS_KEYWORDS) {
      const patterns = [
        `${brand}${keyword}`,
        `${keyword}${brand}`,
      ];

      for (const pattern of patterns) {
        if (domainName === pattern ||
            (domainName.length > 5 && levenshteinDistance(domainName, pattern) <= 2)) {
          return {
            detected: true,
            matchedBrand: brand,
            officialUrl: site,
            keyword
          };
        }
      }
    }
  }

  return null;
}

// ============================================
// Main analysis function (now async)
// ============================================
export async function analyzePhishingPatterns(domain: string): Promise<{
  isPhishing: boolean;
  confidence: number;
  reason: string;
  riskLevel: 'low' | 'medium' | 'high';
  matchedBrand?: string;
  officialUrl?: string;
  details: {
    similarSites: Array<{ site: string; similarity: number; distance: number }>;
    maxSimilarity: number;
    visualSimilarityAttacks: Array<{ site: string; penalty: number }>;
    suspiciousMatches: string[];
    typosquattingPenalty: number;
    subdomainPhishing?: boolean;
    hyphenPhishing?: boolean;
    brandKeywordCombo?: boolean;
  };
}> {
  // Get sites from DB
  const legitimateSites = await getLegitimaSites();

  // ============================================
  // NEW: Check subdomain phishing first
  // ============================================
  const subdomainResult = detectSubdomainPhishing(domain, legitimateSites);
  if (subdomainResult) {
    return {
      isPhishing: true,
      confidence: 10,
      reason: `Subdomain hijacking detected - impersonating ${subdomainResult.matchedBrand}`,
      riskLevel: 'high',
      matchedBrand: subdomainResult.matchedBrand,
      officialUrl: subdomainResult.officialUrl,
      details: {
        similarSites: [],
        maxSimilarity: 0,
        visualSimilarityAttacks: [],
        suspiciousMatches: [],
        typosquattingPenalty: -70,
        subdomainPhishing: true
      }
    };
  }

  // ============================================
  // NEW: Check hyphen phishing
  // ============================================
  const hyphenResult = detectHyphenPhishing(domain, legitimateSites);
  if (hyphenResult) {
    const penalty = hyphenResult.keyword ? -65 : -55;
    return {
      isPhishing: true,
      confidence: 15,
      reason: hyphenResult.keyword
        ? `Suspicious pattern: ${hyphenResult.matchedBrand} + "${hyphenResult.keyword}"`
        : `Hyphen brand pattern detected - impersonating ${hyphenResult.matchedBrand}`,
      riskLevel: 'high',
      matchedBrand: hyphenResult.matchedBrand,
      officialUrl: hyphenResult.officialUrl,
      details: {
        similarSites: [],
        maxSimilarity: 0,
        visualSimilarityAttacks: [],
        suspiciousMatches: [],
        typosquattingPenalty: penalty,
        hyphenPhishing: true
      }
    };
  }

  // ============================================
  // NEW: Check brand + keyword combo
  // ============================================
  const comboResult = detectBrandKeywordCombo(domain, legitimateSites);
  if (comboResult) {
    return {
      isPhishing: true,
      confidence: 20,
      reason: `Suspicious combo: ${comboResult.matchedBrand} + "${comboResult.keyword}"`,
      riskLevel: 'high',
      matchedBrand: comboResult.matchedBrand,
      officialUrl: comboResult.officialUrl,
      details: {
        similarSites: [],
        maxSimilarity: 0,
        visualSimilarityAttacks: [],
        suspiciousMatches: [],
        typosquattingPenalty: -55,
        brandKeywordCombo: true
      }
    };
  }

  // ============================================
  // Original typosquatting detection
  // ============================================
  const similarities: Array<{ site: string; similarity: number; distance: number }> = [];
  const visualAttacks: Array<{ site: string; penalty: number }> = [];

  let typosquattingPenalty = 0;
  let minDistance = Infinity;
  let suspiciousMatch = '';

  for (const legitimateSite of legitimateSites) {
    const distance = levenshteinDistance(domain.toLowerCase(), legitimateSite.toLowerCase());
    const visualSimilarity = checkVisualSimilarity(domain, legitimateSite);

    // Exact match - legitimate
    if (distance === 0) {
      return {
        isPhishing: false,
        confidence: 100,
        reason: 'Exact match with legitimate site',
        riskLevel: 'low',
        details: {
          similarSites: [],
          maxSimilarity: 100,
          visualSimilarityAttacks: [],
          suspiciousMatches: [],
          typosquattingPenalty: 0
        }
      };
    }

    const maxLength = Math.max(domain.length, legitimateSite.length);
    const similarity = ((maxLength - distance) / maxLength) * 100;

    if (distance < minDistance) {
      minDistance = distance;
      suspiciousMatch = legitimateSite;
    }

    if (visualSimilarity > 0) {
      visualAttacks.push({ site: legitimateSite, penalty: visualSimilarity });
      typosquattingPenalty -= visualSimilarity;
    }

    if (similarity >= 60 && similarity < 100) {
      similarities.push({ site: legitimateSite, similarity: Math.round(similarity), distance });
    }
  }

  // Distance-based penalties
  if (minDistance === 1) {
    typosquattingPenalty -= 50;
  } else if (minDistance === 2) {
    typosquattingPenalty -= 30;
  } else if (minDistance === 3) {
    typosquattingPenalty -= 10;
  }

  let confidence = 100 + typosquattingPenalty;
  confidence = Math.max(0, Math.min(100, confidence));

  let isPhishing = false;
  let reason = 'No suspicious patterns detected';
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  let matchedBrand: string | undefined;
  let officialUrl: string | undefined;

  if (visualAttacks.length > 0) {
    isPhishing = true;
    reason = `Visual similarity attack detected (${visualAttacks[0].site})`;
    riskLevel = 'high';
    matchedBrand = extractBrandName(visualAttacks[0].site);
    officialUrl = visualAttacks[0].site;
  } else if (minDistance <= 2 && typosquattingPenalty < -25) {
    isPhishing = true;
    reason = `Possible typosquatting of ${suspiciousMatch}`;
    riskLevel = minDistance === 1 ? 'high' : 'medium';
    matchedBrand = extractBrandName(suspiciousMatch);
    officialUrl = suspiciousMatch;
  } else if (similarities.length > 0) {
    const maxSim = Math.max(...similarities.map(s => s.similarity));
    if (maxSim >= 80) {
      isPhishing = true;
      reason = `High similarity to legitimate site (${maxSim}%)`;
      riskLevel = 'medium';
      const topMatch = similarities.find(s => s.similarity === maxSim);
      if (topMatch) {
        matchedBrand = extractBrandName(topMatch.site);
        officialUrl = topMatch.site;
      }
    }
  }

  const maxSimilarity = similarities.length > 0
    ? Math.max(...similarities.map(s => s.similarity))
    : 0;

  return {
    isPhishing,
    confidence,
    reason,
    riskLevel,
    matchedBrand,
    officialUrl,
    details: {
      similarSites: similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 3),
      maxSimilarity,
      visualSimilarityAttacks: visualAttacks,
      suspiciousMatches: similarities.map(s => `${s.similarity}% similar to ${s.site}`),
      typosquattingPenalty
    }
  };
}
