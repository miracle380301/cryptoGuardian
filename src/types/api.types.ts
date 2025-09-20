// API Response Types

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  timestamp: string;
}

// Whois API Types
export interface WhoisData {
  domain: string;
  registrar?: string;
  creation_date?: string;
  expiration_date?: string;
  updated_date?: string;
  domain_age_days?: number;
  is_registered: boolean;
  registrant?: {
    organization?: string;
    country?: string;
    state?: string;
  };
  nameservers?: string[];
  status?: string[];
  links?: string[];
}

// SSL Certificate Types
export interface SSLCertificate {
  valid: boolean;
  issuer?: string;
  subject?: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  protocol?: string;
  cipher?: string;
  grade?: string;
  hasSSL: boolean;
  errors?: string[];
  score?: number;
  scoreBreakdown?: string[];
}

// Reputation Check Types
export interface ReputationData {
  domain: string;
  reputation_score: number; // 0-100
  is_blacklisted: boolean;
  blacklists?: string[];
  threat_types?: string[];
  risk_level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  detections?: {
    virustotal?: number;
    urlvoid?: number;
    abuseipdb?: number;
  };
  categories?: string[];
  last_analysis_date?: string;
}

// Google Safe Browsing Types
export interface SafeBrowsingData {
  safe: boolean;
  threats?: {
    threatType: string;
    platformType: string;
    threatEntryType: string;
  }[];
  score?: number;
  scoreBreakdown?: string[];
}

// Multi-source Exchange Data
export interface ExchangeData {
  id: string;
  name: string;
  trust_score: number; // 1-10
  trust_score_rank: number;
  trade_volume_24h_btc: number;
  established_year?: number;
  country?: string;
  url?: string;
  refer_url?: string;
  image?: string;
  has_trading_incentive: boolean;
  centralized: boolean;
  public_notice?: string;
  alert_notice?: string;
  is_verified: boolean;
  dataSource?: string;
  batchDate?: Date;
  lastUpdatedAt?: Date;
  // CryptoCompare data
  cryptocompareId?: string;
  cryptocompareName?: string;
  totalVolume24h?: number;
  totalTrades24h?: number;
  topTierVolume24h?: number;
  totalPairs?: number;
  cryptocompareGrade?: string;
  dataSources?: string[];
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Validation Result Types
export interface ValidationCheck {
  name: string;
  passed: boolean;
  score: number;
  weight: number;
  message: string;
  details?: Record<string, any> | null;
}

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
    // Keep reputation for backward compatibility
    reputation?: ValidationCheck;
  };
  summary: string;
  recommendations: string[];
  timestamp: string;
  cached?: boolean;
}

// API Error Types
export class ApiError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Rate Limit Types
export interface RateLimitInfo {
  remaining: number;
  limit: number;
  reset: number;
}