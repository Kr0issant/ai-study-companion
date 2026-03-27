import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, BookOpen, Check, AlertCircle, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ConfirmationModal from '../ConfirmationModal';
import MarkdownToolbar from './MarkdownToolbar';

// Styles
import './NoteEditorModal.css';

export default function NoteEditorModal({ isOpen, onClose, note, subjects, topics, onSave }) {
    const [isEditing, setIsEditing] = useState(!note?.id); // Default to edit if it's a new note, otherwise view
    const [title, setTitle] = useState(note?.title || '');
    const [subjectId, setSubjectId] = useState(note?.subjectId || subjects[0]?.id || '');
    const [topicId, setTopicId] = useState(note?.topicId || '');
    const [content, setContent] = useState(note?.content || '');
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [initialState, setInitialState] = useState({ title: '', subjectId: '', topicId: '', content: '' });
    const textareaRef = useRef(null);

    // Undo/Redo System
    const historyRef = useRef([note?.content || '']);
    const historyIndexRef = useRef(0);
    const isUndoRedoAction = useRef(false);

    const pushToHistory = useCallback((newContent) => {
        if (newContent === historyRef.current[historyIndexRef.current]) return;

        // Truncate futures if we are in the middle of history
        const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
        newHistory.push(newContent);
        
        // Limit history to last 100 steps
        if (newHistory.length > 100) newHistory.shift();
        
        historyRef.current = newHistory;
        historyIndexRef.current = newHistory.length - 1;
    }, []);

    const undo = useCallback(() => {
        if (historyIndexRef.current > 0) {
            isUndoRedoAction.current = true;
            historyIndexRef.current -= 1;
            const prevContent = historyRef.current[historyIndexRef.current];
            setContent(prevContent);
            // Re-focus and set cursor if possible (though state update is async)
        }
    }, [setContent]);

    const redo = useCallback(() => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            isUndoRedoAction.current = true;
            historyIndexRef.current += 1;
            const nextContent = historyRef.current[historyIndexRef.current];
            setContent(nextContent);
        }
    }, [setContent]);

    // Handle typing bursts (Debounced word-level grouping)
    const timeoutRef = useRef(null);
    const handleContentChange = (e) => {
        const newValue = e.target.value;
        const lastChar = newValue.slice(-1);
        const isWordEnd = lastChar === ' ' || lastChar === '\n' || lastChar === '.' || lastChar === ',';
        
        setContent(newValue);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (isWordEnd) {
            // Push immediately on word completion
            pushToHistory(newValue);
        } else {
            // Push after short pause of inactivity
            timeoutRef.current = setTimeout(() => {
                pushToHistory(newValue);
            }, 200);
        }
    };

    const handleKeyDown = (e) => {
        // Undo: Ctrl + Z
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }
        // Redo: Ctrl + Y or Ctrl + Shift + Z
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            redo();
        }
    };

    useEffect(() => {
        if (note && isOpen) {
            setTitle(note.title || '');
            setSubjectId(note.subjectId || '');
            setTopicId(note.topicId || '');
            setContent(note.content || '');
            setInitialState({
                title: note.title || '',
                subjectId: note.subjectId || '',
                topicId: note.topicId || '',
                content: note.content || ''
            });
            setIsEditing(!note.id); // View mode for existing notes, Edit for new
        }
    }, [note?.id, isOpen]);

    const hasChanges = () => {
        return title !== initialState.title ||
               subjectId !== initialState.subjectId ||
               topicId !== initialState.topicId ||
               content !== initialState.content;
    };

    const handleClose = () => {
        if (hasChanges()) {
            setShowUnsavedModal(true);
        } else {
            onClose();
        }
    };

    const handleSave = () => {
        const savedData = {
            id: note?.id,
            title,
            subjectId,
            topicId,
            content,
            lastEdited: new Date().toISOString()
        };
        onSave(savedData);
        // Update initial state to match saved state
        setInitialState({ title, subjectId, topicId, content });
    };

    if (!isOpen) return null;

    const filteredTopics = topics.filter(t => t.subjectId === subjectId);

    return (
        <div className="modal-overlay">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="modal-backdrop"
                onClick={handleClose} 
            />

            <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98, y: 20 }}
                className="note-modal-container ghost-boundary"
            >
                {/* Header Section */}
                <div className="note-modal-header">
                    {/* Top Row: Title & Close Button */}
                    <div className="note-modal-header-top">
                        <input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Note Title..."
                            className="note-title-input"
                        />
                        <button 
                            onClick={handleClose} 
                            className="close-circle-btn"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Bottom Row: Metadata Dropdowns & Actions */}
                    <div className="note-modal-header-bottom">
                        <div className="note-meta-controls">
                            <select 
                                value={subjectId}
                                onChange={(e) => {
                                    setSubjectId(e.target.value);
                                    setTopicId(''); // Reset topic when subject changes
                                }}
                                className="note-meta-select"
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>

                            <select 
                                value={topicId}
                                onChange={(e) => setTopicId(e.target.value)}
                                disabled={!subjectId}
                                className="input-field note-meta-select"
                            >
                                <option value="">Select Topic</option>
                                {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                            </select>
                        </div>

                        <div className="note-header-actions">
                            {/* Mode Toggle */}
                            <div className="mode-toggle-group">
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className={`mode-btn ${isEditing ? 'active' : 'inactive'}`}
                                >
                                    <Edit3 size={16} /> Edit
                                </button>
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className={`mode-btn ${!isEditing ? 'active' : 'inactive'}`}
                                >
                                    <BookOpen size={16} /> View
                                </button>
                            </div>

                            {hasChanges() && (
                                <>
                                    <div className="divider-narrow" />
                                    <button 
                                        className="btn btn-primary"
                                        onClick={handleSave}
                                        style={{ padding: '0.65rem 1.25rem' }}
                                    >
                                        <Check size={18} className="mr-xs" /> Save Note
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="note-content-area flex-column">
                    {isEditing ? (
                        <>
                            <MarkdownToolbar 
                                textareaRef={textareaRef} 
                                content={content} 
                                setContent={(val) => {
                                    setContent(val);
                                    pushToHistory(val);
                                }} 
                            />
                            <textarea 
                                ref={textareaRef}
                                value={content}
                                onChange={handleContentChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your note here in Markdown..."
                                className="custom-scrollbar note-editor-textarea flex-grow"
                            />
                        </>
                    ) : (
                        <div className="custom-scrollbar note-viewer-container">
                            <div className="markdown-content">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                                    components={{
                                        pre: ({ node, ...props }) => (
                                            <div className="code-block-wrapper">
                                                <pre {...props} />
                                            </div>
                                        ),
                                        img: ({ src, alt, ...props }) => (
                                            <img 
                                                src={src} 
                                                alt={alt} 
                                                {...props} 
                                                className="markdown-img"
                                                loading="lazy"
                                                style={{ maxWidth: '100%', height: 'auto', borderRadius: 'var(--radius-md)' }} 
                                            />
                                        ),
                                        code: ({ node, inline, className, children, ...props }) => {
                                            const [copied, setCopied] = useState(false);
                                            const match = /language-(\w+)/.exec(className || '');
                                            
                                            const handleCopy = (e) => {
                                                e.stopPropagation();
                                                const textToCopy = String(children).replace(/\n$/, '');
                                                navigator.clipboard.writeText(textToCopy);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            };

                                            if (inline) {
                                               return <code className={className} {...props}>{children}</code>;
                                            }
                                            return (
                                                <div className="code-container">
                                                    <div className="code-header">
                                                        <span className="code-lang">{match ? match[1] : 'text'}</span>
                                                        <button className="copy-btn" onClick={handleCopy}>
                                                            {copied ? <Check size={14} /> : <Copy size={14} />}
                                                            {copied ? 'Copied' : 'Copy'}
                                                        </button>
                                                    </div>
                                                    <SyntaxHighlighter
                                                        style={oneDark}
                                                        language={match ? match[1] : 'text'}
                                                        PreTag="div"
                                                        customStyle={{
                                                            margin: 0,
                                                            padding: '1.5rem',
                                                            fontSize: '0.85rem',
                                                            background: 'transparent'
                                                        }}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                </div>
                                            );
                                        }
                                    }}
                                >
                                    {content || "*No content provided yet...*"}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Unsaved Changes Prompt */}
            <ConfirmationModal 
                isOpen={showUnsavedModal}
                message="You have unsaved changes. Exit the sanctuary and lose them?"
                onConfirm={() => {
                    setShowUnsavedModal(false);
                    onClose();
                }}
                onClose={() => setShowUnsavedModal(false)}
            />
        </div>
    );
}
