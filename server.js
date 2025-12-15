const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure database directory exists
const dbDir = path.join(__dirname, '.database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database
const dbPath = path.join(dbDir, 'datasource.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
        initializeDatabase();
    }
});

// Initialize database schema with proper error handling
function initializeDatabase() {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) console.error('Error enabling foreign keys:', err);
    });

    // Create notes table
    db.run(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating notes table:', err);
        } else {
            console.log('Notes table ready');
        }
    });

    // Create tags table
    db.run(`
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating tags table:', err);
        } else {
            console.log('Tags table ready');
        }
    });

    // Create note_tags junction table
    db.run(`
        CREATE TABLE IF NOT EXISTS note_tags (
            note_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (note_id, tag_id),
            FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('Error creating note_tags table:', err);
        } else {
            console.log('Note_tags table ready');
        }
    });
}

// API Endpoints

// GET all notes with tags
app.get('/api/notes', (req, res) => {
    db.all(`
        SELECT n.*, 
               GROUP_CONCAT(t.id) as tag_ids, 
               GROUP_CONCAT(t.name) as tag_names
        FROM notes n
        LEFT JOIN note_tags nt ON n.id = nt.note_id
        LEFT JOIN tags t ON nt.tag_id = t.id
        GROUP BY n.id
        ORDER BY n.updated_at DESC
    `, (err, rows) => {
        if (err) {
            console.error('Error fetching notes:', err);
            res.status(500).json({ error: err.message });
        } else {
            // Parse tags into arrays
            const notesWithTags = (rows || []).map(note => ({
                ...note,
                tags: note.tag_names ? note.tag_names.split(',').map((name, idx) => ({
                    id: parseInt(note.tag_ids.split(',')[idx]),
                    name
                })) : []
            }));
            res.json(notesWithTags);
        }
    });
});

// GET single note by ID with tags
app.get('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    db.get(`
        SELECT n.*, 
               GROUP_CONCAT(t.id) as tag_ids, 
               GROUP_CONCAT(t.name) as tag_names
        FROM notes n
        LEFT JOIN note_tags nt ON n.id = nt.note_id
        LEFT JOIN tags t ON nt.tag_id = t.id
        WHERE n.id = ?
        GROUP BY n.id
    `, [id], (err, row) => {
        if (err) {
            console.error('Error fetching note:', err);
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: 'Note not found' });
        } else {
            const note = {
                ...row,
                tags: row.tag_names ? row.tag_names.split(',').map((name, idx) => ({
                    id: parseInt(row.tag_ids.split(',')[idx]),
                    name
                })) : []
            };
            res.json(note);
        }
    });
});

// POST create new note
app.post('/api/notes', (req, res) => {
    const { title, content } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    db.run(
        'INSERT INTO notes (title, content) VALUES (?, ?)',
        [title, content || ''],
        function(err) {
            if (err) {
                console.error('Error creating note:', err);
                res.status(500).json({ error: err.message });
            } else {
                res.json({ 
                    id: this.lastID, 
                    title, 
                    content: content || '',
                    tags: [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }
        }
    );
});

// PUT update note
app.put('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    console.log('PUT /api/notes/:id called');
    console.log('Note ID:', id);
    console.log('Title received:', title);
    console.log('Content received (first 100 chars):', content ? content.substring(0, 100) : '');
    console.log('Content length:', content ? content.length : 0);

    db.run(
        'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, content, id],
        function(err) {
            if (err) {
                console.error('Error updating note:', err);
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                console.error('Note not found - id:', id);
                res.status(404).json({ error: 'Note not found' });
            } else {
                console.log('Note updated successfully - changes:', this.changes);
                res.json({ 
                    id: parseInt(id), 
                    title, 
                    content,
                    updated_at: new Date().toISOString()
                });
            }
        }
    );
});

// PUT update note tags
app.put('/api/notes/:id/tags', (req, res) => {
    const { id } = req.params;
    const { tagIds } = req.body;

    // First delete existing tags for this note
    db.run('DELETE FROM note_tags WHERE note_id = ?', [id], (err) => {
        if (err) {
            console.error('Error deleting tags:', err);
            return res.status(500).json({ error: err.message });
        }

        // Then insert new tags
        if (!tagIds || tagIds.length === 0) {
            return res.json({ success: true });
        }

        const placeholders = tagIds.map(() => '(?, ?)').join(',');
        const params = [];
        tagIds.forEach(tagId => {
            params.push(id, tagId);
        });

        db.run(
            `INSERT INTO note_tags (note_id, tag_id) VALUES ${placeholders}`,
            params,
            (err) => {
                if (err) {
                    console.error('Error adding tags:', err);
                    res.status(500).json({ error: err.message });
                } else {
                    res.json({ success: true });
                }
            }
        );
    });
});

// DELETE note
app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM notes WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Error deleting note:', err);
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Note not found' });
        } else {
            res.json({ success: true });
        }
    });
});

// SEARCH notes by title or content with optional tag filter
app.get('/api/notes/search/:query', (req, res) => {
    const { query } = req.params;
    const { tags } = req.query; // comma-separated tag IDs
    const searchTerm = `%${query}%`;
    
    let sql = `
        SELECT DISTINCT n.*, 
               GROUP_CONCAT(t.id) as tag_ids, 
               GROUP_CONCAT(t.name) as tag_names
        FROM notes n
        LEFT JOIN note_tags nt ON n.id = nt.note_id
        LEFT JOIN tags t ON nt.tag_id = t.id
        WHERE (n.title LIKE ? OR n.content LIKE ?)
    `;
    
    let params = [searchTerm, searchTerm];

    if (tags) {
        const tagArray = tags.split(',').map(id => parseInt(id));
        const placeholders = tagArray.map(() => '?').join(',');
        sql += ` AND n.id IN (
            SELECT DISTINCT nt.note_id 
            FROM note_tags nt 
            WHERE nt.tag_id IN (${placeholders})
        )`;
        params.push(...tagArray);
    }

    sql += ` GROUP BY n.id ORDER BY n.updated_at DESC`;

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Error searching notes:', err);
            res.status(500).json({ error: err.message });
        } else {
            const notesWithTags = (rows || []).map(note => ({
                ...note,
                tags: note.tag_names ? note.tag_names.split(',').map((name, idx) => ({
                    id: parseInt(note.tag_ids.split(',')[idx]),
                    name
                })) : []
            }));
            res.json(notesWithTags);
        }
    });
});

// GET all tags
app.get('/api/tags', (req, res) => {
    db.all('SELECT * FROM tags ORDER BY name ASC', (err, rows) => {
        if (err) {
            console.error('Error fetching tags:', err);
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows || []);
        }
    });
});

// POST create new tag
app.post('/api/tags', (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Tag name is required' });
    }

    db.run(
        'INSERT INTO tags (name) VALUES (?)',
        [name.trim()],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    res.status(400).json({ error: 'Tag already exists' });
                } else {
                    console.error('Error creating tag:', err);
                    res.status(500).json({ error: err.message });
                }
            } else {
                res.json({ 
                    id: this.lastID, 
                    name: name.trim(),
                    created_at: new Date().toISOString()
                });
            }
        }
    );
});

// DELETE tag
app.delete('/api/tags/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM tags WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Error deleting tag:', err);
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Tag not found' });
        } else {
            res.json({ success: true });
        }
    });
});

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`NoteMaster server running on http://localhost:${PORT}`);
    console.log(`Database path: ${dbPath}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
