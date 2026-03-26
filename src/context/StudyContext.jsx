import React, { createContext, useContext, useState, useEffect } from 'react';

const StudyContext = createContext();
export const useStudy = () => useContext(StudyContext);

export const StudyProvider = ({ children }) => {
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('cs_subjects');
    return saved ? JSON.parse(saved) : [
      { id: 's1', title: 'Quantum Mechanics', color: 'var(--primary-container)' },
      { id: 's2', title: 'Medieval History', color: 'var(--tertiary-container)' },
      { id: 's3', title: 'Calculus III', color: 'var(--secondary-container)' },
    ];
  });

  const [topics, setTopics] = useState(() => {
    const saved = localStorage.getItem('cs_topics');
    return saved ? JSON.parse(saved) : [
      { id: 't1', subjectId: 's1', title: 'Wave Function Postulates', completionStatus: 'done' },
      { id: 't2', subjectId: 's1', title: 'Schrödinger Equation', completionStatus: 'learning' },
      { id: 't3', subjectId: 's2', title: 'The Crusades', completionStatus: 'learning' }
    ];
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('cs_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 'task1', title: 'Read Chapter 4: Time-Independent Perturbation Theory', isCompleted: false, priority: 'High', subjectId: 's1', topicId: 't2', dueDate: new Date().toISOString() },
      { id: 'task2', title: 'Summarize The Third Crusade', isCompleted: false, priority: 'Medium', subjectId: 's2', topicId: null, dueDate: new Date().toISOString() },
      { id: 'task3', title: 'Solve Integration Exercises 10-20', isCompleted: true, priority: 'Low', subjectId: 's3', topicId: null, dueDate: new Date().toISOString() },
    ];
  });


  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('cs_notes');
    return saved ? JSON.parse(saved) : [
      { 
        id: 'n1', title: 'The Heart of the Schrödinger Equation', subjectId: 's1', topicId: 't2', 
        content: '# The Heart of the Schrödinger Equation\n\nThis is a long multi-paragraph study note...\nThe time-independent wave equation governs stationary states. You must understand the boundary conditions before solving it. The kinetic energy term is proportional to the second derivative of the wave function with respect to position.',
        lastEdited: new Date().toISOString()
      },
      { 
        id: 'n2', title: 'Postulates Breakdown', subjectId: 's1', topicId: 't1', 
        content: '# Postulates Breakdown\n\nThe fundamental postulates of quantum mechanics dictate how we map mathematical formalism onto physical experiments.',
        lastEdited: new Date().toISOString()
      },
      { 
        id: 'n3', title: 'Overview of the First Crusade', subjectId: 's2', topicId: 't3', 
        content: '# First Crusade Overview\n\nAn extensive review of the sociopolitical and religious factors that culminated in the calling of the first crusade by Pope Urban II.',
        lastEdited: new Date().toISOString()
      }
    ];
  });

  const [focusStats, setFocusStats] = useState(() => {
    const saved = localStorage.getItem('cs_focus_stats');
    const defaultStats = { focusBlocksToday: 0, lastFocusDate: new Date().toDateString() };
    if (!saved) return defaultStats;
    const parsed = JSON.parse(saved);
    if (parsed.lastFocusDate !== new Date().toDateString()) return defaultStats;
    return parsed;
  });

  // Persistent Storage Observers
  useEffect(() => { localStorage.setItem('cs_subjects', JSON.stringify(subjects)); }, [subjects]);
  useEffect(() => { localStorage.setItem('cs_topics', JSON.stringify(topics)); }, [topics]);
  useEffect(() => { localStorage.setItem('cs_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('cs_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('cs_focus_stats', JSON.stringify(focusStats)); }, [focusStats]);

  const incrementFocusBlocks = () => {
    setFocusStats(prev => ({ ...prev, focusBlocksToday: prev.focusBlocksToday + 1 }));
  };

  // Domain specific handlers
  const addSubject = (sub) => setSubjects(prev => [...prev, sub]);
  const updateSubject = (id, updates) => setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  const deleteSubject = (id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setTopics(prev => prev.filter(t => t.subjectId !== id));
    setTasks(prev => prev.filter(t => t.subjectId !== id));
    setNotes(prev => prev.filter(n => n.subjectId !== id));
  };

  const addTopic = (top) => setTopics(prev => [...prev, top]);
  const updateTopic = (id, updates) => setTopics(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  const deleteTopic = (id) => {
    setTopics(prev => prev.filter(t => t.id !== id));
    setTasks(prev => prev.filter(t => t.topicId !== id));
    setNotes(prev => prev.filter(n => n.topicId !== id));
  };

  const addTask = (task) => setTasks(prev => [...prev, task]);
  const updateTask = (id, updates) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));
  

  const addNote = (note) => setNotes(prev => [...prev, note]);
  const updateNote = (id, updates) => setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  const deleteNote = (id) => setNotes(prev => prev.filter(n => n.id !== id));

  return (
    <StudyContext.Provider value={{ 
        subjects, addSubject, updateSubject, deleteSubject,
        topics, addTopic, updateTopic, deleteTopic,
        tasks, addTask, updateTask, deleteTask, 
        notes, addNote, updateNote, deleteNote,
        focusStats, incrementFocusBlocks
    }}>
      {children}
    </StudyContext.Provider>
  );
};
