// Test KISA API directly
const KISA_API_KEY = '23c514fadfa74950dccfc43d16a70af0d629e96416d554bac896be0dd7a765ef';

async function testKISA(domain) {
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
    apiUrl.searchParams.append('perPage', '100');
    apiUrl.searchParams.append('returnType', 'JSON');

    // Don't add condition for now - get all data first

    console.log(`\n📡 API URL: ${apiUrl.toString()}\n`);

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      console.error('❌ KISA API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ KISA API Response:');
    console.log('Full response:', JSON.stringify(data, null, 2));

    if (data.data && data.data.length > 0) {
      console.log(`\n🚨 Found ${data.data.length} phishing records for ${cleanDomain}:`);
      data.data.forEach((item, index) => {
        console.log(`\n  Record ${index + 1}:`);
        console.log(`  - URL: ${item.url}`);
        console.log(`  - 등록일: ${item.등록일 || 'N/A'}`);
        // Log all available fields
        Object.keys(item).forEach(key => {
          if (key !== 'url' && key !== '등록일') {
            console.log(`  - ${key}: ${item[key]}`);
          }
        });
      });
    } else {
      console.log(`\n✅ Domain ${cleanDomain} is NOT in KISA phishing database`);
    }

  } catch (error) {
    console.error('\n❌ Error testing KISA API:', error);
  }
}

// Test with the provided domain
testKISA('han.gl/pxkQl').then(() => {
  console.log('\n--- Test with shortened URL ---');
  return testKISA('han.gl');
}).then(() => {
  console.log('\n--- Test with known phishing pattern ---');
  return testKISA('upbit-exchange.com');
});