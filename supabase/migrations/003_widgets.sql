-- Run this in Supabase SQL Editor (after 002_rls_with_check.sql)
-- Widget platform: per-user dashboard layout + notes, habits, quick links,
-- and cached AI daily briefs.

-- Per-user widget layout: ordered array of { id, enabled }. NULL = default.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dashboard_layout JSONB;

-- Scratchpad: one note blob per user
CREATE TABLE IF NOT EXISTS notes (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_checks (
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  check_date DATE NOT NULL,
  PRIMARY KEY (habit_id, check_date)
);

CREATE TABLE IF NOT EXISTS quick_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One AI-generated brief per user per day (server writes via user session)
CREATE TABLE IF NOT EXISTS briefs (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brief_date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, brief_date)
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notes" ON notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own habits" ON habits
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own habit checks" ON habit_checks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own quick links" ON quick_links
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own briefs" ON briefs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
