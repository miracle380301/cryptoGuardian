import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'trustScoreRank';
    const order = searchParams.get('order') || 'asc';
    const search = searchParams.get('search') || '';
    const minTrustScore = parseFloat(searchParams.get('minTrustScore') || '0');

    // 필터 조건 구성
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { country: { contains: search, mode: 'insensitive' as const } },
          { id: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(minTrustScore > 0 && {
        trustScore: { gte: minTrustScore }
      })
    };

    // 정렬 옵션
    const orderBy: any = {};
    if (sortBy === 'trustScoreRank') {
      orderBy.trustScoreRank = order;
    } else if (sortBy === 'trustScore') {
      orderBy.trustScore = order;
    } else if (sortBy === 'tradeVolume24hBtc') {
      orderBy.tradeVolume24hBtc = order;
    } else if (sortBy === 'name') {
      orderBy.name = order;
    }

    // 데이터 조회
    const [exchanges, total] = await Promise.all([
      prisma.exchange.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.exchange.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        exchanges,
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Failed to fetch exchanges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchanges' },
      { status: 500 }
    );
  }
}