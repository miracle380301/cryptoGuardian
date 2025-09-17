import { ApiResponse } from '@/types/api.types';

// 팀 스캠 미션 감지 결과 타입
interface TeamScamDetectionResult {
  isTeamScam: boolean;
  riskLevel: 'safe' | 'suspicious' | 'dangerous';
  patterns: string[];
  confidence: number;
  details: string[];
  recommendations: string[];
}

// 팀 스캠 미션 패턴 감지 전문 클래스
export class TeamScamDetector {
  private cache: Map<string, { data: TeamScamDetectionResult; expires: number }>;
  private readonly CACHE_TTL = 1800000; // 30분 캐시

  constructor() {
    this.cache = new Map();
  }

  // 팀 스캠 미션 패턴 감지 메인 메서드
  async detectTeamScam(domain: string, url?: string): Promise<ApiResponse<TeamScamDetectionResult>> {
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

      console.log(`🕵️ 팀 스캠 미션 패턴 분석 중: ${cleanDomain}`);

      const detectionResult = this.analyzeTeamScamPatterns(cleanDomain, url);

      // 캐시에 저장
      this.setCache(cleanDomain, detectionResult);

      // 결과 로깅
      this.logTeamScamAnalysis(cleanDomain, detectionResult);

      return {
        success: true,
        data: detectionResult,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('팀 스캠 감지 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // 팀 스캠 미션 패턴 분석
  private analyzeTeamScamPatterns(domain: string, url?: string): TeamScamDetectionResult {
    const detectedPatterns: string[] = [];
    const details: string[] = [];
    let riskScore = 0;

    // 1. 도메인 패턴 분석
    const domainRisk = this.analyzeDomainPatterns(domain);
    riskScore += domainRisk.score;
    detectedPatterns.push(...domainRisk.patterns);
    details.push(...domainRisk.details);

    // 2. 팀 스캠 특화 키워드 분석
    const keywordRisk = this.analyzeTeamScamKeywords(domain, url);
    riskScore += keywordRisk.score;
    detectedPatterns.push(...keywordRisk.patterns);
    details.push(...keywordRisk.details);

    // 3. 도메인 구조 분석 (서브도메인, 경로 등)
    const structureRisk = this.analyzeStructurePatterns(domain, url);
    riskScore += structureRisk.score;
    detectedPatterns.push(...structureRisk.patterns);
    details.push(...structureRisk.details);

    // 4. 시간 기반 패턴 (도메인 등록일 등)
    const timeRisk = this.analyzeTimePatterns(domain);
    riskScore += timeRisk.score;
    detectedPatterns.push(...timeRisk.patterns);
    details.push(...timeRisk.details);

    // 위험도 결정
    let riskLevel: 'safe' | 'suspicious' | 'dangerous';
    let isTeamScam = false;

    if (riskScore >= 80) {
      riskLevel = 'dangerous';
      isTeamScam = true;
    } else if (riskScore >= 40) {
      riskLevel = 'suspicious';
      isTeamScam = true;
    } else {
      riskLevel = 'safe';
    }

    const confidence = Math.min(100, Math.max(0, riskScore));

    return {
      isTeamScam,
      riskLevel,
      patterns: [...new Set(detectedPatterns)], // 중복 제거
      confidence,
      details: [...new Set(details)], // 중복 제거
      recommendations: this.generateRecommendations(riskLevel, detectedPatterns)
    };
  }

  // 도메인 패턴 분석
  private analyzeDomainPatterns(domain: string): { score: number; patterns: string[]; details: string[] } {
    const patterns: string[] = [];
    const details: string[] = [];
    let score = 0;

    // 팀 스캠 미션에서 자주 사용되는 도메인 패턴들
    const teamScamDomainPatterns = [
      // 유명 플랫폼 사칭
      { pattern: /tele-?gram/i, score: 50, name: 'telegram-impersonation' },
      { pattern: /whats-?app/i, score: 50, name: 'whatsapp-impersonation' },
      { pattern: /kakao-?talk/i, score: 50, name: 'kakaotalk-impersonation' },
      { pattern: /line-?app/i, score: 50, name: 'line-impersonation' },

      // 거래소 사칭 (팀 스캠에서 흔함)
      { pattern: /binance-?[a-z]+/i, score: 70, name: 'binance-impersonation' },
      { pattern: /upbit-?[a-z]+/i, score: 70, name: 'upbit-impersonation' },
      { pattern: /bithumb-?[a-z]+/i, score: 70, name: 'bithumb-impersonation' },
      { pattern: /coinbase-?[a-z]+/i, score: 70, name: 'coinbase-impersonation' },

      // 팀/그룹 관련 키워드
      { pattern: /team-?[a-z]+/i, score: 30, name: 'team-keyword' },
      { pattern: /group-?[a-z]+/i, score: 30, name: 'group-keyword' },
      { pattern: /project-?[a-z]+/i, score: 30, name: 'project-keyword' },
      { pattern: /community-?[a-z]+/i, score: 25, name: 'community-keyword' },

      // 투자/수익 관련 (팀 스캠 특징)
      { pattern: /invest-?[a-z]*|profit|earning|income|money/i, score: 40, name: 'investment-keyword' },
      { pattern: /daily|weekly|monthly|passive/i, score: 35, name: 'time-based-earning' },

      // 의심스러운 TLD 조합
      { pattern: /\.(tk|ml|ga|cf)$/i, score: 30, name: 'suspicious-tld' },
      { pattern: /\.(click|download|loan)$/i, score: 25, name: 'suspicious-new-tld' },

      // 숫자가 많은 도메인 (자동 생성 의심)
      { pattern: /\d{4,}/i, score: 20, name: 'multiple-numbers' },

      // 하이픈이 많은 도메인
      { pattern: /-.*-.*-/i, score: 15, name: 'multiple-hyphens' }
    ];

    teamScamDomainPatterns.forEach(({ pattern, score: patternScore, name }) => {
      if (pattern.test(domain)) {
        score += patternScore;
        patterns.push(name);
        details.push(`도메인에서 팀 스캠 패턴 감지: ${name}`);
      }
    });

    // 도메인 길이 분석 (매우 짧거나 매우 긴 도메인은 의심)
    const domainParts = domain.split('.');
    const mainDomain = domainParts[0];
    if (mainDomain.length < 4) {
      score += 15;
      patterns.push('very-short-domain');
      details.push('매우 짧은 도메인명 (자동 생성 의심)');
    } else if (mainDomain.length > 20) {
      score += 10;
      patterns.push('very-long-domain');
      details.push('매우 긴 도메인명 (키워드 스터핑 의심)');
    }

    return { score, patterns, details };
  }

  // 팀 스캠 특화 키워드 분석
  private analyzeTeamScamKeywords(domain: string, url?: string): { score: number; patterns: string[]; details: string[] } {
    const patterns: string[] = [];
    const details: string[] = [];
    let score = 0;

    const fullText = `${domain} ${url || ''}`.toLowerCase();

    // 팀 스캠 미션에서 자주 사용되는 키워드들
    const teamScamKeywords = [
      // 직접적인 팀 스캠 관련
      { words: ['team', 'mission', 'task', 'assignment'], score: 60, name: 'team-mission-direct' },
      { words: ['recruit', 'hiring', 'job', 'work'], score: 45, name: 'recruitment-keywords' },
      { words: ['easy', 'simple', 'automatic', 'passive'], score: 40, name: 'easy-money-keywords' },

      // 수익 관련 키워드
      { words: ['earn', 'profit', 'income', 'money', 'cash'], score: 35, name: 'earning-keywords' },
      { words: ['daily', 'weekly', 'guaranteed'], score: 30, name: 'guaranteed-income' },
      { words: ['bonus', 'reward', 'commission'], score: 25, name: 'reward-keywords' },

      // 암호화폐 팀 스캠 특화
      { words: ['airdrop', 'mining', 'staking', 'yield'], score: 35, name: 'crypto-team-keywords' },
      { words: ['defi', 'nft', 'metaverse', 'gamefi'], score: 30, name: 'trendy-crypto-keywords' },

      // 소셜 플랫폼 키워드
      { words: ['telegram', 'discord', 'kakao', 'whatsapp'], score: 20, name: 'social-platform' },

      // 긴급성/희소성 조장
      { words: ['limited', 'exclusive', 'urgent', 'hurry'], score: 25, name: 'urgency-keywords' },
      { words: ['today', 'now', 'immediately'], score: 20, name: 'immediate-action' }
    ];

    teamScamKeywords.forEach(({ words, score: keywordScore, name }) => {
      const matchedWords = words.filter(word => fullText.includes(word));
      if (matchedWords.length > 0) {
        score += keywordScore;
        patterns.push(name);
        details.push(`팀 스캠 키워드 감지: ${matchedWords.join(', ')}`);
      }
    });

    return { score, patterns, details };
  }

  // 도메인 구조 패턴 분석
  private analyzeStructurePatterns(domain: string, url?: string): { score: number; patterns: string[]; details: string[] } {
    const patterns: string[] = [];
    const details: string[] = [];
    let score = 0;

    // 서브도메인 분석
    const domainParts = domain.split('.');
    if (domainParts.length > 3) {
      score += 15;
      patterns.push('multiple-subdomains');
      details.push('복잡한 서브도메인 구조 (리다이렉션 목적 의심)');
    }

    // URL 경로 분석 (제공된 경우)
    if (url) {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);

      // 의심스러운 경로 패턴
      const suspiciousPaths = [
        { pattern: /\/ref\/|\/referral\/|\/invite\//i, score: 30, name: 'referral-link' },
        { pattern: /\/task\/|\/mission\/|\/job\//i, score: 40, name: 'task-path' },
        { pattern: /\/earn\/|\/profit\/|\/money\//i, score: 35, name: 'earning-path' },
        { pattern: /\/team\/|\/group\//i, score: 25, name: 'team-path' }
      ];

      suspiciousPaths.forEach(({ pattern, score: pathScore, name }) => {
        if (pattern.test(urlObj.pathname)) {
          score += pathScore;
          patterns.push(name);
          details.push(`의심스러운 URL 경로: ${name}`);
        }
      });

      // URL 파라미터 분석
      const suspiciousParams = ['ref', 'referral', 'invite', 'task', 'mission'];
      suspiciousParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          score += 20;
          patterns.push('suspicious-params');
          details.push(`의심스러운 URL 파라미터: ${param}`);
        }
      });
    }

    return { score, patterns, details };
  }

  // 시간 기반 패턴 분석
  private analyzeTimePatterns(domain: string): { score: number; patterns: string[]; details: string[] } {
    const patterns: string[] = [];
    const details: string[] = [];
    let score = 0;

    // 도메인에 날짜/시간 패턴이 있는지 확인 (자동 생성 의심)
    const timePatterns = [
      { pattern: /20(2[0-9]|3[0-9])/i, score: 15, name: 'year-in-domain' },
      { pattern: /(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])/i, score: 20, name: 'date-in-domain' },
      { pattern: /\d{8,}/i, score: 25, name: 'timestamp-like-numbers' }
    ];

    timePatterns.forEach(({ pattern, score: patternScore, name }) => {
      if (pattern.test(domain)) {
        score += patternScore;
        patterns.push(name);
        details.push(`시간 기반 패턴 감지: ${name}`);
      }
    });

    return { score, patterns, details };
  }

  // 추천사항 생성
  private generateRecommendations(riskLevel: 'safe' | 'suspicious' | 'dangerous', patterns: string[]): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'dangerous') {
      recommendations.push('🚨 즉시 접근 중단 - 팀 스캠 미션일 가능성이 매우 높습니다');
      recommendations.push('🚫 어떤 개인정보나 결제정보도 입력하지 마세요');
      recommendations.push('📞 의심스러운 연락이 왔다면 공식 채널로 확인하세요');
    } else if (riskLevel === 'suspicious') {
      recommendations.push('⚠️ 신중하게 접근하세요 - 팀 스캠 패턴이 감지되었습니다');
      recommendations.push('🔍 제공업체를 공식 웹사이트에서 직접 확인하세요');
      recommendations.push('💰 투자나 수익 관련 제안은 특히 주의하세요');
    }

    // 패턴별 구체적 추천사항
    if (patterns.includes('telegram-impersonation') || patterns.includes('whatsapp-impersonation')) {
      recommendations.push('📱 공식 메신저 앱에서 직접 확인하세요');
    }

    if (patterns.includes('binance-impersonation') || patterns.includes('upbit-impersonation')) {
      recommendations.push('🏦 공식 거래소 웹사이트에서 직접 접속하세요');
    }

    if (patterns.includes('team-mission-direct')) {
      recommendations.push('🎯 "팀 미션" 관련 제안은 90% 이상이 사기입니다');
    }

    if (patterns.includes('guaranteed-income')) {
      recommendations.push('💸 "보장된 수익"은 존재하지 않습니다');
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

  private getFromCache(domain: string): TeamScamDetectionResult | null {
    const cached = this.cache.get(domain);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    this.cache.delete(domain);
    return null;
  }

  private setCache(domain: string, data: TeamScamDetectionResult): void {
    this.cache.set(domain, {
      data,
      expires: Date.now() + this.CACHE_TTL
    });
  }

  // 분석 결과 로깅
  private logTeamScamAnalysis(domain: string, result: TeamScamDetectionResult): void {
    console.log('\n🕵️ === 팀 스캠 미션 패턴 분석 결과 ===');
    console.log(`📍 도메인: ${domain}`);
    console.log(`🎯 팀 스캠 여부: ${result.isTeamScam ? 'YES' : 'NO'}`);
    console.log(`⚠️ 위험도: ${result.riskLevel}`);
    console.log(`📊 신뢰도: ${result.confidence}%`);

    if (result.patterns.length > 0) {
      console.log(`🚩 감지된 패턴: ${result.patterns.join(', ')}`);
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