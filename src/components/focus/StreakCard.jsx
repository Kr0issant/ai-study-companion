import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export default function StreakCard() {
    const { focusStats } = useStudy();
    const blocks = focusStats?.focusBlocksToday || 0;
    const minutes = blocks * 25; // Estimate based on standard 25m focus

    return (
        <motion.div 
            className="card" 
            style={{ 
                backgroundColor: 'var(--surface-container-highest)', // Updated to available variable
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                border: 'none',
                color: 'var(--on-tertiary-container)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Zap size={20} fill="currentColor" />
                <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>Current Streak</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 className="text-display-lg" style={{ fontSize: '2.5rem', margin: 0 }}>
                    {blocks} Focus Blocks
                </h3>
                <p style={{ fontSize: '0.875rem', opacity: 0.8, fontWeight: 500 }}>
                    {minutes} minutes total deep work today
                </p>
            </div>

            <div style={{ 
                display: 'flex', gap: '0.5rem', marginTop: '0.5rem'
            }}>
                {[...Array(5)].map((_, i) => (
                    <div 
                        key={i} 
                        style={{ 
                            flex: 1, height: '6px', borderRadius: '3px',
                            backgroundColor: i < blocks ? 'var(--tertiary)' : 'rgba(255,255,255,0.2)'
                        }} 
                    />
                ))}
            </div>
        </motion.div>
    );
}
