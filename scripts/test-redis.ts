import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testRedis() {
  console.log('🔍 Testing Redis connection...\n');

  // Check environment variables
  const hasUrl = !!process.env.KV_REST_API_URL;
  const hasToken = !!process.env.KV_REST_API_TOKEN;

  console.log('Environment Variables:');
  console.log(`  KV_REST_API_URL: ${hasUrl ? '✅ Set' : '❌ Not set'}`);
  console.log(`  KV_REST_API_TOKEN: ${hasToken ? '✅ Set' : '❌ Not set'}\n`);

  if (!hasUrl || !hasToken) {
    console.log('❌ Redis environment variables not configured');
    return;
  }

  try {
    // Initialize Redis
    const redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });

    console.log('✅ Redis client initialized\n');

    // Test 1: Set a value
    console.log('Test 1: Setting a test value...');
    await redis.set('test-key', { message: 'Hello from Redis!', timestamp: new Date().toISOString() });
    console.log('✅ Value set successfully\n');

    // Test 2: Get the value
    console.log('Test 2: Getting the test value...');
    const value = await redis.get('test-key');
    console.log('✅ Value retrieved:', value, '\n');

    // Test 3: Set with TTL
    console.log('Test 3: Setting value with 60 second TTL...');
    await redis.set('test-ttl', 'This will expire in 60 seconds', { ex: 60 });
    console.log('✅ TTL value set successfully\n');

    // Test 4: Check TTL
    console.log('Test 4: Checking TTL...');
    const ttl = await redis.ttl('test-ttl');
    console.log(`✅ TTL remaining: ${ttl} seconds\n`);

    // Test 5: Check crypto-stats cache
    console.log('Test 5: Checking crypto-stats cache...');
    const stats = await redis.get('crypto-stats');
    if (stats) {
      console.log('✅ Found cached stats:', {
        totalBlacklisted: (stats as any).totalBlacklisted,
        totalExchanges: (stats as any).totalExchanges,
        lastUpdated: (stats as any).lastUpdated
      });
    } else {
      console.log('ℹ️ No cached stats found (API not called yet)');
    }

    console.log('\n🎉 All Redis tests passed!');

  } catch (error) {
    console.error('❌ Redis test failed:', error);
  }
}

testRedis();