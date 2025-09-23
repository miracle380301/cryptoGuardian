import { NextRequest, NextResponse } from 'next/server';
import statsCacheManager from '@/lib/cache/statsCache';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('📊 [Stats API] Request received');

    // 캐시 상태 확인
    const cacheInfo = statsCacheManager.getCacheInfo();
    console.log('💾 [Stats API] Cache status:', {
      hasCache: cacheInfo.hasCache,
      isLoading: cacheInfo.isLoading,
      cacheAgeMinutes: Math.floor(cacheInfo.cacheAge / (1000 * 60)),
      isExpired: cacheInfo.isExpired
    });

    // 메모리 캐시에서 통계 조회 (초고속)
    const stats = await statsCacheManager.getStats();

    const responseTime = Date.now() - startTime;

    // 응답 타입 로깅
    if (stats.cached) {
      if (responseTime < 10) {
        console.log(`⚡ [Stats API] Served from MEMORY cache (${responseTime}ms) - Ultra Fast!`);
      } else {
        console.log(`📁 [Stats API] Served from DATABASE cache (${responseTime}ms) - Fast`);
      }
    } else {
      console.log(`🔄 [Stats API] Real-time calculation (${responseTime}ms) - Slower`);
    }

    console.log('✅ [Stats API] Response sent successfully');

    return NextResponse.json({
      success: true,
      stats,
      meta: {
        responseTime: responseTime,
        source: stats.cached ?
          (responseTime < 10 ? 'memory_cache' : 'database_cache') :
          'real_time_calculation'
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ [Stats API] Error after ${responseTime}ms:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}