// Notes Manager - Handles UI for notes list and interactions
let currentNoteId = null;
let allNotes = [];
let filteredNotes = [];

const notesList = document.getElementById('notes-list');
const newNoteBtn = document.getElementById('new-note-btn');
const noteTitle = document.getElementById('note-title');
const editor = document.getElementById('editor');
const saveBtn = document.getElementById('save-btn');
const deleteBtn = document.getElementById('delete-btn');
const searchInput = document.getElementById('search-input');

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
    
    const notesToRender = filteredNotes.length > 0 && searchInput.value.trim() ? filteredNotes : allNotes;
    
    if (notesToRender.length === 0) {
        const message = searchInput.value.trim() 
            ? '<p class="empty-message">No notes found</p>'
            : '<p class="empty-message">No notes yet. Create one!</p>';
        notesList.innerHTML = message;
        return;
    }

    notesToRender.forEach(note => {
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
        // Show saving state
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
        
        const updated = await updateNote(currentNoteId, title, content);
        if (updated) {
            // Update in local list
            const noteIndex = allNotes.findIndex(n => n.id === currentNoteId);
            if (noteIndex !== -1) {
                allNotes[noteIndex] = { ...allNotes[noteIndex], title, content };
            }
            renderNotesList();
            
            // Show success
            saveBtn.textContent = '✓ Saved';
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
            }, 2000);
        }
    } catch (error) {
        console.error('Error saving note:', error);
        saveBtn.textContent = 'Error saving';
        saveBtn.disabled = false;
        setTimeout(() => {
            saveBtn.textContent = 'Save';
        }, 2000);
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

// Search functionality
searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    
    if (!query) {
        filteredNotes = [];
        renderNotesList();
        return;
    }
    
    try {
        filteredNotes = await searchNotes(query);
        renderNotesList();
    } catch (error) {
        console.error('Error searching notes:', error);
    }
});
