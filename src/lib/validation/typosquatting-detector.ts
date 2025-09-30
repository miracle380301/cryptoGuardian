// Pure Typosquatting Detection (Domain Similarity)

// Levenshtein distance calculation
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
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// Legitimate sites list (crypto + general)
const LEGITIMATE_SITES = [
  // Crypto exchanges
  'binance.com',
  'coinbase.com',
  'kraken.com',
  'bitfinex.com',
  'huobi.com',
  'okx.com',
  'bybit.com',
  'kucoin.com',
  'gate.io',
  'upbit.com',
  'bithumb.com',
  'coinone.co.kr',
  'korbit.co.kr',
  'crypto.com',
  'gemini.com',
  'bitstamp.net',
  // General sites often targeted
  'paypal.com',
  'amazon.com',
  'apple.com',
  'microsoft.com',
  'google.com',
  'facebook.com',
  'metamask.io',
  'uniswap.org'
];

// Visual similarity mappings for typosquatting detection
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

// Check for visual similarity attacks (homograph attacks)
function checkVisualSimilarity(domain1: string, domain2: string): number {
  if (domain1.toLowerCase() === domain2.toLowerCase()) {
    for (let i = 0; i < Math.min(domain1.length, domain2.length); i++) {
      const char1 = domain1[i];
      const char2 = domain2[i];
      if (char1 !== char2) {
        const confusables = CONFUSABLE_CHARS[char1] || [];
        if (confusables.includes(char2)) {
          return 60; // High penalty for visual similarity attack
        }
      }
    }
  }

  // Check for character substitution attacks
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

export function analyzePhishingPatterns(domain: string): {
  isPhishing: boolean;
  confidence: number;
  reason: string;
  riskLevel: 'low' | 'medium' | 'high';
  details: {
    similarSites: Array<{ site: string; similarity: number; distance: number }>;
    maxSimilarity: number;
    visualSimilarityAttacks: Array<{ site: string; penalty: number }>;
    suspiciousMatches: string[];
    typosquattingPenalty: number;
  };
} {
  const similarities: Array<{ site: string; similarity: number; distance: number }> = [];
  const visualAttacks: Array<{ site: string; penalty: number }> = [];

  let typosquattingPenalty = 0;
  let minDistance = Infinity;
  let suspiciousMatch = '';

  // Check against all legitimate sites (crypto + general)
  for (const legitimateSite of LEGITIMATE_SITES) {
    const caseSensitiveDistance = levenshteinDistance(domain, legitimateSite);
    const caseInsensitiveDistance = levenshteinDistance(domain, legitimateSite);
    const visualSimilarity = checkVisualSimilarity(domain, legitimateSite);

    // Exact match - legitimate
    if (caseSensitiveDistance === 0 || caseInsensitiveDistance === 0) {
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

    const distance = Math.min(caseSensitiveDistance, caseInsensitiveDistance);
    const maxLength = Math.max(domain.length, legitimateSite.length);
    const similarity = ((maxLength - distance) / maxLength) * 100;

    // Track minimum distance for typosquatting penalties
    if (distance < minDistance) {
      minDistance = distance;
      suspiciousMatch = legitimateSite;
    }

    // Visual similarity attacks (highest priority)
    if (visualSimilarity > 0) {
      visualAttacks.push({
        site: legitimateSite,
        penalty: visualSimilarity
      });
      typosquattingPenalty -= visualSimilarity;
    }

    // High similarity detection (60%+ but not 100%)
    if (similarity >= 60 && similarity < 100) {
      similarities.push({
        site: legitimateSite,
        similarity: Math.round(similarity),
        distance
      });
    }
  }

  // Apply distance-based penalties
  if (minDistance === 1) {
    typosquattingPenalty -= 50; // One character difference
  } else if (minDistance === 2) {
    typosquattingPenalty -= 30; // Two characters difference
  } else if (minDistance === 3) {
    typosquattingPenalty -= 10; // Three characters difference
  }

  // Calculate final confidence score
  let confidence = 100 + typosquattingPenalty; // Start at 100, subtract penalties
  confidence = Math.max(0, Math.min(100, confidence));

  // Determine if phishing and risk level
  let isPhishing = false;
  let reason = 'No suspicious patterns detected';
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  if (visualAttacks.length > 0) {
    isPhishing = true;
    reason = `Visual similarity attack detected (${visualAttacks[0].site})`;
    riskLevel = 'high';
  } else if (minDistance <= 2 && typosquattingPenalty < -25) {
    isPhishing = true;
    reason = `Possible typosquatting of ${suspiciousMatch}`;
    riskLevel = minDistance === 1 ? 'high' : 'medium';
  } else if (similarities.length > 0) {
    const maxSimilarity = Math.max(...similarities.map(s => s.similarity));
    if (maxSimilarity >= 80) {
      isPhishing = true;
      reason = `High similarity to legitimate site (${maxSimilarity}%)`;
      riskLevel = 'medium';
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
    details: {
      similarSites: similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 3),
      maxSimilarity,
      visualSimilarityAttacks: visualAttacks,
      suspiciousMatches: similarities.map(s => `${s.similarity}% similar to ${s.site}`),
      typosquattingPenalty
    }
  };
}