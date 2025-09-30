import prisma from '@/lib/db/prisma';
import { ExchangeData } from '@/types/api.types';
import { logger } from '@/lib/logger';

export class ExchangeAPI {
  /**
   * Check if domain exists in Exchange DB
   */
  async checkExchange(domain: string): Promise<{ success: boolean; data: ExchangeData | null }> {
    try {
      const exchange = await prisma.exchange.findFirst({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                {
                  url: {
                    contains: domain,
                    mode: 'insensitive'
                  }
                },
                {
                  name: {
                    contains: domain.replace(/\./g, ''),
                    mode: 'insensitive'
                  }
                }
              ]
            }
          ]
        }
      });

      if (!exchange) {
        return { success: true, data: null };
      }

      // Map database result to ExchangeData interface
      const exchangeData: ExchangeData = {
        id: exchange.id,
        name: exchange.name,
        trust_score: exchange.trustScore || 0,
        trust_score_rank: exchange.trustScoreRank || 999,
        trade_volume_24h_btc: exchange.tradeVolume24hBtc || 0,
        established_year: exchange.yearEstablished || undefined,
        country: exchange.country || undefined,
        url: exchange.url || undefined,
        refer_url: exchange.refer_url || undefined,
        image: exchange.image || undefined,
        has_trading_incentive: exchange.hasTradingIncentive || false,
        centralized: true,
        is_verified: true, // Exchange exists in database = verified
        dataSource: 'Exchange DB',
        batchDate: exchange.batchDate || undefined,
        lastUpdatedAt: exchange.lastUpdatedAt,
        // CryptoCompare data
        cryptocompareId: exchange.cryptocompareId || undefined,
        cryptocompareName: exchange.cryptocompareName || undefined,
        totalVolume24h: exchange.totalVolume24h || undefined,
        totalTrades24h: exchange.totalTrades24h || undefined,
        topTierVolume24h: exchange.topTierVolume24h || undefined,
        totalPairs: exchange.totalPairs || undefined,
        cryptocompareGrade: exchange.cryptocompareGrade || undefined,
        dataSources: exchange.dataSources
      };

      return { success: true, data: exchangeData };
    } catch (error) {
      logger.error('Exchange DB check error', error instanceof Error ? error : undefined, { domain });
      return { success: false, data: null };
    }
  }
}