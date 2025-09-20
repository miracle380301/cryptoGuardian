# Exchange Data Collection System

다중 소스에서 거래소 데이터를 수집하고 데이터베이스에 저장하는 시스템입니다.

## 🔄 지원하는 데이터 소스

1. **CoinGecko** - 기본 신뢰도 데이터
2. **CryptoCompare** - 거래량, 유동성 검증 데이터

## 🚀 설정

### 환경 변수 설정
`.env.local` 파일에 다음 환경 변수를 추가하세요:

```bash
# CoinGecko API (선택사항 - 없어도 작동)
COINGECKO_API_KEY=your_api_key_here
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# CryptoCompare API (선택사항 - 무료 tier 사용 가능)
CRYPTOCOMPARE_API_KEY=your_api_key_here

# Admin API 보안 (선택사항)
ADMIN_API_TOKEN=your_secure_token_here
```

### 필요한 패키지 설치
```bash
npm install tsx
```

## 📊 사용법

### 1. 커맨드라인에서 실행
```bash
# CoinGecko 거래소 데이터 수집 (기본 신뢰도 데이터)
npm run collect-exchanges

# CryptoCompare 데이터 수집 (거래량, 유동성 데이터)
npm run collect-cryptocompare
```

### 2. API 엔드포인트로 실행
```bash
# CoinGecko 데이터 수집
curl -X POST http://localhost:3000/api/admin/collect-exchanges \
  -H "Authorization: Bearer your_token_here"

# CryptoCompare 데이터 수집
curl -X POST http://localhost:3000/api/admin/collect-cryptocompare \
  -H "Authorization: Bearer your_token_here"
```

### 3. 프로그래매틱 실행
```typescript
import { ExchangeCollector } from './scripts/collect-exchanges';

const collector = new ExchangeCollector();
await collector.collectExchanges();
```

## 📈 수집되는 데이터

CoinGecko에서 다음 정보를 수집합니다:

- ✅ **기본 정보**: ID, 이름, 설립연도, 국가
- ✅ **신뢰도**: trust_score (1-10), trust_score_rank
- ✅ **거래량**: 24시간 BTC 거래량
- ✅ **메타데이터**: URL, 이미지, 설명
- ✅ **특성**: 거래 인센티브 여부
- ✅ **추적 정보**: 데이터 소스, 수집일, 업데이트일

## 🔄 자동화

### Cron Job 설정 (Linux/Mac)
```bash
# 매일 새벽 2시에 실행
0 2 * * * curl -X POST http://localhost:3000/api/admin/collect-exchanges -H "Authorization: Bearer your_token"
```

### Vercel Cron (배포 환경)
`vercel.json`에 추가:
```json
{
  "crons": [
    {
      "path": "/api/admin/collect-exchanges",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## 📋 로그 예시

```
🚀 Starting CoinGecko exchange data collection...
📊 Found 245 exchanges from CoinGecko
⏳ Processed 10/245 exchanges...
⏳ Processed 20/245 exchanges...
...
✅ Exchange data collection completed!
📈 Created: 15, Updated: 230, Total: 245
```

## ⚡ 성능 최적화

- **배치 처리**: 10개씩 묶어서 처리
- **Rate Limiting**: 요청 간 200ms 지연
- **Upsert 로직**: 기존 데이터 업데이트 vs 신규 생성
- **에러 처리**: 개별 거래소 실패해도 전체 중단되지 않음

## 🔒 보안

- **API 토큰**: ADMIN_API_TOKEN으로 보호
- **환경 변수**: 민감한 정보는 .env.local에 저장
- **에러 로깅**: 상세한 오류 정보 기록

## 📊 데이터베이스 구조

```sql
Exchange {
  id                  String   @id
  name               String
  yearEstablished    Int?
  country            String?
  description        String?
  url                String?
  image              String?
  hasTradingIncentive Boolean
  trustScore         Float?
  trustScoreRank     Int?
  tradeVolume24hBtc  Float?
  dataSource         String   -- "coingecko"
  batchDate          DateTime
  lastUpdatedAt      DateTime
  isActive           Boolean
}
```

## 🚨 주의사항

1. **API 한도**: CoinGecko 무료 계정은 월 10,000 요청 제한
2. **Rate Limiting**: 너무 빠른 요청 시 429 에러 발생 가능
3. **데이터 품질**: CoinGecko 데이터의 정확성에 의존
4. **네트워크**: 안정적인 인터넷 연결 필요