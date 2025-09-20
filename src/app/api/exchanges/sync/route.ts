import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const batchDate = new Date();

  try {
    // CoinGecko API 호출
    const apiKey = process.env.COINGECKO_API_KEY || '';
    const apiUrl = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';

    // 먼저 전체 거래소 목록 가져오기 (간단한 정보만)
    console.log('Fetching exchange list from CoinGecko...');
    const listResponse = await fetch(`${apiUrl}/exchanges/list`, {
      method: 'GET',
      headers: apiKey ? { 'x-cg-demo-api-key': apiKey } : {}
    });

    if (!listResponse.ok) {
      throw new Error(`CoinGecko API error: ${listResponse.status}`);
    }

    const exchangeList = await listResponse.json();
    console.log(`Found ${exchangeList.length} total exchanges`);

    // 상세 정보를 가져올 거래소 결정 (페이지네이션으로 가져오기)
    const perPage = 250; // 최대값
    const allExchanges: any[] = [];

    // 여러 페이지로 나눠서 가져오기 (Trust Score 기준 상위 거래소만)
    for (let page = 1; page <= 2; page++) { // 상위 500개만 가져오기 (2 페이지)
      const url = `${apiUrl}/exchanges?per_page=${perPage}&page=${page}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: apiKey ? { 'x-cg-demo-api-key': apiKey } : {}
      });

      if (!response.ok) {
        console.error(`Failed to fetch page ${page}: ${response.status}`);
        break;
      }

      const pageData = await response.json();
      if (pageData.length === 0) break;

      allExchanges.push(...pageData);
      console.log(`Fetched page ${page}: ${pageData.length} exchanges`);

      // Rate limiting을 위한 짧은 대기
      if (page < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const exchanges = allExchanges;
    console.log(`Total fetched: ${exchanges.length} exchanges from CoinGecko`);

    // 통계 추적
    let inserted = 0;
    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    // 배치로 처리 (트랜잭션 사용)
    for (const exchange of exchanges) {
      try {
        // 기존 데이터 확인
        const existing = await prisma.exchange.findUnique({
          where: { id: exchange.id }
        });

        const exchangeData = {
          id: exchange.id,
          name: exchange.name || 'Unknown',
          yearEstablished: exchange.year_established || null,
          country: exchange.country || null,
          description: exchange.description || null,
          url: exchange.url || null,
          image: exchange.image || null,
          hasTradingIncentive: exchange.has_trading_incentive || false,
          trustScore: exchange.trust_score || 0,
          trustScoreRank: exchange.trust_score_rank || null,
          tradeVolume24hBtc: exchange.trade_volume_24h_btc || null,
          dataSource: 'coingecko',
          batchDate: batchDate,
          lastUpdatedAt: new Date(),
          isActive: true
        };

        if (existing) {
          // 업데이트
          await prisma.exchange.update({
            where: { id: exchange.id },
            data: exchangeData
          });
          updated++;
        } else {
          // 새로 추가
          await prisma.exchange.create({
            data: exchangeData
          });
          inserted++;
        }
      } catch (error) {
        failed++;
        const errorMessage = `Failed to process exchange ${exchange.id}: ${error}`;
        console.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    const executionTime = Date.now() - startTime;

    // 동기화 로그 저장
    const syncLog = await prisma.exchangeSyncLog.create({
      data: {
        batchDate,
        totalFetched: exchanges.length,
        totalInserted: inserted,
        totalUpdated: updated,
        totalFailed: failed,
        status: failed === 0 ? 'success' : failed < exchanges.length ? 'partial' : 'failed',
        errorMessage: errors.length > 0 ? errors.slice(0, 5).join('; ') : null,
        executionTime
      }
    });

    console.log(`Sync completed: ${inserted} inserted, ${updated} updated, ${failed} failed`);

    return NextResponse.json({
      success: true,
      data: {
        batchDate,
        totalFetched: exchanges.length,
        totalInserted: inserted,
        totalUpdated: updated,
        totalFailed: failed,
        executionTime: `${executionTime}ms`,
        syncLogId: syncLog.id
      }
    });

  } catch (error) {
    console.error('Exchange sync error:', error);

    // 실패 로그 저장
    try {
      await prisma.exchangeSyncLog.create({
        data: {
          batchDate,
          totalFetched: 0,
          totalInserted: 0,
          totalUpdated: 0,
          totalFailed: 0,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          executionTime: Date.now() - startTime
        }
      });
    } catch (logError) {
      console.error('Failed to save sync log:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync exchanges'
      },
      { status: 500 }
    );
  }
}

// GET: 최근 동기화 상태 조회
export async function GET(request: NextRequest) {
  try {
    // 최근 동기화 로그 조회
    const recentSyncLogs = await prisma.exchangeSyncLog.findMany({
      orderBy: { batchDate: 'desc' },
      take: 5
    });

    // 현재 저장된 거래소 수
    const exchangeCount = await prisma.exchange.count();

    // 상위 10개 거래소 조회
    const topExchanges = await prisma.exchange.findMany({
      where: { isActive: true },
      orderBy: { trustScoreRank: 'asc' },
      take: 10,
      select: {
        id: true,
        name: true,
        trustScore: true,
        trustScoreRank: true,
        tradeVolume24hBtc: true,
        country: true,
        url: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalExchanges: exchangeCount,
        recentSyncLogs,
        topExchanges,
        lastSyncDate: recentSyncLogs[0]?.batchDate || null
      }
    });
  } catch (error) {
    console.error('Failed to get sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}