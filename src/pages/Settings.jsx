import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot, Key, Save, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { containerVariants, itemVariants } from '../constants/FramerVariants';
import './Settings.css';

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
            className="settings-container"
        >
            <motion.div variants={itemVariants} className="settings-header">
                <h1 className="text-display-md">Settings</h1>
                <p className="curriculum-subtitle" style={{ marginTop: '0.5rem' }}>
                    Personalize your sanctuary and configure the AI assistant.
                </p>
            </motion.div>

            {/* Identity Section */}
            <motion.div variants={itemVariants} className="card settings-card">
                <div className="settings-section-header">
                    <div className="settings-icon-wrapper settings-icon-identity">
                        <User size={24} />
                    </div>
                    <h2 className="text-title-lg">Identity</h2>
                </div>

                <div className="settings-field-group">
                    <label className="settings-label">
                        USERNAME
                    </label>
                    <input 
                        type="text"
                        className="input-field settings-input-large"
                        value={localSettings.username}
                        onChange={(e) => handleChange('username', e.target.value)}
                        placeholder="e.g. Atlas"
                    />
                </div>
            </motion.div>

            {/* AI Assistant Section */}
            <motion.div variants={itemVariants} className="card settings-card">
                <div className="settings-section-header">
                    <div className="settings-icon-wrapper settings-icon-ai">
                        <Bot size={24} />
                    </div>
                    <h2 className="text-title-lg">AI Assistant</h2>
                </div>

                <div className="flex-column gap-md">
                    {/* Provider Selection */}
                    <div className="settings-field-group">
                        <label className="settings-label">
                            AI PROVIDER
                        </label>
                        <div className="settings-grid-2col">
                            <button 
                                onClick={() => handleChange('aiProvider', 'openai')}
                                className={`provider-btn ${localSettings.aiProvider === 'openai' ? 'active' : 'inactive'}`}
                            >
                                <span className="provider-label">OpenAI (ChatGPT)</span>
                                {localSettings.aiProvider === 'openai' && <CheckCircle2 size={18} />}
                            </button>
                            <button 
                                onClick={() => handleChange('aiProvider', 'gemini')}
                                className={`provider-btn ${localSettings.aiProvider === 'gemini' ? 'active' : 'inactive'}`}
                            >
                                <span className="provider-label">Google Gemini</span>
                                {localSettings.aiProvider === 'gemini' && <CheckCircle2 size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* API Key Input */}
                    <div className="settings-field-group">
                        <label className="settings-label">
                            {localSettings.aiProvider === 'openai' ? 'OPENAI API KEY' : 'GEMINI API KEY'}
                        </label>
                        <div className="api-key-wrapper">
                            <input 
                                type="password"
                                className="input-field api-key-input"
                                value={localSettings.aiProvider === 'openai' ? localSettings.openaiApiKey : localSettings.geminiApiKey}
                                onChange={(e) => handleChange(localSettings.aiProvider === 'openai' ? 'openaiApiKey' : 'geminiApiKey', e.target.value)}
                                placeholder="sk-..."
                            />
                            <Key size={20} className="api-key-icon" />
                        </div>
                        <div className="settings-info-pill">
                            <ShieldCheck size={18} color="var(--primary)" />
                            <span>Your key is stored locally on this browser and is never sent to our servers.</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Save Button */}
            {/* Save Button */}
            <motion.div variants={itemVariants} className="flex-row items-center justify-end gap-md">
                <AnimatePresence>
                    {showSaved && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                            className="flex-row items-center gap-xs"
                            style={{ color: 'var(--primary)', fontWeight: 600 }}
                        >
                            <CheckCircle2 size={20} /> Settings saved
                        </motion.div>
                    )}
                </AnimatePresence>
                <button 
                    onClick={handleSave}
                    className="btn btn-primary"
                    style={{ padding: '1.25rem 3rem', borderRadius: '1.5rem' }}
                >
                    <Save size={20} className="mr-xs" /> Save Changes
                </button>
            </motion.div>
        </motion.div>
    );
}
