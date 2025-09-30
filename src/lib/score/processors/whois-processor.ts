import { ValidationCheck } from '@/types/validation.types';
import { SCORE_WEIGHTS } from '../score-config';
import { calculateWhoisScore } from '../score-calculator';

/**
 * Process WHOIS data and calculate score
 */
export function processWhoisCheck(result: PromiseSettledResult<any>): ValidationCheck {
  console.log('🔍 WHOIS 검사 시작');
  console.log('  result.status:', result.status);

  if (result.status === 'rejected' || !result.value.success) {
    console.log('  ❌ WHOIS 검사 실패:', result.status === 'rejected' ? result.reason : result.value.error);
    return {
      name: 'Domain Registration',
      passed: false,
      score: 0,
      weight: SCORE_WEIGHTS.whois,
      message: 'Unable to verify domain registration',
      details: { error: result.status === 'rejected' ? result.reason : result.value.error }
    };
  }

  const data = result.value.data;
  console.log('  📊 WHOIS 데이터:', JSON.stringify(data, null, 2));

  const domainAgeDays = data.domain_age_days || 0;
  const statuses = data.status || [];

  console.log('  📅 도메인 나이 (일):', domainAgeDays);
  console.log('  📋 도메인 상태:', statuses);

  const scoreResult = calculateWhoisScore(domainAgeDays, statuses);

  console.log('  ✅ 점수 계산 결과:');
  console.log('    - 나이 점수:', scoreResult.ageScore);
  console.log('    - 상태 점수:', scoreResult.statusScore);
  console.log('    - 최종 점수:', scoreResult.score, '(30% 나이 + 70% 상태)');
  console.log('    - 메시지:', scoreResult.message);

  return {
    name: 'Domain Registration',
    passed: scoreResult.score >= 60,
    score: scoreResult.score,
    weight: SCORE_WEIGHTS.whois,
    message: scoreResult.message,
    details: {
      ...data,
      scoring: {
        ageScore: scoreResult.ageScore,
        statusScore: scoreResult.statusScore,
        ageWeight: 0.3,
        statusWeight: 0.7
      }
    }
  };
}