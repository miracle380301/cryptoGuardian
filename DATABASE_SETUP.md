# Database Setup Guide - Neon + Prisma

## 1. Neon Database 설정

### Neon 계정 생성
1. [Neon Console](https://console.neon.tech) 접속
2. GitHub 또는 이메일로 회원가입
3. 무료 플랜 선택 (개발/테스트용으로 충분)

### 데이터베이스 생성
1. "Create Database" 클릭
2. 프로젝트명 입력 (예: crypto-guardian)
3. Region 선택 (가장 가까운 지역 선택)
4. PostgreSQL 버전 선택 (기본값 권장)

### Connection String 복사
1. Dashboard에서 "Connection Details" 확인
2. "Connection string" 복사
3. 형식: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

## 2. 환경 변수 설정

`.env.local` 파일 생성하고 다음 내용 추가:

```env
# Neon Database URL
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# 기타 API 키들 (선택사항)
COINGECKO_API_KEY=""
COINGECKO_API_URL="https://api.coingecko.com/api/v3"
```

## 3. Prisma 초기 설정

### 의존성 설치 (이미 완료됨)
```bash
npm install @neondatabase/serverless prisma @prisma/client
```

### Prisma 클라이언트 생성
```bash
npx prisma generate
```

### 데이터베이스 마이그레이션
```bash
# 개발 환경에서 마이그레이션 생성 및 적용
npx prisma migrate dev --name init

# 또는 프로덕션 환경에서 직접 적용
npx prisma db push
```

### Prisma Studio (데이터베이스 GUI)
```bash
npx prisma studio
```
브라우저에서 http://localhost:5555 접속하여 데이터베이스 확인

## 4. 초기 데이터 설정

### 화이트리스트에 주요 거래소 추가 (선택사항)
```bash
# API를 통해 화이트리스트 추가
curl -X POST http://localhost:3000/api/admin/whitelist \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "binance.com",
    "name": "Binance",
    "category": "exchange",
    "trustScore": 100,
    "officialUrl": "https://www.binance.com"
  }'
```

### 블랙리스트 추가 예시
```bash
curl -X POST http://localhost:3000/api/admin/blacklist \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "scam-exchange.com",
    "reason": "Known phishing site impersonating Binance",
    "severity": "critical",
    "evidence": ["https://example.com/report"],
    "reportedBy": "admin"
  }'
```

## 5. 데이터베이스 스키마

현재 설정된 테이블:

- **ValidationHistory**: 모든 검증 기록 저장
- **BlacklistedDomain**: 위험한 도메인 목록
- **WhitelistedDomain**: 신뢰할 수 있는 도메인 목록
- **ApiUsage**: API 사용 통계
- **UserReport**: 사용자 신고 내역

## 6. 주의사항

### Connection Pool
Neon은 서버리스 환경에 최적화되어 있으며, 자동으로 connection pooling을 관리합니다.

### 콜드 스타트
첫 요청시 약간의 지연이 있을 수 있으나, 이후 요청은 빠르게 처리됩니다.

### 무료 플랜 제한
- 3GB 스토리지
- 1 프로젝트
- 무제한 브랜치
- 충분한 컴퓨팅 시간 (개발용으로 충분)

## 7. 트러블슈팅

### P1001: Can't reach database server
- DATABASE_URL이 올바른지 확인
- Neon 대시보드에서 데이터베이스가 활성화되어 있는지 확인

### P1002: Database server timeout
- 네트워크 연결 확인
- Neon 리전이 너무 멀지 않은지 확인

### Migration 오류
```bash
# 스키마 리셋 (개발 환경에서만)
npx prisma migrate reset

# 강제 동기화
npx prisma db push --force-reset
```

## 8. 모니터링

Neon Console에서 제공하는 기능:
- 실시간 쿼리 모니터링
- 성능 메트릭
- 스토리지 사용량
- Connection 상태

## 9. 백업 및 복구

Neon은 자동 백업을 제공:
- Point-in-time recovery
- Branch 기능으로 데이터베이스 스냅샷 생성
- 7일간 백업 보관 (무료 플랜)