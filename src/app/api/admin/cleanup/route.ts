import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

/**
 * 오래된 데이터 자동 정리 API
 * - rejected 신고: 90일 후 삭제
 * - pending 신고: 180일 후 삭제 (검토되지 않은 오래된 건)
 *
 * Vercel Cron으로 매일 실행되거나 수동으로 호출 가능
 * GET /api/admin/cleanup
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Vercel Cron 인증 확인 (선택사항)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // CRON_SECRET이 설정되어 있으면 인증 확인
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Vercel Cron에서 오는 요청인지 확인
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const oneEightyDaysAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    // 1. rejected 신고 삭제 (90일 이상)
    const deletedRejected = await prisma.userReport.deleteMany({
      where: {
        status: 'rejected',
        createdAt: { lt: ninetyDaysAgo }
      }
    });

    // 2. 오래된 pending 신고 삭제 (180일 이상)
    const deletedOldPending = await prisma.userReport.deleteMany({
      where: {
        status: 'pending',
        createdAt: { lt: oneEightyDaysAgo }
      }
    });

    // 3. 오래된 API 사용 로그 삭제 (30일 이상)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const deletedApiLogs = await prisma.apiUsage.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo }
      }
    });

    const responseTime = Date.now() - startTime;

    const result = {
      success: true,
      data: {
        deletedRejectedReports: deletedRejected.count,
        deletedOldPendingReports: deletedOldPending.count,
        deletedApiLogs: deletedApiLogs.count,
        totalDeleted: deletedRejected.count + deletedOldPending.count + deletedApiLogs.count,
        cleanupPolicy: {
          rejectedReports: '90일 후 삭제',
          pendingReports: '180일 후 삭제',
          apiLogs: '30일 후 삭제'
        },
        executedAt: now.toISOString()
      },
      meta: { responseTime }
    };

    console.log('[Cleanup] Result:', result.data);

    return NextResponse.json(result);

  } catch (error) {
    console.error('[Cleanup] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
