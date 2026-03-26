import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FolderOpen, FileText, CheckSquare, Square } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export default function ContextSelector({ selectedNodeIds, toggleNode, onNoteDoubleClick }) {
    const { subjects, topics, notes } = useStudy();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--surface-variant)' }}>
                <h3 className="text-title-md">Study Context</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-muted)', marginTop: '0.25rem' }}>
                    Select material to feed to the AI Assistant.
                </p>
            </div>

            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {subjects.map(subject => {
                    const subjectTopics = topics.filter(t => t.subjectId === subject.id);
                    const subjectNotes = notes.filter(n => n.subjectId === subject.id && !n.topicId); // Notes directly under subject

                    return (
                        <div key={subject.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {/* Subject Header */}
                            <div 
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                                onClick={() => toggleNode(`subject-${subject.id}`)}
                            >
                                {selectedNodeIds.includes(`subject-${subject.id}`) ? <CheckSquare size={18} color="var(--primary)" /> : <Square size={18} color="var(--outline-variant)" />}
                                <BookOpen size={16} color="var(--primary)" />
                                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{subject.title}</span>
                            </div>

                            {/* Topics under Subject */}
                            <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {subjectTopics.map(topic => {
                                    const topicNotes = notes.filter(n => n.topicId === topic.id);
                                    return (
                                        <div key={topic.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div 
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                                                onClick={() => toggleNode(`topic-${topic.id}`)}
                                            >
                                                {selectedNodeIds.includes(`topic-${topic.id}`) ? <CheckSquare size={16} color="var(--primary)" /> : <Square size={16} color="var(--outline-variant)" />}
                                                <FolderOpen size={14} color="var(--secondary)" />
                                                <span style={{ fontSize: '0.9rem', color: 'var(--on-surface-muted)' }}>{topic.title}</span>
                                            </div>

                                            {/* Notes under Topic */}
                                            <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                {topicNotes.map(note => (
                                                    <div 
                                                        key={note.id}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                                                        onClick={() => toggleNode(`note-${note.id}`)}
                                                        onDoubleClick={() => onNoteDoubleClick && onNoteDoubleClick(note.id)}
                                                    >
                                                        {selectedNodeIds.includes(`note-${note.id}`) ? <CheckSquare size={14} color="var(--primary)" /> : <Square size={14} color="var(--outline-variant)" />}
                                                        <FileText size={12} color="var(--tertiary)" />
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {note.title}
                                                        </span>
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
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                                        onClick={() => toggleNode(`note-${note.id}`)}
                                        onDoubleClick={() => onNoteDoubleClick && onNoteDoubleClick(note.id)}
                                    >
                                        {selectedNodeIds.includes(`note-${note.id}`) ? <CheckSquare size={14} color="var(--primary)" /> : <Square size={14} color="var(--outline-variant)" />}
                                        <FileText size={12} color="var(--tertiary)" />
                                        <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-muted)' }}>{note.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Uncategorized Notes */}
                {notes.filter(n => !n.subjectId && !n.topicId).length > 0 && (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--on-surface-muted)' }}>Uncategorized Notes</span>
                        {notes.filter(n => !n.subjectId && !n.topicId).map(note => (
                            <div 
                                key={note.id}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', paddingLeft: '0.5rem' }}
                                onClick={() => toggleNode(`note-${note.id}`)}
                                onDoubleClick={() => onNoteDoubleClick && onNoteDoubleClick(note.id)}
                            >
                                {selectedNodeIds.includes(`note-${note.id}`) ? <CheckSquare size={14} color="var(--primary)" /> : <Square size={14} color="var(--outline-variant)" />}
                                <FileText size={12} color="var(--tertiary)" />
                                <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-muted)' }}>{note.title}</span>
                            </div>
                        ))}
                     </div>
                )}
            </div>
        </div>
    );
}
