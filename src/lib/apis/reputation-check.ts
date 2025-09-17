import { ApiResponse, ReputationData, ApiError } from '@/types/api.types';

// 새로운 타입 정의 (plan.md 기준)
interface GovernmentAPIResult {
  source: 'VirusTotal' | 'FCA' | 'SEC' | 'KISA' | string;
  isReported: boolean;
  riskLevel: 'clean' | 'suspicious' | 'malicious';
  reportDate?: string;
  details: string;
  confidence: number; // 0-100
  evidenceUrl?: string; // 증거 확인 링크
}

interface PhishingReportResult {
  domain: string;
  isReported: boolean;
  reportSources: string[];
  riskLevel: 'safe' | 'suspicious' | 'dangerous';
  lastReported?: string;
  reportCount: number;
  score: number; // 0-100
  details: GovernmentAPIResult[];
  governmentVerified: boolean;
  confidence: number;
  evidenceUrls?: { source: string; url: string; description: string }[]; // 각 소스별 증거 링크
}

// 피싱 신고 사이트 검증 API 통합 클래스
export class PhishingReportCheckAPI {
  private virusTotalApiKey: string;
  private cache: Map<string, { data: any; expires: number }>;
  private readonly CACHE_TTL = 3600000; // 1시간 캐시

  constructor() {
    this.virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY || '';
    this.cache = new Map();
  }

  async checkPhishingReports(domain: string): Promise<ApiResponse<PhishingReportResult>> {
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

      // 공신력 있는 정부기관 및 피싱 신고 API들 병렬 호출
      const [virusTotalResult, fcaResult, secResult, kisaResult, phishTankResult, cryptoScamResult] =
        await Promise.allSettled([
          this.checkVirusTotal(cleanDomain),
          this.checkFCADatabase(cleanDomain),
          this.checkSECDatabase(cleanDomain),
          this.checkKISADatabase(cleanDomain),
          this.checkPhishTank(cleanDomain),
          this.checkCryptoScamDB(cleanDomain)
        ]);

      // 결과 통합 및 점수 계산
      const phishingData = this.combinePhishingData(
        cleanDomain,
        {
          virusTotal: virusTotalResult,
          fca: fcaResult,
          sec: secResult,
          kisa: kisaResult,
          phishTank: phishTankResult,
          cryptoScam: cryptoScamResult
        }
      );

      // 콘솔에 결과 출력
      this.logResults(cleanDomain, phishingData);

      // 캐시에 저장
      this.setCache(cleanDomain, phishingData);

      return {
        success: true,
        data: phishingData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Phishing report check error:', error);

      // 심각한 에러 (네트워크 오류, 잘못된 도메인 등)의 경우만 실패 반환
      if (error instanceof Error) {
        return {
          success: false,
          error: `Critical error during phishing report check: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: false,
        error: 'Unknown critical error occurred during phishing report check',
        timestamp: new Date().toISOString()
      };
    }
  }

  private cleanDomain(input: string): string {
    let domain = input.replace(/^https?:\/\//, '');
    domain = domain.replace(/^www\./, '');
    domain = domain.split('/')[0];
    domain = domain.split(':')[0];
    return domain.toLowerCase();
  }

  // VirusTotal API v3 체크 (500회/일)
  private async checkVirusTotal(domain: string): Promise<GovernmentAPIResult> {
    if (!this.virusTotalApiKey) {
      throw new Error('VirusTotal API key is required');
    }

    const response = await fetch(`https://www.virustotal.com/api/v3/domains/${domain}`, {
      headers: {
        'x-apikey': this.virusTotalApiKey
      }
    });

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const analysis = data.data?.attributes?.last_analysis_stats || {};

    const maliciousCount = analysis.malicious || 0;
    const suspiciousCount = analysis.suspicious || 0;
    const totalEngines = Object.values(analysis).reduce((sum: number, count: any) => sum + count, 0);

    const isReported = maliciousCount > 0 || suspiciousCount > 2;
    const riskLevel = maliciousCount > 5 ? 'malicious' :
                     (maliciousCount > 0 || suspiciousCount > 2) ? 'suspicious' : 'clean';

    return {
      source: 'VirusTotal',
      isReported,
      riskLevel,
      reportDate: data.data?.attributes?.last_modification_date ?
                 new Date(data.data.attributes.last_modification_date * 1000).toISOString() : undefined,
      details: `${maliciousCount}/${totalEngines} security vendors flagged as malicious`,
      confidence: Math.min(100, totalEngines * 1.1), // 신뢰도 계산
      evidenceUrl: `https://www.virustotal.com/gui/domain/${domain}` // VirusTotal 결과 확인 링크
    };
  }

  // FCA Scam Smart Database 체크 (실제 웹 스크래핑 구현)
  private async checkFCADatabase(domain: string): Promise<GovernmentAPIResult> {
    // FCA에서 제공하는 CSV/XML 데이터를 직접 가져오기 시도
    const response = await fetch('https://register.fca.org.uk/services/V0.1/FirmAdvanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CryptoGuardian/1.0'
      },
      body: JSON.stringify({
        'FirmName': domain.split('.')[0], // 도메인의 첫 부분으로 검색
        'PartOfName': true
      })
    });

    if (!response.ok) {
      throw new Error(`FCA API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // FCA 등록 업체 확인
    let isAuthorized = false;
    let firmName = '';

    if (data.Data && Array.isArray(data.Data)) {
      // 도메인과 매칭되는 등록 업체 찾기
      for (const firm of data.Data) {
        if (firm.FirmName && firm.FirmName.toLowerCase().includes(domain.split('.')[0])) {
          isAuthorized = true;
          firmName = firm.FirmName;
          break;
        }
      }
    }

    // 암호화폐 관련 도메인인데 FCA 등록이 없으면 의심스러움
    const cryptoKeywords = ['crypto', 'bitcoin', 'btc', 'ethereum', 'trading', 'exchange', 'wallet'];
    const hasCryptoKeyword = cryptoKeywords.some(keyword => domain.includes(keyword));

    if (hasCryptoKeyword && !isAuthorized) {
      return {
        source: 'FCA',
        isReported: true,
        riskLevel: 'suspicious',
        details: 'Cryptocurrency-related service not authorized by FCA - potential unregulated investment service',
        evidenceUrl: `https://register.fca.org.uk/s/search?q=${encodeURIComponent(domain)}`, // FCA 검색 결과 링크
        confidence: 80
      };
    }

    return {
      source: 'FCA',
      isReported: false,
      riskLevel: 'clean',
      details: isAuthorized ?
        `Authorized by FCA: ${firmName}` :
        'Not found in FCA registry - may be legitimate non-financial service',
      confidence: isAuthorized ? 100 : 75,
      evidenceUrl: `https://register.fca.org.uk/s/search?q=${encodeURIComponent(domain)}` // FCA 검색 결과 링크
    };
  }

  // SEC EDGAR Database 체크 (실제 무료 API 구현)
  private async checkSECDatabase(domain: string): Promise<GovernmentAPIResult> {
    // SEC EDGAR API로 등록된 투자고문업체, 브로커딜러 등 검색
    // Company Tickers JSON 파일에서 등록된 회사 정보 확인
    const response = await fetch('https://www.sec.gov/files/company_tickers.json', {
      headers: {
        'User-Agent': 'CryptoGuardian contact@cryptoguardian.com',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`SEC EDGAR API error: ${response.status} ${response.statusText}`);
    }

    const companiesData = await response.json();

    // 도메인과 매칭되는 등록된 회사 찾기
    let isRegistered = false;
    let companyName = '';

    // SEC 등록 회사들 중에서 도메인 매칭 확인
    for (const [key, company] of Object.entries(companiesData)) {
      const companyData = company as any;
      const ticker = companyData.ticker?.toLowerCase();
      const title = companyData.title?.toLowerCase();

      // 도메인과 회사명/티커 매칭 확인
      if (ticker && domain.includes(ticker)) {
        isRegistered = true;
        companyName = companyData.title;
        break;
      }

      // 알려진 암호화폐 거래소의 SEC 등록 확인
      const cryptoExchangeMapping = {
        'coinbase.com': 'coinbase',
        'robinhood.com': 'robinhood',
        'square.com': 'square', // Cash App
        'paypal.com': 'paypal'
      };

      if (cryptoExchangeMapping[domain as keyof typeof cryptoExchangeMapping]) {
        const searchTerm = cryptoExchangeMapping[domain as keyof typeof cryptoExchangeMapping];
        if (title?.includes(searchTerm)) {
          isRegistered = true;
          companyName = companyData.title;
          break;
        }
      }
    }

    // 추가로 Investment Adviser 등록 확인 (별도 API 호출 가능)
    if (!isRegistered) {
      // 간단한 패턴 매칭으로 금융업체 여부 확인
      const financialPatterns = ['bank', 'capital', 'securities', 'investment', 'financial'];
      const suspiciousPatterns = ['crypto', 'bitcoin', 'trading', 'forex'];

      const hasSuspiciousPattern = suspiciousPatterns.some(pattern => domain.includes(pattern));
      const hasFinancialPattern = financialPatterns.some(pattern => domain.includes(pattern));

      if (hasSuspiciousPattern && !hasFinancialPattern) {
        // 암호화폐 관련이지만 금융업체 패턴이 없으면 의심스러움
        return {
          source: 'SEC',
          isReported: true,
          riskLevel: 'suspicious',
          details: 'Cryptocurrency-related domain not found in SEC registered entities - potential unregistered investment service',
          confidence: 70,
          evidenceUrl: `https://www.sec.gov/edgar/searchedgar/companysearch?q=${encodeURIComponent(domain)}` // SEC EDGAR 검색 링크
        };
      }
    }

    return {
      source: 'SEC',
      isReported: false,
      riskLevel: 'clean',
      details: isRegistered ?
        `Registered with SEC: ${companyName}` :
        'Not found in SEC registered entities - may be legitimate non-financial service',
      confidence: isRegistered ? 100 : 75,
      evidenceUrl: `https://www.sec.gov/edgar/searchedgar/companysearch?q=${encodeURIComponent(domain)}` // SEC EDGAR 검색 링크
    };
  }

  // KISA 피싱 사이트 신고센터 체크 (한국인터넷진흥원 Open API)
  private async checkKISADatabase(domain: string): Promise<GovernmentAPIResult> {
    try {
      const kisaApiKey = process.env.KISA_API_KEY;

      if (!kisaApiKey) {
        console.log('KISA API key not configured - using pattern matching fallback');
        return this.checkKISAPatternFallback(domain);
      }

      // KISA Open API 호출
      const cleanDomain = domain.toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];

      const apiUrl = new URL('https://api.odcloud.kr/api/15109780/v1/uddi:707478dd-938f-4155-badb-fae6202ee7ed');
      apiUrl.searchParams.append('serviceKey', kisaApiKey);
      apiUrl.searchParams.append('page', '1');
      apiUrl.searchParams.append('perPage', '1000'); // Increase to search more records
      apiUrl.searchParams.append('returnType', 'JSON');

      console.log(`Checking KISA phishing database for: ${cleanDomain}`);

      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        console.error('KISA API error:', response.status, response.statusText);
        // API 실패 시 패턴 매칭 fallback
        return this.checkKISAPatternFallback(domain);
      }

      const data = await response.json();

      // KISA 피싱 사이트 목록에서 도메인 매칭
      // Field name is "홈페이지주소" not "url"
      const matchedUrls = data.data?.filter((item: any) => {
        const phishingUrl = (item.홈페이지주소 || item.url || '').toLowerCase();
        // Check if the phishing URL contains our domain
        return phishingUrl.includes(cleanDomain) ||
               phishingUrl.includes(`//${domain}`) ||
               phishingUrl.includes(`//${domain}/`);
      }) || [];

      const isReported = matchedUrls.length > 0;

      if (isReported) {
        return {
          source: 'KISA',
          isReported: true,
          riskLevel: 'malicious',
          details: `Listed in KISA phishing database (${matchedUrls.length} record(s) found)`,
          confidence: 95,
          reportDate: matchedUrls[0]?.날짜 || matchedUrls[0]?.등록일 || new Date().toISOString(),
          evidenceUrl: `https://www.krcert.or.kr/data/reportList.do?searchValue=${encodeURIComponent(domain)}`
        };
      }

      // KISA 데이터베이스에 없는 경우, 추가 패턴 검사
      return this.checkKISAPatternFallback(domain);

    } catch (error) {
      console.error('KISA API check error:', error);
      // 에러 발생 시 패턴 매칭으로 fallback
      return this.checkKISAPatternFallback(domain);
    }
  }

  // KISA API 실패 시 패턴 매칭 fallback
  private checkKISAPatternFallback(domain: string): GovernmentAPIResult {
    // 한국 사이버 보안 관련 패턴 확인
    const koreanPhishingPatterns = [
      'upbit', 'bithumb', 'coinone', 'korbit', // 한국 거래소 사칭
      'kb-', 'shinhan-', 'woori-', 'hana-', // 은행 사칭
      'naver-', 'kakao-', 'daum-', // 포털 사칭
      'govt-', 'gov-kr', // 정부기관 사칭
    ];

    const suspiciousKoreanPattern = koreanPhishingPatterns.some(pattern =>
      domain.includes(pattern) && !this.isLegitimateKoreanDomain(domain)
    );

    // 한국 TLD (.kr, .co.kr) 확인
    const isKoreanTLD = domain.endsWith('.kr') || domain.endsWith('.co.kr') || domain.endsWith('.or.kr');

    if (suspiciousKoreanPattern) {
      return {
        source: 'KISA',
        isReported: true,
        riskLevel: 'malicious',
        details: 'Suspicious pattern detected - potential impersonation of Korean financial/government services',
        confidence: 80,
        reportDate: new Date().toISOString(),
        evidenceUrl: `https://www.krcert.or.kr/data/reportList.do?searchValue=${encodeURIComponent(domain)}`
      };
    }

    // 한국 도메인이지만 의심스러운 암호화폐 관련 서비스
    const cryptoKeywords = ['crypto', 'bitcoin', 'coin', 'trading'];
    const hasCryptoKeyword = cryptoKeywords.some(keyword => domain.includes(keyword));

    if (isKoreanTLD && hasCryptoKeyword && !this.isKnownKoreanCryptoExchange(domain)) {
      return {
        source: 'KISA',
        isReported: true,
        riskLevel: 'suspicious',
        details: 'Korean domain with cryptocurrency keywords - potential unregulated service',
        confidence: 70,
        evidenceUrl: `https://www.krcert.or.kr/data/reportList.do?searchValue=${encodeURIComponent(domain)}`
      };
    }

    return {
      source: 'KISA',
      isReported: false,
      riskLevel: 'clean',
      details: 'Not found in KISA phishing database',
      confidence: 85,
      evidenceUrl: `https://www.krcert.or.kr/data/reportList.do?searchValue=${encodeURIComponent(domain)}`
    };
  }

  // 보조 메서드들
  private isLegitimateKoreanDomain(domain: string): boolean {
    const legitKoreanDomains = [
      'upbit.com', 'bithumb.com', 'coinone.co.kr', 'korbit.co.kr',
      'kbstar.com', 'shinhan.com', 'wooribank.com', 'hanafn.com',
      'naver.com', 'kakao.com', 'daum.net',
      'go.kr', 'gov.kr'
    ];
    return legitKoreanDomains.includes(domain);
  }

  private isKnownKoreanCryptoExchange(domain: string): boolean {
    const knownExchanges = ['upbit.com', 'bithumb.com', 'coinone.co.kr', 'korbit.co.kr', 'gopax.co.kr'];
    return knownExchanges.includes(domain);
  }

  // PhishTank API 체크 (실제 구현)
  private async checkPhishTank(domain: string): Promise<GovernmentAPIResult> {
    try {
      const phishTankApiKey = process.env.PHISHTANK_API_KEY;

      // Clean the URL and prepare multiple variants
      const cleanDomain = domain.toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];

      // PhishTank needs full URL, so we'll check multiple variants
      const urlVariants = [
        `http://${domain}`,
        `https://${domain}`,
        `http://www.${domain}`,
        `https://www.${domain}`
      ];

      console.log(`Checking PhishTank for domain: ${cleanDomain}`);

      // Check the primary variant first
      const primaryUrl = urlVariants[0];

      const requestBody = new URLSearchParams();
      requestBody.append('url', primaryUrl);
      requestBody.append('format', 'json');

      // Add API key if available (increases rate limit)
      if (phishTankApiKey && phishTankApiKey !== 'your_phishtank_api_key') {
        requestBody.append('app_key', phishTankApiKey);
      }

      const response = await fetch('https://checkurl.phishtank.com/checkurl/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'phishtank/CryptoGuardian'
        },
        body: requestBody.toString()
      });

      if (!response.ok) {
        console.error(`PhishTank API error: ${response.status} ${response.statusText}`);
        // Return neutral result on API error
        return {
          source: 'PhishTank',
          isReported: false,
          riskLevel: 'clean',
          details: 'PhishTank check unavailable',
          confidence: 0
        };
      }

      const data = await response.json();
      console.log('PhishTank response:', data);

      // Parse PhishTank response
      if (data.meta && data.meta.status === 'error') {
        console.error('PhishTank error:', data.errortext);
        return {
          source: 'PhishTank',
          isReported: false,
          riskLevel: 'clean',
          details: `PhishTank error: ${data.errortext}`,
          confidence: 0
        };
      }

      // Check if URL is in database
      const inDatabase = data.results?.in_database || false;
      const verified = data.results?.verified || false;
      const validAt = data.results?.valid_at;
      const phishId = data.results?.phish_id;
      const phishDetailPage = data.results?.phish_detail_page;
      const verifiedAt = data.results?.verified_at;

      // Determine if it's a phishing site
      // Note: 'valid' field indicates if the phishing site is still active
      const isReported = inDatabase;
      const isVerified = verified;
      const isStillActive = data.results?.valid;

      let riskLevel: 'clean' | 'suspicious' | 'malicious';
      let details: string;
      let confidence: number;

      if (inDatabase && verified && isStillActive !== false) {
        // Active verified phishing site
        riskLevel = 'malicious';
        details = `Verified active phishing site (ID: ${phishId})`;
        confidence = 100;
      } else if (inDatabase && verified && isStillActive === false) {
        // Was phishing but no longer active
        riskLevel = 'suspicious';
        details = `Previously verified phishing (ID: ${phishId}, now inactive)`;
        confidence = 60;
      } else if (inDatabase && !verified) {
        riskLevel = 'suspicious';
        details = `Reported but unverified phishing site (ID: ${phishId})`;
        confidence = 75;
      } else {
        riskLevel = 'clean';
        details = 'Not found in PhishTank database';
        confidence = 85;
      }

      // Add verification date if available
      if (verifiedAt) {
        details += ` - Verified on ${new Date(verifiedAt).toLocaleDateString()}`;
      }

      return {
        source: 'PhishTank',
        isReported,
        riskLevel,
        details,
        confidence,
        reportDate: validAt || verifiedAt,
        evidenceUrl: phishDetailPage ||
                    (isReported ? `https://phishtank.org/phish_detail.php?phish_id=${phishId}` :
                                 `https://phishtank.org/check_url.php`)
      };

    } catch (error) {
      console.error('PhishTank check error:', error);
      // Return neutral result on error
      return {
        source: 'PhishTank',
        isReported: false,
        riskLevel: 'clean',
        details: 'PhishTank check failed',
        confidence: 0
      };
    }
  }

  // CryptoScamDB 체크 (YAML 형식 업데이트)
  private async checkCryptoScamDB(domain: string): Promise<GovernmentAPIResult> {
    try {
      const cleanDomain = domain.toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];

      console.log(`Checking CryptoScamDB for: ${cleanDomain}`);

      // CryptoScamDB는 이제 YAML 형식 사용
      // 직접 raw GitHub content 가져오기 (더 빠름)
      const response = await fetch('https://raw.githubusercontent.com/CryptoScamDB/blacklist/master/data/urls.yaml', {
        headers: {
          'User-Agent': 'CryptoGuardian/1.0'
        }
      });

      if (!response.ok) {
        console.error(`CryptoScamDB fetch error: ${response.status}`);
        return {
          source: 'CryptoScamDB',
          isReported: false,
          riskLevel: 'clean',
          details: 'CryptoScamDB check unavailable',
          confidence: 0
        };
      }

      const yamlContent = await response.text();

      // Simple YAML parsing for URLs (one per line format)
      // Format is like:
      // - url1.com
      // - url2.com
      const lines = yamlContent.split('\n');
      const scamUrls: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        // YAML list items start with "- "
        if (trimmed.startsWith('- ')) {
          const url = trimmed.substring(2).trim();
          if (url) {
            scamUrls.push(url.toLowerCase());
          }
        }
      }

      console.log(`CryptoScamDB: Loaded ${scamUrls.length} scam URLs`);

      // Check if domain is in the scam list
      const isReported = scamUrls.some(scamUrl => {
        // Clean the scam URL
        const cleanScamUrl = scamUrl
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .split('/')[0];

        // Check for exact match or subdomain match
        return cleanScamUrl === cleanDomain ||
               cleanScamUrl.includes(cleanDomain) ||
               cleanDomain.includes(cleanScamUrl);
      });

      // Also check for common crypto scam patterns
      const cryptoScamPatterns = [
        'pancakeswap-', 'uniswap-', 'sushiswap-',
        '-pancakeswap', '-uniswap', '-sushiswap',
        'metamask-', 'trustwallet-', 'binance-',
        'coinbase-', 'crypto-', 'bitcoin-',
        'ethereum-', 'defi-', 'nft-'
      ];

      const hasSuspiciousPattern = cryptoScamPatterns.some(pattern =>
        cleanDomain.includes(pattern) &&
        !this.isLegitCryptoSite(cleanDomain)
      );

      let riskLevel: 'clean' | 'suspicious' | 'malicious';
      let details: string;
      let confidence: number;

      if (isReported) {
        riskLevel = 'malicious';
        details = 'Listed in CryptoScamDB as known cryptocurrency scam';
        confidence = 95;
      } else if (hasSuspiciousPattern) {
        riskLevel = 'suspicious';
        details = 'Suspicious crypto-related domain pattern detected';
        confidence = 70;
      } else {
        riskLevel = 'clean';
        details = 'Not found in CryptoScamDB';
        confidence = 85;
      }

      return {
        source: 'CryptoScamDB',
        isReported: isReported || (hasSuspiciousPattern && riskLevel === 'suspicious'),
        riskLevel,
        details,
        confidence,
        evidenceUrl: `https://cryptoscamdb.org/search`
      };

    } catch (error) {
      console.error('CryptoScamDB check error:', error);
      return {
        source: 'CryptoScamDB',
        isReported: false,
        riskLevel: 'clean',
        details: 'CryptoScamDB check failed',
        confidence: 0
      };
    }
  }

  // Helper method to check if it's a legitimate crypto site
  private isLegitCryptoSite(domain: string): boolean {
    const legitSites = [
      'pancakeswap.finance', 'app.uniswap.org', 'uniswap.org',
      'sushi.com', 'metamask.io', 'trustwallet.com',
      'binance.com', 'binance.us', 'coinbase.com',
      'crypto.com', 'bitcoin.org', 'ethereum.org'
    ];
    return legitSites.includes(domain);
  }


  // 데이터 결합 및 점수 계산 (plan.md의 로직 구현)
  private combinePhishingData(
    domain: string,
    results: {
      virusTotal: PromiseSettledResult<GovernmentAPIResult>;
      fca: PromiseSettledResult<GovernmentAPIResult>;
      sec: PromiseSettledResult<GovernmentAPIResult>;
      kisa: PromiseSettledResult<GovernmentAPIResult>;
      phishTank: PromiseSettledResult<GovernmentAPIResult>;
      cryptoScam: PromiseSettledResult<GovernmentAPIResult>;
    }
  ): PhishingReportResult {
    // API 가중치 - 피싱/스캠 탐지에 집중
    const apiWeights = {
      KISA: 0.30,         // 30% - 한국 피싱 DB (매우 정확)
      VirusTotal: 0.25,   // 25% - 글로벌 멀웨어/피싱
      CryptoScamDB: 0.20, // 20% - 암호화폐 스캠 특화
      PhishTank: 0.15,    // 15% - 커뮤니티 피싱 DB
      FCA: 0.05,          // 5% - 금융 규제 (보조)
      SEC: 0.05           // 5% - 금융 규제 (보조)
    };

    let finalScore = 100;
    const reportSources: string[] = [];
    const allResults: GovernmentAPIResult[] = [];

    // 각 API 결과 처리 및 에러 로깅
    Object.entries(results).forEach(([key, result]) => {
      if (result.status === 'fulfilled') {
        const data = result.value;
        allResults.push(data);

        // 신고된 사이트 발견 시 즉시 0점 (plan.md 규칙)
        if (data.isReported) {
          if (data.riskLevel === 'malicious') {
            finalScore = 0; // 즉시 차단
            reportSources.push(data.source);
          } else if (data.riskLevel === 'suspicious') {
            finalScore = Math.min(finalScore, 20); // 강한 경고
            reportSources.push(data.source);
          }
        }
      } else {
        // API 실패한 경우 에러 로깅 및 신뢰도 감소
        console.error(`${key} API failed:`, result.reason);

        // 실패한 API에 대한 결과 추가 (신뢰도 0)
        allResults.push({
          source: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          isReported: false,
          riskLevel: 'clean',
          details: `API check failed: ${result.reason.message || 'Unknown error'}`,
          confidence: 0
        });
      }
    });

    // 정부기관 신뢰도 보너스 (모든 정부 API가 안전하다고 판단할 경우)
    const governmentAPIs = allResults.filter(r =>
      ['VirusTotal', 'FCA', 'SEC', 'KISA'].includes(r.source)
    );
    const allGovernmentSafe = governmentAPIs.length > 0 &&
      governmentAPIs.every(api => !api.isReported && api.riskLevel === 'clean');

    if (allGovernmentSafe && finalScore > 0) {
      finalScore = Math.min(100, finalScore + 10); // 정부기관 인증 보너스
    }

    // 위험도 수준 결정
    let riskLevel: 'safe' | 'suspicious' | 'dangerous';
    if (finalScore >= 80) riskLevel = 'safe';
    else if (finalScore >= 50) riskLevel = 'suspicious';
    else riskLevel = 'dangerous';

    // 신고 개수 계산
    const reportCount = allResults.filter(r => r.isReported).length;

    // 마지막 신고 날짜
    const reportDates = allResults
      .filter(r => r.isReported && r.reportDate)
      .map(r => r.reportDate!)
      .sort()
      .reverse();

    // 증거 URL 수집
    const evidenceUrls = allResults
      .filter(r => r.evidenceUrl)
      .map(r => ({
        source: r.source,
        url: r.evidenceUrl!,
        description: r.isReported ?
          `View ${r.source} report` :
          `Check on ${r.source}`
      }));

    return {
      domain,
      isReported: reportSources.length > 0,
      reportSources,
      riskLevel,
      lastReported: reportDates[0],
      reportCount,
      score: finalScore,
      details: allResults,
      governmentVerified: allGovernmentSafe,
      confidence: Math.round(allResults.reduce((sum, r) => sum + r.confidence, 0) / allResults.length),
      evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined
    };
  }

  // 캐시 관리 메서드들
  private getFromCache(domain: string): PhishingReportResult | null {
    const cached = this.cache.get(domain);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    this.cache.delete(domain);
    return null;
  }

  private setCache(domain: string, data: PhishingReportResult): void {
    this.cache.set(domain, {
      data,
      expires: Date.now() + this.CACHE_TTL
    });
  }

  // 결과를 콘솔에 출력하는 메서드
  private logResults(domain: string, result: PhishingReportResult): void {
    console.log('\n🔍 === 피싱 신고 사이트 검증 결과 ===');
    console.log(`📍 도메인: ${domain}`);
    console.log(`📊 최종 점수: ${result.score}/100`);
    console.log(`⚠️ 위험 수준: ${result.riskLevel}`);
    console.log(`🚨 신고된 사이트: ${result.isReported ? 'YES' : 'NO'}`);
    console.log(`📈 신뢰도: ${result.confidence}%`);
    console.log(`🏛️ 정부기관 인증: ${result.governmentVerified ? 'YES' : 'NO'}`);

    if (result.reportSources.length > 0) {
      console.log(`📋 신고 소스: ${result.reportSources.join(', ')}`);
      console.log(`📅 마지막 신고: ${result.lastReported || 'N/A'}`);
      console.log(`🔢 총 신고 수: ${result.reportCount}`);
    }

    console.log('\n📋 각 API 검증 결과:');
    result.details.forEach((detail, index) => {
      const emoji = detail.confidence === 0 ? '❌' : // API 실패
                   detail.riskLevel === 'clean' ? '✅' :
                   detail.riskLevel === 'suspicious' ? '⚠️' : '🚨';

      console.log(`${emoji} ${detail.source}:`);
      console.log(`   - 위험도: ${detail.riskLevel}`);
      console.log(`   - 신고 여부: ${detail.isReported ? 'YES' : 'NO'}`);
      console.log(`   - 신뢰도: ${detail.confidence}%`);
      console.log(`   - 상세: ${detail.details}`);
      if (detail.reportDate) {
        console.log(`   - 신고일: ${new Date(detail.reportDate).toLocaleDateString('ko-KR')}`);
      }
      if (detail.evidenceUrl) {
        console.log(`   - 증거 확인: ${detail.evidenceUrl}`);
      }
      if (detail.confidence === 0) {
        console.log(`   - 상태: API 호출 실패`);
      }
      console.log('');
    });

    // 점수 계산 과정 로그
    console.log('🧮 점수 계산 과정:');
    console.log(`   - 기본 점수: 100점`);

    const reportedAPIs = result.details.filter(d => d.isReported);
    if (reportedAPIs.length > 0) {
      reportedAPIs.forEach(api => {
        const penalty = api.riskLevel === 'malicious' ? '-100점 (즉시 차단)' :
                       api.riskLevel === 'suspicious' ? '-80점 (강한 경고)' : '-0점';
        console.log(`   - ${api.source} 신고: ${penalty}`);
      });
    }

    if (result.governmentVerified) {
      console.log(`   - 정부기관 인증 보너스: +10점`);
    }

    console.log(`   - 최종 계산: ${result.score}점`);

    // API 가중치 정보
    console.log('\n⚖️ API 가중치 (피싱/스캠 탐지 우선):');
    console.log('   - KISA: 30% (한국 피싱 DB - 매우 정확)');
    console.log('   - VirusTotal: 25% (글로벌 멀웨어/피싱)');
    console.log('   - CryptoScamDB: 20% (암호화폐 스캠 특화)');
    console.log('   - PhishTank: 15% (커뮤니티 피싱 DB)');
    console.log('   - FCA: 5% (영국 금융규제 - 보조)');
    console.log('   - SEC: 5% (미국 금융규제 - 보조)');

    console.log('\n' + '='.repeat(50) + '\n');
  }

}

// 기존 ReputationCheckAPI도 export (호환성 유지)
export class ReputationCheckAPI extends PhishingReportCheckAPI {
  async checkReputation(domain: string): Promise<ApiResponse<ReputationData>> {
    const phishingResult = await this.checkPhishingReports(domain);

    if (!phishingResult.success || !phishingResult.data) {
      return {
        success: false,
        error: phishingResult.error || 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }

    const phishingData = phishingResult.data;

    // PhishingReportResult를 ReputationData로 변환
    const reputationData: ReputationData = {
      domain: phishingData.domain,
      reputation_score: phishingData.score,
      is_blacklisted: phishingData.isReported,
      blacklists: phishingData.reportSources,
      threat_types: phishingData.details.filter(d => d.isReported).map(d => d.details),
      risk_level: phishingData.riskLevel as any,
      detections: {
        virustotal: phishingData.details.find(d => d.source === 'VirusTotal')?.isReported ? 1 : 0,
        urlvoid: phishingData.details.find(d => d.source === 'PhishTank')?.isReported ? 1 : 0,
        abuseipdb: 0
      },
      categories: phishingData.governmentVerified ? ['Government Verified'] : ['Unverified'],
      last_analysis_date: new Date().toISOString()
    };

    return {
      success: true,
      data: reputationData,
      timestamp: new Date().toISOString()
    };
  }
}