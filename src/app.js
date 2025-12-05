const editor = document.getElementById('editor');
const noteTitle = document.getElementById('note-title');
const AUTO_SAVE_INTERVAL = 3000;
let autoSaveTimer;

// Initialize app when DOM is ready
function initApp() {
    console.log('App initializing...');
    setupAutoSave();
    registerServiceWorker();
    setupOnlineOfflineHandling();
}

// Setup online/offline event handling
function setupOnlineOfflineHandling() {
    const statusIndicator = document.getElementById('status-indicator');
    
    window.addEventListener('online', async () => {
        console.log('App is now online');
        if (statusIndicator) {
            statusIndicator.classList.remove('offline');
            statusIndicator.classList.add('online');
            statusIndicator.querySelector('.status-text').textContent = 'Online';
        }
        await syncPendingChanges();
        // Reload notes from server
        await window.loadNotesList?.();
    });
    
    window.addEventListener('offline', () => {
        console.log('App is now offline');
        if (statusIndicator) {
            statusIndicator.classList.remove('online');
            statusIndicator.classList.add('offline');
            statusIndicator.querySelector('.status-text').textContent = 'Offline';
        }
    });
    
    // Set initial status
    if (statusIndicator) {
        if (navigator.onLine) {
            statusIndicator.classList.add('online');
        } else {
            statusIndicator.classList.add('offline');
            statusIndicator.querySelector('.status-text').textContent = 'Offline';
        }
    }
}

// Sync pending changes when coming online
async function syncPendingChanges() {
    try {
        const cachedNotes = window.getNotesFromCache?.() || [];
        for (const note of cachedNotes) {
            if (note.pending) {
                if (note.id > Date.now() - 86400000) { // Created in last 24 hours
                    // Try to create on server
                    await createNote(note.title, note.content);
                } else {
                    // Try to update on server
                    await updateNote(note.id, note.title, note.content);
                }
            }
        }
        console.log('Pending changes synced');
    } catch (error) {
        console.error('Error syncing pending changes:', error);
    }
}

// Show notification
function showNotification(message) {
    console.log('Notification:', message);
    // You can add a toast notification here
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