import { NextRequest, NextResponse } from 'next/server';
import statsCacheManager from '@/lib/cache/statsCache';

export async function GET(request: NextRequest) {
  try {
    // 메모리 캐시에서 통계 조회 (초고속)
    const stats = await statsCacheManager.getStats();

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}