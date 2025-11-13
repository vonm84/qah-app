# Choir Management System

A bilingual (English/Portuguese) web application for managing choir rehearsals, parts, and attendance with a simplified member interface (mobile-optimized) and leader dashboard (desktop-optimized).

## Features

### For Members
- **Your Parts**: Declare which part you sing for each song and your readiness level
- **Attendance**: Mark your attendance for upcoming rehearsals
- **Overall View**: See what everyone else is singing in a color-coded grid

### For Leaders
- **Upcoming Rehearsals**: See who's coming to each rehearsal and what parts they're singing
- **Overall View**: Same grid view as members
- **Manage**: Add/remove members, configure songs, enable/disable rehearsal dates

### General Features
- Bilingual support (English/Portuguese)
- Mobile-first design for members
- Desktop-optimized for leaders
- Real-time data sync with Supabase
- Color-coded readiness levels
- Comment system for parts and attendance

## Tech Stack

- **Frontend**: React + Vite
- **Database**: Supabase (PostgreSQL)
- **Hosting**: GitHub Pages
- **Styling**: Custom CSS (mobile-responsive)

## Getting Started

### 1. Clone or Download This Project

```bash
git clone https://github.com/YOUR-USERNAME/qah-app.git
cd qah-app
npm install
```

### 2. Set Up Supabase

Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create a Supabase account
- Set up your database
- Get your API credentials
- Configure your local environment

### 3. Run Locally

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

**Login credentials:**
- Password: `cccedofeita`
- Username: `Admin` (for leader access)

### 4. Deploy to GitHub Pages

Follow the instructions in [DEPLOYMENT.md](./DEPLOYMENT.md) to:
- Create a GitHub repository
- Set up GitHub Secrets
- Deploy to GitHub Pages
- Access your live site

## Project Structure

```
choir-management/
├── src/
│   ├── components/           # React components
│   │   ├── member/          # Member interface tabs
│   │   ├── leader/          # Leader interface views
│   │   └── ...
│   ├── contexts/            # React contexts (Auth, Language)
│   ├── config/              # Configuration files
│   │   ├── translations.json
│   │   ├── readinessLevels.js
│   │   └── constants.js
│   └── lib/                 # Supabase client setup
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions for deployment
├── SUPABASE_SETUP.md       # Database setup guide
├── DEPLOYMENT.md           # Deployment guide
└── README.md               # This file
```

## Configuration

### Site Password
Edit `src/config/constants.js` to change the site password:
```javascript
export const SITE_PASSWORD = 'your-password-here';
```

### Readiness Levels
Edit `src/config/readinessLevels.js` to customize levels and colors.

### Translations
Edit `src/config/translations.json` to add or modify UI translations.

### Songs
Songs are managed through the Leader Dashboard's "Manage > Songs" section. You can edit them as CSV format directly in the app.

## Usage

### For Members

1. Open the app URL
2. Enter the site password (first time only)
3. Choose your language
4. Enter your name
5. Navigate using the tabs:
   - **Your Parts**: Select your part and readiness for each song
   - **Attendance**: Mark Yes/No/Maybe for upcoming rehearsals
   - **Overall View**: See everyone's parts and readiness levels

### For Leaders

1. Log in with username "Admin"
2. Use the three main views:
   - **Upcoming Rehearsals**: See who's coming and what they're singing
   - **Overall View**: See the full choir grid
   - **Manage**: Add members, configure songs, enable/disable dates

## Customization

### Changing Colors
Edit the readiness level colors in `src/config/readinessLevels.js`:
```javascript
{
  id: 1,
  en: 'Performance Ready',
  pt: 'Pronto para Apresentação',
  color: '#4A90E2'  // Change this
}
```

### Adding Songs
As a leader, go to Manage > Songs and edit the CSV format:
```
Song Name,Part1_Long,Part1_Short,Part2_Long,Part2_Short,...
Ave Maria,Soprano,S,Alto,A,Tenor,T,Bass,B
```

### Changing Rehearsal Day
Edit `src/config/constants.js`:
```javascript
export const REHEARSAL_DAY = 2; // 0=Sunday, 1=Monday, 2=Tuesday, etc.
```

## Troubleshooting

### App won't connect to database
- Check that your `.env` file has the correct Supabase credentials
- Restart the dev server after creating/editing `.env`
- Verify your Supabase project is active

### Login not working
- Verify the password in `src/config/constants.js`
- Check browser console (F12) for errors
- Ensure Supabase tables are created correctly

### Deployment issues
- Check GitHub Actions logs in the Actions tab
- Verify GitHub Secrets are set correctly
- Ensure repository is public for free GitHub Pages

## License

This project is provided as-is for choir management purposes.

## Support

For issues or questions:
1. Check the browser console (F12) for error messages
2. Review the setup guides (SUPABASE_SETUP.md, DEPLOYMENT.md)
3. Check your Supabase dashboard for database errors

---

Built with React, Vite, and Supabase
