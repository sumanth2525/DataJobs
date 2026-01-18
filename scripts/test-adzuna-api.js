/**
 * Test script for Adzuna API integration
 * 
 * Usage: node scripts/test-adzuna-api.js
 * 
 * Make sure:
 * 1. Backend server is running on http://localhost:5000
 * 2. backend/.env has ADZUNA_APP_ID, ADZUNA_APP_KEY, and ADZUNA_COUNTRY
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test Adzuna API endpoints
async function testAdzunaAPI() {
  console.log('🧪 Testing Adzuna API Integration\n');
  console.log('=' .repeat(60));
  
  // Test 1: Get Data-Related Jobs
  console.log('\n📋 Test 1: Get Data-Related Jobs');
  console.log('-'.repeat(60));
  try {
    const response = await axios.get(`${API_BASE_URL}/adzuna/jobs/data-roles`, {
      params: {
        location: '',
        page: 1,
        results_per_page: 10
      }
    });
    
    if (response.data.success) {
      console.log('✅ SUCCESS: Fetched jobs from Adzuna API');
      console.log(`   Total jobs: ${response.data.count || response.data.data?.length || 0}`);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('\n   Sample job:');
        const job = response.data.data[0];
        console.log(`   - ID: ${job.id}`);
        console.log(`   - Title: ${job.title}`);
        console.log(`   - Company: ${job.company}`);
        console.log(`   - Location: ${job.location}`);
        console.log(`   - Salary: ${job.salary}`);
        console.log(`   - Link: ${job.link}`);
      }
    } else {
      console.log('❌ FAILED:', response.data.error);
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ ERROR:', error.response.status, error.response.data?.error || error.response.data?.message);
      if (error.response.data?.error?.includes('API keys not configured')) {
        console.log('\n   💡 Solution: Add Adzuna API keys to backend/.env:');
        console.log('   ADZUNA_APP_ID=8d111a0b');
        console.log('   ADZUNA_APP_KEY=81818d272d30e30e98627938eeca981d');
        console.log('   ADZUNA_COUNTRY=us');
      } else if (error.response.data) {
        console.log('   Response data:', JSON.stringify(error.response.data, null, 2));
      }
    } else {
      console.log('❌ ERROR: Could not connect to backend server');
      console.log('   💡 Solution: Make sure backend server is running on http://localhost:5000');
    }
  }
  
  // Test 2: Search Jobs
  console.log('\n📋 Test 2: Search Jobs (Data Scientist)');
  console.log('-'.repeat(60));
  try {
    const response = await axios.get(`${API_BASE_URL}/adzuna/jobs/search`, {
      params: {
        what: 'data scientist',
        where: 'Remote',
        page: 1,
        results_per_page: 5
      }
    });
    
    if (response.data.success) {
      console.log('✅ SUCCESS: Searched jobs via Adzuna API');
      console.log(`   Total results: ${response.data.count || response.data.data?.length || 0}`);
    } else {
      console.log('❌ FAILED:', response.data.error);
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ ERROR:', error.response.status, error.response.data?.error || error.response.data?.message);
    } else {
      console.log('❌ ERROR:', error.message);
    }
  }
  
  // Test 3: Get Categories
  console.log('\n📋 Test 3: Get Job Categories');
  console.log('-'.repeat(60));
  try {
    const response = await axios.get(`${API_BASE_URL}/adzuna/categories`);
    
    if (response.data.success) {
      console.log('✅ SUCCESS: Fetched categories from Adzuna API');
      console.log(`   Total categories: ${response.data.data?.length || 0}`);
    } else {
      console.log('❌ FAILED:', response.data.error);
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ ERROR:', error.response.status, error.response.data?.error || error.response.data?.message);
    } else {
      console.log('❌ ERROR:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📝 Next Steps:');
  console.log('1. If tests passed, jobs from Adzuna will automatically appear in the UI');
  console.log('2. Check browser console (F12) for job fetching logs');
  console.log('3. Navigate to Dashboard to see jobs from both database and Adzuna');
  console.log('\n');
}

// Run tests
testAdzunaAPI().catch(console.error);
