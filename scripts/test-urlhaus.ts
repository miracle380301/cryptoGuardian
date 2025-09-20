import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testURLhaus() {
  const sample = await prisma.blacklistedDomain.findFirst({
    where: {
      primaryDataSource: 'urlhaus'
    }
  });

  console.log('🔍 URLhaus Sample Domain:');
  console.log('================================');
  console.log(`Domain: ${sample?.domain}`);
  console.log(`Full URL: ${sample?.fullUrl}`);
  console.log(`Reason: ${sample?.reason}`);
  console.log(`Category: ${sample?.category}`);
  console.log(`Risk Level: ${sample?.riskLevel}`);
  console.log(`Severity: ${sample?.severity}`);
  console.log(`Reported By: ${sample?.reportedBy}`);
  console.log(`Description: ${sample?.description}`);
  console.log(`Evidence: ${sample?.evidence?.join(', ')}`);
  console.log(`Report Date: ${sample?.reportDate}`);
  console.log(`Is Active: ${sample?.isActive}`);
  console.log('================================');

  await prisma.$disconnect();
}

testURLhaus();