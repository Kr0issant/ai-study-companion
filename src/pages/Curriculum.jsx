import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit3 } from 'lucide-react';

// Context
import { useStudy } from '../context/StudyContext';

// Components
import ConfirmationModal from '../components/ConfirmationModal';
import SubjectConstellation from '../components/curriculum/SubjectConstellation';
import NoteCard from '../components/curriculum/NoteCard';

// Modals
import SubjectCreationModal from '../components/modals/SubjectCreationModal';
import TopicCreationModal from '../components/modals/TopicCreationModal';
import NoteEditorModal from '../components/modals/NoteEditorModal';

// Constants
import { containerVariants, itemVariants } from '../constants/FramerVariants';

export default function Curriculum() {
  const { subjects, topics, notes, addSubject, updateSubject, deleteSubject, addTopic, updateTopic, deleteTopic, addNote, updateNote, deleteNote } = useStudy();
  
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState(null);
  const [topicToEdit, setTopicToEdit] = useState(null);
  const [noteToEdit, setNoteToEdit] = useState(null);

  // Deletion Confirmation State
  const [itemToDelete, setItemToDelete] = useState(null); // { type, id }

  const activeTopics = topics.filter(t => t.subjectId === activeSubjectId);
  const activeNotes = notes.filter(n => {
      const matchesSubject = !activeSubjectId || n.subjectId === activeSubjectId;
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSubject && matchesSearch;
  });

  const getSubjectTitle = (sid) => subjects.find(s => s.id === sid)?.title || 'Uncategorized';
  const getTopicTitle = (tid) => topics.find(t => t.id === tid)?.title || 'General';

  const getSubjectColor = (sid) => subjects.find(s => s.id === sid)?.color || 'var(--surface-container-highest)';
  const getTopicColor = (tid) => topics.find(t => t.id === tid)?.color || 'var(--surface-container-lowest)';

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'subject') {
      deleteSubject(itemToDelete.id);
      if (activeSubjectId === itemToDelete.id) setActiveSubjectId(null);
    } else if (itemToDelete.type === 'topic') {
      deleteTopic(itemToDelete.id);
    } else if (itemToDelete.type === 'note') {
      deleteNote(itemToDelete.id);
    }
    
    setItemToDelete(null);
  };

  const handleSaveNote = (noteData) => {
    if (noteData.id) {
        updateNote(noteData.id, noteData);
    } else {
        addNote({
            ...noteData,
            id: Date.now().toString(),
            subjectId: noteData.subjectId || activeSubjectId || subjects[0]?.id || ''
        });
    }

    setNoteToEdit(null);
  };

  const handleCreateNewNote = () => {
    setNoteToEdit({
        title: '',
        content: '',
        subjectId: activeSubjectId || subjects[0]?.id || '',
        topicId: ''
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '4rem' }}>
      
      {/* 1. Header */}
      <motion.header variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
              <h1 className="text-display-lg" style={{ letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                  Curriculum Explore.
              </h1>
              <p className="text-title-lg" style={{ color: 'var(--on-surface-muted)' }}>
                  Organize your subjects and master the topics.
              </p>
          </div>
          <button className="btn btn-primary" onClick={() => { setSubjectToEdit(null); setIsSubjectModalOpen(true); }}>
             <Plus size={18} /> Add Subject
          </button>
      </motion.header>

      {/* 2. Selection zone extracted */}
      <SubjectConstellation 
        subjects={subjects}
        activeTopics={activeTopics}
        activeSubjectId={activeSubjectId}
        setActiveSubjectId={setActiveSubjectId}
        setItemToDelete={setItemToDelete}
        setIsSubjectModalOpen={setIsSubjectModalOpen}
        setIsTopicModalOpen={setIsTopicModalOpen}
        onEditSubject={(s) => { setSubjectToEdit(s); setIsSubjectModalOpen(true); }}
        onEditTopic={(t) => { setTopicToEdit(t); setIsTopicModalOpen(true); }}
      />

      {/* 3. Notes */}
      <motion.section variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-variant)', paddingBottom: '1.5rem' }}>
              <h2 
                className="text-title-lg" 
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                }}
                onClick={() => setActiveSubjectId(null)}
                onMouseOver={(e) => e.currentTarget.style.opacity = 0.7}
                onMouseOut={(e) => e.currentTarget.style.opacity = 1}
              >
                   Notes {activeSubjectId && <span style={{ color: 'var(--outline-variant)', fontWeight: 400 }}>/ {getSubjectTitle(activeSubjectId)}</span>}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ position: 'relative', width: '300px' }}>
                      <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline-variant)' }} />
                      <input 
                          type="text" 
                          className="input-field" 
                          placeholder="Search notes..." 
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          style={{ padding: '0.65rem 1rem 0.65rem 2.5rem', width: '100%', fontSize: '0.875rem' }}
                      />
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleCreateNewNote}
                    style={{ padding: '0.65rem 1.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                     <Plus size={16} /> Add Note
                  </button>
              </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <AnimatePresence>
                  {activeNotes.map(n => (
                      <NoteCard 
                        key={n.id}
                        note={n}
                        subjectTitle={getSubjectTitle(n.subjectId)}
                        subjectColor={getSubjectColor(n.subjectId)}
                        topicTitle={n.topicId ? getTopicTitle(n.topicId) : null}
                        topicColor={n.topicId ? getTopicColor(n.topicId) : null}
                        setItemToDelete={setItemToDelete}
                        onClick={() => setNoteToEdit(n)}
                      />
                  ))}
              </AnimatePresence>
          </div>

          {activeNotes.length === 0 && (
              <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--outline-variant)', backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)' }} className="ghost-boundary">
                  Your notes are empty. Time to add your first note.
              </div>
          )}
      </motion.section>

      {/* Modals */}
      <AnimatePresence>
          {isSubjectModalOpen && (
              <SubjectCreationModal 
                onClose={() => { setIsSubjectModalOpen(false); setSubjectToEdit(null); }} 
                addSubject={addSubject} 
                updateSubject={updateSubject}
                subject={subjectToEdit}
              />
          )}
          {isTopicModalOpen && (activeSubjectId || topicToEdit) && (
              <TopicCreationModal 
                  onClose={() => { setIsTopicModalOpen(false); setTopicToEdit(null); }} 
                  subjectId={topicToEdit ? topicToEdit.subjectId : activeSubjectId}
                  addTopic={addTopic} 
                  updateTopic={updateTopic}
                  topic={topicToEdit}
              />
          )}
          {noteToEdit && (
              <NoteEditorModal 
                isOpen={!!noteToEdit}
                note={noteToEdit}
                subjects={subjects}
                topics={topics}
                onSave={handleSaveNote}
                onClose={() => setNoteToEdit(null)}
              />
          )}
      </AnimatePresence>

      <ConfirmationModal 
        isOpen={itemToDelete !== null}
        onConfirm={handleConfirmDelete}
        onClose={() => setItemToDelete(null)}
      />

    </motion.div>
  );
}
