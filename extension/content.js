// Content script - Runs on all web pages
// Handles text selection and page content extraction

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelection') {
        const selectedText = window.getSelection().toString();
        sendResponse({ text: selectedText });
    } else if (request.action === 'getPageText') {
        const pageText = document.body.innerText;
        sendResponse({ text: pageText });
    } else if (request.action === 'getVideoInfo') {
        // Extract YouTube video information
        if (window.location.hostname.includes('youtube.com')) {
            const videoTitle = document.querySelector('h1.title')?.textContent ||
                document.querySelector('meta[name="title"]')?.content ||
                document.title;
            const videoUrl = window.location.href;

            sendResponse({
                isYouTube: true,
                title: videoTitle,
                url: videoUrl
            });
        } else {
            sendResponse({ isYouTube: false });
        }
    }

    return true; // Keep message channel open for async response
});

// Detect YouTube video changes (for single-page app navigation)
if (window.location.hostname.includes('youtube.com')) {
    let lastUrl = location.href;

    new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;

            // Notify background script of URL change
            chrome.runtime.sendMessage({
                action: 'youtubeNavigated',
                url: currentUrl
            });
        }
    }).observe(document.body, { childList: true, subtree: true });
}

// Add context menu support (optional - for right-click "Generate Flashcards")
document.addEventListener('mouseup', () => {
    const selectedText = window.getSelection().toString();
    if (selectedText.trim().length > 0) {
        // Store selected text for quick access
        chrome.storage.local.set({ lastSelectedText: selectedText });
    }
});

// Auth Sync Listener
// Listens for auth changes from the main web app
const isAnkifySite = window.location.hostname.includes('ankify-ai.vercel.app') ||
    window.location.hostname.includes('localhost') ||
    window.location.hostname.includes('ankify');

if (isAnkifySite) {
    // Check immediately on load
    checkAndSyncAuth();

    // Listen for storage changes (real-time sync)
    window.addEventListener('storage', (e) => {
        if (e.key === 'ankify_extension_sync') {
            checkAndSyncAuth();
        }
    });

    // Poll for changes (fixes race condition where content script loads before app hydrates)
    // Check every second for 30 seconds
    let attempts = 0;
    const interval = setInterval(() => {
        checkAndSyncAuth();
        attempts++;
        if (attempts > 30) clearInterval(interval);
    }, 1000);
}

function checkAndSyncAuth() {
    try {
        const rawAuth = localStorage.getItem('ankify_extension_sync');
        if (rawAuth) {
            const authData = JSON.parse(rawAuth);

            // Send to background script
            chrome.runtime.sendMessage({
                action: 'syncAuth',
                auth: authData
            });
        }
    } catch (e) {
        console.error('Error syncing auth:', e);
    }
}
