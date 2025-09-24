import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkCache() {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  const stats = await redis.get('crypto-stats');

  if (stats) {
    console.log('✅ Stats found in Redis cache!');
    console.log('Cache contents:', {
      totalBlacklisted: (stats as any).totalBlacklisted,
      totalExchanges: (stats as any).totalExchanges,
      lastUpdated: (stats as any).lastUpdated,
      source: 'Redis Cache'
    });
  } else {
    console.log('❌ No stats in cache');
  }
}

checkCache();