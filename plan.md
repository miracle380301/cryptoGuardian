# CryptoSitePolicer - 심플한 웹사이트 개발 계획서

## 📋 프로젝트 개요

### 현재 진행률: Phase 1-5 완료 / Phase 6 대기 중

### 목표
ScamAdviser 스타일의 **심플하고 직관적인** 암호화폐 사이트 검증 서비스
- **핵심 기능**: URL 입력 → 즉시 안전도 점수 표시
- **확장성**: 나중에 다른 보안 서비스 추가 가능한 구조
- **디자인**: AI 스럽지 않은 실용적이고 깔끔한 인터페이스

### 기술 스택 (심플 우선)
- **Frontend**: Next.js 14 + TypeScript
- **UI**: shadcn/ui (최소한의 컴포넌트만)
- **Backend**: Next.js API Routes
- **Styling**: Tailwind CSS (ScamAdviser 스타일)
- **Deploy**: Vercel

---

## 🏗️ 심플한 아키텍처 설계

### 폴더 구조 (확장 가능하지만 심플)
```
src/
├── app/
│   ├── page.tsx                 # 메인 페이지 (URL 입력)
│   ├── check/[domain]/page.tsx  # 결과 페이지
│   └── api/validate/route.ts    # 검증 API
├── components/
│   ├── ui/                      # shadcn/ui 기본 컴포넌트
│   ├── check-form.tsx           # URL 입력 폼
│   ├── trust-score.tsx          # 점수 표시 컴포넌트
│   └── check-results.tsx        # 결과 표시
├── lib/
│   ├── validators/              # 검증 로직
│   │   ├── crypto-exchange.ts   # 거래소 검증
│   │   ├── ssl-check.ts         # SSL 검증
│   │   └── security-check.ts    # 보안 검증
│   ├── apis/                    # 외부 API 클라이언트
│   └── utils/                   # 유틸리티
└── types/                       # 타입 정의
```

---

## 🚀 개발 단계별 계획

### ✅ Phase 1: 심플한 프로젝트 초기화 (완료)
**Claude Code 명령어:**
```
ScamAdviser 스타일의 심플한 암호화폐 사이트 검증 서비스를 만들어줘.

요구사항:
- Next.js 14 + TypeScript + Tailwind CSS
- shadcn/ui 최소한의 컴포넌트 (button, input, card, badge)
- 깔끔하고 실용적인 디자인 (AI 스럽지 않게)
- 기본 폴더 구조
- 확장 가능하지만 복잡하지 않은 아키텍처
- https://www.traderknows.com/ https://www.scamadviser.com/ 등의 사이트 참조

초기 컴포넌트:
- 메인 페이지 (URL 입력 폼)
- 로딩 상태
- 기본 레이아웃 (헤더, 푸터)

색상 스키마:
- 신뢰 점수 기반 색상 (빨강/노랑/초록)
- 깔끔한 회색톤 배경
- 명확한 대비

.env.local 템플릿도 만들어줘.
```

**결과 확인:**
- [x] 심플한 메인 페이지 확인
- [x] `npm run dev` 정상 실행
- [x] ScamAdviser 느낌의 디자인

### ✅ Phase 2: 외부 API 통합 (완료)
**Claude Code 명령어:**
```
암호화폐 사이트 검증을 위한 외부 API들을 통합해줘.

API 클라이언트 구현:
- lib/apis/coingecko.ts (거래소 검증)
- lib/apis/ssl-labs.ts (SSL 검증)
- lib/apis/security.ts (피싱/보안 검사)

요구사항:
- 심플한 에러 핸들링
- 기본적인 캐싱 (메모리)
- TypeScript 타입 안전성
- 깔끔한 코드 구조

각 API는 독립적으로 동작하게 만들어줘.
```

**결과 확인:**
- [x] 각 API 개별 테스트 성공
- [x] 에러 상황 적절히 처리
- [x] API 응답 캐싱 동작 (5분 TTL)

### ✅ Phase 3: 검증 엔진 구현 (완료)
**Claude Code 명령어:**
```
심플하고 효과적인 검증 엔진을 만들어줘.

검증 모듈들:
- lib/validators/crypto-exchange.ts
- lib/validators/ssl-check.ts
- lib/validators/security-check.ts
- lib/validators/index.ts (메인 검증 함수)

핵심 기능:
- 0-100 신뢰도 점수 계산
- safe/warning/danger 등급 분류
- 각 검증 항목별 상세 결과
- 실패 시 부분 결과 반환

ScamAdviser처럼 명확하고 이해하기 쉬운 결과를 만들어줘.
```

**결과 확인:**
- [x] 테스트 URL로 검증 성공
- [x] 점수 계산 로직 확인
- [x] 명확한 결과 메시지

### ✅ Phase 4: API 엔드포인트 구현 (완료)
**Claude Code 명령어:**
```
Next.js API Routes로 검증 API를 만들어줘.

엔드포인트:
- POST /api/validate (메인 검증)

기능:
- URL/도메인 입력 받기
- Zod로 입력 검증
- 검증 엔진 호출
- 결과 반환
- 심플한 rate limiting

응답 형식을 ScamAdviser처럼 명확하게 만들어줘.
```

**결과 확인:**
- [x] API 테스트 페이지 구현 (/api-test)
- [x] 다양한 URL 입력 테스트 완료
- [x] 에러 응답 확인

### ✅ Phase 5: 프론트엔드 완성 (완료)
**Claude Code 명령어:**
```
ScamAdviser 스타일의 심플한 UI를 완성해줘.

페이지 구성:
- app/page.tsx (메인 페이지 - URL 입력)
- app/check/[domain]/page.tsx (결과 페이지)

컴포넌트:
- components/check-form.tsx (URL 입력 폼)
- components/trust-score.tsx (점수 표시)
- components/check-results.tsx (상세 결과)
- components/layout/header.tsx
- components/layout/footer.tsx

디자인 요구사항:
- 깔끔하고 전문적인 느낌
- AI 스럽지 않은 실용적 디자인
- 모바일 반응형
- 빠른 로딩과 명확한 피드백

ScamAdviser처럼 신뢰도 점수를 크게 표시하고 항목별 결과를 명확히 보여줘.
```

**결과 확인:**
- [x] 전체 사용자 플로우 테스트
- [x] 디자인이 ScamAdviser와 유사한 느낌
- [x] 원형 점수 그래프 구현

### Phase 6: 품질 개선 및 배포
**Claude Code 명령어:**
```
실제 서비스 수준으로 품질을 개선해줘.

개선사항:
- 에러 페이지 (404, 500)
- 로딩 스켈레톤
- SEO 최적화
- 성능 최적화
- 간단한 분석 (사용량 추적)

배포 준비:
- next.config.js 설정
- 환경변수 문서화
- README.md 작성
- Vercel 배포 설정

모든 것을 실제 서비스처럼 동작하게 만들어줘.
```

**결과 확인:**
- [ ] Lighthouse 점수 90+ 
- [ ] 실제 URL들로 테스트
- [ ] Vercel 배포 성공

---

## 🎨 디자인 가이드 (ScamAdviser 스타일)

### 디자인 원칙
- **심플함**: 불필요한 요소 제거
- **명확성**: 한눈에 이해되는 정보 전달
- **실용성**: 기능 중심의 디자인
- **신뢰성**: 전문적이고 안정적인 느낌

### 색상 스키마
```css
/* 신뢰도 점수 색상 */
danger: #dc2626 (빨강 - 위험)
warning: #f59e0b (노랑 - 주의)
success: #16a34a (초록 - 안전)

/* 기본 색상 */
background: #ffffff
text: #1f2937
muted: #6b7280
border: #e5e7eb
```

### 화면 구성

### 메인 페이지 (/)
```
┌─────────────────────────────────────────┐
│                                         │
│          🛡️ CryptoSitePolicer         │
│        암호화폐 사이트 안전성 검증        │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  URL 또는 도메인 입력               │ │
│ │  예: binance.com                    │ │
│ └─────────────────────────────────────┘ │
│           [웹사이트 검증하기]            │
│                                         │
│  ✅ 신뢰할 수 있는 데이터 소스 기반      │
│  ⚡ 즉시 검증 결과 제공                 │
│  🔒 안전한 암호화폐 거래를 위한 필수 도구 │
│                                         │
└─────────────────────────────────────────┘
```

### 결과 페이지 (/check/binance.com) - ScamAdviser 스타일
```
┌─────────────────────────────────────────┐
│ ← 다시 검증하기                         │
│                                         │
│         binance.com 검증 결과           │
│                                         │
│    ┌─────────────────────────────────┐  │
│    │         Trustscore              │  │
│    │            95 / 100             │  │
│    │         💡 What is this?        │  │
│    │           Disclaimer            │  │
│    │                                 │  │
│    │        ████████████████         │  │
│    │      ████ (반원 차트) ████       │  │ ScamAdviser 스타일
│    │        ████████████████         │  │ 색상 그라데이션
│    │                                 │  │ (#CE0A0A ~ #00B16A)
│    │       Very trustworthy          │  │
│    │       binance.com 🔗            │  │
│    │                                 │  │
│    │  Last checked: 2025년 9월 17일   │  │
│    └─────────────────────────────────┘  │
│                                         │
│  검증 항목 세부사항                      │
│  ✅ 피싱 신고 사이트: 신고 이력 없음      │
│  ✅ Google Safe Browsing: 안전          │
│  ✅ 유효한 SSL 인증서 (빠른 응답)        │
│  ✅ 도메인 정보: 2017년 등록 (7년+)      │
│  ✅ 검증된 암호화폐 거래소               │
│                                         │
│  🔄 [재검증] 📤 [결과 공유]             │
│                                         │
└─────────────────────────────────────────┘
```

### Trustscore 색상 시스템 (ScamAdviser 기반)
```css
/* 점수별 색상 그라데이션 */
90-100점: #00B16A (진한 초록 - 매우 안전)
80-89점:  #00D374 (밝은 초록 - 안전)
60-79점:  #FFCC00 (노랑 - 주의)
40-59점:  #FF8A00 (주황 - 경고)
0-39점:   #CE0A0A (빨강 - 위험)

/* 배경색도 점수에 따라 변화 */
안전: #f0fdf4 (연한 초록)
주의: #fffbeb (연한 노랑)
경고: #fff7ed (연한 주황)
위험: #fef2f2 (연한 빨강)
```

---

## 📊 점수 계산 체계

### 전체 점수 계산 원칙
```
가중치 배분:
- 도메인 정보: 20%
- SSL 인증서: 20%
- 피싱 신고 사이트 검증: 30%
- Google Safe Browsing: 20%
- 거래소 검증: 10% (해당시)
```

### 1. 도메인 정보 점수 기준

**도메인 나이 (30% 가중치)**
- 2년 이상: 매우 신뢰할 수 있음
- 1-2년: 신뢰할 수 있음
- 6-12개월: 보통
- 3-6개월: 주의 필요
- 1-3개월: 위험
- 1개월 미만: 매우 위험

**도메인 상태 (70% 가중치)**

위험 상태:
- 도메인 정지/보류 상태
- 레지스트리 보류 (심각)
- 만료/복구 기간
- 삭제 대기 상태
- 비활성 도메인

보호 상태 (보너스):
- 전송 보호 설정
- 삭제 보호 설정
- 레지스트리 전송 보호

### 2. SSL 인증서 점수 기준

**기본 SSL 검증 (70점)**
- HTTPS 연결 성공
- 유효한 SSL 인증서
- 5초 내 응답
- SSL/TLS 핸드셰이크 성공

**응답 속도 보너스 (+최대 10점)**
- 1초 미만: 최고 보너스
- 1-2초: 높은 보너스
- 2-3초: 보통 보너스
- 3-5초: 낮은 보너스

**검증된 거래소 보너스 (+20점)**
- 알려진 신뢰할 수 있는 거래소 도메인
- 화이트리스트 기반 추가 신뢰도

**연결 실패 (0점)**
- SSL 인증서 없음 (HTTP만 지원)
- 연결 타임아웃
- 인증서 오류 (만료, 잘못된 도메인, 자체 서명)
- DNS 오류 또는 서버 없음

**피싱 사이트 탐지 효과**
- 피싱 사이트: SSL 미설정 또는 오류 빈발
- 정상 거래소: 항상 유효한 SSL 보유
- 응답 속도로 서버 품질 간접 측정
- 타이포스쿼팅 공격 차단

### 3. 피싱 신고 사이트 검증 점수 기준

**피싱 신고 데이터베이스 체크 (70% 가중치)**

PhishTank DB:
- 신고된 피싱 사이트: 즉시 차단 (0점)
- 신고 이력 없음: 기본 점수 (100점)

CryptoScamDB:
- 암호화폐 스캠 신고: 즉시 차단 (0점)
- 의심 사이트 리스트: 강한 경고 (20점)
- 신고 이력 없음: 기본 점수 (100점)

VirusTotal, FCA, SEC, KISA:
- 정부기관/공신력 있는 기관의 위험 평가 통합

**사용자 신고 패턴 분석 (30% 가중치)**

신고 빈도:
- 최근 30일 내 다수 신고: 즉시 차단
- 최근 90일 내 신고: 강한 경고
- 과거 신고 이력: 경고
- 신고 이력 없음: 안전

신고 유형별 심각도:
- 피싱/사기: 완전 차단
- 가짜 거래소: 매우 위험
- 투자 사기: 위험
- 의심스러운 활동: 주의

**최종 점수 계산 규칙**
- 어느 하나라도 신고된 사이트 → 즉시 0점
- 모든 DB에서 안전 → 100점
- 의심 단계 발견 → 최대 50점으로 제한
- 정부기관 인증 보너스: +10점

**활용하는 데이터 소스**
1. **PhishTank API** - 실시간 피싱 사이트 DB
2. **CryptoScamDB** - 암호화폐 스캠 데이터 (6,000+)
3. **VirusTotal API v3** - 60+ 보안 엔진 통합 (500회/일)
4. **FCA Scam Smart DB** - 영국 금융감독청 공식 데이터
5. **SEC EDGAR DB** - 미국 증권거래위원회 공식 데이터
6. **KISA** - 한국인터넷진흥원 공개 데이터

**API 가중치 시스템**
- VirusTotal: 35% (가장 포괄적)
- FCA: 25% (금융 특화)
- SEC: 20% (미국 정부)
- KISA: 20% (한국 정부)

### 4. Google Safe Browsing 점수 기준

**타이포스쿼팅 탐지 (40% 가중치)**
- 시각적 유사도 또는 1-2글자 차이: 즉시 차단 (0점)
- 유명 거래소와 유사한 도메인 패턴 감지
- 키보드 오타를 이용한 피싱 도메인 탐지

**URL 패턴 분석 (30% 가중치)**
- 피싱 키워드 포함: 각 -20점
- 스캠 키워드 포함: 각 -25점
- 의심스러운 최상위 도메인 (.tk, .ml 등): -30점
- 무의미한 랜덤 문자 조합: -20점

**Google Safe Browsing API (30% 가중치)**
- 피싱/멀웨어 위협 탐지: 즉시 차단 (0점)
- 구글 DB 안전 확인: 기본 70점
- 소셜 엔지니어링, 멀웨어, 원치 않는 소프트웨어 체크

**최종 점수 계산**
- 기본 점수 70점에서 각 페널티 차감
- 타이포스쿼팅이나 구글 위협 탐지 시 즉시 0점
- 모든 검사 통과 시 최대 100점

### 5. CoinGecko Exchange 점수 (보너스)

**검증된 거래소 보너스 점수**
- Trust Score 10: 100점 (Binance, Coinbase, Kraken)
- Trust Score 9: 90점 (Bybit)
- Trust Score 8: 80점 (Crypto.com, Gemini, KuCoin)
- Trust Score 5: 50점 (기본값)

**포함된 거래소 목록**
- 메이저 거래소 13개 지원
- CoinGecko Trust Score 기반 평가
- 알려진 신뢰할 수 있는 거래소만 인증

### 최종 상태 결정
- 80점 이상: 'safe' (안전)
- 50-79점: 'warning' (주의)
- 50점 미만: 'danger' (위험)

### 예시 점수 계산
**정상 거래소 (binance.com)**
- 도메인 정보: 20점 (100 × 0.2)
- SSL 인증서: 20점 (100 × 0.2)
- 피싱 신고: 30점 (100 × 0.3)
- Safe Browsing: 20점 (100 × 0.2)
- Exchange 보너스: 10점 (100 × 0.1)
- **총점: 100점 (SAFE)**

**의심 사이트 (fake-binance.com)**
- 도메인 정보: 12점 (신규 도메인)
- SSL 인증서: 0점 (연결 실패)
- 피싱 신고: 6점 (여러 블랙리스트 탐지)
- Safe Browsing: 0점 (타이포스쿼팅 차단)
- Exchange 보너스: 없음
- **총점: 18점 (DANGER)**

---

## 🔧 기술적 세부사항

### API 응답 구조 (심플)
```typescript
interface ValidationResult {
  domain: string;
  score: number; // 0-100
  status: 'safe' | 'warning' | 'danger';
  checks: {
    exchange: CheckResult;
    ssl: CheckResult;
    security: CheckResult;
    domain_age: CheckResult;
  };
  timestamp: string;
}

interface CheckResult {
  passed: boolean;
  score: number;
  message: string;
  details?: string;
}
```

### 성능 목표
- **첫 페이지 로드**: 1초 이내
- **검증 시간**: 3초 이내
- **Lighthouse 점수**: 90+ (모든 항목)

---

## 🔮 확장 계획 (나중에 추가할 기능들)

### 추가 서비스 아이디어
```typescript
// 향후 확장 가능한 서비스들
interface FutureServices {
  'domain-security': '일반 도메인 보안 검사';
  'phishing-detector': '피싱 사이트 탐지';
  'brand-monitoring': '브랜드 침해 모니터링';
  'api-service': 'API로 서비스 제공';
}
```

### 확장 시 고려사항
- 현재 구조에서 새 서비스 모듈 추가
- 메인 페이지에 서비스 선택 탭 추가
- API 엔드포인트 확장
- 사용자 계정 시스템 (선택적)

---

## 📋 완료 체크리스트

### Phase 1 완료 조건
- [x] 심플한 메인 페이지 동작
- [x] shadcn/ui 컴포넌트 설치
- [x] 기본 프로젝트 구조 완성

### Phase 2 완료 조건
- [x] 모든 외부 API 연동 성공 (Mock 데이터)
- [x] API 에러 처리 확인
- [x] 기본 캐싱 동작 (5분 TTL)

### Phase 3 완료 조건
- [x] 검증 엔진 정상 동작
- [x] 점수 계산 알고리즘 검증
- [x] 다양한 사이트 테스트

### Phase 4 완료 조건
- [x] API 엔드포인트 완성 (/api/validate)
- [x] 입력 검증 동작
- [x] API 응답 포맷 확인

### Phase 5 완료 조건
- [x] 전체 UI/UX 완성
- [x] 원형 점수 그래프 및 시각화
- [x] ScamAdviser 느낌의 디자인

### Phase 6 완료 조건
- [ ] 실제 서비스 수준 품질
- [ ] SEO 최적화 완료
- [ ] 배포 및 도메인 연결

---

## 🚀 시작하기

### 개발 환경 준비
- [x] Node.js 18+ 설치
- [x] VS Code 설치
- [x] Git 저장소 준비

### API 키 발급
- CoinGecko API (무료)
- SSL Labs API (무료)  
- PhishTank API (무료)

### 현재 진행 상황
```bash
# Phase 1-5 완료 - 기본 기능 모두 구현
# Mock 데이터로 작동 중 (실제 API 키 필요)

# 개발 서버 실행 (http://localhost:3001)
npm run dev

# 테스트 가능한 도메인
# 안전: binance.com, coinbase.com, kraken.com, kucoin.com
# 위험: fake-binance.com, phishing-site.com
```

---

**ScamAdviser처럼 심플하고 실용적인 서비스를 만들어봅시다!** 🚀

**핵심**: 복잡한 대시보드가 아닌, **URL 입력 → 즉시 결과** 보여주는 단순명료한 서비스