import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, SkipForward, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
    const [quote, setQuote] = useState({ text: "Looking for inspiration...", author: "Symphony" });

    const fallbackQuotes = [
        { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
        { text: "Your limit is only your imagination.", author: "Unknown" },
        { text: "Focus entirely on what is in front of you.", author: "Marcus Aurelius" },
        { text: "Deep work is the superpower of the 21st century.", author: "Cal Newport" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
        { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
        { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
        { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
        { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "Don't wish it were easier. Wish you were better.", author: "Jim Rohn" },
        { text: "Productivity is never an accident. It is always the result of a commitment to excellence.", author: "Paul J. Meyer" },
        { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
        { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" }
    ];

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                // ZenQuotes random endpoint via AllOrigins CORS Proxy
                // Added cache-buster to ensure a fresh random quote on every refresh
                const targetUrl = `https://zenquotes.io/api/random?cb=${Date.now()}`;
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
                
                const response = await axios.get(proxyUrl);
                
                // AllOrigins /raw might return a string if the content type isn't application/json
                // Axios handles the response.data based on the content type
                const data = response.data;
                
                // ZenQuotes yields an array [{ q: "text", a: "author", ... }]
                // We handle both direct array or a string that needs parsing
                const quoteData = typeof data === 'string' ? JSON.parse(data) : data;
                
                if (quoteData && quoteData[0]) {
                    setQuote({ text: quoteData[0].q, author: quoteData[0].a });
                }
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
