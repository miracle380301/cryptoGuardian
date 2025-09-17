// Test CryptoScamDB with updated approach
async function testCryptoScamDB(domain) {
  try {
    console.log(`\n💰 Testing CryptoScamDB for: ${domain}`);

    // Check the main website API
    console.log('\n📡 Checking CryptoScamDB website...');

    // Method 1: Try the website search
    const searchUrl = `https://cryptoscamdb.org/api/search?q=${encodeURIComponent(domain)}`;
    console.log(`Search URL: ${searchUrl}`);

    try {
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      });
      console.log(`Search response status: ${searchResponse.status}`);
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        console.log('Search results:', JSON.stringify(searchData, null, 2));
      }
    } catch (error) {
      console.log('Search API error:', error.message);
    }

    // Method 2: Check GitHub repo structure
    console.log('\n📡 Checking GitHub repository structure...');
    const repoUrl = 'https://api.github.com/repos/CryptoScamDB/blacklist/contents/data';

    const repoResponse = await fetch(repoUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CryptoGuardian/1.0'
      }
    });

    if (repoResponse.ok) {
      const files = await repoResponse.json();
      console.log('Available data files:');
      files.forEach(file => {
        console.log(`  - ${file.name} (${file.size} bytes)`);
      });

      // Try to fetch domains.json or scams.json
      const domainFile = files.find(f => f.name.includes('domain') || f.name.includes('scam'));
      if (domainFile) {
        console.log(`\nFetching ${domainFile.name}...`);
        const dataResponse = await fetch(domainFile.download_url);
        if (dataResponse.ok) {
          const data = await dataResponse.json();

          // Check structure
          console.log('Data structure:', Object.keys(data).slice(0, 10));

          // Search for domain
          if (Array.isArray(data)) {
            const found = data.filter(item => {
              const str = JSON.stringify(item).toLowerCase();
              return str.includes(domain.toLowerCase());
            });

            if (found.length > 0) {
              console.log(`\n🚨 Found ${found.length} matches:`);
              found.slice(0, 3).forEach(item => {
                console.log(JSON.stringify(item, null, 2));
              });
            } else {
              console.log(`\n✅ Domain ${domain} not found in CryptoScamDB`);
            }
          } else {
            console.log('Data is not an array, checking object properties...');
            // Check if it's an object with domain keys
            const keys = Object.keys(data);
            const matchingKeys = keys.filter(key => key.includes(domain));
            if (matchingKeys.length > 0) {
              console.log(`Found matching entries: ${matchingKeys}`);
            }
          }
        }
      }
    } else {
      console.error(`GitHub API error: ${repoResponse.status}`);
    }

    // Method 3: Try alternative endpoints
    console.log('\n📡 Trying alternative data sources...');
    const alternatives = [
      'https://etherscamdb.info/api/scams',
      'https://raw.githubusercontent.com/CryptoScamDB/assets/master/blacklist.json',
      'https://cryptoscamdb.org/data/blacklist.json'
    ];

    for (const url of alternatives) {
      try {
        console.log(`Trying: ${url}`);
        const response = await fetch(url);
        console.log(`Status: ${response.status}`);
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          console.log(`Content-Type: ${contentType}`);
          break;
        }
      } catch (error) {
        console.log(`Failed: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

// Test
testCryptoScamDB('pancakeswap-finance.com');