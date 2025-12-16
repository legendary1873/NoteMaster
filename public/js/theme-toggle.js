const themeToggle = document.getElementById('themeToggle');
const darkModeStylesheet = document.getElementById('dark-mode-stylesheet');
const moonIcon = document.getElementById('moon-icon');

// Load saved theme from localStorage
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

// Apply theme
function applyTheme(theme) {
    if (theme === 'dark') {
        darkModeStylesheet.disabled = false;
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        moonIcon.setAttribute('stroke', 'white');
        moonIcon.setAttribute('fill', 'black');
        moonIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    } else {
        darkModeStylesheet.disabled = true;
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        moonIcon.setAttribute('stroke', 'black');
        moonIcon.setAttribute('fill', 'white');
        moonIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    }
    localStorage.setItem('theme', theme);
}

// Toggle theme
themeToggle.addEventListener('click', () => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
});

// Load theme on startup
document.addEventListener('DOMContentLoaded', loadTheme);