const editor = document.getElementById('editor');
const noteTitle = document.getElementById('note-title');
const AUTO_SAVE_INTERVAL = 3000;
let autoSaveTimer;

// Initialize app when DOM is ready
function initApp() {
    console.log('App initializing...');
    setupAutoSave();
    registerServiceWorker();
}

// Setup auto-save on input (saves to database)
function setupAutoSave() {
    if (editor) {
        editor.addEventListener('input', () => {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                saveNoteToDatabase();
            }, AUTO_SAVE_INTERVAL);
        });
    }
    
    if (noteTitle) {
        noteTitle.addEventListener('input', () => {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                saveNoteToDatabase();
            }, AUTO_SAVE_INTERVAL);
        });
    }
}

// Save note to database
async function saveNoteToDatabase() {
    // Only auto-save if a note is selected
    if (!window.currentNoteId) {
        return;
    }

    const title = (noteTitle?.value || 'Untitled Note').trim();
    const content = editor?.innerHTML || '';

    try {
        const result = await updateNote(window.currentNoteId, title, content);
        if (result) {
            console.log('Note auto-saved to database');
        }
    } catch (error) {
        console.error('Error auto-saving note:', error);
    }
}

// Make saveNoteToDatabase globally accessible
window.saveNoteToDatabase = saveNoteToDatabase;

// Register service worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker error:', err));
    }
}

// Save before leaving page
window.addEventListener('beforeunload', saveNoteToDatabase);

// Run initialization when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}