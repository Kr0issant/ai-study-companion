import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export default function FocusTimer() {
    const { incrementFocusBlocks } = useStudy();
    
    // Independent durations for each phase
    const [focusDuration, setFocusDuration] = useState(25 * 60);
    const [breakDuration, setBreakDuration] = useState(5 * 60);
    
    // The duration baseline for the current phase (used for SVG progress)
    const [currentPhaseDuration, setCurrentPhaseDuration] = useState(25 * 60);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState('focus'); // focus, break
    
    const [isEditing, setIsEditing] = useState(false);
    const [editMins, setEditMins] = useState('25');
    const [editSecs, setEditSecs] = useState('00');
    const timerRef = useRef(null);

    const toggleEditing = () => {
        if (isActive) return;
        if (isEditing) {
            const newMins = parseInt(editMins) || 0;
            const newSecs = parseInt(editSecs) || 0;
            const totalSecs = (newMins * 60) + newSecs;
            if (totalSecs > 0) {
                if (phase === 'focus') {
                    setFocusDuration(totalSecs);
                } else {
                    setBreakDuration(totalSecs);
                }
                setCurrentPhaseDuration(totalSecs);
                setTimeLeft(totalSecs);
            }
        } else {
            // Load the correct phase's duration into inputs
            const currentSecs = phase === 'focus' ? focusDuration : breakDuration;
            setEditMins(Math.floor(currentSecs / 60).toString());
            setEditSecs((currentSecs % 60).toString().padStart(2, '0'));
        }
        setIsEditing(!isEditing);
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(timerRef.current);
            setIsActive(false);
            if (phase === 'focus') {
                incrementFocusBlocks();
                // Auto skip to break
                skipPhase();
            } else {
                // Break's over, back to focus
                skipPhase();
            }
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft, phase]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const resetTimer = () => {
        setIsActive(false);
        const baseDuration = phase === 'focus' ? focusDuration : breakDuration;
        setTimeLeft(baseDuration);
        setCurrentPhaseDuration(baseDuration);
    };

    const skipPhase = () => {
        setIsActive(false);
        const nextPhase = phase === 'focus' ? 'break' : 'focus';
        const nextDuration = nextPhase === 'focus' ? focusDuration : breakDuration;
        
        setPhase(nextPhase);
        setCurrentPhaseDuration(nextDuration);
        setTimeLeft(nextDuration);
    };

    // Circle progress calculation
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    // Always calculate relative to the current phase's total duration
    const progress = (currentPhaseDuration - timeLeft) / currentPhaseDuration;
    const dashOffset = (currentPhaseDuration === 0) ? circumference : circumference * (1 - progress);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem' }}>
            {/* The Timer Circle */}
            <div 
                style={{ 
                    position: 'relative', 
                    width: '320px', 
                    height: '320px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: isActive ? 'default' : 'pointer'
                }}
                onClick={toggleEditing}
            >
                {/* Background Track */}
                <svg width="320" height="320" viewBox="0 0 320 320" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                    <circle 
                        cx="160" cy="160" r={radius}
                        fill="none" 
                        stroke="var(--surface-container-high)" 
                        strokeWidth="12"
                    />
                    {/* Progress Fill */}
                    <motion.circle 
                        key={phase} // Unique key ensures animation resets per phase
                        cx="160" cy="160" r={radius}
                        fill="none" 
                        stroke="var(--primary)" 
                        strokeWidth="12"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: dashOffset }}
                        transition={{ duration: 0.5, ease: "linear" }}
                    />
                </svg>

                {/* Inner Content */}
                <div 
                    style={{ textAlign: 'center', zIndex: 1 }}
                    onClick={isActive ? undefined : toggleEditing}
                >
                    {isEditing ? (
                        <div 
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                            onClick={(e) => e.stopPropagation()} 
                            onBlur={(e) => {
                                // Only save and close if focus isn't moving to another element within the container
                                if (!e.currentTarget.contains(e.relatedTarget)) {
                                    toggleEditing();
                                }
                            }}
                        >
                            <input 
                                type="text"
                                value={editMins}
                                onChange={(e) => setEditMins(e.target.value.replace(/\D/g,'').slice(0, 3))}
                                onKeyDown={(e) => e.key === 'Enter' && toggleEditing()}
                                autoFocus
                                style={{ 
                                    width: '100px', background: 'transparent', border: 'none', 
                                    outline: 'none', textAlign: 'right', fontSize: '4.5rem', 
                                    fontWeight: 800, color: 'var(--primary)', fontFamily: 'Manrope' 
                                }}
                            />
                            <span style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--primary)', paddingBottom: '0.5rem' }}>:</span>
                            <input 
                                type="text"
                                value={editSecs}
                                onChange={(e) => setEditSecs(e.target.value.replace(/\D/g,'').slice(0, 2))}
                                onKeyDown={(e) => e.key === 'Enter' && toggleEditing()}
                                style={{ 
                                    width: '100px', background: 'transparent', border: 'none', 
                                    outline: 'none', textAlign: 'left', fontSize: '4.5rem', 
                                    fontWeight: 800, color: 'var(--primary)', fontFamily: 'Manrope' 
                                }}
                            />
                        </div>
                    ) : (
                        <h2 className="text-display-lg" style={{ fontSize: '4.5rem', marginBottom: '0.25rem', letterSpacing: '-0.02em', fontWeight: 800 }}>
                            {formatTime(timeLeft)}
                        </h2>
                    )}
                    <p style={{ 
                        color: 'var(--primary)', 
                        fontWeight: 700, 
                        letterSpacing: '0.2em', 
                        textTransform: 'uppercase', 
                        fontSize: '0.875rem',
                        marginTop: isEditing ? '-1.5rem' : '0'
                    }}>
                        {isEditing ? 'PRESS ENTER TO SAVE' : (phase === 'focus' ? 'Deep Focus' : 'Short Break')}
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <button 
                    onClick={resetTimer}
                    className="btn btn-ghost"
                    style={{ 
                        width: '64px', height: '64px', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--on-surface-muted)'
                    }}
                >
                    <RotateCcw size={28} />
                </button>

                <button 
                    onClick={() => setIsActive(!isActive)}
                    style={{ 
                        width: '72px', height: '72px', borderRadius: '48px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'var(--primary)', color: 'white',
                        boxShadow: 'var(--shadow-glass)', border: 'none', cursor: 'pointer'
                    }}
                >
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                    {/* <span style={{ fontWeight: 600, marginLeft: '0.5rem', fontSize: '1.125rem' }}>
                        {isActive ? 'Pause' : 'Start'}
                    </span> */}
                </button>

                <button 
                    onClick={skipPhase}
                    className="btn btn-ghost"
                    style={{ 
                        width: '64px', height: '64px', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--on-surface-muted)'
                    }}
                >
                    <SkipForward size={28} />
                </button>
            </div>
        </div>
    );
}
