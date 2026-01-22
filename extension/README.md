# Ankify Chrome Extension

Transform YouTube videos and web content into AI-powered flashcards instantly with the Ankify Chrome Extension.

## Features

- 🎥 **YouTube Integration**: Auto-detect YouTube videos and generate flashcards from transcripts
- 📝 **Text Selection**: Select any text on a webpage to create flashcards
- 🌐 **Full Page Extraction**: Convert entire articles into study materials
- 🔐 **Seamless Auth**: Uses your existing Ankify account
- 💾 **Save to Account**: Store flashcard sets in your Ankify dashboard
- 📥 **Anki Export**: Download flashcards as CSV for Anki import
- 🎨 **Beautiful UI**: Matches the main Ankify site design
- ⚡ **Fast & Efficient**: Lightweight extension with instant generation

## Installation

### Load Unpacked (Development)

1. **Download or Clone** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"**
5. **Select** the `extension` folder from this repository
6. The Ankify extension icon should appear in your toolbar!

### Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store soon.

## Setup

### Configure API Endpoints

Before using the extension, you need to configure the API endpoints:

1. Open `extension/config.js`
2. Update the configuration:

```javascript
const ENV = {
  development: {
    API_URL: 'http://localhost:3000',
    SUPABASE_URL: 'your-supabase-url',
    SUPABASE_ANON_KEY: 'your-anon-key'
  },
  production: {
    API_URL: 'https://your-domain.vercel.app',
    SUPABASE_URL: 'your-supabase-url',
    SUPABASE_ANON_KEY: 'your-anon-key'
  }
};
```

3. Change the `getCurrentEnv()` function to return `'production'` when deploying

### Get Your API Credentials

You can find your Supabase credentials in your `.env.local` file:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Usage

### 1. Sign In

- Click the Ankify extension icon in your toolbar
- Click "Sign In with Ankify"
- You'll be redirected to the main Ankify site to authenticate
- Once signed in, return to the extension

### 2. Generate Flashcards from YouTube

- Navigate to any YouTube video
- Click the Ankify extension icon
- The video URL will be auto-detected
- Click "Generate Flashcards"
- Wait for AI to process the transcript
- Review and export your flashcards!

### 3. Generate Flashcards from Text

- Navigate to any webpage with text content
- Select text on the page (or use full page extraction)
- Click the Ankify extension icon
- Switch to the "Text" tab
- Click "Get Selection" or "Get Full Page"
- Click "Generate Flashcards"
- Review and export your flashcards!

### 4. Save & Export

- **Save to Account**: Store flashcard sets in your Ankify dashboard for later access
- **Export CSV**: Download as Anki-compatible CSV file for immediate import

## Architecture

### File Structure

```
extension/
├── manifest.json          # Extension configuration (Manifest V3)
├── popup.html            # Extension popup UI
├── popup.js              # Main popup logic
├── content.js            # Content script for page interaction
├── background.js         # Service worker for background tasks
├── styles.css            # Extension styling
├── config.js             # Environment configuration
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### How It Works

1. **Authentication**: Uses Supabase Auth with JWT tokens stored in Chrome storage
2. **API Communication**: Calls the same backend APIs as the main website
3. **Content Extraction**: Content script extracts text/video info from active tab
4. **Flashcard Generation**: Sends content to `/api/generate-flashcards`
5. **Storage**: Optionally saves to user account via `/api/save-flashcards`
6. **Export**: Generates Anki-compatible CSV files

### API Endpoints Used

- `POST /api/generate-flashcards` - Generate flashcards from text/YouTube
- `POST /api/save-flashcards` - Save flashcard set to user account
- Supabase Auth endpoints for authentication

## Development

### Testing Locally

1. Make sure your local Ankify backend is running (`npm run dev`)
2. Set `config.js` to use development environment
3. Load the extension in Chrome
4. Test all features with localhost API

### Switching Environments

Edit `extension/config.js`:

```javascript
const getCurrentEnv = () => {
  return 'development'; // or 'production'
};
```

### Debugging

- Open Chrome DevTools for the popup: Right-click extension icon → "Inspect popup"
- View background script logs: Go to `chrome://extensions/` → Click "service worker"
- Check content script logs: Open DevTools on any webpage

## Publishing to Chrome Web Store

### Prerequisites

1. **Google Developer Account** ($5 one-time fee)
2. **Privacy Policy URL**
3. **Promotional Images**:
   - 128x128 icon (provided)
   - 440x280 small tile
   - 1400x560 marquee
4. **Screenshots** (1280x800 or 640x400)

### Steps

1. **Prepare Package**:
   - Update `manifest.json` version
   - Set production API URLs in `config.js`
   - Test thoroughly
   - Create ZIP of extension folder

2. **Upload to Chrome Web Store**:
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Click "New Item"
   - Upload ZIP file
   - Fill in store listing details
   - Add screenshots and promotional images
   - Submit for review

3. **Review Process**:
   - Typically takes 1-3 business days
   - Address any feedback from Google
   - Once approved, extension goes live!

## Security & Privacy

- **No Data Collection**: Extension doesn't collect or store user data
- **Secure Auth**: Uses JWT tokens with secure storage
- **HTTPS Only**: All API calls use HTTPS
- **No Inline Scripts**: CSP compliant for security
- **Minimal Permissions**: Only requests necessary permissions

## Troubleshooting

### Extension Won't Load
- Make sure Developer Mode is enabled
- Check console for errors
- Verify all files are present

### Can't Sign In
- Check that API_URL is correct in config.js
- Verify Supabase credentials are valid
- Clear extension storage and try again

### Flashcards Not Generating
- Check network tab for API errors
- Verify OpenAI API key is configured on backend
- Ensure content has sufficient text

### YouTube Detection Not Working
- Refresh the YouTube page
- Make sure you're on a video page (not homepage)
- Try clicking "Auto-Detect" button

## Support

For issues or questions:
1. Check this README
2. Review the main Ankify documentation
3. Open an issue on GitHub
4. Contact support through the main website

## License

This extension is part of the Ankify project and follows the same license.

---

**Happy Learning! 🎓**
