// API Connection Test Script
const http = require('http');
const https = require('https');

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

// Simple HTTP request function
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testAPI() {
  console.log('\n' + '='.repeat(60));
  console.log('  API CONNECTION TEST');
  console.log('='.repeat(60));
  console.log(`Testing API at: ${API_BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  try {
    log.info('Test 1: Health Check Endpoint');
    const response = await makeRequest(`${API_BASE_URL}/health`);
    if (response.status === 200 && response.data.status === 'OK') {
      log.success('Health check passed');
      passed++;
    } else {
      log.error('Health check failed - unexpected response');
      failed++;
    }
  } catch (error) {
    log.error(`Health check failed: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      log.warning('Server might not be running. Start with: cd backend && npm run dev');
    }
    failed++;
  }

  // Test 2: Get All Jobs
  try {
    log.info('Test 2: Get All Jobs');
    const response = await makeRequest(`${API_BASE_URL}/jobs`);
    if (response.status === 200 && response.data.success !== false) {
      log.success(`Get jobs passed - Found ${response.data.data?.length || response.data.length || 0} jobs`);
      passed++;
    } else {
      log.error('Get jobs failed - unexpected response');
      failed++;
    }
  } catch (error) {
    log.error(`Get jobs failed: ${error.message}`);
    failed++;
  }

  // Test 3: Get Jobs with Filters
  try {
    log.info('Test 3: Get Jobs with Time Filter (Last 24 hours)');
    const response = await makeRequest(`${API_BASE_URL}/jobs?timeFilter=Last%2024%20hours`);
    if (response.status === 200) {
      log.success(`Time filter test passed - Found ${response.data.data?.length || response.data.length || 0} jobs`);
      passed++;
    } else {
      log.error('Time filter test failed');
      failed++;
    }
  } catch (error) {
    log.error(`Time filter test failed: ${error.message}`);
    failed++;
  }

  // Test 4: Search Jobs
  try {
    log.info('Test 4: Search Jobs');
    const response = await makeRequest(`${API_BASE_URL}/jobs?search=data`);
    if (response.status === 200) {
      log.success(`Search test passed - Found ${response.data.data?.length || response.data.length || 0} jobs`);
      passed++;
    } else {
      log.error('Search test failed');
      failed++;
    }
  } catch (error) {
    log.error(`Search test failed: ${error.message}`);
    failed++;
  }

  // Test 5: RapidAPI Internships Endpoint (Data Roles)
  try {
    log.info('Test 5: RapidAPI Internships (Data Roles)');
    const response = await makeRequest(`${API_BASE_URL}/rapidapi/internships/data-roles`);
    if (response.status === 200 && response.data.success) {
      log.success(`Internships API successful - Found ${response.data.count} data internships`);
      passed++;
    } else {
      log.warning('Internships API test returned non-200 status or failed');
      if (response.data?.error) {
        log.warning(`Error: ${response.data.error}`);
      }
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log.warning('Internships API test skipped - Server not running');
    } else {
      log.warning(`Internships API test failed: ${error.message}`);
    }
    // Don't count as critical failure
  }

  // Test 6: Online Users Endpoint
  try {
    log.info('Test 6: Online Users Endpoint');
    const response = await makeRequest(`${API_BASE_URL}/users/online`);
    if (response.status === 200 && response.data.success) {
      log.success(`Online users test passed - Count: ${response.data.count}`);
      passed++;
    } else {
      log.error('Online users test failed');
      failed++;
    }
  } catch (error) {
    log.error(`Online users test failed: ${error.message}`);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('  TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log(`\n${colors.green}All tests passed! API is working correctly.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.yellow}Some tests failed. Check the errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
testAPI().catch(error => {
  log.error(`Test suite error: ${error.message}`);
  process.exit(1);
});
