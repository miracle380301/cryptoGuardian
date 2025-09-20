#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixURLhausReportedBy() {
  console.log('🔧 Fixing URLhaus reportedBy fields...');

  try {
    // URLhaus 데이터 중 reportedBy에 괄호가 있는 것들 찾기
    const urlhausEntries = await prisma.blacklistedDomain.findMany({
      where: {
        primaryDataSource: 'urlhaus',
        reportedBy: {
          contains: 'URLhaus ('
        }
      },
      select: {
        id: true,
        domain: true,
        reportedBy: true
      }
    });

    console.log(`📊 Found ${urlhausEntries.length} entries to fix`);

    if (urlhausEntries.length === 0) {
      console.log('✅ No entries need fixing');
      return;
    }

    // 배치로 업데이트
    let updated = 0;
    for (const entry of urlhausEntries) {
      try {
        await prisma.blacklistedDomain.update({
          where: { id: entry.id },
          data: {
            reportedBy: 'URLhaus'
          }
        });
        updated++;

        if (updated % 100 === 0) {
          console.log(`📝 Progress: ${updated}/${urlhausEntries.length} updated`);
        }
      } catch (error) {
        console.error(`❌ Failed to update ${entry.domain}:`, error);
      }
    }

    console.log(`\n✅ Fixed ${updated} URLhaus entries`);
    console.log(`   Changed from: "URLhaus (reporter)" → "URLhaus"`);

  } catch (error) {
    console.error('💥 Error fixing URLhaus entries:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  fixURLhausReportedBy()
    .then(() => {
      console.log('✅ Fix completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fix failed:', error);
      process.exit(1);
    });
}

export { fixURLhausReportedBy };