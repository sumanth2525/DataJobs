/**
 * Test script for SerpAPI (Google Jobs) integration
 * 
 * Usage: node scripts/test-serpapi.js
 * 
 * Make sure:
 * 1. Backend server is running on http://localhost:5000
 * 2. backend/.env has SERPAPI_KEY configured
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test SerpAPI endpoints
async function testSerpAPI() {
  console.log('🧪 Testing SerpAPI (Google Jobs) Integration\n');
  console.log('='.repeat(60));
  
  // Test 1: Search Google Jobs
  console.log('\n📋 Test 1: Search Google Jobs');
  console.log('-'.repeat(60));
  try {
    const response = await axios.get(`${API_BASE_URL}/serpapi/jobs/search`, {
      params: {
        q: 'data scientist',
        location: 'United States',
        num: 10
      }
    });
    
    if (response.data.success) {
      console.log('✅ SUCCESS: Fetched jobs from SerpAPI (Google Jobs)');
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
      if (error.response.data?.error?.includes('API keys not configured') || error.response.data?.error?.includes('SerpAPI key not configured')) {
        console.log('\n   💡 Solution: Add SerpAPI key to backend/.env:');
        console.log('   SERPAPI_KEY=your_serpapi_key_here');
        console.log('\n   Get your API key from: https://serpapi.com/dashboard');
      } else if (error.response.data) {
        console.log('   Response data:', JSON.stringify(error.response.data, null, 2));
      }
    } else {
      console.log('❌ ERROR: Could not connect to backend server');
      console.log('   💡 Solution: Make sure backend server is running on http://localhost:5000');
    }
  }
  
  // Test 2: Get Data-Related Jobs
  console.log('\n📋 Test 2: Get Data-Related Jobs');
  console.log('-'.repeat(60));
  try {
    const response = await axios.get(`${API_BASE_URL}/serpapi/jobs/data-roles`, {
      params: {
        location: 'United States',
        num: 20
      }
    });
    
    if (response.data.success) {
      console.log('✅ SUCCESS: Fetched data-related jobs from SerpAPI');
      console.log(`   Total results: ${response.data.count || response.data.data?.length || 0}`);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('\n   Sample job titles:');
        response.data.data.slice(0, 5).forEach((job, index) => {
          console.log(`   ${index + 1}. ${job.title} at ${job.company}`);
        });
      }
    } else {
      console.log('❌ FAILED:', response.data.error);
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ ERROR:', error.response.status, error.response.data?.error || error.response.data?.message);
      if (error.response.data && !error.response.data.error) {
        console.log('   Response data:', JSON.stringify(error.response.data, null, 2));
      }
    } else {
      console.log('❌ ERROR:', error.message);
    }
  }

  // Test 3: Search Remote Jobs (using query instead of location filter)
  console.log('\n📋 Test 3: Search Remote Jobs');
  console.log('-'.repeat(60));
  try {
    const response = await axios.get(`${API_BASE_URL}/serpapi/jobs/search`, {
      params: {
        q: 'data analyst remote',
        // Note: Google Jobs doesn't accept "Remote" as a location parameter
        // Instead, include "remote" in the search query
        num: 5
      }
    });
    
    if (response.data.success) {
      console.log('✅ SUCCESS: Searched remote jobs via SerpAPI');
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
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📝 Next Steps:');
  console.log('1. If tests passed, jobs from SerpAPI will automatically appear in the UI');
  console.log('2. Check browser console (F12) for job fetching logs');
  console.log('3. Navigate to Dashboard to see jobs from database, Adzuna, and SerpAPI');
  console.log('4. Get your SerpAPI key from: https://serpapi.com/dashboard');
  console.log('\n');
}

// Run tests
testSerpAPI().catch(console.error);
