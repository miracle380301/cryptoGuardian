import { ApiResponse } from '@/types/api.types';

export interface CryptoCompareExchange {
  id: string;
  name: string;
  url?: string;
  logoUrl?: string;
  itemType: string[];
  centralizationType?: string;
  internalName?: string;
  affiliateUrl?: string;
  country?: string;
  orderBook?: boolean;
  trades?: boolean;
  aggregate?: boolean;
  topTierVolume24h?: number;
  totalVolume24h?: number;
  totalVolume24hTop?: number;
  isActive?: boolean;
  grade?: string;
}

export interface CryptoCompareExchangeStats {
  exchangeName: string;
  totalVolume24h: number;
  totalVolume24hTo: number;
  totalTrades24h: number;
  totalTopTierVolume24h: number;
  pairs: number;
  isActive: boolean;
  grade?: string;
}

export class CryptoCompareAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.CRYPTOCOMPARE_API_KEY || '';
    this.baseUrl = 'https://min-api.cryptocompare.com/data';
  }

  /**
   * Get all exchanges list from CryptoCompare
   */
  async getExchanges(): Promise<ApiResponse<CryptoCompareExchange[]>> {
    try {
      const url = `${this.baseUrl}/exchanges/general`;
      const headers: Record<string, string> = this.apiKey ? { authorization: `Apikey ${this.apiKey}` } : {};

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`CryptoCompare API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.Response === 'Error') {
        throw new Error(data.Message || 'CryptoCompare API error');
      }

      // Transform the response to our format
      const exchanges: CryptoCompareExchange[] = Object.entries(data.Data || {}).map(([key, value]: [string, any]) => ({
        id: key,
        name: value.Name || key,
        url: value.Url,
        logoUrl: value.LogoUrl,
        itemType: value.ItemType || [],
        centralizationType: value.CentralizationType,
        internalName: value.InternalName,
        affiliateUrl: value.AffiliateUrl,
        country: value.Country,
        orderBook: value.OrderBook,
        trades: value.Trades,
        aggregate: value.Aggregate,
        isActive: value.IsActive
      }));

      return {
        success: true,
        data: exchanges,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('CryptoCompare getExchanges error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get exchange statistics including volume and liquidity data
   */
  async getExchangeStats(exchangeName: string): Promise<ApiResponse<CryptoCompareExchangeStats | null>> {
    try {
      const url = `${this.baseUrl}/exchange/histoday?e=${exchangeName}&limit=1`;
      const headers: Record<string, string> = this.apiKey ? { authorization: `Apikey ${this.apiKey}` } : {};

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`CryptoCompare API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.Response === 'Error') {
        return {
          success: true,
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      const latestData = data.Data?.[data.Data.length - 1];
      if (!latestData) {
        return {
          success: true,
          data: null,
          timestamp: new Date().toISOString()
        };
      }

      const stats: CryptoCompareExchangeStats = {
        exchangeName,
        totalVolume24h: latestData.total_volume_24h || 0,
        totalVolume24hTo: latestData.total_volume_24h_to || 0,
        totalTrades24h: latestData.total_trades_24h || 0,
        totalTopTierVolume24h: latestData.total_top_tier_volume_24h || 0,
        pairs: latestData.pairs || 0,
        isActive: true
      };

      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`CryptoCompare getExchangeStats error for ${exchangeName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get top exchanges by volume
   */
  async getTopExchangesByVolume(limit: number = 50): Promise<ApiResponse<any[]>> {
    try {
      const url = `${this.baseUrl}/top/exchanges/full?limit=${limit}&tsym=USD`;
      const headers: Record<string, string> = this.apiKey ? { authorization: `Apikey ${this.apiKey}` } : {};

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`CryptoCompare API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.Response === 'Error') {
        throw new Error(data.Message || 'CryptoCompare API error');
      }

      return {
        success: true,
        data: data.Data || [],
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('CryptoCompare getTopExchangesByVolume error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Find exchange by domain name
   */
  async findExchangeByDomain(domain: string): Promise<ApiResponse<CryptoCompareExchange | null>> {
    try {
      const exchangesResult = await this.getExchanges();

      if (!exchangesResult.success || !exchangesResult.data) {
        return {
          success: false,
          error: 'Failed to fetch exchanges list',
          timestamp: new Date().toISOString()
        };
      }

      const cleanDomain = domain.toLowerCase().replace(/^www\./, '');

      // Try to find by URL match
      const exchange = exchangesResult.data.find(ex => {
        if (!ex.url) return false;
        const exchangeDomain = ex.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
        return exchangeDomain.includes(cleanDomain) || cleanDomain.includes(exchangeDomain);
      });

      return {
        success: true,
        data: exchange || null,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('CryptoCompare findExchangeByDomain error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}