// Notes Manager - Handles UI for notes list and interactions
let currentNoteId = null;
let allNotes = [];

const notesList = document.getElementById('notes-list');
const newNoteBtn = document.getElementById('new-note-btn');
const noteTitle = document.getElementById('note-title');
const editor = document.getElementById('editor');
const saveBtn = document.getElementById('save-btn');
const deleteBtn = document.getElementById('delete-btn');

// Load all notes and populate the list
async function loadNotesList() {
    try {
        allNotes = await getAllNotes();
        renderNotesList();
    } catch (error) {
        console.error('Error loading notes list:', error);
    }
}

// Render the notes list
function renderNotesList() {
    notesList.innerHTML = '';
    
    if (allNotes.length === 0) {
        notesList.innerHTML = '<p class="empty-message">No notes yet. Create one!</p>';
        return;
    }

    allNotes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.className = `note-item ${currentNoteId === note.id ? 'active' : ''}`;
        noteItem.innerHTML = `
            <div class="note-item-content">
                <h4>${escapeHtml(note.title || 'Untitled')}</h4>
                <p class="note-preview">${escapeHtml((note.content || '').substring(0, 50))}</p>
            </div>
        `;
        noteItem.addEventListener('click', () => loadNote(note.id));
        notesList.appendChild(noteItem);
    });
}

// Load a specific note
async function loadNote(noteId) {
    try {
        const note = await getNote(noteId);
        if (note) {
            currentNoteId = note.id;
            noteTitle.value = note.title;
            editor.innerHTML = note.content || '';
            renderNotesList(); // Update active state
        }
    } catch (error) {
        console.error('Error loading note:', error);
    }
}

// Create new note
newNoteBtn.addEventListener('click', async () => {
    try {
        const newNote = await createNote('Untitled Note', '');
        if (newNote) {
            currentNoteId = newNote.id;
            allNotes.unshift(newNote);
            noteTitle.value = newNote.title;
            editor.innerHTML = '';
            renderNotesList();
            noteTitle.focus();
        }
    } catch (error) {
        console.error('Error creating note:', error);
    }
});

// Save note
saveBtn.addEventListener('click', async () => {
    if (!currentNoteId) {
        alert('Please select or create a note first');
        return;
    }

    const title = noteTitle.value.trim() || 'Untitled Note';
    const content = editor.innerHTML;

    try {
        const updated = await updateNote(currentNoteId, title, content);
        if (updated) {
            // Update in local list
            const noteIndex = allNotes.findIndex(n => n.id === currentNoteId);
            if (noteIndex !== -1) {
                allNotes[noteIndex] = { ...allNotes[noteIndex], title, content };
            }
            renderNotesList();
            alert('Note saved successfully!');
        }
    } catch (error) {
        console.error('Error saving note:', error);
        alert('Failed to save note');
    }
});

// Delete note
deleteBtn.addEventListener('click', async () => {
    if (!currentNoteId) {
        alert('Please select a note to delete');
        return;
    }

    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }

    try {
        const result = await deleteNote(currentNoteId);
        if (result) {
            allNotes = allNotes.filter(n => n.id !== currentNoteId);
            currentNoteId = null;
            noteTitle.value = '';
            editor.innerHTML = '';
            renderNotesList();
            alert('Note deleted successfully');
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note');
    }
});

// Update note title in real-time
noteTitle.addEventListener('change', () => {
    // Title will be saved when user clicks Save button
});

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load notes list when manager is initialized
document.addEventListener('DOMContentLoaded', loadNotesList);
