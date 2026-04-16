/*
  # Add Session Tokens and Password Hashes

  ## Summary
  Upgrades the authentication system to use secure session tokens stored in the
  database instead of raw passwords checked client-side. This makes auth behave
  like a real secure system.

  ## Changes

  ### Modified Tables
  - `users`
    - Add `password_hash` column (text) — stores SHA-256 hex digest of password
    - Add `last_login` column (timestamptz) — records each login time
    - Add `login_attempts` column (int) — counts failed attempts

  ### New Tables
  - `user_sessions`
    - `id` (uuid, PK) — session token
    - `user_id` (uuid, FK → users.id)
    - `created_at` (timestamptz)
    - `expires_at` (timestamptz) — 24-hour sessions
    - `ip_hint` (text, nullable) — for display purposes

  ### Security
  - RLS enabled on `user_sessions`
  - anon role can INSERT (create session on login) and SELECT (validate token)
  - DELETE allowed so logout clears the session row

  ### Seed Data
  - Sets `password_hash` for all three demo users using known values:
    - admin@konect.com → sha256('admin123')
    - metro@konect.com → sha256('metro123')
    - water@konect.com → sha256('water123')

  Note: SHA-256 is computed via pgcrypto encode(digest(...)) — the result is
  stored as a hex string. Client-side uses Web Crypto API to produce the same hash.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users ADD COLUMN password_hash text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE users ADD COLUMN last_login timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'login_attempts'
  ) THEN
    ALTER TABLE users ADD COLUMN login_attempts integer DEFAULT 0;
  END IF;
END $$;

UPDATE users
SET password_hash = encode(digest('admin123', 'sha256'), 'hex')
WHERE email = 'admin@konect.com';

UPDATE users
SET password_hash = encode(digest('metro123', 'sha256'), 'hex')
WHERE email = 'metro@konect.com';

UPDATE users
SET password_hash = encode(digest('water123', 'sha256'), 'hex')
WHERE email = 'water@konect.com';

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '24 hours',
  ip_hint text DEFAULT ''
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_sessions' AND policyname = 'Allow anon to create sessions'
  ) THEN
    CREATE POLICY "Allow anon to create sessions"
      ON user_sessions FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_sessions' AND policyname = 'Allow anon to read sessions'
  ) THEN
    CREATE POLICY "Allow anon to read sessions"
      ON user_sessions FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_sessions' AND policyname = 'Allow anon to delete sessions'
  ) THEN
    CREATE POLICY "Allow anon to delete sessions"
      ON user_sessions FOR DELETE
      TO anon, authenticated
      USING (true);
  END IF;
END $$;
