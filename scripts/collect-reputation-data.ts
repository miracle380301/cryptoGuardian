import prisma from '../src/lib/db/prisma'
import { PhishingReportCheckAPI } from '../src/lib/apis/reputation-check'
import { SafeBrowsingAPI } from '../src/lib/apis/safe-browsing'

// 평판 데이터 수집 배치 스크립트
interface DomainToCheck {
  domain: string
  source?: string
  priority?: number
}

// 수집할 도메인 목록 (실제로는 여러 소스에서 가져올 수 있음)
async function getDomainsToCheck(): Promise<DomainToCheck[]> {
  // 1. 최근 검증 이력에서 위험한 도메인들 추출
  const recentDangerousDomains = await prisma.validationHistory.findMany({
    where: {
      status: 'danger',
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7일 이내
      }
    },
    select: { domain: true },
    distinct: ['domain']
  })

  // 2. 사용자 신고 도메인들
  const userReports = await prisma.userReport.findMany({
    where: {
      status: 'pending'
    },
    select: { domain: true }
  })

  const domains: DomainToCheck[] = [
    ...recentDangerousDomains.map(d => ({ domain: d.domain, source: 'validation_history' })),
    ...userReports.map(d => ({ domain: d.domain, source: 'user_report' }))
  ]

  return domains
}

async function collectReputationData() {
  console.log('Starting reputation data collection...')

  const batchId = `REPUTATION-BATCH-${Date.now()}`
  const batchDate = new Date()

  // API 초기화
  const reputationAPI = new PhishingReportCheckAPI()
  const safeBrowsingAPI = new SafeBrowsingAPI()

  // 수집할 도메인 목록
  const domainsToCheck = await getDomainsToCheck()
  console.log(`Found ${domainsToCheck.length} domains to check`)

  let successCount = 0
  let updateCount = 0
  let errorCount = 0

  for (const { domain, source } of domainsToCheck) {
    try {
      // 이미 블랙리스트에 있는지 확인
      const existing = await prisma.blacklistedDomain.findUnique({
        where: { domain }
      })

      if (existing && existing.primaryDataSource === 'kisa') {
        console.log(`Skipped: ${domain} (Already in KISA blacklist)`)
        continue
      }

      console.log(`Checking: ${domain}`)

      // API 호출
      const [reputationResult, safeBrowsingResult] = await Promise.allSettled([
        reputationAPI.checkPhishingReports(domain),
        safeBrowsingAPI.checkUrl(domain)
      ])

      // 평판 점수 계산
      let overallScore = 100
      let severity = 'low'
      let riskLevel = 'safe'
      const detectedThreats: string[] = []
      const evidenceUrls: string[] = []
      const detectionSources: string[] = []
      let reason = ''

      // PhishingReportCheck 결과 처리
      if (reputationResult.status === 'fulfilled' && reputationResult.value.success) {
        const repData = reputationResult.value.data

        if (repData.isReported) {
          overallScore = Math.min(overallScore, repData.score)

          // 각 소스별 결과 처리
          if (repData.details && Array.isArray(repData.details)) {
            repData.details.forEach((detail: any) => {
              if (detail.isReported) {
                detectionSources.push(detail.source)

                // 소스별 위협 유형 결정
                if (detail.source.toLowerCase().includes('phish')) {
                  detectedThreats.push('PHISHING')
                } else if (detail.source.toLowerCase().includes('virus')) {
                  detectedThreats.push('MALWARE')
                } else if (detail.source.toLowerCase().includes('scam')) {
                  detectedThreats.push('SCAM')
                }

                // 증거 URL 추가
                if (detail.reportUrl) {
                  evidenceUrls.push(detail.reportUrl)
                }
              }
            })
          }

          // 증거 URL 추가
          if (repData.evidenceUrls) {
            evidenceUrls.push(...repData.evidenceUrls)
          }

          reason = `Detected by: ${detectionSources.join(', ')}`
        }
      }

      // SafeBrowsing 결과 처리
      if (safeBrowsingResult.status === 'fulfilled' && safeBrowsingResult.value.success) {
        const safeData = safeBrowsingResult.value.data

        if (!safeData.safe && safeData.threats && safeData.threats.length > 0) {
          overallScore = 0
          detectionSources.push('Google Safe Browsing')

          safeData.threats.forEach((threat: any) => {
            detectedThreats.push(threat.threatType)
          })

          if (reason) {
            reason += ', Google Safe Browsing'
          } else {
            reason = 'Detected by Google Safe Browsing'
          }
        }
      }

      // 심각도 및 위험 레벨 결정
      if (overallScore < 30) {
        severity = 'critical'
        riskLevel = 'malicious'
      } else if (overallScore < 50) {
        severity = 'high'
        riskLevel = 'suspicious'
      } else if (overallScore < 70) {
        severity = 'medium'
        riskLevel = 'suspicious'
      }

      // 위험한 도메인만 저장 (점수 70 미만)
      if (overallScore < 70) {
        const existing = await prisma.blacklistedDomain.findUnique({
          where: { domain }
        })

        if (existing) {
          // 기존 데이터 업데이트
          await prisma.blacklistedDomain.update({
            where: { domain },
            data: {
              reason: reason || existing.reason,
              severity,
              riskLevel,
              detectedThreats: { set: [...new Set([...detectedThreats])] },
              evidenceUrls: { set: [...new Set([...evidenceUrls])] },
              dataSources: { set: [...new Set([...existing.dataSources, 'reputation_batch'])] },
              verificationSources: { set: detectionSources },
              verificationStatus: 'verified',
              verificationDate: new Date(),
              lastChecked: new Date(),
              lastUpdated: new Date(),
              hitCount: { increment: 1 }
            }
          })
          updateCount++
          console.log(`Updated: ${domain} (Score: ${overallScore})`)
        } else {
          // 새로운 데이터 추가
          await prisma.blacklistedDomain.create({
            data: {
              domain,
              reason: reason || 'Detected as malicious by reputation check',
              severity,
              riskLevel,
              category: detectedThreats.includes('PHISHING') ? 'phishing' :
                       detectedThreats.includes('MALWARE') ? 'malware' : 'scam',
              primaryDataSource: 'reputation_batch',
              dataSources: ['reputation_batch'],
              verificationStatus: 'verified',
              verificationSources: detectionSources,
              verificationDate: new Date(),
              evidence: evidenceUrls, // string[] 타입으로 이미 정의됨
              batchId,
              batchDate,
              lastChecked: new Date(),
              lastUpdated: new Date(),
              isActive: true,
              isConfirmed: true,
              priority: overallScore < 30 ? 10 : overallScore < 50 ? 7 : 5
            }
          })
          successCount++
          console.log(`Added: ${domain} (Score: ${overallScore})`)
        }
      } else {
        console.log(`Skipped: ${domain} (Score: ${overallScore} - Safe)`)
      }

      // API 호출 제한을 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1초 딜레이

    } catch (error) {
      errorCount++
      console.error(`Error processing ${domain}:`, error)
    }
  }

  // 동기화 로그 저장
  await prisma.blacklistSyncLog.create({
    data: {
      batchDate,
      source: 'reputation_batch',
      totalFetched: domainsToCheck.length,
      totalInserted: successCount,
      totalUpdated: updateCount,
      totalFailed: errorCount,
      status: errorCount === 0 ? 'success' : 'partial',
      executionTime: Date.now() - batchDate.getTime()
    }
  })

  console.log('\n=== Collection Summary ===')
  console.log(`Total checked: ${domainsToCheck.length}`)
  console.log(`Successfully added: ${successCount}`)
  console.log(`Updated existing: ${updateCount}`)
  console.log(`Errors: ${errorCount}`)
}

// 알려진 위험 도메인들을 수동으로 체크 (초기 데이터 구축용)
async function checkKnownBadDomains() {
  const knownBadDomains = [
    // 암호화폐 관련 스캠 사이트들 (예시)
    'bitmex-exchange.com',
    'binance-us.net',
    'coinbase-pro.net',
    'kraken-exchange.com',
    'kucoin-exchange.com',
    'huobi-global.net',
    'okex-exchange.com',
    'bitfinex-exchange.com',
    'gemini-exchange.com',
    'poloniex-exchange.com'
  ]

  console.log('Checking known bad domains...')

  for (const domain of knownBadDomains) {
    await prisma.blacklistedDomain.upsert({
      where: { domain },
      create: {
        domain,
        reason: 'Known cryptocurrency scam/phishing site',
        severity: 'high',
        riskLevel: 'crypto-scam',
        category: 'crypto',
        primaryDataSource: 'manual',
        dataSources: ['manual'],
        verificationStatus: 'verified',
        verificationSources: ['manual_review'],
        isActive: true,
        isConfirmed: true,
        priority: 8
      },
      update: {
        lastChecked: new Date()
      }
    })
  }

  console.log(`Added ${knownBadDomains.length} known bad domains`)
}

// 메인 실행 함수
async function main() {
  try {
    // 1. 알려진 위험 도메인 먼저 추가
    await checkKnownBadDomains()

    // 2. 평판 데이터 수집
    await collectReputationData()

    console.log('Reputation data collection completed')
  } catch (error) {
    console.error('Collection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
main()