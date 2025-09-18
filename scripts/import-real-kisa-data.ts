import prisma from '../src/lib/db/prisma'

// 실제 KISA API에서 데이터를 가져와 임포트
async function importRealKisaData() {
  console.log('Starting real KISA data import...')

  const kisaApiKey = process.env.KISA_API_KEY
  if (!kisaApiKey) {
    console.error('KISA_API_KEY not found in environment variables')
    return
  }

  const batchId = `KISA-BATCH-${Date.now()}`
  const batchDate = new Date()
  let successCount = 0
  let updateCount = 0
  let errorCount = 0

  try {
    // KISA Open API 호출 (전체 피싱 사이트 목록 가져오기)
    const apiUrl = new URL('https://api.odcloud.kr/api/15109780/v1/uddi:707478dd-938f-4155-badb-fae6202ee7ed')
    apiUrl.searchParams.append('serviceKey', kisaApiKey)
    apiUrl.searchParams.append('page', '1')
    apiUrl.searchParams.append('perPage', '10000') // 최대한 많이 가져오기
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
      'coinbase', 'kraken', 'huobi', 'okex', 'kucoin',
      'crypto', 'bitcoin', 'ethereum', 'coin', 'blockchain',
      '비트코인', '암호화폐', '가상자산', '거래소', '투자'
    ]

    // KISA 데이터 처리
    const phishingSites = data.data || []
    console.log(`Processing ${phishingSites.length} phishing sites...`)

    for (const site of phishingSites) {
      try {
        // 도메인 추출 (홈페이지주소 필드에서)
        const urlField = site.홈페이지주소 || site.url || ''
        if (!urlField) continue

        // URL에서 도메인 추출
        let domain = urlField
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .split('/')[0]
          .toLowerCase()
          .trim()

        if (!domain || domain.length < 3) continue

        // 암호화폐 관련 사이트인지 확인
        const isCrypto = cryptoKeywords.some(keyword =>
          domain.includes(keyword) ||
          (site.사이트명 && site.사이트명.toLowerCase().includes(keyword)) ||
          (site.비고 && site.비고.toLowerCase().includes(keyword))
        )

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

        // 기존 도메인 확인
        const existing = await prisma.blacklistedDomain.findUnique({
          where: { domain }
        })

        // KISA ID 생성
        const kisaId = `KISA-${site.연번 || Date.now()}`

        // 신고일 처리
        const reportDate = site.신고일 ? new Date(site.신고일) : new Date()

        if (existing) {
          // 기존 데이터 업데이트
          await prisma.blacklistedDomain.update({
            where: { domain },
            data: {
              kisaId: kisaId,
              kisaCategory: category === 'crypto' ? '암호화폐사기' : '피싱',
              kisaReportDate: reportDate,
              kisaStatus: 'confirmed',
              kisaReference: site.연번?.toString() || null,
              targetBrand: targetBrand || existing.targetBrand,
              dataSources: {
                set: Array.from(new Set([...existing.dataSources, 'kisa']))
              },
              lastUpdated: new Date(),
              isConfirmed: true,
              priority: existing.priority < 8 ? 8 : existing.priority
            }
          })
          updateCount++
          console.log(`Updated: ${domain}`)
        } else {
          // 새 데이터 추가
          await prisma.blacklistedDomain.create({
            data: {
              domain,
              reason: site.비고 || site.사이트명 || 'KISA 피싱 사이트로 신고됨',
              severity,
              riskLevel,
              category,
              targetBrand,
              description: `KISA 피싱 사이트 신고센터 등록 도메인 (${site.사이트명 || '피싱 사이트'})`,
              evidence: [`KISA Report ID: ${kisaId}`, `KISA 신고센터: https://www.krcert.or.kr`],
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
              priority: 8 // KISA 데이터는 높은 우선순위
            }
          })
          successCount++
          console.log(`Added: ${domain} ${isCrypto ? '(Crypto-related)' : ''}`)
        }
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
        totalUpdated: updateCount,
        totalFailed: errorCount,
        status: errorCount === 0 ? 'success' : 'partial',
        executionTime: Date.now() - batchDate.getTime()
      }
    })

    console.log('\n=== Import Summary ===')
    console.log(`Total processed: ${phishingSites.length}`)
    console.log(`Successfully added: ${successCount}`)
    console.log(`Updated existing: ${updateCount}`)
    console.log(`Errors: ${errorCount}`)

    // 암호화폐 관련 도메인 통계
    const cryptoStats = await prisma.blacklistedDomain.count({
      where: {
        primaryDataSource: 'kisa',
        category: 'crypto'
      }
    })

    console.log(`\nCrypto-related domains: ${cryptoStats}`)

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
importRealKisaData()
  .then(() => {
    console.log('KISA data import completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Import failed:', error)
    process.exit(1)
  })