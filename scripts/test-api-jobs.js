/**
 * Test script to verify jobs API endpoint is working
 * Run this to check if jobs from SQL are accessible via API
 */

const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function testJobsAPI() {
  console.log('\n🔍 Testing Jobs API Endpoint...\n');
  console.log(`API URL: ${API_URL}/jobs\n`);

  try {
    // Test 1: Fetch all jobs
    console.log('📡 Fetching jobs from API...');
    const response = await axios.get(`${API_URL}/jobs`);

    console.log('\n✅ API Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));

    if (response.data && response.data.success) {
      const jobs = response.data.data || [];
      console.log(`\n📋 Found ${jobs.length} job(s) in database:`);
      
      jobs.forEach((job, index) => {
        console.log(`\n  Job ${index + 1}:`);
        console.log(`    ID: ${job.id}`);
        console.log(`    Company: ${job.company}`);
        console.log(`    Title: ${job.title}`);
        console.log(`    Location: ${job.location}`);
        console.log(`    Link: ${job.link}`);
        console.log(`    Created: ${job.created_at || 'N/A'}`);
      });

      if (jobs.length === 0) {
        console.log('\n⚠️  No jobs found in database!');
        console.log('   Make sure you have inserted jobs via SQL or UI.');
      }
    } else {
      console.error('\n❌ API response format is incorrect');
      console.error('   Expected: { success: true, data: [...] }');
    }

  } catch (error) {
    console.error('\n❌ Error fetching jobs from API:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   ⚠️  Connection refused! Is the backend server running?');
      console.error('   Run: cd backend && npm start');
    } else if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   ${error.message}`);
    }
    
    process.exit(1);
  }
}

// Run test
testJobsAPI();
