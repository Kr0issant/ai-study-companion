import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, SkipForward, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStudy } from '../context/StudyContext';
import { containerVariants, itemVariants } from '../constants/FramerVariants';

// Components (We will create these next)
import FocusTimer from '../components/focus/FocusTimer';
import FocusTasks from '../components/focus/FocusTasks';
import AmbiencePanel from '../components/focus/AmbiencePanel';
import StreakCard from '../components/focus/StreakCard';

export default function Focus() {
    const { focusTasks, addFocusTask, toggleFocusTask, deleteFocusTask } = useStudy();
    const [quote, setQuote] = useState({ text: "The secret of getting ahead is getting started.", author: "Mark Twain" });

    const fallbackQuotes = [
        { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
        { text: "Your limit is only your imagination.", author: "Unknown" },
        { text: "Focus entirely on what is in front of you.", author: "Marcus Aurelius" },
        { text: "Deep work is the superpower of the 21st century.", author: "Cal Newport" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
    ];

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const response = await fetch('https://api.quotable.io/random');
                if (!response.ok) throw new Error('Quote API unreachable');
                const data = await response.json();
                setQuote({ text: data.content, author: data.author });
            } catch (error) {
                console.warn("Using fallback quote:", error);
                const randomFallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
                setQuote(randomFallback);
            }
        };
        fetchQuote();
    }, []);

    return (
        <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show" 
            style={{ 
                minHeight: 'calc(100vh - 120px)', 
                display: 'grid', 
                gridTemplateColumns: '320px 1fr 340px', 
                gap: '2.5rem',
                alignItems: 'start',
                paddingBottom: '32rem' // Increased bottom padding for even more scroll space
            }}
        >
            {/* Left Sidebar: Tasks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <FocusTasks tasks={focusTasks} addTask={addFocusTask} toggleTask={toggleFocusTask} deleteTask={deleteFocusTask} />
            </div>

            {/* Center: Timer & Quotes */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '2rem' }}>
                 <FocusTimer />
                 
                 <motion.div 
                    variants={itemVariants}
                    style={{ 
                        marginTop: '4rem', 
                        textAlign: 'center', 
                        maxWidth: '600px',
                        padding: '0 2rem' 
                    }}
                 >
                    <p className="text-display-md" style={{ fontSize: '1.5rem', fontStyle: 'italic', marginBottom: '1rem', lineHeight: 1.4 }}>
                        "{quote.text}"
                    </p>
                    <p style={{ color: 'var(--on-surface-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        — {quote.author}
                    </p>
                 </motion.div>
            </div>

            {/* Right Sidebar: Ambience */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <AmbiencePanel />
            </div>
        </motion.div>
    );
}
