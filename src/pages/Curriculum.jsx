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

// Styles
import './Curriculum.css';

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
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="curriculum-container">
      
      {/* 1. Header */}
      <motion.header variants={itemVariants} className="curriculum-header">
          <div className="curriculum-title-group">
              <h1 className="text-display-lg">
                  Curriculum Explore.
              </h1>
              <p className="text-title-lg curriculum-subtitle">
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
      <motion.section variants={itemVariants} className="notes-section">
          <div className="notes-header">
              <h2 
                className="text-title-lg notes-title" 
                onClick={() => setActiveSubjectId(null)}
              >
                   Notes {activeSubjectId && <span style={{ color: 'var(--outline-variant)', fontWeight: 400 }}>/ {getSubjectTitle(activeSubjectId)}</span>}
              </h2>
              <div className="notes-controls">
                  <div className="notes-search-wrapper">
                      <Search size={16} className="notes-search-icon" />
                      <input 
                          type="text" 
                          className="input-field notes-search-input" 
                          placeholder="Search notes..." 
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                      />
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleCreateNewNote}
                    style={{ padding: '0.65rem 1.5rem', fontSize: '0.875rem' }}
                  >
                     <Plus size={16} className="mr-xs" /> Add Note
                  </button>
              </div>
          </div>

          <div className="notes-grid">
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
              <div className="notes-empty-state ghost-boundary">
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
