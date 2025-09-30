import prisma from './prisma'
import { ValidationResult } from '@/types/validation.types'
import { logger } from '@/lib/logger'

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
    logger.error('Failed to check blacklist', error instanceof Error ? error : undefined, { domain })
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
    logger.error('Failed to check whitelist', error instanceof Error ? error : undefined, { domain })
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
    logger.error('Failed to add to blacklist', error instanceof Error ? error : undefined, { domain })
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
    logger.error('Failed to add to whitelist', error instanceof Error ? error : undefined, { domain })
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
    logger.error('Failed to track API usage', error instanceof Error ? error : undefined)
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
    logger.error('Failed to create user report', error instanceof Error ? error : undefined, { domain })
    return null
  }
}

