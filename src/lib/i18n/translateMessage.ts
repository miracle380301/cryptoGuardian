import { translations } from './translations';

// 메시지 번역 맵핑
const messageTranslations: Record<string, { ko: string; en: string }> = {
  // Domain Registration messages
  'Unable to verify domain registration': {
    ko: '도메인 등록을 확인할 수 없습니다',
    en: 'Unable to verify domain registration'
  },

  // SSL messages
  ' SSL verification failed': {
    ko: ' SSL 검증 실패',
    en: ' SSL verification failed'
  },
  ' No SSL certificate found - Site is not secure': {
    ko: ' SSL 인증서 없음 - 안전하지 않은 사이트',
    en: ' No SSL certificate found - Site is not secure'
  },
  'No SSL certificate found - Site is not secure': {
    ko: 'SSL 인증서 없음 - 안전하지 않은 사이트',
    en: 'No SSL certificate found - Site is not secure'
  },
  ' Invalid SSL certificate': {
    ko: ' 유효하지 않은 SSL 인증서',
    en: ' Invalid SSL certificate'
  },
  '✓ Valid SSL certificate': {
    ko: '✓ 유효한 SSL 인증서',
    en: '✓ Valid SSL certificate'
  },

  // Reputation messages
  'Unable to verify reputation': {
    ko: '평판을 확인할 수 없습니다',
    en: 'Unable to verify reputation'
  },
  'Clean - No threats detected': {
    ko: '안전 - 위협이 감지되지 않음',
    en: 'Clean - No threats detected'
  },
  'Domain on hold (suspended)': {
    ko: '도메인 보류 중 (정지됨)',
    en: 'Domain on hold (suspended)'
  },
  ' Domain on hold (suspended)': {
    ko: ' 도메인 보류 중 (정지됨)',
    en: ' Domain on hold (suspended)'
  },

  // Exchange messages
  'Exchange verification failed': {
    ko: '거래소 검증 실패',
    en: 'Exchange verification failed'
  },

  // Safe Browsing messages
  ' Unable to verify with Google Safe Browsing': {
    ko: ' Google 안전 브라우징으로 확인할 수 없습니다',
    en: ' Unable to verify with Google Safe Browsing'
  },
  '✓ No threats found by Google Safe Browsing': {
    ko: '✓ Google 안전 브라우징에서 위협 없음',
    en: '✓ No threats found by Google Safe Browsing'
  },
  'No threats detected': {
    ko: '위협이 감지되지 않음',
    en: 'No threats detected'
  },
  '✓ Typosquatting check: 40/40 points': {
    ko: '✓ 타이포스쿼팅 검사',
    en: '✓ Typosquatting check: 40/40 points'
  },
  '✓ Pattern analysis: 30/30 points': {
    ko: '✓ 패턴 분석',
    en: '✓ Pattern analysis: 30/30 points'
  },
  '✓ Google Safe Browsing: 30/30 points': {
    ko: '✓ Google 안전 브라우징',
    en: '✓ Google Safe Browsing: 30/30 points'
  },
  'High confidence - likely safe': {
    ko: '높은 신뢰도 - 안전할 가능성 높음',
    en: 'High confidence - likely safe'
  },

  // Scam detection messages
  'Team scam detection unavailable': {
    ko: '팀 스캠 감지 불가능',
    en: 'Team scam detection unavailable'
  },
  'Exchange impersonation check unavailable': {
    ko: '거래소 사칭 검사 불가능',
    en: 'Exchange impersonation check unavailable'
  },
  'Korean crypto scam check unavailable': {
    ko: '한국 크립토 스캠 검사 불가능',
    en: 'Korean crypto scam check unavailable'
  },
  'No team scam patterns detected': {
    ko: '팀 스캠 패턴이 감지되지 않음',
    en: 'No team scam patterns detected'
  },
  'No exchange impersonation detected': {
    ko: '거래소 사칭이 감지되지 않음',
    en: 'No exchange impersonation detected'
  },
  'No Korean crypto scam patterns detected': {
    ko: '한국 암호화폐 스캠 패턴이 감지되지 않음',
    en: 'No Korean crypto scam patterns detected'
  }
};

// 동적 메시지 패턴 (정규표현식)
const messagePatterns: Array<{
  pattern: RegExp;
  translate: (match: RegExpMatchArray, lang: 'ko' | 'en') => string;
}> = [
  // Domain age patterns
  {
    pattern: /^Established domain \((\d+) years old\)$/,
    translate: (match, lang) => {
      return lang === 'ko'
        ? `오래된 도메인 (${match[1]}년)`
        : `Established domain (${match[1]} years old)`;
    }
  },
  {
    pattern: /^Domain registered (\d+) year ago$/,
    translate: (match, lang) => {
      return lang === 'ko'
        ? `${match[1]}년 전 등록된 도메인`
        : `Domain registered ${match[1]} year ago`;
    }
  },
  {
    pattern: /^Domain registered (\d+) days ago$/,
    translate: (match, lang) => {
      return lang === 'ko'
        ? `${match[1]}일 전 등록된 도메인`
        : `Domain registered ${match[1]} days ago`;
    }
  },
  {
    pattern: /^Relatively new domain \((\d+) days old\)$/,
    translate: (match, lang) => {
      return lang === 'ko'
        ? `비교적 새로운 도메인 (${match[1]}일)`
        : `Relatively new domain (${match[1]} days old)`;
    }
  },
  {
    pattern: /^New domain \((\d+) days old\)$/,
    translate: (match, lang) => {
      return lang === 'ko'
        ? `새 도메인 (${match[1]}일)`
        : `New domain (${match[1]} days old)`;
    }
  },
  {
    pattern: /^ Very new domain \((\d+) days old\)$/,
    translate: (match, lang) => {
      return lang === 'ko'
        ? ` 매우 새로운 도메인 (${match[1]}일)`
        : ` Very new domain (${match[1]} days old)`;
    }
  },

  // SSL patterns
  {
    pattern: /^✓ SSL Grade: ([A-F][+-]?)\n(.+)$/s,
    translate: (match, lang) => {
      if (lang === 'ko') {
        let breakdown = match[2];
        breakdown = breakdown.replace(/Perfect forward secrecy supported/g, '완전 순방향 비밀성 지원');
        breakdown = breakdown.replace(/Strong TLS protocol/g, '강력한 TLS 프로토콜');
        breakdown = breakdown.replace(/Modern cipher suite/g, '최신 암호화 스위트');
        breakdown = breakdown.replace(/HSTS enabled/g, 'HSTS 활성화');
        breakdown = breakdown.replace(/Weak TLS version supported/g, '약한 TLS 버전 지원');
        breakdown = breakdown.replace(/HSTS not enabled/g, 'HSTS 비활성화');
        return `✓ SSL 등급: ${match[1]}\n${breakdown}`;
      }
      return `✓ SSL Grade: ${match[1]}\n${match[2]}`;
    }
  },
  {
    pattern: /^✓ Valid SSL certificate \(Grade: ([A-F][+-]?)\)$/,
    translate: (match, lang) => {
      return lang === 'ko'
        ? `✓ 유효한 SSL 인증서 (등급: ${match[1]})`
        : `✓ Valid SSL certificate (Grade: ${match[1]})`;
    }
  },
  {
    pattern: /^Protocol: (.+)$/m,
    translate: (match, lang) => {
      return lang === 'ko'
        ? `프로토콜: ${match[1]}`
        : `Protocol: ${match[1]}`;
    }
  },
  {
    pattern: /^Issuer: (.+)$/m,
    translate: (match, lang) => {
      return lang === 'ko'
        ? `발급자: ${match[1]}`
        : `Issuer: ${match[1]}`;
    }
  },
  {
    pattern: /^ Expires in (\d+) days$/m,
    translate: (match, lang) => {
      return lang === 'ko'
        ? ` ${match[1]}일 후 만료`
        : ` Expires in ${match[1]} days`;
    }
  },
  {
    pattern: /^Valid for (\d+) days$/m,
    translate: (match, lang) => {
      return lang === 'ko'
        ? `${match[1]}일 동안 유효`
        : `Valid for ${match[1]} days`;
    }
  },

  // Status patterns - handles multiple comma-separated statuses
  {
    pattern: /^Status: (.+)$/m,
    translate: (match, lang) => {
      if (lang === 'ko') {
        // Split by comma to handle multiple statuses
        let statuses = match[1].split(',').map(s => s.trim());
        let translatedStatuses = statuses.map(status => {
          // Domain status messages
          status = status.replace(/ Domain on hold \(suspended\)/g, ' 도메인 보류 중 (정지됨)');
          status = status.replace(/ Server hold \(critical issue\)/g, ' 서버 보류 (심각한 문제)');
          status = status.replace(/ In redemption period \(expired\)/g, ' 복구 기간 중 (만료됨)');
          status = status.replace(/ Pending deletion/g, ' 삭제 대기 중');
          status = status.replace(/Domain inactive/g, '도메인 비활성');
          status = status.replace(/✓ Transfer protection enabled/g, '✓ 전송 보호 활성화');
          status = status.replace(/✓ Delete protection enabled/g, '✓ 삭제 보호 활성화');
          status = status.replace(/✓ Registry-level transfer lock/g, '✓ 레지스트리 수준 전송 잠금');
          status = status.replace(/✓ Normal status/g, '✓ 정상 상태');
          status = status.replace(/Standard registration status/g, '표준 등록 상태');
          // Raw status codes
          status = status.replace(/clientTransferProhibited/g, '클라이언트 전송 금지');
          status = status.replace(/serverTransferProhibited/g, '서버 전송 금지');
          status = status.replace(/clientDeleteProhibited/g, '클라이언트 삭제 금지');
          status = status.replace(/serverDeleteProhibited/g, '서버 삭제 금지');
          status = status.replace(/ok/g, '정상');
          return status;
        });
        return `상태: ${translatedStatuses.join(', ')}`;
      }
      return `Status: ${match[1]}`;
    }
  },

  // Individual status message patterns (not preceded by "Status:")
  {
    pattern: /^ Domain on hold \(suspended\)$/,
    translate: (match, lang) => {
      return lang === 'ko' ? ' 도메인 보류 중 (정지됨)' : match[0];
    }
  },
  {
    pattern: /^ Server hold \(critical issue\)$/,
    translate: (match, lang) => {
      return lang === 'ko' ? ' 서버 보류 (심각한 문제)' : match[0];
    }
  },
  {
    pattern: /^ In redemption period \(expired\)$/,
    translate: (match, lang) => {
      return lang === 'ko' ? ' 복구 기간 중 (만료됨)' : match[0];
    }
  },
  {
    pattern: /^ Pending deletion$/,
    translate: (match, lang) => {
      return lang === 'ko' ? ' 삭제 대기 중' : match[0];
    }
  },
  {
    pattern: /^Domain inactive$/,
    translate: (match, lang) => {
      return lang === 'ko' ? '도메인 비활성' : match[0];
    }
  },
  {
    pattern: /^✓ Transfer protection enabled$/,
    translate: (match, lang) => {
      return lang === 'ko' ? '✓ 전송 보호 활성화' : match[0];
    }
  },
  {
    pattern: /^✓ Delete protection enabled$/,
    translate: (match, lang) => {
      return lang === 'ko' ? '✓ 삭제 보호 활성화' : match[0];
    }
  },
  {
    pattern: /^✓ Registry-level transfer lock$/,
    translate: (match, lang) => {
      return lang === 'ko' ? '✓ 레지스트리 수준 전송 잠금' : match[0];
    }
  },
  {
    pattern: /^✓ Normal status$/,
    translate: (match, lang) => {
      return lang === 'ko' ? '✓ 정상 상태' : match[0];
    }
  },
  {
    pattern: /^Standard registration status$/,
    translate: (match, lang) => {
      return lang === 'ko' ? '표준 등록 상태' : match[0];
    }
  },

  // Reputation database detection patterns
  {
    pattern: /^Detected in (\d+) database\(s\): (.+)$/,
    translate: (match, lang) => {
      return lang === 'ko'
        ? `${match[1]}개 데이터베이스에서 탐지됨: ${match[2]}`
        : match[0];
    }
  },
  {
    pattern: /^Detected in (\d+) database\(s\)$/,
    translate: (match, lang) => {
      return lang === 'ko'
        ? `${match[1]}개 데이터베이스에서 탐지됨`
        : match[0];
    }
  },

  // Safe Browsing score patterns
  {
    pattern: /^✓ Typosquatting check: (\d+)\/(\d+) points$/,
    translate: (match, lang) => {
      return lang === 'ko'
        ? `✓ 타이포스쿼팅 검사`
        : match[0];
    }
  },
  {
    pattern: /^✓ Pattern analysis: (\d+)\/(\d+) points$/,
    translate: (match, lang) => {
      return lang === 'ko'
        ? `✓ 패턴 분석`
        : match[0];
    }
  },
  {
    pattern: /^✓ Google Safe Browsing: (\d+)\/(\d+) points$/,
    translate: (match, lang) => {
      return lang === 'ko'
        ? `✓ Google 안전 브라우징`
        : match[0];
    }
  },

  // Confidence levels
  {
    pattern: /^High confidence - (.+)$/,
    translate: (match, lang) => {
      if (lang === 'ko') {
        let status = match[1];
        status = status.replace(/likely safe/g, '안전할 가능성 높음');
        status = status.replace(/likely dangerous/g, '위험할 가능성 높음');
        status = status.replace(/suspicious/g, '의심스러움');
        return `높은 신뢰도 - ${status}`;
      }
      return match[0];
    }
  },
  {
    pattern: /^Medium confidence - (.+)$/,
    translate: (match, lang) => {
      if (lang === 'ko') {
        let status = match[1];
        status = status.replace(/likely safe/g, '안전할 가능성 높음');
        status = status.replace(/likely dangerous/g, '위험할 가능성 높음');
        status = status.replace(/suspicious/g, '의심스러움');
        return `보통 신뢰도 - ${status}`;
      }
      return match[0];
    }
  },
  {
    pattern: /^Low confidence - (.+)$/,
    translate: (match, lang) => {
      if (lang === 'ko') {
        let status = match[1];
        status = status.replace(/likely safe/g, '안전할 가능성 높음');
        status = status.replace(/likely dangerous/g, '위험할 가능성 높음');
        status = status.replace(/suspicious/g, '의심스러움');
        return `낮은 신뢰도 - ${status}`;
      }
      return match[0];
    }
  }
];

// Summary 번역
export function translateSummary(domain: string, score: number, status: string, isExchange: boolean, lang: 'ko' | 'en'): string {
  if (lang === 'en') {
    if (status === 'safe') {
      if (isExchange) {
        return `${domain} is a verified cryptocurrency exchange with excellent security credentials.`;
      }
      return `${domain} appears to be safe with a trust score of ${score}/100.`;
    } else if (status === 'warning') {
      return `${domain} has some concerns. Proceed with caution (score: ${score}/100).`;
    } else {
      return `${domain} has significant security risks. Not recommended (score: ${score}/100).`;
    }
  }

  // Korean
  if (status === 'safe') {
    if (isExchange) {
      return `${domain}은(는) 우수한 보안 자격을 갖춘 검증된 암호화폐 거래소입니다.`;
    }
    return `${domain}은(는) 신뢰도 점수 ${score}/100으로 안전한 것으로 보입니다.`;
  } else if (status === 'warning') {
    return `${domain}에는 몇 가지 우려 사항이 있습니다. 주의하여 진행하세요 (점수: ${score}/100).`;
  } else {
    return `${domain}은(는) 심각한 보안 위험이 있습니다. 권장하지 않습니다 (점수: ${score}/100).`;
  }
}

// Recommendations 번역
const recommendationTranslations: Record<string, { ko: string; en: string }> = {
  'This site appears to be safe for use.': {
    ko: '이 사이트는 안전하게 사용할 수 있는 것으로 보입니다.',
    en: 'This site appears to be safe for use.'
  },
  'This is a recognized cryptocurrency exchange.': {
    ko: '인증된 암호화폐 거래소입니다.',
    en: 'This is a recognized cryptocurrency exchange.'
  },
  // With emojis
  ' CRITICAL: Team scam mission detected - avoid at all costs.': {
    ko: ' 위험: 팀 스캠 미션이 감지됨 - 절대 피하세요.',
    en: ' CRITICAL: Team scam mission detected - avoid at all costs.'
  },
  ' CRITICAL: Cryptocurrency exchange impersonation detected.': {
    ko: ' 위험: 암호화폐 거래소 사칭이 감지됨.',
    en: ' CRITICAL: Cryptocurrency exchange impersonation detected.'
  },
  ' WARNING: Korean cryptocurrency scam patterns detected.': {
    ko: ' 경고: 한국 암호화폐 스캠 패턴이 감지됨.',
    en: ' WARNING: Korean cryptocurrency scam patterns detected.'
  },
  ' Avoid entering sensitive information - no valid SSL certificate.': {
    ko: ' 민감한 정보 입력을 피하세요 - 유효한 SSL 인증서가 없습니다.',
    en: ' Avoid entering sensitive information - no valid SSL certificate.'
  },
  ' Be cautious - this is a very new domain.': {
    ko: ' 주의하세요 - 매우 새로운 도메인입니다.',
    en: ' Be cautious - this is a very new domain.'
  },
  ' High risk - domain has poor reputation or is blacklisted.': {
    ko: ' 고위험 - 도메인의 평판이 나쁘거나 블랙리스트에 있습니다.',
    en: ' High risk - domain has poor reputation or is blacklisted.'
  },
  ' Google Safe Browsing has detected threats on this site.': {
    ko: ' Google 안전 브라우징이 이 사이트에서 위협을 감지했습니다.',
    en: ' Google Safe Browsing has detected threats on this site.'
  },
  ' Strongly recommend avoiding this site.': {
    ko: ' 이 사이트를 피할 것을 강력히 권장합니다.',
    en: ' Strongly recommend avoiding this site.'
  },
  ' For crypto safety: Only use official exchange apps and websites.': {
    ko: ' 암호화폐 안전을 위해: 공식 거래소 앱과 웹사이트만 사용하세요.',
    en: ' For crypto safety: Only use official exchange apps and websites.'
  },
  ' Verify URLs through official social media or support channels.': {
    ko: ' 공식 소셜 미디어나 지원 채널을 통해 URL을 확인하세요.',
    en: ' Verify URLs through official social media or support channels.'
  },
  // Without emojis (from updated API) - 정확한 매칭
  'CRITICAL: Team scam mission detected - avoid at all costs.': {
    ko: '🚨 위험: 팀 스캠 미션이 감지됨 - 절대 피하세요.',
    en: 'CRITICAL: Team scam mission detected - avoid at all costs.'
  },
  'CRITICAL: Cryptocurrency exchange impersonation detected.': {
    ko: '🚨 위험: 암호화폐 거래소 사칭이 감지됨.',
    en: 'CRITICAL: Cryptocurrency exchange impersonation detected.'
  },
  'WARNING: Korean cryptocurrency scam patterns detected.': {
    ko: '⚠️ 경고: 한국 암호화폐 스캠 패턴이 감지됨.',
    en: 'WARNING: Korean cryptocurrency scam patterns detected.'
  },
  'Avoid entering sensitive information - no valid SSL certificate.': {
    ko: '⚠️ 민감한 정보 입력을 피하세요 - 유효한 SSL 인증서가 없습니다.',
    en: 'Avoid entering sensitive information - no valid SSL certificate.'
  },
  'Be cautious - this is a very new domain.': {
    ko: '⚠️ 주의하세요 - 매우 새로운 도메인입니다.',
    en: 'Be cautious - this is a very new domain.'
  },
  'High risk - domain has poor reputation or is blacklisted.': {
    ko: '🚨 고위험 - 도메인의 평판이 나쁘거나 블랙리스트에 있습니다.',
    en: 'High risk - domain has poor reputation or is blacklisted.'
  },
  'Google Safe Browsing has detected threats on this site.': {
    ko: '🚨 Google 안전 브라우징이 이 사이트에서 위협을 감지했습니다.',
    en: 'Google Safe Browsing has detected threats on this site.'
  },
  'Strongly recommend avoiding this site.': {
    ko: '❌ 이 사이트를 피할 것을 강력히 권장합니다.',
    en: 'Strongly recommend avoiding this site.'
  },
  'Consider using well-known exchanges like Binance, Coinbase, or Kraken.': {
    ko: '💡 Binance, Coinbase, Kraken과 같은 유명 거래소 사용을 고려하세요.',
    en: 'Consider using well-known exchanges like Binance, Coinbase, or Kraken.'
  },
  'For crypto safety: Only use official exchange apps and websites.': {
    ko: '🔐 암호화폐 안전을 위해: 공식 거래소 앱과 웹사이트만 사용하세요.',
    en: 'For crypto safety: Only use official exchange apps and websites.'
  },
  'Verify URLs through official social media or support channels.': {
    ko: '📱 공식 소셜 미디어나 지원 채널을 통해 URL을 확인하세요.',
    en: 'Verify URLs through official social media or support channels.'
  }
};

export function translateRecommendation(recommendation: string, lang: 'ko' | 'en'): string {
  // 정확한 매칭
  if (recommendationTranslations[recommendation]) {
    return recommendationTranslations[recommendation][lang];
  }

  // 동적 URL 패턴 처리 (with emoji)
  const urlPatternWithEmoji = /^Use the official site instead: (.+)$/;
  let match = recommendation.match(urlPatternWithEmoji);
  if (match) {
    return lang === 'ko'
      ? `대신 공식 사이트를 사용하세요: ${match[1]}`
      : recommendation;
  }

  // 동적 URL 패턴 처리 (without emoji)
  const urlPatternWithoutEmoji = /^Use the official site instead: (.+)$/;
  match = recommendation.match(urlPatternWithoutEmoji);
  if (match) {
    return lang === 'ko'
      ? `대신 공식 사이트를 사용하세요: ${match[1]}`
      : recommendation;
  }

  return recommendation;
}

export function translateMessage(message: string, lang: 'ko' | 'en'): string {
  // 디버깅: Domain on hold 관련 메시지 로깅
  if (message.includes('Domain on hold') || message.includes('suspended')) {
    console.log('Domain status message:', JSON.stringify(message));
  }

  // 1. 정확한 매칭 먼저 확인
  if (messageTranslations[message]) {
    return messageTranslations[message][lang];
  }

  // 2. 여러 줄 메시지 처리
  const lines = message.split('\n');
  let translatedLines = lines.map(line => {
    // 각 줄에 대해 번역 시도
    if (messageTranslations[line]) {
      return messageTranslations[line][lang];
    }

    // 패턴 매칭 시도
    for (const { pattern, translate } of messagePatterns) {
      const match = line.match(pattern);
      if (match) {
        return translate(match, lang);
      }
    }

    return line; // 번역 못 찾으면 원본 반환
  });

  // 3. 전체 메시지에 대한 패턴 매칭
  for (const { pattern, translate } of messagePatterns) {
    const match = message.match(pattern);
    if (match) {
      return translate(match, lang);
    }
  }

  // 4. 번역이 있는 경우 합쳐서 반환, 없으면 원본 반환
  return translatedLines.join('\n');
}