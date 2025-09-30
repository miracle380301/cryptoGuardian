import { ValidationCheck } from '@/types/validation.types';

/**
 * Process AI Suspicious Domain Detection
 */
export function processAISuspiciousDomainCheck(result: PromiseSettledResult<any>): ValidationCheck {
  if (result.status === 'rejected' || !result.value) {
    return {
      name: 'AI Suspicious Domain Detection',
      passed: true,
      score: 100,
      weight: 0.10,
      message: 'Domain analysis unavailable',
      details: {}
    };
  }

  const data = result.value;

  return {
    name: 'AI Suspicious Domain Detection',
    passed: !data.isSuspicious,
    score: data.trustScore || 100,
    weight: 0.10,
    message: data.isSuspicious ? 'Suspicious domain patterns detected' : 'No suspicious patterns detected',
    details: data
  };
}