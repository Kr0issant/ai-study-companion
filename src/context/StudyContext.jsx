import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const StudyContext = createContext();
export const useStudy = () => useContext(StudyContext);

export const StudyProvider = ({ children }) => {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [focusTasks, setFocusTasks] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  
  const [focusStats, setFocusStats] = useState({ focusBlocksToday: 0, lastFocusDate: new Date().toDateString() });
  const [settings, setSettings] = useState({ displayName: '', aiProvider: 'gemini', openaiApiKey: '', geminiApiKey: '' });

  // Global UI State (Mobile)
  const [activeSidebar, _setActiveSidebar] = useState('none'); 
  const setActiveSidebar = (val) => _setActiveSidebar(val);

  useEffect(() => {
    if (!user) {
      setSubjects([]);
      setTopics([]);
      setTasks([]);
      setNotes([]);
      setFocusTasks([]);
      setChatSessions([]);
      return;
    }

    const uid = user.uid;

    const unsubSubjects = onSnapshot(query(collection(db, 'subjects'), where('uid', '==', uid)), snapshot => {
      setSubjects(snapshot.docs.map(doc => doc.data()));
    });

    const unsubTopics = onSnapshot(query(collection(db, 'topics'), where('uid', '==', uid)), snapshot => {
      setTopics(snapshot.docs.map(doc => doc.data()));
    });

    const unsubTasks = onSnapshot(query(collection(db, 'tasks'), where('uid', '==', uid)), snapshot => {
      setTasks(snapshot.docs.map(doc => doc.data()));
    });

    const unsubNotes = onSnapshot(query(collection(db, 'notes'), where('uid', '==', uid)), snapshot => {
      setNotes(snapshot.docs.map(doc => doc.data()));
    });

    const unsubFocusTasks = onSnapshot(query(collection(db, 'focus-tasks'), where('uid', '==', uid)), snapshot => {
      setFocusTasks(snapshot.docs.map(doc => doc.data()));
    });

    const unsubChatSessions = onSnapshot(query(collection(db, 'chat-sessions'), where('uid', '==', uid)), snapshot => {
      // Sort sessions logically, usually newest first depending on how the app uses it
      // Let's just return what's in the DB for now
      const sessions = snapshot.docs.map(doc => doc.data());
      setChatSessions(sessions.sort((a,b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)));
    });

    const unsubUser = onSnapshot(doc(db, 'users', uid), docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.settings) setSettings(data.settings);
        
        let stats = data.focusStats || { focusBlocksToday: 0, lastFocusDate: new Date().toDateString() };
        if (stats.lastFocusDate !== new Date().toDateString()) {
           stats = { focusBlocksToday: 0, lastFocusDate: new Date().toDateString() };
        }
        setFocusStats(stats);
      }
    });

    return () => {
      unsubSubjects();
      unsubTopics();
      unsubTasks();
      unsubNotes();
      unsubFocusTasks();
      unsubChatSessions();
      unsubUser();
    };
  }, [user]);

  const incrementFocusBlocks = async () => {
    if (!user) return;
    const newStats = { focusBlocksToday: (focusStats.focusBlocksToday || 0) + 1, lastFocusDate: new Date().toDateString() };
    await updateDoc(doc(db, 'users', user.uid), { focusStats: newStats });
  };

  const updateSettings = async (newSettings) => {
    if (!user) return;
    const updated = { ...settings, ...newSettings };
    await updateDoc(doc(db, 'users', user.uid), { settings: updated });
  };

  const addSubject = async (sub) => {
    if (!user) return;
    await setDoc(doc(db, 'subjects', sub.id), { ...sub, uid: user.uid });
  };
  
  const updateSubject = async (id, updates) => {
    if (!user) return;
    await updateDoc(doc(db, 'subjects', id), updates);
  };

  const deleteSubject = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'subjects', id));
    topics.filter(t => t.subjectId === id).forEach(t => deleteDoc(doc(db, 'topics', t.id)));
    tasks.filter(t => t.subjectId === id).forEach(t => deleteDoc(doc(db, 'tasks', t.id)));
    notes.filter(n => n.subjectId === id).forEach(n => deleteDoc(doc(db, 'notes', n.id)));
  };

  const addTopic = async (top) => {
    if (!user) return;
    await setDoc(doc(db, 'topics', top.id), { ...top, uid: user.uid });
  };

  const updateTopic = async (id, updates) => {
     if (!user) return;
     await updateDoc(doc(db, 'topics', id), updates);
  };

  const deleteTopic = async (id) => {
     if (!user) return;
     await deleteDoc(doc(db, 'topics', id));
     notes.filter(n => n.topicId === id).forEach(n => deleteDoc(doc(db, 'notes', n.id)));
  };

  const addTask = async (task) => {
    if (!user) return;
    await setDoc(doc(db, 'tasks', task.id), { ...task, uid: user.uid });
  };

  const updateTask = async (id, updates) => {
    if (!user) return;
    await updateDoc(doc(db, 'tasks', id), updates);
  };

  const deleteTask = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'tasks', id));
  };

  const addNote = async (note) => {
    if (!user) return;
    await setDoc(doc(db, 'notes', note.id), { ...note, uid: user.uid });
  };

  const updateNote = async (id, updates) => {
    if (!user) return;
    await updateDoc(doc(db, 'notes', id), updates);
  };

  const deleteNote = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'notes', id));
  };

  const addFocusTask = async (title) => {
    if (!user) return;
    const id = Date.now().toString();
    await setDoc(doc(db, 'focus-tasks', id), { id, title, isCompleted: false, uid: user.uid });
  };

  const toggleFocusTask = async (id) => {
    if (!user) return;
    const task = focusTasks.find(t => t.id === id);
    if (task) await updateDoc(doc(db, 'focus-tasks', id), { isCompleted: !task.isCompleted });
  };

  const deleteFocusTask = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'focus-tasks', id));
  };

  const addChatSession = async (session) => {
    if (!user) return;
    await setDoc(doc(db, 'chat-sessions', session.id), { ...session, uid: user.uid });
  };

  const updateChatSession = async (id, updatesOrUpdater) => {
    if (!user) return;
    const session = chatSessions.find(c => c.id === id);
    if (session) {
      const updates = typeof updatesOrUpdater === 'function' ? updatesOrUpdater(session) : updatesOrUpdater;
      await updateDoc(doc(db, 'chat-sessions', id), { ...updates, lastUpdated: new Date().toISOString() });
    }
  };

  const deleteChatSession = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'chat-sessions', id));
  };

  return (
    <StudyContext.Provider value={{
      subjects, addSubject, updateSubject, deleteSubject,
      topics, addTopic, updateTopic, deleteTopic,
      tasks, addTask, updateTask, deleteTask,
      notes, addNote, updateNote, deleteNote,
      focusStats, incrementFocusBlocks,
      focusTasks, addFocusTask, toggleFocusTask, deleteFocusTask,
      settings, updateSettings,
      chatSessions, addChatSession, updateChatSession, deleteChatSession,
      activeSidebar, setActiveSidebar
    }}>
      {children}
    </StudyContext.Provider>
  );
};
