// Text Formatter - Handles rich text formatting for contentEditable editor
const editor = document.getElementById('editor');
const normalBtn = document.getElementById('btn-normal');
const boldBtn = document.getElementById('btn-bold');
const italicBtn = document.getElementById('btn-italic');
const heading1Btn = document.getElementById('btn-heading1');
const heading2Btn = document.getElementById('btn-heading2');
const bulletBtn = document.getElementById('btn-bullet');
const numberedBtn = document.getElementById('btn-numbered');

// Helper function to execute formatting commands
function formatText(command, value = null) {
    document.execCommand(command, false, value);
    editor.focus();
}

// Normal text - convert to paragraph
if (normalBtn) {
    normalBtn.addEventListener('click', () => {
        formatText('formatBlock', '<p>');
    });
}

// Bold formatting
if (boldBtn) {
    boldBtn.addEventListener('click', () => {
        formatText('bold');
    });
}

// Italic formatting
if (italicBtn) {
    italicBtn.addEventListener('click', () => {
        formatText('italic');
    });
}

// Heading 1 formatting
if (heading1Btn) {
    heading1Btn.addEventListener('click', () => {
        formatText('formatBlock', '<h1>');
    });
}

// Heading 2 formatting
if (heading2Btn) {
    heading2Btn.addEventListener('click', () => {
        formatText('formatBlock', '<h2>');
    });
}

// Bullet list formatting
if (bulletBtn) {
    bulletBtn.addEventListener('click', () => {
        formatText('insertUnorderedList');
    });
}

// Numbered list formatting
if (numberedBtn) {
    numberedBtn.addEventListener('click', () => {
        formatText('insertOrderedList');
    });
}

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