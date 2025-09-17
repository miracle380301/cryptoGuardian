import { NextRequest, NextResponse } from 'next/server';
import { WhoisAPI } from '@/lib/apis/whois';
import { SSLCheckAPI } from '@/lib/apis/ssl-check';
import { PhishingReportCheckAPI } from '@/lib/apis/reputation-check';
import { CoinGeckoAPI } from '@/lib/apis/coingecko';
import { SafeBrowsingAPI } from '@/lib/apis/safe-browsing';
import { TeamScamDetector } from '@/lib/apis/team-scam-detector';
import { CryptoExchangeDetector } from '@/lib/apis/crypto-exchange-detector';
import { KoreanCryptoScamDetector } from '@/lib/apis/korean-crypto-scam-detector';
import { getCache } from '@/lib/cache/memory-cache';
import { ValidationResult, ValidationCheck } from '@/types/api.types';

// Initialize APIs
const whoisAPI = new WhoisAPI();
const sslAPI = new SSLCheckAPI();
const reputationAPI = new PhishingReportCheckAPI();
const coinGeckoAPI = new CoinGeckoAPI();
const safeBrowsingAPI = new SafeBrowsingAPI();
const teamScamDetector = new TeamScamDetector();
const cryptoExchangeDetector = new CryptoExchangeDetector();
const koreanCryptoScamDetector = new KoreanCryptoScamDetector();
const cache = getCache();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Clean domain (preserve case for visual similarity detection)
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    // Check cache (use lowercase for cache key)
    const cacheKey = `validation:${cleanDomain.toLowerCase()}`;
    const cachedResult = cache.get<ValidationResult>(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true
      });
    }

    // Perform all checks in parallel
    const [
      whoisResult,
      sslResult,
      reputationResult,
      exchangeResult,
      safeBrowsingResult,
      teamScamResult,
      cryptoExchangeResult,
      koreanCryptoScamResult
    ] = await Promise.allSettled([
      whoisAPI.lookup(cleanDomain),
      sslAPI.checkSSL(cleanDomain),
      reputationAPI.checkPhishingReports(cleanDomain),
      coinGeckoAPI.checkExchange(cleanDomain),
      safeBrowsingAPI.checkUrl(cleanDomain),
      teamScamDetector.detectTeamScam(cleanDomain, body.url),
      cryptoExchangeDetector.detectExchangeImpersonation(cleanDomain, body.url),
      koreanCryptoScamDetector.detectKoreanCryptoScam(cleanDomain, body.url)
    ]);

    // Process results and calculate scores
    const validationResult = processValidationResults(
      cleanDomain,
      whoisResult,
      sslResult,
      reputationResult,
      exchangeResult,
      safeBrowsingResult,
      teamScamResult,
      cryptoExchangeResult,
      koreanCryptoScamResult
    );

    // Cache the result
    cache.set(cacheKey, validationResult, 300000); // Cache for 5 minutes

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
  whoisResult: PromiseSettledResult<any>,
  sslResult: PromiseSettledResult<any>,
  reputationResult: PromiseSettledResult<any>,
  exchangeResult: PromiseSettledResult<any>,
  safeBrowsingResult: PromiseSettledResult<any>,
  teamScamResult: PromiseSettledResult<any>,
  cryptoExchangeResult: PromiseSettledResult<any>,
  koreanCryptoScamResult: PromiseSettledResult<any>
): ValidationResult {
  const checks: ValidationResult['checks'] = {
    whois: processWhoisCheck(whoisResult),
    ssl: processSSLCheck(sslResult),
    reputation: processReputationCheck(reputationResult),
    safeBrowsing: processSafeBrowsingCheck(safeBrowsingResult)
  };

  // Add exchange check if applicable
  if (exchangeResult.status === 'fulfilled' && exchangeResult.value.success && exchangeResult.value.data) {
    checks.exchange = processExchangeCheck(exchangeResult);
  }

  // Add new enhanced crypto scam detection checks
  if (teamScamResult.status === 'fulfilled' && teamScamResult.value.success) {
    checks.teamScam = processTeamScamCheck(teamScamResult);
  }

  if (cryptoExchangeResult.status === 'fulfilled' && cryptoExchangeResult.value.success) {
    checks.cryptoExchange = processCryptoExchangeCheck(cryptoExchangeResult);
  }

  if (koreanCryptoScamResult.status === 'fulfilled' && koreanCryptoScamResult.value.success) {
    checks.koreanCryptoScam = processKoreanCryptoScamCheck(koreanCryptoScamResult);
  }

  // Calculate final score - Enhanced with crypto scam detection
  const weights = {
    whois: 0.25,           // Domain Registration (25%)
    reputation: 0.30,      // Reputation Check (30%)
    ssl: 0.08,            // SSL Certificate (8%)
    safeBrowsing: 0.08,   // Safe Browsing (8%)
    exchange: 0.04,       // Exchange Verification (4%)
    teamScam: 0.10,       // Team Scam Detection (10%)
    cryptoExchange: 0.10, // Crypto Exchange Impersonation (10%)
    koreanCryptoScam: 0.05 // Korean Crypto Scam (5%)
  };

  let totalWeight = 0;
  let weightedScore = 0;

  Object.entries(checks).forEach(([key, check]) => {
    const weight = weights[key as keyof typeof weights] || 0;
    totalWeight += weight;
    weightedScore += check.score * weight;
  });

  const finalScore = Math.round(weightedScore / totalWeight);

  // Determine status
  let status: 'safe' | 'warning' | 'danger';
  if (finalScore >= 80) status = 'safe';
  else if (finalScore >= 50) status = 'warning';
  else status = 'danger';

  // Generate recommendations
  const recommendations = generateRecommendations(checks, finalScore);

  return {
    domain,
    finalScore,
    status,
    checks,
    summary: generateSummary(domain, finalScore, status, checks),
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
    ageMessage = `⚠️ Very new domain (${domainAgeDays} days old)`;
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
      message: '⚠️ SSL verification failed',
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
      message: '🚨 No SSL certificate found - Site is not secure',
      details: data
    };
  }

  // Use the score from the SSL check if available
  const score = data.score || (data.valid ? 70 : 0);

  // Build message based on score and breakdown
  let message = '';
  if (!data.valid) {
    message = '🚨 Invalid SSL certificate';
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
      message += `\n⚠️ Expires in ${data.daysRemaining} days`;
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

function processReputationCheck(result: PromiseSettledResult<any>): ValidationCheck {
  if (result.status === 'rejected' || !result.value.success) {
    return {
      name: 'Reputation Check',
      passed: false,
      score: 50,
      weight: 0.3,
      message: 'Unable to verify reputation',
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

    // Simple summary message only
    if (detectedSources.length > 0) {
      message = `Detected in ${detectedSources.length} database(s): ${detectedSources.join(', ')}`;
    } else {
      message = 'Domain is blacklisted';
    }
  } else if (score >= 90) {
    message = 'Excellent reputation - No threats detected in any database';
  } else if (score >= 70) {
    message = 'Good reputation - Clean across all security databases';
  } else if (score >= 50) {
    message = 'Mixed reputation - Some concerns detected';
  } else {
    message = 'Poor reputation - Multiple risk indicators detected';
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
    details
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
      message: '⚠️ Unable to verify with Google Safe Browsing',
      details: { error: result.status === 'rejected' ? result.reason : result.value.error }
    };
  }

  const data = result.value.data;

  // Use the calculated score from the Safe Browsing API
  const score = data.score !== undefined ? data.score : (data.safe ? 100 : 0);

  // Build message based on score and breakdown
  let message = '';
  if (data.safe && score >= 70) {
    message = '✅ No threats detected';
  } else if (data.threats && data.threats.length > 0) {
    const threatTypes = data.threats.map((t: any) => t.threatType).join(', ');
    message = `🚨 Threats detected: ${threatTypes}`;
  } else {
    message = '⚠️ Suspicious patterns detected';
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

function generateSummary(domain: string, score: number, status: string, checks: any): string {
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

function calculateDomainStatusScore(statuses: string[]): { adjustment: number; statusMessages: string[] } {
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
    statusMessages.push('⚠️ Domain on hold (suspended)');
    hasNegativeStatus = true;
  }

  if (statusText.includes('serverhold') || statusText.includes('server hold')) {
    score -= 80; // Very serious
    statusMessages.push('🚨 Server hold (critical issue)');
    hasNegativeStatus = true;
  }

  if (statusText.includes('redemptionperiod') || statusText.includes('redemption period')) {
    score -= 90; // Almost expired
    statusMessages.push('🚨 In redemption period (expired)');
    hasNegativeStatus = true;
  }

  if (statusText.includes('pendingdelete') || statusText.includes('pending delete')) {
    score -= 95; // About to be deleted
    statusMessages.push('🚨 Pending deletion');
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

function processTeamScamCheck(result: PromiseSettledResult<any>): ValidationCheck {
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
      message = '🚨 High probability of team scam mission detected';
    } else {
      message = '⚠️ Suspicious team scam patterns detected';
    }
    if (data.patterns.length > 0) {
      message += ` (${data.patterns.slice(0, 3).join(', ')})`;
    }
  } else {
    message = '✅ No team scam patterns detected';
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

function processCryptoExchangeCheck(result: PromiseSettledResult<any>): ValidationCheck {
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
      message = `🚨 Possible ${data.targetExchange} impersonation detected`;
    } else {
      message = '🚨 Crypto exchange impersonation detected';
    }
  } else {
    message = '✅ No exchange impersonation detected';
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

function processKoreanCryptoScamCheck(result: PromiseSettledResult<any>): ValidationCheck {
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
      message = `🚨 Korean crypto scam detected: ${data.scamType}`;
    } else {
      message = '🚨 Korean crypto scam patterns detected';
    }
  } else {
    message = '✅ No Korean crypto scam patterns detected';
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

function generateRecommendations(checks: any, score: number): string[] {
  const recommendations: string[] = [];

  if (score >= 80) {
    recommendations.push('This site appears to be safe for use.');
    if (checks.exchange) {
      recommendations.push('This is a recognized cryptocurrency exchange.');
    }
  }

  // Enhanced crypto scam specific recommendations
  if (checks.teamScam && !checks.teamScam.passed) {
    recommendations.push('🚨 CRITICAL: Team scam mission detected - avoid at all costs.');
  }

  if (checks.cryptoExchange && !checks.cryptoExchange.passed) {
    recommendations.push('🚨 CRITICAL: Cryptocurrency exchange impersonation detected.');
    if (checks.cryptoExchange.details?.legitimateUrl) {
      recommendations.push(`✅ Use the official site instead: ${checks.cryptoExchange.details.legitimateUrl}`);
    }
  }

  if (checks.koreanCryptoScam && !checks.koreanCryptoScam.passed) {
    recommendations.push('🚨 WARNING: Korean cryptocurrency scam patterns detected.');
  }

  if (!checks.ssl.passed) {
    recommendations.push('⚠️ Avoid entering sensitive information - no valid SSL certificate.');
  }

  if (!checks.whois.passed || checks.whois.score < 50) {
    recommendations.push('⚠️ Be cautious - this is a very new domain.');
  }

  if (!checks.reputation.passed) {
    recommendations.push('🚨 High risk - domain has poor reputation or is blacklisted.');
  }

  if (!checks.safeBrowsing.passed) {
    recommendations.push('🚨 Google Safe Browsing has detected threats on this site.');
  }

  if (score < 50) {
    recommendations.push('❌ Strongly recommend avoiding this site.');
    recommendations.push('Consider using well-known exchanges like Binance, Coinbase, or Kraken.');
  }

  // Add specific crypto security recommendations
  if (checks.teamScam || checks.cryptoExchange || checks.koreanCryptoScam) {
    recommendations.push('🔐 For crypto safety: Only use official exchange apps and websites.');
    recommendations.push('📱 Verify URLs through official social media or support channels.');
  }

  return recommendations;
}