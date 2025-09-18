// KISA 블랙리스트 검증 테스트
async function testKisaBlacklist() {
  const testDomains = [
    'binance-kr.com',      // KISA 블랙리스트에 있음
    'binance.com',         // 정상 사이트
    'upbit-trading.com'    // KISA 블랙리스트에 있음
  ]

  for (const domain of testDomains) {
    console.log(`\nTesting: ${domain}`)
    console.log('=' . repeat(50))

    try {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: domain,
          verificationType: 'crypto'
        })
      })

      const result = await response.json()

      console.log(`Status: ${result.status}`)
      console.log(`Score: ${result.finalScore}`)
      console.log(`Summary: ${result.summary}`)

      if (result.checks?.reputation) {
        console.log(`Reputation Message: ${result.checks.reputation.message}`)
      }

      if (result.cached) {
        console.log(`Cached: ${result.cached} (${result.cacheType})`)
      }
    } catch (error) {
      console.error(`Error testing ${domain}:`, error)
    }
  }
}

// 실행
testKisaBlacklist().then(() => {
  console.log('\n테스트 완료')
  process.exit(0)
})