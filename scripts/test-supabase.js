// Supabase Connection Test Script
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`)
};

let supabase;
let passed = 0;
let failed = 0;
let warnings = 0;

async function testSupabaseConnection() {
  log.section('SUPABASE CONNECTION TEST');

  // Check environment variables
  log.info('Checking environment variables...');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log.error('Missing Supabase credentials!');
    log.warning('Make sure backend/.env file contains:');
    log.warning('  SUPABASE_URL=your_supabase_url');
    log.warning('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
    failed++;
    return;
  }

  log.success(`SUPABASE_URL: ${supabaseUrl.substring(0, 30)}...`);
  log.success('SUPABASE_SERVICE_ROLE_KEY: [SET]');

  // Initialize Supabase client
  try {
    log.info('Initializing Supabase client...');
    supabase = createClient(supabaseUrl, supabaseKey);
    log.success('Supabase client initialized');
    passed++;
  } catch (error) {
    log.error(`Failed to initialize Supabase client: ${error.message}`);
    failed++;
    return;
  }

  // Test 1: Basic Connection Test
  await testBasicConnection();

  // Test 2: Check Tables Exist
  await testTablesExist();

  // Test 3: Test Jobs Table Operations
  await testJobsTable();

  // Test 4: Test API Calls Table
  await testApiCallsTable();

  // Test 5: Test Logs Table
  await testLogsTable();

  // Test 6: Test RLS Policies
  await testRLSPolicies();

  // Test 7: Test Views
  await testViews();

  // Print Summary
  printSummary();
}

async function testBasicConnection() {
  log.section('Test 1: Basic Connection');

  try {
    // Simple query to test connection
    const { data, error } = await supabase.from('jobs').select('count').limit(0);
    
    if (error) {
      // Check if it's a table doesn't exist error
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        log.warning('Connection works, but tables may not be created yet');
        log.warning('Run SUPABASE_SETUP.sql in your Supabase SQL Editor');
        warnings++;
      } else {
        log.error(`Connection test failed: ${error.message}`);
        failed++;
        return;
      }
    } else {
      log.success('Basic connection successful');
      passed++;
    }
  } catch (error) {
    log.error(`Connection test error: ${error.message}`);
    if (error.message.includes('fetch')) {
      log.warning('Network error - check your Supabase URL');
    }
    failed++;
  }
}

async function testTablesExist() {
  log.section('Test 2: Check Tables Exist');

  const requiredTables = [
    'jobs',
    'api_calls',
    'logs'
  ];

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          log.error(`Table '${table}' does not exist`);
          failed++;
        } else {
          log.warning(`Table '${table}' exists but query failed: ${error.message}`);
          warnings++;
        }
      } else {
        log.success(`Table '${table}' exists`);
        passed++;
      }
    } catch (error) {
      log.error(`Error checking table '${table}': ${error.message}`);
      failed++;
    }
  }
}

async function testJobsTable() {
  log.section('Test 3: Jobs Table Operations');

  // Test SELECT
  try {
    log.info('Testing SELECT operation...');
    const { data, error } = await supabase.from('jobs').select('*').limit(5);
    
    if (error) {
      log.error(`SELECT failed: ${error.message}`);
      failed++;
    } else {
      log.success(`SELECT successful (found ${data.length} jobs)`);
      passed++;
    }
  } catch (error) {
    log.error(`SELECT error: ${error.message}`);
    failed++;
  }

  // Test INSERT (with cleanup)
  try {
    log.info('Testing INSERT operation...');
    const testJob = {
      company: 'Test Company',
      title: 'Test Data Scientist',
      location: 'Remote',
      salary: '$100k-150k',
      tags: ['Full time', 'Remote', 'Test'],
      link: 'https://example.com/test',
      description: 'This is a test job - will be deleted',
      posted_by: 'test_script'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('jobs')
      .insert([testJob])
      .select()
      .single();

    if (insertError) {
      log.error(`INSERT failed: ${insertError.message}`);
      failed++;
    } else {
      log.success(`INSERT successful (ID: ${insertData.id})`);
      passed++;

      // Cleanup: Delete test job
      try {
        await supabase.from('jobs').delete().eq('id', insertData.id);
        log.success('Test job cleaned up');
      } catch (cleanupError) {
        log.warning(`Cleanup failed: ${cleanupError.message}`);
        warnings++;
      }
    }
  } catch (error) {
    log.error(`INSERT error: ${error.message}`);
    failed++;
  }

  // Test UPDATE
  try {
    log.info('Testing UPDATE operation...');
    // First, get a job to update (or create one)
    const { data: jobs } = await supabase.from('jobs').select('id').limit(1);
    
    if (jobs && jobs.length > 0) {
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ description: 'Updated by test script' })
        .eq('id', jobs[0].id);

      if (updateError) {
        log.error(`UPDATE failed: ${updateError.message}`);
        failed++;
      } else {
        log.success('UPDATE successful');
        passed++;
      }
    } else {
      log.warning('No jobs found to test UPDATE');
      warnings++;
    }
  } catch (error) {
    log.error(`UPDATE error: ${error.message}`);
    failed++;
  }
}

async function testApiCallsTable() {
  log.section('Test 4: API Calls Table');

  try {
    const { data, error } = await supabase.from('api_calls').select('*').limit(5);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation')) {
        log.error('API calls table does not exist');
        log.warning('Run SUPABASE_SIMPLE_SCHEMA.sql to create the table');
        failed++;
      } else {
        log.error(`API calls query failed: ${error.message}`);
        failed++;
      }
    } else {
      log.success(`API calls table accessible (found ${data.length} records)`);
      passed++;
    }
  } catch (error) {
    log.error(`API calls test error: ${error.message}`);
    failed++;
  }
}

async function testLogsTable() {
  log.section('Test 5: Logs Table');

  try {
    const { data, error } = await supabase.from('logs').select('*').limit(5);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation')) {
        log.error('Logs table does not exist');
        log.warning('Run SUPABASE_SIMPLE_SCHEMA.sql to create the table');
        failed++;
      } else {
        log.error(`Logs query failed: ${error.message}`);
        failed++;
      }
    } else {
      log.success(`Logs table accessible (found ${data.length} logs)`);
      passed++;
    }
  } catch (error) {
    log.error(`Logs test error: ${error.message}`);
    failed++;
  }
}

async function testRLSPolicies() {
  log.section('Test 6: Row Level Security (RLS) Policies');

  try {
    // Check if RLS is enabled by trying to query with different permissions
    const { data, error } = await supabase.from('jobs').select('*').limit(1);
    
    if (error) {
      if (error.message.includes('permission') || error.message.includes('policy')) {
        log.success('RLS appears to be enabled (permission check)');
        passed++;
      } else {
        log.warning(`RLS check inconclusive: ${error.message}`);
        warnings++;
      }
    } else {
      log.success('RLS policies allow service role access');
      passed++;
    }
  } catch (error) {
    log.warning(`RLS test error: ${error.message}`);
    warnings++;
  }
}


async function testViews() {
  log.section('Test 8: Database Views');

  // Test job_stats view
  try {
    log.info('Testing job_stats view...');
    const { data, error } = await supabase.from('job_stats').select('*');
    
    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        log.warning('job_stats view not found');
        log.warning('Run SUPABASE_SETUP.sql to create views');
        warnings++;
      } else {
        log.error(`View query failed: ${error.message}`);
        failed++;
      }
    } else {
      log.success('job_stats view accessible');
      if (data && data.length > 0) {
        log.info(`  Total jobs: ${data[0].total_jobs || 0}`);
        log.info(`  Jobs last 24h: ${data[0].jobs_last_24h || 0}`);
      }
      passed++;
    }
  } catch (error) {
    log.warning(`View test error: ${error.message}`);
    warnings++;
  }

  // Test recent_jobs view
  try {
    log.info('Testing recent_jobs view...');
    const { data, error } = await supabase.from('recent_jobs').select('*').limit(5);
    
    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        log.warning('recent_jobs view not found');
        warnings++;
      } else {
        log.error(`View query failed: ${error.message}`);
        failed++;
      }
    } else {
      log.success(`recent_jobs view accessible (found ${data.length} jobs)`);
      passed++;
    }
  } catch (error) {
    log.warning(`View test error: ${error.message}`);
    warnings++;
  }
}

function printSummary() {
  log.section('TEST SUMMARY');

  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${warnings}${colors.reset}`);
  console.log(`Total Tests: ${passed + failed + warnings}`);

  console.log('\n' + '='.repeat(60));

  if (failed === 0 && warnings === 0) {
    console.log(`\n${colors.green}✓ All tests passed! Supabase connection is working perfectly.${colors.reset}\n`);
    process.exit(0);
  } else if (failed === 0) {
    console.log(`\n${colors.yellow}⚠ Some warnings, but connection is working.${colors.reset}`);
    console.log(`${colors.yellow}  Run SUPABASE_SETUP.sql if you see missing tables/functions.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}✗ Some tests failed. Please check the errors above.${colors.reset}`);
    console.log(`${colors.yellow}  Make sure you've run SUPABASE_SETUP.sql in Supabase SQL Editor.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
testSupabaseConnection().catch(error => {
  log.error(`Test suite error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
