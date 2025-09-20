import { NextRequest, NextResponse } from 'next/server';
import { CryptoCompareCollector } from '../../../../../scripts/collect-cryptocompare';

/**
 * API endpoint to trigger CryptoCompare data collection
 *
 * POST /api/admin/collect-cryptocompare
 *
 * This endpoint collects exchange volume and liquidity data from CryptoCompare
 * and updates existing exchange records with additional verification metrics.
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

    console.log('🔍 Starting CryptoCompare data collection via API...');

    const collector = new CryptoCompareCollector();
    await collector.collectCryptoCompareData();

    return NextResponse.json({
      success: true,
      message: 'CryptoCompare data collection completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ CryptoCompare collection API failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'CryptoCompare data collection endpoint. Use POST to trigger collection.',
    usage: 'POST /api/admin/collect-cryptocompare',
    authentication: 'Bearer token required if ADMIN_API_TOKEN is set',
    description: 'Updates existing exchanges with volume and liquidity data from CryptoCompare'
  });
}