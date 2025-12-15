/**
 * Client-side Router for NoteMaster
 * Manages page navigation and visibility
 */

const PAGES = {
    HOME: 'page-home',
    DASHBOARD: 'page-dashboard',
    NOTES_LIST: 'page-notes-list',
    EDITOR: 'page-editor'
};

const MODALS = {
    TAGS: 'modal-tags'
};

/**
 * Navigate to a specific page
 * @param {string} pageName - The page ID to navigate to
 */
function goToPage(pageName) {
    hideAllPages();
    showPage(pageName);
}

/**
 * Show a specific page
 * @param {string} pageName - The page ID to show
 */
function showPage(pageName) {
    const page = document.getElementById(pageName);
    if (page) {
        page.classList.add('active');
    }
}

/**
 * Hide all pages
 */
function hideAllPages() {
    Object.values(PAGES).forEach(pageId => {
        const page = document.getElementById(pageId);
        if (page) {
            page.classList.remove('active');
        }
    });
}

/**
 * Show a modal
 * @param {string} modalName - The modal ID to show
 */
function openModal(modalName) {
    const modal = document.getElementById(modalName);
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Hide a modal
 * @param {string} modalName - The modal ID to hide
 */
function closeModal(modalName) {
    const modal = document.getElementById(modalName);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Initialize router event listeners
 */
function initRouter() {
    // Home page navigation
    const btnGoDashboard = document.getElementById('btn-go-dashboard');
    if (btnGoDashboard) {
        btnGoDashboard.addEventListener('click', () => {
            goToPage(PAGES.DASHBOARD);
            loadDashboard();
        });
    }

    // Dashboard navigation
    const btnHome = document.getElementById('btn-home');
    if (btnHome) {
        btnHome.addEventListener('click', () => goToPage(PAGES.HOME));
    }

    const btnGoNotes = document.getElementById('btn-go-notes');
    if (btnGoNotes) {
        btnGoNotes.addEventListener('click', () => {
            goToPage(PAGES.NOTES_LIST);
            loadNotesList();
        });
    }

    const btnNewNoteDashboard = document.getElementById('btn-new-note-dashboard');
    if (btnNewNoteDashboard) {
        btnNewNoteDashboard.addEventListener('click', async () => {
            await createNewNote();
            goToPage(PAGES.EDITOR);
            loadEditor(window.currentNoteId);
        });
    }

    // Notes list navigation
    const btnDashboard = document.getElementById('btn-dashboard');
    if (btnDashboard) {
        btnDashboard.addEventListener('click', () => {
            goToPage(PAGES.DASHBOARD);
            loadDashboard();
        });
    }

    const btnNewNote = document.getElementById('btn-new-note');
    if (btnNewNote) {
        btnNewNote.addEventListener('click', async () => {
            await createNewNote();
            goToPage(PAGES.EDITOR);
            loadEditor(window.currentNoteId);
        });
    }

    // Editor navigation
    const btnNotes = document.getElementById('btn-notes');
    if (btnNotes) {
        btnNotes.addEventListener('click', () => {
            goToPage(PAGES.NOTES_LIST);
            loadNotesList();
        });
    }

    const btnDeleteNote = document.getElementById('btn-delete-note');
    if (btnDeleteNote) {
        btnDeleteNote.addEventListener('click', async () => {
            if (window.currentNoteId && confirm('Are you sure you want to delete this note?')) {
                await deleteCurrentNote();
                goToPage(PAGES.NOTES_LIST);
                loadNotesList();
            }
        });
    }

    // Tags modal
    const btnManageTags = document.getElementById('btn-manage-tags');
    if (btnManageTags) {
        btnManageTags.addEventListener('click', () => {
            openModal(MODALS.TAGS);
            loadTagsModal();
        });
    }

    const btnCloseTagsModal = document.getElementById('btn-close-tags-modal');
    if (btnCloseTagsModal) {
        btnCloseTagsModal.addEventListener('click', () => {
            closeModal(MODALS.TAGS);
        });
    }

    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

/**
 * Placeholder functions to be implemented in notes-manager.js
 */
function loadDashboard() {
    // Load dashboard stats
    if (window.refreshDashboard) {
        window.refreshDashboard();
    }
}

function loadNotesList() {
    // Load and display notes list
    if (window.refreshNotesList) {
        window.refreshNotesList();
    }
}

function loadEditor(noteId) {
    // Load note into editor
    if (window.loadNoteIntoEditor) {
        window.loadNoteIntoEditor(noteId);
    }
}

function loadTagsModal() {
    // Load tags list and setup modal
    if (window.refreshTagsModal) {
        window.refreshTagsModal();
    }
}

async function createNewNote() {
    // Create a new note and return its ID
    if (window.createNewNote) {
        return await window.createNewNote();
    }
}

async function deleteCurrentNote() {
    // Delete the current note
    if (window.deleteCurrentNote) {
        return await window.deleteCurrentNote();
    }
}

// Initialize router when DOM is ready
document.addEventListener('DOMContentLoaded', initRouter);
