-- ============================================================
-- MEENA RAJWADA — RLS Fix (Run this in Supabase SQL Editor)
-- ============================================================

-- 1. Fix is_admin() — add SET search_path so it truly bypasses RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- 2. Add INSERT policy on profiles so signUp upsert works
--    (drop first to avoid duplicate if it already exists)
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. Also allow anon insert (needed briefly before JWT is fully set)
DROP POLICY IF EXISTS "Service insert profile" ON profiles;
CREATE POLICY "Service insert profile"
  ON profiles FOR INSERT TO anon
  WITH CHECK (true);

-- 4. Ensure RLS is enabled on profiles (must be ON, not disabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Confirm your admin row is correct — run this check:
-- SELECT id, full_name, is_admin FROM profiles;
-- If is_admin is false, run:
-- UPDATE profiles SET is_admin = true
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'muakhhir@gmail.com');
