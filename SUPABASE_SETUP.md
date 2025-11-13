# Supabase Setup Guide

Follow these steps to set up your Supabase database for the Choir Management System.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with your email or GitHub account
4. Verify your email if required

## Step 2: Create a New Project

1. Once logged in, click "New Project"
2. Fill in the details:
   - **Name**: `choir-management` (or any name you prefer)
   - **Database Password**: Create a strong password and **save it somewhere safe**
   - **Region**: Choose the region closest to you
3. Click "Create new project"
4. Wait 1-2 minutes for your database to be provisioned

## Step 3: Create Database Tables

1. In your Supabase project dashboard, click on the **SQL Editor** icon in the left sidebar
2. Click "New query"
3. Copy and paste the entire SQL code below
4. Click "Run" to execute it

```sql
-- Create members table
CREATE TABLE members (
  name TEXT PRIMARY KEY,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create songs table
CREATE TABLE songs (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  parts JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create part_assignments table
CREATE TABLE part_assignments (
  id BIGSERIAL PRIMARY KEY,
  member_name TEXT NOT NULL REFERENCES members(name) ON DELETE CASCADE,
  song_id BIGINT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  part TEXT,
  readiness_level INTEGER,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_name, song_id)
);

-- Create attendance table
CREATE TABLE attendance (
  id BIGSERIAL PRIMARY KEY,
  member_name TEXT NOT NULL REFERENCES members(name) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('yes', 'no', 'maybe')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_name, date)
);

-- Create rehearsal_dates table
CREATE TABLE rehearsal_dates (
  date DATE PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_part_assignments_member ON part_assignments(member_name);
CREATE INDEX idx_part_assignments_song ON part_assignments(song_id);
CREATE INDEX idx_attendance_member ON attendance(member_name);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_rehearsal_dates_enabled ON rehearsal_dates(enabled);

-- Insert some sample data (optional - you can delete this section if you want to start fresh)
INSERT INTO members (name, language) VALUES
  ('Admin', 'en');

INSERT INTO songs (name, parts) VALUES
  ('Ave Maria', '[{"long":"Soprano","short":"S"},{"long":"Alto","short":"A"},{"long":"Tenor","short":"T"},{"long":"Bass","short":"B"}]'),
  ('Garota de Ipanema', '[{"long":"Voice 1","short":"V1"},{"long":"Voice 2","short":"V2"},{"long":"Voice 3","short":"V3"}]'),
  ('O Magnum Mysterium', '[{"long":"Soprano","short":"S"},{"long":"Alto","short":"A"},{"long":"Tenor","short":"T"},{"long":"Bass","short":"B"}]');
```

## Step 4: Enable Row Level Security (Optional but Recommended)

By default, Supabase has Row Level Security (RLS) disabled. For this simple app with a site password, we can leave it disabled for now. If you want to add RLS for extra security:

1. Go to **Authentication** > **Policies**
2. For each table, click "Enable RLS"
3. Add policies to allow all operations (since we're handling auth in the app)

For now, **you can skip this step**.

## Step 5: Get Your API Credentials

1. Click on the **Settings** icon (gear) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL**: Something like `https://abcdefghijk.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`

4. **Copy both of these values** - you'll need them in the next step

## Step 6: Configure Your Local Environment

1. In your project folder (`choir-management`), create a file called `.env`
2. Add the following content (replace with your actual values):

```
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

3. Save the file

**IMPORTANT**: Make sure `.env` is in your `.gitignore` file so you don't accidentally commit your credentials to GitHub.

## Step 7: Test Your Setup

1. In your terminal, navigate to the `choir-management` folder:
   ```bash
   cd choir-management
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the URL shown (usually `http://localhost:5173`)

4. Try logging in:
   - Password: `cccedofeita`
   - Choose English or Portuguese
   - Enter name: `Admin`

5. You should see the Leader Dashboard!

## Troubleshooting

### "Invalid API key" or connection errors
- Double-check that you copied the correct URL and anon key
- Make sure there are no extra spaces in your `.env` file
- Restart the dev server after creating/editing `.env`

### Tables not created
- Make sure you ran the entire SQL script in the SQL Editor
- Check for any error messages in the SQL Editor

### Can't log in
- Check the browser console for error messages (F12)
- Verify your `.env` file has the correct credentials

## What's Next?

Once your database is set up and the app is running locally, you're ready to:
1. Add more choir members through the Admin interface
2. Configure your songs in the "Manage Songs" section
3. Prepare for deployment to GitHub Pages

---

**Need Help?**
If you encounter any issues, check:
- Supabase project dashboard for database errors
- Browser console (F12) for JavaScript errors
- Terminal for build errors
