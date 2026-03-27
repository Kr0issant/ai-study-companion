import React from 'react';
import { 
  Bold, Italic, List, ListOrdered, Code, 
  Link as LinkIcon, Image as ImageIcon, Table, Sigma 
} from 'lucide-react';
import './MarkdownToolbar.css';

export default function MarkdownToolbar({ textareaRef, content, setContent }) {
  
  const handleInsert = (type) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let before = content.substring(0, start);
    let after = content.substring(end);
    let newContent = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        newContent = `**${selectedText || 'Bold Text'}**`;
        cursorOffset = selectedText ? newContent.length : 11;
        break;
      case 'italic':
        newContent = `_${selectedText || 'Italic Text'}_`;
        cursorOffset = selectedText ? newContent.length : 12;
        break;
      case 'list':
        newContent = `\n- ${selectedText || 'List item'}`;
        cursorOffset = newContent.length;
        break;
      case 'ordered-list':
        newContent = `\n1. ${selectedText || 'List item'}`;
        cursorOffset = newContent.length;
        break;
      case 'code':
        newContent = `\`${selectedText || 'code'}\``;
        cursorOffset = selectedText ? newContent.length : 5;
        break;
      case 'link':
        newContent = `[${selectedText || 'Link Text'}](https://example.com)`;
        cursorOffset = selectedText ? newContent.length : 11;
        break;
      case 'image':
        newContent = `![${selectedText || 'Alt Text'}](https://example.com/image.png)`;
        cursorOffset = selectedText ? newContent.length : 10;
        break;
      case 'table':
        newContent = `\n| Column 1 | Column 2 |\n| -------- | -------- |\n| Content  | Content  |\n`;
        cursorOffset = newContent.length;
        break;
      case 'math':
        newContent = `$$ ${selectedText || 'E = mc^2'} $$`;
        cursorOffset = selectedText ? newContent.length : 12;
        break;
      default:
        return;
    }

    const updatedValue = before + newContent + after;
    setContent(updatedValue);
    
    // Defer focus/selection to next tick to ensure state update has applied
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };

  return (
    <div className="markdown-toolbar no-scrollbar">
      <button type="button" className="toolbar-btn" onClick={() => handleInsert('bold')} title="Bold">
        <Bold size={18} />
      </button>
      <button type="button" className="toolbar-btn" onClick={() => handleInsert('italic')} title="Italic">
        <Italic size={18} />
      </button>
      <div className="toolbar-divider" />
      <button type="button" className="toolbar-btn" onClick={() => handleInsert('list')} title="Bullet List">
        <List size={18} />
      </button>
      <button type="button" className="toolbar-btn" onClick={() => handleInsert('ordered-list')} title="Ordered List">
        <ListOrdered size={18} />
      </button>
      <div className="toolbar-divider" />
      <button type="button" className="toolbar-btn" onClick={() => handleInsert('code')} title="Inline Code">
        <Code size={18} />
      </button>
      <button type="button" className="toolbar-btn" onClick={() => handleInsert('link')} title="Insert Link">
        <LinkIcon size={18} />
      </button>
      <button type="button" className="toolbar-btn" onClick={() => handleInsert('image')} title="Insert Image">
        <ImageIcon size={18} />
      </button>
      <div className="toolbar-divider" />
      <button type="button" className="toolbar-btn" onClick={() => handleInsert('math')} title="LaTeX Math Block">
        <Sigma size={18} />
      </button>
      <button type="button" className="toolbar-btn" onClick={() => handleInsert('table')} title="Insert Table">
        <Table size={18} />
      </button>
    </div>
  );
}
