import { ValidationCheck } from '@/types/validation.types';
import { calculateBlacklistScore } from '../score-calculator';
import { SCORE_WEIGHTS } from '../score-config';

/**
 * Process Blacklist Check data and calculate score
 */
export function processBlacklistCheck(result: PromiseSettledResult<any>): ValidationCheck {
  if (result.status === 'rejected' || !result.value.success) {
    return {
      name: 'Malicious Site Check',
      passed: true,
      score: calculateBlacklistScore(false),
      weight: SCORE_WEIGHTS.maliciousSite,
      message: 'Unable to verify blacklist status',
      details: { error: result.status === 'rejected' ? result.reason : result.value.error }
    };
  }

  const data = result.value.data;
  const isBlacklisted = data.isBlacklisted === true;
  const score = calculateBlacklistScore(isBlacklisted);

  // 블랙리스트에 없으면 간단한 결과 반환
  if (!isBlacklisted) {
    return {
      name: 'Malicious Site Check',
      passed: true,
      score,
      weight: SCORE_WEIGHTS.maliciousSite,
      message: 'No malicious patterns detected in database',
      details: { isBlacklisted: false }
    };
  }

  // 블랙리스트에 있으면 상세 정보 포함
  const sources = [];
  if (data.reportedBy) sources.push(data.reportedBy);
  if (data.sources && Array.isArray(data.sources)) sources.push(...data.sources);

  const uniqueSources = [...new Set(sources)];

  return {
    name: 'Malicious Site Check',
    passed: false,
    score,
    weight: SCORE_WEIGHTS.maliciousSite,
    message: `Blacklisted: ${data.reportedBy || 'Security Database'}`,
    details: {
      isBlacklisted: true,
      severity: data.severity,
      category: data.category || 'malicious',
      dataSources: data.dataSources || ['Internal Database'],
      evidenceUrls: data.evidence || [],
      kisaId: data.kisaId,
      verificationStatus: data.verificationStatus || 'confirmed',
      maliciousSite: {
        reason: data.reason,
        severity: data.severity,
        reportDate: data.reportDate,
        reportedBy: data.reportedBy || 'Security Database',
        riskLevel: data.riskLevel || 'high',
        targetBrand: data.targetBrand,
        description: data.description,
        isConfirmed: data.isConfirmed !== false,
        sources: uniqueSources
      }
    }
  };
}