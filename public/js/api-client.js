// API Client for NoteMaster
const API_BASE = 'http://localhost:3000/api';

// Fetch all notes
async function getAllNotes() {
    try {
        const response = await fetch(`${API_BASE}/notes`);
        if (!response.ok) throw new Error('Failed to fetch notes');
        return await response.json();
    } catch (error) {
        console.error('Error fetching notes:', error);
        return [];
    }
}

// Fetch single note
async function getNote(noteId) {
    try {
        const response = await fetch(`${API_BASE}/notes/${noteId}`);
        if (!response.ok) throw new Error('Note not found');
        return await response.json();
    } catch (error) {
        console.error('Error fetching note:', error);
        return null;
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
        return await response.json();
    } catch (error) {
        console.error('Error creating note:', error);
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
        return await response.json();
    } catch (error) {
        console.error('Error updating note:', error);
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
        return await response.json();
    } catch (error) {
        console.error('Error deleting note:', error);
        return null;
    }
}
