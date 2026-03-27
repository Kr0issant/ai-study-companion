import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, Plus, Hash } from 'lucide-react';
import { itemVariants } from '../../constants/FramerVariants';
import './SubjectConstellation.css';

export default function SubjectConstellation({ 
  subjects, activeTopics, activeSubjectId, setActiveSubjectId, 
  setItemToDelete, setIsSubjectModalOpen, setIsTopicModalOpen,
  onEditSubject, onEditTopic 
}) {
  const scrollerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragMoved, setDragMoved] = useState(false);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragMoved(false);
    setStartX(e.pageX - scrollerRef.current.offsetLeft);
    setScrollLeft(scrollerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    
    if (Math.abs(walk) > 5) {
      setDragMoved(true);
    }
    
    scrollerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleCardClick = (e, callback) => {
    // If we moved the mouse more than a threshold, don't trigger the click
    if (dragMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    callback();
  };

  return (
    <motion.section variants={itemVariants} className="subject-constellation-section">
        {/* Subject Constellation */}
        <div 
            ref={scrollerRef}
            className={`subject-scroller custom-scrollbar ${isDragging ? 'is-dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
        >
            {/* All Notes / Reset Filter */}
            <motion.div 
                onClick={(e) => handleCardClick(e, () => setActiveSubjectId(null))}
                whileHover={{ boxShadow: 'var(--shadow-ambient-hover)' }}
                whileTap={{ scale: 0.95 }}
                className={`subject-card ${!activeSubjectId ? 'active active-all' : 'inactive ghost-boundary'}`}
            >
                <div className="subject-icon-box">
                    <Hash size={20} />
                </div>
                <span className="subject-card-title">All Notes</span>
            </motion.div>

            {subjects.map(s => (
               <motion.div 
                  key={s.id}
                onClick={(e) => handleCardClick(e, () => {
                   if (activeSubjectId === s.id) {
                       onEditSubject(s);
                   } else {
                       setActiveSubjectId(s.id);
                   }
                })}
                  whileHover={{ boxShadow: 'var(--shadow-ambient-hover)' }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                      backgroundColor: activeSubjectId === s.id ? s.color : 'var(--surface-container-low)',
                      color: activeSubjectId === s.id ? 'var(--on-primary-container)' : 'var(--on-surface)',
                  }}
                  className={`subject-card delete-container ${activeSubjectId === s.id ? 'active' : 'inactive ghost-boundary'}`}
               >
                   <div className="subject-icon-box" style={{ backgroundColor: activeSubjectId === s.id ? 'rgba(255,255,255,0.2)' : 'var(--surface-container-highest)' }}>
                       <BookOpen size={20} />
                   </div>
                   <span className="subject-card-title">{s.title}</span>
                   
                   <div 
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           setItemToDelete({ type: 'subject', id: s.id });
                         }}
                         className="delete-pane subject-delete-pane"
                   >
                       <X size={22} />
                   </div>
               </motion.div>
            ))}
        </div>

        {/* Topics row for active subject */}
        <AnimatePresence mode="wait">
          {activeSubjectId && (
             <motion.div 
                 key={activeSubjectId}
                 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.15 }}
                 className="topics-row-container ghost-boundary"
             >
                 <div className="topics-row-header">
                     <span className="topics-row-label">Topics</span>
                     <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => setIsTopicModalOpen(true)}>
                         <Plus size={16} className="mr-xs" /> Add Topic
                     </button>
                 </div>
                 {activeTopics.length > 0 ? activeTopics.map(t => (
                     <div 
                         key={t.id} 
                         onClick={() => onEditTopic(t)}
                         style={{ backgroundColor: t.color || 'var(--surface-container-high)' }} 
                         className="topic-chip ghost-boundary delete-container"
                     >
                         <Hash size={14} color="var(--primary)" /> {t.title}
                         
                         <div 
                             onClick={(e) => { 
                               e.stopPropagation(); 
                               setItemToDelete({ type: 'topic', id: t.id });
                             }}
                             className="delete-pane topic-delete-pane"
                         >
                             <X size={16} />
                         </div>
                     </div>
                 )) : (
                      <span className="topics-empty-msg">No topics defined yet. Add one to organize your notes.</span>
                 )}
             </motion.div>
          )}
        </AnimatePresence>
    </motion.section>
  );
}
