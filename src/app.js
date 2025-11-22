const editor = document.getElementById('editor');
const STORAGE_KEY = 'notemaster-content';
const AUTO_SAVE_INTERVAL = 1000;
let autoSaveTimer;

// Initialize app when DOM is ready
function initApp() {
    console.log('App initializing...');
    loadNote();
    setupAutoSave();
    registerServiceWorker();
}

// Load note from localStorage
function loadNote() {
    console.log('Loading note from storage...');
    const savedContent = localStorage.getItem(STORAGE_KEY);
    console.log('Saved content:', savedContent);
    if (savedContent && editor) {
        editor.innerHTML = savedContent;
    }
}

// Setup auto-save on input
function setupAutoSave() {
    if (editor) {
        editor.addEventListener('input', () => {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                saveNote();
            }, AUTO_SAVE_INTERVAL);
        });
    }
}

// Save note to localStorage
function saveNote() {
    if (editor) {
        localStorage.setItem(STORAGE_KEY, editor.innerHTML);
        console.log('Note saved');
    }
}

// Make saveNote globally accessible
window.saveNote = saveNote;
window.autoSaveTimer = autoSaveTimer;

// Register service worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker error:', err));
    }
}

// Save before leaving page
window.addEventListener('beforeunload', saveNote);

// Run initialization when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}