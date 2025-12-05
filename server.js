const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const dbPath = path.join(__dirname, '.database', 'datasource.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database schema
function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Notes table ready');
        }
    });
}

// API Endpoints

// GET all notes
app.get('/api/notes', (req, res) => {
    db.all('SELECT * FROM notes ORDER BY updated_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows || []);
        }
    });
});

// GET single note by ID
app.get('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM notes WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: 'Note not found' });
        } else {
            res.json(row);
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
                res.status(500).json({ error: err.message });
            } else {
                res.json({ id: this.lastID, title, content: content || '' });
            }
        }
    );
});

// PUT update note
app.put('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    db.run(
        'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, content, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Note not found' });
            } else {
                res.json({ id, title, content });
            }
        }
    );
});

// DELETE note
app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM notes WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Note not found' });
        } else {
            res.json({ success: true });
        }
    });
});

// Serve index.html for all routes (SPA)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`NoteMaster server running on http://localhost:${PORT}`);
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
