import { ApiResponse, ExchangeData } from '@/types/api.types';
import { ExchangeAPI } from '@/lib/apis/exchange';
import { logger } from '@/lib/logger';

const exchangeAPI = new ExchangeAPI();

/**
 * Check if a domain is a verified cryptocurrency exchange
 */
export async function checkCryptoExchange(domain: string): Promise<ApiResponse<ExchangeData>> {
  try {
    const result = await exchangeAPI.checkExchange(domain);

    if (result.success && result.data) {
      logger.debug('Exchange found in DB', { domain, exchangeName: result.data.name });

      // 검증된 거래소 데이터 반환
      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    }

    // 거래소가 아님
    logger.debug('No exchange found in DB', { domain });
    return {
      success: true,
      data: {
        id: '',
        name: '',
        trust_score: 0,
        trust_score_rank: 0,
        trade_volume_24h_btc: 0,
        has_trading_incentive: false,
        centralized: true,
        is_verified: false
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Exchange check error', error instanceof Error ? error : undefined, { domain });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}