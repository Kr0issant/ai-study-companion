import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, BookOpen, Check, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ConfirmationModal from '../ConfirmationModal';

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
                    <div className="flex-column gap-md flex-1">
                        <input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Note Title..."
                            className="note-title-input"
                        />
                        <div className="note-meta-controls">
                            <select 
                                value={subjectId}
                                onChange={(e) => {
                                    setSubjectId(e.target.value);
                                    setTopicId(''); // Reset topic when subject changes
                                }}
                                className="input-field note-meta-select"
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

                        <div className="divider-narrow" />

                        {hasChanges() && (
                            <button 
                                className="btn btn-primary"
                                onClick={handleSave}
                                style={{ padding: '0.65rem 1.25rem' }}
                            >
                                <Check size={18} className="mr-xs" /> Save Note
                            </button>
                        )}

                        <button 
                            onClick={handleClose} 
                            className="close-circle-btn"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="note-content-area">
                    {isEditing ? (
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Type your note here in Markdown..."
                            className="custom-scrollbar note-editor-textarea"
                        />
                    ) : (
                        <div className="custom-scrollbar note-viewer-container">
                            <div className="markdown-stage">
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
