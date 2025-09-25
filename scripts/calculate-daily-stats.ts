#!/usr/bin/env tsx

/**
 * Daily Statistics Calculation Script
 *
 * This script calculates and stores daily statistics in the DailyStats table.
 * Run with: npm run calculate-stats
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class DailyStatsCalculator {
  private today: Date;

  constructor() {
    // 오늘 날짜 (시간 제거)
    this.today = new Date();
    this.today.setHours(0, 0, 0, 0);
  }

  async calculateAndSaveDailyStats() {
    console.log('📊 Starting daily statistics calculation...');
    const startTime = Date.now();

    try {
      // 1. 모든 통계를 병렬로 계산
      console.log('🔍 Calculating statistics...');

      const [
        totalBlacklisted,
        totalExchanges,
        recentDetections,
        totalValidations,
        sourceBreakdown,
        categoryBreakdown,
        severityBreakdown,
        riskLevelBreakdown,
        newDomainsToday,
        newExchangesToday
      ] = await Promise.all([
        // 총 블랙리스트 도메인 수
        prisma.blacklistedDomain.count({
          where: { isActive: true }
        }),

        // 검증된 거래소 수
        prisma.exchange.count({
          where: { isActive: true }
        }),

        // 전체 탐지된 스캠 (총 블랙리스트 도메인 수와 동일)
        prisma.blacklistedDomain.count({
          where: { isActive: true }
        }),

        // 전체 분석된 사이트 수 (BlacklistedDomain + WhitelistedDomain + UserReport)
        Promise.all([
          prisma.blacklistedDomain.count(),
          prisma.whitelistedDomain.count(),
          prisma.userReport.count()
        ]).then(([black, white, report]) => black + white + report),

        // 데이터 소스별 통계
        prisma.blacklistedDomain.groupBy({
          by: ['primaryDataSource'],
          _count: true,
          where: { isActive: true }
        }),

        // 카테고리별 통계
        prisma.blacklistedDomain.groupBy({
          by: ['category'],
          _count: true,
          where: {
            isActive: true,
            category: {
              not: null
            }
          }
        }),

        // 심각도별 통계
        Promise.resolve([]).then(() => [] as Array<{ severity: string; _count: number }>),

        // 위험도별 통계
        Promise.resolve([]).then(() => [] as Array<{ riskLevel: string; _count: number }>),

        // 오늘 추가된 도메인 수
        prisma.blacklistedDomain.count({
          where: {
            createdAt: {
              gte: this.today,
              lt: new Date(this.today.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        }),

        // 오늘 추가된 거래소 수
        prisma.exchange.count({
          where: {
            createdAt: {
              gte: this.today,
              lt: new Date(this.today.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      // 2. 가장 많은 카테고리 찾기
      const topCategory = categoryBreakdown.reduce((max, curr) =>
        (curr._count > (max?._count || 0)) ? curr : max,
        { category: 'unknown', _count: 0 }
      );

      // 3. JSON 데이터 형태로 변환
      const sourceBreakdownJson = sourceBreakdown.map(s => ({
        source: s.primaryDataSource,
        count: s._count
      }));

      const categoryBreakdownJson = categoryBreakdown.map(c => ({
        category: c.category,
        count: c._count
      }));

      const severityBreakdownJson = severityBreakdown.map(s => ({
        severity: s.severity,
        count: s._count
      }));

      const riskLevelBreakdownJson = riskLevelBreakdown.map(r => ({
        riskLevel: r.riskLevel,
        count: r._count
      }));

      const executionTime = Date.now() - startTime;

      // 3.5. 탐지율 계산 (블랙리스트 / 전체 분석 사이트 × 100)
      const calculatedDetectionRate = totalValidations > 0
        ? Math.round((totalBlacklisted / totalValidations) * 100 * 10) / 10  // 소수점 1자리까지
        : 0.0;

      // 4. DailyStats에 저장 (upsert)
      console.log('💾 Saving statistics to database...');

      const dailyStats = await prisma.dailyStats.upsert({
        where: { date: this.today },
        create: {
          date: this.today,
          totalBlacklisted,
          totalExchanges,
          recentDetections,
          totalValidations,
          detectionRate: calculatedDetectionRate,
          dataSourcesCount: sourceBreakdown.length,
          topThreatCategory: topCategory.category,
          sourceBreakdown: sourceBreakdownJson,
          categoryBreakdown: categoryBreakdownJson,
          severityBreakdown: severityBreakdownJson,
          riskLevelBreakdown: riskLevelBreakdownJson,
          newDomainsToday,
          newExchangesToday,
          calculationTime: executionTime
        },
        update: {
          totalBlacklisted,
          totalExchanges,
          recentDetections,
          totalValidations,
          detectionRate: calculatedDetectionRate,
          dataSourcesCount: sourceBreakdown.length,
          topThreatCategory: topCategory.category,
          sourceBreakdown: sourceBreakdownJson,
          categoryBreakdown: categoryBreakdownJson,
          severityBreakdown: severityBreakdownJson,
          riskLevelBreakdown: riskLevelBreakdownJson,
          newDomainsToday,
          newExchangesToday,
          calculationTime: executionTime,
          lastCalculated: new Date()
        }
      });

      // 5. 결과 출력
      console.log('✅ Daily statistics calculation completed!');
      console.log(`📈 Statistics Summary:`);
      console.log(`  - Total Blacklisted: ${totalBlacklisted.toLocaleString()}`);
      console.log(`  - Total Exchanges: ${totalExchanges.toLocaleString()}`);
      console.log(`  - Total Detections: ${recentDetections.toLocaleString()}`);
      console.log(`  - Total Analyzed Sites: ${totalValidations.toLocaleString()}`);
      console.log(`  - Detection Rate: ${calculatedDetectionRate}%`);
      console.log(`  - New Domains Today: ${newDomainsToday.toLocaleString()}`);
      console.log(`  - New Exchanges Today: ${newExchangesToday.toLocaleString()}`);
      console.log(`  - Data Sources: ${sourceBreakdown.length}`);
      console.log(`  - Top Category: ${topCategory.category} (${topCategory._count})`);
      console.log(`⏱️ Calculation time: ${executionTime}ms`);

      // 6. 선택적: 30일 이상 된 통계 데이터 정리
      await this.cleanOldStats();

      return dailyStats;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Failed to calculate daily statistics:', error);

      // 에러 발생 시에도 기본 통계 저장
      try {
        await prisma.dailyStats.upsert({
          where: { date: this.today },
          create: {
            date: this.today,
            totalBlacklisted: 0,
            totalExchanges: 0,
            recentDetections: 0,
            totalValidations: 0,
            detectionRate: 0,
            dataSourcesCount: 0,
            topThreatCategory: 'error',
            sourceBreakdown: [],
            categoryBreakdown: [],
            newDomainsToday: 0,
            newExchangesToday: 0,
            calculationTime: executionTime
          },
          update: {
            calculationTime: executionTime,
            lastCalculated: new Date()
          }
        });
      } catch (saveError) {
        console.error('❌ Failed to save error state:', saveError);
      }

      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  private async cleanOldStats() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deletedCount = await prisma.dailyStats.deleteMany({
        where: {
          date: {
            lt: thirtyDaysAgo
          }
        }
      });

      if (deletedCount.count > 0) {
        console.log(`🧹 Cleaned ${deletedCount.count} old statistics records`);
      }
    } catch (error) {
      console.error('⚠️ Failed to clean old statistics:', error);
      // 정리 실패는 치명적이지 않음
    }
  }
}

// Main execution
async function main() {
  const calculator = new DailyStatsCalculator();
  await calculator.calculateAndSaveDailyStats();
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { DailyStatsCalculator };