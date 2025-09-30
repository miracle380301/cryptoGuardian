import { ValidationCheck } from '@/types/validation.types';

/**
 * Process AI Phishing Pattern Analysis
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

  return {
    name: 'AI Phishing Pattern Analysis',
    passed: !data.isSuspicious,
    score: data.trustScore || 100,
    weight: 0.15,
    message: data.isSuspicious ? 'Phishing patterns detected' : 'No phishing patterns detected',
    details: data
  };
}