// Test final CryptoScamDB implementation
async function testCryptoScamDB(domain) {
  console.log(`\n💰 Testing CryptoScamDB for: ${domain}`);

  try {
    const response = await fetch('https://raw.githubusercontent.com/CryptoScamDB/blacklist/master/data/urls.yaml');

    if (!response.ok) {
      console.error(`Failed to fetch: ${response.status}`);
      return;
    }

    const yamlContent = await response.text();
    const lines = yamlContent.split('\n');
    const scamUrls = [];

    // Parse YAML
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        const url = trimmed.substring(2).trim();
        if (url) {
          scamUrls.push(url.toLowerCase());
        }
      }
    }

    console.log(`Total scam URLs loaded: ${scamUrls.length}`);

    // Clean domain
    const cleanDomain = domain.toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    // Search for matches
    const matches = scamUrls.filter(scamUrl => {
      const cleanScamUrl = scamUrl
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];

      return cleanScamUrl === cleanDomain ||
             cleanScamUrl.includes(cleanDomain) ||
             cleanDomain.includes(cleanScamUrl);
    });

    if (matches.length > 0) {
      console.log(`\n FOUND ${matches.length} matches for ${domain}:`);
      matches.slice(0, 5).forEach(match => {
        console.log(`  - ${match}`);
      });
    } else {
      console.log(`\n Domain ${domain} NOT found in CryptoScamDB`);

      // Check for suspicious patterns
      const patterns = ['pancakeswap-', 'uniswap-', 'metamask-', 'binance-'];
      const suspicious = patterns.some(p => cleanDomain.includes(p));

      if (suspicious) {
        console.log(`BUT domain has suspicious crypto pattern!`);
      }
    }

    // Show sample entries
    console.log('\n Sample CryptoScamDB entries (first 10):');
    scamUrls.slice(0, 10).forEach((url, i) => {
      console.log(`  ${i + 1}. ${url}`);
    });

    // Search for common patterns
    console.log('\n🔍 Common scam patterns in database:');
    const patterns = ['pancakeswap', 'uniswap', 'metamask', 'trustwallet', 'binance'];
    patterns.forEach(pattern => {
      const count = scamUrls.filter(url => url.includes(pattern)).length;
      console.log(`  - ${pattern}: ${count} scams`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run tests
async function runTests() {
  await testCryptoScamDB('pancakeswap-finance.com');
  console.log('\n' + '='.repeat(60));
  await testCryptoScamDB('uniswap-v3.org');
  console.log('\n' + '='.repeat(60));
  await testCryptoScamDB('binance.com');
  console.log('\n' + '='.repeat(60));
  await testCryptoScamDB('han.gl');
}

runTests();