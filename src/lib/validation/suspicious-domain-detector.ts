// Suspicious Domain Pattern Analysis

export function analyzeSuspiciousDomain(domain: string): {
  isSuspicious: boolean;
  trustScore: number;
  reasons: string[];
  riskLevel: 'low' | 'medium' | 'high';
  details: {
    suspiciousPatterns: string[];
    riskFactors: Array<{ factor: string; weight: number; detected: boolean }>;
  };
} {
  const domainWithoutTld = domain.replace(/\.[^.]+$/, ''); // TLD 제거
  const suspiciousPatterns: string[] = [];
  const reasons: string[] = [];

  const riskFactors = [
    { factor: 'Excessive numbers', weight: 20, detected: false },
    { factor: 'Multiple hyphens', weight: 15, detected: false },
    { factor: 'Very long domain', weight: 10, detected: false },
    { factor: 'Suspicious keywords', weight: 25, detected: false },
    { factor: 'Random characters', weight: 20, detected: false },
    { factor: 'Suspicious TLD', weight: 30, detected: false },
    { factor: 'Phishing patterns', weight: 25, detected: false }
  ];

  let totalRisk = 0;

  // 1. 숫자가 많은 도메인 (30% 이상이 숫자)
  const numberCount = (domainWithoutTld.match(/\d/g) || []).length;
  const numberRatio = numberCount / domainWithoutTld.length;
  if (numberRatio > 0.3) {
    riskFactors[0].detected = true;
    totalRisk += riskFactors[0].weight;
    suspiciousPatterns.push(`High number ratio: ${Math.round(numberRatio * 100)}%`);
    reasons.push('High number ratio');
  }

  // 2. 하이픈이 많은 도메인 (3개 이상)
  const hyphenCount = (domainWithoutTld.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    riskFactors[1].detected = true;
    totalRisk += riskFactors[1].weight;
    suspiciousPatterns.push(`Multiple hyphens: ${hyphenCount}`);
    reasons.push('Multiple hyphens');
  }

  // 3. 매우 긴 도메인명 (20자 이상)
  if (domainWithoutTld.length > 20) {
    riskFactors[2].detected = true;
    totalRisk += riskFactors[2].weight;
    suspiciousPatterns.push(`Very long domain: ${domainWithoutTld.length} characters`);
    reasons.push('Very long domain');
  }

  // 4. 의심스러운 키워드 (Safe Browsing에서 이동 + 기존)
  const suspiciousKeywords = [
    'phishing', 'fake', 'scam', 'hack', 'steal',
    'verify', 'urgent', 'suspend', 'confirm',
    'secure-', '-support', '-help', 'customer-',
    'wallet-', 'exchange-', 'crypto-', 'bitcoin-',
    'free', 'bonus', 'gift', 'win', 'prize', 'guaranteed', 'profit',
    'official', 'verified', 'authentic', 'real', 'genuine'
  ];

  const foundKeywords = suspiciousKeywords.filter(keyword =>
    domain.includes(keyword)
  );

  if (foundKeywords.length >= 1) {
    riskFactors[3].detected = true;
    totalRisk += riskFactors[3].weight;
    suspiciousPatterns.push(`Suspicious keywords: ${foundKeywords.join(', ')}`);
    reasons.push('Suspicious keywords');
  }

  // 5. 무작위 문자 패턴
  function isRandomLooking(domain: string): boolean {
    const vowels = domain.match(/[aeiou]/gi);
    const consonants = domain.match(/[bcdfghjklmnpqrstvwxyz]/gi);

    if (!vowels || vowels.length === 0) return true;
    if (consonants && vowels && consonants.length / vowels.length > 4) return true;

    const hasNaturalFlow = /[aeiou][bcdfghjklmnpqrstvwxyz][aeiou]|[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]/i.test(domain);
    return !hasNaturalFlow && domain.length > 6;
  }

  if (isRandomLooking(domainWithoutTld)) {
    riskFactors[4].detected = true;
    totalRisk += riskFactors[4].weight;
    suspiciousPatterns.push('Random-looking domain pattern');
    reasons.push('Random pattern');
  }

  // 6. 의심스러운 TLD (Safe Browsing에서 이동)
  const suspiciousTLDs = [
    '.tk', '.ml', '.ga', '.cf', '.gq',  // Free domains
    '.top', '.click', '.download', '.loan', '.work'  // Often abused
  ];

  const domainTld = domain.match(/\.[^.]+$/)?.[0] || '';
  if (suspiciousTLDs.includes(domainTld)) {
    riskFactors[5].detected = true;
    totalRisk += riskFactors[5].weight;
    suspiciousPatterns.push(`Suspicious TLD: ${domainTld}`);
    reasons.push('Suspicious TLD');
  }

  // 7. 피싱 패턴 (Safe Browsing에서 이동)
  const phishingPatterns = [
    /\d{4,}/,  // 4+ consecutive digits
    /[a-z]{2,}-[a-z]{2,}-[a-z]{2,}/,  // Multiple hyphens
    /[0-9]+[a-z]+[0-9]+/,  // Numbers mixed with letters
    /^[a-z]{1,2}[0-9]+[a-z]/,  // Short prefix + numbers + letters
  ];

  const matchedPatterns = phishingPatterns.filter(pattern => pattern.test(domain));
  if (matchedPatterns.length > 0) {
    riskFactors[6].detected = true;
    totalRisk += riskFactors[6].weight;
    suspiciousPatterns.push(`Phishing patterns detected: ${matchedPatterns.length}`);
    reasons.push('Phishing patterns');
  }

  // Calculate final score and risk level
  const trustScore = Math.max(0, 100 - totalRisk);
  const isSuspicious = totalRisk >= 25;

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (totalRisk >= 50) {
    riskLevel = 'high';
  } else if (totalRisk >= 25) {
    riskLevel = 'medium';
  }

  return {
    isSuspicious,
    trustScore,
    reasons,
    riskLevel,
    details: {
      suspiciousPatterns,
      riskFactors
    }
  };
}