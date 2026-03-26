import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

// Styles
import './StreakCard.css';

export default function StreakCard() {
    const { focusStats } = useStudy();
    const blocks = focusStats?.focusBlocksToday || 0;
    const minutes = blocks * 25; // Estimate based on standard 25m focus

    return (
        <motion.div className="streak-card card">
            <div className="streak-header">
                <Zap size={20} fill="currentColor" />
                <span className="streak-label">Current Streak</span>
            </div>

            <div className="streak-body">
                <h3 className="text-display-lg streak-count-text">
                    {blocks} Focus Blocks
                </h3>
                <p className="streak-subtext">
                    {minutes} minutes total deep work today
                </p>
            </div>

            <div className="streak-progress-bar">
                {[...Array(5)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`streak-dot ${i < blocks ? 'active' : 'inactive'}`}
                    />
                ))}
            </div>
        </motion.div>
    );
}
