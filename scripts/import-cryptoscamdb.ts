#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CryptoScamDbEntry {
  domain: string;
  originalUrl: string;
}

async function importCryptoScamDB() {
  console.log('🚀 Starting CryptoScamDB import...');

  const startTime = Date.now();
  let totalFetched = 0;
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalFailed = 0;

  try {
    // 1. CryptoScamDB YAML 파일 다운로드
    console.log('📥 Downloading CryptoScamDB data...');
    const response = await fetch('https://raw.githubusercontent.com/CryptoScamDB/blacklist/master/data/urls.yaml', {
      headers: {
        'User-Agent': 'CryptoGuardian-BatchImport/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CryptoScamDB: ${response.status} ${response.statusText}`);
    }

    const yamlContent = await response.text();
    console.log(`📊 Downloaded ${yamlContent.length} characters of YAML data`);

    // 2. YAML 파싱 (실제 CryptoScamDB 형식)
    const lines = yamlContent.split('\n');
    const scamEntries: CryptoScamDbEntry[] = [];

    let currentEntry: any = {};
    let isInEntry = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // 새로운 항목 시작 (- name: 으로 시작)
      if (trimmed.startsWith('- name:')) {
        // 이전 항목이 있으면 저장
        if (isInEntry && currentEntry.name) {
          const domain = currentEntry.name.toLowerCase();
          if (domain && domain.includes('.')) {
            scamEntries.push({
              domain: domain,
              originalUrl: currentEntry.url || `http://${domain}`
            });
          }
        }

        // 새 항목 시작
        currentEntry = {
          name: trimmed.replace('- name:', '').trim()
        };
        isInEntry = true;
      }
      // url 필드 파싱
      else if (trimmed.startsWith('url:') && isInEntry) {
        currentEntry.url = trimmed.replace('url:', '').trim();
      }
      // category 필드 파싱
      else if (trimmed.startsWith('category:') && isInEntry) {
        currentEntry.category = trimmed.replace('category:', '').trim();
      }
      // subcategory 필드 파싱
      else if (trimmed.startsWith('subcategory:') && isInEntry) {
        currentEntry.subcategory = trimmed.replace('subcategory:', '').trim();
      }
    }

    // 마지막 항목 처리
    if (isInEntry && currentEntry.name) {
      const domain = currentEntry.name.toLowerCase();
      if (domain && domain.includes('.')) {
        scamEntries.push({
          domain: domain,
          originalUrl: currentEntry.url || `http://${domain}`
        });
      }
    }

    totalFetched = scamEntries.length;
    console.log(`🔍 Parsed ${totalFetched} scam domains from CryptoScamDB`);

    // 3. 효율적인 배치 처리로 DB에 저장
    console.log('💾 Saving to database...');

    // 기존 도메인들을 한 번에 조회
    const existingDomains = await prisma.blacklistedDomain.findMany({
      where: {
        domain: {
          in: scamEntries.map(entry => entry.domain)
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

    for (const entry of scamEntries) {
      const existing = existingDomainMap.get(entry.domain);

      if (existing) {
        // 업데이트할 도메인
        updateEntries.push({
          domain: entry.domain,
          updateData: {
            cryptoScamDBId: entry.originalUrl,
            dataSources: Array.from(new Set([...existing.dataSources, 'cryptoscamdb'])),
            verificationSources: Array.from(new Set([...existing.verificationSources, 'CryptoScamDB'])),
            lastUpdated: new Date(),
            severity: existing.severity === 'critical' ? 'critical' : 'high',
            riskLevel: existing.riskLevel || 'malicious',
            category: existing.category || 'crypto-scam'
          }
        });
      } else {
        // 새로운 도메인
        newEntries.push({
          domain: entry.domain,
          fullUrl: entry.originalUrl,
          reason: 'Listed in CryptoScamDB - Known cryptocurrency scam site',
          severity: 'high',
          riskLevel: 'malicious',
          category: 'crypto-scam',
          evidence: [`https://cryptoscamdb.org/search?domain=${encodeURIComponent(entry.domain)}`],
          reportDate: new Date(),
          reportedBy: 'CryptoScamDB',
          primaryDataSource: 'cryptoscamdb',
          dataSources: ['cryptoscamdb'],
          verificationStatus: 'verified',
          verificationSources: ['CryptoScamDB'],
          verificationDate: new Date(),
          batchDate: new Date(),
          lastChecked: new Date(),
          lastUpdated: new Date(),
          isActive: true,
          isConfirmed: true,
          priority: 8,
          cryptoScamDBId: entry.originalUrl
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

    // 기존 도메인들을 개별 업데이트 (배치 업데이트는 Prisma에서 제한적)
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
        source: 'cryptoscamdb',
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
    console.log('\n🎉 CryptoScamDB import completed!');
    console.log(`📊 Results:`);
    console.log(`   - Total fetched: ${totalFetched}`);
    console.log(`   - New domains: ${totalInserted}`);
    console.log(`   - Updated domains: ${totalUpdated}`);
    console.log(`   - Failed: ${totalFailed}`);
    console.log(`   - Execution time: ${Math.round(executionTime / 1000)}s`);

    // 6. 통계 출력
    const totalCryptoScamDomains = await prisma.blacklistedDomain.count({
      where: {
        primaryDataSource: 'cryptoscamdb'
      }
    });

    console.log(`\n📈 Database stats:`);
    console.log(`   - Total CryptoScamDB domains in DB: ${totalCryptoScamDomains}`);

  } catch (error) {
    console.error('💥 CryptoScamDB import failed:', error);

    // 실패 로그 저장
    await prisma.blacklistSyncLog.create({
      data: {
        batchDate: new Date(),
        source: 'cryptoscamdb',
        totalFetched,
        totalInserted,
        totalUpdated,
        totalFailed: totalFetched, // All failed
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
  importCryptoScamDB()
    .then(() => {
      console.log('✅ Import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}

export { importCryptoScamDB };