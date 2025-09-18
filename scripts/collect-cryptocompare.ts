#!/usr/bin/env tsx

/**
 * CryptoCompare Exchange Data Collection Script
 *
 * This script fetches exchange volume and liquidity data from CryptoCompare API
 * and updates the database with additional verification metrics.
 */

import { PrismaClient } from '@prisma/client';
import { CryptoCompareAPI, CryptoCompareExchange, CryptoCompareExchangeStats } from '../src/lib/apis/cryptocompare';

class CryptoCompareCollector {
  private prisma: PrismaClient;
  private cryptoCompareAPI: CryptoCompareAPI;

  constructor() {
    this.prisma = new PrismaClient();
    this.cryptoCompareAPI = new CryptoCompareAPI();
  }

  async collectCryptoCompareData() {
    console.log('🔍 Starting CryptoCompare data collection...');

    try {
      // Step 1: Fetch all exchanges from CryptoCompare
      const exchangesResult = await this.cryptoCompareAPI.getExchanges();

      if (!exchangesResult.success || !exchangesResult.data) {
        throw new Error('Failed to fetch exchanges from CryptoCompare');
      }

      console.log(`📊 Found ${exchangesResult.data.length} exchanges from CryptoCompare`);

      // Step 2: Get our existing exchanges from database
      const existingExchanges = await this.prisma.exchange.findMany({
        where: { isActive: true }
      });

      console.log(`💾 Found ${existingExchanges.length} existing exchanges in database`);

      // Step 3: Match and update existing exchanges
      let matched = 0;
      let updated = 0;
      let newCryptoCompareData = 0;

      for (const dbExchange of existingExchanges) {
        try {
          // Try to find matching CryptoCompare exchange
          const ccExchange = this.findMatchingExchange(dbExchange, exchangesResult.data);

          if (ccExchange) {
            matched++;

            // Get volume/liquidity stats
            const statsResult = await this.cryptoCompareAPI.getExchangeStats(ccExchange.id);

            // Update database with CryptoCompare data
            const updateData: any = {
              cryptocompareId: ccExchange.id,
              cryptocompareName: ccExchange.name,
              refer_url: this.normalizeUrl(ccExchange.url),
              lastUpdatedAt: new Date()
            };

            // Add volume data if available
            if (statsResult.success && statsResult.data) {
              updateData.totalVolume24h = statsResult.data.totalVolume24h;
              updateData.totalTrades24h = statsResult.data.totalTrades24h;
              updateData.topTierVolume24h = statsResult.data.totalTopTierVolume24h;
              updateData.totalPairs = statsResult.data.pairs;
              updateData.cryptocompareGrade = statsResult.data.grade;
            }

            await this.prisma.exchange.update({
              where: { id: dbExchange.id },
              data: updateData
            });

            updated++;
            console.log(`✅ Updated ${dbExchange.name} with CryptoCompare data`);

            // Rate limiting
            await this.sleep(100);

          } else {
            // Try alternative matching strategies
            const alternativeMatch = await this.findAlternativeMatch(dbExchange);
            if (alternativeMatch) {
              matched++;
              console.log(`🔄 Alternative match found for ${dbExchange.name}`);
            }
          }

        } catch (error) {
          console.error(`❌ Failed to process ${dbExchange.name}:`, error);
        }
      }

      // Step 4: Create new exchanges from CryptoCompare that we don't have
      const newExchanges = exchangesResult.data.filter(ccEx =>
        !existingExchanges.some(dbEx =>
          this.findMatchingExchange(dbEx, [ccEx]) !== null
        )
      );

      for (const newExchange of newExchanges.slice(0, 20)) { // Limit to top 20 new exchanges
        try {
          const statsResult = await this.cryptoCompareAPI.getExchangeStats(newExchange.id);

          await this.prisma.exchange.create({
            data: {
              id: `cc_${newExchange.id}`, // Prefix to avoid conflicts
              name: newExchange.name,
              url: null, // CryptoCompare doesn't provide actual exchange URLs
              refer_url: this.normalizeUrl(newExchange.url),
              image: this.normalizeImageUrl(newExchange.logoUrl),
              country: newExchange.country,
              dataSource: 'cryptocompare',
              cryptocompareId: newExchange.id,
              cryptocompareName: newExchange.name,
              totalVolume24h: statsResult.data?.totalVolume24h,
              totalTrades24h: statsResult.data?.totalTrades24h,
              topTierVolume24h: statsResult.data?.totalTopTierVolume24h,
              totalPairs: statsResult.data?.pairs,
              cryptocompareGrade: statsResult.data?.grade,
              isActive: newExchange.isActive !== false,
              batchDate: new Date(),
              lastUpdatedAt: new Date()
            }
          });

          newCryptoCompareData++;
          console.log(`🆕 Created new exchange: ${newExchange.name}`);

          await this.sleep(100);

        } catch (error) {
          console.error(`❌ Failed to create ${newExchange.name}:`, error);
        }
      }

      console.log('✅ CryptoCompare data collection completed!');
      console.log(`📈 Matched: ${matched}, Updated: ${updated}, New: ${newCryptoCompareData}`);

    } catch (error) {
      console.error('❌ CryptoCompare collection failed:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private findMatchingExchange(dbExchange: any, ccExchanges: CryptoCompareExchange[]): CryptoCompareExchange | null {
    const dbName = dbExchange.name.toLowerCase();
    const dbUrl = dbExchange.url?.toLowerCase();

    return ccExchanges.find(ccEx => {
      const ccName = ccEx.name.toLowerCase();
      const ccUrl = ccEx.url?.toLowerCase();

      // Exact name match
      if (dbName === ccName) return true;

      // Name contains match
      if (dbName.includes(ccName) || ccName.includes(dbName)) return true;

      // URL domain match
      if (dbUrl && ccUrl) {
        const dbDomain = this.extractDomain(dbUrl);
        const ccDomain = this.extractDomain(ccUrl);
        if (dbDomain === ccDomain) return true;
      }

      // ID-based matching (remove common suffixes/prefixes)
      const cleanDbName = dbName.replace(/\s+(exchange|trading|platform|crypto)$/i, '');
      const cleanCcName = ccName.replace(/\s+(exchange|trading|platform|crypto)$/i, '');
      if (cleanDbName === cleanCcName) return true;

      return false;
    }) || null;
  }

  private async findAlternativeMatch(dbExchange: any): Promise<boolean> {
    // Try domain-based search using CryptoCompare API
    if (dbExchange.url) {
      const domain = this.extractDomain(dbExchange.url);
      const result = await this.cryptoCompareAPI.findExchangeByDomain(domain);

      if (result.success && result.data) {
        // Update with found match
        await this.prisma.exchange.update({
          where: { id: dbExchange.id },
          data: {
            cryptocompareId: result.data.id,
            cryptocompareName: result.data.name,
            lastUpdatedAt: new Date()
          }
        });
        return true;
      }
    }

    return false;
  }

  private extractDomain(url: string): string {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private normalizeUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    // If it starts with /, add the CryptoCompare base URL
    if (url.startsWith('/')) {
      return `https://www.cryptocompare.com${url}`;
    }

    // If it already has a protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // For any other case, assume it's a relative path
    return `https://www.cryptocompare.com/${url}`;
  }

  private normalizeImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    // If it starts with /, add the CryptoCompare base URL
    if (url.startsWith('/')) {
      return `https://www.cryptocompare.com${url}`;
    }

    // If it already has a protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // For any other case, assume it's a relative path
    return `https://www.cryptocompare.com/${url}`;
  }
}

// Main execution
async function main() {
  const collector = new CryptoCompareCollector();
  await collector.collectCryptoCompareData();
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { CryptoCompareCollector };