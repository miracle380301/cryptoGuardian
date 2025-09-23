#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseSize() {
  console.log('📊 Checking database size...\n');

  try {
    // 1. 전체 데이터베이스 크기
    const dbSize = await prisma.$queryRaw`
      SELECT
        pg_database.datname as database_name,
        pg_size_pretty(pg_database_size(pg_database.datname)) as size
      FROM pg_database
      WHERE datname = current_database()
    `;
    console.log('🗄️ Total Database Size:', dbSize);

    // 2. 각 테이블별 크기 (데이터 + 인덱스)
    const tablesSizes = await prisma.$queryRaw`
      SELECT
        schemaname as schema,
        tablename as table_name,
        pg_size_pretty(pg_total_relation_size('"'||schemaname||'"."'||tablename||'"')) as total_size,
        pg_size_pretty(pg_relation_size('"'||schemaname||'"."'||tablename||'"')) as table_size,
        pg_size_pretty(pg_total_relation_size('"'||schemaname||'"."'||tablename||'"') - pg_relation_size('"'||schemaname||'"."'||tablename||'"')) as indexes_size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size('"'||schemaname||'"."'||tablename||'"') DESC
    `;

    console.log('\n📋 Table Sizes (sorted by total size):');
    console.table(tablesSizes);

    // 3. 각 테이블의 행 개수
    const tables = [
      { prismaName: 'blacklistedDomain', displayName: 'BlacklistedDomain' },
      { prismaName: 'whitelistedDomain', displayName: 'WhitelistedDomain' },
      { prismaName: 'apiUsage', displayName: 'ApiUsage' },
      { prismaName: 'userReport', displayName: 'UserReport' },
      { prismaName: 'contactInquiry', displayName: 'ContactInquiry' },
      { prismaName: 'exchange', displayName: 'Exchange' },
      { prismaName: 'exchangeSyncLog', displayName: 'ExchangeSyncLog' },
      { prismaName: 'blacklistSyncLog', displayName: 'BlacklistSyncLog' }
    ];

    console.log('\n📈 Row Counts:');
    for (const table of tables) {
      try {
        const count = await (prisma as any)[table.prismaName].count();
        console.log(`  ${table.displayName}: ${count.toLocaleString()} rows`);
      } catch (error) {
        console.log(`  ${table.displayName}: Error counting rows`);
      }
    }

    // 4. 오래된 로그 데이터 확인
    console.log('\n🗓️ Old Log Data (older than 30 days):');

    // ExchangeSyncLog 오래된 데이터
    const oldExchangeLogs = await prisma.exchangeSyncLog.count({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30일 이상
        }
      }
    });
    console.log(`  ExchangeSyncLog: ${oldExchangeLogs} old records`);

    // BlacklistSyncLog 오래된 데이터
    const oldBlacklistLogs = await prisma.blacklistSyncLog.count({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });
    console.log(`  BlacklistSyncLog: ${oldBlacklistLogs} old records`);

    // ApiUsage 오래된 데이터
    const oldApiUsage = await prisma.apiUsage.count({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });
    console.log(`  ApiUsage: ${oldApiUsage} old records`);

    // 5. 정리 제안
    console.log('\n💡 Cleanup Recommendations:');
    if (oldExchangeLogs > 0) {
      console.log(`  - Delete ${oldExchangeLogs} old ExchangeSyncLog records`);
    }
    if (oldBlacklistLogs > 0) {
      console.log(`  - Delete ${oldBlacklistLogs} old BlacklistSyncLog records`);
    }
    if (oldApiUsage > 0) {
      console.log(`  - Delete ${oldApiUsage} old ApiUsage records`);
    }

  } catch (error) {
    console.error('Error checking database size:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkDatabaseSize().catch(console.error);