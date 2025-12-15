const editor = document.getElementById('editor');
const noteTitle = document.getElementById('note-title');
const AUTO_SAVE_INTERVAL = 3000; // 3 seconds
let autoSaveTimer;
let lastSavedContent = '';
let lastSavedTitle = '';

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
}

// Setup auto-save on input (saves to database)
function setupAutoSave() {
    if (!editor || !noteTitle) {
        console.warn('Editor or note title element not found');
        return;
    }

    // Auto-save on editor input
    editor.addEventListener('input', () => {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            saveNoteToDatabase();
        }, AUTO_SAVE_INTERVAL);
    });
    
    // Auto-save on title input
    noteTitle.addEventListener('input', () => {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            saveNoteToDatabase();
        }, AUTO_SAVE_INTERVAL);
    });

    // Save when editor loses focus
    editor.addEventListener('blur', () => {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            saveNoteToDatabase();
        }, 500);
    });

    // Save title on change
    noteTitle.addEventListener('change', () => {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            saveNoteToDatabase();
        }, 500);
    });
}

// Save note to database
async function saveNoteToDatabase() {
    // Only auto-save if a note is selected
    if (!window.currentNoteId) {
        return;
    }

    const title = (noteTitle?.value || 'Untitled Note').trim();
    const content = editor?.innerHTML || '';

    // Don't save if nothing changed
    if (title === lastSavedTitle && content === lastSavedContent) {
        console.log('No changes detected, skipping save');
        return true; // Return true to indicate no error, even though nothing saved
    }

    try {
        console.log('Auto-saving note:', window.currentNoteId);
        console.log('Title:', title);
        console.log('Content:', content);
        const result = await updateNote(window.currentNoteId, title, content);
        if (result) {
            lastSavedContent = content;
            lastSavedTitle = title;
            console.log('Note auto-saved successfully');
            console.log('Result:', result);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error auto-saving note:', error);
        return false;
    }
}

// Explicit save function that bypasses change detection
// Used when user manually clicks the Save button
async function saveNoteExplicitly() {
    console.log('=== SAVE BUTTON CLICKED ===');
    console.log('window.currentNoteId:', window.currentNoteId);
    
    if (!window.currentNoteId) {
        console.warn('No note selected, cannot save');
        return false;
    }

    // Get fresh references to DOM elements
    const titleInput = document.getElementById('note-title');
    const editorDiv = document.getElementById('editor');
    
    console.log('titleInput element:', titleInput);
    console.log('editorDiv element:', editorDiv);
    
    const title = (titleInput?.value || 'Untitled Note').trim();
    const content = editorDiv?.innerHTML || '';

    console.log('Title to save:', title);
    console.log('Content to save (first 100 chars):', content.substring(0, 100));
    console.log('Content length:', content.length);
    console.log('Current note ID:', window.currentNoteId);

    try {
        console.log('Calling updateNote API...');
        // Save the note content and title
        const result = await window.updateNote(window.currentNoteId, title, content);
        console.log('updateNote result:', result);
        
        if (!result) {
            console.error('Failed to save note - updateNote returned falsy value');
            return false;
        }
        
        // Save tags if they exist
        if (window.currentNoteTags && window.updateNoteTags) {
            const tagIds = window.currentNoteTags.map(t => t.id);
            console.log('Saving tags:', tagIds);
            const tagsResult = await window.updateNoteTags(window.currentNoteId, tagIds);
            console.log('updateNoteTags result:', tagsResult);
        }
        
        lastSavedContent = content;
        lastSavedTitle = title;
        console.log('=== SAVE COMPLETE - SUCCESS ===');
        return true;
    } catch (error) {
        console.error('=== SAVE COMPLETE - ERROR ===', error);
        return false;
    }
}

// Make saveNoteToDatabase globally accessible
window.saveNoteToDatabase = saveNoteToDatabase;
window.saveNoteExplicitly = saveNoteExplicitly;
window.setLastSaved = (title, content) => {
    if (title !== undefined && content !== undefined) {
        lastSavedTitle = title;
        lastSavedContent = content;
    } else {
        // If called without parameters, use current values
        const noteTitle = document.getElementById('note-title');
        const editor = document.getElementById('editor');
        lastSavedTitle = (noteTitle?.value || 'Untitled Note').trim();
        lastSavedContent = editor?.innerHTML || '';
    }
};

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

// Setup save button after app is initialized
function setupSaveButton() {
    console.log('setupSaveButton called');
    const btnSaveNote = document.getElementById('btn-save-note');
    console.log('btnSaveNote element:', btnSaveNote);
    
    if (btnSaveNote) {
        // Remove any existing listeners first
        const newButton = btnSaveNote.cloneNode(true);
        btnSaveNote.parentNode.replaceChild(newButton, btnSaveNote);
        
        const freshButton = document.getElementById('btn-save-note');
        freshButton.addEventListener('click', function(e) {
            console.log('=== BUTTON CLICK EVENT FIRED ===');
            e.preventDefault();
            e.stopPropagation();
            
            (async () => {
                console.log('Inside async handler');
                const success = await saveNoteExplicitly();
                console.log('Save result:', success);
                
                if (success) {
                    alert('Note saved successfully!');
                    // Navigate back to notes list
                    if (window.goToPage && window.PAGES) {
                        console.log('Navigating to notes list');
                        window.goToPage(window.PAGES.NOTES_LIST);
                        if (window.loadNotesList) {
                            window.loadNotesList();
                        }
                    }
                } else {
                    alert('Failed to save note');
                }
            })();
        });
        console.log('Save button listener attached');
    } else {
        console.error('btn-save-note element not found!');
    }
}

// Run initialization when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
        setupSaveButton();
    });
} else {
    initApp();
    setupSaveButton();
}