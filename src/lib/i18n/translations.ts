export const translations = {
  ko: {
    // 메타데이터
    meta: {
      title: '크립토가디언 - 암호화폐 사이트 보안 검증',
      description: '암호화폐 거래소 및 관련 웹사이트의 보안과 신뢰도를 실시간으로 검증합니다',
      keywords: '암호화폐, 보안, 검증, 거래소, 스캠, 피싱, 안전'
    },

    // 헤더
    header: {
      logo: '크립토가디언',
      tagline: '암호화폐 사이트 보안 검증 서비스',
      nav: {
        home: '홈',
        about: '소개',
        api: 'API',
        contact: '문의'
      }
    },

    // 메인 페이지
    main: {
      title: '암호화폐 사이트 안전성을 검증하세요',
      subtitle: '거래소, DeFi, NFT 마켓플레이스 등 모든 암호화폐 관련 사이트의 보안 상태를 즉시 확인',
      inputPlaceholder: 'URL 또는 도메인을 입력하세요 (예: binance.com)',
      checkButton: '보안 검증하기',
      checkingButton: '검증 중...',
      features: {
        trusted: '신뢰할 수 있는 데이터 소스',
        instant: '실시간 검증',
        secure: 'SSL 및 보안 검사'
      },
      featuresDetailed: {
        realtime: {
          title: '실시간 분석',
          description: '웹사이트 신뢰성과 보안 상태에 대한 실시간 검증'
        },
        ssl: {
          title: 'SSL 및 보안 검사',
          description: '포괄적인 SSL 인증서와 보안 프로토콜 검증'
        },
        trustScore: {
          title: '신뢰도 점수 시스템',
          description: '여러 보안 매개변수를 기반으로 한 명확한 0-100 점수'
        }
      },
      liveStats: {
        title: '실시간 통계',
        sitesAnalyzed: '분석된 사이트',
        detectionRate: '탐지율',
        scamsDetected: '탐지된 스캠',
        monitoring: '모니터링'
      },
      recentChecks: '최근 검증 내역',
      popularSites: '인기 거래소',
      stats: {
        totalChecks: '총 검증 수',
        safeSites: '안전 사이트',
        threats: '위협 차단'
      }
    },

    // 결과 페이지
    results: {
      backButton: '다시 검증하기',
      title: '검증 결과',
      trustScore: '신뢰도 점수',
      status: {
        safe: '안전',
        warning: '주의',
        danger: '위험',
        verySafe: '매우 안전',
        suspicious: '의심스러움',
        veryDangerous: '매우 위험'
      },
      checkItems: '검증 항목',
      checks: {
        exchange: {
          title: '거래소 검증',
          verified: '검증된 암호화폐 거래소',
          notVerified: '미검증 거래소',
          unknown: '거래소 정보 없음',
          fake: '가짜 거래소 의심'
        },
        ssl: {
          title: 'SSL 인증서',
          valid: '유효한 SSL 인증서',
          invalid: '유효하지 않은 SSL 인증서',
          expired: '만료된 SSL 인증서',
          missing: 'SSL 인증서 없음'
        },
        security: {
          title: '보안 검사',
          clean: '보안 위협 없음',
          blacklisted: '블랙리스트 등록됨',
          phishing: '피싱 사이트 의심',
          malware: '악성코드 탐지'
        },
        domain: {
          title: '도메인 정보',
          age: '도메인 등록',
          new: '신규 도메인 (주의 필요)',
          established: '오래된 도메인 (신뢰도 높음)',
          years: '년',
          months: '개월',
          days: '일'
        },
        reputation: {
          title: '평판 점수',
          excellent: '우수한 평판',
          good: '양호한 평판',
          neutral: '보통 평판',
          poor: '나쁜 평판',
          terrible: '매우 나쁜 평판'
        }
      },
      details: {
        title: '상세 정보',
        checkTime: '검증 일시',
        refreshButton: '재검증',
        shareButton: '결과 공유',
        reportButton: '신고하기'
      },
      recommendations: {
        title: '권장 사항',
        safe: [
          '이 사이트는 안전한 것으로 확인되었습니다',
          '정상적인 거래 활동을 진행하셔도 됩니다',
          '그러나 항상 2단계 인증을 사용하시기 바랍니다'
        ],
        warning: [
          '이 사이트 이용 시 주의가 필요합니다',
          '소액으로 먼저 테스트해보시기 바랍니다',
          '개인정보 입력을 최소화하세요'
        ],
        danger: [
          '이 사이트는 위험할 수 있습니다',
          '거래를 중단하고 자산을 안전한 곳으로 이동하세요',
          '절대 개인키나 시드구문을 입력하지 마세요'
        ]
      },
      checkNames: {
        'Domain Registration': '도메인 등록',
        'SSL Certificate': 'SSL 인증서',
        'Reputation Check': '평판 검사',
        'Exchange Verification': '거래소 검증',
        'Safe Browsing': '안전 브라우징',
        'Team Scam Detection': '팀 스캠 감지',
        'Exchange Impersonation Check': '거래소 사칭 검사',
        'Korean Crypto Scam Check': '한국 크립토 스캠 검사'
      },
      hardcodedTexts: {
        error: '오류',
        tryAgain: '다시 시도',
        viewWhois: 'WHOIS 보기',
        sslLabs: 'SSL 검사',
        ctLogs: 'CT 로그',
        googleCT: 'Google CT',
        safeBrowsing: '안전 브라우징',
        sucuri: 'Sucuri',
        urlVoid: 'URLVoid',
        detectedIn: '다음에서 탐지됨',
        cleanInAllDatabases: '모든 데이터베이스에서 안전',
        checked: '확인됨',
        score: '점수',
        weight: '가중치',
        recommendations: '권장 사항',
        lastChecked: '마지막 확인',
        resultsFromCache: '캐시된 결과'
      }
    },

    // 에러 메시지
    errors: {
      invalidUrl: '유효한 URL 또는 도메인을 입력해주세요',
      networkError: '네트워크 오류가 발생했습니다',
      serverError: '서버 오류가 발생했습니다',
      notFound: '사이트를 찾을 수 없습니다',
      timeout: '검증 시간이 초과되었습니다',
      rateLimit: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요'
    },

    // 푸터
    footer: {
      copyright: '© 2025 크립토가디언. All rights reserved.',
      disclaimer: '면책조항: 이 서비스는 참고용이며, 투자 조언이 아닙니다.',
      privacy: '개인정보처리방침',
      terms: '이용약관',
      contact: '문의하기'
    }
  },

  en: {
    // Metadata
    meta: {
      title: 'CryptoGuardian - Crypto Site Security Verification',
      description: 'Real-time security and trust verification for cryptocurrency exchanges and related websites',
      keywords: 'cryptocurrency, security, verification, exchange, scam, phishing, safety'
    },

    // Header
    header: {
      logo: '🛡️ CryptoGuardian',
      tagline: 'Crypto Site Security Verification Service',
      nav: {
        home: 'Home',
        about: 'About',
        api: 'API',
        contact: 'Contact'
      }
    },

    // Main page
    main: {
      title: 'Verify Cryptocurrency Websites Before You Trade',
      subtitle: 'Instant security analysis and trust scores for crypto exchanges, wallets, and DeFi platforms. Protect yourself from scams and fraudulent websites.',
      inputPlaceholder: 'Enter website URL or domain (e.g., binance.com)',
      checkButton: 'Check Website',
      checkingButton: 'Checking...',
      features: {
        trusted: 'Trusted data sources',
        instant: 'Real-time verification',
        secure: 'SSL & Security checks'
      },
      featuresDetailed: {
        realtime: {
          title: 'Real-time Analysis',
          description: 'Live verification of website legitimacy and security status'
        },
        ssl: {
          title: 'SSL & Security Checks',
          description: 'Comprehensive SSL certificate and security protocol validation'
        },
        trustScore: {
          title: 'Trust Score System',
          description: 'Clear 0-100 scoring based on multiple security parameters'
        }
      },
      liveStats: {
        title: 'Live Statistics',
        sitesAnalyzed: 'Sites Analyzed',
        detectionRate: 'Detection Rate',
        scamsDetected: 'Scams Detected',
        monitoring: 'Monitoring'
      },
      recentChecks: 'Recent Verifications',
      popularSites: 'Popular Exchanges',
      stats: {
        totalChecks: 'Total Checks',
        safeSites: 'Safe Sites',
        threats: 'Threats Blocked'
      }
    },

    // Results page
    results: {
      backButton: '← Check Another',
      title: 'Verification Results',
      trustScore: 'Trust Score',
      status: {
        safe: 'Safe',
        warning: 'Warning',
        danger: 'Danger',
        verySafe: 'Very Safe',
        suspicious: 'Suspicious',
        veryDangerous: 'Very Dangerous'
      },
      checkItems: 'Verification Items',
      checks: {
        exchange: {
          title: 'Exchange Verification',
          verified: 'Verified cryptocurrency exchange',
          notVerified: 'Unverified exchange',
          unknown: 'No exchange information',
          fake: 'Suspected fake exchange'
        },
        ssl: {
          title: 'SSL Certificate',
          valid: 'Valid SSL certificate',
          invalid: 'Invalid SSL certificate',
          expired: 'Expired SSL certificate',
          missing: 'No SSL certificate'
        },
        security: {
          title: 'Security Check',
          clean: 'No security threats',
          blacklisted: 'Blacklisted',
          phishing: 'Suspected phishing site',
          malware: 'Malware detected'
        },
        domain: {
          title: 'Domain Information',
          age: 'Domain registered',
          new: 'New domain (caution needed)',
          established: 'Established domain (high trust)',
          years: 'years',
          months: 'months',
          days: 'days'
        },
        reputation: {
          title: 'Reputation Score',
          excellent: 'Excellent reputation',
          good: 'Good reputation',
          neutral: 'Neutral reputation',
          poor: 'Poor reputation',
          terrible: 'Terrible reputation'
        }
      },
      details: {
        title: 'Details',
        checkTime: 'Verification time',
        refreshButton: 'Re-verify',
        shareButton: 'Share Results',
        reportButton: 'Report'
      },
      recommendations: {
        title: 'Recommendations',
        safe: [
          'This site has been confirmed as safe',
          'You may proceed with normal trading activities',
          'However, always use two-factor authentication'
        ],
        warning: [
          'Caution is needed when using this site',
          'Test with small amounts first',
          'Minimize personal information input'
        ],
        danger: [
          'This site may be dangerous',
          'Stop trading and move assets to a safe place',
          'Never enter private keys or seed phrases'
        ]
      },
      checkNames: {
        'Domain Registration': 'Domain Registration',
        'SSL Certificate': 'SSL Certificate',
        'Reputation Check': 'Reputation Check',
        'Exchange Verification': 'Exchange Verification',
        'Safe Browsing': 'Safe Browsing',
        'Team Scam Detection': 'Team Scam Detection',
        'Exchange Impersonation Check': 'Exchange Impersonation Check',
        'Korean Crypto Scam Check': 'Korean Crypto Scam Check'
      },
      hardcodedTexts: {
        error: 'Error',
        tryAgain: 'Try Again',
        viewWhois: 'View WHOIS',
        sslLabs: 'SSL Labs',
        ctLogs: 'CT Logs',
        googleCT: 'Google CT',
        safeBrowsing: 'Safe Browsing',
        sucuri: 'Sucuri',
        urlVoid: 'URLVoid',
        detectedIn: 'Detected in',
        cleanInAllDatabases: 'Clean in all databases',
        checked: 'Checked',
        score: 'Score',
        weight: 'Weight',
        recommendations: 'Recommendations',
        lastChecked: 'Last checked',
        resultsFromCache: 'Results from cache'
      }
    },

    // Error messages
    errors: {
      invalidUrl: 'Please enter a valid URL or domain',
      networkError: 'Network error occurred',
      serverError: 'Server error occurred',
      notFound: 'Site not found',
      timeout: 'Verification timeout',
      rateLimit: 'Too many requests. Please try again later'
    },

    // Footer
    footer: {
      copyright: '© 2025 CryptoGuardian. All rights reserved.',
      disclaimer: 'Disclaimer: This service is for reference only, not investment advice.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      contact: 'Contact Us'
    }
  }
}

export type Language = keyof typeof translations
export type TranslationKey = typeof translations.ko