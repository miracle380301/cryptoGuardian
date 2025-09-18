#!/usr/bin/env tsx

/**
 * CoinGecko Exchange Data Collection Script
 *
 * This script fetches exchange data from CoinGecko API and stores it in the database.
 * Run with: npm run collect-exchanges
 */

import { PrismaClient } from '@prisma/client';

interface CoinGeckoExchange {
  id: string;
  name: string;
  year_established?: number;
  country?: string;
  description?: string;
  url?: string;
  image?: string;
  has_trading_incentive?: boolean;
  trust_score?: number;
  trust_score_rank?: number;
  trade_volume_24h_btc?: number;
  trade_volume_24h_btc_normalized?: number;
}

class ExchangeCollector {
  private prisma: PrismaClient;
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.apiKey = process.env.COINGECKO_API_KEY || '';
    this.apiUrl = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
  }

  async collectExchanges() {
    console.log('🚀 Starting CoinGecko exchange data collection...');

    try {
      // Fetch exchanges list from CoinGecko
      const exchanges = await this.fetchExchanges();
      console.log(`📊 Found ${exchanges.length} exchanges from CoinGecko`);

      // Process and store exchanges in batches
      const batchSize = 10;
      let processed = 0;
      let created = 0;
      let updated = 0;

      for (let i = 0; i < exchanges.length; i += batchSize) {
        const batch = exchanges.slice(i, i + batchSize);

        for (const exchange of batch) {
          try {
            const result = await this.upsertExchange(exchange);
            if (result.created) created++;
            else updated++;
            processed++;

            // Rate limiting: wait between requests
            await this.sleep(200); // 200ms delay
          } catch (error) {
            console.error(`❌ Failed to process exchange ${exchange.id}:`, error);
          }
        }

        console.log(`⏳ Processed ${processed}/${exchanges.length} exchanges...`);
      }

      console.log('✅ Exchange data collection completed!');
      console.log(`📈 Created: ${created}, Updated: ${updated}, Total: ${processed}`);

    } catch (error) {
      console.error('❌ Exchange collection failed:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private async fetchExchanges(): Promise<CoinGeckoExchange[]> {
    const response = await fetch(`${this.apiUrl}/exchanges`, {
      headers: this.apiKey ? {
        'x-cg-demo-api-key': this.apiKey
      } : {}
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private async upsertExchange(exchange: CoinGeckoExchange): Promise<{ created: boolean }> {
    const existing = await this.prisma.exchange.findUnique({
      where: { id: exchange.id }
    });

    const exchangeData = {
      name: exchange.name,
      yearEstablished: exchange.year_established,
      country: exchange.country,
      description: exchange.description,
      url: exchange.url,
      refer_url: `https://www.coingecko.com/en/exchanges/${exchange.id}`,
      image: exchange.image,
      hasTradingIncentive: exchange.has_trading_incentive || false,
      trustScore: exchange.trust_score,
      trustScoreRank: exchange.trust_score_rank,
      tradeVolume24hBtc: exchange.trade_volume_24h_btc,
      dataSource: 'coingecko',
      batchDate: new Date(),
      lastUpdatedAt: new Date(),
      isActive: true
    };

    if (existing) {
      // Update existing exchange
      await this.prisma.exchange.update({
        where: { id: exchange.id },
        data: exchangeData
      });
      return { created: false };
    } else {
      // Create new exchange
      await this.prisma.exchange.create({
        data: {
          id: exchange.id,
          ...exchangeData
        }
      });
      return { created: true };
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const collector = new ExchangeCollector();
  await collector.collectExchanges();
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { ExchangeCollector };