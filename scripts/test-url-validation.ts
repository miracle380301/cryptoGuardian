// URL 기반 블랙리스트 검증 테스트
async function testUrlValidation() {
  const testUrls = [
    'binance.com',           // 정상 거래소
    'is.gd',                 // KISA 블랙리스트에 있는 도메인
    'bitly.ws',              // KISA 블랙리스트에 있는 도메인
    'rb.gy',                 // KISA 블랙리스트에 있는 도메인
    'google.com'             // 정상 사이트
  ]

  console.log('=== URL 기반 블랙리스트 검증 테스트 ===\n')

  for (const url of testUrls) {
    console.log(`Testing: ${url}`)
    console.log('=' . repeat(50))

    try {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: url
        })
      })

      const result = await response.json()

      console.log(`Status: ${result.status}`)
      console.log(`Score: ${result.finalScore}`)
      console.log(`Summary: ${result.summary}`)

      if (result.checks?.reputation) {
        console.log(`Reputation: ${result.checks.reputation.message}`)
        if (result.checks.reputation.details?.kisaId) {
          console.log(`KISA ID: ${result.checks.reputation.details.kisaId}`)
        }
      }

      if (result.cached) {
        console.log(`Cached: ${result.cached} (${result.cacheType})`)
      }

      console.log('')

    } catch (error) {
      console.error(`Error testing ${url}:`, error)
      console.log('')
    }
  }
}

// 실행
testUrlValidation().then(() => {
  console.log('테스트 완료')
  process.exit(0)
}).catch(error => {
  console.error('테스트 실패:', error)
  process.exit(1)
})