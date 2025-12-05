// Text Formatter - Handles rich text formatting for contentEditable editor
const editor = document.getElementById('editor');
const normalBtn = document.getElementById('normal-btn');
const boldBtn = document.getElementById('bold-btn');
const italicBtn = document.getElementById('italic-btn');
const heading1Btn = document.getElementById('heading1-btn');
const heading2Btn = document.getElementById('heading2-btn');
const bulletBtn = document.getElementById('bullet-btn');
const numberedBtn = document.getElementById('numbered-btn');

// Helper function to execute formatting commands
function formatText(command, value = null) {
    document.execCommand(command, false, value);
    editor.focus();
}

// Normal text - convert to paragraph
normalBtn.addEventListener('click', () => {
    formatText('formatBlock', '<p>');
});

// Bold formatting
boldBtn.addEventListener('click', () => {
    formatText('bold');
});

// Italic formatting
italicBtn.addEventListener('click', () => {
    formatText('italic');
});

// Heading 1 formatting
heading1Btn.addEventListener('click', () => {
    formatText('formatBlock', '<h1>');
});

// Heading 2 formatting
heading2Btn.addEventListener('click', () => {
    formatText('formatBlock', '<h2>');
});

// Bullet list formatting
bulletBtn.addEventListener('click', () => {
    formatText('insertUnorderedList');
});

// Numbered list formatting
numberedBtn.addEventListener('click', () => {
    formatText('insertOrderedList');
});

// Prevent default paste behavior and paste as plain text
editor.addEventListener('paste', (e) => {
    e.preventDefault();
    
    // Get pasted text
    let text = '';
    if (e.clipboardData || e.originalEvent.clipboardData) {
        text = (e.originalEvent || e).clipboardData.getData('text/plain');
    } else if (window.clipboardData) {
        text = window.clipboardData.getData('Text');
    }
    
    // Insert as text node
    if (document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, text);
    } else {
        document.execCommand('paste', false, text);
    }
});

// Initialize with a paragraph if empty
if (editor.innerHTML === '' || editor.innerHTML === '<br>') {
    editor.innerHTML = '<p></p>';
}