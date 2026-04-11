-- Migration: Change auth from Phone OTP to Email + Password
-- Date: March 2026
-- Reason: Supabase phone provider requires paid SMS provider like Twilio

-- ============================================
-- 1. Alter profiles table: change phone to email
-- ============================================

-- First, drop the unique constraint on phone
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_phone_key;

-- Rename the column from phone to email
ALTER TABLE profiles RENAME COLUMN phone TO email;

-- Change the column type to accommodate email format
ALTER TABLE profiles ALTER COLUMN email TYPE VARCHAR(255);

-- Add unique constraint on email
ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- ============================================
-- 2. Update the handle_new_user function
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'shipper'),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ar')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Note: Existing users will need their phone
-- values migrated. If you have existing data:
-- UPDATE profiles SET email = 'user_' || id || '@migrate.local' WHERE email LIKE '+%';
-- ============================================
