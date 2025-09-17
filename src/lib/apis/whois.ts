import { ApiResponse, WhoisData, ApiError } from '@/types/api.types';

// Dynamic import for whois-json (server-side only)
const getWhoisLookup = async (): Promise<any> => {
  if (typeof window !== 'undefined') {
    throw new Error('Whois lookup can only be performed on the server side');
  }

  try {
    // @ts-ignore - whois-json doesn't have TypeScript declarations
    const whoisJson = await import('whois-json');
    return whoisJson.default;
  } catch (error) {
    console.error('Failed to import whois-json:', error);
    throw new Error('Whois service unavailable');
  }
};

export class WhoisAPI {
  private useMockData: boolean;

  constructor() {
    // Use real whois if enabled in environment and on server-side
    const enableRealWhois = process.env.ENABLE_REAL_WHOIS === 'true';
    this.useMockData = !enableRealWhois || typeof window !== 'undefined';
  }

  async lookup(domain: string): Promise<ApiResponse<WhoisData>> {
    try {
      // Clean domain (remove protocol, path, etc.)
      const cleanDomain = this.cleanDomain(domain);

      // Use mock data for client-side or development
      if (this.useMockData || typeof window !== 'undefined') {
        return this.getMockData(cleanDomain);
      }

      // Real whois lookup using whois-json
      try {
        const whoisLookup = await getWhoisLookup();
        const rawData = await whoisLookup(cleanDomain);

        return {
          success: true,
          data: this.parseRealWhoisData(rawData, cleanDomain),
          timestamp: new Date().toISOString()
        };
      } catch (whoisError) {
        console.warn('Real whois failed, falling back to mock data:', whoisError);
        return this.getMockData(cleanDomain);
      }
    } catch (error) {
      console.error('Whois API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private cleanDomain(input: string): string {
    // Remove protocol
    let domain = input.replace(/^https?:\/\//, '');
    // Remove www
    domain = domain.replace(/^www\./, '');
    // Remove path
    domain = domain.split('/')[0];
    // Remove port
    domain = domain.split(':')[0];
    return domain.toLowerCase();
  }

  private extractLinks(text: string): string[] {
    const urlPattern = /https?:\/\/[^\s]+/gi;
    const matches = text.match(urlPattern) || [];
    return [...new Set(matches)]; // Remove duplicates
  }

  private parseRealWhoisData(rawData: any, domain: string): WhoisData {
    // console.log(`[WHOIS DEBUG] Raw data type for ${domain}:`, typeof rawData);
    // console.log(`[WHOIS DEBUG] Sample data:`, JSON.stringify(rawData, null, 2).substring(0, 2000) + '...');

    // whois-json returns an object, not text!
    const whoisData = rawData;

    // Extract dates from the structured object
    const creationDateStr = whoisData.creationDate || whoisData.created || whoisData.registrationDate;
    const expirationDateStr = whoisData.registrarRegistrationExpirationDate || whoisData.expirationDate || whoisData.expires;
    const updatedDateStr = whoisData.updatedDate || whoisData.lastUpdated || whoisData.modified;
    const registrarName = whoisData.registrar || whoisData.registrarName || 'Unknown';

    // Parse creation date and calculate domain age
    let creationDate: string | undefined;
    let domainAgeDays: number | undefined;

    if (creationDateStr) {
      try {
        const parsedDate = new Date(creationDateStr);
        if (!isNaN(parsedDate.getTime())) {
          creationDate = parsedDate.toISOString().split('T')[0];
          domainAgeDays = Math.floor((Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
        }
      } catch (e) {
        console.warn('Failed to parse creation date:', creationDateStr);
      }
    }

    // Parse expiration date
    let expirationDate: string | undefined;
    if (expirationDateStr) {
      try {
        const parsedDate = new Date(expirationDateStr);
        if (!isNaN(parsedDate.getTime())) {
          expirationDate = parsedDate.toISOString().split('T')[0];
        }
      } catch (e) {
        console.warn('Failed to parse expiration date:', expirationDateStr);
      }
    }

    // Parse updated date
    let updatedDate: string | undefined;
    if (updatedDateStr) {
      try {
        const parsedDate = new Date(updatedDateStr);
        if (!isNaN(parsedDate.getTime())) {
          updatedDate = parsedDate.toISOString().split('T')[0];
        }
      } catch (e) {
        console.warn('Failed to parse updated date:', updatedDateStr);
      }
    }

    // Extract nameservers
    const nameservers: string[] = [];
    if (whoisData.nameServer) {
      if (typeof whoisData.nameServer === 'string') {
        nameservers.push(...whoisData.nameServer.split(' '));
      } else if (Array.isArray(whoisData.nameServer)) {
        nameservers.push(...whoisData.nameServer);
      }
    }

    // Extract any links from the whois data
    const links: string[] = [];
    const whoisText = JSON.stringify(whoisData);
    const foundLinks = this.extractLinks(whoisText);
    if (foundLinks.length > 0) {
      links.push(...foundLinks);
    }

    // Also check for registrar URL
    if (whoisData.registrarUrl) {
      links.push(whoisData.registrarUrl);
    }
    if (whoisData.registrarURL) {
      links.push(whoisData.registrarURL);
    }

    return {
      domain,
      registrar: registrarName,
      creation_date: creationDate,
      expiration_date: expirationDate,
      updated_date: updatedDate,
      domain_age_days: domainAgeDays,
      is_registered: true,
      registrant: {
        organization: whoisData.registrantOrganization || 'Redacted for privacy',
        country: whoisData.registrantCountry || 'Unknown',
        state: whoisData.registrantStateProvince || 'Unknown'
      },
      nameservers,
      status: whoisData.domainStatus ? [whoisData.domainStatus] : [],
      links: links.length > 0 ? links : undefined
    };
  }

  private parseWhoisData(rawData: any, domain: string): WhoisData {
    const creationDate = rawData.created || rawData.creation_date;
    const domainAgeDays = creationDate ?
      Math.floor((Date.now() - new Date(creationDate).getTime()) / (1000 * 60 * 60 * 24)) :
      undefined;

    return {
      domain,
      registrar: rawData.registrar?.name || rawData.registrar,
      creation_date: creationDate,
      expiration_date: rawData.expires || rawData.expiration_date,
      updated_date: rawData.updated || rawData.updated_date,
      domain_age_days: domainAgeDays,
      is_registered: true,
      registrant: {
        organization: rawData.registrant?.organization,
        country: rawData.registrant?.country,
        state: rawData.registrant?.state
      },
      nameservers: rawData.nameservers || [],
      status: rawData.status || []
    };
  }

  private getMockData(domain: string): ApiResponse<WhoisData> {
    // Known crypto exchanges for demo
    const knownExchanges: Record<string, Partial<WhoisData>> = {
      'binance.com': {
        registrar: 'MarkMonitor Inc.',
        creation_date: '2017-04-14',
        domain_age_days: Math.floor((Date.now() - new Date('2017-04-14').getTime()) / (1000 * 60 * 60 * 24)),
        registrant: {
          organization: 'Binance Holdings Limited',
          country: 'KY'
        }
      },
      'coinbase.com': {
        registrar: 'MarkMonitor Inc.',
        creation_date: '2012-06-01',
        domain_age_days: Math.floor((Date.now() - new Date('2012-06-01').getTime()) / (1000 * 60 * 60 * 24)),
        registrant: {
          organization: 'Coinbase, Inc.',
          country: 'US'
        }
      },
      'kraken.com': {
        registrar: 'CSC Corporate Domains, Inc.',
        creation_date: '2011-01-10',
        domain_age_days: Math.floor((Date.now() - new Date('2011-01-10').getTime()) / (1000 * 60 * 60 * 24)),
        registrant: {
          organization: 'Payward, Inc.',
          country: 'US'
        }
      }
    };

    const mockData = knownExchanges[domain] || {
      registrar: 'Unknown Registrar',
      creation_date: '2020-01-01',
      domain_age_days: Math.floor((Date.now() - new Date('2020-01-01').getTime()) / (1000 * 60 * 60 * 24)),
      registrant: {
        organization: 'Unknown Organization',
        country: 'Unknown'
      }
    };

    return {
      success: true,
      data: {
        domain,
        is_registered: true,
        expiration_date: '2025-12-31',
        updated_date: '2024-01-01',
        nameservers: ['ns1.example.com', 'ns2.example.com'],
        status: ['clientTransferProhibited'],
        links: domain === 'binance.com' ? ['https://www.binance.com', 'https://accounts.binance.com'] :
               domain === 'coinbase.com' ? ['https://www.coinbase.com', 'https://pro.coinbase.com'] : undefined,
        ...mockData
      } as WhoisData,
      cached: true,
      timestamp: new Date().toISOString()
    };
  }
}