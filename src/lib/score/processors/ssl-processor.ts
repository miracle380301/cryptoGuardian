import { ValidationCheck } from '@/types/validation.types';
import { calculateSSLScore } from '../score-calculator';
import { SCORE_WEIGHTS } from '../score-config';

/**
 * Process SSL data and calculate score
 */
export function processSSLCheck(result: PromiseSettledResult<any>): ValidationCheck {
  if (result.status === 'rejected' || !result.value.success) {
    return {
      name: 'SSL Certificate',
      passed: false,
      score: 0,
      weight: SCORE_WEIGHTS.ssl,
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
      weight: SCORE_WEIGHTS.ssl,
      message: 'No SSL certificate found - Site is not secure',
      details: data
    };
  }

  const score = calculateSSLScore(data.hasSSL, data.valid, data.score);
  let message = data.valid ? 'Valid SSL certificate' : 'Invalid SSL certificate';

  if (data.grade) {
    message = `Valid SSL certificate (Grade: ${data.grade})`;
  }

  return {
    name: 'SSL Certificate',
    passed: data.valid,
    score,
    weight: SCORE_WEIGHTS.ssl,
    message,
    details: data
  };
}