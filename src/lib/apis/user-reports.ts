import prisma from '@/lib/db/prisma'

export interface UserReportCheck {
  isReported: boolean
  reportCount: number
  recentReports: Array<{
    reportType: string
    description: string | null
    createdAt: Date
    status: string
    evidence: string[]
    reporterEmail: string | null
  }>
  score: number
}

export async function checkUserReports(domain: string): Promise<UserReportCheck> {
  try {
    // 도메인에서 프로토콜 제거 및 정규화
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]

    // 해당 도메인에 대한 사용자 신고 조회 (최근 30일)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const reports = await prisma.userReport.findMany({
      where: {
        OR: [
          { domain: { contains: cleanDomain, mode: 'insensitive' } },
          { domain: { contains: `www.${cleanDomain}`, mode: 'insensitive' } },
          { domain: { contains: `https://${cleanDomain}`, mode: 'insensitive' } },
          { domain: { contains: `http://${cleanDomain}`, mode: 'insensitive' } }
        ],
        createdAt: {
          gte: thirtyDaysAgo
        }
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

    // 점수 계산 (신고 1개당 -10점, 최대 -50점)
    const scoreDeduction = Math.min(reportCount * 10, 50)
    const score = Math.max(0, 100 - scoreDeduction)

    return {
      isReported,
      reportCount,
      recentReports: reports,
      score
    }

  } catch (error) {
    console.error('User reports check error:', error)
    return {
      isReported: false,
      reportCount: 0,
      recentReports: [],
      score: 100
    }
  }
}