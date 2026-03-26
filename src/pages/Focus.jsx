import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, SkipForward, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStudy } from '../context/StudyContext';
import { containerVariants, itemVariants } from '../constants/FramerVariants';
import './Focus.css';

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
            className="focus-container"
        >
            {/* Left Sidebar: Tasks */}
            <div className="focus-sidebar-left">
                <FocusTasks tasks={focusTasks} addTask={addFocusTask} toggleTask={toggleFocusTask} deleteTask={deleteFocusTask} />
            </div>

            {/* Center: Timer & Quotes */}
            <div className="focus-center-content">
                 <FocusTimer />
                 
                 <motion.div 
                    variants={itemVariants}
                    className="focus-quote-section"
                 >
                    <p className="text-display-md focus-quote-text">
                        "{quote.text}"
                    </p>
                    <p className="focus-quote-author">
                        — {quote.author}
                    </p>
                 </motion.div>
            </div>

            {/* Right Sidebar: Ambience */}
            <div className="focus-sidebar-right">
                <AmbiencePanel />
            </div>
        </motion.div>
    );
}
