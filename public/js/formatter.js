const editor = document.getElementById('editor');
const normalBtn = document.getElementById('normal-btn');
const boldBtn = document.getElementById('bold-btn');
const italicBtn = document.getElementById('italic-btn');
const heading1Btn = document.getElementById('heading1-btn');
const heading2Btn = document.getElementById('heading2-btn');
const bulletBtn = document.getElementById('bullet-btn');
const numberedBtn = document.getElementById('numbered-btn');

// Style tracking object
const styleTracker = {};

// Generate unique ID for text nodes
function getNodeId(node) {
    if (!node.id) {
        node.id = 'node-' + Math.random().toString(36).substr(2, 9);
    }
    return node.id;
}

// Apply computed styles based on tracking
function applyTrackedStyles(node) {
    const nodeId = getNodeId(node);
    const styles = styleTracker[nodeId] || {};
    
    // Remove conflicting default styles
    if (node.tagName === 'H1' || node.tagName === 'H2') {
        if (styles.bold === false) {
            node.style.fontWeight = 'normal';
        }
        if (styles.italic === false) {
            node.style.fontStyle = 'normal';
        }
    }
}

// Track styles for selected content
function trackStyles(bold, italic) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const node = container.nodeType === 3 ? container.parentNode : container;
    
    const nodeId = getNodeId(node);
    if (!styleTracker[nodeId]) {
        styleTracker[nodeId] = {};
    }
    
    if (bold !== undefined) styleTracker[nodeId].bold = bold;
    if (italic !== undefined) styleTracker[nodeId].italic = italic;
}

// Normal text formatting - revert heading sizes to body text
normalBtn.addEventListener('click', () => {
    document.execCommand('formatBlock', false, '<p>');
    editor.focus();
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        trackStyles(false, false);
        applyTrackedStyles(selection.getRangeAt(0).commonAncestorContainer.parentNode);
    }
});

// Bold formatting with iAWriterMonoS-Bold
boldBtn.addEventListener('click', () => {
    const selection = window.getSelection();
    const isBold = document.queryCommandState('bold');
    
    document.execCommand('bold', false, null);
    
    if (selection.rangeCount > 0) {
        trackStyles(!isBold, undefined);
        const node = selection.getRangeAt(0).commonAncestorContainer.parentNode;
        applyTrackedStyles(node);
    }
    
    editor.focus();
});

// Italic formatting with iAWriterMonoS-Italic
italicBtn.addEventListener('click', () => {
    const selection = window.getSelection();
    const isItalic = document.queryCommandState('italic');
    
    document.execCommand('italic', false, null);
    
    if (selection.rangeCount > 0) {
        trackStyles(undefined, !isItalic);
        const node = selection.getRangeAt(0).commonAncestorContainer.parentNode;
        applyTrackedStyles(node);
    }
    
    editor.focus();
});

// Heading 1 formatting
heading1Btn.addEventListener('click', () => {
    document.execCommand('formatBlock', false, '<h1>');
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const node = selection.getRangeAt(0).commonAncestorContainer.parentNode;
        applyTrackedStyles(node);
    }
    
    editor.focus();
});

// Heading 2 formatting
heading2Btn.addEventListener('click', () => {
    document.execCommand('formatBlock', false, '<h2>');
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const node = selection.getRangeAt(0).commonAncestorContainer.parentNode;
        applyTrackedStyles(node);
    }
    
    editor.focus();
});

// Bullet list formatting
bulletBtn.addEventListener('click', () => {
    document.execCommand('insertUnorderedList', false, null);
    editor.focus();
});

// Numbered list formatting
numberedBtn.addEventListener('click', () => {
    document.execCommand('insertOrderedList', false, null);
    editor.focus();
});

// Apply tracked styles when loading content
editor.addEventListener('load', () => {
    const allNodes = editor.querySelectorAll('*');
    allNodes.forEach(node => applyTrackedStyles(node));
});

// Update app.js to trigger save when content changes
editor.addEventListener('input', () => {
    if (window.saveNote) {
        clearTimeout(window.autoSaveTimer);
        window.autoSaveTimer = setTimeout(() => {
            window.saveNote();
        }, 1000);
    }
});

// Store and restore style tracker with note content
window.getStyleTracker = () => styleTracker;
window.setStyleTracker = (tracker) => Object.assign(styleTracker, tracker);