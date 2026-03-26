import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, MessageSquare, Trash2, Clock } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { formatDistanceToNow } from 'date-fns';

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
            // Re-route to the first available chat, or create one if empty
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <button 
                onClick={handleNewChat}
                style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                    padding: '0.875rem', borderRadius: '1rem', backgroundColor: 'var(--primary)', 
                    color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', marginBottom: '0.5rem',
                    boxShadow: 'var(--shadow-glass)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'brightness(1.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                <MessageSquarePlus size={18} /> New Chat
            </button>

            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                <AnimatePresence>
                    {chatSessions.map((chat) => (
                        <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            whileHover={{ 
                                scale: 1.02, 
                                backgroundColor: activeChatId === chat.id ? 'var(--surface-container-high)' : 'var(--surface-container-low)',
                                filter: activeChatId === chat.id ? 'brightness(1.02)' : 'none'
                             }}
                            className="delete-container"
                            style={{
                                padding: '1rem', borderRadius: '1rem', cursor: 'pointer',
                                backgroundColor: activeChatId === chat.id ? 'var(--surface-container-high)' : 'transparent',
                                border: `1px solid ${activeChatId === chat.id ? 'var(--outline-variant)' : 'transparent'}`,
                                display: 'flex', flexDirection: 'column', gap: '0.25rem',
                                position: 'relative', overflow: 'hidden', transition: 'all 0.2s ease'
                            }}
                            onClick={() => setActiveChatId(chat.id)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MessageSquare size={16} color={activeChatId === chat.id ? 'var(--primary)' : 'var(--on-surface-muted)'} />
                                {editingId === chat.id ? (
                                    <input 
                                        autoFocus
                                        value={editValue}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={() => submitEdit(chat.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') submitEdit(chat.id);
                                            if (e.key === 'Escape') setEditingId(null);
                                        }}
                                        style={{ 
                                            flex: 1, backgroundColor: 'transparent', color: 'var(--on-surface)',
                                            border: 'none', fontWeight: 600, fontSize: '0.95rem', outline: 'none', borderBottom: '1px solid var(--primary)'
                                        }}
                                    />
                                ) : (
                                    <span 
                                        onDoubleClick={(e) => startEdit(e, chat)}
                                        onContextMenu={(e) => { e.preventDefault(); startEdit(e, chat); }}
                                        title="Double click or right click to rename"
                                        style={{ 
                                            fontWeight: 600, fontSize: '0.95rem', color: activeChatId === chat.id ? 'var(--primary)' : 'var(--on-surface)', 
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 
                                        }}
                                    >
                                        {chat.title}
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--on-surface-muted)', fontSize: '0.75rem', paddingLeft: '1.5rem' }}>
                                <Clock size={12} />
                                {formatDistanceToNow(new Date(chat.lastUpdated), { addSuffix: true })}
                            </div>

                            {/* Hover Delete Action */}
                            <button
                                className="delete-pane"
                                onClick={(e) => handleDelete(e, chat.id)}
                                style={{
                                    border: 'none', cursor: 'pointer'
                                }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
