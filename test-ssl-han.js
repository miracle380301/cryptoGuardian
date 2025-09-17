// Test SSL check for han.gl
async function testSSL(domain) {
  console.log(`\n🔒 Testing SSL for: ${domain}`);

  try {
    const response = await fetch('http://localhost:3000/api/ssl-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain })
    });

    const result = await response.json();
    console.log('\n📊 SSL Check Result:');
    console.log(JSON.stringify(result, null, 2));

    if (result.data) {
      console.log('\n🎯 Key SSL Information:');
      console.log(`- Has SSL: ${result.data.hasSSL}`);
      console.log(`- Valid: ${result.data.valid}`);
      console.log(`- Score: ${result.data.score}`);
      console.log(`- Grade: ${result.data.grade}`);
      console.log(`- Issuer: ${result.data.issuer}`);
      console.log(`- Protocol: ${result.data.protocol}`);
      console.log(`- Days Remaining: ${result.data.daysRemaining}`);

      if (result.data.scoreBreakdown) {
        console.log('\n📈 Score Breakdown:');
        result.data.scoreBreakdown.forEach(item => console.log(`  - ${item}`));
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test han.gl
testSSL('han.gl').then(() => {
  console.log('\n' + '='.repeat(60));
  console.log('Testing a known good site for comparison...');
  return testSSL('google.com');
});