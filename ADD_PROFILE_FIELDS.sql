-- Add profile fields to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS pronouns_en TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS pronouns_pt TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS status TEXT;
