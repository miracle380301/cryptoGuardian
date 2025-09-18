import prisma from '../src/lib/db/prisma'

async function checkKisaData() {
  try {
    // KISA 데이터 조회
    const kisaData = await prisma.blacklistedDomain.findMany({
      where: {
        primaryDataSource: 'kisa'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('=== KISA 블랙리스트 데이터 ===')
    console.log(`총 ${kisaData.length}개 도메인\n`)

    kisaData.forEach((item, index) => {
      console.log(`${index + 1}. ${item.domain}`)
      console.log(`   - KISA ID: ${item.kisaId}`)
      console.log(`   - 카테고리: ${item.kisaCategory}`)
      console.log(`   - 심각도: ${item.severity}`)
      console.log(`   - 위험 레벨: ${item.riskLevel}`)
      console.log(`   - 대상 브랜드: ${item.targetBrand || 'N/A'}`)
      console.log(`   - 이유: ${item.reason}`)
      console.log(`   - 신고일: ${item.kisaReportDate}`)
      console.log(`   - 상태: ${item.verificationStatus}`)
      console.log(`   - 우선순위: ${item.priority}`)
      console.log('')
    })

    // 통계
    const stats = await prisma.blacklistedDomain.groupBy({
      by: ['kisaCategory'],
      where: {
        primaryDataSource: 'kisa'
      },
      _count: true
    })

    console.log('=== 카테고리별 통계 ===')
    stats.forEach(stat => {
      console.log(`${stat.kisaCategory}: ${stat._count} 개`)
    })

    // 동기화 로그 확인
    const syncLog = await prisma.blacklistSyncLog.findFirst({
      where: {
        source: 'kisa'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (syncLog) {
      console.log('\n=== 마지막 동기화 정보 ===')
      console.log(`일시: ${syncLog.batchDate}`)
      console.log(`상태: ${syncLog.status}`)
      console.log(`추가: ${syncLog.totalInserted}개`)
      console.log(`업데이트: ${syncLog.totalUpdated}개`)
      console.log(`실패: ${syncLog.totalFailed}개`)
    }

  } catch (error) {
    console.error('Error checking KISA data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkKisaData()