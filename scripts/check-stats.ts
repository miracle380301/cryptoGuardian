#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStats() {
  try {
    const count = await prisma.dailyStats.count();
    console.log('Total DailyStats records:', count);

    const latest = await prisma.dailyStats.findFirst({
      orderBy: { date: 'desc' },
      take: 1
    });

    if (latest) {
      console.log('\nLatest stats:');
      console.log('  Date:', latest.date);
      console.log('  Total Blacklisted:', latest.totalBlacklisted);
      console.log('  Total Exchanges:', latest.totalExchanges);
      console.log('  Last Calculated:', latest.lastCalculated);
    } else {
      console.log('No stats found in database');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await prisma.dailyStats.findUnique({
      where: { date: today }
    });

    console.log('\nToday stats (', today.toISOString(), '):');
    if (todayStats) {
      console.log('  Found! Total Blacklisted:', todayStats.totalBlacklisted);
    } else {
      console.log('  Not found - need to run calculate-daily-stats');
    }

    // Check last 5 days
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const recentStats = await prisma.dailyStats.findMany({
      where: {
        date: {
          gte: fiveDaysAgo
        }
      },
      orderBy: { date: 'desc' }
    });

    console.log('\nRecent stats (last 5 days):');
    recentStats.forEach(stat => {
      console.log(`  ${stat.date.toISOString().split('T')[0]}: Blacklisted=${stat.totalBlacklisted}, Exchanges=${stat.totalExchanges}`);
    });

  } catch (error) {
    console.error('Error checking stats:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStats();