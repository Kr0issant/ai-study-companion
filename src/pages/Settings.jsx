import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot, Key, Save, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { containerVariants, itemVariants } from '../constants/FramerVariants';

export default function Settings() {
    const { settings, updateSettings } = useStudy();
    const [localSettings, setLocalSettings] = useState(settings);
    const [showSaved, setShowSaved] = useState(false);

    const handleSave = () => {
        updateSettings(localSettings);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 3000);
    };

    const handleChange = (field, value) => {
        setLocalSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{ 
                maxWidth: '800px', 
                margin: '0 auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '2.5rem',
                paddingBottom: '8rem'
            }}
        >
            <motion.div variants={itemVariants} style={{ marginBottom: '1rem' }}>
                <h1 className="text-display-md" style={{ letterSpacing: '-0.03em' }}>Settings</h1>
                <p style={{ color: 'var(--on-surface-muted)', marginTop: '0.5rem' }}>
                    Personalize your sanctuary and configure the AI assistant.
                </p>
            </motion.div>

            {/* Identity Section */}
            <motion.div variants={itemVariants} className="card" style={{ padding: '2.5rem', borderRadius: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '1rem', backgroundColor: 'var(--primary-container)', color: 'var(--primary)' }}>
                        <User size={24} />
                    </div>
                    <h2 className="text-title-lg">Identity</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface-muted)', marginLeft: '0.5rem' }}>
                        USERNAME
                    </label>
                    <input 
                        type="text"
                        className="input-field"
                        value={localSettings.username}
                        onChange={(e) => handleChange('username', e.target.value)}
                        placeholder="e.g. Atlas"
                        style={{ fontSize: '1.125rem', padding: '1.25rem' }}
                    />
                </div>
            </motion.div>

            {/* AI Assistant Section */}
            <motion.div variants={itemVariants} className="card" style={{ padding: '2.5rem', borderRadius: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '1rem', backgroundColor: 'var(--secondary-container)', color: 'var(--secondary)' }}>
                        <Bot size={24} />
                    </div>
                    <h2 className="text-title-lg">AI Assistant</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Provider Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface-muted)', marginLeft: '0.5rem' }}>
                            AI PROVIDER
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button 
                                onClick={() => handleChange('aiProvider', 'openai')}
                                style={{ 
                                    padding: '1.25rem', borderRadius: '1.5rem', border: 'none', cursor: 'pointer',
                                    backgroundColor: localSettings.aiProvider === 'openai' ? 'var(--primary-container)' : 'var(--surface-container-high)',
                                    color: localSettings.aiProvider === 'openai' ? 'white' : 'var(--on-surface)',
                                    fontWeight: 700, transition: 'all 0.2s ease',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                }}
                            >
                                <span style={{ opacity: localSettings.aiProvider === 'openai' ? 1 : 0.5 }}>OpenAI (ChatGPT)</span>
                                {localSettings.aiProvider === 'openai' && <CheckCircle2 size={18} />}
                            </button>
                            <button 
                                onClick={() => handleChange('aiProvider', 'gemini')}
                                style={{ 
                                    padding: '1.25rem', borderRadius: '1.5rem', border: 'none', cursor: 'pointer',
                                    backgroundColor: localSettings.aiProvider === 'gemini' ? 'var(--primary-container)' : 'var(--surface-container-high)',
                                    color: localSettings.aiProvider === 'gemini' ? 'white' : 'var(--on-surface)',
                                    fontWeight: 700, transition: 'all 0.2s ease',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                }}
                            >
                                <span style={{ opacity: localSettings.aiProvider === 'gemini' ? 1 : 0.5 }}>Google Gemini</span>
                                {localSettings.aiProvider === 'gemini' && <CheckCircle2 size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* API Key Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface-muted)', marginLeft: '0.5rem' }}>
                            {localSettings.aiProvider === 'openai' ? 'OPENAI API KEY' : 'GEMINI API KEY'}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="password"
                                className="input-field"
                                value={localSettings.aiProvider === 'openai' ? localSettings.openaiApiKey : localSettings.geminiApiKey}
                                onChange={(e) => handleChange(localSettings.aiProvider === 'openai' ? 'openaiApiKey' : 'geminiApiKey', e.target.value)}
                                placeholder="sk-..."
                                style={{ fontSize: '1rem', padding: '1.25rem', paddingLeft: '3.5rem' }}
                            />
                            <Key size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-muted)' }} />
                        </div>
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', 
                            padding: '1rem', borderRadius: '1rem', backgroundColor: 'var(--surface-container-highest)',
                            marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--on-surface-muted)'
                        }}>
                            <ShieldCheck size={18} color="var(--primary)" />
                            <span>Your key is stored locally on this browser and is never sent to our servers.</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Save Button */}
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem' }}>
                <AnimatePresence>
                    {showSaved && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                            style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <CheckCircle2 size={20} /> Settings saved
                        </motion.div>
                    )}
                </AnimatePresence>
                <button 
                    onClick={handleSave}
                    className="btn btn-primary"
                    style={{ padding: '1.25rem 3rem', borderRadius: '1.5rem', fontSize: '1rem' }}
                >
                    <Save size={20} style={{ marginRight: '0.5rem' }} /> Save Changes
                </button>
            </motion.div>
        </motion.div>
    );
}
