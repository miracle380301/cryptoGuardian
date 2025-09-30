import { ValidationCheck } from '@/types/validation.types';
import { calculateSafeBrowsingScore } from '../score-calculator';
import { SCORE_WEIGHTS } from '../score-config';

/**
 * Process Safe Browsing data and calculate score
 */
export function processSafeBrowsingCheck(result: PromiseSettledResult<any>): ValidationCheck {
  if (result.status === 'rejected' || !result.value.success) {
    return {
      name: 'Safe Browsing',
      passed: true,
      score: 50,
      weight: SCORE_WEIGHTS.safeBrowsing,
      message: 'Unable to verify with Google Safe Browsing',
      details: { error: result.status === 'rejected' ? result.reason : result.value.error }
    };
  }

  const data = result.value.data;
  const isSafe = data.safe ?? data.isSafe ?? true;
  const scoreValue = data.score !== undefined ? data.score : (isSafe ? 100 : 0);

  return {
    name: 'Safe Browsing',
    passed: isSafe,
    score: scoreValue,
    weight: SCORE_WEIGHTS.safeBrowsing,
    message: data.message || (isSafe ? 'No threats found by Google Safe Browsing' : 'Threats detected'),
    details: { safeBrowsing: data }
  };
}