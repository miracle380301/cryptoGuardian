# GitHub Actions 배치 스케줄러 설정 가이드

## 개요
암호화폐 보안 검증 시스템의 데이터를 최신 상태로 유지하기 위한 주기적 배치 작업 스케줄러입니다.

## 배치 스크립트 목록

### 1. 거래소 데이터 수집 (주 1회)
| 스크립트 | 설명 | API 사용 | 실행 시간 |
|---------|------|----------|-----------|
| `collect-exchanges.ts` | CoinGecko 거래소 정보 업데이트 | CoinGecko API | ~5분 |
| `collect-cryptocompare.ts` | CryptoCompare 추가 거래소 데이터 | CryptoCompare API | ~3분 |

### 2. 블랙리스트 데이터 수집 (주 1회)
| 스크립트 | 설명 | 데이터 소스 | 실행 시간 |
|---------|------|------------|-----------|
| `import-kisa-blacklist.ts` | 한국인터넷진흥원 악성 사이트 | KISA DB | ~10분 |
| `import-cryptoscamdb.ts` | 암호화폐 스캠 전문 DB | CryptoScamDB | ~5분 |
| `import-urlhaus.ts` | 악성 URL 데이터베이스 | URLhaus (abuse.ch) | ~5분 |

## GitHub Actions 설정

### 1. 환경 변수 설정
GitHub 리포지토리 Settings > Secrets and variables > Actions에서 다음 시크릿 추가:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
COINGECKO_API_KEY=your-coingecko-api-key
CRYPTOCOMPARE_API_KEY=your-cryptocompare-api-key
```

### 2. Workflow 파일 생성
`.github/workflows/batch-sync.yml` 파일 생성:

```yaml
name: Weekly Data Sync

on:
  # 자동 실행: 매주 월요일 오전 2시 (UTC)
  schedule:
    - cron: '0 2 * * 1'

  # 수동 실행 허용
  workflow_dispatch:
    inputs:
      sync_type:
        description: 'Sync Type'
        required: true
        default: 'all'
        type: choice
        options:
          - all
          - exchanges
          - blacklists

env:
  NODE_VERSION: '20'

jobs:
  # 거래소 데이터 동기화
  sync-exchanges:
    name: Sync Exchange Data
    runs-on: ubuntu-latest
    if: ${{ github.event_name == 'schedule' || github.event.inputs.sync_type == 'all' || github.event.inputs.sync_type == 'exchanges' }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Sync CoinGecko Exchange Data
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          COINGECKO_API_KEY: ${{ secrets.COINGECKO_API_KEY }}
        run: |
          echo "Starting CoinGecko exchange sync..."
          npm run collect-exchanges
        continue-on-error: true

      - name: Sync CryptoCompare Data
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          CRYPTOCOMPARE_API_KEY: ${{ secrets.CRYPTOCOMPARE_API_KEY }}
        run: |
          echo "Starting CryptoCompare sync..."
          npm run collect-cryptocompare
        continue-on-error: true

      - name: Summary
        if: always()
        run: |
          echo "Exchange data sync completed"
          echo "Check logs for any errors"

  # 블랙리스트 데이터 동기화
  sync-blacklists:
    name: Sync Blacklist Data
    runs-on: ubuntu-latest
    if: ${{ github.event_name == 'schedule' || github.event.inputs.sync_type == 'all' || github.event.inputs.sync_type == 'blacklists' }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Import KISA Blacklist
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          echo "Starting KISA blacklist import..."
          npm run import-kisa-blacklist
        continue-on-error: true

      - name: Import CryptoScamDB
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          echo "Starting CryptoScamDB import..."
          npm run import-cryptoscamdb
        continue-on-error: true

      - name: Import URLhaus Data
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          echo "Starting URLhaus import..."
          npm run import-urlhaus
        continue-on-error: true

      - name: Summary
        if: always()
        run: |
          echo "Blacklist data sync completed"
          echo "Check logs for any errors"

  # 동기화 결과 알림 (선택사항)
  notify-completion:
    name: Send Notification
    needs: [sync-exchanges, sync-blacklists]
    runs-on: ubuntu-latest
    if: always()

    steps:
      - name: Check Results
        run: |
          echo "Batch sync workflow completed"
          echo "Exchange sync: ${{ needs.sync-exchanges.result }}"
          echo "Blacklist sync: ${{ needs.sync-blacklists.result }}"

      # Slack, Discord, Email 등 알림 추가 가능
      # - name: Send Slack notification
      #   uses: slackapi/slack-github-action@v1.24.0
      #   with:
      #     webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
      #     payload: |
      #       {
      #         "text": "Weekly data sync completed",
      #         "blocks": [...]
      #       }
```

## package.json 스크립트 확인

`package.json`에 다음 스크립트들이 있는지 확인:

```json
{
  "scripts": {
    "collect-exchanges": "tsx scripts/collect-exchanges.ts",
    "collect-cryptocompare": "tsx scripts/collect-cryptocompare.ts",
    "import-kisa-blacklist": "tsx scripts/import-kisa-blacklist.ts",
    "import-cryptoscamdb": "tsx scripts/import-cryptoscamdb.ts",
    "import-urlhaus": "tsx scripts/import-urlhaus.ts"
  }
}
```

## 실행 스케줄

### 자동 실행
- **시간**: 매주 월요일 오전 2시 (UTC) = 한국시간 오전 11시
- **주기**: 주 1회
- **순서**: 거래소 데이터 → 블랙리스트 데이터

### 수동 실행
1. GitHub 리포지토리 > Actions 탭
2. "Weekly Data Sync" 워크플로우 선택
3. "Run workflow" 버튼 클릭
4. Sync Type 선택:
   - `all`: 모든 데이터 동기화
   - `exchanges`: 거래소 데이터만
   - `blacklists`: 블랙리스트만

## 모니터링

### 실행 상태 확인
- GitHub Actions 탭에서 워크플로우 실행 이력 확인
- 각 Job의 로그 확인 가능
- 실패한 작업은 `continue-on-error: true`로 다른 작업에 영향 없음

### 데이터베이스 확인
```sql
-- 최근 동기화 로그 확인
SELECT * FROM "BlacklistSyncLog"
ORDER BY "batchDate" DESC
LIMIT 10;

-- 거래소 업데이트 확인
SELECT COUNT(*), MAX("lastUpdatedAt")
FROM "Exchange";

-- 블랙리스트 업데이트 확인
SELECT "primaryDataSource", COUNT(*), MAX("lastUpdated")
FROM "BlacklistedDomain"
GROUP BY "primaryDataSource";
```

## 트러블슈팅

### 1. 스크립트 실행 실패
- Actions 로그에서 에러 메시지 확인
- 환경 변수 설정 확인
- 데이터베이스 연결 확인

### 2. API 제한
- CoinGecko: 무료 티어 분당 10-30 요청
- CryptoCompare: 무료 티어 월 100,000 요청
- 필요시 실행 간격 조정

### 3. 실행 시간 초과
- GitHub Actions 무료 티어: Job당 최대 6시간
- 필요시 배치를 더 작은 단위로 분할

## 비용

### GitHub Actions (Private Repository)
- 무료: 2,000분/월
- 예상 사용량: ~30분/주 × 4주 = 120분/월
- **충분한 무료 티어로 운영 가능**

### Public Repository
- **완전 무료**

## 보안 주의사항

1. **절대 환경 변수를 코드에 직접 포함하지 마세요**
2. GitHub Secrets 사용 필수
3. 최소 권한 원칙 적용
4. 정기적으로 API 키 교체

## 향후 개선사항

1. 실패한 작업 재시도 로직
2. Slack/Discord 알림 통합
3. 동기화 통계 대시보드
4. 증분 업데이트 로직 구현
5. 병렬 처리로 실행 시간 단축