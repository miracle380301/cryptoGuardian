// ========================================
// Score Weights Configuration
// ========================================

/**
 * 각 검증 항목의 가중치
 * 합계는 일반 검사의 경우 1.0 (100%)
 * exchange는 검증된 거래소일 때 다른 모든 검사를 오버라이드
 */
export const SCORE_WEIGHTS = {
  maliciousSite: 0.25,      // Malicious Site Check (25%)
  exchange: 1.0,            // Exchange Verification (100% - overrides other checks)
  whois: 0.10,              // Domain Registration (10%)
  ssl: 0.15,                // SSL Certificate (15%)
  safeBrowsing: 0.10,       // Safe Browsing (10%)
  userReports: 0.15,        // User Reports Check (15%)
  aiPhishing: 0.15,         // AI Phishing Pattern Analysis (15%)
  aiSuspiciousDomain: 0.10, // AI Suspicious Domain Detection (10%)
} as const;