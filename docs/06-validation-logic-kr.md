# URL 검증 로직 요약

## 개요

CryptoGuardian은 8가지 검증 기술을 사용하여 URL의 안전성을 판단합니다.

## 검증 기술 목록

| # | 검증 기술 | 파일 | 데이터 소스 | 가중치 |
|---|----------|------|------------|--------|
| 1 | 블랙리스트 검사 | `blacklist-checker.ts` | 내부 DB + VirusTotal API | 25% |
| 2 | 거래소 화이트리스트 | `crypto-exchange-checker.ts` | 내부 DB (600+ 거래소) | 100% (오버라이드) |
| 3 | 사용자 신고 데이터 | `user-reports.ts` | 내부 DB (UserReport) | 15% |
| 4 | WHOIS 조회 | `whois.ts` | whois-json 라이브러리 | 10% |
| 5 | SSL 인증서 검사 | `ssl-check.ts` | 직접 HTTPS 연결 | 15% |
| 6 | Google Safe Browsing | `safe-browsing.ts` | Google API v4 | 10% |
| 7 | AI 피싱 패턴 분석 | `typosquatting-detector.ts` | 자체 알고리즘 | 15% |
| 8 | 의심 도메인 패턴 분석 | `suspicious-domain-detector.ts` | 자체 알고리즘 | 10% |

---

## 검증 흐름

```
URL 입력
    │
    ▼
┌─────────────────────────────────────┐
│ 1. 블랙리스트 검사                   │
│    - 내부 DB 조회                    │
│    - VirusTotal API 호출             │
│    → 발견 시 즉시 차단 (score: 0)    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. 거래소 화이트리스트 검사          │
│    - 공식 거래소 DB 조회             │
│    → 인증된 거래소면 즉시 통과       │
│      (score: 100)                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. 일반 보안 검사 (병렬 실행)        │
│    - 사용자 신고                     │
│    - WHOIS 조회                      │
│    - SSL 인증서                      │
│    - Google Safe Browsing           │
│    - AI 피싱 패턴                    │
│    - 의심 도메인 패턴                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. 종합 점수 계산                    │
│    finalScore = Σ(score × weight)   │
└─────────────────────────────────────┘
```

---

## 각 검증 기술 상세

### 1. 블랙리스트 검사
- **내부 DB**: KISA, PhishTank, CryptoScamDB, URLhaus 데이터
- **VirusTotal API**: 70+ 보안 벤더의 탐지 결과 집계
- 악성 도메인 발견 시 자동으로 DB에 등록

### 2. 거래소 화이트리스트
- CoinGecko/CryptoCompare 기반 600+ 거래소 목록
- 인증된 거래소는 다른 검사 스킵하고 즉시 안전 판정

### 3. 사용자 신고 데이터
- 커뮤니티 기반 악성 URL 신고 시스템
- 신고 수에 따라 점수 차감 (신고 1건당 -10점)

### 4. WHOIS 조회
- 도메인 생성일, 만료일, 갱신일 확인
- **도메인 나이 점수**:
  - 2년 이상: 100점
  - 1년: 85점
  - 6개월: 70점
  - 1개월 미만: 10점
- 결과 30일간 캐시

### 5. SSL 인증서 검사
- 인증서 유형 분류: EV, OV, DV
- 인증서 발급 기관 확인 (DigiCert, Let's Encrypt 등)
- **인증서 나이 검사**: 7일 미만은 의심
- 만료 임박 여부 확인

### 6. Google Safe Browsing
- 4가지 위협 유형 검사:
  - MALWARE
  - SOCIAL_ENGINEERING
  - UNWANTED_SOFTWARE
  - POTENTIALLY_HARMFUL_APPLICATION
- 위협 감지 시 즉시 차단

### 7. AI 피싱 패턴 분석
**탐지 패턴:**

| 패턴 유형 | 예시 | 감점 |
|----------|------|------|
| 타이포스쿼팅 | `binnance.com` (binance.com) | -50 |
| 호모글리프 | `b1nance.com` (i→1) | -60 |
| 서브도메인 피싱 | `binance.com.evil.com` | -70 |
| 하이픈 피싱 | `secure-binance.com` | -55~65 |
| 브랜드+키워드 | `binancelogin.com` | -55 |

**Levenshtein 거리 알고리즘**으로 문자열 유사도 계산

### 8. 의심 도메인 패턴 분석

| 요소 | 기준 | 감점 |
|------|------|------|
| 숫자 비율 | 30% 이상 | -20 |
| 하이픈 개수 | 3개 이상 | -15 |
| 도메인 길이 | 20자 이상 | -10 |
| 의심 키워드 | phishing, fake, scam 등 | -25 |
| 무작위 문자 | 자음/모음 불균형 | -20 |
| 의심 TLD | .tk, .ml, .ga 등 | -30 |
| 피싱 패턴 | 연속 숫자 4개+ 등 | -25 |

---

## 점수 계산

### 공식
```
finalScore = Σ(check.score × check.weight) / Σ(weights)
```

### 상태 판정
| 점수 범위 | 상태 | 색상 |
|----------|------|------|
| 80-100 | safe | 녹색 |
| 50-79 | warning | 노란색 |
| 0-49 | danger | 빨간색 |

---

## 외부 API 의존성

| API | 용도 | 비고 |
|-----|------|------|
| Google Safe Browsing API v4 | 멀웨어/피싱 탐지 | API 키 필요 |
| VirusTotal API v3 | 다중 벤더 스캔 | API 키 필요 |
| whois-json | WHOIS 조회 | npm 라이브러리 |

---

## 파일 구조

```
src/lib/
├── validation/
│   ├── blacklist-checker.ts      # 블랙리스트 + VirusTotal
│   ├── crypto-exchange-checker.ts # 거래소 화이트리스트
│   ├── user-reports.ts           # 사용자 신고
│   ├── whois.ts                  # WHOIS 조회
│   ├── ssl-check.ts              # SSL 인증서
│   ├── safe-browsing.ts          # Google Safe Browsing
│   ├── typosquatting-detector.ts # 피싱 패턴 분석
│   └── suspicious-domain-detector.ts # 의심 패턴 분석
│
├── score/
│   ├── score-calculator.ts       # 점수 계산 로직
│   ├── score-config.ts           # 가중치 설정
│   ├── validation-result-builder.ts # 결과 빌더
│   └── processors/               # 각 검사별 프로세서
│       ├── blacklist-processor.ts
│       ├── exchange-processor.ts
│       ├── whois-processor.ts
│       ├── ssl-processor.ts
│       ├── safe-browsing-processor.ts
│       ├── user-reports-processor.ts
│       ├── ai-phishing-processor.ts
│       └── ai-suspicious-domain-processor.ts
│
└── apis/
    └── exchange.ts               # 거래소 API
```
