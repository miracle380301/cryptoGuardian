#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixURLhausEvidence() {
  console.log('🔧 Fixing URLhaus evidence fields...');

  try {
    // URLhaus 데이터 중 evidence가 태그(ClearFake 등)로 되어있는 것들 찾기
    const urlhausEntries = await prisma.blacklistedDomain.findMany({
      where: {
        primaryDataSource: 'urlhaus'
      },
      select: {
        id: true,
        domain: true,
        evidence: true
      }
    });

    console.log(`📊 Found ${urlhausEntries.length} URLhaus entries`);

    // 잘못된 evidence 찾기 (URL이 아닌 것들)
    const toFix = urlhausEntries.filter(entry => {
      if (!entry.evidence || entry.evidence.length === 0) return false;
      const firstEvidence = entry.evidence[0];
      // URL이 아니면 수정 필요
      return !firstEvidence.startsWith('http');
    });

    console.log(`🔍 Found ${toFix.length} entries with incorrect evidence`);

    if (toFix.length === 0) {
      console.log('✅ No entries need fixing');
      return;
    }

    // 배치로 업데이트
    let updated = 0;
    for (const entry of toFix) {
      try {
        // URLhaus URL 형식으로 변환
        const urlhausLink = `https://urlhaus.abuse.ch/browse.php?search=${encodeURIComponent(entry.domain)}`;

        await prisma.blacklistedDomain.update({
          where: { id: entry.id },
          data: {
            evidence: [urlhausLink]
          }
        });
        updated++;

        if (updated % 100 === 0) {
          console.log(`📝 Progress: ${updated}/${toFix.length} updated`);
        }
      } catch (error) {
        console.error(`❌ Failed to update ${entry.domain}:`, error);
      }
    }

    console.log(`\n✅ Fixed ${updated} URLhaus evidence entries`);
    console.log(`   Changed from: tags/text → URLhaus search links`);

  } catch (error) {
    console.error('💥 Error fixing URLhaus evidence:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  fixURLhausEvidence()
    .then(() => {
      console.log('✅ Fix completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fix failed:', error);
      process.exit(1);
    });
}

export { fixURLhausEvidence };