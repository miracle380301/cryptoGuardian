# PhishTank API 설정 가이드

## PhishTank API 키 발급 방법

1. **PhishTank 가입**
   - https://www.phishtank.com/register.php 접속
   - 무료 계정 생성

2. **API 키 발급**
   - 로그인 후 https://www.phishtank.com/api_info.php 접속
   - "Request an API key" 클릭
   - Application name: "CryptoGuardian"
   - 용도 설명 후 제출

3. **API 키 설정**
   - 발급받은 API 키를 `.env.local`에 추가:
   ```
   PHISHTANK_API_KEY=your_actual_api_key_here
   ```

## API 제한 사항

### 무료 (API 키 없음)
- 2,000 requests/5분
- 5,000 requests/일

### 무료 (API 키 있음)
- 5,000 requests/5분
- 20,000 requests/일

## PhishTank API 응답 필드

- `in_database`: PhishTank DB에 있는지 여부
- `verified`: 커뮤니티에서 검증되었는지
- `valid`: 현재도 활성 상태인지 (false = 더 이상 피싱 아님)
- `phish_id`: PhishTank 내부 ID
- `verified_at`: 검증 날짜

## 주의사항

1. **오래된 데이터**: PhishTank는 오래된 피싱 사이트도 보관
   - `valid: false`는 더 이상 피싱이 아님을 의미
   - 예: google.com이 2007년에 잘못 등록됨

2. **URL 단축 서비스**: han.gl 같은 단축 서비스의 개별 링크는 등록 안 됨
   - 전체 도메인만 체크 가능
   - 개별 단축 URL은 KISA 등 다른 DB 활용

3. **실시간성**: PhishTank는 커뮤니티 기반이므로 최신 피싱이 없을 수 있음