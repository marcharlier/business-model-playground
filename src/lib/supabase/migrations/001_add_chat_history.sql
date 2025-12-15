-- Migration: Add chat_history column to user_projects table
-- Description: Stores AI chat conversation history per project
-- Run this migration manually in your Supabase SQL Editor

-- Add chat_history JSONB column to user_projects table
ALTER TABLE user_projects
ADD COLUMN IF NOT EXISTS chat_history JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the column
COMMENT ON COLUMN user_projects.chat_history IS 'Stores AI chat conversation history following UIMessage format from AI SDK';

-- Create an index for better query performance when filtering by chat_history content
-- This is optional but can help if you need to search within chat history
CREATE INDEX IF NOT EXISTS idx_user_projects_chat_history ON user_projects USING gin (chat_history);
