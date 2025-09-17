// Test KISA API with detailed output
const KISA_API_KEY = '23c514fadfa74950dccfc43d16a70af0d629e96416d554bac896be0dd7a765ef';

async function testKISADetailed(domain) {
  try {
    console.log(`\n🔍 Testing KISA API for domain: ${domain}`);

    // Clean the domain
    const cleanDomain = domain.toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    console.log(`Cleaned domain: ${cleanDomain}`);

    const apiUrl = new URL('https://api.odcloud.kr/api/15109780/v1/uddi:707478dd-938f-4155-badb-fae6202ee7ed');
    apiUrl.searchParams.append('serviceKey', KISA_API_KEY);
    apiUrl.searchParams.append('page', '1');
    apiUrl.searchParams.append('perPage', '1000');
    apiUrl.searchParams.append('returnType', 'JSON');

    console.log(`\n📡 Fetching KISA database...`);

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('❌ KISA API error:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    console.log(`\n✅ KISA API Response:`);
    console.log(`Total records fetched: ${data.currentCount}`);

    // Search for han.gl in the data
    const hanGlRecords = data.data?.filter((item) => {
      const url = (item.홈페이지주소 || '').toLowerCase();
      return url.includes('han.gl');
    }) || [];

    console.log(`\n🎯 Found ${hanGlRecords.length} records containing "han.gl":`);
    console.log('=' .repeat(60));

    hanGlRecords.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log(JSON.stringify(record, null, 2));
    });

    // Specifically check for han.gl/pxkQl
    const specificUrl = 'han.gl/pxkQl';
    const exactMatch = data.data?.find((item) => {
      const url = (item.홈페이지주소 || '').toLowerCase();
      return url.includes(specificUrl.toLowerCase());
    });

    if (exactMatch) {
      console.log('\n' + '🚨'.repeat(20));
      console.log(`\n✅ EXACT MATCH FOUND for "${specificUrl}":`);
      console.log(JSON.stringify(exactMatch, null, 2));
      console.log('\n' + '🚨'.repeat(20));
    } else {
      console.log(`\n❌ No exact match for "${specificUrl}" in KISA database`);
    }

    // Show some sample records from KISA database
    console.log('\n\n📋 Sample KISA phishing records (first 5):');
    console.log('=' .repeat(60));
    data.data?.slice(0, 5).forEach((record, index) => {
      console.log(`\nSample ${index + 1}:`);
      console.log(JSON.stringify(record, null, 2));
    });

  } catch (error) {
    console.error('\n❌ Error testing KISA API:', error);
  }
}

// Test with han.gl/pxkQl
testKISADetailed('han.gl/pxkQl');