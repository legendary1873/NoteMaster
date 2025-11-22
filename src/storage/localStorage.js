function saveNoteToLocalStorage(note) {
    let notes = getNotesFromLocalStorage();
    notes.push(note);
    localStorage.setItem('notes', JSON.stringify(notes));
}

function getNotesFromLocalStorage() {
    const notes = localStorage.getItem('notes');
    return notes ? JSON.parse(notes) : [];
}

function deleteNoteFromLocalStorage(noteId) {
    let notes = getNotesFromLocalStorage();
    notes = notes.filter(note => note.id !== noteId);
    localStorage.setItem('notes', JSON.stringify(notes));
}

function updateNoteInLocalStorage(updatedNote) {
    let notes = getNotesFromLocalStorage();
    notes = notes.map(note => note.id === updatedNote.id ? updatedNote : note);
    localStorage.setItem('notes', JSON.stringify(notes));
}

export { saveNoteToLocalStorage, getNotesFromLocalStorage, deleteNoteFromLocalStorage, updateNoteInLocalStorage };