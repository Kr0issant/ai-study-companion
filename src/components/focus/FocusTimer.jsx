import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

// Styles
import './FocusTimer.css';

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
    const radius = 145;
    const circumference = 2 * Math.PI * radius;
    // Always calculate relative to the current phase's total duration
    const progress = (currentPhaseDuration - timeLeft) / currentPhaseDuration;
    const dashOffset = (currentPhaseDuration === 0) ? circumference : circumference * (1 - progress);

    return (
        <div className="focus-timer-container">
            {/* The Timer Circle */}
            <div 
                className="timer-circle-wrapper"
                style={{ cursor: isActive ? 'default' : 'pointer' }}
                onClick={toggleEditing}
            >
                {/* Background Track */}
                <svg width="400" height="400" viewBox="0 0 400 400" className="timer-svg">
                    <circle 
                        cx="200" cy="200" r={radius}
                        fill="none" 
                        stroke="var(--surface-container-high)" 
                        strokeWidth="12"
                    />
                    {/* Progress Fill */}
                    <motion.circle 
                        key={phase} // Unique key ensures animation resets per phase
                        cx="200" cy="200" r={radius}
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
                    className="timer-content"
                    onClick={isActive ? undefined : toggleEditing}
                >
                    {isEditing ? (
                        <div 
                            className="timer-edit-container"
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
                                className="timer-edit-input"
                                style={{ textAlign: 'right' }}
                                value={editMins}
                                onChange={(e) => setEditMins(e.target.value.replace(/\D/g,'').slice(0, 3))}
                                onKeyDown={(e) => e.key === 'Enter' && toggleEditing()}
                                autoFocus
                            />
                            <span className="timer-edit-divider">:</span>
                            <input 
                                type="text"
                                className="timer-edit-input"
                                style={{ textAlign: 'left' }}
                                value={editSecs}
                                onChange={(e) => setEditSecs(e.target.value.replace(/\D/g,'').slice(0, 2))}
                                onKeyDown={(e) => e.key === 'Enter' && toggleEditing()}
                            />
                        </div>
                    ) : (
                        <h2 className="text-display-lg timer-display">
                            {formatTime(timeLeft)}
                        </h2>
                    )}
                    <p className="timer-phase-label" style={{ marginTop: isEditing ? '-1.5rem' : '0' }}>
                        {isEditing ? 'PRESS ENTER TO SAVE' : (phase === 'focus' ? 'Deep Focus' : 'Short Break')}
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="timer-controls">
                <button 
                    onClick={resetTimer}
                    className="btn btn-ghost timer-control-btn"
                >
                    <RotateCcw size={28} />
                </button>

                <button 
                    onClick={() => setIsActive(!isActive)}
                    className="timer-main-btn"
                >
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                </button>

                <button 
                    onClick={skipPhase}
                    className="btn btn-ghost timer-control-btn"
                >
                    <SkipForward size={28} />
                </button>
            </div>
        </div>
    );
}
