-- ============================================
-- DataJobPortal Supabase Database Setup
-- ============================================
-- Run these queries in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT DEFAULT 'Not specified',
  salary TEXT DEFAULT 'Not specified',
  company_logo TEXT,
  tags TEXT[] DEFAULT '{}',
  link TEXT NOT NULL,
  description TEXT DEFAULT '',
  work_location TEXT DEFAULT 'Remote',
  experience TEXT DEFAULT 'Middle',
  working_schedule TEXT DEFAULT 'Full time',
  employment_type TEXT DEFAULT 'Full day',
  posted_by TEXT DEFAULT 'Anonymous',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for jobs table
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs(title);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_tags ON jobs USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON jobs(posted_by);

-- ============================================
-- 2. MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ============================================
-- 3. CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id BIGSERIAL PRIMARY KEY,
  user1_id TEXT NOT NULL,
  user2_id TEXT NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- ============================================
-- 4. USER PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  name TEXT,
  title TEXT,
  company TEXT,
  location TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ============================================
-- 5. API CALLS TRACKING (for admin stats)
-- ============================================
CREATE TABLE IF NOT EXISTS api_calls (
  id BIGSERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL,
  method TEXT DEFAULT 'GET',
  status_code INTEGER DEFAULT 200,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for API calls
CREATE INDEX IF NOT EXISTS idx_api_calls_endpoint ON api_calls(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_calls_created_at ON api_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_calls_user ON api_calls(user_id);

-- ============================================
-- 6. PAGE VIEWS TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  page TEXT NOT NULL,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for page views
CREATE INDEX IF NOT EXISTS idx_page_views_page ON page_views(page);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);

-- ============================================
-- 7. JOB APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS job_applications (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT REFERENCES jobs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, reviewed, accepted, rejected
  cover_letter TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for applications
CREATE INDEX IF NOT EXISTS idx_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON job_applications(status);

-- ============================================
-- 8. SAVED JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saved_jobs (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT REFERENCES jobs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- Index for saved jobs
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job ON saved_jobs(job_id);

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Jobs: Public read, authenticated write
CREATE POLICY "Jobs are viewable by everyone"
  ON jobs FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid()::text = posted_by OR auth.role() = 'service_role');

-- Messages: Users can only see their own messages
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (
    auth.uid()::text = sender_id OR 
    auth.uid()::text = receiver_id
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid()::text = sender_id);

-- Conversations: Users can see their own conversations
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid()::text = user1_id OR 
    auth.uid()::text = user2_id
  );

-- User Profiles: Users can view all, edit own
CREATE POLICY "User profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Job Applications: Users can see their own applications
CREATE POLICY "Users can view their own applications"
  ON job_applications FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create applications"
  ON job_applications FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Saved Jobs: Users can see their own saved jobs
CREATE POLICY "Users can view their own saved jobs"
  ON saved_jobs FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can save jobs"
  ON saved_jobs FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can unsave jobs"
  ON saved_jobs FOR DELETE
  USING (auth.uid()::text = user_id);

-- API Calls and Page Views: Service role only (for admin stats)
CREATE POLICY "Service role can manage API calls"
  ON api_calls FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage page views"
  ON page_views FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 10. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update conversation when message is sent
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message = NEW.message_text,
    last_message_at = NEW.created_at,
    unread_count = CASE 
      WHEN NEW.receiver_id = user1_id THEN unread_count + 1
      WHEN NEW.receiver_id = user2_id THEN unread_count + 1
      ELSE unread_count
    END,
    updated_at = NOW()
  WHERE (user1_id = NEW.sender_id AND user2_id = NEW.receiver_id)
     OR (user1_id = NEW.receiver_id AND user2_id = NEW.sender_id);
  
  -- Create conversation if it doesn't exist
  INSERT INTO conversations (user1_id, user2_id, last_message, last_message_at)
  VALUES (
    LEAST(NEW.sender_id, NEW.receiver_id),
    GREATEST(NEW.sender_id, NEW.receiver_id),
    NEW.message_text,
    NEW.created_at
  )
  ON CONFLICT (user1_id, user2_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for messages
CREATE TRIGGER trigger_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- ============================================
-- 11. SAMPLE DATA (Mock Job Data for UI Testing)
-- ============================================

-- Insert comprehensive mock job data
INSERT INTO jobs (company, title, location, salary, company_logo, tags, link, description, work_location, experience, working_schedule, employment_type, posted_by, created_at)
VALUES 
  -- Recent jobs (last 24 hours)
  (
    'Amazon',
    'Senior Data Engineer',
    'San Francisco, CA',
    '$125k-180k/year',
    'A',
    ARRAY['Full time', 'Senior level', 'Remote', 'Project work'],
    'https://www.amazon.jobs/en/jobs/123456',
    'We are looking for an experienced Data Engineer to design and build scalable data pipelines. You will work with large-scale distributed systems and collaborate with cross-functional teams.',
    'Remote',
    'Senior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'Google',
    'Junior Data Analyst',
    'Mountain View, CA',
    '$90k-120k/year',
    'G',
    ARRAY['Full time', 'Junior level', 'Remote', 'Project work', 'Flexible schedule'],
    'https://careers.google.com/jobs/123456',
    'Entry-level position for data analysis. Perfect for recent graduates interested in working with big data and analytics tools.',
    'Remote',
    'Junior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '5 hours'
  ),
  (
    'Microsoft',
    'Senior Data Scientist',
    'Seattle, WA',
    '$140k-200k/year',
    'M',
    ARRAY['Full time', 'Senior level', 'Full Day'],
    'https://careers.microsoft.com/jobs/123456',
    'Senior role in data science and machine learning. Lead ML projects and mentor junior data scientists.',
    'On-site',
    'Senior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '8 hours'
  ),
  (
    'Meta',
    'Data Analyst',
    'Menlo Park, CA',
    '$110k-150k/year',
    'f',
    ARRAY['Full time', 'Middle level', 'Remote', 'Project work'],
    'https://www.metacareers.com/jobs/123456',
    'Analyze user behavior data and provide insights to product teams. Work with SQL, Python, and data visualization tools.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '12 hours'
  ),
  (
    'Netflix',
    'Data Engineer',
    'Los Gatos, CA',
    '$130k-180k/year',
    'N',
    ARRAY['Full time', 'Senior level', 'Remote'],
    'https://jobs.netflix.com/jobs/123456',
    'Build and maintain data infrastructure for content analytics. Experience with Spark, Airflow, and cloud platforms required.',
    'Remote',
    'Senior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '18 hours'
  ),
  -- Jobs from last week
  (
    'Apple',
    'Data Architect',
    'Cupertino, CA',
    '$150k-220k/year',
    '🍎',
    ARRAY['Full time', 'Senior level', 'Remote'],
    'https://jobs.apple.com/jobs/123456',
    'Design and implement data architecture solutions. Lead technical decisions and work with engineering teams.',
    'Remote',
    'Senior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '2 days'
  ),
  (
    'Tesla',
    'Machine Learning Engineer',
    'Palo Alto, CA',
    '$135k-190k/year',
    'T',
    ARRAY['Full time', 'Senior level', 'Remote'],
    'https://www.tesla.com/careers/jobs/123456',
    'Develop ML models for autonomous driving and energy optimization. Strong background in deep learning required.',
    'Remote',
    'Senior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '3 days'
  ),
  (
    'IBM',
    'Business Intelligence Analyst',
    'Armonk, NY',
    '$100k-140k/year',
    'IBM',
    ARRAY['Full time', 'Middle level', 'Remote', 'Flexible schedule'],
    'https://www.ibm.com/careers/jobs/123456',
    'Create dashboards and reports for business stakeholders. Experience with Tableau, Power BI, or similar tools.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '4 days'
  ),
  (
    'Oracle',
    'Database Administrator',
    'Austin, TX',
    '$120k-160k/year',
    'O',
    ARRAY['Full time', 'Senior level', 'Full Day'],
    'https://www.oracle.com/careers/jobs/123456',
    'Manage and optimize Oracle databases. Ensure high availability and performance of database systems.',
    'On-site',
    'Senior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '5 days'
  ),
  (
    'Salesforce',
    'Data Scientist',
    'San Francisco, CA',
    '$130k-180k/year',
    'S',
    ARRAY['Full time', 'Middle level', 'Remote'],
    'https://www.salesforce.com/careers/jobs/123456',
    'Apply statistical methods and machine learning to solve business problems. Work with large datasets and cloud platforms.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '6 days'
  ),
  -- More diverse jobs
  (
    'Spotify',
    'Data Engineer',
    'New York, NY',
    '$125k-170k/year',
    'S',
    ARRAY['Full time', 'Middle level', 'Remote', 'Flexible schedule'],
    'https://www.lifeatspotify.com/jobs/123456',
    'Build data pipelines for music analytics. Work with real-time streaming data and batch processing systems.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '7 days'
  ),
  (
    'Uber',
    'Senior Data Analyst',
    'San Francisco, CA',
    '$115k-160k/year',
    'U',
    ARRAY['Full time', 'Senior level', 'Remote'],
    'https://www.uber.com/careers/jobs/123456',
    'Analyze ride-sharing data to improve operations. Create reports and dashboards for business intelligence.',
    'Remote',
    'Senior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '8 days'
  ),
  (
    'Airbnb',
    'Data Engineer',
    'San Francisco, CA',
    '$130k-180k/year',
    'A',
    ARRAY['Full time', 'Middle level', 'Remote'],
    'https://careers.airbnb.com/jobs/123456',
    'Design and maintain data infrastructure for marketplace analytics. Experience with distributed systems required.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '9 days'
  ),
  (
    'LinkedIn',
    'Data Scientist',
    'Sunnyvale, CA',
    '$140k-200k/year',
    'L',
    ARRAY['Full time', 'Senior level', 'Remote'],
    'https://www.linkedin.com/jobs/view/123456',
    'Develop ML models for recommendation systems. Work with large-scale data and production systems.',
    'Remote',
    'Senior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '10 days'
  ),
  (
    'Twitter',
    'Data Analyst',
    'San Francisco, CA',
    '$105k-145k/year',
    'T',
    ARRAY['Full time', 'Middle level', 'Remote'],
    'https://careers.twitter.com/jobs/123456',
    'Analyze social media data and user engagement metrics. Create insights for product and engineering teams.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '11 days'
  ),
  (
    'Adobe',
    'Machine Learning Engineer',
    'San Jose, CA',
    '$135k-190k/year',
    'A',
    ARRAY['Full time', 'Senior level', 'Remote'],
    'https://www.adobe.com/careers/jobs/123456',
    'Build ML models for creative tools and marketing platforms. Experience with computer vision and NLP preferred.',
    'Remote',
    'Senior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '12 days'
  ),
  (
    'Intel',
    'Data Architect',
    'Santa Clara, CA',
    '$145k-210k/year',
    'I',
    ARRAY['Full time', 'Senior level', 'On-site'],
    'https://www.intel.com/careers/jobs/123456',
    'Design data architecture for semiconductor manufacturing. Lead data strategy and technical architecture decisions.',
    'On-site',
    'Senior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '13 days'
  ),
  (
    'NVIDIA',
    'Data Scientist',
    'Santa Clara, CA',
    '$140k-200k/year',
    'N',
    ARRAY['Full time', 'Senior level', 'Remote'],
    'https://www.nvidia.com/careers/jobs/123456',
    'Apply deep learning and AI to solve complex problems. Work with GPU computing and large-scale neural networks.',
    'Remote',
    'Senior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '14 days'
  ),
  (
    'Palantir',
    'Data Engineer',
    'Denver, CO',
    '$130k-180k/year',
    'P',
    ARRAY['Full time', 'Middle level', 'Remote'],
    'https://www.palantir.com/careers/jobs/123456',
    'Build data platforms for government and enterprise clients. Work with sensitive data and security requirements.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '15 days'
  ),
  (
    'Databricks',
    'Senior Data Engineer',
    'San Francisco, CA',
    '$145k-210k/year',
    'D',
    ARRAY['Full time', 'Senior level', 'Remote'],
    'https://www.databricks.com/careers/jobs/123456',
    'Build data engineering solutions using Apache Spark. Help customers implement modern data architectures.',
    'Remote',
    'Senior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '16 days'
  ),
  (
    'Snowflake',
    'Data Engineer',
    'San Mateo, CA',
    '$135k-185k/year',
    'S',
    ARRAY['Full time', 'Middle level', 'Remote'],
    'https://careers.snowflake.com/jobs/123456',
    'Design and implement data solutions using Snowflake platform. Work with cloud data warehousing technologies.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '17 days'
  ),
  (
    'Stripe',
    'Data Analyst',
    'San Francisco, CA',
    '$110k-150k/year',
    'S',
    ARRAY['Full time', 'Middle level', 'Remote'],
    'https://stripe.com/jobs/123456',
    'Analyze payment and financial data. Create insights to improve product and business operations.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '18 days'
  ),
  (
    'Coinbase',
    'Data Scientist',
    'San Francisco, CA',
    '$135k-190k/year',
    'C',
    ARRAY['Full time', 'Senior level', 'Remote'],
    'https://www.coinbase.com/careers/jobs/123456',
    'Apply ML to cryptocurrency and blockchain data. Build models for fraud detection and trading insights.',
    'Remote',
    'Senior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '19 days'
  ),
  (
    'Zoom',
    'Data Engineer',
    'San Jose, CA',
    '$125k-170k/year',
    'Z',
    ARRAY['Full time', 'Middle level', 'Remote'],
    'https://zoom.us/careers/jobs/123456',
    'Build data infrastructure for video conferencing analytics. Work with real-time streaming and batch data.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '20 days'
  ),
  (
    'Shopify',
    'Data Analyst',
    'Ottawa, ON',
    '$100k-140k/year',
    'S',
    ARRAY['Full time', 'Middle level', 'Remote', 'Flexible schedule'],
    'https://www.shopify.com/careers/jobs/123456',
    'Analyze e-commerce data to help merchants succeed. Create dashboards and reports for business intelligence.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '21 days'
  ),
  (
    'Reddit',
    'Data Scientist',
    'San Francisco, CA',
    '$130k-180k/year',
    'R',
    ARRAY['Full time', 'Middle level', 'Remote'],
    'https://www.redditinc.com/careers/jobs/123456',
    'Apply ML to improve content recommendations and user experience. Work with large-scale social media data.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '22 days'
  ),
  (
    'Pinterest',
    'Machine Learning Engineer',
    'San Francisco, CA',
    '$140k-200k/year',
    'P',
    ARRAY['Full time', 'Senior level', 'Remote'],
    'https://www.pinterestcareers.com/jobs/123456',
    'Build recommendation systems and ML models for visual discovery. Experience with computer vision preferred.',
    'Remote',
    'Senior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '23 days'
  ),
  (
    'Snapchat',
    'Data Engineer',
    'Santa Monica, CA',
    '$125k-175k/year',
    'S',
    ARRAY['Full time', 'Middle level', 'Remote'],
    'https://www.snap.com/careers/jobs/123456',
    'Build data pipelines for social media analytics. Work with real-time data and large-scale systems.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '24 days'
  ),
  (
    'TikTok',
    'Data Scientist',
    'Los Angeles, CA',
    '$135k-190k/year',
    'T',
    ARRAY['Full time', 'Senior level', 'Remote'],
    'https://careers.tiktok.com/jobs/123456',
    'Develop ML models for video recommendation and content understanding. Work with massive-scale data.',
    'Remote',
    'Senior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '25 days'
  ),
  (
    'GitHub',
    'Data Analyst',
    'San Francisco, CA',
    '$110k-150k/year',
    'G',
    ARRAY['Full time', 'Middle level', 'Remote'],
    'https://github.com/careers/jobs/123456',
    'Analyze developer activity and platform usage data. Create insights to improve developer experience.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '26 days'
  ),
  (
    'MongoDB',
    'Data Engineer',
    'New York, NY',
    '$130k-180k/year',
    'M',
    ARRAY['Full time', 'Middle level', 'Remote'],
    'https://www.mongodb.com/careers/jobs/123456',
    'Build data infrastructure using MongoDB and modern data stack. Design scalable data architectures.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '27 days'
  ),
  (
    'Elastic',
    'Data Scientist',
    'Mountain View, CA',
    '$135k-190k/year',
    'E',
    ARRAY['Full time', 'Senior level', 'Remote'],
    'https://www.elastic.co/careers/jobs/123456',
    'Apply ML to search and analytics platforms. Work with Elasticsearch and large-scale data systems.',
    'Remote',
    'Senior',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '28 days'
  ),
  (
    'Atlassian',
    'Data Analyst',
    'San Francisco, CA',
    '$105k-145k/year',
    'A',
    ARRAY['Full time', 'Middle level', 'Remote', 'Flexible schedule'],
    'https://www.atlassian.com/careers/jobs/123456',
    'Analyze product usage data for Jira and Confluence. Create insights to improve team collaboration tools.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '29 days'
  ),
  (
    'Slack',
    'Data Engineer',
    'San Francisco, CA',
    '$130k-180k/year',
    'S',
    ARRAY['Full time', 'Middle level', 'Remote'],
    'https://slack.com/careers/jobs/123456',
    'Build data infrastructure for workplace communication analytics. Work with real-time messaging data.',
    'Remote',
    'Middle',
    'Full time',
    'Full Day',
    'admin',
    NOW() - INTERVAL '30 days'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- 12. VIEWS (for easier queries)
-- ============================================

-- View for job statistics
CREATE OR REPLACE VIEW job_stats AS
SELECT 
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as jobs_last_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as jobs_last_7d,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as jobs_last_30d,
  COUNT(DISTINCT company) as unique_companies,
  COUNT(DISTINCT posted_by) as unique_posters
FROM jobs;

-- View for recent jobs
CREATE OR REPLACE VIEW recent_jobs AS
SELECT 
  id,
  company,
  title,
  location,
  salary,
  tags,
  created_at,
  posted_by
FROM jobs
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 13. HELPER FUNCTIONS
-- ============================================

-- Function to get jobs by company
CREATE OR REPLACE FUNCTION get_jobs_by_company()
RETURNS TABLE(company TEXT, job_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.company,
    COUNT(*)::BIGINT as job_count
  FROM jobs j
  GROUP BY j.company
  ORDER BY job_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get top job posters
CREATE OR REPLACE FUNCTION get_top_posters(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(poster TEXT, job_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.posted_by as poster,
    COUNT(*)::BIGINT as job_count
  FROM jobs j
  GROUP BY j.posted_by
  ORDER BY job_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your Supabase database is now ready to use.
-- 
-- Next steps:
-- 1. Verify tables were created in Supabase Dashboard
-- 2. Test RLS policies
-- 3. Update your .env file with Supabase credentials
-- 4. Test the API endpoints
-- ============================================
