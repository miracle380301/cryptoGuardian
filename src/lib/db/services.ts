import prisma from './prisma'
import { ValidationResult } from '@/types/api.types'

// 검증 기록 저장 - validationHistory 테이블이 제거되어 주석 처리
// export async function saveValidationHistory(
//   result: ValidationResult,
//   ipAddress?: string,
//   userAgent?: string
// ) {
//   try {
//     const history = await prisma.validationHistory.create({
//       data: {
//         domain: result.domain,
//         verificationType: 'url', // 추후 파라미터로 받을 수 있음
//         finalScore: result.finalScore,
//         status: result.status,
//         checks: result.checks as any,
//         recommendations: result.recommendations,
//         summary: result.summary,
//         ipAddress,
//         userAgent
//       }
//     })
//     return history
//   } catch (error) {
//     console.error('Failed to save validation history:', error)
//     return null
//   }
// }

// 도메인 검증 기록 조회 - validationHistory 테이블이 제거되어 주석 처리
// export async function getValidationHistory(domain: string, limit = 10) {
//   try {
//     const history = await prisma.validationHistory.findMany({
//       where: { domain },
//       orderBy: { createdAt: 'desc' },
//       take: limit
//     })
//     return history
//   } catch (error) {
//     console.error('Failed to fetch validation history:', error)
//     return []
//   }
// }

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

