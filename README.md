# Note Taking PWA

This is a simple Progressive Web Application (PWA) for taking notes. It allows users to create, read, update, and delete notes, with offline capabilities and local storage support.

## Features

- Create, edit, and delete notes
- Offline access through service worker
- Local storage for saving notes

## Project Structure

```
note-taking-pwa
├── src
│   ├── index.html        # Main HTML document
│   ├── index.css         # Styles for the application
│   ├── index.js          # Entry point for the application
│   ├── app.js            # Main logic for note-taking
│   ├── storage
│   │   └── localStorage.js # Functions for local storage interaction
│   └── service-worker.js  # Service worker for offline capabilities
├── public
│   └── manifest.json      # Web app manifest
├── package.json           # npm configuration file
└── README.md              # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd note-taking-pwa
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Open `src/index.html` in your web browser.
2. Start taking notes! Your notes will be saved in local storage and accessible offline.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.