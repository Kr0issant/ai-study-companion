import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, MessageSquare, Trash2, Clock } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { formatDistanceToNow } from 'date-fns';

// Styles
import './ChatHistoryList.css';

export default function ChatHistoryList({ activeChatId, setActiveChatId }) {
    const { chatSessions, addChatSession, updateChatSession, deleteChatSession } = useStudy();
    const [editingId, setEditingId] = React.useState(null);
    const [editValue, setEditValue] = React.useState('');

    const handleNewChat = () => {
        const newId = `chat_${Date.now()}`;
        addChatSession({
            id: newId,
            title: 'New Conversation',
            messages: [{ role: 'assistant', content: "Hello! I'm your Cognitive Sanctuary assistant. Select some context on the left, or just ask me a question to get started.", type: 'text' }],
            contextIds: [],
            lastUpdated: new Date().toISOString()
        });
        setActiveChatId(newId);
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        deleteChatSession(id);
        if (activeChatId === id) {
            const remaining = chatSessions.filter(c => c.id !== id);
            if (remaining.length > 0) {
                setActiveChatId(remaining[0].id);
            } else {
                handleNewChat();
            }
        }
    };

    const startEdit = (e, chat) => {
        e.stopPropagation();
        setEditingId(chat.id);
        setEditValue(chat.title);
    };

    const submitEdit = (id) => {
        if (editValue.trim() !== '') {
            updateChatSession(id, { title: editValue.trim() });
        }
        setEditingId(null);
    };
    
    return (
        <div className="chat-history-container">
            <button 
                onClick={handleNewChat}
                className="new-chat-btn"
            >
                <MessageSquarePlus size={18} /> New Chat
            </button>

            <div className="chat-sessions-list custom-scrollbar">
                <AnimatePresence>
                    {chatSessions.map((chat) => (
                        <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            whileHover={{ 
                                scale: 1.02,
                             }}
                            className={`chat-session-item delete-container ${activeChatId === chat.id ? 'active' : ''}`}
                            onClick={() => setActiveChatId(chat.id)}
                        >
                            <div className="chat-session-header">
                                <MessageSquare size={16} color={activeChatId === chat.id ? 'var(--primary)' : 'var(--on-surface-muted)'} />
                                {editingId === chat.id ? (
                                    <input 
                                        autoFocus
                                        value={editValue}
                                        className="chat-edit-input"
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={() => submitEdit(chat.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') submitEdit(chat.id);
                                            if (e.key === 'Escape') setEditingId(null);
                                        }}
                                    />
                                ) : (
                                    <span 
                                        onDoubleClick={(e) => startEdit(e, chat)}
                                        onContextMenu={(e) => { e.preventDefault(); startEdit(e, chat); }}
                                        title="Double click or right click to rename"
                                        className={`chat-session-title ${activeChatId === chat.id ? 'active' : 'inactive'}`}
                                    >
                                        {chat.title}
                                    </span>
                                )}
                            </div>
                            <div className="chat-session-meta">
                                <Clock size={12} />
                                {formatDistanceToNow(new Date(chat.lastUpdated), { addSuffix: true })}
                            </div>

                            <div
                                className="delete-pane chat-delete-pane"
                                onClick={(e) => handleDelete(e, chat.id)}
                            >
                                <Trash2 size={20} />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
