import { useTranslations as useNextIntlTranslations } from 'next-intl';

// Check names translations
export function useCheckNameTranslations() {
  return useNextIntlTranslations('checkNames');
}

// Message translations
export function useMessageTranslations() {
  return useNextIntlTranslations('messages');
}

// Helper function to translate check names
export function translateCheckName(checkName: string, t: ReturnType<typeof useCheckNameTranslations>) {
  const keyMap: Record<string, string> = {
    'Domain Registration': 'domainRegistration',
    'SSL Certificate': 'sslCertificate',
    'Malicious Site Check': 'maliciousSiteCheck',
    'Reputation Check': 'reputationCheck',
    'Exchange Verification': 'exchangeVerification',
    'Safe Browsing': 'safeBrowsing',
    'Team Scam Detection': 'teamScamDetection',
    'Exchange Impersonation Check': 'exchangeImpersonationCheck',
    'Korean Crypto Scam Check': 'koreanCryptoScamCheck'
  };

  const key = keyMap[checkName];
  return key ? t(key) : checkName;
}

// Helper function to translate messages
export function translateMessage(message: string, t: ReturnType<typeof useMessageTranslations>) {
  const keyMap: Record<string, string> = {
    'Unable to verify domain registration': 'unableToVerifyDomainRegistration',
    'SSL verification failed': 'sslVerificationFailed',
    'No SSL certificate found - Site is not secure': 'noSslCertificateFound',
    'Invalid SSL certificate': 'invalidSslCertificate',
    'Valid SSL certificate': 'validSslCertificate',
    'Unable to verify reputation': 'unableToVerifyReputation',
    'Clean - No threats detected': 'cleanNoThreatsDetected',
    'Domain on hold (suspended)': 'domainOnHoldSuspended',
    'Exchange verification failed': 'exchangeVerificationFailed',
    'Unable to verify with Google Safe Browsing': 'unableToVerifyWithGoogleSafeBrowsing',
    'No threats found by Google Safe Browsing': 'noThreatsFoundByGoogleSafeBrowsing',
    'No threats detected': 'noThreatsDetected',
    'High confidence - likely safe': 'highConfidenceLikelySafe',
    'Team scam detection unavailable': 'teamScamDetectionUnavailable',
    'Exchange impersonation check unavailable': 'exchangeImpersonationCheckUnavailable',
    'Korean crypto scam check unavailable': 'koreanCryptoScamCheckUnavailable',
    'No team scam patterns detected': 'noTeamScamPatternsDetected',
    'No exchange impersonation detected': 'noExchangeImpersonationDetected',
    'No Korean crypto scam patterns detected': 'noKoreanCryptoScamPatternsDetected',
    'Blacklisted: KISA': 'blacklistedKisa',
    'Blacklisted: Security Database': 'blacklistedSecurityDatabase',
    'Domain is blacklisted': 'domainIsBlacklisted',
    'Domain is blacklisted - SSL check skipped': 'domainIsBlacklistedSslCheckSkipped',
    'Phishing site detected': 'phishingSiteDetected'
  };

  const key = keyMap[message];
  return key ? t(key) : message;
}