/**
 * Quick check of jobs count in database
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

supabase
  .from('jobs')
  .select('id, company, title', { count: 'exact' })
  .then(({ data, error, count }) => {
    if (error) {
      console.log('❌ Error:', error.message);
      process.exit(1);
    } else {
      console.log(`✅ Total jobs in database: ${count || data?.length || 0}`);
      if (data && data.length > 0) {
        console.log(`📋 Jobs:`);
        data.slice(0, 10).forEach((job, i) => {
          console.log(`   ${i + 1}. [ID:${job.id}] ${job.company} - ${job.title}`);
        });
      }
      process.exit(0);
    }
  });
