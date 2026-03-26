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
       <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,31,42,0.4)', backdropFilter: 'blur(5px)' }} onClick={onClose} />
           <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
               style={{ position: 'relative', width: '90%', maxWidth: '500px', backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '3rem', boxShadow: '0 24px 64px rgba(0,31,42,0.2)' }}
           >
               <button onClick={onClose} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline-variant)' }}><X size={24} /></button>
               <h2 className="text-display-md" style={{ marginBottom: '2.5rem', fontSize: '2rem' }}>{isEdit ? 'Edit Subject' : 'Add Subject'}</h2>
               <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                   <label style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                       <span style={{ fontWeight: 600, color: 'var(--on-surface-muted)' }}>Subject Title</span>
                       <input type="text" className="input-field" style={{ fontSize: '1.25rem' }} autoFocus placeholder="e.g. Theoretical Physics" value={title} onChange={e => setTitle(e.target.value)} required />
                   </label>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                       <span style={{ fontWeight: 600, color: 'var(--on-surface-muted)' }}>Accent Color</span>
                       <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                           {colors.map(c => (
                               <button 
                                   key={c} 
                                   type="button"
                                   onClick={() => setColor(c)}
                                   style={{ 
                                       width: '40px', height: '40px', borderRadius: '50%', 
                                       border: color === c ? '3px solid var(--primary)' : '1px solid var(--outline-variant)', 
                                       backgroundColor: c, cursor: 'pointer', transition: 'transform 0.2s',
                                       transform: color === c ? 'scale(1.1)' : 'none'
                                   }}
                                />
                           ))}
                       </div>
                   </div>

                   <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', marginTop: '1rem' }}>
                       <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                       <button type="submit" className="btn btn-primary" disabled={!title.trim()}>{isEdit ? 'Save Changes' : 'Add Subject'}</button>
                   </div>
               </form>
           </motion.div>
       </div>
   );
}
