import { ApiResponse } from '@/types/api.types';

// 국내 가상화폐 사기 탐지 결과 타입
interface KoreanCryptoScamDetectionResult {
  isKoreanCryptoScam: boolean;
  riskLevel: 'safe' | 'suspicious' | 'dangerous';
  scamType?: string; // 사기 유형
  patterns: string[];
  confidence: number;
  details: string[];
  recommendations: string[];
  relatedScams?: string[]; // 관련 알려진 사기 사례
}

// 국내 가상화폐 사기 탐지 전문 클래스
export class KoreanCryptoScamDetector {
  private cache: Map<string, { data: KoreanCryptoScamDetectionResult; expires: number }>;
  private readonly CACHE_TTL = 1800000; // 30분 캐시

  // 한국 가상화폐 사기 패턴 데이터베이스
  private readonly KOREAN_SCAM_PATTERNS = {
    // 1. 가짜 한국 거래소 패턴
    fakeKoreanExchanges: [
      'upbit-', 'bithumb-', 'coinone-', 'korbit-', 'gopax-',
      '-upbit', '-bithumb', '-coinone', '-korbit', '-gopax',
      'upbit1', 'bithumb1', 'coinone1', 'korbit1',
      'upbits', 'bithumbs', 'coinones', 'korbits'
    ],

    // 2. 한국 은행/카드사 사칭
    fakeBanking: [
      'kb-bank', 'shinhan-bank', 'woori-bank', 'hana-bank',
      'kbstar-', 'shinhancard-', 'wooricard-', 'hanacard-',
      'samsung-pay', 'kakao-pay', 'naver-pay', 'toss-'
    ],

    // 3. 한국 포털/메신저 사칭
    fakePortals: [
      'naver-', 'kakao-', 'daum-', '-naver', '-kakao', '-daum',
      'kakaotalk-', 'line-kr', 'telegram-kr'
    ],

    // 4. 한국 정부기관 사칭
    fakeGovernment: [
      'gov-kr', 'korea-gov', 'kisa-', 'fsc-', 'fss-',
      'bok-', 'moef-', 'mof-kr'
    ],

    // 5. K-pop/한류 관련 사기
    kpopScams: [
      'bts-coin', 'blackpink-', 'kpop-', 'hallyu-',
      'korean-star', 'idol-coin', 'k-star'
    ]
  };

  // 알려진 한국 가상화폐 사기 사례
  private readonly KNOWN_KOREAN_SCAMS = {
    // 실제 사기 사례들 (교육 목적)
    '비트코인 투자 사기': {
      keywords: ['bitcoin-korea', 'btc-invest', 'coin-invest-kr'],
      description: '가짜 비트코인 투자 플랫폼으로 투자금 횡령'
    },
    '가상화폐 마이닝 사기': {
      keywords: ['mining-korea', 'crypto-mining-kr', 'mine-coin'],
      description: '가짜 마이닝 장비 판매 및 클라우드 마이닝 사기'
    },
    '가상화폐 대출 사기': {
      keywords: ['crypto-loan', 'coin-loan-kr', 'defi-loan'],
      description: '가상화폐 담보 대출 명목 사기'
    },
    'ICO/IEO 사기': {
      keywords: ['ico-korea', 'ieo-kr', 'token-sale'],
      description: '가짜 토큰 발행 및 판매 사기'
    },
    '가상화폐 환전 사기': {
      keywords: ['crypto-exchange-kr', 'coin-change', 'krw-exchange'],
      description: '가짜 환전소를 통한 사기'
    }
  };

  constructor() {
    this.cache = new Map();
  }

  // 국내 가상화폐 사기 탐지 메인 메서드
  async detectKoreanCryptoScam(domain: string, url?: string): Promise<ApiResponse<KoreanCryptoScamDetectionResult>> {
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

      console.log(`🇰🇷 국내 가상화폐 사기 패턴 분석 중: ${cleanDomain}`);

      const detectionResult = this.analyzeKoreanCryptoScamPatterns(cleanDomain, url);

      // 캐시에 저장
      this.setCache(cleanDomain, detectionResult);

      // 결과 로깅
      this.logKoreanScamAnalysis(cleanDomain, detectionResult);

      return {
        success: true,
        data: detectionResult,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('국내 가상화폐 사기 탐지 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // 한국 가상화폐 사기 패턴 분석
  private analyzeKoreanCryptoScamPatterns(domain: string, url?: string): KoreanCryptoScamDetectionResult {
    const detectedPatterns: string[] = [];
    const details: string[] = [];
    const relatedScams: string[] = [];
    let riskScore = 0;
    let scamType: string | undefined;

    // 1. 가짜 한국 거래소 패턴 분석
    const exchangeRisk = this.analyzeFakeKoreanExchangePatterns(domain);
    riskScore += exchangeRisk.score;
    detectedPatterns.push(...exchangeRisk.patterns);
    details.push(...exchangeRisk.details);
    if (exchangeRisk.scamType) scamType = exchangeRisk.scamType;

    // 2. 한국 기관 사칭 패턴 분석
    const institutionRisk = this.analyzeKoreanInstitutionPatterns(domain);
    riskScore += institutionRisk.score;
    detectedPatterns.push(...institutionRisk.patterns);
    details.push(...institutionRisk.details);

    // 3. 한국 문화 악용 패턴 분석
    const cultureRisk = this.analyzeKoreanCulturePatterns(domain, url);
    riskScore += cultureRisk.score;
    detectedPatterns.push(...cultureRisk.patterns);
    details.push(...cultureRisk.details);

    // 4. 한국어 키워드 분석
    const languageRisk = this.analyzeKoreanLanguagePatterns(domain, url);
    riskScore += languageRisk.score;
    detectedPatterns.push(...languageRisk.patterns);
    details.push(...languageRisk.details);

    // 5. 알려진 사기 사례와 매칭
    const knownScamRisk = this.analyzeKnownScamPatterns(domain, url);
    riskScore += knownScamRisk.score;
    detectedPatterns.push(...knownScamRisk.patterns);
    details.push(...knownScamRisk.details);
    relatedScams.push(...knownScamRisk.relatedScams);

    // 6. 한국 도메인 특성 분석
    const domainRisk = this.analyzeKoreanDomainCharacteristics(domain);
    riskScore += domainRisk.score;
    detectedPatterns.push(...domainRisk.patterns);
    details.push(...domainRisk.details);

    // 위험도 결정
    let riskLevel: 'safe' | 'suspicious' | 'dangerous';
    let isKoreanCryptoScam = false;

    if (riskScore >= 75) {
      riskLevel = 'dangerous';
      isKoreanCryptoScam = true;
    } else if (riskScore >= 45) {
      riskLevel = 'suspicious';
      isKoreanCryptoScam = true;
    } else {
      riskLevel = 'safe';
    }

    const confidence = Math.min(100, Math.max(0, riskScore));

    return {
      isKoreanCryptoScam,
      riskLevel,
      scamType,
      patterns: [...new Set(detectedPatterns)],
      confidence,
      details: [...new Set(details)],
      relatedScams: relatedScams.length > 0 ? [...new Set(relatedScams)] : undefined,
      recommendations: this.generateKoreanScamRecommendations(riskLevel, detectedPatterns, scamType)
    };
  }

  // 가짜 한국 거래소 패턴 분석
  private analyzeFakeKoreanExchangePatterns(domain: string): {
    score: number;
    patterns: string[];
    details: string[];
    scamType?: string;
  } {
    const patterns: string[] = [];
    const details: string[] = [];
    let score = 0;
    let scamType: string | undefined;

    this.KOREAN_SCAM_PATTERNS.fakeKoreanExchanges.forEach(pattern => {
      if (domain.includes(pattern)) {
        score += 70; // 매우 높은 위험도
        patterns.push('fake-korean-exchange');
        details.push(`한국 거래소 사칭 패턴 감지: ${pattern}`);
        scamType = '가짜 한국 거래소';
      }
    });

    // 한국 거래소 도메인 유사성 검사
    const koreanExchanges = ['upbit', 'bithumb', 'coinone', 'korbit', 'gopax'];
    koreanExchanges.forEach(exchange => {
      if (domain.includes(exchange) && !domain.includes(`${exchange}.com`) && !domain.includes(`${exchange}.co.kr`)) {
        score += 60;
        patterns.push('korean-exchange-similarity');
        details.push(`${exchange} 거래소 유사 도메인 사용`);
        if (!scamType) scamType = '한국 거래소 사칭';
      }
    });

    return { score, patterns, details, scamType };
  }

  // 한국 기관 사칭 패턴 분석
  private analyzeKoreanInstitutionPatterns(domain: string): { score: number; patterns: string[]; details: string[] } {
    const patterns: string[] = [];
    const details: string[] = [];
    let score = 0;

    // 은행/카드사 사칭
    this.KOREAN_SCAM_PATTERNS.fakeBanking.forEach(pattern => {
      if (domain.includes(pattern)) {
        score += 60;
        patterns.push('fake-korean-banking');
        details.push(`한국 금융기관 사칭 패턴: ${pattern}`);
      }
    });

    // 포털/메신저 사칭
    this.KOREAN_SCAM_PATTERNS.fakePortals.forEach(pattern => {
      if (domain.includes(pattern)) {
        score += 50;
        patterns.push('fake-korean-portal');
        details.push(`한국 포털/메신저 사칭 패턴: ${pattern}`);
      }
    });

    // 정부기관 사칭
    this.KOREAN_SCAM_PATTERNS.fakeGovernment.forEach(pattern => {
      if (domain.includes(pattern)) {
        score += 80; // 정부기관 사칭은 매우 심각
        patterns.push('fake-korean-government');
        details.push(`한국 정부기관 사칭 패턴: ${pattern}`);
      }
    });

    return { score, patterns, details };
  }

  // 한국 문화 악용 패턴 분석
  private analyzeKoreanCulturePatterns(domain: string, url?: string): { score: number; patterns: string[]; details: string[] } {
    const patterns: string[] = [];
    const details: string[] = [];
    let score = 0;

    const fullText = `${domain} ${url || ''}`.toLowerCase();

    // K-pop/한류 악용
    this.KOREAN_SCAM_PATTERNS.kpopScams.forEach(pattern => {
      if (fullText.includes(pattern)) {
        score += 40;
        patterns.push('kpop-culture-exploitation');
        details.push(`K-pop/한류 문화 악용 패턴: ${pattern}`);
      }
    });

    // 한국 전통/문화 키워드 악용
    const culturalKeywords = [
      'korea', 'korean', 'seoul', 'busan', 'jeju',
      'kimchi', 'bulgogi', 'hanbok', 'taekwondo',
      'samsung', 'lg', 'hyundai', 'sk'
    ];

    const cryptoKeywords = ['coin', 'token', 'crypto', 'blockchain', 'defi'];

    const hasCultural = culturalKeywords.some(keyword => fullText.includes(keyword));
    const hasCrypto = cryptoKeywords.some(keyword => fullText.includes(keyword));

    if (hasCultural && hasCrypto) {
      score += 30;
      patterns.push('cultural-crypto-mixing');
      details.push('한국 문화 키워드와 가상화폐 키워드 혼용 (의심)');
    }

    return { score, patterns, details };
  }

  // 한국어 키워드 분석
  private analyzeKoreanLanguagePatterns(domain: string, url?: string): { score: number; patterns: string[]; details: string[] } {
    const patterns: string[] = [];
    const details: string[] = [];
    let score = 0;

    const fullText = `${domain} ${url || ''}`.toLowerCase();

    // 한국 가상화폐 사기에서 자주 사용되는 한글 키워드들
    const koreanScamKeywords = [
      // 투자 관련
      { words: ['투자', '수익', '돈벌기', '부자'], score: 35, name: 'investment-korean' },
      { words: ['일일', '매일', '자동', '수동'], score: 30, name: 'passive-income-korean' },
      { words: ['보장', '확실', '안전'], score: 40, name: 'guarantee-korean' },

      // 가상화폐 관련
      { words: ['코인', '비트코인', '이더리움', '리플'], score: 25, name: 'crypto-korean' },
      { words: ['채굴', '마이닝', '스테이킹'], score: 30, name: 'mining-korean' },
      { words: ['에어드랍', '토큰', '블록체인'], score: 25, name: 'token-korean' },

      // 사기 관련
      { words: ['한정', '특별', '독점', 'VIP'], score: 35, name: 'exclusive-korean' },
      { words: ['무료', '공짜', '선물'], score: 30, name: 'free-korean' },
      { words: ['급히', '서둘러', '지금'], score: 25, name: 'urgency-korean' }
    ];

    // 한글이 로마자로 표기된 경우도 검사
    const romanizedKorean = [
      'tongjang', 'gyejwa', 'bibo', 'anjeong', 'sueik',
      'tuza', 'coin', 'mining', 'blockchain'
    ];

    koreanScamKeywords.forEach(({ words, score: keywordScore, name }) => {
      const matchedWords = words.filter(word => {
        // 한글 키워드를 로마자로 변환해서도 검사
        return fullText.includes(word) || this.checkRomanizedKorean(fullText, word);
      });

      if (matchedWords.length > 0) {
        score += keywordScore;
        patterns.push(name);
        details.push(`한국어 사기 키워드 감지: ${matchedWords.join(', ')}`);
      }
    });

    // 로마자 한국어 패턴
    romanizedKorean.forEach(word => {
      if (fullText.includes(word)) {
        score += 20;
        patterns.push('romanized-korean');
        details.push(`로마자 한국어 패턴: ${word}`);
      }
    });

    return { score, patterns, details };
  }

  // 알려진 사기 사례와 매칭
  private analyzeKnownScamPatterns(domain: string, url?: string): {
    score: number;
    patterns: string[];
    details: string[];
    relatedScams: string[];
  } {
    const patterns: string[] = [];
    const details: string[] = [];
    const relatedScams: string[] = [];
    let score = 0;

    const fullText = `${domain} ${url || ''}`.toLowerCase();

    Object.entries(this.KNOWN_KOREAN_SCAMS).forEach(([scamName, scamData]) => {
      const matchedKeywords = scamData.keywords.filter(keyword => fullText.includes(keyword));

      if (matchedKeywords.length > 0) {
        score += 50;
        patterns.push('known-scam-pattern');
        details.push(`알려진 사기 패턴과 일치: ${scamName}`);
        relatedScams.push(scamName);
      }
    });

    return { score, patterns, details, relatedScams };
  }

  // 한국 도메인 특성 분석
  private analyzeKoreanDomainCharacteristics(domain: string): { score: number; patterns: string[]; details: string[] } {
    const patterns: string[] = [];
    const details: string[] = [];
    let score = 0;

    // 한국 TLD 사용 여부
    const isKoreanTLD = domain.endsWith('.kr') || domain.endsWith('.co.kr') || domain.endsWith('.or.kr');

    if (isKoreanTLD) {
      // 한국 TLD이지만 의심스러운 패턴
      const hasNumber = /\d/.test(domain);
      const hasHyphen = /-/.test(domain);

      if (hasNumber && hasHyphen) {
        score += 25;
        patterns.push('suspicious-korean-domain');
        details.push('한국 도메인이지만 의심스러운 구조 (숫자+하이픈)');
      }
    } else {
      // 한국 관련 키워드를 사용하지만 해외 도메인
      const koreanKeywords = ['korea', 'korean', 'kr', 'seoul'];
      const hasKoreanKeyword = koreanKeywords.some(keyword => domain.includes(keyword));

      if (hasKoreanKeyword) {
        score += 30;
        patterns.push('foreign-domain-korean-keyword');
        details.push('해외 도메인에서 한국 키워드 사용 (의심)');
      }
    }

    // 한글 도메인 (punycode) 분석
    if (domain.includes('xn--')) {
      score += 35;
      patterns.push('punycode-korean-domain');
      details.push('한글 도메인 (punycode) 사용 - 피싱에 자주 악용');
    }

    return { score, patterns, details };
  }

  // 로마자 한국어 검사 (간단한 구현)
  private checkRomanizedKorean(text: string, koreanWord: string): boolean {
    // 간단한 한글->로마자 변환 규칙
    const romanizationMap: { [key: string]: string[] } = {
      '투자': ['tuza', 'tuja'],
      '수익': ['sueik', 'sueek'],
      '돈': ['don', 'ton'],
      '코인': ['coin', 'koin'],
      '채굴': ['chaegul', 'mining'],
      '보장': ['bojang', 'guarantee']
    };

    const romanized = romanizationMap[koreanWord];
    return romanized ? romanized.some(word => text.includes(word)) : false;
  }

  // 추천사항 생성
  private generateKoreanScamRecommendations(
    riskLevel: 'safe' | 'suspicious' | 'dangerous',
    patterns: string[],
    scamType?: string
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'dangerous') {
      recommendations.push('🚨 즉시 사이트 이용 중단 - 국내 가상화폐 사기일 가능성이 매우 높습니다');
      recommendations.push('🚫 개인정보, 계좌정보, 가상화폐 지갑 정보를 절대 입력하지 마세요');
      recommendations.push('📞 의심스러운 연락이 왔다면 한국인터넷진흥원(privacy.go.kr)에 신고하세요');
    } else if (riskLevel === 'suspicious') {
      recommendations.push('⚠️ 주의하세요 - 국내 가상화폐 사기 패턴이 감지되었습니다');
      recommendations.push('🔍 금융감독원 등록업체인지 확인하세요 (fss.or.kr)');
      recommendations.push('💡 투자 전 충분한 검토와 전문가 상담을 받으세요');
    }

    // 패턴별 구체적 추천사항
    if (patterns.includes('fake-korean-exchange')) {
      recommendations.push('🏦 정식 한국 거래소: 업비트, 빗썸, 코인원, 코빗, 고팩스만 이용하세요');
    }

    if (patterns.includes('fake-korean-government')) {
      recommendations.push('🏛️ 정부기관 사칭 시 즉시 해당 기관에 직접 확인하세요');
    }

    if (patterns.includes('kpop-culture-exploitation')) {
      recommendations.push('🎵 K-pop/연예인과 관련된 가상화폐는 99% 사기입니다');
    }

    if (patterns.includes('known-scam-pattern')) {
      recommendations.push('📋 이미 알려진 사기 수법과 유사한 패턴입니다');
    }

    if (patterns.includes('investment-korean') || patterns.includes('guarantee-korean')) {
      recommendations.push('💰 "보장된 수익", "확실한 투자"는 존재하지 않습니다');
    }

    // 일반적 보안 추천사항
    recommendations.push('📱 의심스러운 앱 설치나 파일 다운로드를 하지 마세요');
    recommendations.push('🔐 공식 거래소의 2단계 인증(2FA)을 반드시 설정하세요');
    recommendations.push('💬 가상화폐 관련 제안은 텔레그램, 카카오톡 등에서 온 것일수록 의심하세요');

    if (scamType) {
      recommendations.push(`🎯 감지된 사기 유형: ${scamType}`);
    }

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

  private getFromCache(domain: string): KoreanCryptoScamDetectionResult | null {
    const cached = this.cache.get(domain);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    this.cache.delete(domain);
    return null;
  }

  private setCache(domain: string, data: KoreanCryptoScamDetectionResult): void {
    this.cache.set(domain, {
      data,
      expires: Date.now() + this.CACHE_TTL
    });
  }

  // 분석 결과 로깅
  private logKoreanScamAnalysis(domain: string, result: KoreanCryptoScamDetectionResult): void {
    console.log('\n🇰🇷 === 국내 가상화폐 사기 탐지 결과 ===');
    console.log(`📍 도메인: ${domain}`);
    console.log(`🎯 국내 가상화폐 사기 여부: ${result.isKoreanCryptoScam ? 'YES' : 'NO'}`);
    if (result.scamType) {
      console.log(`🔍 사기 유형: ${result.scamType}`);
    }
    console.log(`⚠️ 위험도: ${result.riskLevel}`);
    console.log(`📊 신뢰도: ${result.confidence}%`);

    if (result.patterns.length > 0) {
      console.log(`🚩 감지된 패턴: ${result.patterns.join(', ')}`);
    }

    if (result.relatedScams && result.relatedScams.length > 0) {
      console.log(`📋 관련 알려진 사기: ${result.relatedScams.join(', ')}`);
    }

    if (result.details.length > 0) {
      console.log('\n📋 상세 분석:');
      result.details.forEach((detail, index) => {
        console.log(`   ${index + 1}. ${detail}`);
      });
    }

    if (result.recommendations.length > 0) {
      console.log('\n💡 추천사항:');
      result.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    console.log('\n' + '='.repeat(50) + '\n');
  }
}