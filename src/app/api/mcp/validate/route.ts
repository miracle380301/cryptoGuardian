import { NextRequest, NextResponse } from 'next/server';
import { whoisLookup } from '@/lib/validation/whois';
import { checkSSL } from '@/lib/validation/ssl-check';
import { checkUrl as checkSafeBrowsing } from '@/lib/validation/safe-browsing';
import { checkDomainBlacklist } from '@/lib/validation/blacklist-checker';
import { checkCryptoExchange } from '@/lib/validation/crypto-exchange-checker';
import { cleanDomain } from '@/lib/utils/domain';
import { checkUserReports } from '@/lib/validation/user-reports';
import { buildValidationResult } from '@/lib/score/validation-result-builder';
import { analyzePhishingPatterns } from '@/lib/validation/typosquatting-detector';
import { analyzeSuspiciousDomain } from '@/lib/validation/suspicious-domain-detector';

const SITE_URL = 'https://cryptoguardian.co.kr';

// MCP용 도메인 검증 API
// POST /api/mcp/validate
// Body: { domain: string, type?: 'general' | 'crypto' }
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { domain, type = 'general' } = body;

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Domain is required' },
        { status: 400 }
      );
    }

    const originalInput = domain;
    const cleanedDomain = cleanDomain(domain);

    // 1. 블랙리스트 검사
    const blacklistApiResponse = await checkDomainBlacklist(cleanedDomain);

    if (blacklistApiResponse.success && blacklistApiResponse.data?.isBlacklisted) {
      const blacklistData = blacklistApiResponse.data;
      const maliciousSiteCheck = {
        name: 'Malicious Site Check',
        passed: false,
        score: 0,
        weight: 0.25,
        message: `Blacklisted: ${blacklistData.reportedBy || 'Security Database'}`,
        details: {
          isReported: true,
          maliciousSite: blacklistData
        }
      };

      return NextResponse.json({
        success: true,
        data: {
          domain: cleanedDomain,
          originalInput,
          finalScore: 0,
          status: 'danger',
          verdict: '위험한 사이트입니다. 접속하지 마세요.',
          checks: {
            maliciousSite: maliciousSiteCheck
          },
          summary: `${cleanedDomain}은(는) 블랙리스트에 등록된 위험한 사이트입니다.`,
          recommendations: [
            '이 사이트를 신뢰하지 마세요',
            '개인정보를 입력하지 마세요',
            '즉시 브라우저를 닫으세요'
          ],
          timestamp: new Date().toISOString()
        },
        reference: {
          message: '자세한 정보는 CryptoGuardian에서 확인하세요.',
          url: SITE_URL,
          reportUrl: `${SITE_URL}/report`
        },
        meta: { responseTime: Date.now() - startTime }
      });
    }

    // 2. 암호화폐 거래소 검사 (crypto 타입만)
    if (type === 'crypto') {
      const exchangeApiResponse = await checkCryptoExchange(cleanedDomain);

      if (exchangeApiResponse.success && exchangeApiResponse.data?.is_verified) {
        const exchangeCheck = {
          name: 'Exchange Verification',
          passed: true,
          score: 100,
          weight: 1.0,
          message: `Verified exchange: ${exchangeApiResponse.data.name}`,
          details: exchangeApiResponse.data
        };

        return NextResponse.json({
          success: true,
          data: {
            domain: cleanedDomain,
            originalInput,
            finalScore: 100,
            status: 'safe',
            verdict: '검증된 암호화폐 거래소입니다.',
            checks: {
              exchange: exchangeCheck
            },
            summary: `${cleanedDomain}은(는) 검증된 암호화폐 거래소입니다.`,
            recommendations: [
              '공식 거래소로 확인되었습니다',
              '2단계 인증(2FA)을 활성화하세요',
              '피싱 방지를 위해 이 URL을 북마크해두세요'
            ],
            exchangeInfo: {
              name: exchangeApiResponse.data.name,
              trustScore: exchangeApiResponse.data.trust_score,
              trustScoreRank: exchangeApiResponse.data.trust_score_rank,
              country: exchangeApiResponse.data.country,
              established: exchangeApiResponse.data.established_year
            },
            timestamp: new Date().toISOString()
          },
          reference: {
            message: '자세한 정보는 CryptoGuardian에서 확인하세요.',
            url: SITE_URL,
            exchangeListUrl: `${SITE_URL}/exchanges`
          },
          meta: { responseTime: Date.now() - startTime }
        });
      }
    }

    // 3. 일반 보안 검사
    const allChecks = [
      checkUserReports(cleanedDomain),
      whoisLookup(cleanedDomain),
      checkSSL(cleanedDomain),
      checkSafeBrowsing(cleanedDomain),
      analyzePhishingPatterns(cleanedDomain),
      Promise.resolve(analyzeSuspiciousDomain(cleanedDomain)),
    ];

    const [
      userReportsResult,
      whoisResult,
      sslResult,
      safeBrowsingResult,
      aiPhishingResult,
      aiSuspiciousDomainResult
    ] = await Promise.allSettled(allChecks);

    // 4. 점수 계산 및 최종 결과 생성
    const validationResult = buildValidationResult(
      cleanedDomain,
      originalInput,
      {
        blacklistResult: { status: 'fulfilled', value: blacklistApiResponse } as PromiseSettledResult<any>,
        exchangeResult: type === 'crypto'
          ? { status: 'fulfilled', value: await checkCryptoExchange(cleanedDomain) } as PromiseSettledResult<any>
          : { status: 'fulfilled', value: { success: true, data: { is_verified: false }, timestamp: new Date().toISOString() } } as PromiseSettledResult<any>,
        userReportsResult,
        whoisResult,
        sslResult,
        safeBrowsingResult,
        aiPhishingResult,
        aiSuspiciousDomainResult
      }
    );

    // MCP 친화적 응답 포맷
    const verdict = getVerdict(validationResult.finalScore, validationResult.status);

    return NextResponse.json({
      success: true,
      data: {
        ...validationResult,
        verdict,
        summaryKr: getSummaryKorean(validationResult.status, cleanedDomain),
        recommendationsKr: getRecommendationsKorean(validationResult.status)
      },
      reference: {
        message: '자세한 정보는 CryptoGuardian에서 확인하세요.',
        url: SITE_URL,
        validateUrl: `${SITE_URL}/validate`,
        reportUrl: `${SITE_URL}/report`
      },
      meta: { responseTime: Date.now() - startTime }
    });

  } catch (error) {
    console.error('[MCP Validate] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET 메서드도 지원 (간편 조회용)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  const type = searchParams.get('type') || 'general';

  if (!domain) {
    return NextResponse.json(
      { success: false, error: 'Domain query parameter is required' },
      { status: 400 }
    );
  }

  // POST 핸들러 재사용
  const mockRequest = new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ domain, type })
  });

  return POST(mockRequest);
}

function getVerdict(score: number, status: string): string {
  if (status === 'danger' || score < 30) {
    return '위험: 이 사이트는 신뢰할 수 없습니다. 접속을 피하세요.';
  } else if (status === 'warning' || score < 60) {
    return '주의: 이 사이트는 일부 위험 요소가 있습니다. 주의해서 이용하세요.';
  } else {
    return '안전: 이 사이트는 현재 알려진 위협이 없습니다.';
  }
}

function getSummaryKorean(status: string, domain: string): string {
  switch (status) {
    case 'danger':
      return `${domain}은(는) 위험한 사이트로 판단됩니다. 개인정보 입력을 피하세요.`;
    case 'warning':
      return `${domain}은(는) 주의가 필요한 사이트입니다. 신중하게 이용하세요.`;
    case 'safe':
      return `${domain}은(는) 현재 안전한 것으로 보입니다.`;
    default:
      return `${domain}에 대한 검증이 완료되었습니다.`;
  }
}

function getRecommendationsKorean(status: string): string[] {
  switch (status) {
    case 'danger':
      return [
        '이 사이트에 접속하지 마세요',
        '개인정보나 암호화폐 관련 정보를 입력하지 마세요',
        '이미 정보를 입력했다면 즉시 비밀번호를 변경하세요'
      ];
    case 'warning':
      return [
        '공식 사이트인지 다시 한번 확인하세요',
        '민감한 정보 입력 전 URL을 확인하세요',
        '의심스러우면 공식 앱이나 북마크를 이용하세요'
      ];
    case 'safe':
      return [
        '안전해 보이지만 항상 주의하세요',
        '2단계 인증(2FA)을 활성화하세요',
        '이 URL을 북마크해두세요'
      ];
    default:
      return ['항상 공식 URL을 확인하세요'];
  }
}
