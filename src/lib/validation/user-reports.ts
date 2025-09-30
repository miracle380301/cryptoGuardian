import prisma from '@/lib/db/prisma'
import { UserReportCheck } from '@/types/api.types'
import { logger } from '@/lib/logger'

export async function checkUserReports(domain: string): Promise<UserReportCheck> {
  try {
    // 해당 도메인에 대한 모든 사용자 신고 조회
    const reports = await prisma.userReport.findMany({
      where: {
        OR: [
          { domain: { contains: domain, mode: 'insensitive' } },
          { domain: { contains: `www.${domain}`, mode: 'insensitive' } },
          { domain: { contains: `https://${domain}`, mode: 'insensitive' } },
          { domain: { contains: `http://${domain}`, mode: 'insensitive' } }
        ]
      },
      select: {
        reportType: true,
        description: true,
        createdAt: true,
        status: true,
        evidence: true,
        reporterEmail: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // 최대 10개까지
    })

    const reportCount = reports.length
    const isReported = reportCount > 0

    return {
      isReported,
      reportCount,
      recentReports: reports
    }

  } catch (error) {
    logger.error('User reports check error', error instanceof Error ? error : undefined, { domain })
    return {
      isReported: false,
      reportCount: 0,
      recentReports: []
    }
  }
}