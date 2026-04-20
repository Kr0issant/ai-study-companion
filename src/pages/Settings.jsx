import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot, Key, Save, CheckCircle2, ShieldCheck, LogOut, Loader2, XCircle } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { containerVariants, itemVariants } from '../constants/FramerVariants';
import './Settings.css';

export default function Settings() {
    const { settings, updateSettings } = useStudy();
    const { user, userData, logout, updateUsername, checkUsernameUnique } = useAuth();
    const [localSettings, setLocalSettings] = useState(settings);
    const [showSaved, setShowSaved] = useState(false);

    // Dynamic Username Context
    const [newUsername, setNewUsername] = useState('');
    const [usernameHydrated, setUsernameHydrated] = useState(false);
    
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isUsernameValid, setIsUsernameValid] = useState(null);

    // Hydrate initially
    useEffect(() => {
        if (userData?.username && !usernameHydrated) {
            setNewUsername(userData.username);
            setUsernameHydrated(true);
        }
    }, [userData, usernameHydrated]);

    useEffect(() => {
        if (!newUsername.trim() || newUsername.trim() === userData?.username) {
            setIsUsernameValid(null);
            setIsCheckingUsername(false);
            return;
        }

        setIsCheckingUsername(true);
        setIsUsernameValid(null);

        const timer = setTimeout(async () => {
            try {
                const unique = await checkUsernameUnique(newUsername.trim());
                setIsUsernameValid(unique);
            } catch (err) {
                setIsUsernameValid(null);
            }
            setIsCheckingUsername(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [newUsername, userData?.username, checkUsernameUnique]);

    const handleSave = async () => {
        const trimmedNewName = newUsername.trim();
        
        // 1. Process Username if changed
        if (trimmedNewName !== userData?.username) {
            if (trimmedNewName.length === 0) {
                alert("Cannot save settings: Username cannot be empty.");
                return;
            }
            if (isUsernameValid === false) {
                alert("Cannot save settings: That username is already taken!");
                return;
            }
            try {
                await updateUsername(trimmedNewName);
            } catch (e) {
                alert("Failed to update username: " + e.message);
                return;
            }
        }

        // 2. Process Study Settings
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
                    <h2 className="text-title-lg">Account & Identity</h2>
                </div>

                <div className="flex-column gap-md">
                    <div className="settings-grid-2col">
                        <div className="settings-field-group">
                            <label className="settings-label">EMAIL ADDRESS</label>
                            <input 
                                type="text"
                                className="input-field"
                                value={user?.email || ''}
                                disabled
                                style={{ opacity: 0.7, cursor: 'not-allowed' }}
                            />
                        </div>
                        <div className="settings-field-group">
                            <label className="settings-label">USERNAME</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type="text"
                                    className="input-field"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    style={{ 
                                        width: '100%',
                                        paddingRight: '2.5rem',
                                        border: isUsernameValid === true ? '2px solid #10b981' : isUsernameValid === false ? '2px solid #ef4444' : '1px solid var(--outline)'
                                    }}
                                />
                                <div style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                                    {isCheckingUsername && <Loader2 size={18} color="var(--on-surface-muted)" style={{ animation: 'spin 1s linear infinite' }} />}
                                    {!isCheckingUsername && isUsernameValid === true && <CheckCircle2 size={18} color="#10b981" />}
                                    {!isCheckingUsername && isUsernameValid === false && <XCircle size={18} color="var(--tertiary)" />}
                                </div>
                            </div>
                            {isUsernameValid === false && (
                                <div style={{ color: 'var(--tertiary)', fontSize: '0.8rem', marginTop: '0.35rem', paddingLeft: '0.5rem' }}>
                                    Username is already taken.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="settings-field-group">
                        <label className="settings-label">
                            DISPLAY NAME
                        </label>
                        <input 
                            type="text"
                            className="input-field settings-input-large"
                            value={localSettings.displayName || ''}
                            onChange={(e) => handleChange('displayName', e.target.value)}
                            placeholder="e.g. Atlas"
                        />
                    </div>
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
                            <span>Your key is safely encrypted before being stored.</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Bottom Actions Row */}
            <motion.div variants={itemVariants} className="flex-between items-center gap-md" style={{ marginTop: '1rem' }}>
                <button 
                    onClick={logout}
                    className="btn btn-ghost" 
                    style={{ color: 'var(--tertiary)', outlineColor: 'rgba(200,50,50,0.2)', padding: '0.75rem 1.5rem' }}
                >
                    <LogOut size={18} className="mr-xs" /> Sign Out
                </button>

                <div className="flex-row items-center gap-md">
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
                </div>
            </motion.div>
        </motion.div>
    );
}
