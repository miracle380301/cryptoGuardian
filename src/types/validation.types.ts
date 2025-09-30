// ========================================
// Validation Score Calculation Types
// ========================================

/**
 * 개별 검증 항목의 점수 및 결과
 */
export interface ValidationCheck {
  name: string;
  passed: boolean;
  score: number;
  weight: number;
  message: string;
  details?: Record<string, any> | null;
}

/**
 * 최종 검증 결과 (모든 검증 항목 통합)
 */
export interface ValidationResult {
  domain: string;
  originalInput: string; // 사용자가 입력한 원본 URL
  finalScore: number; // 0-100
  status: 'safe' | 'warning' | 'danger';
  checks: {
    whois?: ValidationCheck;
    ssl?: ValidationCheck;
    maliciousSite?: ValidationCheck;
    exchange?: ValidationCheck;
    safeBrowsing?: ValidationCheck;
    teamScam?: ValidationCheck;
    cryptoExchange?: ValidationCheck;
    koreanCryptoScam?: ValidationCheck;
    userReports?: ValidationCheck;
    aiPhishing?: ValidationCheck;
    aiSuspiciousDomain?: ValidationCheck;
    // Keep reputation for backward compatibility
    reputation?: ValidationCheck;
  };
  summary: string;
  recommendations: string[];
  timestamp: string;
  cached?: boolean;
}

/**
 * 위험도 레벨
 */
export type RiskLevel = 'clean' | 'suspicious' | 'malicious';

/**
 * 심각도 레벨
 */
export type Severity = 'low' | 'medium' | 'high' | 'critical';