# GitHub Actions Secrets 설정 가이드

# 블랙리스트 동기화 (일요일):
  1. import-kisa-blacklist.ts - KISA 악성 사이트
  2. import-cryptoscamdb.ts - CryptoScamDB
  3. import-urlhaus.ts - URLhaus 악성 URL

#거래소 데이터 동기화 (수요일):

  4. collect-exchanges.ts - CoinGecko 거래소 정보
  5. collect-cryptocompare.ts - CryptoCompare 데이터

## 필요한 Secrets

### 1. Database (Neon DB)
- `DATABASE_URL`: Neon PostgreSQL 연결 URL (pooled connection)
- `DIRECT_URL`: Neon PostgreSQL 직접 연결 URL (migrations용)

### 2. API Keys
- `KISA_API_KEY`: 공공데이터포털 API 키 (KISA 피싱사이트 데이터)
- `CRYPTOCOMPARE_API_KEY`: CryptoCompare API 키 (거래소 데이터 수집용, 선택사항)

## 설정 방법

### Neon DB URL 얻기

1. Neon Console 접속:
   - https://console.neon.tech 로그인
   - 프로젝트 선택
   - Dashboard에서 Connection Details 확인

2. Connection URLs:
   - **Pooled Connection URL**: `DATABASE_URL`로 사용
     ```
     postgresql://user:password@ep-xxx.pooler.neon.tech/dbname?sslmode=require
     ```
   - **Direct Connection URL**: `DIRECT_URL`로 사용
     ```
     postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require
     ```

### GitHub Repository에 Secrets 추가

1. GitHub Repository 페이지로 이동
2. Settings → Secrets and variables → Actions
3. "New repository secret" 클릭
4. 각 Secret 추가:
   - Name: Secret 이름 (예: `VERCEL_TOKEN`)
   - Value: 실제 값 입력
   - "Add secret" 클릭

## Workflows 실행

### 자동 실행
- **블랙리스트 동기화**: 매주 일요일 UTC 2시에 실행
- **거래소 데이터 동기화**: 매주 수요일 UTC 2시에 실행
- **테스트**: 모든 push/PR 시 실행

### 수동 실행
1. Actions 탭 이동
2. 원하는 워크플로우 선택
3. "Run workflow" 클릭

## 데이터 수집 Scripts

### 블랙리스트 수집
- `collect:kisa`: KISA 경고 사이트
- `collect:phishtank`: PhishTank 피싱 사이트
- `import:urlhaus`: URLHaus 악성 URL
- `import:cryptoscamdb`: CryptoScamDB 스캠 사이트
- `collect:blacklist`: 모든 블랙리스트 통합

### 거래소 데이터 수집
- `collect:exchanges`: CoinGecko 거래소 정보
- `collect:cryptocompare`: CryptoCompare 거래소 데이터

## 트러블슈팅

### 데이터베이스 연결 실패
- DATABASE_URL이 올바른지 확인
- Neon DB 프로젝트가 활성 상태인지 확인
- IP 제한이 있다면 GitHub Actions IP 허용

### 스크립트 실행 실패
- continue-on-error로 일부 실패 허용
- 로그에서 구체적인 에러 확인
- 필요한 환경 변수가 모두 설정되었는지 확인