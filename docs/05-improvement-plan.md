# CryptoGuardian Improvement Plan

## Overview

3가지 주요 개선사항 구현 계획

| # | 개선사항 | 효과 | 난이도 |
|---|---------|------|--------|
| 1 | LEGITIMATE_SITES DB 동적 로딩 | 높음 | 낮음 |
| 2 | 서브도메인/하이픈 패턴 탐지 | 높음 | 중간 |
| 3 | SSL 인증서 상세 분석 | 중간 | 중간 |

---

## 1. LEGITIMATE_SITES DB 동적 로딩

### 현재 상태

```typescript
// src/lib/validation/typosquatting-detector.ts
const LEGITIMATE_SITES = [
  'binance.com',
  'coinbase.com',
  // ... 약 20개 하드코딩
];
```

### 문제점

- DB에 600+ 거래소가 있지만 타이포스쿼팅 검사는 20개만 체크
- 새 거래소 추가 시 코드 수정 필요
- 동기화 안됨

### 구현 방법

**파일**: `src/lib/validation/typosquatting-detector.ts`

```typescript
import { prisma } from '@/lib/db/prisma';

// 캐시 (5분)
let cachedSites: string[] | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function getLegitimaSites(): Promise<string[]> {
  const now = Date.now();

  if (cachedSites && (now - cacheTime) < CACHE_TTL) {
    return cachedSites;
  }

  const exchanges = await prisma.exchange.findMany({
    where: { isActive: true, url: { not: null } },
    select: { url: true }
  });

  cachedSites = exchanges
    .map(e => e.url)
    .filter((url): url is string => url !== null)
    .map(url => {
      // URL에서 도메인 추출
      try {
        return new URL(url).hostname.replace('www.', '');
      } catch {
        return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
      }
    });

  // 기존 일반 사이트도 추가
  const generalSites = [
    'paypal.com', 'amazon.com', 'apple.com',
    'microsoft.com', 'google.com', 'metamask.io'
  ];

  cachedSites = [...new Set([...cachedSites, ...generalSites])];
  cacheTime = now;

  return cachedSites;
}

// 기존 함수 수정
export async function analyzePhishingPatterns(domain: string) {
  const legitimateSites = await getLegitimaSites();
  // ... 기존 로직 (LEGITIMATE_SITES -> legitimateSites)
}
```

### 영향 받는 파일

| 파일 | 변경 |
|-----|------|
| `src/lib/validation/typosquatting-detector.ts` | 동적 로딩 추가 |
| `src/app/api/validate/route.ts` | async 호출로 변경 |

### 예상 효과

- 20개 → 600+ 사이트 검사
- 자동 동기화
- 새 거래소 추가 시 즉시 반영

---

## 2. 서브도메인/하이픈 패턴 탐지

### 현재 상태

탐지 안됨:
```
binance.com.evil.com        ← 미탐지
secure-binance.com          ← 미탐지
binance-login.com           ← 미탐지
login-binance-secure.com    ← 미탐지
```

### 문제점

- 브랜드명이 서브도메인이나 하이픈으로 연결된 패턴 미탐지
- 실제 피싱에서 매우 흔한 패턴

### 구현 방법

**파일**: `src/lib/validation/typosquatting-detector.ts`

```typescript
// 브랜드명 추출 (도메인에서 TLD 제거)
function extractBrandName(domain: string): string {
  return domain.split('.')[0].toLowerCase();
}

// 서브도메인 피싱 탐지
function detectSubdomainPhishing(
  inputDomain: string,
  legitimateSites: string[]
): { isPhishing: boolean; matchedBrand: string; pattern: string } | null {

  const parts = inputDomain.split('.');

  for (const site of legitimateSites) {
    const brand = extractBrandName(site);

    // 패턴 1: brand.com.evil.com
    // 입력 도메인의 앞부분에 브랜드가 포함되어 있고, 실제 도메인이 아닌 경우
    if (parts.length > 2) {
      const possibleBrand = parts.slice(0, -2).join('.');
      if (possibleBrand.includes(brand) && inputDomain !== site) {
        return {
          isPhishing: true,
          matchedBrand: site,
          pattern: 'subdomain_hijack'
        };
      }
    }
  }

  return null;
}

// 하이픈 패턴 탐지
function detectHyphenPhishing(
  inputDomain: string,
  legitimateSites: string[]
): { isPhishing: boolean; matchedBrand: string; pattern: string } | null {

  const domainName = inputDomain.split('.')[0];

  // 하이픈이 없으면 스킵
  if (!domainName.includes('-')) return null;

  const hyphenParts = domainName.split('-');

  for (const site of legitimateSites) {
    const brand = extractBrandName(site);

    // 패턴: secure-binance, binance-login, login-binance-secure
    for (const part of hyphenParts) {
      if (part === brand || levenshteinDistance(part, brand) <= 1) {
        return {
          isPhishing: true,
          matchedBrand: site,
          pattern: 'hyphen_brand'
        };
      }
    }
  }

  return null;
}

// 의심 키워드 + 브랜드 조합
const SUSPICIOUS_KEYWORDS = [
  'login', 'signin', 'secure', 'verify', 'account',
  'wallet', 'support', 'help', 'update', 'confirm',
  'authentication', 'recovery', 'unlock'
];

function detectKeywordBrandCombo(
  inputDomain: string,
  legitimateSites: string[]
): { isPhishing: boolean; matchedBrand: string; keyword: string } | null {

  const domainName = inputDomain.split('.')[0].toLowerCase();

  for (const site of legitimateSites) {
    const brand = extractBrandName(site);

    for (const keyword of SUSPICIOUS_KEYWORDS) {
      // binance-login, login-binance, binancelogin, loginbinance
      const patterns = [
        `${brand}-${keyword}`,
        `${keyword}-${brand}`,
        `${brand}${keyword}`,
        `${keyword}${brand}`
      ];

      for (const pattern of patterns) {
        if (domainName.includes(pattern) ||
            levenshteinDistance(domainName, pattern) <= 2) {
          return {
            isPhishing: true,
            matchedBrand: site,
            keyword
          };
        }
      }
    }
  }

  return null;
}
```

### 탐지 예시

| 입력 | 탐지 결과 |
|-----|----------|
| `binance.com.evil.com` | subdomain_hijack, Binance |
| `secure-binance.com` | hyphen_brand, Binance |
| `binance-login.com` | hyphen_brand + keyword, Binance |
| `coinbase-support.net` | hyphen_brand + keyword, Coinbase |

### 점수 반영

```typescript
// 새로운 패널티 추가
if (subdomainPhishing) {
  penalty -= 70;  // 매우 높은 패널티
  reason = `Subdomain hijacking detected (${subdomainPhishing.matchedBrand})`;
}

if (hyphenPhishing) {
  penalty -= 60;
  reason = `Hyphen brand pattern detected (${hyphenPhishing.matchedBrand})`;
}

if (keywordCombo) {
  penalty -= 50;
  reason = `Suspicious keyword + brand combo (${keywordCombo.keyword})`;
}
```

### 영향 받는 파일

| 파일 | 변경 |
|-----|------|
| `src/lib/validation/typosquatting-detector.ts` | 3개 탐지 함수 추가 |
| `src/lib/score/processors/ai-phishing-processor.ts` | 새 패턴 처리 |

---

## 3. SSL 인증서 상세 분석

### 현재 상태

```typescript
// src/lib/validation/ssl-check.ts
// 단순 유효/무효만 체크
return { valid: true/false }
```

### 문제점

- DV (Domain Validation) vs EV (Extended Validation) 구분 없음
- 피싱 사이트는 대부분 무료 DV 인증서 (Let's Encrypt)
- 인증서 발급일 미확인 (최근 발급 = 의심)

### 구현 방법

**파일**: `src/lib/validation/ssl-check.ts`

```typescript
import https from 'https';
import { TLSSocket } from 'tls';

interface SSLDetails {
  valid: boolean;
  issuer: string;
  issuerOrg: string;
  type: 'EV' | 'OV' | 'DV' | 'unknown';
  validFrom: Date;
  validTo: Date;
  daysOld: number;
  daysUntilExpiry: number;
  trustScore: number;
}

// 알려진 CA 분류
const EV_ISSUERS = [
  'DigiCert EV',
  'Sectigo EV',
  'GlobalSign EV',
  'Entrust EV'
];

const PREMIUM_CAS = [
  'DigiCert',
  'Sectigo',
  'GlobalSign',
  'Entrust',
  'Comodo'
];

const FREE_CAS = [
  "Let's Encrypt",
  'ZeroSSL',
  'Buypass'
];

export async function checkSSLDetails(domain: string): Promise<SSLDetails> {
  return new Promise((resolve) => {
    const options = {
      hostname: domain,
      port: 443,
      method: 'GET',
      rejectUnauthorized: false,
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      const socket = res.socket as TLSSocket;
      const cert = socket.getPeerCertificate();

      if (!cert || Object.keys(cert).length === 0) {
        resolve({
          valid: false,
          issuer: 'unknown',
          issuerOrg: 'unknown',
          type: 'unknown',
          validFrom: new Date(),
          validTo: new Date(),
          daysOld: 0,
          daysUntilExpiry: 0,
          trustScore: 0
        });
        return;
      }

      const issuer = cert.issuer?.O || cert.issuer?.CN || 'unknown';
      const validFrom = new Date(cert.valid_from);
      const validTo = new Date(cert.valid_to);
      const now = new Date();

      const daysOld = Math.floor((now.getTime() - validFrom.getTime()) / (1000 * 60 * 60 * 24));
      const daysUntilExpiry = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // 인증서 타입 판별
      let type: 'EV' | 'OV' | 'DV' | 'unknown' = 'DV';

      if (EV_ISSUERS.some(ev => issuer.includes(ev))) {
        type = 'EV';
      } else if (cert.subject?.O && PREMIUM_CAS.some(ca => issuer.includes(ca))) {
        type = 'OV';
      } else if (FREE_CAS.some(ca => issuer.includes(ca))) {
        type = 'DV';
      }

      // 신뢰도 점수 계산
      let trustScore = 70; // 기본 (유효한 SSL)

      // 인증서 타입별 가산점
      if (type === 'EV') trustScore += 20;
      else if (type === 'OV') trustScore += 10;
      else if (type === 'DV') trustScore += 0;

      // 인증서 나이 (너무 새로우면 감점)
      if (daysOld < 7) trustScore -= 20;      // 7일 미만: 매우 의심
      else if (daysOld < 30) trustScore -= 10; // 30일 미만: 약간 의심

      // 만료 임박 감점
      if (daysUntilExpiry < 7) trustScore -= 10;

      resolve({
        valid: socket.authorized || false,
        issuer,
        issuerOrg: cert.issuer?.O || 'unknown',
        type,
        validFrom,
        validTo,
        daysOld,
        daysUntilExpiry,
        trustScore: Math.max(0, Math.min(100, trustScore))
      });
    });

    req.on('error', () => {
      resolve({
        valid: false,
        issuer: 'unknown',
        issuerOrg: 'unknown',
        type: 'unknown',
        validFrom: new Date(),
        validTo: new Date(),
        daysOld: 0,
        daysUntilExpiry: 0,
        trustScore: 0
      });
    });

    req.on('timeout', () => {
      req.destroy();
    });

    req.end();
  });
}
```

### 점수 반영

```typescript
// src/lib/score/processors/ssl-processor.ts

export function processSSLCheck(result: PromiseSettledResult<SSLDetails>): ValidationCheck {
  if (result.status === 'rejected' || !result.value) {
    return {
      name: 'SSL Certificate',
      passed: false,
      score: 0,
      weight: 0.15,
      message: 'SSL check failed'
    };
  }

  const ssl = result.value;

  let message = `${ssl.type} certificate from ${ssl.issuer}`;
  if (ssl.daysOld < 30) {
    message += ` (issued ${ssl.daysOld} days ago - recent)`;
  }

  return {
    name: 'SSL Certificate',
    passed: ssl.valid,
    score: ssl.trustScore,
    weight: 0.15,
    message,
    details: {
      type: ssl.type,
      issuer: ssl.issuer,
      daysOld: ssl.daysOld,
      daysUntilExpiry: ssl.daysUntilExpiry
    }
  };
}
```

### 점수 기준

| 조건 | 점수 |
|-----|------|
| 기본 (유효한 SSL) | 70 |
| EV 인증서 | +20 |
| OV 인증서 | +10 |
| DV 인증서 | +0 |
| 발급 7일 미만 | -20 |
| 발급 30일 미만 | -10 |
| 만료 7일 이내 | -10 |

### 영향 받는 파일

| 파일 | 변경 |
|-----|------|
| `src/lib/validation/ssl-check.ts` | 상세 분석 추가 |
| `src/lib/score/processors/ssl-processor.ts` | 새 점수 로직 |
| `src/types/validation.types.ts` | SSLDetails 타입 추가 |

---

## 구현 우선순위

```
1. LEGITIMATE_SITES DB 로딩  →  1-2시간
2. 서브도메인/하이픈 탐지     →  2-3시간
3. SSL 상세 분석            →  2-3시간
```

## 테스트 케이스

### 개선 후 탐지 가능해야 할 도메인

```
# 서브도메인 피싱
binance.com.scam-site.com     → danger
upbit.co.kr.fake-domain.net   → danger

# 하이픈 패턴
secure-binance.com            → danger
coinbase-login.com            → danger
metamask-wallet-verify.com    → danger

# SSL 분석
신규 DV 인증서 + 의심 도메인   → 추가 감점
EV 인증서 + 검증된 거래소     → 추가 가점
```
