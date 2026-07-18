-- Run this in Supabase SQL Editor (after 001_initial.sql)
--
-- Hardening: the UPDATE policies in 001 only had USING clauses. Without a
-- WITH CHECK clause, a user could UPDATE a row they own and set user_id to
-- another user's id (e.g. via the anon-key client from the browser). WITH
-- CHECK re-validates the row *after* the update so ownership can't change.

ALTER POLICY "Users can update own profile"
  ON profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

ALTER POLICY "Users can update own tasks"
  ON tasks
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER POLICY "Users can update own integrations"
  ON integrations
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
