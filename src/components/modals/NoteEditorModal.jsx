import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, BookOpen, Check, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ConfirmationModal from '../ConfirmationModal';

export default function NoteEditorModal({ isOpen, onClose, note, subjects, topics, onSave }) {
    const [isEditing, setIsEditing] = useState(!note?.id); // Default to edit if it's a new note, otherwise view
    const [title, setTitle] = useState(note?.title || '');
    const [subjectId, setSubjectId] = useState(note?.subjectId || subjects[0]?.id || '');
    const [topicId, setTopicId] = useState(note?.topicId || '');
    const [content, setContent] = useState(note?.content || '');
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [initialState, setInitialState] = useState({ title: '', subjectId: '', topicId: '', content: '' });

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
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,31,42,0.6)', backdropFilter: 'blur(15px)' }} 
                onClick={handleClose} 
            />

            <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98, y: 20 }}
                style={{ 
                    position: 'relative', 
                    width: '95%', 
                    maxWidth: '1200px', 
                    height: '90vh',
                    backgroundColor: 'var(--surface-container-lowest)', 
                    borderRadius: 'var(--radius-xl)', 
                    padding: '0', 
                    boxShadow: '0 48px 96px rgba(0,31,42,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
                className="ghost-boundary"
            >
                {/* Header Section */}
                <div style={{ padding: '2rem 3rem', borderBottom: '1px solid var(--surface-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-container-lowest)', zIndex: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                        <input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Note Title..."
                            style={{ 
                                fontSize: '2.5rem', 
                                fontWeight: 700, 
                                border: 'none', 
                                background: 'none', 
                                color: 'var(--on-surface)',
                                width: '100%',
                                outline: 'none'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <select 
                                value={subjectId}
                                onChange={(e) => {
                                    setSubjectId(e.target.value);
                                    setTopicId(''); // Reset topic when subject changes
                                }}
                                className="input-field"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', minWidth: '180px' }}
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>

                            <select 
                                value={topicId}
                                onChange={(e) => setTopicId(e.target.value)}
                                disabled={!subjectId}
                                className="input-field"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', minWidth: '180px' }}
                            >
                                <option value="">Select Topic</option>
                                {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Mode Toggle */}
                        <div style={{ 
                            display: 'flex', 
                            backgroundColor: 'var(--surface-container-high)', 
                            borderRadius: 'var(--radius-full)', 
                            padding: '0.25rem',
                            position: 'relative'
                        }}>
                            <button 
                                onClick={() => setIsEditing(true)}
                                style={{ 
                                    padding: '0.5rem 1.25rem', 
                                    borderRadius: 'var(--radius-full)', 
                                    border: 'none', 
                                    fontSize: '0.875rem', 
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    backgroundColor: isEditing ? 'var(--primary)' : 'transparent',
                                    color: isEditing ? 'white' : 'var(--on-surface-muted)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Edit3 size={16} /> Edit
                            </button>
                            <button 
                                onClick={() => setIsEditing(false)}
                                style={{ 
                                    padding: '0.5rem 1.25rem', 
                                    borderRadius: 'var(--radius-full)', 
                                    border: 'none', 
                                    fontSize: '0.875rem', 
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    backgroundColor: !isEditing ? 'var(--primary)' : 'transparent',
                                    color: !isEditing ? 'white' : 'var(--on-surface-muted)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <BookOpen size={16} /> View
                            </button>
                        </div>

                        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--surface-variant)', margin: '0 0.5rem' }} />

                        {hasChanges() && (
                            <button 
                                className="btn btn-primary"
                                onClick={handleSave}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
                            >
                                <Check size={18} /> Save Note
                            </button>
                        )}

                        <button 
                            onClick={handleClose} 
                            style={{ 
                                background: 'var(--surface-container-high)', 
                                border: 'none', 
                                borderRadius: '50%',
                                width: '40px', height: '40px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: 'var(--on-surface)'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
                    {isEditing ? (
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Type your note here in Markdown..."
                            className="custom-scrollbar"
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                padding: '4rem 6rem',
                                border: 'none', 
                                background: 'transparent',
                                fontSize: '1.25rem',
                                lineHeight: '1.8',
                                color: 'var(--on-surface)',
                                resize: 'none',
                                outline: 'none',
                                fontFamily: 'var(--font-mono, "Fira Code", monospace)'
                            }}
                        />
                    ) : (
                        <div 
                            className="custom-scrollbar"
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                padding: '4rem 6rem',
                                overflowY: 'auto'
                            }}
                        >
                            <div className="markdown-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
                                <ReactMarkdown>
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
