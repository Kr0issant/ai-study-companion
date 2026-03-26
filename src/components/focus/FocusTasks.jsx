import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Hash } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export default function FocusTasks({ tasks, subjects }) {
    const { addTask, updateTask } = useStudy();
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const pendingTasks = tasks.filter(t => !t.isCompleted);

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        addTask({
            id: Date.now().toString(),
            title: newTaskTitle,
            subjectId: 'None',
            dueDate: new Date().toISOString(),
            isCompleted: false,
            priority: 'Medium'
        });
        setNewTaskTitle('');
        setIsAdding(false);
    };

    const getSubjectColor = (sid) => subjects.find(s => s.id === sid)?.color || 'var(--surface-container-high)';

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
                borderRadius: '2.5rem' // Increased rounding as requested
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <h3 className="text-title-lg">Focus Tasks</h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-muted)', padding: '0.25rem 0.65rem', backgroundColor: 'var(--surface-container-highest)', borderRadius: 'var(--radius-sm)' }}>
                    {pendingTasks.length} PENDING
                </span>
            </div>

            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <AnimatePresence>
                    {pendingTasks.map(t => (
                        <motion.div 
                            key={t.id}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            style={{ 
                                display: 'flex', gap: '1rem', padding: '1.25rem', 
                                backgroundColor: 'var(--surface-container-lowest)', 
                                borderRadius: '1.5rem', // Increased rounding for inner tasks
                                cursor: 'pointer' 
                            }}
                            className="ghost-boundary"
                            onClick={() => updateTask(t.id, { isCompleted: true })}
                        >
                            <Circle size={20} color="var(--outline-variant)" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 500, fontSize: '1rem', lineHeight: 1.4 }}>{t.title}</span>
                                {t.subjectId && t.subjectId !== 'None' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getSubjectColor(t.subjectId) }} />
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-muted)' }}>
                                            {subjects.find(s => s.id === t.subjectId)?.title}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {pendingTasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--outline-variant)', fontSize: '0.875rem' }}>
                        All tasks completed.
                    </div>
                )}
            </div>

            <div style={{ flexShrink: 0, borderTop: '1px solid var(--surface-variant)', paddingTop: '1.5rem' }}>
                {isAdding ? (
                    <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Enter task objective..." 
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
                        <Plus size={18} /> Add Session Task
                    </button>
                )}
            </div>
        </div>
    );
}
