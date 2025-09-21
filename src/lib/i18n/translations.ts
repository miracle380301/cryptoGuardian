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
        faq: 'FAQ',
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
      loading: {
        title: '보안 검사 진행 중',
        subtitle: '도메인 보안성을 분석하고 있습니다',
        progress: '진행률',
        steps: {
          domainInfo: {
            title: '도메인 정보 수집 중...',
            description: 'DNS 레코드 및 도메인 정보를 조회하고 있습니다.'
          },
          securityDatabase: {
            title: '보안 데이터베이스 확인 중...',
            description: '악성 사이트 데이터베이스에서 위협 정보를 확인하고 있습니다.'
          },
          sslVerification: {
            title: 'SSL 인증서 검증 중...',
            description: '보안 인증서의 유효성과 암호화 강도를 검사하고 있습니다.'
          },
          reputationAnalysis: {
            title: '평판 정보 분석 중...',
            description: '다양한 보안 기관의 평판 정보를 종합 분석하고 있습니다.'
          },
          finalResults: {
            title: '최종 결과 생성 중...',
            description: '수집된 모든 정보를 바탕으로 보안 점수를 계산하고 있습니다.'
          }
        }
      },
      searchTypes: {
        general: {
          label: '일반 도메인',
          placeholder: 'URL 또는 도메인을 입력하세요 (예: example.com)'
        },
        crypto: {
          label: '암호화폐 관련',
          placeholder: '암호화폐 거래소나 관련 사이트 입력 (예: binance.com)'
        }
      },
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
      report: {
        title: '사이트 신고',
        description: '의심스러운 사이트를 신고해주세요',
        domain: '도메인',
        reportType: '신고 유형',
        reportTypes: {
          phishing: '피싱 사이트',
          scam: '스캠 사이트',
          malware: '악성코드',
          'fake-exchange': '가짜 거래소',
          other: '기타'
        },
        reportDescription: '신고 내용',
        reportDescriptionPlaceholder: '발견한 문제점이나 피해 사례를 자세히 설명해주세요',
        reporterEmail: '신고자 이메일',
        reporterEmailPlaceholder: '연락 가능한 이메일 주소',
        evidence: '증거 자료',
        evidencePlaceholder: '관련 URL이나 스크린샷 설명 (선택사항)',
        submitButton: '신고 제출',
        submittingButton: '제출 중...',
        cancelButton: '취소',
        successMessage: '신고가 성공적으로 접수되었습니다',
        successDescription: '검토 후 조치하겠습니다',
        errorMessage: '신고 제출에 실패했습니다',
        errorDescription: '잠시 후 다시 시도해주세요',
        alreadyReported: '이미 신고하셨습니다',
        alreadyReportedDescription: '동일한 이메일로 이미 신고하신 도메인입니다',
        okButton: '확인'
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
        'Malicious Site Check': '악성 사이트 검사',
        'Exchange Verification': '거래소 검증',
        'Safe Browsing': '안전 브라우징',
        'User Reports Check': '사용자 신고 검사',
        'Team Scam Detection': '팀 스캠 감지',
        'Exchange Impersonation Check': '거래소 사칭 검사',
        'Korean Crypto Scam Check': '한국 크립토 스캠 검사',
        'AI Phishing Pattern Analysis': 'AI 피싱 패턴 분석',
        'AI Suspicious Domain Detection': 'AI 의심 도메인 탐지'
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
      },
      exchangeInfo: {
        title: '거래소 정보',
        exchangeName: '거래소명',
        verificationStatus: '검증 상태',
        verified: '검증됨',
        notVerified: '검증되지 않음',
        country: '국가',
        establishedYear: '설립연도',
        officialWebsite: '공식 웹사이트',
        dataSource: '데이터 출처',
        dataCollectionDate: '데이터 수집일',
        lastUpdate: '마지막 업데이트',
        score: '점수',
        alert: '알림'
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
    },

    // Privacy Policy page
    privacy: {
      title: '개인정보처리방침',
      sections: {
        collection: {
          title: '1. 개인정보 수집 및 이용',
          description: 'CryptoGuardian은 기본적으로 개인정보를 수집하지 않으며, 신고 기능 사용 시에만 최소한의 정보를 수집합니다.',
          items: ['일반 사용: 개인정보 수집 없음 (쿠키를 통한 언어 설정만 저장)', '신고 기능 사용 시 수집 항목: 신고 내용, IP 주소 (스팸 방지용)', '수집 목적: 악성 사이트 차단 및 스팸 방지', '보유 기간: 30일 (이후 자동 삭제)']
        },
        report: {
          title: '2. 신고 기능 상세',
          description: '사이트 신고 기능 사용 시 수집되는 정보:',
          items: ['이메일 주소 (선택사항)', '신고 내용 및 증거 자료', '신고 일시', 'IP 주소 (스팸 방지 및 중복 신고 확인용)'],
          note: '신고 정보는 악성 사이트 차단 목적으로만 사용되며, 제3자에게 제공되지 않습니다. IP 주소는 익명화되어 저장됩니다.'
        },
        cookies: {
          title: '3. 쿠키 및 로컬 저장소 사용',
          description: '본 서비스는 다음과 같은 목적으로 쿠키와 로컬 저장소를 사용합니다:',
          items: ['언어 설정 저장 (로컬 저장소)', '최근 검증 내역 저장 (로컬 저장소, 사용자 기기에만 저장)', '개인정보를 포함하지 않는 기능적 쿠키만 사용']
        },
        security: {
          title: '4. 데이터 보안',
          description: '모든 데이터 전송은 HTTPS를 통해 암호화되며, 서버에 저장되는 데이터는 최소화됩니다. 사용자의 개인정보는 암호화되어 저장되며, 정기적인 보안 점검을 실시합니다.'
        },
        thirdParty: {
          title: '5. 제3자 제공',
          description: 'CryptoGuardian은 다음의 경우를 제외하고 사용자의 개인정보를 제3자에게 제공하지 않습니다:',
          items: ['사용자의 동의가 있는 경우', '법령에 따른 요구가 있는 경우', '수사기관의 적법한 요청이 있는 경우']
        },
        rights: {
          title: '6. 사용자의 권리',
          description: '사용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:',
          items: ['개인정보 열람 요구', '개인정보 정정 및 삭제 요구', '개인정보 처리 정지 요구'],
          note: '권리 행사를 위해서는 문의하기 페이지를 통해 요청해 주시기 바랍니다.'
        },
        officer: {
          title: '7. 개인정보 보호책임자',
          email: '이메일: cryptoguardian380301@gmail.com',
          description: '개인정보 처리와 관련한 문의사항이 있으시면 위 연락처로 문의해 주시기 바랍니다.'
        },
        revision: {
          title: '8. 개정 안내',
          effectiveDate: '본 방침은 2025년 9월 21일부터 시행됩니다.',
          description: '법령이나 서비스 변경사항을 반영하기 위해 개정될 수 있으며, 개정 시 웹사이트를 통해 공지합니다.'
        }
      },
      backToHome: '홈으로 돌아가기'
    },

    // Terms of Service page
    terms: {
      title: '이용약관',
      sections: {
        purpose: {
          title: '제 1조 (목적)',
          content: '본 약관은 CryptoGuardian(이하 "서비스")이 제공하는 암호화폐 사이트 보안 검증 서비스의 이용에 관한 조건 및 절차, 서비스 제공자와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.'
        },
        service: {
          title: '제 2조 (서비스의 내용)',
          description: '서비스는 다음과 같은 기능을 제공합니다:',
          items: ['암호화폐 관련 웹사이트의 보안 상태 검증', '도메인 정보 및 SSL 인증서 확인', '블랙리스트 데이터베이스 조회', '거래소 정보 제공', '악성 사이트 신고 기능']
        },
        usage: {
          title: '제 3조 (서비스 이용)',
          items: ['서비스는 무료로 제공되며, 누구나 이용할 수 있습니다.', '서비스 이용 시 하루 검증 횟수에 제한이 있을 수 있습니다.', '자동화된 방법(봇, 스크립트 등)을 통한 대량 검증은 금지됩니다.', '서비스를 악용하여 타인에게 피해를 주는 행위는 금지됩니다.']
        },
        disclaimer: {
          title: '제 4조 (면책조항)',
          items: ['본 서비스는 참고 정보를 제공하는 것이며, 투자 조언이 아닙니다.', '검증 결과는 100% 정확하지 않을 수 있으며, 최종 투자 결정은 이용자의 책임입니다.'],
          notLiable: '서비스 제공자는 다음의 경우 책임을 지지 않습니다:',
          notLiableItems: ['검증 결과를 맹신하여 발생한 손실', '제3자 데이터 소스의 오류로 인한 잘못된 정보', '천재지변, 시스템 장애 등으로 인한 서비스 중단', '이용자의 귀책사유로 인한 손해']
        },
        intellectual: {
          title: '제 5조 (지적재산권)',
          items: ['서비스에서 제공하는 모든 콘텐츠의 저작권은 CryptoGuardian에 있습니다.', '이용자는 서비스를 통해 얻은 정보를 상업적 목적으로 사용할 수 없습니다.', 'API를 통한 데이터 수집은 별도의 허가가 필요합니다.']
        },
        obligations: {
          title: '제 6조 (이용자의 의무)',
          description: '이용자는 다음 행위를 하여서는 안 됩니다:',
          items: ['허위 정보로 악성 사이트 신고', '서비스의 정상적인 운영을 방해하는 행위', '다른 이용자의 개인정보 수집 시도', '서비스를 이용한 영리 행위', '서비스의 보안 취약점을 악용하는 행위']
        },
        changes: {
          title: '제 7조 (서비스의 변경 및 중단)',
          items: ['서비스 제공자는 운영상 필요에 따라 서비스를 변경하거나 중단할 수 있습니다.', '중요한 변경사항은 웹사이트를 통해 사전 공지합니다.', '서비스 중단으로 인한 손해에 대해서는 책임지지 않습니다.']
        },
        compensation: {
          title: '제 8조 (손해배상)',
          content: '이용자가 본 약관을 위반하여 서비스 제공자에게 손해를 입힌 경우, 이용자는 그 손해를 배상할 책임이 있습니다.'
        },
        dispute: {
          title: '제 9조 (분쟁 해결)',
          items: ['본 약관은 대한민국 법률에 따라 해석되고 집행됩니다.', '서비스 이용과 관련된 분쟁은 서울중앙지방법원을 관할법원으로 합니다.']
        },
        amendment: {
          title: '제 10조 (약관의 개정)',
          items: ['본 약관은 필요에 따라 개정될 수 있습니다.', '개정된 약관은 웹사이트에 공지한 날로부터 7일 후 효력이 발생합니다.', '개정된 약관에 동의하지 않는 경우 서비스 이용을 중단할 수 있습니다.']
        },
        dates: {
          effective: '시행일: 2025년 9월 21일',
          lastModified: '최종 수정일: 2025년 9월 21일'
        }
      },
      backToHome: '홈으로 돌아가기'
    },

    // Contact page
    contactPage: {
      title: '문의하기',
      subtitle: 'CryptoGuardian 서비스에 대한 문의사항이나 제안사항을 보내주세요.',
      inquiryType: '문의 유형',
      inquiryTypes: {
        general: '일반 문의',
        report: '악성 사이트 신고',
        bug: '버그 제보',
        feature: '기능 제안',
        partnership: '제휴 문의'
      },
      form: {
        name: '이름',
        email: '이메일',
        subject: '제목',
        message: '메시지',
        submit: '메시지 보내기',
        sending: '전송 중...',
        success: '✓ 메시지가 전송되었습니다.',
        error: '✗ 전송에 실패했습니다.'
      },
      directContact: {
        title: '직접 연락처',
        general: '일반 문의',
        partnership: '제휴 문의',
        security: '보안 신고'
      },
      responseTime: {
        title: '응답 시간',
        description: '보통 1-2 영업일 내에 답변 드립니다. 보안 관련 긴급 사항은 cryptoguardian380301@gmail.com으로 직접 연락 주시기 바랍니다.'
      },
      notes: {
        title: '참고 사항',
        items: ['• 투자 조언은 제공하지 않습니다', '• 개인 자산 관련 상담 불가', '• 기술 지원은 평일만 가능']
      },
      backToHome: '홈으로 돌아가기'
    },

    // About page
    title: 'CryptoGuardian 소개',
    subtitle: '암호화폐 사이트 보안의 새로운 기준',
    problem: {
      title: '매년 수십억 원의 피해가 발생합니다',
      description1: '2023년 한국에서만 암호화폐 사기로 인한 피해액이 1,000억원을 넘어섰습니다. 가짜 거래소, 피싱 사이트, 스캠 코인 등 수법은 갈수록 정교해지고 있죠.',
      description2: '특히 초보 투자자들은 공식 사이트와 사칭 사이트를 구별하기 어려워 큰 피해를 입고 있습니다. "바이낸스"를 검색했는데 "binance-kr.com" 같은 가짜 사이트에 접속하는 경우가 빈번합니다.'
    },
    solution: {
      title: '우리가 해결하는 방법',
      realtime: {
        title: '실시간 다중 검증',
        description: 'KISA, VirusTotal, URLhaus 등 국내외 주요 보안 데이터베이스를 실시간으로 조회해 위험도를 평가합니다.'
      },
      exchange: {
        title: '거래소 정보 제공',
        description: 'CoinGecko와 CryptoCompare에서 검증된 정식 거래소 정보만 제공. 신뢰도 점수와 거래량으로 안전한 거래소를 추천합니다.'
      },
      community: {
        title: '커뮤니티 신고 시스템',
        description: '사용자들이 직접 의심 사이트를 신고하고 공유. 새로운 사기 수법도 빠르게 차단됩니다.'
      },
      weekly: {
        title: '주간 업데이트',
        description: '매주 자동으로 최신 블랙리스트와 거래소 정보를 업데이트. 항상 최신 정보로 여러분을 보호합니다.'
      }
    },
    partners: {
      title: '신뢰할 수 있는 데이터 파트너',
      kisa: '한국인터넷진흥원',
      exchange: '거래소 데이터',
      malicious: '악성 URL DB'
    },
    stats: {
      title: '현재까지의 성과',
      blocked: '차단된 악성 도메인',
      verified: '검증된 정식 거래소',
      monitoring: '24/7 모니터링'
    },
    howto: {
      title: '간단한 사용법',
      step1: {
        title: '의심되는 URL 입력',
        description: '암호화폐 거래소, 투자 플랫폼, ICO 사이트 등의 웹사이트 주소를 입력하세요.'
      },
      step2: {
        title: '즉시 검증 결과 확인',
        description: '안전, 주의, 위험 3단계로 명확하게 표시됩니다.'
      },
      step3: {
        title: '상세 정보 확인',
        description: '보안 점수, 도메인 정보, 블랙리스트 등록 여부 등을 확인할 수 있습니다.'
      }
    },
    mission: {
      title: '우리의 목표',
      description1: 'CryptoGuardian은 한국의 암호화폐 및 투자자들이 안전하게 자산을 지킬 수 있도록 돕기 위해 만들어졌습니다. 복잡한 보안 지식 없이도 누구나 거래하는 사이트가 신뢰할 수 있는지 확인할 수 있도록 지원합니다.',
      description2: '완벽한 보안은 없지만, 우리는 최신 위협 정보를 지속적으로 수집하고, 가장 빠르고 정확한 검증 서비스를 제공하기 위해 최선을 다하고 있습니다.',
      whyTitle: '왜 만들었나',
      whyDescription1: '현재 우리나라에는 암호화폐와 투자 사이트의 신뢰성을 한눈에 확인할 수 있는 공신력 있는 플랫폼이 없습니다. 사용자들은 어디서부터 정보를 찾아야 할지 혼란스러워하며, 특히 해외 가상화폐 거래소는 더욱 접근하기 어렵습니다.',
      whyDescription2: 'CryptoGuardian은 이런 문제를 해결하고, 사기 피해를 예방할 수 있는 도구가 되고자 합니다. 나아가 이 서비스가 널리 알려져 경찰청, 금융감독원 등 공신력 있는 기관의 인증을 받게 되면, 한국 투자자들의 안전을 지키는 데 큰 도움이 될 것이라 믿습니다.',
      disclaimer: '면책 조항: 본 서비스는 참고용이며, 투자 결정에 대한 최종 책임은 이용자에게 있습니다. 항상 복수의 출처를 확인하고 신중하게 투자하세요.'
    },
    cta: '지금 바로 검증하기',
    // FAQ page
    faq: {
      title: '자주 묻는 질문',
      subtitle: '암호화폐 사기 피해 대응 가이드',
      emergency: {
        title: '🚨 긴급상황 대응',
        description: '암호화폐 사기 피해를 당하셨나요? 즉시 다음 조치를 취하세요.',
        steps: [
          '거래를 즉시 중단하고 계정 비밀번호를 변경하세요',
          '가능하다면 남은 자산을 안전한 곳으로 즉시 이전하세요',
          '사기 사이트의 스크린샷과 거래 내역을 보존하세요',
          '관련 기관에 즉시 신고하세요 (경찰서, 금융감독원)',
          '은행 및 카드사에 연락하여 추가 결제를 차단하세요'
        ]
      },
      reporting: {
        title: '📋 신고 절차',
        description: '암호화폐 사기 피해 신고 방법을 안내합니다.',
        agencies: {
          title: '신고 기관',
          police: {
            name: '사이버수사과 (경찰서)',
            contact: '국번없이 112',
            description: '사기 피해 신고 및 수사 의뢰',
            online: 'https://ecrm.police.go.kr (사이버경찰청)'
          },
          fss: {
            name: '금융감독원',
            contact: '국번없이 1332',
            description: '금융 관련 피해 신고',
            online: 'https://www.fss.or.kr'
          },
          kisa: {
            name: '한국인터넷진흥원 (KISA)',
            contact: '국번없이 118',
            description: '인터넷 사기 및 악성 사이트 신고',
            online: 'https://privacy.go.kr'
          },
          ftc: {
            name: '공정거래위원회',
            contact: '국번없이 1372',
            description: '소비자 피해 신고',
            online: 'https://www.consumer.go.kr'
          }
        }
      },
      documents: {
        title: '📄 필요 서류',
        description: '신고 및 법적 절차에 필요한 서류를 준비하세요.',
        required: [
          '피해 신고서 (경찰서에서 작성)',
          '거래 내역서 (은행, 거래소 등)',
          '사기 사이트 스크린샷',
          '피해자와 사기범 간의 대화 내용',
          '송금 증빙 자료 (계좌이체 확인서 등)',
          '신분증 사본',
          '통장 사본 (피해 계좌)'
        ],
        tips: [
          '모든 증거는 원본과 사본을 각각 준비하세요',
          '스크린샷은 날짜와 시간이 표시되도록 촬영하세요',
          '카카오톡, 텔레그램 등 대화 내용도 백업하세요',
          '거래소에서 거래 내역을 미리 다운로드하세요'
        ]
      },
      legal: {
        title: '⚖️ 법적 절차',
        description: '사기 피해 구제를 위한 법적 절차를 안내합니다.',
        procedures: {
          criminal: {
            title: '형사 고발',
            description: '사기범에 대한 형사처벌을 요구',
            steps: [
              '경찰서 방문하여 피해 신고서 작성',
              '수사기관의 조사 협조',
              '검찰 송치 및 기소 여부 결정',
              '법원 재판 진행'
            ]
          },
          civil: {
            title: '민사 소송',
            description: '피해 금액 배상을 요구',
            steps: [
              '변호사 상담',
              '소장 작성 및 법원 제출',
              '상대방 소재 파악',
              '재판 진행 및 판결'
            ]
          },
          compensation: {
            title: '피해 구제',
            description: '금융기관을 통한 피해 구제 신청',
            steps: [
              '해당 금융기관에 피해 구제 신청',
              '금융감독원 분쟁조정 신청',
              '예금보험공사 피해구제 신청 (해당시)',
              '집단소송 참여 검토'
            ]
          }
        }
      },
      contacts: {
        title: '📞 주요 연락처',
        description: '암호화폐 사기 피해 관련 주요 연락처입니다.',
        numbers: [
          '경찰서 신고: 112',
          '금융감독원: 1332',
          '한국인터넷진흥원: 118',
          '소비자신고센터: 1372',
          '법률구조공단: 132',
          '대한변협 법률상담: 02-3476-4472'
        ]
      },
      prevention: {
        title: '🛡️ 예방 수칙',
        description: '암호화폐 사기를 예방하기 위한 필수 수칙입니다.',
        rules: [
          '공식 웹사이트만 이용하고 URL을 정확히 확인하세요',
          '너무 좋은 조건의 투자는 의심하세요',
          '개인키, 시드구문은 절대 남에게 알려주지 마세요',
          '2단계 인증(2FA)을 반드시 설정하세요',
          '의심스러운 링크는 클릭하지 마세요',
          '투자 전 충분한 조사와 검증을 하세요',
          '소액으로 먼저 테스트해보세요',
          '감정적 투자보다는 신중한 판단을 하세요'
        ]
      },
      recovery: {
        title: '💰 자산 회복',
        description: '피해 자산 회복 가능성과 절차를 안내합니다.',
        reality: {
          title: '회복 가능성',
          description: '안타깝게도 암호화폐 사기 피해금 회복은 매우 어려운 것이 현실입니다.',
          stats: [
            '국내 암호화폐 사기 피해금 회복률: 약 5-10%',
            '해외 거래소 관련 피해: 회복 더욱 어려움',
            '개인간 거래 피해: 회복 가능성 매우 낮음'
          ]
        },
        methods: [
          '거래소를 통한 계정 동결 요청',
          '블록체인 추적을 통한 자금 흐름 파악',
          '해외 수사기관과의 공조 수사',
          '민사소송을 통한 배상 명령',
          '집단소송 참여',
          '금융기관 피해구제 신청'
        ]
      },
      support: {
        title: '🤝 지원 기관',
        description: '피해자를 위한 지원 기관과 서비스입니다.',
        organizations: [
          {
            name: '법률구조공단',
            service: '무료 법률 상담 및 소송 지원',
            contact: '국번없이 132',
            website: 'https://www.klac.or.kr'
          },
          {
            name: '대한변호사협회',
            service: '변호사 소개 및 법률 상담',
            contact: '02-3476-4472',
            website: 'https://www.koreanbar.or.kr'
          },
          {
            name: '소비자분쟁조정위원회',
            service: '소비자 피해 분쟁 조정',
            contact: '국번없이 1372',
            website: 'https://www.consumer.go.kr'
          }
        ]
      },
      backToHome: '홈으로 돌아가기',
      questions: [
        {
          question: "암호화폐 사기를 당했습니다. 지금 당장 무엇을 해야 하나요?",
          answer: "즉시 다음 조치를 취하세요:\n\n1) 거래를 즉시 중단하고 계정 비밀번호를 변경하세요\n\n2) 가능하다면 남은 자산을 안전한 곳으로 즉시 이전하세요\n\n3) 사기 사이트의 스크린샷과 거래 내역을 보존하세요\n\n4) 관련 기관에 즉시 신고하세요 (경찰서, 금융감독원)\n\n5) 은행 및 카드사에 연락하여 추가 결제를 차단하세요"
        },
        {
          question: "사기 피해를 어디에 신고해야 하나요?",
          answer: "다음 기관에 신고할 수 있습니다:\n\n• 사이버수사과 (경찰서) - 국번없이 112\n  → 사기 피해 신고 및 수사 의뢰\n  → [LINK]https://ecrm.police.go.kr[/LINK] (사이버경찰청)\n\n• 금융감독원 - 국번없이 1332\n  → 금융 관련 피해 신고\n  → [LINK]https://www.fss.or.kr[/LINK]\n\n• 한국인터넷진흥원 (KISA) - 국번없이 118\n  → 인터넷 사기 및 악성 사이트 신고\n  → [LINK]https://privacy.go.kr[/LINK]\n\n• 공정거래위원회 - 국번없이 1372\n  → 소비자 피해 신고\n  → [LINK]https://www.consumer.go.kr[/LINK]"
        },
        {
          question: "신고할 때 어떤 서류가 필요한가요?",
          answer: "다음 서류를 준비하세요:\n\n[필수 서류]\n• 피해 신고서 (경찰서에서 작성)\n• 거래 내역서 (은행, 거래소 등)\n• 사기 사이트 스크린샷\n• 피해자와 사기범 간의 대화 내용\n• 송금 증빙 자료 (계좌이체 확인서 등)\n• 신분증 사본\n• 통장 사본 (피해 계좌)\n\n[준비 팁]\n• 모든 증거는 원본과 사본을 각각 준비하세요\n• 스크린샷은 날짜와 시간이 표시되도록 촬영하세요\n• 카카오톡, 텔레그램 등 대화 내용도 백업하세요\n• 거래소에서 거래 내역을 미리 다운로드하세요"
        },
        {
          question: "피해금을 돌려받을 수 있나요?",
          answer: "[회복 가능성]\n안타깝게도 암호화폐 사기 피해금 회복은 매우 어려운 것이 현실입니다.\n\n[회복률 통계]\n• 국내 암호화폐 사기 피해금 회복률: 약 5-10%\n• 해외 거래소 관련 피해: 회복 더욱 어려움\n• 개인간 거래 피해: 회복 가능성 매우 낮음\n\n[시도해볼 수 있는 방법]\n• 거래소를 통한 계정 동결 요청\n• 블록체인 추적을 통한 자금 흐름 파악\n• 해외 수사기관과의 공조 수사\n• 민사소송을 통한 배상 명령\n• 집단소송 참여\n• 금융기관 피해구제 신청"
        },
        {
          question: "어떤 법적 절차를 밟을 수 있나요?",
          answer: "세 가지 주요 옵션이 있습니다:\n\n1) 형사 고발:\n• 경찰서 방문하여 피해 신고서 작성\n• 수사기관의 조사 협조\n• 검찰 송치 및 기소 여부 결정\n• 법원 재판 진행\n\n2) 민사 소송:\n• 변호사 상담\n• 소장 작성 및 법원 제출\n• 상대방 소재 파악\n• 재판 진행 및 판결\n\n3) 피해 구제:\n• 해당 금융기관에 피해 구제 신청\n• 금융감독원 분쟁조정 신청\n• 예금보험공사 피해구제 신청 (해당시)\n• 집단소송 참여 검토"
        },
        {
          question: "무료 법률 상담을 받을 수 있는 곳이 있나요?",
          answer: "다음 기관에서 무료 상담을 받을 수 있습니다:\n\n법률구조공단\n• 연락처: 국번없이 132\n• 서비스: 무료 법률 상담 및 소송 지원\n• 웹사이트: [LINK]https://www.klac.or.kr[/LINK]\n\n대한변호사협회\n• 연락처: 02-3476-4472\n• 서비스: 변호사 소개 및 법률 상담\n• 웹사이트: [LINK]https://www.koreanbar.or.kr[/LINK]\n\n소비자분쟁조정위원회\n• 연락처: 국번없이 1372\n• 서비스: 소비자 피해 분쟁 조정\n• 웹사이트: [LINK]https://www.consumer.go.kr[/LINK]"
        },
        {
          question: "긴급 연락처를 알려주세요",
          answer: "주요 긴급 연락처:\n\n경찰서 신고: 112\n금융감독원: 1332\n한국인터넷진흥원: 118\n소비자신고센터: 1372\n법률구조공단: 132\n대한변협 법률상담: 02-3476-4472"
        },
        {
          question: "앞으로 사기를 당하지 않으려면 어떻게 해야 하나요?",
          answer: "다음 예방 수칙을 반드시 지키세요:\n\n[기본 보안 수칙]\n• 공식 웹사이트만 이용하고 URL을 정확히 확인하세요\n• 너무 좋은 조건의 투자는 의심하세요\n• 개인키, 시드구문은 절대 남에게 알려주지 마세요\n• 2단계 인증(2FA)을 반드시 설정하세요\n\n[주의사항]\n• 의심스러운 링크는 클릭하지 마세요\n• 투자 전 충분한 조사와 검증을 하세요\n• 소액으로 먼저 테스트해보세요\n• 감정적 투자보다는 신중한 판단을 하세요"
        },
        {
          question: "가짜 거래소와 진짜 거래소를 어떻게 구별하나요?",
          answer: "공식 웹사이트 URL을 정확히 확인하고, 도메인이 올바른지 검증하세요. CryptoGuardian과 같은 검증 서비스를 이용하여 사이트의 안전성을 먼저 확인하는 것이 좋습니다. 또한 금융감독원이나 거래소 협회에서 인증된 거래소 목록을 참고하세요."
        },
        {
          question: "텔레그램이나 카카오톡에서 투자 제안을 받았는데 믿어도 될까요?",
          answer: "절대 믿지 마세요. 대부분의 암호화폐 사기는 메신저를 통해 시작됩니다. 정식 투자회사나 거래소는 무작위로 개인에게 투자 제안을 하지 않습니다. 의심스러운 제안은 즉시 차단하고 신고하세요."
        },
        {
          question: "피해 신고 후 경찰에서 연락이 없어요. 정상인가요?",
          answer: "암호화폐 사기 수사는 시간이 오래 걸릴 수 있습니다. 특히 해외 거래소가 연관된 경우 더욱 복잡해집니다. 정기적으로 담당 수사관에게 진행 상황을 문의하고, 추가 증거가 있다면 제출하세요. 동시에 민사소송도 검토해보시기 바랍니다."
        },
        {
          question: "가족이 사기를 당했는데 본인이 신고를 거부해요",
          answer: "본인이 직접 신고해야 효과적입니다. 하지만 가족이 거부한다면, 우선 사기의 심각성을 설명하고 전문가 상담을 받도록 설득하세요. 필요시 법률구조공단(132)에 상황을 상담하여 도움을 요청할 수 있습니다."
        }
      ]
    },

    // Legacy about structure for compatibility
    about: {
      title: 'CryptoGuardian',
      subtitle: '암호화폐 투자자를 위한 실시간 보안 검증 플랫폼',
      problem: {
        title: '매년 수십억 원의 피해가 발생합니다',
        description1: '2023년 한국에서만 암호화폐 사기로 인한 피해액이 1,000억원을 넘어섰습니다. 가짜 거래소, 피싱 사이트, 스캠 코인 등 수법은 갈수록 정교해지고 있죠.',
        description2: '특히 초보 투자자들은 공식 사이트와 사칭 사이트를 구별하기 어려워 큰 피해를 입고 있습니다. "바이낸스"를 검색했는데 "binance-kr.com" 같은 가짜 사이트에 접속하는 경우가 빈번합니다.'
      },
      solution: {
        title: '우리가 해결하는 방법',
        realtime: {
          title: '실시간 다중 검증',
          description: 'KISA, VirusTotal, URLhaus 등 국내외 주요 보안 데이터베이스를 실시간으로 조회해 위험도를 평가합니다.'
        },
        exchange: {
          title: '거래소 정보 제공',
          description: 'CoinGecko와 CryptoCompare에서 검증된 정식 거래소 정보만 제공. 신뢰도 점수와 거래량으로 안전한 거래소를 추천합니다.'
        },
        community: {
          title: '커뮤니티 신고 시스템',
          description: '사용자들이 직접 의심 사이트를 신고하고 공유. 새로운 사기 수법도 빠르게 차단됩니다.'
        },
        weekly: {
          title: '주간 업데이트',
          description: '매주 자동으로 최신 블랙리스트와 거래소 정보를 업데이트. 항상 최신 정보로 여러분을 보호합니다.'
        }
      },
      partners: {
        title: '신뢰할 수 있는 데이터 파트너',
        kisa: '한국인터넷진흥원',
        exchange: '거래소 데이터',
        malicious: '악성 URL DB'
      },
      stats: {
        title: '현재까지의 성과',
        blocked: '차단된 악성 도메인',
        verified: '검증된 정식 거래소',
        monitoring: '24/7 모니터링'
      },
      howto: {
        title: '간단한 사용법',
        step1: {
          title: '의심되는 URL 입력',
          description: '거래소, 지갑, DeFi 등 암호화폐 관련 사이트 주소를 입력하세요.'
        },
        step2: {
          title: '즉시 검증 결과 확인',
          description: '안전, 주의, 위험 3단계로 명확하게 표시됩니다.'
        },
        step3: {
          title: '상세 정보 확인',
          description: '위험 요소, 대체 거래소, 증거 자료 등을 확인할 수 있습니다.'
        }
      },
      mission: {
        title: '우리의 목표',
        description1: 'CryptoGuardian은 한국 암호화폐 투자자들의 자산을 보호하기 위해 만들어졌습니다. 복잡한 보안 지식 없이도 누구나 안전하게 암호화폐를 거래할 수 있도록 돕는 것이 목표입니다.',
        description2: '완벽한 보안은 없습니다. 하지만 우리는 최선을 다해 최신 위협 정보를 수집하고, 가장 빠르고 정확한 검증 서비스를 제공하기 위해 노력하고 있습니다.',
        disclaimer: '면책 조항: 본 서비스는 참고용이며, 투자 결정에 대한 최종 책임은 이용자에게 있습니다. 항상 복수의 출처를 확인하고 신중하게 투자하세요.'
      },
      cta: '지금 바로 검증하기'
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
      logo: 'CryptoGuardian',
      tagline: 'Crypto Site Security Verification Service',
      nav: {
        home: 'Home',
        about: 'About',
        faq: 'FAQ',
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
      loading: {
        title: 'Security Check in Progress',
        subtitle: 'Analyzing domain security',
        progress: 'Progress',
        steps: {
          domainInfo: {
            title: 'Gathering domain information...',
            description: 'Retrieving DNS records and domain registration details.'
          },
          securityDatabase: {
            title: 'Checking security databases...',
            description: 'Verifying against malicious site databases for threat information.'
          },
          sslVerification: {
            title: 'Validating SSL certificate...',
            description: 'Examining security certificate validity and encryption strength.'
          },
          reputationAnalysis: {
            title: 'Analyzing reputation data...',
            description: 'Comprehensive analysis of reputation information from security agencies.'
          },
          finalResults: {
            title: 'Generating final results...',
            description: 'Calculating security score based on all collected information.'
          }
        }
      },
      searchTypes: {
        general: {
          label: 'General Domain',
          placeholder: 'Enter URL or domain (e.g., example.com)'
        },
        crypto: {
          label: 'Crypto Related',
          placeholder: 'Enter crypto exchange or related site (e.g., binance.com)'
        }
      },
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
      backButton: 'Check Another',
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
      report: {
        title: 'Report Website',
        description: 'Report suspicious websites',
        domain: 'Domain',
        reportType: 'Report Type',
        reportTypes: {
          phishing: 'Phishing Site',
          scam: 'Scam Site',
          malware: 'Malware',
          'fake-exchange': 'Fake Exchange',
          other: 'Other'
        },
        reportDescription: 'Report Details',
        reportDescriptionPlaceholder: 'Please describe the issues or incidents you found in detail',
        reporterEmail: 'Reporter Email',
        reporterEmailPlaceholder: 'Contact email address',
        evidence: 'Evidence',
        evidencePlaceholder: 'Related URLs or screenshot descriptions (optional)',
        submitButton: 'Submit Report',
        submittingButton: 'Submitting...',
        cancelButton: 'Cancel',
        successMessage: 'Report submitted successfully',
        successDescription: 'We will review and take action',
        errorMessage: 'Failed to submit report',
        errorDescription: 'Please try again later',
        alreadyReported: 'Already Reported',
        alreadyReportedDescription: 'You have already reported this domain with this email address',
        okButton: 'OK'
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
        'User Reports Check': 'User Reports Check',
        'Team Scam Detection': 'Team Scam Detection',
        'Exchange Impersonation Check': 'Exchange Impersonation Check',
        'Korean Crypto Scam Check': 'Korean Crypto Scam Check',
        'AI Phishing Pattern Analysis': 'AI Phishing Pattern Analysis',
        'AI Suspicious Domain Detection': 'AI Suspicious Domain Detection'
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
      },
      exchangeInfo: {
        title: 'Exchange Information',
        exchangeName: 'Exchange Name',
        verificationStatus: 'Verification Status',
        verified: 'Verified',
        notVerified: 'Not Verified',
        country: 'Country',
        establishedYear: 'Established Year',
        officialWebsite: 'Official Website',
        dataSource: 'Data Source',
        dataCollectionDate: 'Data Collection Date',
        lastUpdate: 'Last Update',
        score: 'Score',
        alert: 'Alert'
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
    },

    // Privacy Policy page
    privacy: {
      title: 'Privacy Policy',
      sections: {
        collection: {
          title: '1. Information We Collect',
          description: 'CryptoGuardian does not collect personal information by default. We only collect minimal information when the reporting function is used.',
          items: ['General use: No personal information collected (only language settings stored via cookies)', 'When using report function: Report content, IP address (for spam prevention)', 'Purpose: Blocking malicious sites and spam prevention', 'Retention period: 30 days (automatically deleted thereafter)']
        },
        report: {
          title: '2. Report Function Details',
          description: 'Information collected when using the site reporting function:',
          items: ['Email address (optional)', 'Report details and evidence', 'Report date and time', 'IP address (for spam prevention and duplicate report verification)'],
          note: 'Report information is used solely for blocking malicious sites and is not shared with third parties. IP addresses are stored in anonymized form.'
        },
        cookies: {
          title: '3. Cookies and Local Storage',
          description: 'This service uses cookies and local storage for the following purposes:',
          items: ['Saving language preferences (local storage)', 'Storing recent verification history (local storage, stored only on user device)', 'Only functional cookies that do not contain personal information are used']
        },
        security: {
          title: '4. Data Security',
          description: 'All data transmission is encrypted via HTTPS, and data stored on servers is minimized. User personal information is stored encrypted, and regular security checks are conducted.'
        },
        thirdParty: {
          title: '5. Third Party Sharing',
          description: 'CryptoGuardian does not share user personal information with third parties except in the following cases:',
          items: ['With user consent', 'When required by law', 'Upon legitimate request by law enforcement']
        },
        rights: {
          title: '6. User Rights',
          description: 'Users may exercise the following rights at any time:',
          items: ['Request to view personal information', 'Request to correct or delete personal information', 'Request to stop processing personal information'],
          note: 'To exercise these rights, please submit a request through the Contact page.'
        },
        officer: {
          title: '7. Privacy Officer',
          email: 'Email: cryptoguardian380301@gmail.com',
          description: 'For any questions regarding personal information processing, please contact us at the above address.'
        },
        revision: {
          title: '8. Policy Updates',
          effectiveDate: 'This policy is effective as of September 21, 2025.',
          description: 'It may be revised to reflect changes in laws or services, and any revisions will be announced on the website.'
        }
      },
      backToHome: 'Back to Home'
    },

    // Terms of Service page
    terms: {
      title: 'Terms of Service',
      sections: {
        purpose: {
          title: 'Article 1 (Purpose)',
          content: 'These terms govern the conditions, procedures, rights, obligations, and responsibilities between the service provider and users of the cryptocurrency site security verification service provided by CryptoGuardian (the "Service").'
        },
        service: {
          title: 'Article 2 (Service Content)',
          description: 'The Service provides the following features:',
          items: ['Security status verification of cryptocurrency-related websites', 'Domain information and SSL certificate verification', 'Blacklist database queries', 'Exchange information provision', 'Malicious site reporting function']
        },
        usage: {
          title: 'Article 3 (Service Usage)',
          items: ['The Service is provided free of charge and is available to everyone.', 'There may be daily verification limits.', 'Mass verification through automated methods (bots, scripts, etc.) is prohibited.', 'Using the Service to harm others is prohibited.']
        },
        disclaimer: {
          title: 'Article 4 (Disclaimer)',
          items: ['This Service provides reference information and is not investment advice.', 'Verification results may not be 100% accurate, and final investment decisions are the user\'s responsibility.'],
          notLiable: 'The service provider is not liable for:',
          notLiableItems: ['Losses from blindly trusting verification results', 'Incorrect information due to third-party data source errors', 'Service interruptions due to force majeure or system failures', 'Damages attributable to user negligence']
        },
        intellectual: {
          title: 'Article 5 (Intellectual Property)',
          items: ['Copyright for all content provided by the Service belongs to CryptoGuardian.', 'Users may not use information obtained through the Service for commercial purposes.', 'Data collection via API requires separate permission.']
        },
        obligations: {
          title: 'Article 6 (User Obligations)',
          description: 'Users must not:',
          items: ['Report malicious sites with false information', 'Interfere with normal Service operations', 'Attempt to collect other users\' personal information', 'Use the Service for profit', 'Exploit security vulnerabilities in the Service']
        },
        changes: {
          title: 'Article 7 (Service Changes and Termination)',
          items: ['The service provider may change or terminate the Service as operationally necessary.', 'Important changes will be announced in advance on the website.', 'We are not liable for damages due to Service termination.']
        },
        compensation: {
          title: 'Article 8 (Damages)',
          content: 'Users who cause damage to the service provider by violating these terms are responsible for compensating for such damage.'
        },
        dispute: {
          title: 'Article 9 (Dispute Resolution)',
          items: ['These terms are interpreted and enforced according to the laws of the Republic of Korea.', 'Disputes related to Service use shall be under the jurisdiction of the Seoul Central District Court.']
        },
        amendment: {
          title: 'Article 10 (Amendment of Terms)',
          items: ['These terms may be amended as necessary.', 'Amended terms become effective 7 days after posting on the website.', 'Users who disagree with amended terms may discontinue Service use.']
        },
        dates: {
          effective: 'Effective Date: September 21, 2025',
          lastModified: 'Last Modified: September 21, 2025'
        }
      },
      backToHome: 'Back to Home'
    },

    // Contact page
    contactPage: {
      title: 'Contact Us',
      subtitle: 'Send us your inquiries or suggestions about the CryptoGuardian service.',
      inquiryType: 'Inquiry Type',
      inquiryTypes: {
        general: 'General Inquiry',
        report: 'Report Malicious Site',
        bug: 'Bug Report',
        feature: 'Feature Request',
        partnership: 'Partnership Inquiry'
      },
      form: {
        name: 'Name',
        email: 'Email',
        subject: 'Subject',
        message: 'Message',
        submit: 'Send Message',
        sending: 'Sending...',
        success: '✓ Message sent successfully.',
        error: '✗ Failed to send message.'
      },
      directContact: {
        title: 'Direct Contact',
        general: 'General',
        partnership: 'Partnership',
        security: 'Security'
      },
      responseTime: {
        title: 'Response Time',
        description: 'We typically respond within 1-2 business days. For urgent security matters, please contact cryptoguardian380301@gmail.com directly.'
      },
      notes: {
        title: 'Note',
        items: ['• We do not provide investment advice', '• No personal asset consultation', '• Technical support on weekdays only']
      },
      backToHome: 'Back to Home'
    },

    // About page
    title: 'About CryptoGuardian',
    subtitle: 'The New Standard for Crypto Site Security',
    problem: {
      title: 'Billions in Losses Every Year',
      description1: 'In 2023 alone, cryptocurrency fraud losses exceeded 100 billion won in Korea. Fake exchanges, phishing sites, and scam coins are becoming increasingly sophisticated.',
      description2: 'Especially novice investors find it difficult to distinguish between official sites and impersonation sites, resulting in significant losses. Searching for "Binance" often leads to fake sites like "binance-kr.com".'
    },
    solution: {
      title: 'How We Solve It',
      realtime: {
        title: 'Real-time Multi-Verification',
        description: 'We evaluate risk by querying major domestic and international security databases including KISA, VirusTotal, and URLhaus in real-time.'
      },
      exchange: {
        title: 'Exchange Information',
        description: 'Only providing verified official exchange information from CoinGecko and CryptoCompare. Recommending safe exchanges based on trust scores and trading volumes.'
      },
      community: {
        title: 'Community Reporting System',
        description: 'Users directly report and share suspicious sites. New scam methods are quickly blocked.'
      },
      weekly: {
        title: 'Weekly Updates',
        description: 'Automatically updating the latest blacklists and exchange information every week. Always protecting you with the latest information.'
      }
    },
    partners: {
      title: 'Trusted Data Partners',
      kisa: 'Korea Internet & Security Agency',
      exchange: 'Exchange Data',
      malicious: 'Malicious URL DB'
    },
    stats: {
      title: 'Our Achievements',
      blocked: 'Blocked Malicious Domains',
      verified: 'Verified Official Exchanges',
      monitoring: '24/7 Monitoring'
    },
    howto: {
      title: 'Simple Usage',
      step1: {
        title: 'Enter Suspicious URL',
        description: 'Enter website addresses of cryptocurrency exchanges, investment platforms, ICO sites, etc.'
      },
      step2: {
        title: 'Check Results Instantly',
        description: 'Clearly displayed in 3 levels: Safe, Warning, Danger.'
      },
      step3: {
        title: 'View Detailed Information',
        description: 'Check security scores, domain information, blacklist status, and more.'
      }
    },
    mission: {
      title: 'Our Mission',
      description1: 'CryptoGuardian was created to help Korean cryptocurrency and investors protect their assets safely. We support anyone to check if the trading site is trustworthy without complex security knowledge.',
      description2: 'While perfect security does not exist, we are continuously collecting the latest threat information and doing our best to provide the fastest and most accurate verification service.',
      whyTitle: 'Why We Created This',
      whyDescription1: 'Currently, there is no authoritative platform in Korea where users can easily verify the trustworthiness of cryptocurrency and investment sites at a glance. Users are confused about where to start looking for information, and overseas cryptocurrency exchanges are particularly difficult to access.',
      whyDescription2: 'CryptoGuardian aims to solve these problems and become a tool to prevent fraud. We believe that if this service becomes widely known and receives certification from authoritative institutions such as the Korean National Police Agency and the Financial Supervisory Service, it will greatly help protect Korean investors.',
      disclaimer: 'Disclaimer: This service is for reference only, and the final responsibility for investment decisions lies with the user. Always verify multiple sources and invest carefully.'
    },
    cta: 'Verify Now',

    // FAQ page
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Cryptocurrency Scam Victim Response Guide',
      emergency: {
        title: 'Emergency Response',
        description: 'Are you a victim of cryptocurrency fraud? Take these immediate actions.',
        steps: [
          'Immediately stop trading and change your account passwords',
          'If possible, transfer remaining assets to a safe place immediately',
          'Preserve screenshots and transaction records of the scam site',
          'Report immediately to relevant authorities (police, financial authorities)',
          'Contact your bank and card companies to block additional payments'
        ]
      },
      reporting: {
        title: 'Reporting Procedures',
        description: 'Guide for reporting cryptocurrency fraud.',
        agencies: {
          title: 'Reporting Agencies',
          police: {
            name: 'Cyber Investigation Unit (Police)',
            contact: 'Dial 112',
            description: 'Report fraud and request investigation',
            online: 'https://ecrm.police.go.kr (Cyber Police)'
          },
          fss: {
            name: 'Financial Supervisory Service',
            contact: 'Dial 1332',
            description: 'Report financial-related damages',
            online: 'https://www.fss.or.kr'
          },
          kisa: {
            name: 'Korea Internet & Security Agency (KISA)',
            contact: 'Dial 118',
            description: 'Report internet fraud and malicious sites',
            online: 'https://privacy.go.kr'
          },
          ftc: {
            name: 'Fair Trade Commission',
            contact: 'Dial 1372',
            description: 'Report consumer damages',
            online: 'https://www.consumer.go.kr'
          }
        }
      },
      documents: {
        title: 'Required Documents',
        description: 'Prepare necessary documents for reporting and legal procedures.',
        required: [
          'Damage report (completed at police station)',
          'Transaction records (bank, exchange, etc.)',
          'Screenshots of scam sites',
          'Communication records between victim and scammer',
          'Money transfer evidence (account transfer confirmation, etc.)',
          'Copy of ID',
          'Copy of bank account (victim account)'
        ],
        tips: [
          'Prepare both originals and copies of all evidence',
          'Take screenshots showing date and time',
          'Backup conversations from KakaoTalk, Telegram, etc.',
          'Download transaction history from exchanges in advance'
        ]
      },
      legal: {
        title: 'Legal Procedures',
        description: 'Guide for legal procedures to remedy fraud damages.',
        procedures: {
          criminal: {
            title: 'Criminal Complaint',
            description: 'Request criminal punishment for fraudsters',
            steps: [
              'Visit police station to file damage report',
              'Cooperate with investigation by authorities',
              'Prosecution decision on indictment',
              'Court trial proceedings'
            ]
          },
          civil: {
            title: 'Civil Lawsuit',
            description: 'Request compensation for damages',
            steps: [
              'Lawyer consultation',
              'Prepare and submit complaint to court',
              'Identify defendant location',
              'Trial proceedings and judgment'
            ]
          },
          compensation: {
            title: 'Damage Relief',
            description: 'Apply for damage relief through financial institutions',
            steps: [
              'Apply for damage relief to relevant financial institution',
              'Apply for dispute mediation to Financial Supervisory Service',
              'Apply for damage relief to Korea Deposit Insurance Corporation (if applicable)',
              'Consider participating in class action lawsuits'
            ]
          }
        }
      },
      contacts: {
        title: 'Key Contacts',
        description: 'Key contact numbers for cryptocurrency fraud victims.',
        numbers: [
          'Police Report: 112',
          'Financial Supervisory Service: 1332',
          'Korea Internet & Security Agency: 118',
          'Consumer Report Center: 1372',
          'Korea Legal Aid Corporation: 132',
          'Korean Bar Association Legal Consultation: 02-3476-4472'
        ]
      },
      prevention: {
        title: 'Prevention Rules',
        description: 'Essential rules to prevent cryptocurrency fraud.',
        rules: [
          'Only use official websites and verify URLs carefully',
          'Be suspicious of investment opportunities that seem too good to be true',
          'Never share your private keys or seed phrases with others',
          'Always set up two-factor authentication (2FA)',
          'Do not click on suspicious links',
          'Conduct thorough research and verification before investing',
          'Test with small amounts first',
          'Make prudent decisions rather than emotional investments'
        ]
      },
      recovery: {
        title: 'Asset Recovery',
        description: 'Guide on the possibility and procedures for recovering victim assets.',
        reality: {
          title: 'Recovery Possibility',
          description: 'Unfortunately, recovering cryptocurrency fraud victim funds is very difficult in reality.',
          stats: [
            'Domestic cryptocurrency fraud fund recovery rate: about 5-10%',
            'Overseas exchange-related damages: recovery even more difficult',
            'Peer-to-peer trading damages: very low recovery possibility'
          ]
        },
        methods: [
          'Request account freezing through exchanges',
          'Track fund flow through blockchain analysis',
          'Cooperative investigation with overseas law enforcement',
          'Compensation orders through civil lawsuits',
          'Participation in class action lawsuits',
          'Apply for financial institution damage relief'
        ]
      },
      support: {
        title: 'Support Organizations',
        description: 'Support organizations and services for victims.',
        organizations: [
          {
            name: 'Korea Legal Aid Corporation',
            service: 'Free legal consultation and litigation support',
            contact: 'Dial 132',
            website: 'https://www.klac.or.kr'
          },
          {
            name: 'Korean Bar Association',
            service: 'Lawyer referral and legal consultation',
            contact: '02-3476-4472',
            website: 'https://www.koreanbar.or.kr'
          },
          {
            name: 'Consumer Dispute Mediation Committee',
            service: 'Consumer damage dispute mediation',
            contact: 'Dial 1372',
            website: 'https://www.consumer.go.kr'
          }
        ]
      },
      backToHome: 'Back to Home',
      questions: [
        {
          question: "I've been scammed by cryptocurrency fraud. What should I do right now?",
          answer: "Take these immediate actions:\n\n1) Stop all trading immediately and change your passwords\n\n2) Transfer any remaining assets to a secure location if possible\n\n3) Save screenshots and transaction records of the scam site\n\n4) Report to authorities immediately (police, financial supervisors)\n\n5) Contact your bank and card companies to block additional payments"
        },
        {
          question: "Where should I report cryptocurrency fraud?",
          answer: "You can report to these agencies:\n\n• Cyber Investigation Unit (Police) - Dial 112\n  → Fraud reports and investigation requests\n  → [LINK]https://ecrm.police.go.kr[/LINK] (Cyber Police)\n\n• Financial Supervisory Service - Dial 1332\n  → Financial-related damages\n  → [LINK]https://www.fss.or.kr[/LINK]\n\n• Korea Internet & Security Agency (KISA) - Dial 118\n  → Internet fraud and malicious sites\n  → [LINK]https://privacy.go.kr[/LINK]\n\n• Fair Trade Commission - Dial 1372\n  → Consumer damages\n  → [LINK]https://www.consumer.go.kr[/LINK]"
        },
        {
          question: "What documents do I need when reporting?",
          answer: "Prepare these documents:\n\n[Required Documents]\n• Damage report (completed at police station)\n• Transaction records (bank, exchange, etc.)\n• Screenshots of scam sites\n• Communication records between you and the scammer\n• Money transfer evidence\n• Copy of ID\n• Copy of bank account\n\n[Preparation Tips]\n• Prepare both originals and copies\n• Take screenshots with date/time visible\n• Backup all conversations\n• Download exchange transaction history in advance"
        },
        {
          question: "Can I recover my lost funds?",
          answer: "[Recovery Possibility]\nUnfortunately, cryptocurrency fraud fund recovery is very difficult in reality.\n\n[Recovery Statistics]\n• Domestic cryptocurrency fraud fund recovery rate: about 5-10%\n• Overseas exchange-related damages: recovery even more difficult\n• Peer-to-peer trading damages: very low recovery possibility\n\n[Methods to Try]\n• Request account freezing through exchanges\n• Track fund flow through blockchain analysis\n• Cooperative investigation with overseas law enforcement\n• Civil lawsuits for compensation\n• Participate in class action lawsuits\n• Apply for financial institution damage relief"
        },
        {
          question: "What legal procedures can I take?",
          answer: "You have three main options:\n\n1) Criminal Complaint:\n• Visit police station to file damage report\n• Cooperate with investigation by authorities\n• Await prosecution decision and trial\n\n2) Civil Lawsuit:\n• Consult with lawyer\n• Prepare and submit court complaint\n• Identify defendant location\n• Proceed with trial and judgment\n\n3) Damage Relief:\n• Apply to relevant financial institutions\n• Request FSS dispute mediation\n• Consider Korea Deposit Insurance Corporation relief\n• Join class action lawsuits"
        },
        {
          question: "Where can I get free legal consultation?",
          answer: "You can get free consultation from:\n\nKorea Legal Aid Corporation\n• Contact: Dial 132\n• Service: Free legal consultation and litigation support\n• Website: [LINK]https://www.klac.or.kr[/LINK]\n\nKorean Bar Association\n• Contact: 02-3476-4472\n• Service: Lawyer referral and legal consultation\n• Website: [LINK]https://www.koreanbar.or.kr[/LINK]\n\nConsumer Dispute Mediation Committee\n• Contact: Dial 1372\n• Service: Consumer damage dispute mediation\n• Website: [LINK]https://www.consumer.go.kr[/LINK]"
        },
        {
          question: "What are the emergency contact numbers?",
          answer: "Key Emergency Contacts:\n\nPolice Report: 112\nFinancial Supervisory Service: 1332\nKorea Internet & Security Agency: 118\nConsumer Report Center: 1372\nKorea Legal Aid Corporation: 132\nKorean Bar Association Legal Consultation: 02-3476-4472"
        },
        {
          question: "How can I prevent cryptocurrency scams in the future?",
          answer: "Follow these prevention rules:\n\n[Basic Security Rules]\n• Only use official websites and verify URLs carefully\n• Be suspicious of investment opportunities that seem too good to be true\n• Never share private keys or seed phrases with others\n• Always set up two-factor authentication (2FA)\n\n[Precautions]\n• Don't click suspicious links\n• Conduct thorough research before investing\n• Test with small amounts first\n• Make prudent rather than emotional decisions"
        },
        {
          question: "How do I distinguish between fake and real exchanges?",
          answer: "Verify the official website URL accurately and check if the domain is correct. Use verification services like CryptoGuardian to check site safety first. Also refer to the list of exchanges certified by the Financial Supervisory Service or exchange associations."
        },
        {
          question: "Should I trust investment offers from Telegram or KakaoTalk?",
          answer: "Never trust them. Most cryptocurrency scams start through messengers. Legitimate investment companies or exchanges do not randomly make investment offers to individuals. Block and report suspicious offers immediately."
        },
        {
          question: "The police haven't contacted me after my report. Is this normal?",
          answer: "Cryptocurrency fraud investigations can take a long time, especially when overseas exchanges are involved. Regularly contact the investigating officer about progress and submit additional evidence if available. Also consider civil litigation simultaneously."
        },
        {
          question: "My family member was scammed but refuses to report it",
          answer: "Direct reporting by the victim is most effective. If your family member refuses, first explain the seriousness of the fraud and persuade them to get professional consultation. If necessary, contact Korea Legal Aid Corporation (132) to consult about the situation and request help."
        }
      ]
    }
  }
}

export type Language = keyof typeof translations
export type TranslationKey = typeof translations.ko