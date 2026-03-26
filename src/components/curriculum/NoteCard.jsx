import React from 'react';
import { motion } from 'framer-motion';
import { Hash, Clock, Trash2 } from 'lucide-react';

export default function NoteCard({ note, subjectTitle, subjectColor, topicTitle, topicColor, setItemToDelete, onClick }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      style={{
          minHeight: '240px',
          height: '100%',
          backgroundColor: 'var(--surface-container-low)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer'
      }}
      className="ghost-boundary card delete-container"
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
           <span style={{ 
               fontSize: '0.75rem', 
               fontWeight: 700, 
               padding: '0.35rem 0.85rem', 
               borderRadius: 'var(--radius-full)', 
               backgroundColor: subjectColor || 'var(--surface-container-highest)', 
               color: 'rgba(0,0,0,0.7)' 
           }}>
               {subjectTitle}
           </span>
           {topicTitle && (
             <span style={{ 
                 fontSize: '0.75rem', 
                 fontWeight: 700, 
                 padding: '0.35rem 0.85rem', 
                 borderRadius: 'var(--radius-full)', 
                 backgroundColor: topicColor || 'var(--surface-container-lowest)', 
                 color: 'rgba(0,0,0,0.6)', 
                 display: 'flex', 
                 alignItems: 'center', 
                 gap: '0.35rem' 
             }}>
                 <Hash size={12} /> {topicTitle}
             </span>
           )}
        </div>
        <h3 className="text-display-md" style={{ fontSize: '1.5rem', lineHeight: 1.3, letterSpacing: '-0.02em', flex: 1 }}>
            {note.title}
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--outline-variant)', fontSize: '0.8rem', marginTop: 'auto' }}>
           <Clock size={14} /> Edited {note.lastEdited ? new Date(note.lastEdited).toLocaleDateString() : 'Just now'}
        </div>

        <div 
            onClick={(e) => { 
              e.stopPropagation(); 
              setItemToDelete({ type: 'note', id: note.id });
            }}
            className="delete-pane"
            style={{
                borderTopRightRadius: 'var(--radius-xl)', 
                borderBottomRightRadius: 'var(--radius-xl)',
                width: '60px'
            }}
        >
           <Trash2 size={24} />
        </div>
    </motion.div>
  );
}
