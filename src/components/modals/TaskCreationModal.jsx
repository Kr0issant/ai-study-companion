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
       <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,31,42,0.4)', backdropFilter: 'blur(5px)' }} onClick={onClose} />
           <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
               style={{ position: 'relative', width: '90%', maxWidth: '550px', backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: '3rem', boxShadow: '0 24px 64px rgba(0,31,42,0.2)' }}
           >
               <button onClick={onClose} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline-variant)' }}><X size={24} /></button>
               <h2 className="text-display-lg" style={{ fontSize: '2.5rem', marginBottom: '2.5rem' }}>Add Task</h2>
               <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                   <label style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                       <span style={{ fontWeight: 600, color: 'var(--on-surface-muted)' }}>Task Title</span>
                       <input type="text" className="input-field" style={{ fontSize: '1.25rem', padding: '1rem' }} autoFocus placeholder="e.g. Master the Chain Rule" value={title} onChange={e => setTitle(e.target.value)} required />
                   </label>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                       <label style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                           <span style={{ fontWeight: 600, color: 'var(--on-surface-muted)' }}>Subject</span>
                           <select className="input-field" style={{ padding: '0.875rem' }} value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                               {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                               <option value="None">None</option>
                           </select>
                       </label>
                       <label style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                           <span style={{ fontWeight: 600, color: 'var(--on-surface-muted)' }}>Priority</span>
                           <select className="input-field" style={{ padding: '0.875rem' }} value={priority} onChange={e => setPriority(e.target.value)}>
                               <option value="High">High</option>
                               <option value="Medium">Medium</option>
                               <option value="Low">Low</option>
                               <option value="None">None</option>
                           </select>
                       </label>
                   </div>
                   <label style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                       <span style={{ fontWeight: 600, color: 'var(--on-surface-muted)' }}>Due Date</span>
                       <input 
                           type="date" 
                           className="input-field" 
                           style={{ padding: '0.875rem' }} 
                           value={dueDate} 
                           onChange={e => setDueDate(e.target.value)} 
                           required 
                       />
                   </label>

                   <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', marginTop: '1.5rem' }}>
                       <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                       <button type="submit" className="btn btn-primary" disabled={!title.trim()}>Add Task</button>
                   </div>
               </form>
           </motion.div>
       </div>
   )
}
