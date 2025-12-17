# NoteMaster - A Functional Note-Taking PWA

A Progressive Web App for creating, saving, and managing notes with a rich text editor, offline support, and responsive design.

## Features

### Functional Backend Database
- **SQLite database** with proper schema for notes (id, title, content, created_at, updated_at)
- **Complete CRUD operations**: Create, Read, Update, Delete notes
- **Error handling** and validation on all API endpoints
- **Express.js server** running on port 3000 with CORS support

### Search Functionality
- **Full-text search** across both title and content
- **Real-time search** as you type in the search bar
- **API endpoint**: `/api/notes/search/:query` for backend search
- **Local fallback search** when offline
- Responsive search UI integrated into the notes panel

### Functional Rich Text Formatting
- **ContentEditable div editor** instead of plain textarea
- **Text formatting options**:
  - **Bold** (`<strong>`)
  - *Italic* (`<em>`)
  - **Headings** (H1, H2)
  - **Bullet lists** (`<ul>`, `<li>`)
  - **Numbered lists** (`<ol>`, `<li>`)
  - Normal text (paragraph)
- **Clean paste handling** - pastes as plain text to prevent formatting injection
- Proper HTML structure preservation

### Offline Access & LocalStorage
- **LocalStorage caching** of all notes
- **Offline mode support** - use the app without internet connection
- **Automatic sync** when going back online
- **Pending changes tracking** for notes created/modified offline
- **Service Worker** for offline functionality with network-first strategy for API calls
- Status indicator showing online/offline state

### Consistent & Polished UI
- **Light theme** with clean, minimal design
- **Dark theme** with consistent color scheme
- **Responsive layout**:
  - Notes panel (left sidebar)
  - Editor section (center)
  - Formatting toolbar (right sidebar)
  - Theme toggle button (bottom-right)
  - Online/offline status indicator (bottom-left)
- **Smooth transitions** and hover effects
- **Visual feedback** for button clicks and saves
- **Monospace font** (iAWriterMono) throughout for consistent typography
- **Proper spacing and visual hierarchy**

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Architecture

### Backend (`server.js`)
- Express.js server with SQLite database
- RESTful API endpoints for notes management
- Search endpoint for querying notes
- CORS enabled for frontend communication

### Frontend
- **HTML** (`public/index.html`): Semantic markup with accessible elements
- **CSS** (`public/css/style.css`, `public/css/dark.css`): Responsive styling with dark/light themes
- **JavaScript**:
  - `api-client.js`: API communication with caching
  - `notes-manager.js`: UI management and note interactions
  - `formatter.js`: Rich text formatting controls
  - `theme-toggle.js`: Dark/light theme switching
  - `app.js`: App initialization and offline handling

### Storage
- **SQLite** (`/.database/datasource.db`): Server-side persistent storage
- **LocalStorage**: Client-side caching for offline support
- **Service Worker**: PWA support for offline functionality

## API Endpoints

### Notes Management
- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Search
- `GET /api/notes/search/:query` - Search notes by title or content

## Usage

### Creating a Note
1. Click the "+ New" button in the notes panel
2. Enter a title and content
3. Use the formatting toolbar to style your text
4. Click "Save" to save the note

### Editing a Note
1. Click a note in the notes panel to open it
2. Edit the title and content
3. Changes are auto-saved every 3 seconds
4. Click "Save" to manually save

### Searching
1. Type in the search box at the top of the notes panel
2. Results update in real-time
3. Clear the search to see all notes

### Formatting Text
1. Select text in the editor
2. Click formatting buttons:
   - **B** for bold
   - **I** for italic
   - **H1**/**H2** for headings
   - **N** for normal text
   - **• List** for bullet points
   - **1. List** for numbered lists

### Toggling Theme
Click the moon icon in the bottom-right corner to switch between light and dark themes.

## Offline Support

NoteMaster works completely offline:
- All notes are cached locally
- Changes sync automatically when back online
- A status indicator shows your connection state
- Create and edit notes without internet

## Browser Support

- Modern browsers with support for:
  - ES6+ JavaScript
  - LocalStorage API
  - Service Workers
  - ContentEditable API

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **PWA**: Service Worker for offline support
- **Fonts**: iAWriterMono (monospace font family)
