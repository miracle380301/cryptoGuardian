#!/usr/bin/env tsx

/**
 * Blacklist Domain Collection Script
 *
 * This script fetches blacklisted domains from various security sources
 * and updates the database for fast reputation checks.
 */

import { PrismaClient } from '@prisma/client';

interface BlacklistSource {
  name: string;
  url?: string;
  fetchFunction: () => Promise<BlacklistDomain[]>;
}

interface BlacklistDomain {
  domain: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskLevel: 'malicious' | 'suspicious' | 'phishing' | 'scam';
  category: string;
  reportedBy: string;
  evidence: string[];
  virusTotalDetections?: number;
  kisaReported?: boolean;
  phishTankReported?: boolean;
  cryptoScamDBReported?: boolean;
  fcaReported?: boolean;
  secReported?: boolean;
}

class BlacklistCollector {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async collectBlacklistData() {
    console.log('🚨 Starting blacklist data collection...');
    const startTime = Date.now();

    try {
      const sources: BlacklistSource[] = [
        {
          name: 'cryptoscamdb',
          fetchFunction: () => this.fetchCryptoScamDB()
        },
        {
          name: 'phishtank',
          fetchFunction: () => this.fetchPhishTank()
        },
        {
          name: 'manual-crypto-scams',
          fetchFunction: () => this.getManualCryptoScams()
        },
        {
          name: 'manual-known-scams',
          fetchFunction: () => this.getManualKnownScams()
        }
      ];

      let totalFetched = 0;
      let totalInserted = 0;
      let totalUpdated = 0;
      let totalFailed = 0;

      for (const source of sources) {
        try {
          console.log(`🔍 Processing source: ${source.name}`);
          const domains = await source.fetchFunction();

          console.log(`📊 Found ${domains.length} domains from ${source.name}`);
          totalFetched += domains.length;

          for (const domainData of domains) {
            try {
              const result = await this.upsertBlacklistedDomain(domainData, source.name);
              if (result.created) totalInserted++;
              else totalUpdated++;

              // Rate limiting
              await this.sleep(50);

            } catch (error) {
              console.error(`❌ Failed to process domain ${domainData.domain}:`, error);
              totalFailed++;
            }
          }

          // Log batch result for this source
          await this.logBatchResult(source.name, domains.length, totalInserted, totalUpdated, totalFailed, 'success');

        } catch (error) {
          console.error(`❌ Failed to process source ${source.name}:`, error);
          await this.logBatchResult(source.name, 0, 0, 0, 1, 'failed', error instanceof Error ? error.message : 'Unknown error');
        }
      }

      const executionTime = Date.now() - startTime;
      console.log('✅ Blacklist data collection completed!');
      console.log(`📈 Total: Fetched ${totalFetched}, Inserted ${totalInserted}, Updated ${totalUpdated}, Failed ${totalFailed}`);
      console.log(`⏱️ Execution time: ${executionTime}ms`);

    } catch (error) {
      console.error('❌ Blacklist collection failed:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private async fetchCryptoScamDB(): Promise<BlacklistDomain[]> {
    // CryptoScamDB는 실제 API가 있는지 확인 필요
    // 일단 mock 데이터로 구현
    console.log('⚠️ CryptoScamDB: Using mock data (API integration needed)');

    return [
      {
        domain: 'fake-binance.com',
        reason: 'Fake cryptocurrency exchange impersonating Binance',
        severity: 'critical',
        riskLevel: 'malicious',
        category: 'crypto',
        reportedBy: 'cryptoscamdb',
        evidence: ['https://cryptoscamdb.org/scam/123'],
        cryptoScamDBReported: true
      },
      {
        domain: 'coinbase-security.com',
        reason: 'Phishing site impersonating Coinbase',
        severity: 'high',
        riskLevel: 'phishing',
        category: 'crypto',
        reportedBy: 'cryptoscamdb',
        evidence: ['https://cryptoscamdb.org/scam/124'],
        cryptoScamDBReported: true
      }
    ];
  }

  private async fetchPhishTank(): Promise<BlacklistDomain[]> {
    // PhishTank API는 유료이므로 일단 mock 데이터
    console.log('⚠️ PhishTank: Using mock data (API integration needed)');

    return [
      {
        domain: 'phishing-example.com',
        reason: 'Reported phishing site',
        severity: 'high',
        riskLevel: 'phishing',
        category: 'phishing',
        reportedBy: 'phishtank',
        evidence: ['https://phishtank.org/phish_detail.php?phish_id=123'],
        phishTankReported: true
      }
    ];
  }

  private async getManualCryptoScams(): Promise<BlacklistDomain[]> {
    // 수동으로 관리하는 알려진 암호화폐 스캠 도메인들
    return [
      {
        domain: 'binancevalidation.com',
        reason: 'Fake Binance validation site',
        severity: 'critical',
        riskLevel: 'malicious',
        category: 'crypto',
        reportedBy: 'manual',
        evidence: ['User reports', 'Visual similarity analysis']
      },
      {
        domain: 'coinbase-support.net',
        reason: 'Fake Coinbase support site',
        severity: 'critical',
        riskLevel: 'malicious',
        category: 'crypto',
        reportedBy: 'manual',
        evidence: ['User reports', 'Domain analysis']
      },
      {
        domain: 'metamask-wallet.org',
        reason: 'Fake MetaMask wallet site',
        severity: 'critical',
        riskLevel: 'malicious',
        category: 'crypto',
        reportedBy: 'manual',
        evidence: ['User reports', 'Visual similarity analysis']
      },
      {
        domain: 'uniswap-app.com',
        reason: 'Fake Uniswap application',
        severity: 'high',
        riskLevel: 'malicious',
        category: 'crypto',
        reportedBy: 'manual',
        evidence: ['Community reports']
      },
      {
        domain: 'crypto-airdrop.net',
        reason: 'Fake airdrop scam site',
        severity: 'medium',
        riskLevel: 'scam',
        category: 'crypto',
        reportedBy: 'manual',
        evidence: ['Scam pattern analysis']
      }
    ];
  }

  private async getManualKnownScams(): Promise<BlacklistDomain[]> {
    // 일반적인 알려진 스캐물 도메인들
    return [
      {
        domain: 'malware-test.com',
        reason: 'Known malware distribution site',
        severity: 'critical',
        riskLevel: 'malicious',
        category: 'malware',
        reportedBy: 'manual',
        evidence: ['Security research']
      },
      {
        domain: 'phishing-test.net',
        reason: 'Known phishing site',
        severity: 'high',
        riskLevel: 'phishing',
        category: 'phishing',
        reportedBy: 'manual',
        evidence: ['Security research']
      }
    ];
  }

  private async upsertBlacklistedDomain(domainData: BlacklistDomain, source: string): Promise<{ created: boolean }> {
    const existing = await this.prisma.blacklistedDomain.findUnique({
      where: { domain: domainData.domain }
    });

    const upsertData = {
      domain: domainData.domain,
      reason: domainData.reason,
      severity: domainData.severity,
      riskLevel: domainData.riskLevel,
      category: domainData.category,
      reportedBy: domainData.reportedBy,
      evidence: domainData.evidence,
      virusTotalDetections: domainData.virusTotalDetections,
      kisaReported: domainData.kisaReported || false,
      phishTankReported: domainData.phishTankReported || false,
      cryptoScamDBReported: domainData.cryptoScamDBReported || false,
      fcaReported: domainData.fcaReported || false,
      secReported: domainData.secReported || false,
      dataSource: source,
      batchDate: new Date(),
      lastChecked: new Date(),
      isActive: true
    };

    if (existing) {
      // Update existing domain - merge flags
      const updatedData = {
        ...upsertData,
        kisaReported: existing.kisaReported || upsertData.kisaReported,
        phishTankReported: existing.phishTankReported || upsertData.phishTankReported,
        cryptoScamDBReported: existing.cryptoScamDBReported || upsertData.cryptoScamDBReported,
        fcaReported: existing.fcaReported || upsertData.fcaReported,
        secReported: existing.secReported || upsertData.secReported,
        // Keep highest severity
        severity: this.getHigherSeverity(existing.severity, upsertData.severity),
        // Merge evidence
        evidence: [...new Set([...existing.evidence, ...upsertData.evidence])]
      };

      await this.prisma.blacklistedDomain.update({
        where: { domain: domainData.domain },
        data: updatedData
      });
      return { created: false };
    } else {
      // Create new domain
      await this.prisma.blacklistedDomain.create({
        data: upsertData
      });
      return { created: true };
    }
  }

  private getHigherSeverity(severity1: string, severity2: string): string {
    const severityOrder = ['low', 'medium', 'high', 'critical'];
    const index1 = severityOrder.indexOf(severity1);
    const index2 = severityOrder.indexOf(severity2);
    return index1 > index2 ? severity1 : severity2;
  }

  private async logBatchResult(
    source: string,
    totalFetched: number,
    totalInserted: number,
    totalUpdated: number,
    totalFailed: number,
    status: string,
    errorMessage?: string
  ) {
    await this.prisma.blacklistSyncLog.create({
      data: {
        batchDate: new Date(),
        source,
        totalFetched,
        totalInserted,
        totalUpdated,
        totalFailed,
        status,
        errorMessage,
        executionTime: 0 // 개별 소스별로는 시간 측정 안함
      }
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const collector = new BlacklistCollector();
  await collector.collectBlacklistData();
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { BlacklistCollector };