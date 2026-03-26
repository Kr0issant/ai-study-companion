import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Hash, Trash2 } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export default function FocusTasks({ tasks, addTask, toggleTask, deleteTask }) {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const pendingCount = tasks.filter(t => !t.isCompleted).length;

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        addTask(newTaskTitle);
        setNewTaskTitle('');
        setIsAdding(false);
    };

    return (
        <div 
            className="card" 
            style={{ 
                height: '480px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.5rem', 
                backgroundColor: 'var(--surface-container-low)',
                padding: '2rem',
                borderRadius: '2.5rem'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <h3 className="text-title-lg">Focus Tasks</h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-muted)', padding: '0.25rem 0.65rem', backgroundColor: 'var(--surface-container-highest)', borderRadius: 'var(--radius-sm)' }}>
                    {pendingCount} PENDING
                </span>
            </div>

            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <AnimatePresence>
                    {tasks.map(t => (
                        <motion.div 
                            key={t.id}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', 
                                backgroundColor: t.isCompleted ? 'transparent' : 'var(--surface-container-lowest)', 
                                borderRadius: '1.5rem', cursor: 'pointer',
                                opacity: t.isCompleted ? 0.6 : 1,
                                border: t.isCompleted ? '1px dashed var(--outline-variant)' : '1px solid transparent'
                            }}
                            className={`delete-container ${t.isCompleted ? "" : "ghost-boundary"}`}
                            onClick={() => toggleTask(t.id)}
                        >
                            {t.isCompleted ? (
                                <CheckCircle2 size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                            ) : (
                                <Circle size={20} color="var(--outline-variant)" style={{ flexShrink: 0 }} />
                            )}
                            <div style={{ flex: 1 }}>
                                <span style={{ 
                                    fontWeight: 500, fontSize: '1rem', lineHeight: 1.4,
                                    textDecoration: t.isCompleted ? 'line-through' : 'none',
                                    color: t.isCompleted ? 'var(--on-surface-muted)' : 'var(--on-surface)'
                                }}>
                                    {t.title}
                                </span>
                            </div>
                            
                            {/* Signature Red Fade Delete Pane */}
                            <div 
                                className="delete-pane"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(t.id);
                                }}
                            >
                                <Trash2 size={18} />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {tasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--outline-variant)', fontSize: '0.875rem' }}>
                        No session tasks yet.
                    </div>
                )}
            </div>

            <div style={{ flexShrink: 0, borderTop: '1px solid var(--surface-variant)', paddingTop: '1.5rem' }}>
                {isAdding ? (
                    <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Add a focus objective..." 
                            autoFocus 
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setIsAdding(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={!newTaskTitle.trim()}>Add</button>
                        </div>
                    </form>
                ) : (
                    <button 
                        className="btn btn-ghost" 
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', color: 'var(--on-surface-muted)' }}
                        onClick={() => setIsAdding(true)}
                    >
                        <Plus size={18} /> Add Focus Task
                    </button>
                )}
            </div>
        </div>
    );
}
