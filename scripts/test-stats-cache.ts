#!/usr/bin/env tsx

import statsCacheManager from '../src/lib/cache/statsCache';

async function testStatsCache() {
  console.log('🧪 Testing stats cache system...');

  try {
    // 캐시 상태 확인
    const cacheInfo = statsCacheManager.getCacheInfo();
    console.log('📊 Cache Info:', cacheInfo);

    // 통계 조회
    const stats = await statsCacheManager.getStats();
    console.log('✅ Stats retrieved successfully!');
    console.log('📈 Total Blacklisted:', stats.totalBlacklisted);
    console.log('🏢 Total Exchanges:', stats.totalExchanges);
    console.log('🆕 New Domains Today:', stats.newDomainsToday);
    console.log('⏰ Last Updated:', stats.lastUpdated);
    console.log('💾 Cached:', stats.cached);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testStatsCache();