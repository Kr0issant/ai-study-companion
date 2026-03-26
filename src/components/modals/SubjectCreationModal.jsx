import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function SubjectCreationModal({ onClose, addSubject, updateSubject, subject }) {
    const [title, setTitle] = useState(subject?.title || '');
    const [color, setColor] = useState(subject?.color || '#ceedfd');

    const colors = [
        '#e6f6ff', '#ceedfd', '#b7ebce', '#f3e5f5', '#fff9c4', '#f0c8a1', '#f2bcb2', '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9', '#bbdefb', '#b2ebf2', '#b2dfdb', '#c8e6c9'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        
        if (subject) {
            updateSubject(subject.id, { title, color });
        } else {
            addSubject({
                id: Date.now().toString(),
                title,
                color
            });
        }
        onClose();
    };

    const isEdit = !!subject;

    return (
        <div className="modal-overlay">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={onClose} />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="modal-content-card"
                style={{ width: '90%', maxWidth: '500px', padding: '3rem' }}
            >
                <button onClick={onClose} className="modal-close-btn"><X size={24} /></button>
                <h2 className="text-display-md" style={{ marginBottom: '2.5rem', fontSize: '2rem' }}>{isEdit ? 'Edit Subject' : 'Add Subject'}</h2>
                <form onSubmit={handleSubmit} className="flex-stack gap-lg">
                    <label className="flex-stack gap-xs">
                        <span className="premium-muted-label">Subject Title</span>
                        <input 
                            type="text" 
                            className="input-field" 
                            style={{ fontSize: '1.25rem' }} 
                            autoFocus 
                            placeholder="e.g. Theoretical Physics" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            required 
                        />
                    </label>
                    
                    <div className="flex-stack gap-xs">
                        <span className="premium-muted-label">Accent Color</span>
                        <div className="color-picker-grid">
                            {colors.map(c => (
                                <button 
                                    key={c} 
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`color-swatch ${color === c ? 'active' : 'inactive'}`}
                                    style={{ backgroundColor: c }}
                                 />
                            ))}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={!title.trim()}>{isEdit ? 'Save Changes' : 'Add Subject'}</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
