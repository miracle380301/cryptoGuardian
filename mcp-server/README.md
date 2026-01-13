# Crypto Guardian MCP Server

암호화폐 거래소 검증을 위한 MCP (Model Context Protocol) 서버입니다.

## 설치

```bash
cd mcp-server
npm install
npm run build
```

## 환경 설정

```bash
# .env 파일 생성 (선택사항)
CRYPTO_GUARDIAN_API_URL=https://your-crypto-guardian.vercel.app
```

## Claude Desktop 설정

### 1. 설정 파일 위치

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```
(예: `C:\Users\사용자이름\AppData\Roaming\Claude\claude_desktop_config.json`)

**Mac:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### 2. 설정 파일 편집

파일이 없으면 새로 생성하고, 있으면 `mcpServers`에 추가:

```json
{
  "mcpServers": {
    "crypto-guardian": {
      "command": "node",
      "args": ["D:\\projects\\cryptoGuardian\\mcp-server\\dist\\index.js"],
      "env": {
        "CRYPTO_GUARDIAN_API_URL": "https://your-crypto-guardian.vercel.app"
      }
    }
  }
}
```

### 3. API URL 설정

`CRYPTO_GUARDIAN_API_URL`을 실제 배포된 cryptoGuardian 주소로 변경하세요.

### 4. Claude Desktop 재시작

설정 저장 후 Claude Desktop을 완전히 종료했다가 다시 시작하세요.

## 제공 도구

### 1. validate_crypto_site
도메인/URL의 안전성을 검증합니다.

**입력:**
- `domain`: 검증할 도메인 (예: "binance.com")
- `language`: 응답 언어 ("ko" 또는 "en")

**사용 예:**
```
"binance.com 사기야?"
"binnance.com 안전한 사이트야?"
"https://upbit.com 진짜야?"
```

### 2. list_verified_exchanges
검증된 거래소 목록을 조회합니다.

**입력:**
- `limit`: 조회할 거래소 수 (기본: 20)
- `sortBy`: 정렬 기준 ("trustScore", "volume", "name")

**사용 예:**
```
"신뢰할 수 있는 거래소 목록 보여줘"
"거래량 높은 거래소 10개 알려줘"
```

### 3. get_crypto_stats
사기 탐지 통계를 조회합니다.

**사용 예:**
```
"현재 블랙리스트에 몇 개나 등록되어 있어?"
"최근 사기 탐지 현황 알려줘"
```

## 응답 예시

### 검증된 거래소
```json
{
  "inputDomain": "binance.com",
  "score": 100,
  "status": "safe",
  "statusLabel": "안전",
  "isVerified": true,
  "exchange": {
    "name": "Binance",
    "officialUrl": "https://www.binance.com",
    "trustScore": 10,
    "volume24h": "$12.5B"
  },
  "disclaimer": "본 정보는 CoinGecko, CryptoCompare, KISA 등 외부 데이터를 기반으로 합니다..."
}
```

### 피싱 사이트 의심
```json
{
  "inputDomain": "binnance.com",
  "score": 15,
  "status": "danger",
  "statusLabel": "위험",
  "isVerified": false,
  "phishingAlert": {
    "warning": "피싱 사이트 의심",
    "similarTo": "Binance",
    "officialUrl": "https://www.binance.com",
    "similarity": "94%"
  },
  "disclaimer": "..."
}
```
