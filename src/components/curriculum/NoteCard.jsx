import React from 'react';
import { motion } from 'framer-motion';
import { Hash, Clock, Trash2 } from 'lucide-react';
import './NoteCard.css';

export default function NoteCard({ note, subjectTitle, subjectColor, topicTitle, topicColor, setItemToDelete, onClick }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="note-card ghost-boundary card delete-container"
    >
        <div className="note-card-tags">
           <span 
               className="note-tag note-subject-tag"
               style={{ backgroundColor: subjectColor || 'var(--surface-container-highest)' }}
           >
               {subjectTitle}
           </span>
           {topicTitle && (
             <span 
                 className="note-tag note-topic-tag"
                 style={{ backgroundColor: topicColor || 'var(--surface-container-lowest)' }}
             >
                 <Hash size={12} /> {topicTitle}
             </span>
           )}
        </div>
        <h3 className="text-display-md note-card-title">
            {note.title}
        </h3>
        
        <div className="note-card-meta">
           <Clock size={14} /> Edited {note.lastEdited ? new Date(note.lastEdited).toLocaleDateString() : 'Just now'}
        </div>

        <div 
            onClick={(e) => { 
              e.stopPropagation(); 
              setItemToDelete({ type: 'note', id: note.id });
            }}
            className="delete-pane note-card-delete-pane"
        >
           <Trash2 size={24} />
        </div>
    </motion.div>
  );
}
