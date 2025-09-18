import prisma from '../src/lib/db/prisma'

// KISA 블랙리스트 데이터 임포트 스크립트
interface KisaBlacklistData {
  domain: string
  kisaId: string
  category: string
  reportDate: string
  reason: string
  targetBrand?: string
}

// KISA 샘플 데이터 (실제 데이터로 교체 필요)
const kisaBlacklistData: KisaBlacklistData[] = [
  {
    domain: 'binance-kr.com',
    kisaId: 'KISA-2024-001',
    category: '거래소사칭',
    reportDate: '2024-01-15',
    reason: '바이낸스를 사칭한 가짜 암호화폐 거래소 사이트',
    targetBrand: 'Binance'
  },
  {
    domain: 'upbit-trading.com',
    kisaId: 'KISA-2024-002',
    category: '거래소사칭',
    reportDate: '2024-01-20',
    reason: '업비트를 사칭한 피싱 사이트',
    targetBrand: 'Upbit'
  },
  {
    domain: 'crypto-invest-kr.com',
    kisaId: 'KISA-2024-003',
    category: '투자사기',
    reportDate: '2024-02-01',
    reason: '고수익을 보장한다며 투자금을 편취하는 사기 사이트'
  },
  {
    domain: 'bithumb-event.com',
    kisaId: 'KISA-2024-004',
    category: '거래소사칭',
    reportDate: '2024-02-10',
    reason: '빗썸을 사칭하여 이벤트를 빙자한 개인정보 탈취',
    targetBrand: 'Bithumb'
  },
  {
    domain: 'coinone-airdrop.com',
    kisaId: 'KISA-2024-005',
    category: '피싱',
    reportDate: '2024-02-15',
    reason: '코인원 에어드랍을 사칭한 피싱 사이트',
    targetBrand: 'Coinone'
  }
]

// 카테고리별 심각도 매핑
const getSeverityByCategory = (category: string): string => {
  switch (category) {
    case '거래소사칭':
      return 'critical'
    case '투자사기':
      return 'high'
    case '피싱':
      return 'high'
    case '개인정보탈취':
      return 'high'
    default:
      return 'medium'
  }
}

// 카테고리별 위험 레벨 매핑
const getRiskLevelByCategory = (category: string): string => {
  switch (category) {
    case '거래소사칭':
      return 'crypto-scam'
    case '투자사기':
      return 'scam'
    case '피싱':
      return 'phishing'
    case '개인정보탈취':
      return 'phishing'
    default:
      return 'suspicious'
  }
}

async function importKisaBlacklist() {
  console.log('Starting KISA blacklist import...')

  const batchId = `KISA-BATCH-${Date.now()}`
  const batchDate = new Date()
  let successCount = 0
  let updateCount = 0
  let errorCount = 0

  for (const data of kisaBlacklistData) {
    try {
      // 기존 도메인 확인
      const existing = await prisma.blacklistedDomain.findUnique({
        where: { domain: data.domain }
      })

      if (existing) {
        // 기존 데이터 업데이트
        await prisma.blacklistedDomain.update({
          where: { domain: data.domain },
          data: {
            kisaId: data.kisaId,
            kisaCategory: data.category,
            kisaReportDate: new Date(data.reportDate),
            kisaStatus: 'confirmed',
            targetBrand: data.targetBrand || existing.targetBrand,
            dataSources: {
              set: Array.from(new Set([...existing.dataSources, 'kisa']))
            },
            lastUpdated: new Date(),
            isConfirmed: true,
            priority: existing.priority < 8 ? 8 : existing.priority // KISA 확인 시 높은 우선순위
          }
        })
        updateCount++
        console.log(`Updated: ${data.domain}`)
      } else {
        // 새 데이터 추가
        await prisma.blacklistedDomain.create({
          data: {
            domain: data.domain,
            reason: data.reason,
            severity: getSeverityByCategory(data.category),
            riskLevel: getRiskLevelByCategory(data.category),
            category: 'crypto',
            targetBrand: data.targetBrand,
            description: data.reason,
            evidence: [`KISA Report: ${data.kisaId}`],
            reportDate: new Date(data.reportDate),
            reportedBy: 'KISA',

            // KISA 전용 필드
            kisaId: data.kisaId,
            kisaCategory: data.category,
            kisaReportDate: new Date(data.reportDate),
            kisaStatus: 'confirmed',
            kisaReference: data.kisaId,

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
        console.log(`Added: ${data.domain}`)
      }
    } catch (error) {
      errorCount++
      console.error(`Error processing ${data.domain}:`, error)
    }
  }

  // 동기화 로그 저장
  try {
    await prisma.blacklistSyncLog.create({
      data: {
        batchDate: batchDate,
        source: 'kisa',
        totalFetched: kisaBlacklistData.length,
        totalInserted: successCount,
        totalUpdated: updateCount,
        totalFailed: errorCount,
        status: errorCount === 0 ? 'success' : 'partial',
        executionTime: Date.now() - batchDate.getTime()
      }
    })
  } catch (error) {
    console.error('Failed to save sync log:', error)
  }

  console.log('\n=== Import Summary ===')
  console.log(`Total processed: ${kisaBlacklistData.length}`)
  console.log(`Successfully added: ${successCount}`)
  console.log(`Updated existing: ${updateCount}`)
  console.log(`Errors: ${errorCount}`)
}

// 스크립트 실행
importKisaBlacklist()
  .then(() => {
    console.log('KISA blacklist import completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Import failed:', error)
    process.exit(1)
  })