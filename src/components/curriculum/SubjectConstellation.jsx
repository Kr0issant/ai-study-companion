import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trash2, Plus, Hash } from 'lucide-react';
import { itemVariants } from '../../constants/FramerVariants';

export default function SubjectConstellation({ 
  subjects, activeTopics, activeSubjectId, setActiveSubjectId, 
  setItemToDelete, setIsSubjectModalOpen, setIsTopicModalOpen,
  onEditSubject, onEditTopic 
}) {
  return (
    <motion.section variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Subject Constellation */}
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', paddingRight: '1rem' }} className="custom-scrollbar">
            {/* All Notes / Reset Filter */}
            <motion.div 
                onClick={() => setActiveSubjectId(null)}
                whileHover={{ boxShadow: 'var(--shadow-ambient-hover)' }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                    borderRadius: 'var(--radius-xl)',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start',
                    backgroundColor: !activeSubjectId ? 'var(--primary)' : 'var(--surface-container-low)',
                    color: !activeSubjectId ? 'white' : 'var(--on-surface)',
                    boxShadow: !activeSubjectId ? 'var(--shadow-glass)' : 'var(--shadow-ambient)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    flexShrink: 0, minWidth: '180px', padding: '1.5rem'
                }}
                className={!activeSubjectId ? '' : 'ghost-boundary'}
            >
                <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: !activeSubjectId ? 'rgba(255,255,255,0.2)' : 'var(--surface-container-highest)' }}>
                    <Hash size={20} />
                </div>
                <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>All Notes</span>
            </motion.div>

            {subjects.map(s => (
               <motion.div 
                  key={s.id}
                  onClick={() => {
                    if (activeSubjectId === s.id) {
                        onEditSubject(s);
                    } else {
                        setActiveSubjectId(s.id);
                    }
                  }}
                  whileHover={{ boxShadow: 'var(--shadow-ambient-hover)' }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                      borderRadius: 'var(--radius-xl)',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start',
                      backgroundColor: activeSubjectId === s.id ? s.color : 'var(--surface-container-low)',
                      color: activeSubjectId === s.id ? 'var(--on-primary-container)' : 'var(--on-surface)',
                      boxShadow: activeSubjectId === s.id ? 'var(--shadow-glass)' : 'var(--shadow-ambient)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      flexShrink: 0, minWidth: '180px', padding: '1.5rem'
                  }}
                  className={`delete-container ${activeSubjectId === s.id ? '' : 'ghost-boundary'}`}
               >
                   <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: activeSubjectId === s.id ? 'rgba(255,255,255,0.2)' : 'var(--surface-container-highest)' }}>
                       <BookOpen size={20} />
                   </div>
                   <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>{s.title}</span>
                   
                   <div 
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           setItemToDelete({ type: 'subject', id: s.id });
                         }}
                         className="delete-pane"
                         style={{
                             borderTopRightRadius: 'var(--radius-xl)', 
                             borderBottomRightRadius: 'var(--radius-xl)',
                             width: '50px'
                         }}
                   >
                       <Trash2 size={20} />
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
                 style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', padding: '1.5rem', backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)' }}
                 className="ghost-boundary"
             >
                 <div style={{ width: '100%', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Topics</span>
                     <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => setIsTopicModalOpen(true)}>
                         <Plus size={16} /> Add Topic
                     </button>
                 </div>
                 {activeTopics.length > 0 ? activeTopics.map(t => (
                     <div 
                         key={t.id} 
                         onClick={() => onEditTopic(t)}
                         style={{ 
                             display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', 
                             borderRadius: 'var(--radius-full)', 
                             backgroundColor: t.color || 'var(--surface-container-high)', 
                             fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer'
                         }} 
                         className="ghost-boundary delete-container"
                     >
                         <Hash size={14} color="var(--primary)" /> {t.title}
                         
                         <div 
                             onClick={(e) => { 
                               e.stopPropagation(); 
                               setItemToDelete({ type: 'topic', id: t.id });
                             }}
                             className="delete-pane"
                             style={{
                                 borderTopRightRadius: 'var(--radius-full)', 
                                 borderBottomRightRadius: 'var(--radius-full)',
                                 width: '35px'
                             }}
                         >
                             <Trash2 size={14} />
                         </div>
                     </div>
                 )) : (
                      <span style={{ color: 'var(--outline-variant)', fontSize: '0.875rem' }}>No topics defined yet. Add one to organize your notes.</span>
                 )}
             </motion.div>
          )}
        </AnimatePresence>
    </motion.section>
  );
}
