// API Client for NoteMaster
const API_BASE = 'http://localhost:3000/api';
const NOTES_CACHE_KEY = 'notemaster_notes_cache';
const LAST_SYNC_KEY = 'notemaster_last_sync';

// Check if online
function isOnline() {
    return navigator.onLine;
}

// Get all notes from cache or API
async function getAllNotes() {
    if (!isOnline()) {
        // Return cached notes if offline
        return getNotesFromCache();
    }
    
    try {
        const response = await fetch(`${API_BASE}/notes`);
        if (!response.ok) throw new Error('Failed to fetch notes');
        const notes = await response.json();
        // Cache notes when fetched successfully
        saveNotesToCache(notes);
        return notes;
    } catch (error) {
        console.error('Error fetching notes:', error);
        // Fall back to cache on error
        return getNotesFromCache();
    }
}

// Get single note from cache or API
async function getNote(noteId) {
    try {
        const response = await fetch(`${API_BASE}/notes/${noteId}`);
        if (!response.ok) throw new Error('Note not found');
        return await response.json();
    } catch (error) {
        console.error('Error fetching note:', error);
        // Try to get from cache
        const cachedNotes = getNotesFromCache();
        return cachedNotes.find(n => n.id === noteId) || null;
    }
}

// Create new note
async function createNote(title, content = '') {
    try {
        const response = await fetch(`${API_BASE}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });
        if (!response.ok) throw new Error('Failed to create note');
        const newNote = await response.json();
        addNoteToCache(newNote);
        return newNote;
    } catch (error) {
        console.error('Error creating note:', error);
        // If offline, create note with temporary ID
        if (!isOnline()) {
            const tempNote = {
                id: Date.now(),
                title,
                content,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                pending: true
            };
            addNoteToCache(tempNote);
            return tempNote;
        }
        return null;
    }
}

// Update note
async function updateNote(noteId, title, content) {
    try {
        const response = await fetch(`${API_BASE}/notes/${noteId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });
        if (!response.ok) throw new Error('Failed to update note');
        const updated = await response.json();
        updateNoteInCache(noteId, updated);
        return updated;
    } catch (error) {
        console.error('Error updating note:', error);
        // If offline, update cache anyway
        if (!isOnline()) {
            const note = {
                id: noteId,
                title,
                content,
                updated_at: new Date().toISOString(),
                pending: true
            };
            updateNoteInCache(noteId, note);
            return note;
        }
        return null;
    }
}

// Delete note
async function deleteNote(noteId) {
    try {
        const response = await fetch(`${API_BASE}/notes/${noteId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete note');
        removeNoteFromCache(noteId);
        return await response.json();
    } catch (error) {
        console.error('Error deleting note:', error);
        // If offline, remove from cache anyway
        if (!isOnline()) {
            removeNoteFromCache(noteId);
            return { success: true };
        }
        return null;
    }
}

// Search notes by query
async function searchNotes(query) {
    try {
        const response = await fetch(`${API_BASE}/notes/search/${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to search notes');
        return await response.json();
    } catch (error) {
        console.error('Error searching notes:', error);
        // Fall back to local search
        const cachedNotes = getNotesFromCache();
        const searchTerm = query.toLowerCase();
        return cachedNotes.filter(note => 
            note.title.toLowerCase().includes(searchTerm) || 
            note.content.toLowerCase().includes(searchTerm)
        );
    }
}

// Cache management functions
function saveNotesToCache(notes) {
    try {
        localStorage.setItem(NOTES_CACHE_KEY, JSON.stringify(notes));
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    } catch (error) {
        console.error('Error saving to cache:', error);
    }
}

function getNotesFromCache() {
    try {
        const cached = localStorage.getItem(NOTES_CACHE_KEY);
        return cached ? JSON.parse(cached) : [];
    } catch (error) {
        console.error('Error reading from cache:', error);
        return [];
    }
}

function updateNoteInCache(noteId, updatedNote) {
    try {
        const notes = getNotesFromCache();
        const index = notes.findIndex(n => n.id === noteId);
        if (index !== -1) {
            notes[index] = updatedNote;
            saveNotesToCache(notes);
        }
    } catch (error) {
        console.error('Error updating cache:', error);
    }
}

function addNoteToCache(note) {
    try {
        const notes = getNotesFromCache();
        notes.unshift(note);
        saveNotesToCache(notes);
    } catch (error) {
        console.error('Error adding to cache:', error);
    }
}

function removeNoteFromCache(noteId) {
    try {
        const notes = getNotesFromCache();
        const filtered = notes.filter(n => n.id !== noteId);
        saveNotesToCache(filtered);
    } catch (error) {
        console.error('Error removing from cache:', error);
    }
}

// Tags API functions
async function getTags() {
    try {
        const response = await fetch(`${API_BASE}/tags`);
        if (!response.ok) throw new Error('Failed to fetch tags');
        const tags = await response.json();
        localStorage.setItem('tagCache', JSON.stringify(tags));
        return tags;
    } catch (error) {
        console.error('Error fetching tags:', error);
        // Return cached tags on error
        const cached = localStorage.getItem('tagCache');
        return cached ? JSON.parse(cached) : [];
    }
}

async function createTag(name) {
    try {
        const response = await fetch(`${API_BASE}/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create tag');
        }
        const tag = await response.json();
        // Clear tag cache
        localStorage.removeItem('tagCache');
        return tag;
    } catch (error) {
        console.error('Error creating tag:', error);
        throw error;
    }
}

async function deleteTag(tagId) {
    try {
        const response = await fetch(`${API_BASE}/tags/${tagId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete tag');
        // Clear tag cache
        localStorage.removeItem('tagCache');
        return await response.json();
    } catch (error) {
        console.error('Error deleting tag:', error);
        throw error;
    }
}

async function updateNoteTags(noteId, tagIds) {
    try {
        const response = await fetch(`${API_BASE}/notes/${noteId}/tags`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tag_ids: tagIds })
        });
        if (!response.ok) throw new Error('Failed to update note tags');
        // Clear cache
        localStorage.removeItem(`noteCache_${noteId}`);
        return await response.json();
    } catch (error) {
        console.error('Error updating note tags:', error);
        throw error;
    }
}

// Export functions globally
window.getAllNotes = getAllNotes;
window.getNote = getNote;
window.createNote = createNote;
window.updateNote = updateNote;
window.deleteNote = deleteNote;
window.searchNotes = searchNotes;
window.getTags = getTags;
window.createTag = createTag;
window.deleteTag = deleteTag;
window.updateNoteTags = updateNoteTags;
