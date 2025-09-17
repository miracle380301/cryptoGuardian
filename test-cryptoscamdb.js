// Test CryptoScamDB API
async function testCryptoScamDB(domain) {
  try {
    console.log(`\n💰 Testing CryptoScamDB for: ${domain}`);

    // Method 1: Direct API from CryptoScamDB website
    console.log('\n📡 Method 1: Direct CryptoScamDB API...');
    try {
      const apiUrl = `https://api.cryptoscamdb.org/v1/check/${encodeURIComponent(domain)}`;
      console.log(`API URL: ${apiUrl}`);

      const directResponse = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CryptoGuardian/1.0'
        }
      });

      if (directResponse.ok) {
        const directData = await directResponse.json();
        console.log('Direct API Response:', JSON.stringify(directData, null, 2));
      } else {
        console.log(`Direct API failed: ${directResponse.status}`);
      }
    } catch (error) {
      console.log('Direct API error:', error.message);
    }

    // Method 2: GitHub Raw Data (smaller file)
    console.log('\n📡 Method 2: GitHub Raw Data...');
    const githubUrl = 'https://raw.githubusercontent.com/CryptoScamDB/blacklist/master/data/urls.json';
    console.log(`Fetching from: ${githubUrl}`);

    const response = await fetch(githubUrl, {
      headers: {
        'User-Agent': 'CryptoGuardian/1.0'
      }
    });

    if (!response.ok) {
      console.error(`GitHub error: ${response.status}`);
      return;
    }

    const scamUrls = await response.json();
    console.log(`Total scam URLs in database: ${scamUrls.length}`);

    // Search for the domain
    const cleanDomain = domain.toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    const matches = scamUrls.filter(url => {
      const cleanUrl = url.toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '');
      return cleanUrl.includes(cleanDomain) || cleanDomain.includes(cleanUrl);
    });

    if (matches.length > 0) {
      console.log(`\n🚨 FOUND ${matches.length} matches for ${domain}:`);
      matches.slice(0, 5).forEach(match => {
        console.log(`  - ${match}`);
      });
    } else {
      console.log(`\n✅ Domain ${domain} NOT found in CryptoScamDB`);
    }

    // Show some sample entries
    console.log('\n📋 Sample CryptoScamDB entries:');
    scamUrls.slice(0, 10).forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });

  } catch (error) {
    console.error('\n❌ Error testing CryptoScamDB:', error);
  }
}

// Test various domains
async function runTests() {
  // Test a known crypto scam pattern
  await testCryptoScamDB('btc-exchange.com');

  console.log('\n' + '='.repeat(60));

  // Test han.gl
  await testCryptoScamDB('han.gl');

  console.log('\n' + '='.repeat(60));

  // Test a legitimate crypto exchange
  await testCryptoScamDB('binance.com');

  console.log('\n' + '='.repeat(60));

  // Test a fake Uniswap site
  await testCryptoScamDB('uniswap-v3.com');
}

runTests();