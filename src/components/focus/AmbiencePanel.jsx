import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Trees, Waves, Flame, Volume2, Play, Pause } from 'lucide-react';

// Import sounds
import rainfallSound from '../../assets/sounds/rainfall.mp3';
import forestSound from '../../assets/sounds/forest.mp3';
import oceanSound from '../../assets/sounds/ocean.mp3';
import fireplaceSound from '../../assets/sounds/fireplace.mp3';

export default function AmbiencePanel() {
    const [selected, setSelected] = useState('Rainfall');
    const [volume, setVolume] = useState(45);
    const [isPlaying, setIsPlaying] = useState(false);

    const soundTypes = [
        { name: 'Rainfall', icon: CloudRain, color: '#5d97daff', file: rainfallSound },
        { name: 'Forest', icon: Trees, color: '#50c878', file: forestSound },
        { name: 'Ocean', icon: Waves, color: '#0077be', file: oceanSound },
        { name: 'Fireplace', icon: Flame, color: '#ff4500', file: fireplaceSound }
    ];

    const audioRef = useRef(null);

    // Initial capture and sync
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
        }

        const audio = audioRef.current;
        const currentSound = soundTypes.find(s => s.name === selected);
        
        // Update source if changed
        if (audio.src !== currentSound.file) {
            // If it was already a relative path, the browser might have normalized it
            // So we check if the end matches or just re-assign
            // Re-assigning is safer
            audio.src = currentSound.file;
            if (isPlaying) {
                audio.play().catch(e => console.error("Audio playback error:", e));
            }
        }

        // Sync volume (0.0 to 1.0)
        audio.volume = volume / 100;

        // Sync Play/Pause
        if (isPlaying) {
            audio.play().catch(e => console.error("Audio playback error:", e));
        } else {
            audio.pause();
        }

        return () => {
             // Cleanup logic is usually on unmount, but here we keep the ref. 
             // We only pause if the component actually unmounts.
        };
    }, [selected, isPlaying, volume]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    return (
        <div 
            className="card" 
            style={{ 
                backgroundColor: 'var(--surface-container-low)', 
                padding: '2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '2rem',
                borderRadius: '2.5rem' // More rounded as requested
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="text-title-lg">Ambience</h3>
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: isPlaying ? 'var(--primary)' : 'var(--surface-container-highest)',
                        color: isPlaying ? 'white' : 'var(--primary)',
                        border: 'none', cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isPlaying ? 'var(--shadow-glass)' : 'var(--shadow-ambient)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'brightness(1.1)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'none';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {soundTypes.map(sound => (
                    <motion.button 
                        key={sound.name}
                        whileHover={{ 
                            scale: 1.02, 
                            backgroundColor: selected === sound.name ? 'var(--primary)' : 'var(--surface-container-high)',
                            filter: selected === sound.name ? 'brightness(1.1)' : 'none'
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelected(sound.name)}
                        style={{ 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                            gap: '1rem', padding: '1.5rem', borderRadius: '2rem',
                            border: 'none', cursor: 'pointer',
                            backgroundColor: selected === sound.name ? 'var(--primary)' : 'var(--surface-container-lowest)',
                            color: selected === sound.name ? 'white' : 'var(--on-surface)',
                            transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease',
                            boxShadow: selected === sound.name ? 'var(--shadow-glass)' : 'var(--shadow-ambient)'
                        }}
                        className="ghost-boundary"
                    >
                        <sound.icon size={28} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{sound.name}</span>
                    </motion.button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--on-surface-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Volume2 size={18} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Volume</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{volume}%</span>
                </div>
                
                <input 
                    type="range" 
                    min="0" max="100" 
                    value={volume} 
                    onChange={e => setVolume(e.target.value)}
                    style={{ 
                        width: '100%', 
                        accentColor: 'var(--primary)', 
                        height: '6px', 
                        borderRadius: '3px',
                        cursor: 'pointer'
                    }}
                />
            </div>
        </div>
    );
}
