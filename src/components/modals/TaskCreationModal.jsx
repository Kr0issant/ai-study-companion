import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { format } from 'date-fns';

export default function TaskCreationModal({ onClose, subjects, addTask }) {
    const [title, setTitle] = useState('');
    const [subjectId, setSubjectId] = useState(subjects[0]?.id || 'None');
    const [priority, setPriority] = useState('High');
    const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        addTask({
            id: Date.now().toString(),
            title,
            subjectId,
            priority,
            isCompleted: false,
            dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString()
        });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={onClose} />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="modal-content-card"
                style={{ width: '90%', maxWidth: '550px', padding: '3rem' }}
            >
                <button onClick={onClose} className="modal-close-btn"><X size={24} /></button>
                <h2 className="text-display-lg" style={{ fontSize: '2.5rem', marginBottom: '2.5rem' }}>Add Task</h2>
                <form onSubmit={handleSubmit} className="flex-stack gap-lg">
                    <label className="flex-stack gap-xs">
                        <span className="premium-muted-label">Task Title</span>
                        <input 
                            type="text" 
                            className="input-field" 
                            style={{ fontSize: '1.25rem', padding: '1rem' }} 
                            autoFocus 
                            placeholder="e.g. Master the Chain Rule" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            required 
                        />
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <label className="flex-stack gap-xs">
                            <span className="premium-muted-label">Subject</span>
                            <select className="input-field" style={{ padding: '0.875rem' }} value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                <option value="None">None</option>
                            </select>
                        </label>
                        <label className="flex-stack gap-xs">
                            <span className="premium-muted-label">Priority</span>
                            <select className="input-field" style={{ padding: '0.875rem' }} value={priority} onChange={e => setPriority(e.target.value)}>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                                <option value="None">None</option>
                            </select>
                        </label>
                    </div>
                    <label className="flex-stack gap-xs">
                        <span className="premium-muted-label">Due Date</span>
                        <input 
                            type="date" 
                            className="input-field" 
                            style={{ padding: '0.875rem' }} 
                            value={dueDate} 
                            onChange={e => setDueDate(e.target.value)} 
                            required 
                        />
                    </label>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={!title.trim()}>Add Task</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
