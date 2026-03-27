import React, { createContext, useContext, useState, useEffect } from 'react';

const StudyContext = createContext();
export const useStudy = () => useContext(StudyContext);

export const StudyProvider = ({ children }) => {
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('cs_subjects');
    return saved ? JSON.parse(saved) : [
      { id: 's1', title: 'Quantum Mechanics', color: '#296283' },
      { id: 's2', title: 'Medieval History', color: '#923a23' },
      { id: 's3', title: 'Calculus III', color: '#528b6d' },
      { id: 's4', title: 'Eco-Urbanism', color: '#8b52a1' },
    ];
  });

  const [topics, setTopics] = useState(() => {
    const saved = localStorage.getItem('cs_topics');
    return saved ? JSON.parse(saved) : [
      { id: 't1', subjectId: 's1', title: 'Wave Function Postulates', completionStatus: 'done' },
      { id: 't2', subjectId: 's1', title: 'Schrödinger Equation', completionStatus: 'learning' },
      { id: 't3', subjectId: 's2', title: 'The Crusades', completionStatus: 'learning' },
      { id: 't4', subjectId: 's3', title: 'Multi-variable Integration', completionStatus: 'learning' },
      { id: 't5', subjectId: 's4', title: 'Sustainable Infrastructure', completionStatus: 'learning' }
    ];
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('cs_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 'task1', title: 'Read Chapter 4: Time-Independent Perturbation Theory', isCompleted: false, priority: 'High', subjectId: 's1', topicId: 't2', dueDate: new Date().toISOString() },
      { id: 'task2', title: 'Summarize The Third Crusade', isCompleted: true, priority: 'Medium', subjectId: 's2', topicId: null, dueDate: new Date().toISOString() },
      { id: 'task3', title: 'Solve Integration Exercises 10-20', isCompleted: false, priority: 'Low', subjectId: 's3', topicId: null, dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString() },
    ];
  });


  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('cs_notes');
    return saved ? JSON.parse(saved) : [
      {
        id: 'n1', title: 'The Heart of the Schrödinger Equation', subjectId: 's1', topicId: 't2',
        content: '# The Heart of the Schrödinger Equation\n\nThe fundamental equation of non-relativistic quantum mechanics, the **Schrödinger equation**, governs the time-evolution of the wave function $\\Psi$.\n\n### The Time-Independent Form\nFor stationary states where the potential $V$ is independent of time:\n\n$$-\\frac{\\hbar^2}{2m} \\nabla^2 \\psi(\\mathbf{r}) + V(\\mathbf{r}) \\psi(\\mathbf{r}) = E \\psi(\\mathbf{r})$$\n\n### Key Interpretations\n- **Probability Density**: $|\\psi|^2$ represents the likelihood of finding a particle in a given region.\n- **Eigenvalues**: The energy $E$ must be one of the allowed energy states of the system.\n\n| Operator | Symbol | Quantum Equivalent |\n| :--- | :---: | :--- |\n| Momentum | $p$ | $-i\\hbar \\nabla$ |\n| Position | $x$ | $x \\cdot$ |\n| Energy | $H$ | $\\frac{p^2}{2m} + V$ |\n\n*Next steps: Solve the particle-in-a-box model to see quantization in action.*',
        lastEdited: new Date().toISOString()
      },
      {
        id: 'n2', title: 'First Crusade: Context & Catalysts', subjectId: 's2', topicId: 't3',
        content: '# Overview of the First Crusade (1095–1099)\n\nThe First Crusade was a religious and military campaign initiated by the Latin Church to liberate the Holy Land from Seljuk control.\n\n### Core Drivers\n1. **Council of Clermont**: Pope Urban II\'s speech calling for an expedition to help the Byzantine Empire.\n2. **Religious Fervor**: The promise of "remission of sins" for participants.\n3. **Socio-Political Factors**: Land-hunger among younger sons of European nobility (primogeniture issues).\n\n### Primary Leaders\n- **Godfrey of Bouillon**: The first ruler of the Kingdom of Jerusalem.\n- **Bohemond of Taranto**: An ambitious Norman leader.\n- **Raymond IV of Toulouse**: One of the wealthiest and most experienced counts.\n\n> "Deus vult!" (God wills it) — The rallying cry of the crusaders following Urban II\'s sermon.',
        lastEdited: new Date().toISOString()
      },
      {
        id: 'n3', title: 'Calculus III: Gradients and Directional Derivatives', subjectId: 's3', topicId: 't4',
        content: '# Gradients & Directional Derivatives\n\nIn multivariable calculus, the **gradient** vector field represents the direction and magnitude of the steepest increase of a scalar function $f(x, y, z)$.\n\n### Mathematical Definition\nThe gradient $\\nabla f$ is defined as the vector of partial derivatives:\n\n$$\\nabla f = \\left\\langle \\frac{\\partial f}{\partial x}, \\frac{\\partial f}{\partial y}, \\frac{\\partial f}{\partial z} \\right\\rangle$$\n\n### Properties\n- The gradient is always **orthogonal** to the level surfaces of $f$.\n- The **directional derivative** in direction $\\mathbf{u}$ is given by: $D_{\\mathbf{u}}f = \\nabla f \\cdot \\mathbf{u}$.\n\n```python\n# Example: Computing a simple gradient in Python\nimport numpy as np\n\ndef gradient_2d(f, x, y, h=1e-5):\n    df_dx = (f(x + h, y) - f(x - h, y)) / (2 * h)\n    df_dy = (f(x, y + h) - f(x, y - h)) / (2 * h)\n    return np.array([df_dx, df_dy])\n```',
        lastEdited: new Date().toISOString()
      },
      {
        id: 'n4', title: 'Principles of Eco-Urbanism', subjectId: 's4', topicId: 't5',
        content: '# Introduction to Eco-Urbanism\n\nEco-urbanism is a multi-disciplinary approach to urban design that seeks to minimize the environmental footprint of cities while enhancing the quality of life for residents.\n\n### The Three Pillars\n*   **Dense, Walkable Neighborhoods**: Reducing reliance on private vehicles through mixed-use zoning.\n*   **Biosophilic Integration**: Incorporating green roofs, vertical forests, and urban wetlands to manage heat islands.\n*   **Circular Metabolism**: Cities as closed loops where waste becomes a resource (e.g., greywater recycling).\n\n### Case Study: Masdar City\nMasdar City in Abu Dhabi serves as an experiment in zero-carbon urban living, utilizing traditional Arabic architectural techniques combined with modern cooling systems.',
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

  const [focusTasks, setFocusTasks] = useState(() => {
    const saved = localStorage.getItem('cs_focus_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [chatSessions, setChatSessions] = useState(() => {
    const saved = localStorage.getItem('cs_chat_sessions');
    return saved ? JSON.parse(saved) : [
      { id: 'chat_default', title: 'New Conversation', messages: [{ role: 'assistant', content: "Hello! I'm your Cognitive Sanctuary assistant. Select some context on the left, or just ask me a question to get started.", type: 'text' }], contextIds: [], lastUpdated: new Date().toISOString() }
    ];
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('cs_settings');
    return saved ? JSON.parse(saved) : {
      username: 'Seeker',
      aiProvider: 'gemini',
      openaiApiKey: '',
      geminiApiKey: ''
    };
  });

  // Global UI State (Mobile)
  const [activeSidebar, _setActiveSidebar] = useState('none'); // 'none' | 'main' | 'ai'
  const setActiveSidebar = (val) => {
    _setActiveSidebar(val);
  };

  // Persistent Storage Observers
  useEffect(() => { localStorage.setItem('cs_subjects', JSON.stringify(subjects)); }, [subjects]);
  useEffect(() => { localStorage.setItem('cs_topics', JSON.stringify(topics)); }, [topics]);
  useEffect(() => { localStorage.setItem('cs_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('cs_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('cs_focus_stats', JSON.stringify(focusStats)); }, [focusStats]);
  useEffect(() => { localStorage.setItem('cs_focus_tasks', JSON.stringify(focusTasks)); }, [focusTasks]);
  useEffect(() => { localStorage.setItem('cs_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('cs_chat_sessions', JSON.stringify(chatSessions)); }, [chatSessions]);

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

  // Focus Task Handlers
  const addFocusTask = (title) => setFocusTasks(prev => [...prev, { id: Date.now().toString(), title, isCompleted: false }]);
  const toggleFocusTask = (id) => setFocusTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  const deleteFocusTask = (id) => setFocusTasks(prev => prev.filter(t => t.id !== id));

  const updateSettings = (newSettings) => setSettings(prev => ({ ...prev, ...newSettings }));

  // Chat History Handlers
  const addChatSession = (session) => setChatSessions(prev => [session, ...prev]);
  const updateChatSession = (id, updatesOrUpdater) => setChatSessions(prev => prev.map(c => {
    if (c.id === id) {
      const updates = typeof updatesOrUpdater === 'function' ? updatesOrUpdater(c) : updatesOrUpdater;
      return { ...c, ...updates, lastUpdated: new Date().toISOString() };
    }
    return c;
  }));
  const deleteChatSession = (id) => setChatSessions(prev => prev.filter(c => c.id !== id));

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
