// Background service worker for Manifest V3
// Handles authentication state sync and background tasks

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Ankify extension installed!');

        // Open welcome page
        chrome.tabs.create({
            url: 'https://ankify-ai.vercel.app'
        });
    }
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'youtubeNavigated') {
        // Handle YouTube navigation
        console.log('YouTube navigated to:', request.url);
    } else if (request.action === 'checkAuth') {
        // Check authentication status
        chrome.storage.local.get(['supabase_auth'], (result) => {
            sendResponse({
                authenticated: !!result.supabase_auth?.access_token,
                user: result.supabase_auth?.user
            });
        });
        return true; // Keep channel open for async response
    } else if (request.action === 'syncAuth') {
        // Receive auth data from content script
        const { auth } = request;
        if (auth && auth.access_token) {
            chrome.storage.local.set({
                supabase_auth: {
                    access_token: auth.access_token,
                    user: auth.user,
                    expires_at: Math.floor(Date.now() / 1000) + 3600 // Assume valid for 1h for safety
                }
            }, () => {
                console.log('Auth synced from web app via content script');
            });
        }
    }
});

// Listen for auth state changes from the main website
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.supabase_auth) {
        console.log('Auth state changed:', changes.supabase_auth.newValue ? 'Signed in' : 'Signed out');

        // Notify all open popups about auth change
        chrome.runtime.sendMessage({
            action: 'authStateChanged',
            authenticated: !!changes.supabase_auth.newValue
        }).catch(() => {
            // Popup might not be open, ignore error
        });
    }
});

// Handle token refresh (if needed)
async function refreshAuthToken() {
    try {
        const result = await chrome.storage.local.get(['supabase_auth']);
        const auth = result.supabase_auth;

        if (!auth || !auth.refresh_token) {
            return;
        }

        // Check if token is about to expire (within 5 minutes)
        const expiresAt = auth.expires_at;
        const now = Math.floor(Date.now() / 1000);

        if (expiresAt - now < 300) {
            // Token is expiring soon, refresh it
            // This would call your backend's refresh endpoint
            console.log('Token refresh needed');

            // For now, we'll rely on Supabase's auto-refresh
            // which happens in the main app
        }
    } catch (error) {
        console.error('Token refresh error:', error);
    }
}

// Check token every 5 minutes
setInterval(refreshAuthToken, 5 * 60 * 1000);

// Context menu for quick flashcard generation (optional)
chrome.contextMenus.create({
    id: 'generateFromSelection',
    title: 'Generate Flashcards from Selection',
    contexts: ['selection']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'generateFromSelection') {
        // Store selected text
        chrome.storage.local.set({
            lastSelectedText: info.selectionText,
            quickGenerate: true
        });

        // Open popup (this will auto-trigger generation)
        chrome.action.openPopup();
    }
});
