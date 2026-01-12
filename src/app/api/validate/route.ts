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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, type = 'general', language } = body; // type can be 'general' or 'crypto'

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Store original input for display
    const originalInput = domain;

    // Clean domain (preserve case for visual similarity detection)
    const cleanedDomain = cleanDomain(domain);

    // 1. 블랙리스트 검사 (여기서 걸리면 즉시 반환)
    console.log('1. 블랙리스트 검사 시작');
    const blacklistApiResponse = await checkDomainBlacklist(cleanedDomain);

    if (blacklistApiResponse.success && blacklistApiResponse.data?.isBlacklisted) {
      // 블랙리스트에 있으면 maliciousSite 정보만으로 바로 결과 반환
      console.log('Domain is blacklisted, returning immediately');

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

      const validationResult = {
        domain: cleanedDomain,
        originalInput,
        finalScore: 0,
        status: 'danger' as const,
        checks: {
          maliciousSite: maliciousSiteCheck
        },
        summary: `${cleanedDomain} is blacklisted and dangerous.`,
        recommendations: [
          'Do not trust this site',
          'Avoid entering any personal information on this site'
        ],
        timestamp: new Date().toISOString()
      };

      return NextResponse.json(validationResult);
    }

    // 2. 암호화폐 거래소 검사 (crypto 타입만, 검증된 거래소면 바로 반환)
    if (type === 'crypto') {
      console.log('2. 암호화폐 거래소 검사 시작');
      const exchangeApiResponse = await checkCryptoExchange(cleanedDomain);

      if (exchangeApiResponse.success && exchangeApiResponse.data?.is_verified) {
        // 검증된 거래소이면 exchange 정보만으로 바로 결과 반환
        console.log('Domain is verified exchange, returning immediately');

        const exchangeCheck = {
          name: 'Exchange Verification',
          passed: true,
          score: 100,
          weight: 1.0,
          message: `Verified exchange: ${exchangeApiResponse.data.name}`,
          details: exchangeApiResponse.data
        };

        const validationResult = {
          domain: cleanedDomain,
          originalInput,
          finalScore: 100,
          status: 'safe' as const,
          checks: {
            exchange: exchangeCheck
          },
          summary: `${cleanedDomain} is a verified cryptocurrency exchange.`,
          recommendations: ['This is a recognized cryptocurrency exchange.'],
          timestamp: new Date().toISOString()
        };

        return NextResponse.json(validationResult);
      }
    }

    // 3. 일반 보안 검사 (블랙리스트 없고, 검증된 거래소 아닌 경우)
    console.log('3. 일반 검사');

    const allChecks = [
      checkUserReports(cleanedDomain),
      whoisLookup(cleanedDomain),
      checkSSL(cleanedDomain),
      checkSafeBrowsing(cleanedDomain),
      analyzePhishingPatterns(cleanedDomain),  // Now async - loads from DB
      Promise.resolve(analyzeSuspiciousDomain(cleanedDomain)),
    ];

    // Execute all checks and extract results in correct order
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

    return NextResponse.json(validationResult);
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
