-- =====================================================
-- NEXUS ADMIN SCHEMA — Run in Supabase SQL Editor
-- =====================================================

-- Add is_admin flag to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;

-- Admin audit log
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view logs" ON admin_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Admins can insert logs" ON admin_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Reports table (users reporting content)
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'user', 'comment', 'stream')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can manage reports" ON reports FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Platform analytics snapshot (daily)
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE UNIQUE,
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  new_posts INTEGER DEFAULT 0,
  total_streams INTEGER DEFAULT 0,
  total_gifts_value NUMERIC(12,2) DEFAULT 0,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view snapshots" ON analytics_snapshots FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Make yourself admin (replace with your user UUID from auth.users)
-- UPDATE profiles SET is_admin = TRUE WHERE username = 'your_username';

-- Realtime for admin
-- Enable realtime on: reports, admin_logs, analytics_snapshots
