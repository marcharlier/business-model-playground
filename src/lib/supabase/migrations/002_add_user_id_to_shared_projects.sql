-- Migration: Add user_id column to shared_projects table and update RLS policies
-- Description: Migrates shared_projects from using author_avatar (emoji) to user_id (UUID) for ownership checks
-- Run this migration manually in your Supabase SQL Editor

-- Clear existing shared projects (no users to preserve data for)
DELETE FROM shared_projects;

-- Add user_id column to shared_projects table (NOT NULL since we're starting fresh)
ALTER TABLE shared_projects
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_shared_projects_user_id ON shared_projects(user_id);

-- Drop the old RLS policy that checks author_avatar
DROP POLICY IF EXISTS "Only author can update shared projects" ON shared_projects;

-- Create new RLS policy for UPDATE that checks user_id
CREATE POLICY "Only author can update shared projects"
ON "public"."shared_projects"
TO public
USING (
  (user_id = current_setting('app.current_user_id', true)::uuid)
)
WITH CHECK (
  (user_id = current_setting('app.current_user_id', true)::uuid)
);

-- Create/Update RLS policy for DELETE that checks user_id
-- Check existing policies first: SELECT * FROM pg_policies WHERE tablename = 'shared_projects';
-- Adjust policy name if different from "Only author can delete shared projects"
DROP POLICY IF EXISTS "Only author can delete shared projects" ON shared_projects;

CREATE POLICY "Only author can delete shared projects"
ON "public"."shared_projects"
TO public
USING (
  (user_id = current_setting('app.current_user_id', true)::uuid)
);

