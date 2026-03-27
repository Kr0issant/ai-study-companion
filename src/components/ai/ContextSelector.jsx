import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FolderOpen, FileText, CheckSquare, Square, ExternalLink } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

// Styles
import './ContextSelector.css';

export default function ContextSelector({ selectedNodeIds, toggleNode, onNoteDoubleClick }) {
    const { subjects, topics, notes } = useStudy();

    return (
        <div className="context-selector-container">
            <div className="context-selector-header">
                <h3 className="text-title-md">Study Context</h3>
                <p className="context-selector-subtitle">
                    Select material to feed to the AI Assistant.
                </p>
            </div>

            <div className="context-selector-list custom-scrollbar">
                {subjects.map(subject => {
                    const subjectTopics = topics.filter(t => t.subjectId === subject.id);
                    const subjectNotes = notes.filter(n => n.subjectId === subject.id && !n.topicId); 

                    return (
                        <div key={subject.id} className="context-subject-group">
                            {/* Subject Header */}
                            <div 
                                className="context-item-row"
                                onClick={() => toggleNode(`subject-${subject.id}`)}
                            >
                                {selectedNodeIds.includes(`subject-${subject.id}`) ? <CheckSquare size={18} color="var(--primary)" /> : <Square size={18} color="var(--outline-variant)" />}
                                <BookOpen size={16} color="var(--primary)" />
                                <span className="context-subject-header">{subject.title}</span>
                            </div>

                            {/* Topics under Subject */}
                            <div className="context-topic-list">
                                {subjectTopics.map(topic => {
                                    const topicNotes = notes.filter(n => n.topicId === topic.id);
                                    return (
                                        <div key={topic.id} className="context-topic-group">
                                            <div 
                                                className="context-item-row"
                                                onClick={() => toggleNode(`topic-${topic.id}`)}
                                            >
                                                {selectedNodeIds.includes(`topic-${topic.id}`) ? <CheckSquare size={16} color="var(--primary)" /> : <Square size={16} color="var(--outline-variant)" />}
                                                <FolderOpen size={14} color="var(--secondary)" />
                                                <span className="context-topic-label">{topic.title}</span>
                                            </div>

                                            {/* Notes under Topic */}
                                            <div className="context-note-list">
                                                {topicNotes.map(note => (
                                                    <div 
                                                        key={note.id}
                                                        className="context-item-row context-note-item"
                                                        onClick={() => toggleNode(`note-${note.id}`)}
                                                        onDoubleClick={() => onNoteDoubleClick && onNoteDoubleClick(note.id)}
                                                    >
                                                        {selectedNodeIds.includes(`note-${note.id}`) ? <CheckSquare size={14} color="var(--primary)" /> : <Square size={14} color="var(--outline-variant)" />}
                                                        <FileText size={12} color="var(--tertiary)" />
                                                        <span className="context-note-label">
                                                            {note.title}
                                                        </span>
                                                        <button 
                                                            className="context-open-note-btn"
                                                            onClick={(e) => { e.stopPropagation(); onNoteDoubleClick && onNoteDoubleClick(note.id); }}
                                                            title="Open Note"
                                                        >
                                                            <ExternalLink size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Top-level Subject Notes */}
                                {subjectNotes.map(note => (
                                    <div 
                                        key={note.id}
                                        className="context-item-row context-note-item"
                                        onClick={() => toggleNode(`note-${note.id}`)}
                                        onDoubleClick={() => onNoteDoubleClick && onNoteDoubleClick(note.id)}
                                    >
                                        {selectedNodeIds.includes(`note-${note.id}`) ? <CheckSquare size={14} color="var(--primary)" /> : <Square size={14} color="var(--outline-variant)" />}
                                        <FileText size={12} color="var(--tertiary)" />
                                        <span className="context-note-label">{note.title}</span>
                                        <button 
                                            className="context-open-note-btn"
                                            onClick={(e) => { e.stopPropagation(); onNoteDoubleClick && onNoteDoubleClick(note.id); }}
                                            title="Open Note"
                                        >
                                            <ExternalLink size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Uncategorized Notes */}
                {notes.filter(n => !n.subjectId && !n.topicId).length > 0 && (
                     <div className="context-uncategorized-group">
                        <span className="context-uncategorized-label">Uncategorized Notes</span>
                        {notes.filter(n => !n.subjectId && !n.topicId).map(note => (
                            <div 
                                key={note.id}
                                className="context-item-row context-uncategorized-note context-note-item"
                                onClick={() => toggleNode(`note-${note.id}`)}
                                onDoubleClick={() => onNoteDoubleClick && onNoteDoubleClick(note.id)}
                            >
                                {selectedNodeIds.includes(`note-${note.id}`) ? <CheckSquare size={14} color="var(--primary)" /> : <Square size={14} color="var(--outline-variant)" />}
                                <FileText size={12} color="var(--tertiary)" />
                                <span className="context-note-label">{note.title}</span>
                                <button 
                                    className="context-open-note-btn"
                                    onClick={(e) => { e.stopPropagation(); onNoteDoubleClick && onNoteDoubleClick(note.id); }}
                                    title="Open Note"
                                >
                                    <ExternalLink size={12} />
                                </button>
                            </div>
                        ))}
                     </div>
                )}
            </div>
        </div>
    );
}
