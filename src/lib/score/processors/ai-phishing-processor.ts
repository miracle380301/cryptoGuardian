import { ValidationCheck } from '@/types/validation.types';

/**
 * Process AI Phishing Pattern Analysis
 * Enhanced to handle new detection patterns:
 * - Subdomain phishing (binance.com.evil.com)
 * - Hyphen phishing (secure-binance.com)
 * - Brand + keyword combo (binancelogin.com)
 * - Typosquatting (binnance.com)
 */
export function processAIPhishingCheck(result: PromiseSettledResult<any>): ValidationCheck {
  if (result.status === 'rejected' || !result.value) {
    return {
      name: 'AI Phishing Pattern Analysis',
      passed: true,
      score: 100,
      weight: 0.15,
      message: 'Phishing analysis unavailable',
      details: {}
    };
  }

  const data = result.value;

  // Handle both old format (isSuspicious) and new format (isPhishing)
  const isPhishing = data.isPhishing ?? data.isSuspicious ?? false;
  const score = data.confidence ?? data.trustScore ?? 100;

  // Build message with official URL if available
  let message = 'No phishing patterns detected';

  if (isPhishing) {
    if (data.matchedBrand && data.officialUrl) {
      message = `${data.reason} - Official: ${data.officialUrl}`;
    } else {
      message = data.reason || 'Phishing patterns detected';
    }
  }

  // Determine pattern type for details
  const patternType = data.details?.subdomainPhishing
    ? 'subdomain_hijack'
    : data.details?.hyphenPhishing
      ? 'hyphen_brand'
      : data.details?.brandKeywordCombo
        ? 'brand_keyword'
        : data.details?.typosquattingPenalty < -25
          ? 'typosquatting'
          : 'none';

  return {
    name: 'AI Phishing Pattern Analysis',
    passed: !isPhishing,
    score: Math.max(0, Math.min(100, score)),
    weight: 0.15,
    message,
    details: {
      ...data,
      isTyposquatting: isPhishing,
      patternType,
      similarTo: data.matchedBrand,
      officialUrl: data.officialUrl
    }
  };
}
