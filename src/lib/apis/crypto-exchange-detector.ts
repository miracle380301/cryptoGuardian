import { ApiResponse } from '@/types/api.types';

// 가상화폐 거래소 위장 탐지 결과 타입
interface CryptoExchangeDetectionResult {
  isImpersonation: boolean;
  riskLevel: 'safe' | 'suspicious' | 'dangerous';
  targetExchange?: string; // 어떤 거래소를 사칭하는지
  patterns: string[];
  confidence: number;
  details: string[];
  legitimateUrl?: string; // 진짜 거래소 URL
  recommendations: string[];
}

// 가상화폐 거래소 위장 탐지 전문 클래스
export class CryptoExchangeDetector {
  private cache: Map<string, { data: CryptoExchangeDetectionResult; expires: number }>;
  private readonly CACHE_TTL = 1800000; // 30분 캐시

  // 전 세계 주요 거래소 정보
  private readonly LEGITIMATE_EXCHANGES = {
    // 한국 거래소
    'upbit.com': { name: 'Upbit', country: 'KR', rank: 1 },
    'bithumb.com': { name: 'Bithumb', country: 'KR', rank: 2 },
    'coinone.co.kr': { name: 'Coinone', country: 'KR', rank: 3 },
    'korbit.co.kr': { name: 'Korbit', country: 'KR', rank: 4 },
    'gopax.co.kr': { name: 'GOPAX', country: 'KR', rank: 5 },

    // 글로벌 주요 거래소
    'binance.com': { name: 'Binance', country: 'Global', rank: 1 },
    'coinbase.com': { name: 'Coinbase', country: 'US', rank: 2 },
    'kraken.com': { name: 'Kraken', country: 'US', rank: 3 },
    'bitfinex.com': { name: 'Bitfinex', country: 'Global', rank: 4 },
    'huobi.com': { name: 'Huobi', country: 'Global', rank: 5 },
    'okx.com': { name: 'OKX', country: 'Global', rank: 6 },
    'crypto.com': { name: 'Crypto.com', country: 'Global', rank: 7 },
    'kucoin.com': { name: 'KuCoin', country: 'Global', rank: 8 },
    'gate.io': { name: 'Gate.io', country: 'Global', rank: 9 },
    'bybit.com': { name: 'Bybit', country: 'Global', rank: 10 },

    // 미국 거래소
    'coinbase.pro': { name: 'Coinbase Pro', country: 'US', rank: 2 },
    'gemini.com': { name: 'Gemini', country: 'US', rank: 11 },
    'bittrex.com': { name: 'Bittrex', country: 'US', rank: 12 },

    // 일본 거래소
    'bitflyer.com': { name: 'bitFlyer', country: 'JP', rank: 13 },
    'coincheck.com': { name: 'Coincheck', country: 'JP', rank: 14 },

    // 유럽 거래소
    'bitstamp.net': { name: 'Bitstamp', country: 'EU', rank: 15 },
    'cex.io': { name: 'CEX.IO', country: 'EU', rank: 16 }
  };

  constructor() {
    this.cache = new Map();
  }

  // 가상화폐 거래소 위장 탐지 메인 메서드
  async detectExchangeImpersonation(domain: string, url?: string): Promise<ApiResponse<CryptoExchangeDetectionResult>> {
    try {
      const cleanDomain = this.cleanDomain(domain);

      // 캐시 확인
      const cached = this.getFromCache(cleanDomain);
      if (cached) {
        return {
          success: true,
          data: cached,
          timestamp: new Date().toISOString()
        };
      }

      console.log(`🏦 가상화폐 거래소 위장 탐지 분석 중: ${cleanDomain}`);

      const detectionResult = this.analyzeExchangeImpersonation(cleanDomain, url);

      // 캐시에 저장
      this.setCache(cleanDomain, detectionResult);

      // 결과 로깅
      this.logExchangeAnalysis(cleanDomain, detectionResult);

      return {
        success: true,
        data: detectionResult,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('거래소 위장 탐지 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // 거래소 위장 패턴 분석
  private analyzeExchangeImpersonation(domain: string, url?: string): CryptoExchangeDetectionResult {
    const detectedPatterns: string[] = [];
    const details: string[] = [];
    let riskScore = 0;
    let targetExchange: string | undefined;
    let legitimateUrl: string | undefined;

    // 1. 정확한 거래소 도메인인지 확인
    if (this.LEGITIMATE_EXCHANGES[domain as keyof typeof this.LEGITIMATE_EXCHANGES]) {
      return {
        isImpersonation: false,
        riskLevel: 'safe',
        patterns: ['legitimate-exchange'],
        confidence: 100,
        details: [`정식 거래소 도메인: ${this.LEGITIMATE_EXCHANGES[domain as keyof typeof this.LEGITIMATE_EXCHANGES].name}`],
        recommendations: ['안전한 정식 거래소 사이트입니다']
      };
    }

    // 2. 유명 거래소 사칭 패턴 분석
    const impersonationRisk = this.analyzeImpersonationPatterns(domain);
    riskScore += impersonationRisk.score;
    detectedPatterns.push(...impersonationRisk.patterns);
    details.push(...impersonationRisk.details);
    if (impersonationRisk.targetExchange) {
      targetExchange = impersonationRisk.targetExchange;
      legitimateUrl = impersonationRisk.legitimateUrl;
    }

    // 3. 거래소 관련 키워드 분석
    const keywordRisk = this.analyzeExchangeKeywords(domain, url);
    riskScore += keywordRisk.score;
    detectedPatterns.push(...keywordRisk.patterns);
    details.push(...keywordRisk.details);

    // 4. 도메인 구조 분석
    const structureRisk = this.analyzeExchangeStructure(domain);
    riskScore += structureRisk.score;
    detectedPatterns.push(...structureRisk.patterns);
    details.push(...structureRisk.details);

    // 5. 지리적/언어적 패턴 분석
    const geoRisk = this.analyzeGeographicPatterns(domain);
    riskScore += geoRisk.score;
    detectedPatterns.push(...geoRisk.patterns);
    details.push(...geoRisk.details);

    // 위험도 결정
    let riskLevel: 'safe' | 'suspicious' | 'dangerous';
    let isImpersonation = false;

    if (riskScore >= 70) {
      riskLevel = 'dangerous';
      isImpersonation = true;
    } else if (riskScore >= 40) {
      riskLevel = 'suspicious';
      isImpersonation = true;
    } else {
      riskLevel = 'safe';
    }

    const confidence = Math.min(100, Math.max(0, riskScore));

    return {
      isImpersonation,
      riskLevel,
      targetExchange,
      legitimateUrl,
      patterns: [...new Set(detectedPatterns)],
      confidence,
      details: [...new Set(details)],
      recommendations: this.generateExchangeRecommendations(riskLevel, detectedPatterns, targetExchange, legitimateUrl)
    };
  }

  // 거래소 사칭 패턴 분석
  private analyzeImpersonationPatterns(domain: string): {
    score: number;
    patterns: string[];
    details: string[];
    targetExchange?: string;
    legitimateUrl?: string;
  } {
    const patterns: string[] = [];
    const details: string[] = [];
    let score = 0;
    let targetExchange: string | undefined;
    let legitimateUrl: string | undefined;

    // 각 주요 거래소에 대한 사칭 패턴 검사
    Object.entries(this.LEGITIMATE_EXCHANGES).forEach(([legitDomain, info]) => {
      const exchangeName = info.name.toLowerCase();
      const mainDomain = legitDomain.split('.')[0];

      // 다양한 사칭 패턴들
      const impersonationPatterns = [
        // 직접 사칭 (하이픈, 숫자 등 추가)
        new RegExp(`${mainDomain}-[a-z0-9]+`, 'i'),
        new RegExp(`${mainDomain}[0-9]+`, 'i'),
        new RegExp(`[a-z0-9]+-${mainDomain}`, 'i'),

        // 유사 철자
        new RegExp(this.generateTypoVariants(mainDomain), 'i'),

        // 서브도메인 사칭
        new RegExp(`${mainDomain}\\.[a-z]+\\.[a-z]+`, 'i'),

        // TLD 변경
        new RegExp(`${mainDomain}\\.(org|net|info|biz|me|co)$`, 'i')
      ];

      impersonationPatterns.forEach(pattern => {
        if (pattern.test(domain) && domain !== legitDomain) {
          const patternScore = info.rank <= 5 ? 80 : 60; // 상위 거래소일수록 높은 점수
          score += patternScore;
          patterns.push(`${exchangeName}-impersonation`);
          details.push(`${info.name} 거래소 사칭 패턴 감지`);

          if (!targetExchange) {
            targetExchange = info.name;
            legitimateUrl = `https://${legitDomain}`;
          }
        }
      });
    });

    return { score, patterns, details, targetExchange, legitimateUrl };
  }

  // 타이포 변형 생성
  private generateTypoVariants(domain: string): string {
    // 자주 발생하는 타이포 패턴들
    const typoPatterns = [
      domain.replace('i', '1'),
      domain.replace('o', '0'),
      domain.replace('a', '@'),
      domain.replace('e', '3'),
      domain + '1',
      domain + 's',
      domain.replace(/(.)(.)/, '$2$1'), // 인접 문자 바꾸기
    ];

    return typoPatterns.join('|');
  }

  // 거래소 관련 키워드 분석
  private analyzeExchangeKeywords(domain: string, url?: string): { score: number; patterns: string[]; details: string[] } {
    const patterns: string[] = [];
    const details: string[] = [];
    let score = 0;

    const fullText = `${domain} ${url || ''}`.toLowerCase();

    // 거래소 관련 키워드들
    const exchangeKeywords = [
      // 직접적인 거래소 키워드
      { words: ['exchange', 'trade', 'trading'], score: 30, name: 'exchange-keywords' },
      { words: ['crypto', 'bitcoin', 'btc', 'ethereum'], score: 25, name: 'crypto-keywords' },
      { words: ['wallet', 'coin', 'token'], score: 20, name: 'crypto-wallet-keywords' },

      // 의심스러운 프로모션 키워드
      { words: ['bonus', 'airdrop', 'free', 'gift'], score: 40, name: 'promotional-keywords' },
      { words: ['limited', 'special', 'exclusive'], score: 35, name: 'urgency-keywords' },

      // 가짜 인증/보안 키워드
      { words: ['secure', 'verified', 'official', 'certified'], score: 30, name: 'fake-security-keywords' },
      { words: ['kyc', 'aml', 'licensed'], score: 25, name: 'compliance-keywords' }
    ];

    exchangeKeywords.forEach(({ words, score: keywordScore, name }) => {
      const matchedWords = words.filter(word => fullText.includes(word));
      if (matchedWords.length > 0) {
        score += keywordScore;
        patterns.push(name);
        details.push(`거래소 관련 키워드 감지: ${matchedWords.join(', ')}`);
      }
    });

    return { score, patterns, details };
  }

  // 거래소 도메인 구조 분석
  private analyzeExchangeStructure(domain: string): { score: number; patterns: string[]; details: string[] } {
    const patterns: string[] = [];
    const details: string[] = [];
    let score = 0;

    // 의심스러운 TLD
    const suspiciousTlds = [
      { tlds: ['.tk', '.ml', '.ga', '.cf'], score: 50, name: 'free-suspicious-tld' },
      { tlds: ['.click', '.download', '.loan', '.win'], score: 40, name: 'marketing-tld' },
      { tlds: ['.pw', '.top', '.bid'], score: 35, name: 'cheap-tld' }
    ];

    suspiciousTlds.forEach(({ tlds, score: tldScore, name }) => {
      if (tlds.some(tld => domain.endsWith(tld))) {
        score += tldScore;
        patterns.push(name);
        details.push(`의심스러운 TLD 사용: ${tlds.find(tld => domain.endsWith(tld))}`);
      }
    });

    // 도메인 길이 분석
    const domainParts = domain.split('.');
    const mainDomain = domainParts[0];

    if (mainDomain.length < 3) {
      score += 30;
      patterns.push('very-short-domain');
      details.push('매우 짧은 도메인명 (의심스러움)');
    } else if (mainDomain.length > 25) {
      score += 25;
      patterns.push('very-long-domain');
      details.push('매우 긴 도메인명 (키워드 스터핑 의심)');
    }

    // 숫자와 하이픈 패턴
    const numberCount = (mainDomain.match(/\d/g) || []).length;
    const hyphenCount = (mainDomain.match(/-/g) || []).length;

    if (numberCount >= 3) {
      score += 20;
      patterns.push('many-numbers');
      details.push('도메인에 숫자가 많음 (자동 생성 의심)');
    }

    if (hyphenCount >= 2) {
      score += 15;
      patterns.push('many-hyphens');
      details.push('도메인에 하이픈이 많음');
    }

    return { score, patterns, details };
  }

  // 지리적/언어적 패턴 분석
  private analyzeGeographicPatterns(domain: string): { score: number; patterns: string[]; details: string[] } {
    const patterns: string[] = [];
    const details: string[] = [];
    let score = 0;

    // 국가별 패턴 분석
    const geoPatterns = [
      // 한국 관련 의심 패턴
      { patterns: ['korea', 'kr', 'seoul'], isKoreanTLD: domain.endsWith('.kr'), score: 20, name: 'korea-targeting' },

      // 중국 관련 (많은 사기 사이트가 중국 기반)
      { patterns: ['china', 'cn', 'beijing'], isChinese: true, score: 25, name: 'china-origin' },

      // 동남아시아 (사기 사이트 많은 지역)
      { patterns: ['asia', 'singapore', 'malaysia'], isAsian: true, score: 15, name: 'sea-region' }
    ];

    geoPatterns.forEach(({ patterns: geoPatternsList, score: geoScore, name }) => {
      if (geoPatternsList.some(pattern => domain.includes(pattern))) {
        score += geoScore;
        patterns.push(name);
        details.push(`지리적 타겟팅 패턴: ${name}`);
      }
    });

    // 언어 혼용 패턴 (영어+한글, 영어+중국어 등)
    if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(domain)) {
      score += 30;
      patterns.push('mixed-language');
      details.push('도메인에 한글 포함 (피싱 의심)');
    }

    return { score, patterns, details };
  }

  // 추천사항 생성
  private generateExchangeRecommendations(
    riskLevel: 'safe' | 'suspicious' | 'dangerous',
    patterns: string[],
    targetExchange?: string,
    legitimateUrl?: string
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'dangerous') {
      recommendations.push('즉시 사이트 이용 중단 - 거래소 사칭 사이트일 가능성이 매우 높습니다');
      recommendations.push('로그인, 개인정보, 결제정보를 절대 입력하지 마세요');
      if (targetExchange && legitimateUrl) {
        recommendations.push(`정식 ${targetExchange} 사이트 이용: ${legitimateUrl}`);
      }
    } else if (riskLevel === 'suspicious') {
      recommendations.push('주의깊게 확인하세요 - 거래소 사칭 패턴이 감지되었습니다');
      recommendations.push('공식 거래소 웹사이트에서 직접 접속하세요');
      recommendations.push('공식 앱을 통해 거래하는 것이 더 안전합니다');
    }

    // 패턴별 구체적 추천사항
    if (patterns.some(p => p.includes('impersonation'))) {
      recommendations.push('유명 거래소 사칭이 의심됩니다 - 공식 도메인을 다시 확인하세요');
    }

    if (patterns.includes('promotional-keywords')) {
      recommendations.push('"보너스", "에어드랍" 등의 유혹적 제안은 사기의 전형적 수법입니다');
    }

    if (patterns.includes('free-suspicious-tld')) {
      recommendations.push('의심스러운 최상위 도메인(.tk, .ml 등)을 사용합니다');
    }

    if (patterns.includes('urgency-keywords')) {
      recommendations.push('"한정", "특별" 등 긴급성을 조장하는 표현은 의심하세요');
    }

    // 일반적 보안 추천사항
    recommendations.push('2FA(이중인증)가 활성화된 정식 거래소만 이용하세요');
    recommendations.push('의심스러운 이메일이나 메시지의 링크는 클릭하지 마세요');

    return recommendations;
  }

  // 유틸리티 메서드들
  private cleanDomain(input: string): string {
    let domain = input.replace(/^https?:\/\//, '');
    domain = domain.replace(/^www\./, '');
    domain = domain.split('/')[0];
    domain = domain.split(':')[0];
    return domain.toLowerCase();
  }

  private getFromCache(domain: string): CryptoExchangeDetectionResult | null {
    const cached = this.cache.get(domain);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    this.cache.delete(domain);
    return null;
  }

  private setCache(domain: string, data: CryptoExchangeDetectionResult): void {
    this.cache.set(domain, {
      data,
      expires: Date.now() + this.CACHE_TTL
    });
  }

  // 분석 결과 로깅
  private logExchangeAnalysis(domain: string, result: CryptoExchangeDetectionResult): void {
    console.log('\n=== 가상화폐 거래소 위장 탐지 결과 ===');
    console.log(`도메인: ${domain}`);
    console.log(`사칭 여부: ${result.isImpersonation ? 'YES' : 'NO'}`);
    if (result.targetExchange) {
      console.log(`사칭 대상: ${result.targetExchange}`);
      console.log(`정식 URL: ${result.legitimateUrl}`);
    }
    console.log(`위험도: ${result.riskLevel}`);
    console.log(`신뢰도: ${result.confidence}%`);

    if (result.patterns.length > 0) {
      console.log(`감지된 패턴: ${result.patterns.join(', ')}`);
    }

    if (result.details.length > 0) {
      console.log('\n 상세 분석:');
      result.details.forEach((detail, index) => {
        console.log(`   ${index + 1}. ${detail}`);
      });
    }

    if (result.recommendations.length > 0) {
      console.log('\n 추천사항:');
      result.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    console.log('\n' + '='.repeat(50) + '\n');
  }
}