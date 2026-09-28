// Popup.js - Main extension logic
const API_URL = window.ANKIFY_CONFIG?.API_URL || 'http://localhost:3000';

// State management
let currentUser = null;
let currentFlashcards = [];
let currentVideoUrl = null;
let selectedText = '';

// DOM Elements
const elements = {
    authSection: document.getElementById('authSection'),
    mainContent: document.getElementById('mainContent'),
    signInBtn: document.getElementById('signInBtn'),
    signOutBtn: document.getElementById('signOutBtn'),
    userEmail: document.getElementById('userEmail'),
    userPlan: document.getElementById('userPlan'),

    youtubeDetected: document.getElementById('youtubeDetected'),
    textDetected: document.getElementById('textDetected'),
    videoTitle: document.getElementById('videoTitle'),

    tabYoutube: document.getElementById('tabYoutube'),
    tabText: document.getElementById('tabText'),
    youtubeInput: document.getElementById('youtubeInput'),
    textInput: document.getElementById('textInput'),

    youtubeUrl: document.getElementById('youtubeUrl'),
    textContent: document.getElementById('textContent'),
    detectVideoBtn: document.getElementById('detectVideoBtn'),
    getSelectionBtn: document.getElementById('getSelectionBtn'),
    getPageTextBtn: document.getElementById('getPageTextBtn'),

    generateBtn: document.getElementById('generateBtn'),
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    errorMessage: document.getElementById('errorMessage'),
    dismissErrorBtn: document.getElementById('dismissErrorBtn'),

    flashcardsSection: document.getElementById('flashcardsSection'),
    flashcardsList: document.getElementById('flashcardsList'),
    cardCount: document.getElementById('cardCount'),
    saveToAccountBtn: document.getElementById('saveToAccountBtn'),
    exportBtn: document.getElementById('exportBtn'),

    upgradeCTA: document.getElementById('upgradeCTA'),
    upgradeBtn: document.getElementById('upgradeBtn')
};

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthStatus();
    setupEventListeners();
    detectCurrentPage();

    // Auto-refresh: Check if auth was recently synced (within last 30 seconds)
    // This helps when user completes OAuth in web app and reopens extension
    const result = await chrome.storage.local.get(['supabase_auth']);
    if (result.supabase_auth) {
        const authAge = Date.now() / 1000 - (result.supabase_auth.expires_at - 3600);
        if (authAge < 30) {
            console.log('Recent auth detected, refreshing UI...');
            await checkAuthStatus();
        }
    }
});

// Check authentication status
async function checkAuthStatus() {
    try {
        const result = await chrome.storage.local.get(['supabase_auth']);

        if (result.supabase_auth && result.supabase_auth.access_token) {
            currentUser = result.supabase_auth.user;
            showMainContent();
            await loadUserSubscription();
        } else {
            showAuthSection();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showAuthSection();
    }
}

// Show/Hide sections
function showAuthSection() {
    elements.authSection.style.display = 'flex';
    elements.mainContent.style.display = 'none';
}

function showMainContent() {
    elements.authSection.style.display = 'none';
    elements.mainContent.style.display = 'block';

    if (currentUser) {
        elements.userEmail.textContent = currentUser.email;
    }
}

// Load user subscription
async function loadUserSubscription() {
    try {
        const result = await chrome.storage.local.get(['supabase_auth']);
        const token = result.supabase_auth?.access_token;

        if (!token) return;

        // Query Supabase for subscription status
        const response = await fetch(`${API_URL}/api/user-subscription`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.subscription) {
                elements.userPlan.textContent = data.subscription.plan_name || 'Free Plan';
            }
        }
    } catch (error) {
        console.error('Error loading subscription:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Auth form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleDirectSignIn);
    }

    // Sign up link
    const signUpLink = document.getElementById('signUpLink');
    if (signUpLink) {
        signUpLink.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: `${API_URL}/auth?mode=signup` });
        });
    }

    // Google Sign In
    const googleBtn = document.getElementById('googleSignInBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleSignIn);
    }

    elements.signOutBtn.addEventListener('click', handleSignOut);

    // Tab switching
    elements.tabYoutube.addEventListener('click', () => switchTab('youtube'));
    elements.tabText.addEventListener('click', () => switchTab('text'));

    // Input actions
    elements.detectVideoBtn.addEventListener('click', detectVideoFromTab);
    elements.getSelectionBtn.addEventListener('click', getSelectedText);
    elements.getPageTextBtn.addEventListener('click', getFullPageText);

    // Generate flashcards
    elements.generateBtn.addEventListener('click', generateFlashcards);

    // Flashcard actions
    elements.saveToAccountBtn.addEventListener('click', saveToAccount);
    elements.exportBtn.addEventListener('click', exportToCSV);

    // Error dismiss
    elements.dismissErrorBtn.addEventListener('click', hideError);

    // Upgrade
    elements.upgradeBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: `${API_URL}/#plans` });
    });
}

// Google Sign-In Handler
async function handleGoogleSignIn() {
    try {
        // Instead of using chrome.identity (which requires complex OAuth setup),
        // we'll open the web app's auth page in a new tab
        // The user will sign in there, and the extension will sync the session
        chrome.tabs.create({
            url: `${API_URL}/auth?provider=google&extension=true`
        });

        // Show helpful message
        showError('✓ Opening sign-in page... Complete sign-in in the new tab, then close and reopen this extension.');

    } catch (error) {
        console.error('Google Sign-In Error:', error);
        showError('Failed to open sign-in page: ' + error.message);
    }
}

// Handle direct sign in
async function handleDirectSignIn(e) {
    if (e) e.preventDefault();

    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    const btn = document.getElementById('signInBtn');

    if (!email || !password) {
        showError('Please enter both email and password');
        return;
    }

    try {
        // Show loading state
        btn.disabled = true;
        btn.textContent = 'Signing in...';
        hideError();

        // Direct call to Supabase Auth API
        const response = await fetch(`${window.ANKIFY_CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'apikey': window.ANKIFY_CONFIG.SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error_description || data.msg || 'Login failed');
        }

        // Store session
        const session = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            user: data.user,
            expires_at: Math.floor(Date.now() / 1000) + data.expires_in
        };

        // Save to storage
        await new Promise((resolve) => {
            chrome.storage.local.set({
                supabase_auth: session
            }, resolve);
        });

        // Update state
        currentUser = data.user;
        showMainContent();
        await loadUserSubscription();

    } catch (error) {
        console.error('Login error:', error);
        showError(error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Sign In';
    }
}

// Handle sign out
async function handleSignOut() {
    await chrome.storage.local.remove(['supabase_auth']);
    currentUser = null;
    currentFlashcards = [];
    showAuthSection();
}

// Switch tabs
function switchTab(tab) {
    if (tab === 'youtube') {
        elements.tabYoutube.classList.add('active');
        elements.tabText.classList.remove('active');
        elements.youtubeInput.style.display = 'flex';
        elements.textInput.style.display = 'none';
    } else {
        elements.tabText.classList.add('active');
        elements.tabYoutube.classList.remove('active');
        elements.textInput.style.display = 'flex';
        elements.youtubeInput.style.display = 'none';
    }
}

// Detect current page
async function detectCurrentPage() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab) return;

        // Check if YouTube
        if (tab.url && (tab.url.includes('youtube.com/watch') || tab.url.includes('youtu.be/'))) {
            currentVideoUrl = tab.url;
            elements.youtubeDetected.style.display = 'flex';
            elements.videoTitle.textContent = tab.title || 'YouTube Video';
            elements.youtubeUrl.value = tab.url;
        } else {
            elements.textDetected.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error detecting page:', error);
    }
}

// Detect video from current tab
async function detectVideoFromTab() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab.url && (tab.url.includes('youtube.com/watch') || tab.url.includes('youtu.be/'))) {
            elements.youtubeUrl.value = tab.url;
            currentVideoUrl = tab.url;
        } else {
            showError('Please navigate to a YouTube video page first.');
        }
    } catch (error) {
        showError('Failed to detect video: ' + error.message);
    }
}

// Get selected text from page
async function getSelectedText() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => window.getSelection().toString()
        });

        const text = results[0]?.result || '';

        if (text.trim()) {
            elements.textContent.value = text;
            selectedText = text;
        } else {
            showError('No text selected. Please select some text on the page first.');
        }
    } catch (error) {
        showError('Failed to get selected text: ' + error.message);
    }
}

// Get full page text
async function getFullPageText() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.body.innerText
        });

        const text = results[0]?.result || '';

        if (text.trim()) {
            elements.textContent.value = text;
        } else {
            showError('No text found on the page.');
        }
    } catch (error) {
        showError('Failed to get page text: ' + error.message);
    }
}

// Generate flashcards
async function generateFlashcards() {
    try {
        hideError();
        elements.flashcardsSection.style.display = 'none';

        // Get input based on active tab
        let type, value;

        if (elements.tabYoutube.classList.contains('active')) {
            type = 'youtube';
            value = elements.youtubeUrl.value.trim();

            if (!value) {
                showError('Please enter a YouTube URL.');
                return;
            }
        } else {
            type = 'text';
            value = elements.textContent.value.trim();

            if (!value) {
                showError('Please enter some text.');
                return;
            }
        }

        // Show loading
        elements.generateBtn.style.display = 'none';
        elements.loadingState.style.display = 'block';

        // Get auth token if available
        const authResult = await chrome.storage.local.get(['supabase_auth']);
        const token = authResult.supabase_auth?.access_token;

        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Call API
        const response = await fetch(`${API_URL}/api/generate-flashcards`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ type, value })
        });

        const data = await response.json();

        if (response.status === 403 && data.error && data.error.includes('limit')) {
            // Show upgrade CTA
            elements.flashcardsSection.style.display = 'none';
            elements.upgradeCTA.style.display = 'flex';
            elements.loadingState.style.display = 'none';
            return; // Stop here
        }

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate flashcards');
        }



        // Parse flashcards
        const flashcardsText = data.result;
        currentFlashcards = parseFlashcards(flashcardsText);

        if (currentFlashcards.length === 0) {
            throw new Error('No flashcards were generated. Please try different content.');
        }

        // Display flashcards
        displayFlashcards();

    } catch (error) {
        showError(error.message);
    } finally {
        elements.loadingState.style.display = 'none';
        elements.generateBtn.style.display = 'flex';
    }
}

// Parse flashcards from pipe-separated format
function parseFlashcards(text) {
    const lines = text.split('\n').filter(line => line.trim() && line.includes('|'));

    return lines.map(line => {
        const [question, answer] = line.split('|').map(s => s.trim());
        return { question, answer };
    }).filter(card => card.question && card.answer);
}

// Display flashcards
function displayFlashcards() {
    elements.flashcardsList.innerHTML = '';
    elements.cardCount.textContent = currentFlashcards.length;

    currentFlashcards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'flashcard';
        cardElement.innerHTML = `
      <div class="flashcard-question">Q: ${escapeHtml(card.question)}</div>
      <div class="flashcard-answer">A: ${escapeHtml(card.answer)}</div>
    `;

        elements.flashcardsList.appendChild(cardElement);
    });

    elements.flashcardsSection.style.display = 'block';
}

// Save to account
async function saveToAccount() {
    try {
        const result = await chrome.storage.local.get(['supabase_auth']);
        const token = result.supabase_auth?.access_token;
        const userId = result.supabase_auth?.user?.id;

        if (!token || !userId) {
            showError('Please sign in to save flashcards.');
            return;
        }

        if (currentFlashcards.length === 0) {
            showError('No flashcards to save.');
            return;
        }

        // Prompt for title
        const title = prompt('Enter a title for this flashcard set:');
        if (!title) return;

        const description = prompt('Enter a description (optional):') || '';

        // Show loading
        elements.saveToAccountBtn.disabled = true;
        elements.saveToAccountBtn.textContent = 'Saving...';

        // Call save API
        const response = await fetch(`${API_URL}/api/save-flashcards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description,
                flashcards: currentFlashcards,
                userId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to save flashcards');
        }

        alert('Flashcards saved successfully! View them in your dashboard.');

    } catch (error) {
        showError(error.message);
    } finally {
        elements.saveToAccountBtn.disabled = false;
        elements.saveToAccountBtn.innerHTML = `
      <svg class="btn-icon-left" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
      </svg>
      Save to Account
    `;
    }
}

// Export to CSV
function exportToCSV() {
    if (currentFlashcards.length === 0) {
        showError('No flashcards to export.');
        return;
    }

    // Create CSV content
    let csv = '';
    currentFlashcards.forEach(card => {
        // Escape quotes and wrap in quotes
        const question = `"${card.question.replace(/"/g, '""')}"`;
        const answer = `"${card.answer.replace(/"/g, '""')}"`;
        csv += `${question},${answer}\n`;
    });

    // Create download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ankify-flashcards-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Show error
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorState.style.display = 'block';
}

// Hide error
function hideError() {
    elements.errorState.style.display = 'none';
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
