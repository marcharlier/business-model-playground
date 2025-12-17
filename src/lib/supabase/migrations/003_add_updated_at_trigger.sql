-- Migration: Add trigger to automatically update updated_at timestamp
-- Description: Creates a trigger function and trigger to automatically update the updated_at column
-- when a row in shared_projects is updated

-- Create the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists (to allow re-running the migration)
DROP TRIGGER IF EXISTS update_shared_projects_updated_at ON shared_projects;

-- Create the trigger
CREATE TRIGGER update_shared_projects_updated_at
  BEFORE UPDATE ON shared_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

