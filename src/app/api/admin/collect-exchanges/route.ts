import { NextRequest, NextResponse } from 'next/server';
import { ExchangeCollector } from '../../../../../scripts/collect-exchanges';

/**
 * API endpoint to trigger exchange data collection
 *
 * POST /api/admin/collect-exchanges
 *
 * This endpoint can be called manually or by a cron job to collect
 * the latest exchange data from CoinGecko.
 */

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization here
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.ADMIN_API_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 Starting exchange data collection via API...');

    const collector = new ExchangeCollector();
    await collector.collectExchanges();

    return NextResponse.json({
      success: true,
      message: 'Exchange data collection completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Exchange collection API failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Exchange collection endpoint. Use POST to trigger collection.',
    usage: 'POST /api/admin/collect-exchanges',
    authentication: 'Bearer token required if ADMIN_API_TOKEN is set'
  });
}