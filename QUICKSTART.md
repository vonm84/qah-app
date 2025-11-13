# Quick Start Guide

Get your Choir Management System up and running in 10 minutes!

## Step 1: Set Up Supabase (5 minutes)

1. **Go to** [supabase.com](https://supabase.com) and sign up
2. **Create a new project**:
   - Name: `choir-management`
   - Create a strong database password (save it!)
   - Choose your region
3. **Run the database setup**:
   - Click **SQL Editor** in the sidebar
   - Click "New query"
   - Open `SUPABASE_SETUP.md` and copy the SQL code
   - Paste and click "Run"
4. **Get your credentials**:
   - Click **Settings** (gear icon) > **API**
   - Copy your **Project URL**
   - Copy your **anon public key**

## Step 2: Configure Locally (2 minutes)

1. **Create `.env` file** in the `choir-management` folder:
   ```
   VITE_SUPABASE_URL=paste-your-project-url-here
   VITE_SUPABASE_ANON_KEY=paste-your-anon-key-here
   ```
2. **Save the file**

## Step 3: Run Locally (1 minute)

Open terminal in the `choir-management` folder:

```bash
npm run dev
```

Open browser to: `http://localhost:5173`

**Login with:**
- Password: `cccedofeita`
- Language: English or Português
- Name: `Admin`

You should see the Leader Dashboard!

## Step 4: Test It Out (2 minutes)

1. **Add a member**:
   - Go to "Manage" > "Members"
   - Add a test member (e.g., "Mary")

2. **Check songs**:
   - Go to "Manage" > "Songs"
   - You should see 3 sample songs already configured

3. **Log out and log in as a member**:
   - Click the ×  button to log out
   - Log in as "Mary"
   - See the Member Interface!

## Next Steps

When you're ready to deploy:
1. Follow `DEPLOYMENT.md` to deploy to GitHub Pages
2. Share the URL with your choir members
3. Give them the password: `cccedofeita`

## Need Help?

Check the full documentation:
- **SUPABASE_SETUP.md** - Detailed database setup
- **DEPLOYMENT.md** - Deploy to the web
- **README.md** - Full project documentation

---

**That's it!** You're ready to manage your choir. 🎵
