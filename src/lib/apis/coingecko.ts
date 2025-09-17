import { ApiResponse, ExchangeData, ApiError } from '@/types/api.types';

export class CoinGeckoAPI {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.COINGECKO_API_KEY || '';
    this.apiUrl = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
  }

  async checkExchange(domain: string): Promise<ApiResponse<ExchangeData | null>> {
    try {
      const cleanDomain = this.cleanDomain(domain);

      // Get exchanges list from CoinGecko
      const exchanges = await this.getExchangesList();

      // Find matching exchange
      const exchange = this.findExchangeByDomain(cleanDomain, exchanges);

      if (!exchange) {
        return {
          success: true,
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      // Get detailed exchange info
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

  private cleanDomain(input: string): string {
    let domain = input.replace(/^https?:\/\//, '');
    domain = domain.replace(/^www\./, '');
    domain = domain.split('/')[0];
    domain = domain.split(':')[0];
    return domain.toLowerCase();
  }

  private async getExchangesList(): Promise<any[]> {
    // For demo, return mock data
    // In production, would call actual CoinGecko API
    return this.getMockExchangesList();
  }

  private async getExchangeDetails(exchangeId: string): Promise<ExchangeData> {
    // For demo, return mock detailed data
    return this.getMockExchangeDetails(exchangeId);
  }

  private findExchangeByDomain(domain: string, exchanges: any[]): any | null {
    // Map known domains to exchange IDs
    const domainMapping: Record<string, string> = {
      'binance.com': 'binance',
      'coinbase.com': 'coinbase',
      'coinbase.pro': 'coinbase',
      'pro.coinbase.com': 'coinbase',
      'kraken.com': 'kraken',
      'crypto.com': 'crypto_com',
      'gemini.com': 'gemini',
      'kucoin.com': 'kucoin',
      'bybit.com': 'bybit',
      'okx.com': 'okex',
      'okex.com': 'okex',
      'huobi.com': 'huobi',
      'gate.io': 'gate',
      'bitstamp.net': 'bitstamp',
      'bitfinex.com': 'bitfinex',
      'mexc.com': 'mxc'
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
    return exchangeDetails[exchangeId] || {
      id: exchangeId,
      name: exchangeId.charAt(0).toUpperCase() + exchangeId.slice(1),
      trust_score: 5,
      trust_score_rank: 100,
      trade_volume_24h_btc: 100,
      centralized: true,
      has_trading_incentive: false,
      is_verified: false
    };
  }
}