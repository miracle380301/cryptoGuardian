import { NextRequest, NextResponse } from 'next/server';
import { WhoisAPI } from '@/lib/apis/whois';
import { SSLCheckAPI } from '@/lib/apis/ssl-check';
import { PhishingReportCheckAPI } from '@/lib/apis/reputation-check';
import { CoinGeckoAPI } from '@/lib/apis/coingecko';
import { SafeBrowsingAPI } from '@/lib/apis/safe-browsing';
import { translateMessage, translateSummary } from '@/lib/i18n/translateMessage';
// Note: Enhanced scam detection modules are temporarily disabled
// import { TeamScamDetector } from '@/lib/apis/team-scam-detector';
// import { CryptoExchangeDetector } from '@/lib/apis/crypto-exchange-detector';
// import { KoreanCryptoScamDetector } from '@/lib/apis/korean-crypto-scam-detector';
import { ValidationResult, ValidationCheck } from '@/types/api.types';
import { checkBlacklist } from '@/lib/db/services';
import { checkUserReports } from '@/lib/apis/user-reports';
import prisma from '@/lib/db/prisma';

// Initialize APIs
const whoisAPI = new WhoisAPI();
const sslAPI = new SSLCheckAPI();
const reputationAPI = new PhishingReportCheckAPI();
const coinGeckoAPI = new CoinGeckoAPI();
const safeBrowsingAPI = new SafeBrowsingAPI();
// Note: Enhanced scam detection APIs are temporarily disabled
// const teamScamDetector = new TeamScamDetector();
// const cryptoExchangeDetector = new CryptoExchangeDetector();
// const koreanCryptoScamDetector = new KoreanCryptoScamDetector();

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
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    // Get request info for tracking
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    // Get language preference (body > URL params > headers)
    const acceptLanguage = request.headers.get('accept-language') || '';
    const urlParams = new URL(request.url).searchParams;
    const langParam = urlParams.get('lang') || urlParams.get('language');
    const currentLang = (language || langParam || (acceptLanguage.includes('ko') ? 'ko' : 'en')) as 'ko' | 'en';

    // 1. Blacklist check
    let [blacklisted] = await Promise.all([
      checkBlacklist(cleanDomain.toLowerCase()),
      //checkWhitelist(cleanDomain.toLowerCase())
    ]);

    // 없으면 Reputation API 호출해서 실시간 검사 후 DB 저장
    if (!blacklisted) {
      console.log('3-2. Blacklist not found, calling reputation API');
      await reputationAPI.checkPhishingReports(cleanDomain);

      // API에서 악성 감지되면 DB에 저장되므로 다시 체크
      blacklisted = await checkBlacklist(cleanDomain.toLowerCase());
      console.log('@@@ 3-1. Blacklist DB found', blacklisted);
    } else {
      console.log('3-1. Blacklist DB found:', blacklisted);
    }

    if (blacklisted) {

      const blacklistResult: ValidationResult = {
        domain: cleanDomain,
        originalInput: originalInput,
        finalScore: 0, // CRITICAL: Absolute minimum score for confirmed threats
        status: 'danger', // MAXIMUM DANGER - confirmed malicious
        checks: {
          maliciousSite: {
            name: 'Malicious Site Check',
            passed: false,
            score: 0,
            weight: 0.3,
            message: `Blacklisted: ${(blacklisted as any).reportedBy || blacklisted.reportedBy || 'Security Database'}`,
            details: {
              isReported: true,
              score: 0,
              severity: blacklisted.severity,
              category: (blacklisted as any).category || 'malicious',
              dataSources: (blacklisted as any).dataSources || ['Internal Database'],
              evidenceUrls: blacklisted.evidence || [],
              kisaId: (blacklisted as any).kisaId,
              verificationStatus: (blacklisted as any).verificationStatus || 'confirmed',
              // 블랙리스트 증거 정보
              maliciousSite: {
                reason: blacklisted.reason,
                severity: blacklisted.severity,
                reportDate: (blacklisted as any).reportDate,
                reportedBy: blacklisted.reportedBy || 'Security Database',
                riskLevel: (blacklisted as any).riskLevel || 'high',
                targetBrand: (blacklisted as any).targetBrand,
                description: (blacklisted as any).description,
                isConfirmed: (blacklisted as any).isConfirmed || true
              }
            }
          }
        },
        summary: (blacklisted as any).targetBrand ?
          `CRITICAL THREAT: ${cleanDomain} is a CONFIRMED ${(blacklisted as any).targetBrand} impersonation site (${blacklisted.severity} risk) - IMMEDIATE DANGER` :
          `MAXIMUM DANGER: ${cleanDomain} is BLACKLISTED as ${blacklisted.severity} risk - ${blacklisted.reason}`,
        recommendations: (() => {
          const sources = [];
          // 여러 소스 처리
          if ((blacklisted as any).reportedBy) {
            sources.push((blacklisted as any).reportedBy);
          }
          if ((blacklisted as any).sources && Array.isArray((blacklisted as any).sources)) {
            sources.push(...(blacklisted as any).sources);
          }

          // 중복 제거
          const uniqueSources = [...new Set(sources)];

          // 항상 영어로 sourceText 생성 (translateMessage에서 번역됨)
          const sourceText = uniqueSources.length > 1 ?
            `${uniqueSources.slice(0, -1).join(', ')} and ${uniqueSources.slice(-1)}` :
            uniqueSources[0] || 'Security Database';

          // 기본 영어 권장사항들을 생성 후 translateMessage로 번역
          const baseRecommendations: string[] = [];

          baseRecommendations.push(`Malicious Site Detected: ${sourceText} ${uniqueSources.length > 1 ? 'have' : 'has'} flagged this domain`);

          baseRecommendations.push((blacklisted as any).targetBrand ?
            `Impersonation Alert: This site is impersonating ${(blacklisted as any).targetBrand}` :
            'Avoid entering any personal information on this site');

          baseRecommendations.push((blacklisted as any).riskLevel === 'phishing' ?
            'Phishing site - designed to steal your credentials' :
            (blacklisted as any).riskLevel === 'crypto-scam' ?
            'Cryptocurrency scam - may steal your crypto assets' :
            'Malicious activity detected - exercise extreme caution');

          if (uniqueSources.length > 1) {
            baseRecommendations.push(`Multiple security agencies confirm this threat (${uniqueSources.length} sources)`);
          }

          // 언어에 따라 번역 또는 원본 반환
          const recommendations = currentLang === 'en'
            ? baseRecommendations
            : baseRecommendations.map(rec => translateMessage(rec, currentLang));

          return recommendations;
        })(),
        timestamp: new Date().toISOString()
      };

      // Blacklist detection - no need to save additional history

      // IMMEDIATE RETURN: No further security checks needed
      // Blacklisted domains are confirmed threats with maximum danger level
      return NextResponse.json(blacklistResult);
    }

    console.log('=================================');

    // Check Exchange database for legitimate crypto exchanges (only for crypto type)
    let exchangeResult: PromiseSettledResult<any> = { status: 'rejected' as const, reason: new Error('No exchange found') };
    let shouldSkipOtherChecks = false;

    // Only check for legitimate exchanges if type is 'crypto'
    if (type === 'crypto') {
      const exchangeResults = await Promise.allSettled([coinGeckoAPI.checkExchange(cleanDomain, 'url')]);
      exchangeResult = exchangeResults[0];
    }

    // If this is a verified exchange (only for crypto type), skip security checks
    if (type === 'crypto' &&
        exchangeResult.status === 'fulfilled' &&
        exchangeResult.value.success &&
        exchangeResult.value.data) {
      shouldSkipOtherChecks = true;
      console.log(`🚀 Exchange found in database: ${exchangeResult.value.data.name} - Skipping other checks`);
    }

    let basicResults: PromiseSettledResult<any>[];
    // let cryptoResults: PromiseSettledResult<any>[] = []; // Temporarily disabled

    if (shouldSkipOtherChecks) {
      // For verified exchanges, skip all checks
      const dummyRejected = { status: 'rejected' as const, reason: new Error('Skipped - verified exchange') };
      basicResults = [
        dummyRejected, // whois
        dummyRejected, // ssl
        dummyRejected, // reputation
        dummyRejected  // safeBrowsing
      ];
    } else {
      // Check if we have cached whois/ssl data in whiteDomain
      const whitelistEntry = await prisma.whitelistedDomain.findUnique({
        where: { domain: cleanDomain }
      }) as any;

      // Check if we have cached data
      const hasValidWhoisCache = whitelistEntry?.whoisData;
      const hasValidSSLCache = whitelistEntry?.sslData;

      // Log cache status
      console.log(`[${cleanDomain}] WHOIS: ${hasValidWhoisCache ? '📦 Using DB cache' : '🌐 Calling API'}`);
      console.log(`[${cleanDomain}] SSL: ${hasValidSSLCache ? '📦 Using DB cache' : '🌐 Calling API'}`);
      console.log(`[${cleanDomain}] SafeBrowsing: 🌐 Always calling API (real-time check)`);

      // Prepare checks - use cached data or make API calls
      const basicChecks = [
        hasValidWhoisCache ?
          Promise.resolve(whitelistEntry.whoisData) :
          whoisAPI.lookup(cleanDomain),
        hasValidSSLCache ?
          Promise.resolve(whitelistEntry.sslData) :
          sslAPI.checkSSL(cleanDomain),
        safeBrowsingAPI.checkUrl(cleanDomain), // Always call safeBrowsing for real-time check
        checkUserReports(cleanDomain) // Check user reports
      ];

      basicResults = await Promise.allSettled(basicChecks);

      // Store whois and SSL results to whiteDomain if they are fresh API calls (not from cache)
      try {
        const whoisData = !hasValidWhoisCache && basicResults[0]?.status === 'fulfilled' ? basicResults[0].value : null;
        const sslData = !hasValidSSLCache && basicResults[1]?.status === 'fulfilled' ? basicResults[1].value : null;

        // Store whois data if we have it
        if (whoisData) {
          if (whitelistEntry) {
            // Update existing whitelist entry
            await prisma.whitelistedDomain.update({
              where: { domain: cleanDomain },
              data: {
                whoisData: whoisData,
                lastWhoisCheck: new Date()
              } as any
            });
          } else {
            // Create new whitelist entry for whois data
            await prisma.whitelistedDomain.create({
              data: {
                domain: cleanDomain,
                name: cleanDomain,
                category: 'unknown',
                whoisData: whoisData,
                lastWhoisCheck: new Date()
              } as any
            });
          }
        }

        // Store SSL data if we have it
        if (sslData) {
          if (whitelistEntry) {
            // Update existing whitelist entry
            await prisma.whitelistedDomain.update({
              where: { domain: cleanDomain },
              data: {
                sslData: sslData,
                lastSSLCheck: new Date()
              } as any
            });
          } else {
            // Create new whitelist entry for SSL data (or update if created above)
            await prisma.whitelistedDomain.upsert({
              where: { domain: cleanDomain },
              update: {
                sslData: sslData,
                lastSSLCheck: new Date()
              } as any,
              create: {
                domain: cleanDomain,
                name: cleanDomain,
                category: 'unknown',
                sslData: sslData,
                lastSSLCheck: new Date()
              } as any
            });
          }
        }
      } catch (error) {
        // Log error but don't fail the main validation
        console.error('Failed to store whois/ssl data to whiteDomain:', error);
      }
    }

    const results = [...basicResults, exchangeResult];

    // Extract results in order
    const [
      whoisResult,
      sslResult,
      safeBrowsingResult,
      userReportsResult
    ] = [
      results[0],
      results[1],
      results[2],
      results[3]
    ];

    // Exchange result is already set above
    // Enhanced crypto scam detection checks are temporarily disabled
    // const teamScamResult = { status: 'rejected' as const, reason: new Error('Temporarily disabled') };
    // const cryptoExchangeResult = { status: 'rejected' as const, reason: new Error('Temporarily disabled') };
    // const koreanCryptoScamResult = { status: 'rejected' as const, reason: new Error('Temporarily disabled') };

    // Process results and calculate scores
    const validationResult = processValidationResults(
      cleanDomain,
      originalInput,
      whoisResult,
      sslResult,
      exchangeResult,
      safeBrowsingResult,
      userReportsResult,
      // teamScamResult, cryptoExchangeResult, koreanCryptoScamResult - temporarily disabled
      shouldSkipOtherChecks,
      currentLang
    );

    // AUTO-BLACKLISTING: If domain is detected as malicious, add to blacklist
    // This helps build our threat database automatically
    if (validationResult.status === 'danger' && validationResult.finalScore < 30) {
      // Don't await - do this async in background
      autoBlacklistMaliciousDomain(
        cleanDomain,
        validationResult,
        { status: 'rejected' as const, reason: new Error('Reputation API disabled') },
        safeBrowsingResult
      ).catch(err => console.error('Auto-blacklist error:', err));
    }

    // No need to save validation history

    return NextResponse.json(validationResult);
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function processValidationResults(
  domain: string,
  originalInput: string,
  whoisResult: PromiseSettledResult<any>,
  sslResult: PromiseSettledResult<any>,
  exchangeResult: PromiseSettledResult<any>,
  safeBrowsingResult: PromiseSettledResult<any>,
  userReportsResult: PromiseSettledResult<any>,
  // teamScamResult, cryptoExchangeResult, koreanCryptoScamResult: temporarily disabled
  shouldSkipOtherChecks: boolean = false,
  currentLang: 'ko' | 'en' = 'en'
): ValidationResult {
  const checks: ValidationResult['checks'] = shouldSkipOtherChecks ? {
    // For verified exchanges, create skipped check objects
    whois: {
      name: 'Domain Registration',
      passed: true,
      score: 100,
      weight: 0,
      message: 'Skipped - Exchange verified from trusted database'
    },
    ssl: {
      name: 'SSL Certificate',
      passed: true,
      score: 100,
      weight: 0,
      message: 'Skipped - Exchange verified from trusted database'
    },
    maliciousSite: {
      name: 'Malicious Site Check',
      passed: true,
      score: 100,
      weight: 0,
      message: 'Skipped - Exchange verified from trusted database'
    },
    safeBrowsing: {
      name: 'Safe Browsing',
      passed: true,
      score: 100,
      weight: 0,
      message: 'Skipped - Exchange verified from trusted database'
    },
    userReports: {
      name: 'User Reports Check',
      passed: true,
      score: 100,
      weight: 0,
      message: 'Skipped - Exchange verified from trusted database'
    }
  } : {
    // For unverified sites, show all checks (malicious site check first)
    maliciousSite: {
      name: 'Malicious Site Check',
      passed: true,
      score: 100,
      weight: 0.35,
      message: 'No malicious patterns detected in database',
      details: { isReported: false }
    },
    whois: processWhoisCheck(whoisResult),
    ssl: processSSLCheck(sslResult),
    safeBrowsing: processSafeBrowsingCheck(safeBrowsingResult),
    userReports: processUserReportsCheck(userReportsResult, currentLang)
  };

  // Add exchange check if applicable (always check for legitimate exchanges)
  if (exchangeResult.status === 'fulfilled' && exchangeResult.value.success && exchangeResult.value.data) {
    checks.exchange = processExchangeCheck(exchangeResult);
  }

  // Note: Enhanced crypto scam detection checks are temporarily disabled
  // They would go here if enabled:
  // - teamScam: processTeamScamCheck(teamScamResult)
  // - cryptoExchange: processCryptoExchangeCheck(cryptoExchangeResult)
  // - koreanCryptoScam: processKoreanCryptoScamCheck(koreanCryptoScamResult)

  // Calculate final score - Different weights based on whether other checks were skipped
  const weights = shouldSkipOtherChecks ? {
    // For verified exchanges - no individual checks, score handled separately
    exchange: 0,          // Exchange Verification (handled separately)
    whois: 0,
    reputation: 0,
    ssl: 0,
    safeBrowsing: 0,
    teamScam: 0,
    cryptoExchange: 0,
    koreanCryptoScam: 0
  } : {
    // For unverified sites - full security checks (malicious site check prioritized)
    maliciousSite: 0.35,   // Malicious Site Check (35% - highest priority)
    whois: 0.25,           // Domain Registration (25%)
    ssl: 0.20,            // SSL Certificate (20%)
    safeBrowsing: 0.10,   // Safe Browsing (10%)
    userReports: 0.10,    // User Reports Check (10%)
    exchange: 0,          // Exchange Verification (0% - disabled)
    teamScam: 0,          // Team Scam Detection (0% - disabled)
    cryptoExchange: 0,    // Crypto Exchange Impersonation (0% - disabled)
    koreanCryptoScam: 0   // Korean Crypto Scam (0% - disabled)
  };

  let totalWeight = 0;
  let weightedScore = 0;

  Object.entries(checks).forEach(([key, check]) => {
    const weight = weights[key as keyof typeof weights] || 0;
    totalWeight += weight;
    weightedScore += check.score * weight;
  });

  let finalScore = shouldSkipOtherChecks ? 95 :
    totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 50; // Default score if no weights

  // For verified exchanges, set high score directly
  if (shouldSkipOtherChecks) {
    // High score for verified exchanges
    finalScore = 95;
  }

  // Determine status
  let status: 'safe' | 'warning' | 'danger';
  if (finalScore >= 80) status = 'safe';
  else if (finalScore >= 50) status = 'warning';
  else status = 'danger';

  // Generate recommendations
  const recommendations = generateRecommendations(checks, finalScore, currentLang);

  return {
    domain,
    originalInput,
    finalScore,
    status,
    checks,
    summary: generateSummary(domain, finalScore, status, checks, currentLang),
    recommendations,
    timestamp: new Date().toISOString()
  };
}

function processWhoisCheck(result: PromiseSettledResult<any>): ValidationCheck {
  if (result.status === 'rejected' || !result.value.success) {
    return {
      name: 'Domain Registration',
      passed: false,
      score: 0,
      weight: 0.2,
      message: 'Unable to verify domain registration',
      details: { error: result.status === 'rejected' ? result.reason : result.value.error }
    };
  }

  const data = result.value.data;
  const domainAgeDays = data.domain_age_days || 0;

  // 1. Domain Age Score (30% weight)
  let ageScore = 0;
  let ageMessage = '';

  if (domainAgeDays > 730) { // 2+ years
    ageScore = 100;
    ageMessage = `Established domain (${Math.floor(domainAgeDays / 365)} years old)`;
  } else if (domainAgeDays > 365) { // 1-2 years
    ageScore = 85;
    ageMessage = `Domain registered ${Math.floor(domainAgeDays / 365)} year ago`;
  } else if (domainAgeDays > 180) { // 6-12 months
    ageScore = 70;
    ageMessage = `Domain registered ${domainAgeDays} days ago`;
  } else if (domainAgeDays > 90) { // 3-6 months
    ageScore = 50;
    ageMessage = `Relatively new domain (${domainAgeDays} days old)`;
  } else if (domainAgeDays > 30) { // 1-3 months
    ageScore = 30;
    ageMessage = `New domain (${domainAgeDays} days old)`;
  } else { // Less than 1 month
    ageScore = 10;
    ageMessage = `Very new domain (${domainAgeDays} days old)`;
  }

  // 2. Domain Status Score (70% weight)
  const statusResult = calculateDomainStatusScoreV2(data.status || []);

  // Combine scores: 30% age + 70% status
  const finalScore = Math.round((ageScore * 0.3) + (statusResult.score * 0.7));

  // Build message
  let message = ageMessage;
  if (statusResult.statusMessages.length > 0) {
    message += `\nStatus: ${statusResult.statusMessages.join(', ')}`;
  }

  return {
    name: 'Domain Registration',
    passed: finalScore >= 60,
    score: finalScore,
    weight: 0.2,
    message,
    details: {
      ...data,
      scoring: {
        ageScore,
        statusScore: statusResult.score,
        ageWeight: 0.3,
        statusWeight: 0.7
      }
    }
  };
}

function processSSLCheck(result: PromiseSettledResult<any>): ValidationCheck {
  if (result.status === 'rejected' || !result.value.success) {
    return {
      name: 'SSL Certificate',
      passed: false,
      score: 0,
      weight: 0.2,
      message: 'SSL verification failed',
      details: { error: result.status === 'rejected' ? result.reason : result.value.error }
    };
  }

  const data = result.value.data;

  if (!data.hasSSL) {
    return {
      name: 'SSL Certificate',
      passed: false,
      score: 0,
      weight: 0.2,
      message: 'No SSL certificate found - Site is not secure',
      details: data
    };
  }

  // Use the score from the SSL check if available
  const score = data.score || (data.valid ? 70 : 0);

  // Build message based on score and breakdown
  let message = '';
  if (!data.valid) {
    message = 'Invalid SSL certificate';
  } else if (data.scoreBreakdown && data.scoreBreakdown.length > 0) {
    message = `✓ SSL Grade: ${data.grade}\n${data.scoreBreakdown.join('\n')}`;
  } else if (data.grade) {
    message = `✓ Valid SSL certificate (Grade: ${data.grade})`;
  } else {
    message = '✓ Valid SSL certificate';
  }

  // Add additional info if available
  if (data.protocol) {
    message += `\nProtocol: ${data.protocol}`;
  }
  if (data.issuer) {
    message += `\nIssuer: ${data.issuer}`;
  }
  if (data.daysRemaining !== undefined) {
    if (data.daysRemaining < 30) {
      message += `\nExpires in ${data.daysRemaining} days`;
    } else {
      message += `\nValid for ${data.daysRemaining} days`;
    }
  }

  return {
    name: 'SSL Certificate',
    passed: score >= 60,
    score,
    weight: 0.2,
    message,
    details: data
  };
}

function processMaliciousSiteCheck(result: PromiseSettledResult<any>, currentLang: 'ko' | 'en' = 'en'): ValidationCheck {
  // Debug logging
  console.log('processMaliciousSiteCheck result:', {
    status: result.status,
    success: result.status === 'fulfilled' ? result.value?.success : 'N/A',
    data: result.status === 'fulfilled' ? result.value?.data : 'N/A'
  });

  if (result.status === 'rejected' || !result.value.success) {
    console.log('Reputation check failed:', result.status === 'rejected' ? result.reason : result.value.error);
    return {
      name: 'Reputation Check',
      passed: false,
      score: 50,
      weight: 0.3,
      message: 'Unable to verify reputation status',
      details: { error: result.status === 'rejected' ? result.reason : result.value.error }
    };
  }

  const data = result.value.data;
  const score = data.score;

  let message = '';
  if (data.isReported) {
    // Show simple summary message only
    const detectedSources: string[] = [];

    if (data.details && Array.isArray(data.details)) {
      data.details.forEach((detail: any) => {
        if (detail.isReported) {
          detectedSources.push(detail.source);
        }
      });
    }

    // Show detailed information when threats are detected
    if (detectedSources.length > 0) {
      message = `Threats detected in ${detectedSources.length} database(s):\n`;

      // Add detailed information from each source
      if (data.details && Array.isArray(data.details)) {
        const reportedDetails = data.details.filter((detail: any) => detail.isReported);
        reportedDetails.forEach((detail: any, index: number) => {
          message += `\n${index + 1}. ${detail.source}: ${detail.details}`;
          if (detail.confidence) {
            message += ` (Confidence: ${detail.confidence}%)`;
          }
        });
      }

      // Add "다음에서 탐지됨" section
      if (detectedSources.length > 0) {
        message += `\n\n다음에서 탐지됨: ${detectedSources.join(', ')}`;
      }
    } else {
      message = 'Domain is blacklisted';
    }
  } else if (score >= 90) {
    message = translateMessage('Excellent reputation - No threats detected across all security databases', currentLang) + '\n';
    if (data.details && Array.isArray(data.details)) {
      message += `Checked ${data.details.length} security databases: ${data.details.map((d: any) => d.source).join(', ')}`;
    }
  } else if (score >= 70) {
    message = translateMessage('Good reputation - Clean across all security databases', currentLang) + '\n';
    if (data.details && Array.isArray(data.details)) {
      message += `Verified by ${data.details.length} sources`;
    }
  } else if (score >= 50) {
    message = translateMessage('Mixed reputation - Some minor concerns detected', currentLang) + '\n';
    if (data.details && Array.isArray(data.details)) {
      const concerns = data.details.filter((d: any) => d.riskLevel === 'suspicious');
      if (concerns.length > 0) {
        message += `Suspicious indicators: ${concerns.map((c: any) => c.source).join(', ')}`;
      }
    }
  } else {
    message = 'Poor reputation - Multiple risk indicators detected\n';
    if (data.details && Array.isArray(data.details)) {
      const risks = data.details.filter((d: any) => d.riskLevel === 'suspicious' || d.riskLevel === 'malicious');
      if (risks.length > 0) {
        message += `Risk sources: ${risks.map((r: any) => r.source).join(', ')}`;
      }
    }
  }

  // evidenceUrls 추가
  const details = {
    ...data,
    evidenceUrls: data.evidenceUrls || []
  };

  return {
    name: 'Reputation Check',
    passed: !data.isReported && score >= 50,
    score,
    weight: 0.3,
    message,
    details: {
      ...details,
      // 상세 정보 추가
      sources: data.details ? data.details.map((d: any) => {
        // 각 소스별 점수 계산
        let sourceScore = 100; // 기본값
        if (d.isReported) {
          if (d.riskLevel === 'malicious') {
            sourceScore = 0;
          } else if (d.riskLevel === 'suspicious') {
            sourceScore = 30;
          } else {
            sourceScore = 50;
          }
        }

        return {
          source: d.source,
          isReported: d.isReported,
          details: d.details,
          confidence: d.confidence,
          score: sourceScore,
          riskLevel: d.riskLevel || 'clean',
          reportDate: d.reportDate
        };
      }) : [],
      totalSources: data.details ? data.details.length : 0,
      reportedSources: data.details ? data.details.filter((d: any) => d.isReported).length : 0
    }
  };
}

function processExchangeCheck(result: PromiseSettledResult<any>): ValidationCheck {
  if (result.status === 'rejected') {
    return {
      name: 'Exchange Verification',
      passed: false,
      score: 50,
      weight: 0.04,
      message: 'Exchange verification failed',
      details: { error: result.reason }
    };
  }

  const data = result.value.data;

  // High trust score for verified exchanges
  const trustScore = data.trust_score * 10; // Convert 1-10 to 0-100

  let message = `Verified exchange: ${data.name} (Trust rank #${data.trust_score_rank})`;

  if (data.alert_notice) {
    message += ` - Alert: ${data.alert_notice}`;
  }

  return {
    name: 'Exchange Verification',
    passed: data.is_verified,
    score: trustScore,
    weight: 0.1,
    message,
    details: data
  };
}

function processSafeBrowsingCheck(result: PromiseSettledResult<any>): ValidationCheck {
  if (result.status === 'rejected' || !result.value.success) {
    return {
      name: 'Safe Browsing',
      passed: true,
      score: 75,
      weight: 0.2,
      message: ' Unable to verify with Google Safe Browsing',
      details: { error: result.status === 'rejected' ? result.reason : result.value.error }
    };
  }

  const data = result.value.data;

  // Handle case where data is null or undefined
  if (!data) {
    return {
      name: 'Google Safe Browsing',
      passed: false,
      score: 50,
      weight: 0.3,
      message: 'Safe browsing data unavailable',
      details: { error: 'No data returned from Safe Browsing API' }
    };
  }

  // Use the calculated score from the Safe Browsing API
  const score = data.score !== undefined ? data.score : (data.safe ? 100 : 0);

  // Build message based on score and breakdown
  let message = '';
  if (data.safe && score >= 70) {
    message = 'No threats detected';
  } else if (data.threats && data.threats.length > 0) {
    const threatTypes = data.threats.map((t: any) => t.threatType).join(', ');
    message = `Threats detected: ${threatTypes}`;
  } else {
    message = 'Suspicious patterns detected';
  }

  // Add score breakdown if available
  if (data.scoreBreakdown && data.scoreBreakdown.length > 0) {
    message += `\n${data.scoreBreakdown.join('\n')}`;
  }

  // Add threat details if any
  if (data.threats && data.threats.length > 0) {
    const threatDetails = data.threats.map((t: any) => `${t.threatType} (${t.platformType})`);
    message += `\nThreat details: ${threatDetails.join(', ')}`;
  }

  return {
    name: 'Safe Browsing',
    passed: score >= 70, // Consider passed if score >= 70
    score,
    weight: 0.2,
    message,
    details: data
  };
}

function generateSummary(domain: string, score: number, status: string, checks: any, currentLang: 'ko' | 'en' = 'en'): string {
  if (currentLang === 'en') {
    // 영어면 그냥 원본 영어 summary 생성
    if (status === 'safe') {
      if (checks.exchange) {
        return `${domain} is a verified cryptocurrency exchange with excellent security credentials.`;
      }
      return `${domain} appears to be safe with a trust score of ${score}/100.`;
    } else if (status === 'warning') {
      return `${domain} has some concerns. Proceed with caution (score: ${score}/100).`;
    } else {
      return `${domain} has significant security risks. Not recommended (score: ${score}/100).`;
    }
  }

  const isExchange = !!checks.exchange;
  return translateSummary(domain, score, status, isExchange, currentLang);
}

/* Legacy function - kept for reference but not used
function _calculateDomainStatusScore(statuses: string[]): { adjustment: number; statusMessages: string[] } {
  let adjustment = 0;
  const statusMessages: string[] = [];

  if (!statuses || statuses.length === 0) {
    return { adjustment: 0, statusMessages: [] };
  }

  // Convert to lowercase and join if it's an array
  const statusText = Array.isArray(statuses) ? statuses.join(' ').toLowerCase() : String(statuses).toLowerCase();

  // Critical issues (major score reduction)
  if (statusText.includes('client hold') || statusText.includes('clienthold')) {
    adjustment -= 30;
    statusMessages.push('Domain on hold (suspended)');
  }
  if (statusText.includes('server hold') || statusText.includes('serverhold')) {
    adjustment -= 40;
    statusMessages.push('Server hold (critical issue)');
  }
  if (statusText.includes('redemption period')) {
    adjustment -= 50;
    statusMessages.push('In redemption period (expired)');
  }
  if (statusText.includes('pending delete')) {
    adjustment -= 60;
    statusMessages.push('Pending deletion');
  }

  // Moderate issues (minor score reduction)
  if (statusText.includes('client update prohibited')) {
    adjustment -= 5;
    statusMessages.push('Updates restricted');
  }
  if (statusText.includes('server update prohibited')) {
    adjustment -= 5;
    statusMessages.push('Server updates restricted');
  }

  // Positive security measures (slight score boost)
  if (statusText.includes('client transfer prohibited') || statusText.includes('clienttransferprohibited')) {
    adjustment += 5;
    statusMessages.push('Transfer protection enabled');
  }
  if (statusText.includes('server transfer prohibited') || statusText.includes('servertransferprohibited')) {
    adjustment += 5;
    statusMessages.push('Server transfer protection');
  }

  // Normal status
  if (statusText.includes('ok') && statusMessages.length === 0) {
    statusMessages.push('Normal status');
  }

  return { adjustment, statusMessages };
}
*/

// New version with scoring system instead of adjustments
function calculateDomainStatusScoreV2(statuses: string[]): { score: number; statusMessages: string[] } {
  const statusMessages: string[] = [];

  if (!statuses || statuses.length === 0) {
    return { score: 50, statusMessages: ['No status information available'] };
  }

  // Convert to lowercase and join if it's an array
  const statusText = Array.isArray(statuses) ? statuses.join(' ').toLowerCase() : String(statuses).toLowerCase();

  // Start with base score
  let score = 100;
  let hasNegativeStatus = false;
  let hasProtectiveStatus = false;

  // Critical issues - Heavy penalties
  if (statusText.includes('clienthold') || statusText.includes('client hold')) {
    score -= 70; // Major red flag
    statusMessages.push('Domain on hold (suspended)');
    hasNegativeStatus = true;
  }

  if (statusText.includes('serverhold') || statusText.includes('server hold')) {
    score -= 80; // Very serious
    statusMessages.push('Server hold (critical issue)');
    hasNegativeStatus = true;
  }

  if (statusText.includes('redemptionperiod') || statusText.includes('redemption period')) {
    score -= 90; // Almost expired
    statusMessages.push('In redemption period (expired)');
    hasNegativeStatus = true;
  }

  if (statusText.includes('pendingdelete') || statusText.includes('pending delete')) {
    score -= 95; // About to be deleted
    statusMessages.push('Pending deletion');
    hasNegativeStatus = true;
  }

  // Moderate issues - Minor penalties
  if (statusText.includes('inactive')) {
    score -= 20;
    statusMessages.push('Domain inactive');
    hasNegativeStatus = true;
  }

  // Protective measures - Good signs
  if (statusText.includes('clienttransferprohibited') || statusText.includes('client transfer prohibited')) {
    if (!hasNegativeStatus) score += 10; // Only boost if no negative status
    statusMessages.push('✓ Transfer protection enabled');
    hasProtectiveStatus = true;
  }

  if (statusText.includes('clientdeleteprohibited') || statusText.includes('client delete prohibited')) {
    if (!hasNegativeStatus) score += 5;
    statusMessages.push('✓ Delete protection enabled');
    hasProtectiveStatus = true;
  }

  if (statusText.includes('servertransferprohibited') || statusText.includes('server transfer prohibited')) {
    if (!hasNegativeStatus) score += 5;
    statusMessages.push('✓ Registry-level transfer lock');
    hasProtectiveStatus = true;
  }

  // Normal/OK status
  if (statusText.includes('ok') || statusText.includes('active')) {
    if (statusMessages.length === 0) {
      statusMessages.push('✓ Normal status');
    }
  }

  // If we have protective measures but no negative status, ensure good score
  if (hasProtectiveStatus && !hasNegativeStatus && score < 80) {
    score = 80;
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // If no meaningful status found
  if (statusMessages.length === 0) {
    statusMessages.push('Standard registration status');
    score = 70; // Neutral score
  }

  return { score, statusMessages };
}

/* Temporarily disabled - Enhanced crypto scam detection
function _processTeamScamCheck(result: PromiseSettledResult<any>): ValidationCheck {
  if (result.status === 'rejected') {
    return {
      name: 'Team Scam Detection',
      passed: true,
      score: 100,
      weight: 0.1,
      message: 'Team scam detection unavailable',
      details: { error: result.reason }
    };
  }

  const data = result.value.data;

  // Convert to security score (invert the risk level)
  let score = 100;
  if (data.riskLevel === 'dangerous') {
    score = 0;
  } else if (data.riskLevel === 'suspicious') {
    score = 30;
  } else {
    score = 100;
  }

  let message = '';
  if (data.isTeamScam) {
    if (data.riskLevel === 'dangerous') {
      message = 'High probability of team scam mission detected';
    } else {
      message = 'Suspicious team scam patterns detected';
    }
    if (data.patterns.length > 0) {
      message += ` (${data.patterns.slice(0, 3).join(', ')})`;
    }
  } else {
    message = 'No team scam patterns detected';
  }

  return {
    name: 'Team Scam Detection',
    passed: !data.isTeamScam,
    score,
    weight: 0.1,
    message,
    details: data
  };
}
*/

/* Temporarily disabled - Enhanced crypto scam detection
function _processCryptoExchangeCheck(result: PromiseSettledResult<any>): ValidationCheck {
  if (result.status === 'rejected') {
    return {
      name: 'Exchange Impersonation Check',
      passed: true,
      score: 100,
      weight: 0.1,
      message: 'Exchange impersonation check unavailable',
      details: { error: result.reason }
    };
  }

  const data = result.value.data;

  // Convert to security score (invert the risk level)
  let score = 100;
  if (data.riskLevel === 'dangerous') {
    score = 0;
  } else if (data.riskLevel === 'suspicious') {
    score = 40;
  } else {
    score = 100;
  }

  let message = '';
  if (data.isImpersonation) {
    if (data.targetExchange) {
      message = `Possible ${data.targetExchange} impersonation detected`;
    } else {
      message = 'Crypto exchange impersonation detected';
    }
  } else {
    message = 'No exchange impersonation detected';
  }

  return {
    name: 'Exchange Impersonation Check',
    passed: !data.isImpersonation,
    score,
    weight: 0.1,
    message,
    details: data
  };
}
*/

/* Temporarily disabled - Enhanced crypto scam detection
function _processKoreanCryptoScamCheck(result: PromiseSettledResult<any>): ValidationCheck {
  if (result.status === 'rejected') {
    return {
      name: 'Korean Crypto Scam Check',
      passed: true,
      score: 100,
      weight: 0.05,
      message: 'Korean crypto scam check unavailable',
      details: { error: result.reason }
    };
  }

  const data = result.value.data;

  // Convert to security score (invert the risk level)
  let score = 100;
  if (data.riskLevel === 'dangerous') {
    score = 0;
  } else if (data.riskLevel === 'suspicious') {
    score = 35;
  } else {
    score = 100;
  }

  let message = '';
  if (data.isKoreanCryptoScam) {
    if (data.scamType) {
      message = `Korean crypto scam detected: ${data.scamType}`;
    } else {
      message = 'Korean crypto scam patterns detected';
    }
  } else {
    message = 'No Korean crypto scam patterns detected';
  }

  return {
    name: 'Korean Crypto Scam Check',
    passed: !data.isKoreanCryptoScam,
    score,
    weight: 0.05,
    message,
    details: data
  };
}
*/

function generateRecommendations(checks: any, score: number, currentLang: 'ko' | 'en' = 'en'): string[] {
  const baseRecommendations: string[] = [];

  if (score >= 80) {
    baseRecommendations.push('This site appears to be safe for use.');
    if (checks.exchange) {
      baseRecommendations.push('This is a recognized cryptocurrency exchange.');
    }
  }

  // Enhanced crypto scam specific recommendations
  if (checks.teamScam && !checks.teamScam.passed) {
    baseRecommendations.push('CRITICAL: Team scam mission detected - avoid at all costs.');
  }

  if (checks.cryptoExchange && !checks.cryptoExchange.passed) {
    baseRecommendations.push('CRITICAL: Cryptocurrency exchange impersonation detected.');
    if (checks.cryptoExchange.details?.legitimateUrl) {
      baseRecommendations.push(`Use the official site instead: ${checks.cryptoExchange.details.legitimateUrl}`);
    }
  }

  if (checks.koreanCryptoScam && !checks.koreanCryptoScam.passed) {
    baseRecommendations.push('WARNING: Korean cryptocurrency scam patterns detected.');
  }

  if (checks.ssl && !checks.ssl.passed) {
    baseRecommendations.push('Avoid entering sensitive information - no valid SSL certificate.');
  }

  if (checks.whois && (!checks.whois.passed || checks.whois.score < 50)) {
    baseRecommendations.push('Be cautious - this is a very new domain.');
  }

  if (checks.reputation && !checks.reputation.passed) {
    baseRecommendations.push('High risk - domain has poor reputation or is blacklisted.');
  }

  if (checks.safeBrowsing && !checks.safeBrowsing.passed) {
    baseRecommendations.push('Google Safe Browsing has detected threats on this site.');
  }

  if (score < 50) {
    baseRecommendations.push('Strongly recommend avoiding this site.');
    baseRecommendations.push('Consider using well-known exchanges like Binance, Coinbase, or Kraken.');
  }

  // Add specific crypto security recommendations
  if (checks.teamScam || checks.cryptoExchange || checks.koreanCryptoScam) {
    baseRecommendations.push('For crypto safety: Only use official exchange apps and websites.');
    baseRecommendations.push('Verify URLs through official social media or support channels.');
  }

  // 언어에 따라 번역 또는 원본 반환
  return currentLang === 'en'
    ? baseRecommendations
    : baseRecommendations.map(rec => translateMessage(rec, currentLang));
}

// Auto-blacklist malicious domains detected by APIs
async function autoBlacklistMaliciousDomain(
  domain: string,
  validationResult: ValidationResult,
  reputationResult: PromiseSettledResult<any>,
  safeBrowsingResult: PromiseSettledResult<any>
) {
  try {
    // Check if already blacklisted
    const existing = await prisma.blacklistedDomain.findUnique({
      where: { domain: domain.toLowerCase() }
    });

    if (existing) {
      console.log(`Domain ${domain} already in blacklist`);
      return;
    }

    // Determine the source and reason
    let source = 'Auto-detection';
    let reason = 'Multiple security threats detected';
    let category = 'malicious';
    let virusTotalScore = null;

    // Check if VirusTotal detected it
    if (reputationResult.status === 'fulfilled' &&
        reputationResult.value?.data?.details) {
      const details = reputationResult.value.data.details;

      // Find VirusTotal result
      const vtResult = details.find((d: any) => d.source === 'VirusTotal');
      if (vtResult && vtResult.isReported) {
        source = 'VirusTotal';
        const match = vtResult.details.match(/(\d+)\/(\d+)/);
        if (match) {
          virusTotalScore = parseInt(match[1]);
        }

        // Determine category based on detection
        if (vtResult.details.toLowerCase().includes('phish')) {
          category = 'phishing';
          reason = 'Phishing site detected by VirusTotal';
        } else if (vtResult.details.toLowerCase().includes('malware')) {
          category = 'malware';
          reason = 'Malware distribution detected by VirusTotal';
        } else {
          reason = vtResult.details;
        }
      }
    }

    // Check Google Safe Browsing
    if (safeBrowsingResult.status === 'fulfilled' &&
        safeBrowsingResult.value?.data?.threats?.length > 0) {
      const threat = safeBrowsingResult.value.data.threats[0];
      if (source === 'Auto-detection') {
        source = 'Google Safe Browsing';
      }

      if (threat.threatType === 'SOCIAL_ENGINEERING') {
        category = 'phishing';
        reason = 'Phishing/Social engineering detected';
      } else if (threat.threatType === 'MALWARE') {
        category = 'malware';
        reason = 'Malware detected';
      } else if (threat.threatType === 'UNWANTED_SOFTWARE') {
        category = 'malware';
        reason = 'Unwanted software distribution';
      }
    }

    // Create blacklist entry
    await prisma.blacklistedDomain.create({
      data: {
        domain: domain.toLowerCase(),
        reason,
        severity: validationResult.finalScore < 10 ? 'critical' :
                 validationResult.finalScore < 20 ? 'high' : 'medium',
        reportedBy: source,
        reportDate: new Date(),
        isActive: true,
        evidence: [
          `Final security score: ${validationResult.finalScore}/100`,
          `Detection source: ${source}`,
          validationResult.summary
        ],
        riskLevel: category === 'malware' ? 'critical' : 'high',
        category,
        dataSources: [source],
        verificationStatus: 'auto-detected',
        description: `Automatically blacklisted due to detection by ${source}. ${reason}`,
        isConfirmed: true,
        virusTotalDetections: virusTotalScore
      }
    });

    console.log(`✅ Auto-blacklisted ${domain} - Source: ${source}, Reason: ${reason}`);
  } catch (error) {
    console.error(`Failed to auto-blacklist ${domain}:`, error);
  }
}

function processUserReportsCheck(result: PromiseSettledResult<any>, currentLang: 'ko' | 'en' = 'en'): ValidationCheck {
  if (result.status === 'rejected') {
    return {
      name: 'User Reports Check',
      passed: true,
      score: 100,
      weight: 0.1,
      message: currentLang === 'ko' ? '사용자 신고 확인 불가' : 'User reports check unavailable',
      details: { error: result.reason }
    };
  }

  const data = result.value;
  const score = data.score;
  const isReported = data.isReported;

  let message = '';
  if (isReported) {
    if (currentLang === 'ko') {
      message = `${data.reportCount}건의 사용자 신고 (최근 30일)`;
    } else {
      message = `${data.reportCount} user report(s) in last 30 days`;
    }
  } else {
    message = currentLang === 'ko' ? '사용자 신고 없음' : 'No user reports';
  }

  return {
    name: 'User Reports Check',
    passed: !isReported,
    score,
    weight: 0.1,
    message,
    details: {
      userReports: data,
      isReported,
      reportCount: data.reportCount,
      recentReports: data.recentReports
    }
  };
}