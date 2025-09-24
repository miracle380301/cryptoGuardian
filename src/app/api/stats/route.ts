import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';

const prisma = new PrismaClient();

// Initialize Redis with Vercel KV environment variables
const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

const CACHE_KEY = 'crypto-stats';
const CACHE_TTL = 60 * 60; // 1 hour in seconds

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('📊 [Stats API] Request received');

    // Try to get from Redis cache first
    if (redis) {
      try {
        const cached = await redis.get(CACHE_KEY);
        if (cached) {
          const responseTime = Date.now() - startTime;
          console.log(`⚡ [Stats API] Served from Redis cache (${responseTime}ms)`);

          return NextResponse.json({
            success: true,
            stats: cached,
            meta: {
              responseTime: responseTime,
              source: 'redis_cache'
            }
          });
        }
      } catch (redisError) {
        console.error('Redis error:', redisError);
        // Continue to fetch from database
      }
    }

    // Fetch from database
    const latestStats = await prisma.dailyStats.findFirst({
      orderBy: { date: 'desc' },
    });

    if (!latestStats) {
      console.log('⚠️ No DailyStats found');
      return NextResponse.json({
        success: false,
        error: 'No statistics available'
      }, { status: 404 });
    }

    const stats = {
      totalBlacklisted: latestStats.totalBlacklisted.toLocaleString(),
      totalExchanges: latestStats.totalExchanges.toLocaleString(),
      recentDetections: latestStats.recentDetections.toLocaleString(),
      totalValidations: latestStats.totalValidations.toLocaleString(),
      detectionRate: `${latestStats.detectionRate}%`,
      dataSources: latestStats.dataSourcesCount,
      topThreatCategory: latestStats.topThreatCategory,
      breakdown: {
        sources: latestStats.sourceBreakdown as any[],
        categories: latestStats.categoryBreakdown as any[],
        severity: latestStats.severityBreakdown as any[] || [],
        riskLevel: latestStats.riskLevelBreakdown as any[] || []
      },
      newDomainsToday: latestStats.newDomainsToday.toLocaleString(),
      newExchangesToday: latestStats.newExchangesToday.toLocaleString(),
      lastUpdated: latestStats.lastCalculated.toISOString(),
      cached: true,
      calculationTime: latestStats.calculationTime || undefined,
      cacheLoadedAt: new Date().toISOString()
    };

    // Store in Redis cache if available
    if (redis) {
      try {
        await redis.set(CACHE_KEY, stats, { ex: CACHE_TTL });
        console.log('💾 Stats cached in Redis');
      } catch (redisError) {
        console.error('Failed to cache in Redis:', redisError);
      }
    }

    const responseTime = Date.now() - startTime;
    console.log(`✅ [Stats API] Response sent from database (${responseTime}ms)`);

    return NextResponse.json({
      success: true,
      stats,
      meta: {
        responseTime: responseTime,
        source: 'database'
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ [Stats API] Error after ${responseTime}ms:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}