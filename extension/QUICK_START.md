# Quick Start Guide - Ankify Chrome Extension

## Prerequisites
- Google Chrome browser
- Ankify account (sign up at your deployed site)
- Node.js and npm (for running the backend locally)

## Step 1: Configure the Extension

1. Open `extension/config.js`
2. Update the configuration with your actual values:

```javascript
const ENV = {
  development: {
    API_URL: 'http://localhost:3000',
    SUPABASE_URL: 'YOUR_SUPABASE_URL_HERE',
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE'
  },
  production: {
    API_URL: 'https://your-deployed-site.vercel.app',
    SUPABASE_URL: 'YOUR_SUPABASE_URL_HERE',
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE'
  }
};
```

**Where to find your credentials:**
- Open your `.env.local` file in the main project
- Copy `NEXT_PUBLIC_SUPABASE_URL` → Use as `SUPABASE_URL`
- Copy `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Use as `SUPABASE_ANON_KEY`

## Step 2: Start Your Backend (Development)

```bash
cd c:\Users\muhsin\Downloads\Ankify
npm run dev
```

Your backend should be running at `http://localhost:3000`

## Step 3: Load Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **"Load unpacked"**
5. Navigate to and select: `c:\Users\muhsin\Downloads\Ankify\extension`
6. The Ankify extension icon should appear in your toolbar!

## Step 4: Sign In

1. Click the Ankify extension icon in your toolbar
2. Click **"Sign In with Ankify"**
3. You'll be redirected to your Ankify site
4. Sign in with your account
5. The extension will automatically detect your authentication

## Step 5: Generate Your First Flashcards

### From YouTube:
1. Navigate to any YouTube video
2. Click the Ankify extension icon
3. The video URL will be auto-detected
4. Click **"Generate Flashcards"**
5. Wait for AI to process (may take 30-60 seconds)
6. Review your flashcards!

### From Text:
1. Navigate to any article or webpage
2. Select some text on the page
3. Click the Ankify extension icon
4. Switch to the **"Text"** tab
5. Click **"Get Selection"**
6. Click **"Generate Flashcards"**
7. Review your flashcards!

## Step 6: Export or Save

- **Export CSV**: Click "Export CSV" to download Anki-compatible file
- **Save to Account**: Click "Save to Account" to store in your dashboard

## Troubleshooting

### Extension won't load
- Make sure you selected the `extension` folder, not a subfolder
- Check Chrome DevTools console for errors
- Verify all files are present in the extension folder

### Can't sign in
- Make sure your backend is running (`npm run dev`)
- Check that `config.js` has correct API_URL
- Verify Supabase credentials are correct
- Try clearing Chrome extension storage: `chrome://extensions/` → Ankify → "Remove"

### Flashcards not generating
- Check that your backend is running
- Verify OpenAI API key is configured in `.env.local`
- Check browser console for error messages
- For YouTube: Make sure video has captions/transcript

### YouTube not detected
- Refresh the YouTube page
- Make sure you're on a video page (not homepage)
- Click "Auto-Detect" button manually

## Production Deployment

When ready to use with your deployed site:

1. Update `config.js`:
   ```javascript
   const getCurrentEnv = () => {
     return 'production'; // Change from 'development'
   };
   ```

2. Reload extension in Chrome:
   - Go to `chrome://extensions/`
   - Click reload icon on Ankify extension

3. Test with your production site

## Need Help?

- Check the full [README.md](file:///c:/Users/muhsin/Downloads/Ankify/extension/README.md)
- Review the [walkthrough.md](file:///C:/Users/muhsin/.gemini/antigravity/brain/e99d2749-98a0-445d-b915-13308ade0093/walkthrough.md)
- Check browser console for errors
- Verify backend API is accessible

---

**Happy Learning! 🎓**
