import prisma from './prisma'
import { ValidationResult } from '@/types/api.types'

// 검증 기록 저장
export async function saveValidationHistory(
  result: ValidationResult,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    const history = await prisma.validationHistory.create({
      data: {
        domain: result.domain,
        verificationType: 'url', // 추후 파라미터로 받을 수 있음
        finalScore: result.finalScore,
        status: result.status,
        checks: result.checks as any,
        recommendations: result.recommendations,
        summary: result.summary,
        ipAddress,
        userAgent
      }
    })
    return history
  } catch (error) {
    console.error('Failed to save validation history:', error)
    return null
  }
}

// 도메인 검증 기록 조회
export async function getValidationHistory(domain: string, limit = 10) {
  try {
    const history = await prisma.validationHistory.findMany({
      where: { domain },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
    return history
  } catch (error) {
    console.error('Failed to fetch validation history:', error)
    return []
  }
}

// 블랙리스트 확인
export async function checkBlacklist(domain: string) {
  try {
    const blacklisted = await prisma.blacklistedDomain.findFirst({
      where: {
        domain,
        isActive: true
      }
    })
    return blacklisted
  } catch (error) {
    console.error('Failed to check blacklist:', error)
    return null
  }
}

// 화이트리스트 확인
export async function checkWhitelist(domain: string) {
  try {
    const whitelisted = await prisma.whitelistedDomain.findFirst({
      where: {
        domain,
        isActive: true
      }
    })
    return whitelisted
  } catch (error) {
    console.error('Failed to check whitelist:', error)
    return null
  }
}

// 블랙리스트에 도메인 추가
export async function addToBlacklist(
  domain: string,
  reason: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  evidence: string[] = [],
  reportedBy?: string
) {
  try {
    const blacklisted = await prisma.blacklistedDomain.create({
      data: {
        domain,
        reason,
        severity,
        evidence,
        reportedBy
      }
    })
    return blacklisted
  } catch (error) {
    console.error('Failed to add to blacklist:', error)
    return null
  }
}

// 화이트리스트에 도메인 추가
export async function addToWhitelist(
  domain: string,
  name: string,
  category: string,
  trustScore: number = 100,
  officialUrl?: string,
  additionalUrls: string[] = []
) {
  try {
    const whitelisted = await prisma.whitelistedDomain.create({
      data: {
        domain,
        name,
        category,
        trustScore,
        officialUrl,
        additionalUrls
      }
    })
    return whitelisted
  } catch (error) {
    console.error('Failed to add to whitelist:', error)
    return null
  }
}

// API 사용량 기록
export async function trackApiUsage(
  endpoint: string,
  responseStatus: number,
  responseTime: number,
  ipAddress?: string,
  userAgent?: string,
  requestBody?: any
) {
  try {
    await prisma.apiUsage.create({
      data: {
        endpoint,
        responseStatus,
        responseTime,
        ipAddress,
        userAgent,
        requestBody
      }
    })
  } catch (error) {
    console.error('Failed to track API usage:', error)
  }
}

// 사용자 신고 저장
export async function createUserReport(
  domain: string,
  reportType: string,
  description?: string,
  reporterEmail?: string,
  evidence: string[] = []
) {
  try {
    const report = await prisma.userReport.create({
      data: {
        domain,
        reportType,
        description,
        reporterEmail,
        evidence
      }
    })
    return report
  } catch (error) {
    console.error('Failed to create user report:', error)
    return null
  }
}

// 최근 검증된 도메인 통계
export async function getRecentStatistics(days = 7) {
  const dateFrom = new Date()
  dateFrom.setDate(dateFrom.getDate() - days)

  try {
    const [totalChecks, safeCount, warningCount, dangerCount] = await Promise.all([
      prisma.validationHistory.count({
        where: { createdAt: { gte: dateFrom } }
      }),
      prisma.validationHistory.count({
        where: {
          createdAt: { gte: dateFrom },
          status: 'safe'
        }
      }),
      prisma.validationHistory.count({
        where: {
          createdAt: { gte: dateFrom },
          status: 'warning'
        }
      }),
      prisma.validationHistory.count({
        where: {
          createdAt: { gte: dateFrom },
          status: 'danger'
        }
      })
    ])

    return {
      totalChecks,
      safeCount,
      warningCount,
      dangerCount,
      safePercentage: totalChecks > 0 ? (safeCount / totalChecks * 100).toFixed(1) : 0,
      period: `${days} days`
    }
  } catch (error) {
    console.error('Failed to get statistics:', error)
    return null
  }
}

// 인기 도메인 조회 (많이 검사된 도메인)
export async function getPopularDomains(limit = 10, days = 30) {
  const dateFrom = new Date()
  dateFrom.setDate(dateFrom.getDate() - days)

  try {
    const popularDomains = await prisma.validationHistory.groupBy({
      by: ['domain'],
      where: { createdAt: { gte: dateFrom } },
      _count: { domain: true },
      orderBy: { _count: { domain: 'desc' } },
      take: limit
    })

    return popularDomains.map(item => ({
      domain: item.domain,
      count: item._count.domain
    }))
  } catch (error) {
    console.error('Failed to get popular domains:', error)
    return []
  }
}

// ========== REPUTATION CACHE FUNCTIONS ==========

// 평판 캐시 조회 (만료되지 않은 것만)
export async function getBlacklistCache(domain: string, verificationType = 'url') {
  try {
    const cache = await prisma.reputationCache.findUnique({
      where: { domain },
    })

    if (!cache) return null

    // 캐시 만료 확인
    if (new Date() > cache.cacheExpiry) {
      await deleteReputationCache(domain)
      return null
    }

    return cache
  } catch (error) {
    console.error('Failed to get reputation cache:', error)
    return null
  }
}

// 평판 캐시 저장/업데이트
export async function saveReputationCache(
  domain: string,
  validationResult: any,
  verificationType = 'url',
  cacheHours = 6 // 6시간 캐시
) {
  try {
    const cacheExpiry = new Date()
    cacheExpiry.setHours(cacheExpiry.getHours() + cacheHours)

    // 각 검사별 점수와 데이터 추출
    const checks = validationResult.checks || {}

    // 탐지된 위협 정보 수집
    const detectedThreats: string[] = []
    const evidenceUrls: string[] = []
    const detectionSources: string[] = []

    // 평판 검사에서 위협 정보 추출
    if (checks.reputation?.details) {
      const repData = checks.reputation.details
      if (repData.isReported && repData.details) {
        repData.details.forEach((detail: any) => {
          if (detail.isReported) {
            detectionSources.push(detail.source)
            if (detail.threatType) {
              detectedThreats.push(detail.threatType)
            }
          }
        })
      }
      if (repData.evidenceUrls) {
        evidenceUrls.push(...repData.evidenceUrls)
      }
    }

    // Safe Browsing에서 위협 정보 추출
    if (checks.safeBrowsing?.details?.threats) {
      checks.safeBrowsing.details.threats.forEach((threat: any) => {
        detectedThreats.push(threat.threatType)
      })
      detectionSources.push('Google Safe Browsing')
    }

    const cacheData = {
      domain,
      overallScore: validationResult.finalScore,
      riskLevel: validationResult.status,
      isReported: validationResult.finalScore < 50,

      whoisScore: checks.whois?.score || null,
      whoisData: checks.whois ? JSON.parse(JSON.stringify(checks.whois)) : null,

      sslScore: checks.ssl?.score || null,
      sslData: checks.ssl ? JSON.parse(JSON.stringify(checks.ssl)) : null,

      reputationScore: checks.reputation?.score || 50,
      reputationData: checks.reputation ? JSON.parse(JSON.stringify(checks.reputation)) : {},

      safeBrowsingScore: checks.safeBrowsing?.score || null,
      safeBrowsingData: checks.safeBrowsing ? JSON.parse(JSON.stringify(checks.safeBrowsing)) : null,

      exchangeScore: checks.exchange?.score || null,
      exchangeData: checks.exchange ? JSON.parse(JSON.stringify(checks.exchange)) : null,

      detectedThreats,
      evidenceUrls,
      detectionSources,

      verificationType,
      cacheExpiry,
      lastUpdated: new Date()
    }

    const cache = await prisma.reputationCache.upsert({
      where: { domain },
      create: cacheData,
      update: cacheData
    })

    return cache
  } catch (error) {
    console.error('Failed to save reputation cache:', error)
    return null
  }
}

// BlackList 캐시에서 ValidationResult 복원
export function restoreValidationResultFromCache(cache: any): any {
  const checks: any = {}

  if (cache.whoisData) {
    checks.whois = cache.whoisData
    checks.whois.score = cache.whoisScore
  }

  if (cache.sslData) {
    checks.ssl = cache.sslData
    checks.ssl.score = cache.sslScore
  }

  if (cache.reputationData) {
    checks.reputation = cache.reputationData
    checks.reputation.score = cache.reputationScore
  }

  if (cache.safeBrowsingData) {
    checks.safeBrowsing = cache.safeBrowsingData
    checks.safeBrowsing.score = cache.safeBrowsingScore
  }

  if (cache.exchangeData) {
    checks.exchange = cache.exchangeData
    checks.exchange.score = cache.exchangeScore
  }

  return {
    domain: cache.domain,
    finalScore: cache.overallScore,
    status: cache.riskLevel,
    checks,
    summary: generateCachedSummary(cache),
    recommendations: generateCachedRecommendations(cache),
    timestamp: cache.lastUpdated.toISOString(),
    cached: true
  }
}

// 캐시에서 요약 생성
function generateCachedSummary(cache: any): string {
  const { domain, overallScore, riskLevel } = cache

  if (riskLevel === 'safe') {
    if (cache.exchangeData) {
      return `${domain} is a verified cryptocurrency exchange with excellent security credentials.`
    }
    return `${domain} appears to be safe with a trust score of ${overallScore}/100.`
  } else if (riskLevel === 'warning') {
    return `${domain} has some concerns. Proceed with caution (score: ${overallScore}/100).`
  } else {
    return `${domain} has significant security risks. Not recommended (score: ${overallScore}/100).`
  }
}

// 캐시에서 추천사항 생성
function generateCachedRecommendations(cache: any): string[] {
  const recommendations: string[] = []
  const { overallScore, detectedThreats, exchangeData } = cache

  if (overallScore >= 80) {
    recommendations.push('This site appears to be safe for use.')
    if (exchangeData) {
      recommendations.push('This is a recognized cryptocurrency exchange.')
    }
  }

  if (detectedThreats.length > 0) {
    if (detectedThreats.includes('MALWARE')) {
      recommendations.push('CRITICAL: Malware detected - avoid at all costs.')
    }
    if (detectedThreats.includes('PHISHING')) {
      recommendations.push('CRITICAL: Phishing site detected - do not enter any information.')
    }
    if (detectedThreats.includes('SOCIAL_ENGINEERING')) {
      recommendations.push('WARNING: Social engineering patterns detected.')
    }
  }

  if (cache.sslScore && cache.sslScore < 60) {
    recommendations.push('Avoid entering sensitive information - SSL certificate issues detected.')
  }

  if (cache.whoisScore && cache.whoisScore < 50) {
    recommendations.push('Be cautious - this is a very new domain.')
  }

  if (cache.isReported) {
    recommendations.push('High risk - domain has poor reputation or is blacklisted.')
  }

  if (overallScore < 50) {
    recommendations.push('Strongly recommend avoiding this site.')
    recommendations.push('Consider using well-known exchanges like Binance, Coinbase, or Kraken.')
  }

  return recommendations
}

// 평판 캐시 삭제
export async function deleteReputationCache(domain: string) {
  try {
    await prisma.reputationCache.delete({
      where: { domain }
    })
    return true
  } catch (error) {
    console.error('Failed to delete reputation cache:', error)
    return false
  }
}

// 만료된 캐시 정리
export async function cleanExpiredReputationCache() {
  try {
    const result = await prisma.reputationCache.deleteMany({
      where: {
        cacheExpiry: {
          lt: new Date()
        }
      }
    })
    console.log(`Cleaned ${result.count} expired reputation cache entries`)
    return result.count
  } catch (error) {
    console.error('Failed to clean expired reputation cache:', error)
    return 0
  }
}

// 블랙리스트 도메인을 평판 캐시로 변환
export async function syncBlacklistToReputationCache() {
  try {
    const blacklistedDomains = await prisma.blacklistedDomain.findMany({
      where: { isActive: true }
    })

    let synced = 0
    for (const blacklisted of blacklistedDomains) {
      const cacheExpiry = new Date()
      cacheExpiry.setHours(cacheExpiry.getHours() + 24) // 블랙리스트는 24시간 캐시

      await prisma.reputationCache.upsert({
        where: { domain: blacklisted.domain },
        create: {
          domain: blacklisted.domain,
          overallScore: 0,
          riskLevel: 'danger',
          isReported: true,
          reputationScore: 0,
          reputationData: {
            isReported: true,
            score: 0,
            reason: blacklisted.reason,
            severity: blacklisted.severity,
            sources: ['Blacklist Database']
          },
          detectedThreats: [blacklisted.riskLevel || 'malicious'],
          evidenceUrls: blacklisted.evidence,
          detectionSources: ['Blacklist Database'],
          verificationType: 'url',
          cacheExpiry
        },
        update: {
          overallScore: 0,
          riskLevel: 'danger',
          isReported: true,
          cacheExpiry
        }
      })
      synced++
    }

    console.log(`Synced ${synced} blacklisted domains to reputation cache`)
    return synced
  } catch (error) {
    console.error('Failed to sync blacklist to reputation cache:', error)
    return 0
  }
}