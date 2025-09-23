import { NextRequest, NextResponse } from 'next/server';
import statsCacheManager from '@/lib/cache/statsCache';

/**
 * 통계 캐시 새로고침 API
 *
 * 관리자나 배치 작업에서 수동으로 캐시를 새로고침할 때 사용
 * POST /api/stats/refresh
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Manual stats cache refresh requested');

    // 캐시 강제 새로고침
    const refreshedStats = await statsCacheManager.refreshCache();

    // 캐시 상태 정보
    const cacheInfo = statsCacheManager.getCacheInfo();

    return NextResponse.json({
      success: true,
      message: 'Stats cache refreshed successfully',
      stats: refreshedStats,
      cacheInfo: {
        ...cacheInfo,
        refreshedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Failed to refresh stats cache:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh stats cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * 캐시 상태 조회 API
 *
 * GET /api/stats/refresh
 */
export async function GET(request: NextRequest) {
  try {
    const cacheInfo = statsCacheManager.getCacheInfo();

    return NextResponse.json({
      success: true,
      cacheInfo: {
        ...cacheInfo,
        cacheAgeMinutes: Math.floor(cacheInfo.cacheAge / (1000 * 60)),
        cacheAgeHours: Math.floor(cacheInfo.cacheAge / (1000 * 60 * 60))
      }
    });

  } catch (error) {
    console.error('❌ Failed to get cache info:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get cache information'
      },
      { status: 500 }
    );
  }
}