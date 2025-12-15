/**
 * Tags Manager for NoteMaster
 * Handles tags display, creation, deletion, and assignment
 */

/**
 * Refresh tags modal with current tags list
 */
async function refreshTagsModal() {
    try {
        const tags = await getTags();
        displayTagsList(tags);
    } catch (error) {
        console.error('Error refreshing tags modal:', error);
    }
}

/**
 * Display tags list in the modal
 * @param {Array} tags - Array of tag objects
 */
function displayTagsList(tags) {
    const tagsList = document.getElementById('tags-list');
    if (!tagsList) return;

    if (!tags || tags.length === 0) {
        tagsList.innerHTML = '<p class="empty-message">No tags yet. Create your first tag!</p>';
        return;
    }

    tagsList.innerHTML = tags.map(tag => `
        <div class="tag-item">
            <span class="tag-name">${escapeHtml(tag.name)}</span>
            <button class="btn-delete-tag" data-tag-id="${tag.id}" title="Delete tag">
                ×
            </button>
        </div>
    `).join('');

    // Add delete tag listeners
    tagsList.querySelectorAll('.btn-delete-tag').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const tagId = parseInt(btn.dataset.tagId);
            if (confirm('Are you sure you want to delete this tag?')) {
                await deleteTag(tagId);
                refreshTagsModal();
            }
        });
    });
}

/**
 * Display tags for current note
 * @param {Array} tags - Array of tag objects assigned to the note
 */
function displayNoteTags(tags) {
    const noteTags = document.getElementById('note-tags');
    if (!noteTags) return;

    if (!tags || tags.length === 0) {
        noteTags.innerHTML = '<p class="no-tags">No tags assigned</p>';
        return;
    }

    noteTags.innerHTML = tags.map(tag => `
        <span class="tag-badge">
            ${escapeHtml(tag.name)}
            <button class="tag-remove" data-tag-id="${tag.id}" title="Remove tag">×</button>
        </span>
    `).join('');

    // Add remove tag listeners
    noteTags.querySelectorAll('.tag-remove').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const tagId = parseInt(btn.dataset.tagId);
            await removeTagFromNote(window.currentNoteId, tagId);
            displayNoteTags(window.currentNoteTags);
        });
    });
}

/**
 * Display filter tags on notes list page
 * @param {Array} tags - Array of all available tags
 * @param {Set} selectedTags - Set of selected tag IDs
 */
function displayFilterTags(tags, selectedTags = new Set()) {
    const filterSection = document.getElementById('tags-filter');
    if (!filterSection) return;

    if (!tags || tags.length === 0) {
        filterSection.innerHTML = '<p class="no-tags">No tags available</p>';
        return;
    }

    filterSection.innerHTML = tags.map(tag => `
        <button class="filter-tag ${selectedTags.has(tag.id) ? 'active' : ''}" data-tag-id="${tag.id}">
            ${escapeHtml(tag.name)}
        </button>
    `).join('');

    // Add filter tag listeners
    filterSection.querySelectorAll('.filter-tag').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            if (window.filterNotesByTags) {
                window.filterNotesByTags();
            }
        });
    });
}

/**
 * Get selected filter tags
 * @returns {Set} Set of selected tag IDs
 */
function getSelectedFilterTags() {
    const filterSection = document.getElementById('tags-filter');
    const selected = new Set();

    if (filterSection) {
        filterSection.querySelectorAll('.filter-tag.active').forEach(btn => {
            selected.add(parseInt(btn.dataset.tagId));
        });
    }

    return selected;
}

/**
 * API: Get tags for a note
 * @param {number} noteId - Note ID
 * @returns {Promise<Array>} Array of tag objects
 */
async function getNoteTagsAPI(noteId) {
    try {
        const response = await fetch(`/api/notes/${noteId}`);
        if (!response.ok) throw new Error('Failed to fetch note');
        const note = await response.json();
        return note.tags || [];
    } catch (error) {
        console.error('Error fetching note tags:', error);
        return [];
    }
}

/**
 * Add a tag to current note
 * @param {number} tagId - Tag ID to add
 */
async function addTagToNote(tagId) {
    if (!window.currentNoteId) return;

    try {
        const currentTags = window.currentNoteTags || [];
        const tagIds = currentTags.map(t => t.id);
        
        if (!tagIds.includes(tagId)) {
            tagIds.push(tagId);
            await updateNoteTags(window.currentNoteId, tagIds);
            
            // Reload tags
            const tags = await getTags();
            const noteTags = tags.filter(t => tagIds.includes(t.id));
            window.currentNoteTags = noteTags;
            displayNoteTags(noteTags);
        }
    } catch (error) {
        console.error('Error adding tag to note:', error);
        alert('Failed to add tag to note');
    }
}

/**
 * Remove a tag from current note
 * @param {number} noteId - Note ID
 * @param {number} tagId - Tag ID to remove
 */
async function removeTagFromNote(noteId, tagId) {
    try {
        const currentTags = window.currentNoteTags || [];
        const tagIds = currentTags.map(t => t.id).filter(id => id !== tagId);
        await updateNoteTags(noteId, tagIds);
        
        // Update local state
        window.currentNoteTags = window.currentNoteTags.filter(t => t.id !== tagId);
    } catch (error) {
        console.error('Error removing tag from note:', error);
        alert('Failed to remove tag from note');
    }
}

/**
 * Helper function to escape HTML
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize tags manager
 */
function initTagsManager() {
    const newTagInput = document.getElementById('new-tag-input');
    const btnCreateTag = document.getElementById('btn-create-tag');

    if (btnCreateTag) {
        btnCreateTag.addEventListener('click', async () => {
            const tagName = newTagInput.value.trim();
            if (!tagName) {
                alert('Please enter a tag name');
                return;
            }

            try {
                await createTag(tagName);
                newTagInput.value = '';
                refreshTagsModal();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    if (newTagInput) {
        newTagInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const tagName = newTagInput.value.trim();
                if (tagName) {
                    try {
                        await createTag(tagName);
                        newTagInput.value = '';
                        refreshTagsModal();
                    } catch (error) {
                        alert(error.message);
                    }
                }
            }
        });
    }
}

// Export functions globally for use in other scripts
window.refreshTagsModal = refreshTagsModal;
window.displayNoteTags = displayNoteTags;
window.displayFilterTags = displayFilterTags;
window.getSelectedFilterTags = getSelectedFilterTags;
window.getNoteTagsAPI = getNoteTagsAPI;
window.addTagToNote = addTagToNote;
window.removeTagFromNote = removeTagFromNote;

// Note: getTags, createTag, deleteTag, updateNoteTags are exported from api-client.js

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initTagsManager);
