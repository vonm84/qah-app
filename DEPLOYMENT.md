# Deployment Guide - GitHub Pages

This guide will help you deploy your Choir Management System to GitHub Pages.

## Prerequisites

- You have completed the Supabase setup (see SUPABASE_SETUP.md)
- You have a GitHub account
- The app works locally on your computer

## Step 1: Create a GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. Fill in the repository details:
   - **Repository name**: `qah-app` (this will be part of your URL)
   - **Description**: "Choir Management System"
   - **Public or Private**: Choose Public (required for free GitHub Pages)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click "Create repository"

## Step 2: Add Supabase Secrets to GitHub

1. In your new GitHub repository, go to **Settings** > **Secrets and variables** > **Actions**
2. Click "New repository secret"
3. Add the first secret:
   - **Name**: `VITE_SUPABASE_URL`
   - **Secret**: Paste your Supabase project URL (from your .env file)
   - Click "Add secret"
4. Click "New repository secret" again
5. Add the second secret:
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Secret**: Paste your Supabase anon key (from your .env file)
   - Click "Add secret"

## Step 3: Enable GitHub Pages

1. In your repository, go to **Settings** > **Pages**
2. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
3. Click "Save"

## Step 4: Push Your Code to GitHub

Open your terminal and navigate to the `choir-management` folder, then run:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Choir Management System"

# Add your GitHub repository as remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/qah-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 5: Wait for Deployment

1. Go to your repository on GitHub
2. Click on the **Actions** tab
3. You should see a workflow running called "Deploy to GitHub Pages"
4. Wait for it to complete (usually 1-2 minutes)
5. Once it shows a green checkmark, your site is deployed!

## Step 6: Access Your Site

Your site will be available at:
```
https://YOUR-USERNAME.github.io/qah-app/
```

Replace `YOUR-USERNAME` with your actual GitHub username.

## Updating Your Site

Whenever you make changes to your code:

1. Save your changes
2. Run these commands in your terminal:
   ```bash
   git add .
   git commit -m "Description of your changes"
   git push
   ```
3. GitHub Actions will automatically rebuild and redeploy your site
4. Wait 1-2 minutes for the changes to go live

## Adding a Custom Domain (Optional)

If you want a custom domain like `choirmanagement.com` instead of `username.github.io/qah-app`:

1. Purchase a domain from a registrar (Namecheap, Google Domains, etc.) - usually $10-15/year
2. In your repository **Settings** > **Pages**:
   - Enter your custom domain
   - Click "Save"
3. In your domain registrar's DNS settings, add these records:
   - Type: `A`, Host: `@`, Value: `185.199.108.153`
   - Type: `A`, Host: `@`, Value: `185.199.109.153`
   - Type: `A`, Host: `@`, Value: `185.199.110.153`
   - Type: `A`, Host: `@`, Value: `185.199.111.153`
   - Type: `CNAME`, Host: `www`, Value: `YOUR-USERNAME.github.io`

4. Wait 24-48 hours for DNS propagation
5. Enable "Enforce HTTPS" in GitHub Pages settings

## Troubleshooting

### Deployment fails with "Build error"
- Check the Actions tab for detailed error logs
- Make sure your secrets are correctly set in GitHub
- Try building locally with `npm run build` to catch any errors

### Site shows blank page
- Check browser console (F12) for errors
- Verify the Supabase credentials are correct in GitHub Secrets
- Make sure `base: '/qah-app/'` is set in `vite.config.js`

### 404 error
- Make sure GitHub Pages is enabled and set to "GitHub Actions"
- Check that the workflow completed successfully
- Wait a few minutes and try again

### Changes not appearing
- Wait 1-2 minutes after pushing for GitHub Actions to rebuild
- Try hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Check Actions tab to ensure deployment completed

## Environment Variables for Production

If you need to update your Supabase credentials:

1. Go to repository **Settings** > **Secrets and variables** > **Actions**
2. Click on the secret name to edit it
3. Update the value
4. Save
5. Re-run the last deployment in the Actions tab, or push a new commit

---

**Your app is now live!** Share the URL with your choir members and get started.
