#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface URLhausEntry {
  id: string;
  dateadded: string;
  url: string;
  url_status: string;
  threat: string;
  tags: string;
  urlhaus_link: string;
  reporter: string;
}

async function importURLhaus() {
  console.log('🚀 Starting URLhaus import...');

  const startTime = Date.now();
  let totalFetched = 0;
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  try {
    // 1. URLhaus CSV 다운로드 (최근 30일 데이터)
    console.log('📥 Downloading URLhaus data (recent 30 days)...');
    const response = await fetch('https://urlhaus.abuse.ch/downloads/csv_recent/', {
      headers: {
        'User-Agent': 'CryptoGuardian-BatchImport/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URLhaus data: ${response.status} ${response.statusText}`);
    }

    const csvContent = await response.text();
    console.log(`📊 Downloaded ${csvContent.length} characters of CSV data`);

    // 2. CSV 파싱
    const lines = csvContent.split('\n');
    const urlEntries: URLhausEntry[] = [];

    // Skip header lines (URLhaus CSV has 9 comment lines at the beginning)
    let dataStartIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].startsWith('#')) {
        dataStartIndex = i;
        break;
      }
    }

    console.log(`📝 Parsing CSV data starting from line ${dataStartIndex + 1}...`);

    for (let i = dataStartIndex + 1; i < lines.length; i++) { // Skip header row
      const line = lines[i].trim();
      if (!line) continue;

      // Parse CSV line (handle quoted values)
      const parts = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
      if (!parts || parts.length < 8) continue;

      // Remove quotes from values
      const cleanParts = parts.map(p => p.replace(/^"|"$/g, '').trim());

      const [id, dateadded, url, url_status, last_online, threat, tags, urlhaus_link, reporter] = cleanParts;

      // Extract domain from URL
      let domain = '';
      try {
        const urlObj = new URL(url);
        domain = urlObj.hostname.toLowerCase();
      } catch (e) {
        // If URL parsing fails, try to extract domain manually
        const match = url.match(/(?:https?:\/\/)?([^\/\s]+)/);
        if (match) {
          domain = match[1].toLowerCase();
        }
      }

      if (!domain || !domain.includes('.')) {
        totalSkipped++;
        continue;
      }

      urlEntries.push({
        id,
        dateadded,
        url,
        url_status,
        threat,
        tags,
        urlhaus_link,
        reporter
      });
    }

    totalFetched = urlEntries.length;
    console.log(`🔍 Parsed ${totalFetched} malicious URLs from URLhaus`);

    // 3. Group by domain and process
    const domainMap = new Map<string, URLhausEntry[]>();
    for (const entry of urlEntries) {
      let domain = '';
      try {
        const urlObj = new URL(entry.url);
        domain = urlObj.hostname.toLowerCase();
      } catch (e) {
        const match = entry.url.match(/(?:https?:\/\/)?([^\/\s]+)/);
        if (match) {
          domain = match[1].toLowerCase();
        }
      }

      if (domain) {
        if (!domainMap.has(domain)) {
          domainMap.set(domain, []);
        }
        domainMap.get(domain)!.push(entry);
      }
    }

    console.log(`📊 Found ${domainMap.size} unique domains`);

    // 4. 효율적인 배치 처리로 DB에 저장
    console.log('💾 Saving to database...');

    // 기존 도메인들을 한 번에 조회
    const domains = Array.from(domainMap.keys());
    const existingDomains = await prisma.blacklistedDomain.findMany({
      where: {
        domain: {
          in: domains
        }
      },
      select: {
        domain: true,
        dataSources: true,
        verificationSources: true,
        severity: true,
        riskLevel: true,
        category: true
      }
    });

    const existingDomainMap = new Map(existingDomains.map(d => [d.domain, d]));

    // 새로운 도메인과 업데이트할 도메인 분리
    const newEntries: any[] = [];
    const updateEntries: any[] = [];

    for (const [domain, entries] of domainMap.entries()) {
      const existing = existingDomainMap.get(domain);

      // 가장 최근 엔트리 사용
      const latestEntry = entries.sort((a, b) =>
        new Date(b.dateadded).getTime() - new Date(a.dateadded).getTime()
      )[0];

      // 위협 유형 판단
      let category = 'malware';
      let riskLevel = 'malicious';
      const threatLower = latestEntry.threat.toLowerCase();
      const tagsLower = latestEntry.tags.toLowerCase();

      if (threatLower.includes('phish') || tagsLower.includes('phish')) {
        category = 'phishing';
        riskLevel = 'phishing';
      } else if (threatLower.includes('botnet') || tagsLower.includes('botnet')) {
        category = 'botnet';
        riskLevel = 'critical';
      } else if (threatLower.includes('ransomware') || tagsLower.includes('ransomware')) {
        category = 'ransomware';
        riskLevel = 'critical';
      } else if (threatLower.includes('trojan') || tagsLower.includes('trojan')) {
        category = 'trojan';
        riskLevel = 'malicious';
      }

      // 활성 상태 확인
      const isActive = latestEntry.url_status === 'online';

      if (existing) {
        // 업데이트할 도메인
        updateEntries.push({
          domain: domain,
          updateData: {
            dataSources: Array.from(new Set([...existing.dataSources, 'urlhaus'])),
            verificationSources: Array.from(new Set([...existing.verificationSources, 'URLhaus'])),
            lastUpdated: new Date(),
            severity: existing.severity === 'critical' ? 'critical' : 'high',
            riskLevel: riskLevel === 'critical' ? 'critical' : existing.riskLevel || riskLevel,
            category: existing.category || category,
            isActive: isActive
          }
        });
      } else {
        // 새로운 도메인
        newEntries.push({
          domain: domain,
          fullUrl: latestEntry.url,
          reason: `Listed in URLhaus - ${latestEntry.threat}${latestEntry.tags ? ` (${latestEntry.tags})` : ''}`,
          severity: riskLevel === 'critical' ? 'critical' : 'high',
          riskLevel: riskLevel,
          category: category,
          evidence: [latestEntry.urlhaus_link],
          reportDate: new Date(latestEntry.dateadded),
          reportedBy: 'URLhaus',
          primaryDataSource: 'urlhaus',
          dataSources: ['urlhaus'],
          verificationStatus: 'verified',
          verificationSources: ['URLhaus'],
          verificationDate: new Date(),
          batchDate: new Date(),
          lastChecked: new Date(),
          lastUpdated: new Date(),
          isActive: isActive,
          isConfirmed: true,
          priority: riskLevel === 'critical' ? 10 : 8,
          description: `Threat: ${latestEntry.threat}, Tags: ${latestEntry.tags}, Status: ${latestEntry.url_status}`
        });
      }
    }

    // 새 도메인들을 배치로 삽입
    if (newEntries.length > 0) {
      console.log(`📝 Inserting ${newEntries.length} new domains...`);

      // 500개씩 배치 처리
      const batchSize = 500;
      for (let i = 0; i < newEntries.length; i += batchSize) {
        const batch = newEntries.slice(i, i + batchSize);
        try {
          await prisma.blacklistedDomain.createMany({
            data: batch,
            skipDuplicates: true
          });
          totalInserted += batch.length;
          console.log(`📝 Progress: ${Math.min(i + batchSize, newEntries.length)}/${newEntries.length} new domains inserted`);
        } catch (error) {
          console.error(`❌ Error inserting batch ${i}-${i + batchSize}:`, error);
          totalFailed += batch.length;
        }
      }
    }

    // 기존 도메인들을 개별 업데이트
    if (updateEntries.length > 0) {
      console.log(`📝 Updating ${updateEntries.length} existing domains...`);

      for (let i = 0; i < updateEntries.length; i++) {
        const entry = updateEntries[i];
        try {
          await prisma.blacklistedDomain.update({
            where: { domain: entry.domain },
            data: entry.updateData
          });
          totalUpdated++;

          if ((i + 1) % 100 === 0) {
            console.log(`📝 Progress: ${i + 1}/${updateEntries.length} domains updated`);
          }
        } catch (error) {
          console.error(`❌ Error updating ${entry.domain}:`, error);
          totalFailed++;
        }
      }
    }

    const executionTime = Date.now() - startTime;

    // 4. 동기화 로그 저장
    await prisma.blacklistSyncLog.create({
      data: {
        batchDate: new Date(),
        source: 'urlhaus',
        totalFetched,
        totalInserted,
        totalUpdated,
        totalFailed,
        status: totalFailed === 0 ? 'success' : 'partial',
        errorMessage: totalFailed > 0 ? `${totalFailed} domains failed to process` : null,
        executionTime
      }
    });

    // 5. 결과 출력
    console.log('\n🎉 URLhaus import completed!');
    console.log(`📊 Results:`);
    console.log(`   - Total URLs fetched: ${totalFetched}`);
    console.log(`   - Unique domains: ${domainMap.size}`);
    console.log(`   - New domains: ${totalInserted}`);
    console.log(`   - Updated domains: ${totalUpdated}`);
    console.log(`   - Failed: ${totalFailed}`);
    console.log(`   - Skipped: ${totalSkipped}`);
    console.log(`   - Execution time: ${Math.round(executionTime / 1000)}s`);

    // 6. 통계 출력
    const totalURLhausDomains = await prisma.blacklistedDomain.count({
      where: {
        dataSources: {
          has: 'urlhaus'
        }
      }
    });

    console.log(`\n📈 Database stats:`);
    console.log(`   - Total URLhaus domains in DB: ${totalURLhausDomains}`);

  } catch (error) {
    console.error('💥 URLhaus import failed:', error);

    // 실패 로그 저장
    await prisma.blacklistSyncLog.create({
      data: {
        batchDate: new Date(),
        source: 'urlhaus',
        totalFetched,
        totalInserted,
        totalUpdated,
        totalFailed: totalFetched,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      }
    });

    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  importURLhaus()
    .then(() => {
      console.log('✅ Import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}

export { importURLhaus };