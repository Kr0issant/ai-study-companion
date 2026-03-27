import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, X } from 'lucide-react';

// Styles
import './FocusTasks.css';

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
        <div className="focus-tasks-card card">
            <div className="focus-tasks-header">
                <h3 className="text-title-lg">Focus Tasks</h3>
                <span className="focus-pending-badge">
                    {pendingCount} PENDING
                </span>
            </div>

            <div className="focus-tasks-list custom-scrollbar">
                <AnimatePresence>
                    {tasks.map(t => (
                        <motion.div 
                            key={t.id}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className={`focus-task-item delete-container ${t.isCompleted ? "is-completed" : "is-todo ghost-boundary"}`}
                            onClick={() => toggleTask(t.id)}
                        >
                            {t.isCompleted ? (
                                <CheckCircle2 size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                            ) : (
                                <Circle size={20} color="var(--outline-variant)" style={{ flexShrink: 0 }} />
                            )}
                            <div style={{ flex: 1 }}>
                                <span className={`focus-task-title ${t.isCompleted ? 'strikethrough' : ''}`}>
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
                                <X size={22} />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {tasks.length === 0 && (
                    <div className="focus-tasks-empty">
                        No session tasks yet.
                    </div>
                )}
            </div>

            <div className="focus-tasks-footer">
                {isAdding ? (
                    <form onSubmit={handleAddTask} className="focus-add-form">
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Add a focus objective..." 
                            autoFocus 
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                        />
                        <div className="focus-add-actions">
                            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setIsAdding(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={!newTaskTitle.trim()}>Add</button>
                        </div>
                    </form>
                ) : (
                    <button 
                        className="btn btn-ghost focus-add-trigger" 
                        onClick={() => setIsAdding(true)}
                    >
                        <Plus size={18} /> Add Focus Task
                    </button>
                )}
            </div>
        </div>
    );
}
