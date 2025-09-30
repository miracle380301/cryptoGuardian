import { ValidationCheck } from '@/types/validation.types';
import { calculateExchangeScore } from '../score-calculator';
import { SCORE_WEIGHTS } from '../score-config';

/**
 * Process Exchange Check data and calculate score
 */
export function processExchangeCheck(result: PromiseSettledResult<any>): ValidationCheck {
  if (result.status === 'rejected' || !result.value.success) {
    return {
      name: 'Exchange Verification',
      passed: false,
      score: calculateExchangeScore(false),
      weight: 0, // 에러 발생 시 가중치 0
      message: 'Unable to verify exchange status',
      details: { error: result.status === 'rejected' ? result.reason : result.value.error }
    };
  }

  const data = result.value.data;
  const isVerified = data.is_verified === true;
  const score = calculateExchangeScore(isVerified);

  if (!isVerified) {
    return {
      name: 'Exchange Verification',
      passed: false,
      score,
      weight: 0, // 거래소가 아니면 가중치 0 (점수 계산에서 제외)
      message: 'Not a verified exchange',
      details: { is_verified: false }
    };
  }

  return {
    name: 'Exchange Verification',
    passed: true,
    score,
    weight: SCORE_WEIGHTS.exchange,
    message: `Verified exchange: ${data.name} (Trust rank #${data.trust_score_rank})`,
    details: data
  };
}