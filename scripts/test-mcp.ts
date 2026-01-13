/**
 * MCP API 로컬 테스트 스크립트
 *
 * 사용법:
 * 1. 먼저 로컬 서버 실행: npm run dev
 * 2. 다른 터미널에서 실행: npx tsx scripts/test-mcp.ts
 */

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  success: boolean;
  responseTime: number;
  data?: any;
  error?: string;
}

async function testValidateDomain(): Promise<TestResult> {
  const testCases = [
    { domain: 'binance.com', type: 'crypto', description: '검증된 거래소' },
    { domain: 'binance-secure-login.com', type: 'crypto', description: '의심 도메인' },
    { domain: 'google.com', type: 'general', description: '일반 도메인' },
  ];

  console.log('\n=== 1. validate_domain 테스트 ===\n');

  for (const testCase of testCases) {
    const start = Date.now();
    try {
      const response = await fetch(`${BASE_URL}/api/mcp/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: testCase.domain, type: testCase.type })
      });

      const data = await response.json();
      const responseTime = Date.now() - start;

      console.log(`[${testCase.description}] ${testCase.domain}`);
      console.log(`  Status: ${data.data?.status || 'error'}`);
      console.log(`  Score: ${data.data?.finalScore ?? 'N/A'}`);
      console.log(`  Verdict: ${data.data?.verdict || 'N/A'}`);
      console.log(`  Reference: ${data.reference?.url || 'N/A'}`);
      console.log(`  Response Time: ${responseTime}ms`);
      console.log('');

    } catch (error) {
      console.log(`[${testCase.description}] ${testCase.domain}`);
      console.log(`  Error: ${error}`);
      console.log('');
    }
  }

  return { name: 'validate_domain', success: true, responseTime: 0 };
}

async function testTrendingScams(): Promise<TestResult> {
  console.log('\n=== 2. get_trending_scams 테스트 ===\n');

  const start = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/api/mcp/trending-scams`);
    const data = await response.json();
    const responseTime = Date.now() - start;

    if (data.success) {
      console.log(`Period: ${data.data?.periodLabel}`);
      console.log(`Total New Scams: ${data.data?.summary?.totalNewScams}`);
      console.log(`Overall Change: ${data.data?.summary?.overallChange}`);
      console.log(`Warning: ${data.data?.warningMessage}`);
      console.log('');
      console.log('Category Trends:');
      data.data?.categoryTrends?.slice(0, 5).forEach((t: any) => {
        console.log(`  - ${t.categoryKr}: ${t.count}건 (${t.change})`);
      });
      console.log('');
      console.log('Targeted Brands:');
      data.data?.targetedBrands?.slice(0, 5).forEach((b: any) => {
        console.log(`  - ${b.brand}: ${b.count}건`);
      });
      console.log('');
      console.log(`Reference: ${data.reference?.url}`);
      console.log(`Response Time: ${responseTime}ms`);
    } else {
      console.log(`Error: ${data.error}`);
    }

    return { name: 'get_trending_scams', success: data.success, responseTime, data };

  } catch (error) {
    console.log(`Error: ${error}`);
    return { name: 'get_trending_scams', success: false, responseTime: Date.now() - start, error: String(error) };
  }
}

async function testEducation(): Promise<TestResult> {
  const categories = ['general', 'fake-exchange', 'wallet-scam', 'phishing', 'airdrop-scam'];

  console.log('\n=== 3. educate_user 테스트 ===\n');

  for (const category of categories) {
    const start = Date.now();
    try {
      const response = await fetch(`${BASE_URL}/api/mcp/education?category=${category}`);
      const data = await response.json();
      const responseTime = Date.now() - start;

      if (data.success) {
        console.log(`[${category}] ${data.data?.title}`);
        console.log(`  Description: ${data.data?.description}`);
        console.log(`  Tips: ${data.data?.tips?.length}개`);
        console.log(`  Real Examples: ${data.data?.realWorldExamples?.length}개`);
        console.log(`  Total Detected: ${data.data?.statistics?.totalDetected}`);
        console.log(`  Response Time: ${responseTime}ms`);
        console.log('');
      } else {
        console.log(`[${category}] Error: ${data.error}`);
      }

    } catch (error) {
      console.log(`[${category}] Error: ${error}`);
    }
  }

  return { name: 'educate_user', success: true, responseTime: 0 };
}

async function testReportScam(): Promise<TestResult> {
  console.log('\n=== 4. report_scam 테스트 ===\n');

  // 신고 테스트
  const testDomain = `test-scam-${Date.now()}.com`;
  const start = Date.now();

  try {
    // POST - 신고하기
    console.log('[신고 테스트]');
    const reportResponse = await fetch(`${BASE_URL}/api/mcp/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: testDomain,
        reportType: 'fake-exchange',
        description: 'MCP 테스트 신고입니다'
      })
    });

    const reportData = await reportResponse.json();
    const responseTime = Date.now() - start;

    if (reportData.success) {
      console.log(`  Domain: ${testDomain}`);
      console.log(`  Status: ${reportData.data?.status}`);
      console.log(`  Message: ${reportData.data?.messageKr || reportData.data?.message}`);
      console.log(`  Report ID: ${reportData.data?.reportId || 'N/A'}`);
      console.log(`  Reference: ${reportData.reference?.url}`);
      console.log(`  Response Time: ${responseTime}ms`);
    } else {
      console.log(`  Error: ${reportData.error}`);
    }

    console.log('');

    // GET - 신고 상태 조회
    console.log('[신고 상태 조회 테스트]');
    const statusResponse = await fetch(`${BASE_URL}/api/mcp/report?domain=${testDomain}`);
    const statusData = await statusResponse.json();

    if (statusData.success) {
      console.log(`  Domain: ${statusData.data?.domain}`);
      console.log(`  Is Blacklisted: ${statusData.data?.isBlacklisted}`);
      console.log(`  Report Count: ${statusData.data?.reportCount}`);
      if (statusData.data?.reports?.length > 0) {
        console.log(`  Latest Report: ${statusData.data.reports[0].reportTypeKr} (${statusData.data.reports[0].statusKr})`);
      }
    }

    return { name: 'report_scam', success: true, responseTime };

  } catch (error) {
    console.log(`Error: ${error}`);
    return { name: 'report_scam', success: false, responseTime: Date.now() - start, error: String(error) };
  }
}

async function testAll() {
  console.log('========================================');
  console.log('   CryptoGuardian MCP API Test');
  console.log('========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);

  // 서버 상태 확인
  try {
    const healthCheck = await fetch(`${BASE_URL}/api/stats`);
    if (!healthCheck.ok) {
      console.log('\n[ERROR] 서버에 연결할 수 없습니다. npm run dev를 실행했는지 확인하세요.\n');
      return;
    }
    console.log('\n[OK] 서버 연결 성공\n');
  } catch (error) {
    console.log('\n[ERROR] 서버에 연결할 수 없습니다.');
    console.log('먼저 "npm run dev"로 로컬 서버를 실행하세요.\n');
    return;
  }

  // 테스트 실행
  await testValidateDomain();
  await testTrendingScams();
  await testEducation();
  await testReportScam();

  console.log('\n========================================');
  console.log('   테스트 완료');
  console.log('========================================\n');
}

// 실행
testAll().catch(console.error);
