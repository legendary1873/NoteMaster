/**
 * Notes Manager - Handles UI for notes list, editor, and dashboard
 * Works with multi-page architecture
 */

// Global state
let allNotes = [];
let filteredNotes = [];
let allTags = [];

/**
 * Refresh Dashboard
 */
async function refreshDashboard() {
    try {
        const notes = await getAllNotes();
        const tags = await getTags();
        
        document.getElementById('stat-total-notes').textContent = notes.length;
        document.getElementById('stat-total-tags').textContent = tags.length;
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
    }
}

/**
 * Refresh Notes List Page
 */
async function refreshNotesList() {
    try {
        allNotes = await getAllNotes();
        allTags = await getTags();
        displayNotesList(allNotes);
        displayFilterTags(allTags, new Set());
    } catch (error) {
        console.error('Error refreshing notes list:', error);
    }
}

/**
 * Display notes in the grid
 * @param {Array} notes - Notes to display
 * @param {boolean} isFiltered - Whether the results are filtered/searched
 */
function displayNotesList(notes, isFiltered = false) {
    const notesGrid = document.getElementById('notes-grid');
    if (!notesGrid) return;

    if (!notes || notes.length === 0) {
        let emptyMessage = 'No notes yet. Create your first note!';
        
        // Determine if we're showing search/filter results
        const searchQuery = document.getElementById('search-notes')?.value.trim() || '';
        const hasActiveFilters = document.querySelectorAll('#tags-filter .filter-tag.active').length > 0;
        
        if (searchQuery || hasActiveFilters) {
            emptyMessage = 'No notes found matching your search or filters.';
        } else if (allNotes && allNotes.length > 0) {
            // If there are notes but they're all filtered out
            emptyMessage = 'No notes found matching your search or filters.';
        }
        
        notesGrid.innerHTML = `<p class="empty-message">${emptyMessage}</p>`;
        return;
    }

    notesGrid.innerHTML = notes.map(note => `
        <div class="note-card" data-note-id="${note.id}">
            <h3>${escapeHtml(note.title || 'Untitled')}</h3>
            <div class="note-preview">${(note.content || '').substring(0, 200)}</div>
            <div class="note-meta">
                <span class="note-date">${new Date(note.updated_at).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');

    // Add click listeners
    notesGrid.querySelectorAll('.note-card').forEach(card => {
        card.addEventListener('click', async () => {
            const noteId = parseInt(card.dataset.noteId);
            await loadNoteIntoEditor(noteId);
            goToPage(PAGES.EDITOR);
        });
    });
}

/**
 * Load note into editor
 * @param {number} noteId - Note ID to load
 */
async function loadNoteIntoEditor(noteId) {
    try {
        const note = await getNote(noteId);
        if (!note) {
            alert('Note not found');
            return;
        }

        window.currentNoteId = note.id;
        
        // Load note data
        const noteTitle = document.getElementById('note-title');
        const editor = document.getElementById('editor');
        
        if (noteTitle) noteTitle.value = note.title || 'Untitled';
        if (editor) editor.innerHTML = note.content || '';

        // Load and display tags
        const tags = await getNoteTagsAPI(noteId);
        window.currentNoteTags = tags;
        displayNoteTags(tags);

        // Reset auto-save tracking
        if (window.setLastSaved) {
            window.setLastSaved();
        }
    } catch (error) {
        console.error('Error loading note into editor:', error);
        alert('Failed to load note');
    }
}

/**
 * Create a new note with auto-naming
 */
async function createNewNote() {
    try {
        // Get count of untitled notes and find the highest number
        const notes = await getAllNotes();
        const untitledNotes = notes.filter(n => n.title && n.title.match(/^Untitled(-\d+)?$/));
        
        let nextNumber = 1;
        if (untitledNotes.length > 0) {
            // Extract numbers from existing Untitled notes
            const numbers = untitledNotes
                .map(n => {
                    const match = n.title.match(/^Untitled-(\d+)$/);
                    return match ? parseInt(match[1]) : 0;
                })
                .filter(num => num > 0);
            
            // Find the highest number and add 1
            nextNumber = Math.max(...numbers, 0) + 1;
        }
        
        const newTitle = nextNumber === 1 ? 'Untitled-1' : `Untitled-${nextNumber}`;

        const newNote = await createNote(newTitle, '');
        if (newNote) {
            window.currentNoteId = newNote.id;
            window.currentNoteTags = [];
            
            // Load into editor
            const noteTitle = document.getElementById('note-title');
            const editor = document.getElementById('editor');
            
            if (noteTitle) noteTitle.value = newTitle;
            if (editor) editor.innerHTML = '';
            
            displayNoteTags([]);
            
            // Reset auto-save tracking
            if (window.setLastSaved) {
                window.setLastSaved();
            }

            return newNote.id;
        }
    } catch (error) {
        console.error('Error creating note:', error);
        alert('Failed to create note');
    }
}

/**
 * Delete current note
 */
async function deleteCurrentNote() {
    if (!window.currentNoteId) return false;

    try {
        const result = await deleteNote(window.currentNoteId);
        if (result && (result.success || result)) {
            window.currentNoteId = null;
            window.currentNoteTags = [];
            return true;
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note');
    }
    return false;
}

/**
 * Filter notes by selected tags
 */
async function filterNotesByTags() {
    const selectedTags = getSelectedFilterTags();
    const searchQuery = document.getElementById('search-notes').value.trim();

    try {
        let notes = allNotes;

        // Filter by search query
        if (searchQuery) {
            notes = notes.filter(note => {
                const title = (note.title || '').toLowerCase();
                const content = (note.content || '').toLowerCase();
                const query = searchQuery.toLowerCase();
                return title.includes(query) || content.includes(query);
            });
        }

        // Filter by selected tags
        if (selectedTags.size > 0) {
            notes = notes.filter(note => {
                const noteTags = note.tags || [];
                return noteTags.some(tag => selectedTags.has(tag.id));
            });
        }

        displayNotesList(notes);
    } catch (error) {
        console.error('Error filtering notes:', error);
    }
}

/**
 * Search notes
 */
async function initSearchNotes() {
    const searchInput = document.getElementById('search-notes');
    if (!searchInput) return;

    searchInput.addEventListener('input', async (e) => {
        // Trigger the filter function which handles both search and tags
        filterNotesByTags();
    });
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize notes manager
 */
function initNotesManager() {
    initSearchNotes();
}

// Export functions globally for router
window.refreshDashboard = refreshDashboard;
window.refreshNotesList = refreshNotesList;
window.loadNoteIntoEditor = loadNoteIntoEditor;
window.createNewNote = createNewNote;
window.deleteCurrentNote = deleteCurrentNote;
window.filterNotesByTags = filterNotesByTags;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initNotesManager);
