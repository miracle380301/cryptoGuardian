import { ValidationCheck } from '@/types/validation.types';
import { calculateUserReportScore } from '../score-calculator';

/**
 * Process User Reports data and calculate score
 */
export function processUserReportsCheck(result: PromiseSettledResult<any>): ValidationCheck {
  if (result.status === 'rejected' || !result.value) {
    return {
      name: 'User Reports Check',
      passed: true,
      score: 100,
      weight: 0.15,
      message: 'No user reports found',
      details: { error: result.status === 'rejected' ? result.reason : 'No data' }
    };
  }

  const data = result.value;
  const score = calculateUserReportScore(data.reportCount || 0);

  return {
    name: 'User Reports Check',
    passed: !data.isReported,
    score,
    weight: 0.15,
    message: data.isReported
      ? `${data.reportCount} user report(s) found`
      : 'No user reports',
    details: data
  };
}