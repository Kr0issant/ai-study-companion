import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function RevisionModal({ date, onClose, tasks }) {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,31,42,0.4)', backdropFilter: 'blur(5px)' }} onClick={onClose} />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                style={{ position: 'relative', width: '90%', maxWidth: '500px', backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '3rem', boxShadow: '0 24px 64px rgba(0,31,42,0.2)' }}
            >
                <button onClick={onClose} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline-variant)' }}><X size={24} /></button>
                <h2 className="text-title-lg" style={{ marginBottom: '2rem', fontSize: '1.75rem' }}>Tasks for {format(date, 'MMMM d, yyyy')}</h2>
                
                {tasks.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Scheduled Tasks</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="custom-scrollbar">
                             {tasks.map((t) => (
                                 <div 
                                     key={t.id} 
                                     className="layer-low ghost-boundary" 
                                     style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', fontWeight: 500, opacity: t.isCompleted ? 0.6 : 1, textDecoration: t.isCompleted ? 'line-through' : 'none' }}
                                 >
                                     • {t.title}
                                 </div>
                             ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--on-surface-muted)', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)' }} className="ghost-boundary">
                        No tasks scheduled for this date.
                    </div>
                )}

                <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>Close</button>
                </div>
            </motion.div>
        </div>
    )
}
