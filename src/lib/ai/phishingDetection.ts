// AI 기반 피싱 도메인 탐지 시스템

// 레벤슈타인 거리 계산 (문자열 유사도)
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

// 유명 암호화폐 사이트 목록
const LEGITIMATE_CRYPTO_SITES = [
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
  'bitstamp.net'
];

// 1. 피싱 URL 패턴 분석 AI
export function analyzePhishingPatterns(domain: string): {
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  details: {
    similarSites: Array<{ site: string; similarity: number; distance: number }>;
    maxSimilarity: number;
    suspiciousMatches: string[];
  };
} {
  const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
  const similarities: Array<{ site: string; similarity: number; distance: number }> = [];

  // 각 정당한 사이트와 유사도 계산
  for (const legitimateSite of LEGITIMATE_CRYPTO_SITES) {
    const distance = levenshteinDistance(cleanDomain, legitimateSite);
    const maxLength = Math.max(cleanDomain.length, legitimateSite.length);
    const similarity = ((maxLength - distance) / maxLength) * 100;

    // 유사도가 60% 이상이면서 정확히 일치하지 않는 경우만 의심스러운 것으로 간주
    if (similarity >= 60 && similarity < 100) {
      similarities.push({
        site: legitimateSite,
        similarity: Math.round(similarity),
        distance
      });
    }
  }

  // 가장 높은 유사도 찾기
  const maxSimilarity = similarities.length > 0
    ? Math.max(...similarities.map(s => s.similarity))
    : 0;

  // 위험도 계산 (유사도가 높을수록 위험)
  let score = 100;
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  const suspiciousMatches: string[] = [];

  if (maxSimilarity >= 85) {
    score = 10; // 매우 위험
    riskLevel = 'high';
    suspiciousMatches.push(`Very similar to legitimate site (${maxSimilarity}% match)`);
  } else if (maxSimilarity >= 70) {
    score = 30; // 위험
    riskLevel = 'high';
    suspiciousMatches.push(`Similar to legitimate site (${maxSimilarity}% match)`);
  } else if (maxSimilarity >= 60) {
    score = 60; // 주의
    riskLevel = 'medium';
    suspiciousMatches.push(`Partially similar to legitimate site (${maxSimilarity}% match)`);
  }

  return {
    score,
    riskLevel,
    details: {
      similarSites: similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 3),
      maxSimilarity,
      suspiciousMatches
    }
  };
}

// 2. 의심스러운 도메인명 AI 탐지
export function analyzeSuspiciousDomain(domain: string): {
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  details: {
    suspiciousPatterns: string[];
    riskFactors: Array<{ factor: string; weight: number; detected: boolean }>;
  };
} {
  const cleanDomain = domain.toLowerCase().replace(/^www\./, '').replace(/\.[^.]+$/, ''); // TLD 제거
  const suspiciousPatterns: string[] = [];
  const riskFactors = [
    { factor: 'Excessive numbers', weight: 20, detected: false },
    { factor: 'Multiple hyphens', weight: 15, detected: false },
    { factor: 'Very long domain', weight: 10, detected: false },
    { factor: 'Suspicious keywords', weight: 25, detected: false },
    { factor: 'Random characters', weight: 20, detected: false },
    { factor: 'Doubled letters', weight: 10, detected: false }
  ];

  let totalRisk = 0;

  // 1. 숫자가 많은 도메인 (30% 이상이 숫자)
  const numberCount = (cleanDomain.match(/\d/g) || []).length;
  const numberRatio = numberCount / cleanDomain.length;
  if (numberRatio > 0.3) {
    riskFactors[0].detected = true;
    totalRisk += riskFactors[0].weight;
    suspiciousPatterns.push(`High number ratio: ${Math.round(numberRatio * 100)}%`);
  }

  // 2. 하이픈이 많은 도메인 (3개 이상)
  const hyphenCount = (cleanDomain.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    riskFactors[1].detected = true;
    totalRisk += riskFactors[1].weight;
    suspiciousPatterns.push(`Multiple hyphens: ${hyphenCount}`);
  }

  // 3. 매우 긴 도메인명 (20자 이상)
  if (cleanDomain.length > 20) {
    riskFactors[2].detected = true;
    totalRisk += riskFactors[2].weight;
    suspiciousPatterns.push(`Very long domain: ${cleanDomain.length} characters`);
  }

  // 4. 의심스러운 키워드
  const suspiciousKeywords = [
    'free', 'bonus', 'gift', 'win', 'prize', 'guaranteed', 'profit',
    'secure', 'official', 'verified', 'authentic', 'real', 'genuine',
    'crypto', 'bitcoin', 'coin', 'exchange', 'trade', 'invest'
  ];

  const foundKeywords = suspiciousKeywords.filter(keyword =>
    cleanDomain.includes(keyword)
  );

  if (foundKeywords.length >= 2) {
    riskFactors[3].detected = true;
    totalRisk += riskFactors[3].weight;
    suspiciousPatterns.push(`Suspicious keywords: ${foundKeywords.join(', ')}`);
  }

  // 5. 무작위 문자 패턴 (자음/모음 비율 확인)
  const consonants = (cleanDomain.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
  const vowels = (cleanDomain.match(/[aeiou]/g) || []).length;
  const total = consonants + vowels;

  if (total > 0) {
    const consonantRatio = consonants / total;
    if (consonantRatio > 0.8 || consonantRatio < 0.2) {
      riskFactors[4].detected = true;
      totalRisk += riskFactors[4].weight;
      suspiciousPatterns.push(`Unusual letter pattern detected`);
    }
  }

  // 6. 연속된 같은 문자 (3개 이상)
  const repeatedPattern = /(.)\1{2,}/g;
  if (repeatedPattern.test(cleanDomain)) {
    riskFactors[5].detected = true;
    totalRisk += riskFactors[5].weight;
    suspiciousPatterns.push(`Repeated characters detected`);
  }

  // 점수 계산 (위험도가 높을수록 점수 낮음)
  const score = Math.max(0, 100 - totalRisk);

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (totalRisk >= 50) {
    riskLevel = 'high';
  } else if (totalRisk >= 25) {
    riskLevel = 'medium';
  }

  return {
    score,
    riskLevel,
    details: {
      suspiciousPatterns,
      riskFactors
    }
  };
}