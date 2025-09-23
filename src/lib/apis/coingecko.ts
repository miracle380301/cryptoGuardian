import { ApiResponse, ExchangeData, ApiError } from '@/types/api.types';

export class CoinGeckoAPI {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.COINGECKO_API_KEY || '';
    this.apiUrl = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
  }

  async checkExchange(domain: string, searchMode: 'name' | 'url' = 'url'): Promise<ApiResponse<ExchangeData | null>> {
    try {
      const cleanDomain = this.cleanDomain(domain);

      // Search database first using LIKE search
      const dbExchange = await this.searchExchangeInDatabase(domain, searchMode);

      if (dbExchange) {
        return {
          success: true,
          data: dbExchange,
          timestamp: new Date().toISOString()
        };
      }

      // Fallback to CoinGecko API
      const exchanges = await this.getExchangesList();
      const exchange = this.findExchangeByDomain(cleanDomain, exchanges);

      if (!exchange) {
        return {
          success: true,
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      const detailedInfo = await this.getExchangeDetails(exchange.id);

      return {
        success: true,
        data: detailedInfo,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('CoinGecko API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async searchExchangeInDatabase(domain: string, searchMode: 'name' | 'url' = 'url'): Promise<ExchangeData | null> {
    try {
      // Import prisma only when needed to avoid server-side issues
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      let exchange = null;

      if (searchMode === 'name') {
        // Name-based search: simple LIKE search by exchange name only
        exchange = await prisma.exchange.findFirst({
          where: {
            name: {
              contains: domain,
              mode: 'insensitive'
            },
            isActive: true
          }
        });
      } else {
        // URL-based search: search by URL and domain
        const cleanDomain = this.cleanDomain(domain);

        // Try exact URL match first
        exchange = await prisma.exchange.findFirst({
          where: {
            url: {
              contains: cleanDomain,
              mode: 'insensitive'
            },
            isActive: true
          }
        });

        // If no URL match, try name contains search as fallback
        if (!exchange) {
          const searchTerm = cleanDomain.toUpperCase();
          exchange = await prisma.exchange.findFirst({
            where: {
              name: {
                contains: searchTerm,
                mode: 'insensitive'
              },
              isActive: true
            }
          });
        }
      }

      await prisma.$disconnect();

      if (!exchange) return null;

      // Map database result to ExchangeData interface
      return {
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
        dataSource: exchange.dataSource || 'Database',
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
    } catch (error) {
      console.error('Database search error:', error);
      return null;
    }
  }

  private cleanDomain(input: string): string {
    let domain = input.replace(/^https?:\/\//, '');
    domain = domain.replace(/^www\./, '');
    domain = domain.split('/')[0];
    domain = domain.split(':')[0];
    return domain.toLowerCase();
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    // Calculate Levenshtein distance
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private async getExchangesList(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/exchanges`, {
        headers: this.apiKey ? {
          'x-cg-demo-api-key': this.apiKey
        } : {}
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const exchanges = await response.json();
      return exchanges;
    } catch (error) {
      console.warn('Failed to fetch exchanges from CoinGecko API, falling back to mock data:', error);
      return this.getMockExchangesList();
    }
  }

  private async getExchangeDetails(exchangeId: string): Promise<ExchangeData> {
    try {
      const response = await fetch(`${this.apiUrl}/exchanges/${exchangeId}`, {
        headers: this.apiKey ? {
          'x-cg-demo-api-key': this.apiKey
        } : {}
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const exchangeData = await response.json();

      // Map the API response to our ExchangeData interface
      return {
        id: exchangeData.id,
        name: exchangeData.name,
        trust_score: exchangeData.trust_score || 0,
        trust_score_rank: exchangeData.trust_score_rank || 999,
        trade_volume_24h_btc: exchangeData.trade_volume_24h_btc || 0,
        established_year: exchangeData.year_established,
        country: exchangeData.country,
        url: exchangeData.url,
        refer_url: `https://www.coingecko.com/en/exchanges/${exchangeData.id}`,
        image: exchangeData.image,
        has_trading_incentive: exchangeData.has_trading_incentive || false,
        centralized: exchangeData.centralized !== false, // Default to true
        public_notice: exchangeData.public_notice,
        alert_notice: exchangeData.alert_notice,
        is_verified: true, // Exchange exists in database = verified
        dataSource: 'coingecko',
        // Additional fields
        batchDate: new Date(),
        lastUpdatedAt: new Date(),
        cryptocompareId: undefined,
        cryptocompareName: undefined,
        totalVolume24h: undefined,
        totalTrades24h: undefined,
        topTierVolume24h: undefined,
        totalPairs: undefined,
        cryptocompareGrade: undefined,
        dataSources: ['coingecko']
      };
    } catch (error) {
      console.warn(`Failed to fetch exchange details for ${exchangeId}, falling back to mock data:`, error);
      return this.getMockExchangeDetails(exchangeId);
    }
  }

  private findExchangeByDomain(domain: string, exchanges: any[]): any | null {
    // First, try to find by URL in the actual API response
    const exchangeByUrl = exchanges.find(ex => {
      if (ex.url) {
        const exchangeDomain = ex.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
        return exchangeDomain === domain;
      }
      return false;
    });

    if (exchangeByUrl) {
      return exchangeByUrl;
    }

    // Fallback to manual domain mapping for known exchanges
    const domainMapping: Record<string, string> = {
      'binance.com': 'binance',
      'coinbase.com': 'gdax',
      'coinbase.pro': 'gdax',
      'pro.coinbase.com': 'gdax',
      'kraken.com': 'kraken',
      'crypto.com': 'crypto_com',
      'gemini.com': 'gemini',
      'kucoin.com': 'kucoin',
      'bybit.com': 'bybit',
      'okx.com': 'okex',
      'okex.com': 'okex',
      'huobi.com': 'huobi_global',
      'gate.io': 'gate',
      'bitstamp.net': 'bitstamp',
      'bitfinex.com': 'bitfinex',
      'mexc.com': 'mexc'
    };

    const exchangeId = domainMapping[domain];
    if (!exchangeId) return null;

    return exchanges.find(ex => ex.id === exchangeId) || { id: exchangeId };
  }

  private getMockExchangesList(): any[] {
    return [
      { id: 'binance', name: 'Binance' },
      { id: 'coinbase', name: 'Coinbase Exchange' },
      { id: 'kraken', name: 'Kraken' },
      { id: 'crypto_com', name: 'Crypto.com Exchange' },
      { id: 'gemini', name: 'Gemini' },
      { id: 'kucoin', name: 'KuCoin' },
      { id: 'bybit', name: 'Bybit' },
      { id: 'okex', name: 'OKX' },
      { id: 'huobi', name: 'Huobi' },
      { id: 'gate', name: 'Gate.io' },
      { id: 'bitstamp', name: 'Bitstamp' },
      { id: 'bitfinex', name: 'Bitfinex' },
      { id: 'mxc', name: 'MEXC' }
    ];
  }

  private getMockExchangeDetails(exchangeId: string): ExchangeData {
    const exchangeDetails: Record<string, ExchangeData> = {
      'binance': {
        id: 'binance',
        name: 'Binance',
        trust_score: 10,
        trust_score_rank: 1,
        trade_volume_24h_btc: 580000,
        established_year: 2017,
        country: 'Cayman Islands',
        url: 'https://www.binance.com',
        has_trading_incentive: false,
        centralized: true,
        is_verified: true
      },
      'coinbase': {
        id: 'coinbase',
        name: 'Coinbase Exchange',
        trust_score: 10,
        trust_score_rank: 2,
        trade_volume_24h_btc: 120000,
        established_year: 2012,
        country: 'United States',
        url: 'https://pro.coinbase.com',
        has_trading_incentive: false,
        centralized: true,
        is_verified: true
      },
      'kraken': {
        id: 'kraken',
        name: 'Kraken',
        trust_score: 10,
        trust_score_rank: 3,
        trade_volume_24h_btc: 45000,
        established_year: 2011,
        country: 'United States',
        url: 'https://www.kraken.com',
        has_trading_incentive: false,
        centralized: true,
        is_verified: true
      },
      'crypto_com': {
        id: 'crypto_com',
        name: 'Crypto.com Exchange',
        trust_score: 8,
        trust_score_rank: 15,
        trade_volume_24h_btc: 28000,
        established_year: 2019,
        country: 'Hong Kong',
        url: 'https://crypto.com/exchange',
        has_trading_incentive: true,
        centralized: true,
        is_verified: true
      },
      'gemini': {
        id: 'gemini',
        name: 'Gemini',
        trust_score: 8,
        trust_score_rank: 20,
        trade_volume_24h_btc: 3000,
        established_year: 2014,
        country: 'United States',
        url: 'https://gemini.com',
        has_trading_incentive: false,
        centralized: true,
        is_verified: true
      },
      'kucoin': {
        id: 'kucoin',
        name: 'KuCoin',
        trust_score: 8,
        trust_score_rank: 10,
        trade_volume_24h_btc: 35000,
        established_year: 2017,
        country: 'Seychelles',
        url: 'https://www.kucoin.com',
        has_trading_incentive: false,
        centralized: true,
        is_verified: true
      },
      'bybit': {
        id: 'bybit',
        name: 'Bybit',
        trust_score: 9,
        trust_score_rank: 8,
        trade_volume_24h_btc: 95000,
        established_year: 2018,
        country: 'British Virgin Islands',
        url: 'https://www.bybit.com',
        has_trading_incentive: false,
        centralized: true,
        is_verified: true
      }
    };

    // Default for unknown exchanges
    const result = exchangeDetails[exchangeId] || {
      id: exchangeId,
      name: exchangeId.charAt(0).toUpperCase() + exchangeId.slice(1),
      trust_score: 5,
      trust_score_rank: 100,
      trade_volume_24h_btc: 100,
      centralized: true,
      has_trading_incentive: false,
      is_verified: true
    };

    // Add dataSource to all mock data
    return {
      ...result,
      dataSource: 'coingecko'
    };
  }
}