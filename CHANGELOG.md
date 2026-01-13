# Changelog

모든 주요 변경사항을 이 파일에 기록합니다.

## [Unreleased]

### Added
- MCP API 추가 (`/api/mcp/`)
  - `validate` - 도메인 검증 (MCP 전용)
  - `trending-scams` - 최근 30일 급증한 사기 유형 분석
  - `education` - 카테고리별 피싱 예방 교육 콘텐츠
  - `report` - 사기 사이트 신고 기능
- MCP 서버 도구 추가
  - `get_trending_scams` - 트렌딩 사기 조회
  - `educate_user` - 피싱 예방 교육
  - `report_scam` - 사기 신고
- 자동 데이터 정리 API (`/api/admin/cleanup`)
  - rejected 신고 90일 후 삭제
  - pending 신고 180일 후 삭제
  - API 로그 30일 후 삭제
  - Vercel Cron으로 매주 일요일 실행
- MCP 문서 추가 (`docs/mcp/`)
  - `tools.md` - Tool 상세 스펙
  - `usage.md` - 사용법 및 대화 예시

### Changed
- 모든 MCP API 응답에 CryptoGuardian 참조 URL 추가

---

## [1.0.0] - 2024-XX-XX

### Added
- 초기 릴리스
- 도메인 검증 기능 (`/api/validate`)
- 거래소 목록 조회 (`/api/exchanges`)
- 통계 조회 (`/api/stats`)
- 블랙리스트 관리 (`/api/admin/blacklist`)
- 사용자 신고 (`/api/reports`)
- 9가지 보안 검사 엔진
  - 블랙리스트 검사 (VirusTotal, KISA, PhishTank)
  - 거래소 검증 (CoinGecko, CryptoCompare)
  - WHOIS 조회
  - SSL 인증서 검증
  - Google Safe Browsing
  - 사용자 신고 조회
  - AI 피싱 패턴 분석
  - 의심 도메인 패턴 분석
