import { ValidationResult } from '@/types/validation.types';
import { SCORE_WEIGHTS } from './score-config';
import { processBlacklistCheck } from './processors/blacklist-processor';
import { processExchangeCheck } from './processors/exchange-processor';
import { processWhoisCheck } from './processors/whois-processor';
import { processSSLCheck } from './processors/ssl-processor';
import { processSafeBrowsingCheck } from './processors/safe-browsing-processor';
import { processUserReportsCheck } from './processors/user-reports-processor';
import { processAIPhishingCheck } from './processors/ai-phishing-processor';
import { processAISuspiciousDomainCheck } from './processors/ai-suspicious-domain-processor';

// ========================================
// Main Validation Result Builder
// ========================================

export function buildValidationResult(
  domain: string,
  originalInput: string,
  apiResults: {
    blacklistResult: PromiseSettledResult<any>;
    exchangeResult?: PromiseSettledResult<any>;
    userReportsResult: PromiseSettledResult<any>;
    whoisResult: PromiseSettledResult<any>;
    sslResult: PromiseSettledResult<any>;
    safeBrowsingResult: PromiseSettledResult<any>;
    aiPhishingResult: PromiseSettledResult<any>;
    aiSuspiciousDomainResult: PromiseSettledResult<any>;
  }
): ValidationResult {
  // Build validation checks from raw API results
  const checks: ValidationResult['checks'] = {
    maliciousSite: processBlacklistCheck(apiResults.blacklistResult),
    exchange: apiResults.exchangeResult ? processExchangeCheck(apiResults.exchangeResult) : undefined,
    whois: processWhoisCheck(apiResults.whoisResult),
    ssl: processSSLCheck(apiResults.sslResult),
    safeBrowsing: processSafeBrowsingCheck(apiResults.safeBrowsingResult),
    userReports: processUserReportsCheck(apiResults.userReportsResult),
    aiPhishing: processAIPhishingCheck(apiResults.aiPhishingResult),
    aiSuspiciousDomain: processAISuspiciousDomainCheck(apiResults.aiSuspiciousDomainResult)
  };

  // Calculate weighted score
  let totalWeight = 0;
  let weightedScore = 0;

  Object.entries(checks).forEach(([key, check]) => {
    if (!check) return; // Skip undefined checks

    const weight = check.weight ?? (SCORE_WEIGHTS[key as keyof typeof SCORE_WEIGHTS] || 0);

    // Skip checks with 0 weight (skipped checks)
    if (weight === 0) return;

    totalWeight += weight;
    weightedScore += check.score * weight;
  });

  const finalScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 50;

  // Determine status
  let status: 'safe' | 'warning' | 'danger';
  if (finalScore >= 80) status = 'safe';
  else if (finalScore >= 50) status = 'warning';
  else status = 'danger';

  // Generate recommendations
  const recommendations = generateRecommendations(checks, finalScore);

  return {
    domain,
    originalInput,
    finalScore,
    status,
    checks,
    summary: generateSummary(domain, finalScore, status, checks),
    recommendations,
    timestamp: new Date().toISOString()
  };
}

// ========================================
// Helper Functions
// ========================================

function generateRecommendations(checks: ValidationResult['checks'], finalScore: number): string[] {
  const recommendations: string[] = [];

  if (finalScore < 50) {
    recommendations.push('Do not trust this site');
  }

  if (checks.ssl && !checks.ssl.passed) {
    recommendations.push('No secure connection. Do not enter personal information');
  }

  if (checks.whois && checks.whois.score < 30) {
    recommendations.push('Recently registered domain. Exercise caution');
  }

  if (checks.safeBrowsing && !checks.safeBrowsing.passed) {
    recommendations.push('Security threats detected');
  }

  if (recommendations.length === 0 && finalScore >= 80) {
    recommendations.push('Site appears to be safe');
  }

  return recommendations;
}

function generateSummary(
  domain: string,
  score: number,
  status: 'safe' | 'warning' | 'danger',
  checks: ValidationResult['checks']
): string {
  const baseMessage = `Security score for ${domain} is ${score}/100.`;

  let statusMessage = '';
  if (status === 'danger') {
    statusMessage = 'This site is likely dangerous.';
  } else if (status === 'warning') {
    statusMessage = 'This site requires caution.';
  } else {
    statusMessage = 'This site appears to be safe.';
  }

  return `${baseMessage} ${statusMessage}`;
}