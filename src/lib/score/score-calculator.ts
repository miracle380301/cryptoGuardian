// ========================================
// Risk Calculator Types & Functions
// ========================================

import { RiskLevel, Severity } from '@/types/validation.types';

/**
 * VirusTotal 분석 결과를 기반으로 위험도 계산
 */
export function calculateVirusTotalRisk(maliciousCount: number, suspiciousCount: number): {
  isReported: boolean;
  riskLevel: RiskLevel;
  severity: Severity;
} {
  const isReported = maliciousCount > 0 || suspiciousCount > 2;

  const riskLevel: RiskLevel =
    maliciousCount > 5 ? 'malicious' :
    (maliciousCount > 0 || suspiciousCount > 2) ? 'suspicious' :
    'clean';

  const severity: Severity =
    riskLevel === 'malicious' ? 'high' :
    riskLevel === 'suspicious' ? 'medium' :
    'low';

  return { isReported, riskLevel, severity };
}

/**
 * 신뢰도 계산 (0-100)
 */
export function calculateConfidence(totalEngines: number): number {
  return Math.min(100, totalEngines * 1.1);
}

/**
 * 블랙리스트 검증 결과 기반 점수 계산
 * @param isBlacklisted 블랙리스트 여부
 * @returns 점수 (0-100)
 */
export function calculateBlacklistScore(isBlacklisted: boolean): number {
  // 블랙리스트에 있으면 0점, 없으면 100점
  return isBlacklisted ? 0 : 100;
}

/**
 * 사용자 신고 기반 점수 계산
 * @param reportCount 신고 횟수
 * @returns 0-100 점수 (신고 1개당 -10점, 최대 -50점)
 */
export function calculateUserReportScore(reportCount: number): number {
  // 신고 1개당 -10점, 최대 -50점
  const scoreDeduction = Math.min(reportCount * 10, 50);
  return Math.max(0, 100 - scoreDeduction);
}

/**
 * 검증된 거래소 점수 계산
 * @param isVerified 검증된 거래소 여부
 * @returns 점수 (0-100)
 */
export function calculateExchangeScore(isVerified: boolean): number {
  // 검증된 거래소는 100점, 아니면 0점
  return isVerified ? 100 : 0;
}

/**
 * WHOIS 도메인 나이 기반 점수 계산
 * @param domainAgeDays 도메인 나이 (일 단위)
 * @returns 점수와 메시지
 */
export function calculateWhoisAgeScore(domainAgeDays: number): { score: number; message: string } {
  if (domainAgeDays > 730) {
    return {
      score: 100,
      message: `Established domain (${Math.floor(domainAgeDays / 365)} years old)`
    };
  } else if (domainAgeDays > 365) {
    return {
      score: 85,
      message: `Domain registered ${Math.floor(domainAgeDays / 365)} year ago`
    };
  } else if (domainAgeDays > 180) {
    return {
      score: 70,
      message: `Domain registered ${domainAgeDays} days ago`
    };
  } else if (domainAgeDays > 90) {
    return {
      score: 50,
      message: `Relatively new domain (${domainAgeDays} days old)`
    };
  } else if (domainAgeDays > 30) {
    return {
      score: 30,
      message: `New domain (${domainAgeDays} days old)`
    };
  } else {
    return {
      score: 10,
      message: `Very new domain (${domainAgeDays} days old)`
    };
  }
}

/**
 * 도메인 상태 기반 점수 계산
 * @param statuses 도메인 상태 배열
 * @returns 점수와 상태 메시지
 */
export function calculateDomainStatusScore(statuses: string[]): { score: number; statusMessages: string[] } {
  let score = 100;
  const statusMessages: string[] = [];

  const normalizedStatuses = statuses.map(s => s.toLowerCase().trim());

  // Critical status (0 points)
  const criticalStatuses = [
    'clienthold', 'serverhold', 'redemptionperiod', 'pendingrestore', 'pendingdelete'
  ];

  for (const critical of criticalStatuses) {
    if (normalizedStatuses.includes(critical)) {
      score = 0;
      if (critical === 'clienthold' || critical === 'serverhold') {
        statusMessages.push('Domain on hold (suspended)');
      } else if (critical === 'redemptionperiod') {
        statusMessages.push('In redemption period (expired)');
      } else if (critical === 'pendingdelete') {
        statusMessages.push('Pending deletion');
      }
      return { score, statusMessages };
    }
  }

  // Good status indicators (100 points)
  const goodStatuses = ['ok', 'active', 'clienttransferprohibited', 'servertransferprohibited'];

  const hasGoodStatus = normalizedStatuses.some(s => goodStatuses.includes(s));

  if (hasGoodStatus) {
    score = 100;
    if (normalizedStatuses.includes('clienttransferprohibited') || normalizedStatuses.includes('servertransferprohibited')) {
      statusMessages.push('Transfer protection enabled');
    }
    if (normalizedStatuses.includes('ok') || normalizedStatuses.includes('active')) {
      statusMessages.push('Normal status');
    }
  } else {
    // Unknown status
    score = 50;
    statusMessages.push('Standard registration status');
  }

  return { score, statusMessages };
}

/**
 * SSL 인증서 기반 점수 계산
 * @param hasSSL SSL 인증서 존재 여부
 * @param valid SSL 인증서 유효성
 * @param scoreFromData API에서 반환한 점수 (선택)
 * @returns 점수 (0-100)
 */
export function calculateSSLScore(hasSSL: boolean, valid: boolean, scoreFromData?: number): number {
  if (!hasSSL) {
    return 0;
  }

  // API에서 점수를 제공하면 그것을 사용, 아니면 유효성에 따라 70 또는 0
  return scoreFromData || (valid ? 70 : 0);
}

/**
 * Safe Browsing 검증 결과 기반 점수 계산
 * @param isSafe Safe Browsing에서 안전하다고 판단했는지 여부
 * @param scoreFromData API에서 반환한 점수 (선택)
 * @returns 점수 (0-100)
 */
export function calculateSafeBrowsingScore(isSafe: boolean, scoreFromData?: number): number {
  // API에서 점수를 제공하면 그것을 사용, 아니면 안전 여부에 따라 결정
  if (scoreFromData !== undefined) {
    return scoreFromData;
  }

  return isSafe ? 100 : 0;
}

/**
 * WHOIS 최종 점수 계산 (나이 30% + 상태 70%)
 * @param domainAgeDays 도메인 나이
 * @param statuses 도메인 상태 배열
 * @returns 최종 점수, 메시지, 상세 정보
 */
export function calculateWhoisScore(domainAgeDays: number, statuses: string[]): {
  score: number;
  message: string;
  ageScore: number;
  statusScore: number;
  statusMessages: string[];
} {
  const ageResult = calculateWhoisAgeScore(domainAgeDays);
  const statusResult = calculateDomainStatusScore(statuses);

  // Combine scores: 30% age + 70% status
  const finalScore = Math.round((ageResult.score * 0.3) + (statusResult.score * 0.7));

  let message = ageResult.message;
  if (statusResult.statusMessages.length > 0) {
    message += `\nStatus: ${statusResult.statusMessages.join(', ')}`;
  }

  return {
    score: finalScore,
    message,
    ageScore: ageResult.score,
    statusScore: statusResult.score,
    statusMessages: statusResult.statusMessages
  };
}