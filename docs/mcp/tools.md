# CryptoGuardian MCP Tool 목록

## MCP 정보

**서버명**: CryptoGuardian
**설명**: 암호화폐 관련 피싱/사기 사이트를 탐지하고 예방하는 보안 서비스
**Tool 목록**: 4개

---

## Tool 목록

### CryptoGuardian-validate_domain

**용도**
Validate domain: 도메인 또는 URL의 신뢰도를 종합 검증합니다. 블랙리스트 검사, 거래소 검증, SSL 인증서, WHOIS 정보, 피싱 패턴 분석 등 9가지 보안 검사를 수행하여 안전 여부를 판단합니다.

**파라미터**
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| domain | string | O | 검증할 도메인 또는 URL (예: "binance.com", "https://example.com") |
| type | string | X | 검증 타입. "general" (기본값) 또는 "crypto" (암호화폐 거래소 검증 포함) |

**응답 예시**
```json
{
  "success": true,
  "data": {
    "domain": "binance.com",
    "finalScore": 100,
    "status": "safe",
    "verdict": "안전: 이 사이트는 현재 알려진 위협이 없습니다.",
    "summaryKr": "binance.com은(는) 현재 안전한 것으로 보입니다.",
    "recommendationsKr": [
      "안전해 보이지만 항상 주의하세요",
      "2단계 인증(2FA)을 활성화하세요",
      "이 URL을 북마크해두세요"
    ]
  }
}
```

---

### CryptoGuardian-get_trending_scams

**용도**
Get trending scams: 최근 30일간 급증한 사기 유형, 타겟 브랜드, 위험 패턴을 분석하여 반환합니다. 현재 유행하는 사기 트렌드를 파악하여 사용자에게 경고할 수 있습니다.

**파라미터**
없음

**응답 예시**
```json
{
  "success": true,
  "data": {
    "period": "30days",
    "periodLabel": "최근 30일",
    "summary": {
      "totalNewScams": 156,
      "previousPeriod": 89,
      "overallChange": "+75%",
      "trend": "increasing"
    },
    "categoryTrends": [
      {
        "category": "fake-exchange",
        "categoryKr": "가짜 거래소",
        "count": 45,
        "change": "+120%",
        "trend": "rising"
      }
    ],
    "targetedBrands": [
      { "brand": "Binance", "count": 32 },
      { "brand": "MetaMask", "count": 28 }
    ],
    "emergingPatterns": [
      {
        "pattern": "hyphenPhishing",
        "description": "하이픈을 사용한 브랜드 사칭 (예: brand-login.com)",
        "examples": ["binance-secure.com"],
        "count": 28
      }
    ],
    "warningMessage": "가짜 거래소 유형이 +120% 급증했습니다. Binance 사칭에 주의하세요."
  }
}
```

---

### CryptoGuardian-educate_user

**용도**
Educate user: 카테고리별 피싱 예방 팁, 흔한 실수, 체크리스트, 실제 탐지 사례를 제공합니다. 사용자가 암호화폐 사기를 예방할 수 있도록 교육 콘텐츠를 제공합니다.

**파라미터**
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| category | string | X | 교육 카테고리. 기본값: "general" |

**사용 가능한 카테고리**
| 값 | 설명 |
|-----|------|
| general | 암호화폐 보안 종합 가이드 |
| fake-exchange | 가짜 거래소 구별법 |
| wallet-scam | 지갑 사기 예방법 |
| phishing | 피싱 공격 예방법 |
| airdrop-scam | 에어드랍 사기 예방법 |

**응답 예시**
```json
{
  "success": true,
  "data": {
    "category": "general",
    "title": "암호화폐 보안 가이드",
    "description": "암호화폐 피싱 및 사기를 예방하기 위한 종합 가이드입니다.",
    "tips": [
      {
        "tip": "공식 URL을 북마크해두고 항상 북마크를 통해 접속하세요",
        "importance": "high"
      },
      {
        "tip": "거래소나 지갑 서비스는 절대 DM이나 이메일로 시드 문구를 요청하지 않습니다",
        "importance": "high"
      }
    ],
    "commonMistakes": [
      "SNS 광고 링크를 통해 거래소 접속",
      "텔레그램/디스코드 DM의 링크 클릭"
    ],
    "checkList": [
      "URL이 공식 도메인과 정확히 일치하는가?",
      "북마크를 통해 접속했는가?"
    ],
    "realWorldExamples": [
      {
        "domain": "binance-event.com",
        "reason": "가짜 이벤트 사이트",
        "targetBrand": "Binance",
        "severity": "high"
      }
    ],
    "statistics": {
      "totalDetected": 1523,
      "last30Days": 156,
      "message": "지금까지 1,523개의 사기/피싱 사이트가 탐지되었습니다."
    }
  }
}
```

---

### CryptoGuardian-report_scam

**용도**
Report scam: 의심되는 사기/피싱 사이트를 신고합니다. 검증 결과 알려진 정보가 없는 사이트를 사용자가 직접 신고하여 다른 사용자들을 보호할 수 있습니다.

**파라미터**
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| domain | string | O | 신고할 도메인 또는 URL |
| reportType | string | O | 신고 유형: "phishing", "scam", "malware", "fake-exchange", "wallet-scam", "airdrop-scam", "other" |
| description | string | O | 신고 사유 설명 |
| reporterEmail | string | X | 신고자 이메일 (선택) |
| evidence | string[] | X | 증거 URL 목록 (선택) |

**신고 유형**
| 값 | 설명 |
|-----|------|
| phishing | 피싱 사이트 |
| scam | 일반 사기 |
| malware | 악성코드 배포 |
| fake-exchange | 가짜 거래소 |
| wallet-scam | 지갑 사기 (시드 문구 탈취 등) |
| airdrop-scam | 가짜 에어드랍 |
| other | 기타 |

**응답 예시 (신고 성공)**
```json
{
  "success": true,
  "data": {
    "status": "reported",
    "message": "신고가 접수되었습니다. 검토 후 블랙리스트에 등록됩니다.",
    "messageKr": "fake-binance.com에 대한 신고가 접수되었습니다.",
    "domain": "fake-binance.com",
    "reportId": "clx123...",
    "reportType": "fake-exchange",
    "reportTypeKr": "가짜 거래소",
    "nextSteps": [
      "신고가 검토 대기열에 추가되었습니다",
      "검토 후 위험 사이트로 확인되면 블랙리스트에 등록됩니다",
      "다른 사용자들이 이 사이트에 대해 경고를 받게 됩니다"
    ]
  },
  "reference": {
    "message": "자세한 정보는 CryptoGuardian에서 확인하세요.",
    "url": "https://cryptoguardian.co.kr",
    "reportUrl": "https://cryptoguardian.co.kr/report"
  }
}
```

**응답 예시 (이미 알려진 사이트)**
```json
{
  "success": true,
  "data": {
    "status": "already_known",
    "message": "이미 알려진 위험 사이트입니다.",
    "domain": "known-scam.com",
    "severity": "high",
    "category": "phishing"
  }
}
```

**신고 상태 조회 (GET)**
```
GET /api/mcp/report?domain=example.com
```

---

## API 엔드포인트

| Tool | HTTP Method | Endpoint |
|------|-------------|----------|
| validate_domain | POST / GET | `/api/mcp/validate` |
| get_trending_scams | GET | `/api/mcp/trending-scams` |
| educate_user | GET | `/api/mcp/education` |
| report_scam | POST / GET | `/api/mcp/report` |

---

## 사용 예시

### 1. 도메인 검증
```bash
# POST 방식
curl -X POST https://your-domain.vercel.app/api/mcp/validate \
  -H "Content-Type: application/json" \
  -d '{"domain": "binance.com", "type": "crypto"}'

# GET 방식
curl "https://your-domain.vercel.app/api/mcp/validate?domain=binance.com&type=crypto"
```

### 2. 트렌딩 사기 조회
```bash
curl "https://your-domain.vercel.app/api/mcp/trending-scams"
```

### 3. 교육 콘텐츠 조회
```bash
curl "https://your-domain.vercel.app/api/mcp/education?category=fake-exchange"
```

### 4. 사기 사이트 신고
```bash
# 신고하기
curl -X POST https://your-domain.vercel.app/api/mcp/report \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "fake-binance.com",
    "reportType": "fake-exchange",
    "description": "바이낸스를 사칭하는 가짜 거래소입니다"
  }'

# 신고 상태 조회
curl "https://your-domain.vercel.app/api/mcp/report?domain=fake-binance.com"
```
