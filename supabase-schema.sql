-- =====================================================
-- NEXUS SOCIAL PLATFORM — SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES
-- =====================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  website TEXT,
  location TEXT,
  verified BOOLEAN DEFAULT FALSE,
  premium BOOLEAN DEFAULT FALSE,
  plan TEXT DEFAULT 'creator' CHECK (plan IN ('creator', 'pro', 'studio')),
  total_earned NUMERIC(12,2) DEFAULT 0,
  available_balance NUMERIC(12,2) DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles visible" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- FOLLOWS
-- =====================================================
CREATE TABLE follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows visible to all" ON follows FOR SELECT USING (TRUE);
CREATE POLICY "Users manage own follows" ON follows FOR ALL USING (auth.uid() = follower_id);

-- Update follower/following counts trigger
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_follow_change AFTER INSERT OR DELETE ON follows FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- =====================================================
-- POSTS
-- =====================================================
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio', NULL)),
  tags TEXT[] DEFAULT '{}',
  is_paid BOOLEAN DEFAULT FALSE,
  price NUMERIC(8,2),
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts visible to all" ON posts FOR SELECT USING (TRUE);
CREATE POLICY "Users manage own posts" ON posts FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- LIKES
-- =====================================================
CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes visible to all" ON likes FOR SELECT USING (TRUE);
CREATE POLICY "Users manage own likes" ON likes FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_change AFTER INSERT OR DELETE ON likes FOR EACH ROW EXECUTE FUNCTION update_like_count();

-- =====================================================
-- COMMENTS
-- =====================================================
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments visible to all" ON comments FOR SELECT USING (TRUE);
CREATE POLICY "Users manage own comments" ON comments FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- STORIES
-- =====================================================
CREATE TABLE stories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  text_overlay TEXT,
  filter TEXT,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stories visible to all" ON stories FOR SELECT USING (expires_at > NOW());
CREATE POLICY "Users manage own stories" ON stories FOR ALL USING (auth.uid() = user_id);

CREATE TABLE story_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- =====================================================
-- CONVERSATIONS & MESSAGES
-- =====================================================
CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'ai')),
  name TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES profiles(id),
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(conversation_id, user_id)
);

CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  is_ai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants see messages" ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id AND cp.user_id = auth.uid()
  ));
CREATE POLICY "Participants send messages" ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- =====================================================
-- LIVE STREAMS
-- =====================================================
CREATE TABLE live_streams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  thumbnail_url TEXT,
  stream_key TEXT UNIQUE DEFAULT uuid_generate_v4()::TEXT,
  status TEXT DEFAULT 'offline' CHECK (status IN ('offline', 'live', 'ended')),
  viewer_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  total_gifts_received NUMERIC(10,2) DEFAULT 0,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Live streams visible to all" ON live_streams FOR SELECT USING (TRUE);
CREATE POLICY "Users manage own streams" ON live_streams FOR ALL USING (auth.uid() = user_id);

CREATE TABLE stream_chat (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- GROUPS
-- =====================================================
CREATE TABLE groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  category TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(group_id, user_id)
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'live', 'gift', 'payment', 'system')),
  content TEXT,
  target_id UUID,
  target_type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- PAYMENTS & GIFTS
-- =====================================================
CREATE TABLE gifts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stream_id UUID REFERENCES live_streams(id) ON DELETE SET NULL,
  gift_type TEXT NOT NULL,
  amount NUMERIC(8,2) NOT NULL,
  platform_fee NUMERIC(8,2) NOT NULL,
  creator_earnings NUMERIC(8,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subscriber_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'standard', 'premium')),
  amount NUMERIC(8,2) NOT NULL,
  platform_fee NUMERIC(8,2) NOT NULL,
  creator_earnings NUMERIC(8,2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(subscriber_id, creator_id)
);

CREATE TABLE withdrawals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- =====================================================
-- REALTIME SUBSCRIPTIONS (enable in Supabase dashboard)
-- =====================================================
-- Enable realtime for: messages, notifications, live_streams, stream_chat, stories

-- =====================================================
-- STORAGE BUCKETS (create in Supabase dashboard)
-- =====================================================
-- avatars     — public, max 5MB, image/*
-- post-media  — public, max 50MB, image/* video/*
-- stories     — public, max 20MB, image/* video/*
-- covers      — public, max 10MB, image/*

-- =====================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    LOWER(SPLIT_PART(NEW.email, '@', 1)) || '_' || FLOOR(RANDOM() * 9999)::TEXT,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
