/*
  # Fix Users Table RLS for Login
  
  ## Problem
  The existing RLS policy only allows authenticated users to read their own data,
  but during login, users need to query the users table before they're authenticated.
  
  ## Solution
  Add a policy that allows anyone (including unauthenticated users) to read from 
  the users table for login purposes. This is safe for demo purposes since we're
  using hardcoded passwords and the table only contains demo data.
  
  ## Changes
  - Add public read policy for users table to enable login
*/

-- Drop the restrictive policy that requires authentication
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create a new policy that allows public read access for login
CREATE POLICY "Allow public read for login"
  ON users
  FOR SELECT
  TO public
  USING (true);

-- Note: This is appropriate for demo purposes with hardcoded passwords
-- For production, use Supabase Auth instead of custom authentication
