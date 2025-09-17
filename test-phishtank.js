// Test PhishTank API directly
async function testPhishTank(url) {
  try {
    console.log(`\n🎣 Testing PhishTank API for: ${url}`);

    const requestBody = new URLSearchParams();
    requestBody.append('url', url.startsWith('http') ? url : `http://${url}`);
    requestBody.append('format', 'json');

    console.log('Request body:', requestBody.toString());

    const response = await fetch('https://checkurl.phishtank.com/checkurl/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'phishtank/test'
      },
      body: requestBody.toString()
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      console.error('❌ PhishTank API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ PhishTank Response:');
    console.log(JSON.stringify(data, null, 2));

    if (data.results) {
      console.log('\n📊 Analysis:');
      console.log(`- In Database: ${data.results.in_database ? '✅ YES' : '❌ NO'}`);
      console.log(`- Verified: ${data.results.verified ? '✅ YES' : '❌ NO'}`);
      console.log(`- Valid: ${data.results.valid ? '✅ YES' : '❌ NO'}`);

      if (data.results.phish_id) {
        console.log(`- Phish ID: ${data.results.phish_id}`);
      }

      if (data.results.phish_detail_page) {
        console.log(`- Detail Page: ${data.results.phish_detail_page}`);
      }

      if (data.results.verified_at) {
        console.log(`- Verified At: ${data.results.verified_at}`);
      }
    }

    if (data.meta) {
      console.log('\n📋 Metadata:');
      console.log(`- Status: ${data.meta.status}`);
      console.log(`- Server ID: ${data.meta.serverid}`);
      console.log(`- Request ID: ${data.meta.requestid}`);
      console.log(`- Timestamp: ${data.meta.timestamp}`);
    }

  } catch (error) {
    console.error('\n❌ Error testing PhishTank API:', error);
  }
}

// Test with various URLs
async function runTests() {
  // Test with han.gl (known phishing from KISA)
  await testPhishTank('han.gl');

  console.log('\n' + '='.repeat(60));

  // Test with a full phishing URL
  await testPhishTank('https://han.gl/pxkQl');

  console.log('\n' + '='.repeat(60));

  // Test with a known safe site
  await testPhishTank('google.com');

  console.log('\n' + '='.repeat(60));

  // Test with a commonly phished brand
  await testPhishTank('paypal-verification.fake-example.com');
}

runTests();