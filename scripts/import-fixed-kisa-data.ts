import prisma from '../src/lib/db/prisma'

// URL 단축 서비스 목록
const URL_SHORTENERS = [
  'bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 'short.link',
  'han.gl', 'url.vet', 'ssur.cc', 'zrr.kr', 't2m.kr', 'buly.kr',
  'apply.do', 'c11.kr'
]

// 실제 KISA API에서 데이터를 가져와 임포트 (수정된 버전)
async function importFixedKisaData() {
  console.log('Starting fixed KISA data import...')

  const kisaApiKey = process.env.KISA_API_KEY
  if (!kisaApiKey) {
    console.error('KISA_API_KEY not found in environment variables')
    return
  }

  // 기존 데이터 모두 삭제
  console.log('Clearing existing BlacklistedDomain data...')
  await prisma.blacklistedDomain.deleteMany({})
  await prisma.blacklistSyncLog.deleteMany({})

  const batchId = `KISA-BATCH-${Date.now()}`
  const batchDate = new Date()
  let successCount = 0
  let skippedCount = 0
  let errorCount = 0

  try {
    // KISA Open API 호출
    const apiUrl = new URL('https://api.odcloud.kr/api/15109780/v1/uddi:707478dd-938f-4155-badb-fae6202ee7ed')
    apiUrl.searchParams.append('serviceKey', kisaApiKey)
    apiUrl.searchParams.append('page', '1')
    apiUrl.searchParams.append('perPage', '10000')
    apiUrl.searchParams.append('returnType', 'JSON')

    console.log('Fetching data from KISA API...')
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      console.error(`KISA API error: ${response.status} ${response.statusText}`)
      return
    }

    const data = await response.json()
    console.log(`Fetched ${data.totalCount} total records from KISA`)

    // 암호화폐 관련 필터링 키워드
    const cryptoKeywords = [
      'binance', 'upbit', 'bithumb', 'coinone', 'korbit',
      'coinbase', 'kraken', 'huobi', 'okex', 'kucoin', 'bybit',
      'crypto', 'bitcoin', 'ethereum', 'coin', 'blockchain',
      '비트코인', '암호화폐', '가상자산', '거래소', '투자', 'btc', 'eth'
    ]

    // KISA 데이터 처리
    const phishingSites = data.data || []
    console.log(`Processing ${phishingSites.length} phishing sites...`)

    for (const site of phishingSites) {
      try {
        // URL 전체 추출
        const fullUrl = site.홈페이지주소 || site.url || ''
        if (!fullUrl) continue

        // 도메인 추출
        let domain = fullUrl
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .split('/')[0]
          .toLowerCase()
          .trim()

        if (!domain || domain.length < 3) continue

        // URL 단축 서비스인지 확인
        const isShortener = URL_SHORTENERS.some(shortener =>
          domain === shortener || domain.includes(shortener)
        )

        // URL 단축 서비스는 스킵 (도메인 자체를 차단하지 않음)
        if (isShortener) {
          console.log(`Skipped URL shortener: ${domain} (${fullUrl})`)
          skippedCount++
          continue
        }

        // 암호화폐 관련 사이트인지 확인
        const isCrypto = cryptoKeywords.some(keyword =>
          domain.includes(keyword) ||
          fullUrl.toLowerCase().includes(keyword) ||
          (site.사이트명 && site.사이트명.toLowerCase().includes(keyword)) ||
          (site.비고 && site.비고.toLowerCase().includes(keyword))
        )

        // 일반적인 합법 사이트들 제외
        const legitimateDomains = [
          'google.com', 'facebook.com', 'instagram.com', 'twitter.com',
          'youtube.com', 'naver.com', 'daum.net', 'kakao.com',
          'samsung.com', 'lg.com', 'hyundai.com'
        ]

        const isLegitimate = legitimateDomains.some(legitDomain =>
          domain.includes(legitDomain)
        )

        if (isLegitimate) {
          console.log(`Skipped legitimate domain: ${domain}`)
          skippedCount++
          continue
        }

        // 카테고리 결정
        let category = 'phishing'
        let targetBrand = null
        let severity = 'high'
        let riskLevel = 'phishing'

        // 주요 거래소 사칭 확인
        if (domain.includes('binance') && !domain.includes('binance.com')) {
          category = 'crypto'
          targetBrand = 'Binance'
          severity = 'critical'
          riskLevel = 'crypto-scam'
        } else if (domain.includes('upbit') && !domain.includes('upbit.com')) {
          category = 'crypto'
          targetBrand = 'Upbit'
          severity = 'critical'
          riskLevel = 'crypto-scam'
        } else if (domain.includes('bithumb') && !domain.includes('bithumb.com')) {
          category = 'crypto'
          targetBrand = 'Bithumb'
          severity = 'critical'
          riskLevel = 'crypto-scam'
        } else if (domain.includes('coinone') && !domain.includes('coinone.co.kr')) {
          category = 'crypto'
          targetBrand = 'Coinone'
          severity = 'critical'
          riskLevel = 'crypto-scam'
        } else if (domain.includes('coinbase') && !domain.includes('coinbase.com')) {
          category = 'crypto'
          targetBrand = 'Coinbase'
          severity = 'critical'
          riskLevel = 'crypto-scam'
        } else if (isCrypto) {
          category = 'crypto'
          severity = 'high'
          riskLevel = 'crypto-scam'
        }

        // KISA ID 생성
        const kisaId = `KISA-${site.연번 || Date.now()}`

        // 신고일 처리
        const reportDate = site.신고일 ? new Date(site.신고일) : new Date()

        // 새 데이터 추가
        await prisma.blacklistedDomain.create({
          data: {
            domain,
            fullUrl, // 전체 URL 저장
            reason: site.비고 || site.사이트명 || 'KISA 피싱 사이트로 신고됨',
            severity,
            riskLevel,
            category,
            targetBrand,
            description: `KISA 피싱 사이트 신고센터 등록 사이트\n원본 URL: ${fullUrl}\n신고 사유: ${site.비고 || '피싱'}`,
            evidence: [
              `KISA Report ID: ${kisaId}`,
              `원본 URL: ${fullUrl}`,
              `KISA 신고센터: https://www.krcert.or.kr`
            ],
            reportDate,
            reportedBy: 'KISA',

            // KISA 전용 필드
            kisaId,
            kisaCategory: category === 'crypto' ? '암호화폐사기' : '피싱',
            kisaReportDate: reportDate,
            kisaStatus: 'confirmed',
            kisaReference: site.연번?.toString() || null,

            // 데이터 소스 정보
            primaryDataSource: 'kisa',
            dataSources: ['kisa'],

            // 검증 정보
            verificationStatus: 'verified',
            verificationSources: ['kisa'],
            verificationDate: new Date(),

            // 배치 정보
            batchId: batchId,
            batchDate: batchDate,
            lastChecked: new Date(),
            lastUpdated: new Date(),

            // 상태
            isActive: true,
            isConfirmed: true,
            priority: category === 'crypto' ? 9 : 7 // 암호화폐 관련은 더 높은 우선순위
          }
        })

        successCount++
        console.log(`Added: ${domain} ${targetBrand ? `(${targetBrand} impersonation)` : isCrypto ? '(Crypto-related)' : ''}`)

      } catch (error) {
        errorCount++
        console.error(`Error processing site:`, error)
      }
    }

    // 동기화 로그 저장
    await prisma.blacklistSyncLog.create({
      data: {
        batchDate: batchDate,
        source: 'kisa',
        totalFetched: phishingSites.length,
        totalInserted: successCount,
        totalUpdated: 0,
        totalFailed: errorCount,
        status: errorCount === 0 ? 'success' : 'partial',
        executionTime: Date.now() - batchDate.getTime()
      }
    })

    console.log('\n=== Import Summary ===')
    console.log(`Total processed: ${phishingSites.length}`)
    console.log(`Successfully added: ${successCount}`)
    console.log(`Skipped (URL shorteners/legitimate): ${skippedCount}`)
    console.log(`Errors: ${errorCount}`)

    // 암호화폐 관련 도메인 통계
    const cryptoStats = await prisma.blacklistedDomain.count({
      where: {
        primaryDataSource: 'kisa',
        category: 'crypto'
      }
    })

    const phishingStats = await prisma.blacklistedDomain.count({
      where: {
        primaryDataSource: 'kisa',
        category: 'phishing'
      }
    })

    console.log(`\nCrypto-related domains: ${cryptoStats}`)
    console.log(`Phishing domains: ${phishingStats}`)

    // 주요 거래소 사칭 통계
    const exchangeStats = await prisma.blacklistedDomain.groupBy({
      by: ['targetBrand'],
      where: {
        primaryDataSource: 'kisa',
        category: 'crypto',
        targetBrand: {
          not: null
        }
      },
      _count: true
    })

    if (exchangeStats.length > 0) {
      console.log('\nExchange impersonation statistics:')
      exchangeStats.forEach(stat => {
        console.log(`${stat.targetBrand}: ${stat._count} sites`)
      })
    }

  } catch (error) {
    console.error('Import failed:', error)

    // 실패 로그 저장
    await prisma.blacklistSyncLog.create({
      data: {
        batchDate: batchDate,
        source: 'kisa',
        totalFetched: 0,
        totalInserted: 0,
        totalUpdated: 0,
        totalFailed: 0,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - batchDate.getTime()
      }
    })
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
importFixedKisaData()
  .then(() => {
    console.log('Fixed KISA data import completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Import failed:', error)
    process.exit(1)
  })