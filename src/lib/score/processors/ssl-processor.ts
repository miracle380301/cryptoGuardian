import { ValidationCheck } from '@/types/validation.types';
import { SCORE_WEIGHTS } from '../score-config';

/**
 * Process SSL data and calculate score
 * Enhanced to handle certificate type (DV/OV/EV) and age
 */
export function processSSLCheck(result: PromiseSettledResult<any>): ValidationCheck {
  if (result.status === 'rejected' || !result.value?.success) {
    return {
      name: 'SSL Certificate',
      passed: false,
      score: 0,
      weight: SCORE_WEIGHTS.ssl,
      message: 'SSL verification failed',
      details: { error: result.status === 'rejected' ? result.reason : result.value?.error }
    };
  }

  const data = result.value.data;

  if (!data.hasSSL) {
    return {
      name: 'SSL Certificate',
      passed: false,
      score: 0,
      weight: SCORE_WEIGHTS.ssl,
      message: 'No SSL certificate found - Site is not secure',
      details: data
    };
  }

  // Use new trustScore if available, otherwise calculate basic score
  const score = data.trustScore ?? (data.valid ? 70 : 0);

  // Build detailed message
  let message = data.valid ? 'Valid SSL certificate' : 'Invalid SSL certificate';

  // Add certificate type info
  if (data.type && data.type !== 'unknown') {
    const typeLabels: Record<string, string> = {
      'EV': 'Extended Validation',
      'OV': 'Organization Validated',
      'DV': 'Domain Validated'
    };
    message = `${typeLabels[data.type] || data.type} SSL certificate`;
  }

  // Add issuer info
  if (data.issuer && data.issuer !== 'unknown') {
    message += ` (${data.issuer})`;
  }

  // Add age warning
  if (data.daysOld !== undefined && data.daysOld < 30) {
    message += ` - Recently issued (${data.daysOld} days ago)`;
  }

  // Add expiry warning
  if (data.daysUntilExpiry !== undefined && data.daysUntilExpiry < 30) {
    if (data.daysUntilExpiry < 0) {
      message += ' - EXPIRED';
    } else {
      message += ` - Expires in ${data.daysUntilExpiry} days`;
    }
  }

  return {
    name: 'SSL Certificate',
    passed: data.valid,
    score,
    weight: SCORE_WEIGHTS.ssl,
    message,
    details: {
      ...data,
      certificateType: data.type,
      issuer: data.issuer,
      daysOld: data.daysOld,
      daysUntilExpiry: data.daysUntilExpiry
    }
  };
}
