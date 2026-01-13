# CryptoGuardian MCP 서버 설정 가이드

## Claude Desktop 설정

### 설정 파일 위치

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Mac:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

---

## 설정 방법

### 1. 설정 파일 열기

Windows에서 실행 (Win + R):
```
%APPDATA%\Claude\claude_desktop_config.json
```

### 2. MCP 서버 등록

`claude_desktop_config.json` 파일에 다음 내용 추가:

```json
{
  "mcpServers": {
    "crypto-guardian": {
      "command": "node",
      "args": ["D:\\projects\\cryptoGuardian\\mcp-server\\dist\\index.js"],
      "env": {
        "CRYPTO_GUARDIAN_API_URL": "https://cryptoguardian.co.kr"
      }
    }
  }
}
```

**Mac/Linux 경로 예시:**
```json
{
  "mcpServers": {
    "crypto-guardian": {
      "command": "node",
      "args": ["/Users/username/projects/cryptoGuardian/mcp-server/dist/index.js"],
      "env": {
        "CRYPTO_GUARDIAN_API_URL": "https://cryptoguardian.co.kr"
      }
    }
  }
}
```

### 3. Claude Desktop 재시작

설정 저장 후 Claude Desktop을 완전히 종료하고 다시 시작합니다.

---

## 로컬 개발 환경 설정

로컬에서 테스트하려면 환경변수를 로컬 서버로 변경:

```json
{
  "mcpServers": {
    "crypto-guardian": {
      "command": "node",
      "args": ["D:\\projects\\cryptoGuardian\\mcp-server\\dist\\index.js"],
      "env": {
        "CRYPTO_GUARDIAN_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

로컬 서버 실행:
```bash
cd D:\projects\cryptoGuardian
npm run dev
```

---

## MCP 서버 빌드

MCP 서버 코드를 수정한 경우 다시 빌드해야 합니다:

```bash
cd D:\projects\cryptoGuardian\mcp-server
npm run build
```

---

## 설정 확인

### 설정이 올바른지 확인하는 방법

1. Claude Desktop 실행
2. 새 대화 시작
3. 다음 명령 입력:
   ```
   binance.com 검증해줘
   ```
4. CryptoGuardian 도구가 호출되면 성공

### 문제 해결

**MCP 서버가 인식되지 않는 경우:**
- JSON 문법 오류 확인 (쉼표, 괄호 등)
- 경로에 백슬래시(`\`) 두 번 사용 확인 (Windows)
- Claude Desktop 완전히 재시작
- Node.js 설치 확인 (`node --version`)

**API 호출 실패:**
- `CRYPTO_GUARDIAN_API_URL` 확인
- 인터넷 연결 확인
- 로컬 테스트 시 `npm run dev` 실행 확인

---

## 사용 가능한 도구

| 도구명 | 설명 | 예시 |
|--------|------|------|
| `validate_crypto_site` | 도메인 검증 | "binance.com 검증해줘" |
| `list_verified_exchanges` | 거래소 목록 | "검증된 거래소 목록 보여줘" |
| `get_crypto_stats` | 통계 조회 | "사기 탐지 통계 알려줘" |
| `get_trending_scams` | 트렌딩 사기 | "요즘 어떤 사기가 유행해?" |
| `educate_user` | 피싱 예방 교육 | "암호화폐 사기 예방법 알려줘" |
| `report_scam` | 사기 신고 | "fake-site.com 신고해줘" |

---

## 전체 설정 예시

다른 MCP 서버와 함께 사용하는 경우:

```json
{
  "mcpServers": {
    "crypto-guardian": {
      "command": "node",
      "args": ["D:\\projects\\cryptoGuardian\\mcp-server\\dist\\index.js"],
      "env": {
        "CRYPTO_GUARDIAN_API_URL": "https://cryptoguardian.co.kr"
      }
    },
    "other-server": {
      "command": "node",
      "args": ["path/to/other/server.js"]
    }
  }
}
```
