import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, BookOpen, Layers, X, Save, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

import { useStudy } from '../context/StudyContext';
import ContextSelector from '../components/ai/ContextSelector';
import QuizView from '../components/ai/QuizView';
import ChatHistoryList from '../components/ai/ChatHistoryList';
import { generateChatResponse, generateQuiz, extractToolCommands, NOTE_INTEGRATION_SYSTEM_PROMPT } from '../services/aiService';
import { containerVariants, itemVariants } from '../constants/FramerVariants';
import NoteEditorModal from '../components/modals/NoteEditorModal';

export default function AIAssistant() {
    const { settings, subjects, topics, notes, addNote, updateNote, addSubject, addTopic, chatSessions, updateChatSession } = useStudy();
    
    const [activeTab, setActiveTab] = useState('context'); // 'context' or 'history'
    const [activeChatId, setActiveChatId] = useState(chatSessions[0]?.id || null);
    const [editingNote, setEditingNote] = useState(null);

    const activeChat = chatSessions.find(c => c.id === activeChatId);
    const messages = activeChat?.messages || [];
    const selectedContextIds = activeChat?.contextIds || [];

    // Drop-in replacers to sync local UI interactions directly into the central StudyContext store
    const setMessages = (updater) => {
        if (!activeChatId) return;
        updateChatSession(activeChatId, (prev) => ({
            messages: typeof updater === 'function' ? updater(prev.messages) : updater
        }));
    };

    const setSelectedContextIds = (updater) => {
        if (!activeChatId) return;
        updateChatSession(activeChatId, (prev) => ({
            contextIds: typeof updater === 'function' ? updater(prev.contextIds) : updater
        }));
    };

    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedModel, setSelectedModel] = useState('');
    const messagesEndRef = useRef(null);

    // Set default model when settings load or provider changes
    useEffect(() => {
        if (settings.aiProvider === 'openai' && !selectedModel.includes('gpt')) {
            setSelectedModel('gpt-4o-mini');
        } else if (settings.aiProvider === 'gemini' && !selectedModel.includes('gemini')) {
            setSelectedModel('gemini-3-flash-preview');
        }
    }, [settings.aiProvider]);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(scrollToBottom, [messages]);

    const isApiConfigured = () => {
        if (settings.aiProvider === 'openai') return !!settings.openaiApiKey;
        if (settings.aiProvider === 'gemini') return !!settings.geminiApiKey;
        return false;
    };

    // Construct the System Prompt based on selected context
    const buildContextPrompt = () => {
        const selectedNoteIds = selectedContextIds
            .filter(id => id.startsWith('note-'))
            .map(id => id.replace('note-', ''));

        if (selectedNoteIds.length === 0) return NOTE_INTEGRATION_SYSTEM_PROMPT;

        let contextText = "The user has provided the following notes as academic context:\n\n";
        selectedNoteIds.forEach(noteId => {
            const note = notes.find(n => n.id === noteId);
            if (note) {
                contextText += `### ${note.title}\n${note.content}\n\n`;
            }
        });

        return NOTE_INTEGRATION_SYSTEM_PROMPT + "\n\n" + contextText;
    };

    const toggleContextNode = (id) => {
        setSelectedContextIds(prev => {
            const isAdding = !prev.includes(id);
            let next = new Set(prev);

            if (id.startsWith('subject-')) {
                const subId = id.replace('subject-', '');
                const relatedTopics = topics.filter(t => t.subjectId === subId).map(t => `topic-${t.id}`);
                const relatedNotes = notes.filter(n => n.subjectId === subId).map(n => `note-${n.id}`);
                
                if (isAdding) {
                    [id, ...relatedTopics, ...relatedNotes].forEach(item => next.add(item));
                } else {
                    [id, ...relatedTopics, ...relatedNotes].forEach(item => next.delete(item));
                }
            } else if (id.startsWith('topic-')) {
                const topId = id.replace('topic-', '');
                const relatedNotes = notes.filter(n => n.topicId === topId).map(n => `note-${n.id}`);
                
                if (isAdding) {
                    [id, ...relatedNotes].forEach(item => next.add(item));
                } else {
                    const topic = topics.find(t => t.id === topId);
                    next.delete(id);
                    if (topic) next.delete(`subject-${topic.subjectId}`);
                    relatedNotes.forEach(item => next.delete(item));
                }
            } else if (id.startsWith('note-')) {
                const noteId = id.replace('note-', '');
                const note = notes.find(n => n.id === noteId);
                
                if (isAdding) {
                    next.add(id);
                } else {
                    next.delete(id);
                    if (note?.topicId) next.delete(`topic-${note.topicId}`);
                    if (note?.subjectId) next.delete(`subject-${note.subjectId}`);
                }
            }

            return Array.from(next);
        });
    };

    const handleSend = async (customPrompt = null, forceType = 'text') => {
        const textToProcess = customPrompt || input;
        if (!textToProcess.trim() && forceType === 'text') return;

        // Auto-name new chats based on the first user message
        if (messages.length === 1 && messages[0].role === 'assistant') {
            const newTitle = textToProcess.substring(0, 30) + (textToProcess.length > 30 ? '...' : '');
            updateChatSession(activeChatId, { title: newTitle });
        }

        const userMsg = { role: 'user', content: textToProcess, type: 'text' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsGenerating(true);

        try {
            if (forceType === 'quiz') {
                const contextContent = buildContextPrompt();
                const quizData = await generateQuiz(contextContent, settings, selectedModel);
                setMessages(prev => [...prev, { role: 'assistant', content: quizData, type: 'quiz' }]);
            } else {
                const recentHistory = messages
                    .filter(m => m.type === 'text')
                    .map(m => ({ role: m.role, content: m.content })).slice(-6); // Keep last few turns
                
                recentHistory.push({ role: 'user', content: textToProcess });

                const rawResponse = await generateChatResponse({
                    messages: recentHistory,
                    systemPrompt: buildContextPrompt(),
                    settings: settings,
                    model: selectedModel
                });

                // Check for Tool Integration Commands
                const command = extractToolCommands(rawResponse);
                
                // Remove the json block from the visible text response
                const visualText = rawResponse.replace(/```json\n([\s\S]*?)\n```/, '').trim();

                if (visualText || !command) {
                    setMessages(prev => [...prev, { role: 'assistant', content: visualText || "Processing your request...", type: 'text' }]);
                }

                // Execute the command locally if found
                if (command) {
                    if (command.action === 'create_note') {
                        let finalSubjectId = null;
                        let finalTopicId = null;

                        // 1. Resolve Subject
                        if (command.subjectTitle && command.subjectTitle.toLowerCase() !== 'none') {
                            const existingSub = subjects.find(s => s.title.toLowerCase() === command.subjectTitle.toLowerCase());
                            if (existingSub) {
                                finalSubjectId = existingSub.id;
                            } else {
                                finalSubjectId = `s_${Date.now()}`;
                                const colors = ['var(--primary-container)', 'var(--secondary-container)', 'var(--tertiary-container)', 'rgba(41, 98, 131, 0.2)', 'rgba(146, 58, 35, 0.2)'];
                                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                                addSubject({ id: finalSubjectId, title: command.subjectTitle, color: randomColor });
                            }
                        }

                        // 2. Resolve Topic (only if subject exists)
                        if (finalSubjectId && command.topicTitle && command.topicTitle.toLowerCase() !== 'none') {
                            const existingTop = topics.find(t => t.subjectId === finalSubjectId && t.title.toLowerCase() === command.topicTitle.toLowerCase());
                            if (existingTop) {
                                finalTopicId = existingTop.id;
                            } else {
                                finalTopicId = `t_${Date.now()}`;
                                addTopic({ id: finalTopicId, subjectId: finalSubjectId, title: command.topicTitle, completionStatus: 'learning' });
                            }
                        }

                        const newNote = {
                            id: `note_${Date.now()}`,
                            title: command.title || 'AI Generated Note',
                            content: command.content || '',
                            subjectId: finalSubjectId,
                            topicId: finalTopicId,
                            lastEdited: new Date().toISOString()
                        };
                        addNote(newNote);
                        setMessages(prev => [...prev, { 
                            role: 'system', 
                            content: `Note created and categorized successfully: **${newNote.title}**`, 
                            type: 'system_action' 
                        }]);
                    } else if (command.action === 'update_note') {
                        updateNote(command.noteId, {
                            title: command.title,
                            content: command.content,
                            lastEdited: new Date().toISOString()
                        });
                        setMessages(prev => [...prev, { 
                            role: 'system', 
                            content: `Note updated successfully: **${command.title}**`, 
                            type: 'system_action' 
                        }]);
                    } else if (command.action === 'generate_quiz') {
                        if (command.questions && command.questions.length > 0) {
                            setMessages(prev => [...prev, { role: 'assistant', content: command.questions, type: 'quiz' }]);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${error.message}`, type: 'error' }]);
        } finally {
            setIsGenerating(false);
        }
    };


    if (!isApiConfigured()) {
        return (
            <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '60vh', textAlign: 'center', gap: '2rem' }}>
                <AlertTriangle size={64} color="var(--tertiary)" />
                <div>
                    <h2 className="text-display-md">AI Not Configured</h2>
                    <p className="text-body-lg" style={{ color: 'var(--on-surface-muted)', marginTop: '1rem', maxWidth: '500px' }}>
                        You need to add an API key for {settings.aiProvider === 'openai' ? 'OpenAI' : 'Google Gemini'} before you can access the Study Assistant.
                    </p>
                </div>
                <Link to="/settings" className="btn btn-primary" style={{ padding: '1.25rem 2.5rem', borderRadius: '1.5rem', fontSize: '1.125rem' }}>
                    Go to Settings
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div 
            variants={containerVariants} initial="hidden" animate="show"
            style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2.5rem', height: 'calc(100vh - 8rem)', alignItems: 'stretch' }}
        >
            {/* Sidebar Context & History Tabs */}
            <motion.div variants={itemVariants} className="card" style={{ height: '100%', padding: '2rem', borderRadius: '2.5rem', backgroundColor: 'var(--surface-container-low)', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
                
                {/* Tab Navigation */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-variant)' }}>
                    <button 
                        onClick={() => setActiveTab('context')}
                        style={{ 
                            flex: 1, padding: '0.75rem', border: 'none', background: 'transparent', cursor: 'pointer',
                            fontWeight: activeTab === 'context' ? 700 : 500, fontSize: '0.9rem',
                            color: activeTab === 'context' ? 'var(--primary)' : 'var(--on-surface-muted)',
                            borderBottom: activeTab === 'context' ? '2px solid var(--primary)' : '2px solid transparent',
                            transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}
                    >
                        Study Context
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        style={{ 
                            flex: 1, padding: '0.75rem', border: 'none', background: 'transparent', cursor: 'pointer',
                            fontWeight: activeTab === 'history' ? 700 : 500, fontSize: '0.9rem',
                            color: activeTab === 'history' ? 'var(--primary)' : 'var(--on-surface-muted)',
                            borderBottom: activeTab === 'history' ? '2px solid var(--primary)' : '2px solid transparent',
                            transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}
                    >
                        Chat History
                    </button>
                </div>

                {/* Tab Content */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {activeTab === 'context' ? (
                        <ContextSelector 
                            selectedNodeIds={selectedContextIds} 
                            toggleNode={toggleContextNode} 
                            onNoteDoubleClick={(id) => setEditingNote(notes.find(n => n.id === id))} 
                        />
                    ) : (
                        <ChatHistoryList activeChatId={activeChatId} setActiveChatId={setActiveChatId} />
                    )}
                </div>
            </motion.div>

            {/* Chat Area */}
            <motion.div variants={itemVariants} className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '2.5rem', overflow: 'hidden', backgroundColor: 'var(--surface)', padding: 0 }}>
                
                {/* Chat Header */}
                <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--surface-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-container-lowest)' }}>
                    <div>
                        <h2 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Sparkles size={24} color="var(--primary)" />
                            Study Assistant
                        </h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Model Selector */}
                        <select 
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="input-field"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, width: 'auto', borderRadius: '1rem', backgroundColor: 'var(--surface)' }}
                        >
                            {settings.aiProvider === 'openai' ? (
                                <>
                                    <option value="gpt-5.4">GPT-5.4</option>
                                    <option value="gpt-5.4-pro">GPT-5.4 Pro</option>
                                    <option value="gpt-5.4-mini">GPT-5.4 Mini</option>
                                    <option value="gpt-5.1">GPT-5.1</option>
                                    <option value="gpt-4o">GPT-4 Omni (Legacy)</option>
                                </>
                            ) : (
                                <>
                                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Preview)</option>
                                    <option value="gemini-3-flash-preview">Gemini 3 Flash (Preview)</option>
                                    <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash-Lite (Preview)</option>
                                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Stable)</option>
                                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Stable)</option>
                                </>
                            )}
                        </select>
                        <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, backgroundColor: 'var(--primary-container)', padding: '0.5rem 1rem', borderRadius: '1rem' }}>
                            {selectedContextIds.length} Context Items
                        </div>
                    </div>
                </div>

                {/* Messages View */}
                <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {messages.map((msg, idx) => {
                        const isUser = msg.role === 'user';
                        const alignment = isUser ? 'flex-end' : 'flex-start';
                        const bg = isUser ? 'var(--primary-container)' : 'var(--surface-container-high)';
                        const color = isUser ? 'var(--on-primary-container)' : 'var(--on-surface)';

                        if (msg.type === 'quiz') {
                            return (
                                <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ alignSelf: 'stretch', margin: '1rem 0' }}>
                                    <QuizView quizData={msg.content} />
                                </motion.div>
                            );
                        }

                        if (msg.type === 'system_action') {
                            return (
                                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: 'center', padding: '0.75rem 1.5rem', backgroundColor: 'rgba(82, 139, 109, 0.15)', color: 'var(--secondary)', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Save size={16} /> <ReactMarkdown components={{ p: ({node, ...props}) => <span {...props} /> }}>{msg.content}</ReactMarkdown>
                                </motion.div>
                            );
                        }

                        if (!msg.content) return null; // Skip empty text if it was pure json command

                        return (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                style={{ alignSelf: alignment, maxWidth: '85%' }}
                            >
                                <div style={{ 
                                    padding: '1.25rem 1.75rem', 
                                    backgroundColor: isUser ? bg : 'transparent', 
                                    color: color, 
                                    borderRadius: '1.5rem',
                                    borderBottomRightRadius: isUser ? '0.5rem' : '1.5rem',
                                    borderBottomLeftRadius: !isUser ? '0.5rem' : '1.5rem',
                                    className: isUser ? '' : 'layer-lowest' // Soft shadow for AI
                                }}>
                                    <div className="markdown-body" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
                                        {msg.type === 'error' ? (
                                            <span style={{ color: 'var(--error)' }}><ReactMarkdown>{msg.content}</ReactMarkdown></span>
                                        ) : (
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    {isGenerating && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start', color: 'var(--on-surface-muted)', padding: '1rem 1.5rem', fontStyle: 'italic', fontSize: '0.95rem' }}>
                            Thinking...
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid var(--surface-variant)', backgroundColor: 'var(--surface-container-lowest)' }}>
                    
                    {/* Action Bar */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button 
                            className="btn btn-ghost" 
                            onClick={() => handleSend("Please summarize the selected context materials clearly and concisely.", 'text')}
                            disabled={isGenerating || selectedContextIds.length === 0}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <BookOpen size={16} /> Summarize Context
                        </button>
                        <button 
                            className="btn btn-ghost"
                            onClick={() => handleSend("Generate a quiz from the selected context.", 'quiz')}
                            disabled={isGenerating || selectedContextIds.length === 0}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Layers size={16} /> Generate Quiz
                        </button>
                    </div>

                    {/* Text Input */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', backgroundColor: 'var(--surface)', padding: '0.5rem', borderRadius: '1.5rem', border: '1px solid var(--surface-variant)' }}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask me anything, or instruct me to create/edit notes..."
                            className="custom-scrollbar"
                            style={{ 
                                flex: 1, 
                                background: 'transparent', 
                                border: 'none', 
                                outline: 'none', 
                                padding: '1rem 1.5rem', 
                                resize: 'none',
                                fontSize: '1.05rem',
                                color: 'var(--on-surface)',
                                fontFamily: 'Manrope',
                                minHeight: '60px',
                                maxHeight: '150px'
                            }}
                        />
                        <button 
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isGenerating}
                            style={{ 
                                padding: '1.15rem', borderRadius: '1.25rem', border: 'none', cursor: 'pointer',
                                backgroundColor: (!input.trim() || isGenerating) ? 'var(--surface-container-high)' : 'var(--primary)',
                                color: (!input.trim() || isGenerating) ? 'var(--on-surface-muted)' : 'white',
                                transition: 'all 0.2s ease', margin: '0.25rem'
                            }}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {editingNote && (
                    <NoteEditorModal 
                        isOpen={!!editingNote}
                        note={editingNote}
                        subjects={subjects}
                        topics={topics}
                        onSave={(noteData) => {
                            updateNote(noteData.id, noteData);
                            setEditingNote(null);
                        }}
                        onClose={() => setEditingNote(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
