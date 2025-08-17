-- Add consent tracking to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_location boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_privacy boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_parental boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_verification boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_date timestamp with time zone;