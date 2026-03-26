import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Trees, Waves, Flame, Volume2, Play, Pause } from 'lucide-react';

// Import sounds
import rainfallSound from '../../assets/sounds/rainfall.mp3';
import forestSound from '../../assets/sounds/forest.mp3';
import oceanSound from '../../assets/sounds/ocean.mp3';
import fireplaceSound from '../../assets/sounds/fireplace.mp3';

// Styles
import './AmbiencePanel.css';

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

        return () => {};
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
        <div className="ambience-card card">
            <div className="ambience-header">
                <h3 className="text-title-lg">Ambience</h3>
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`ambience-play-btn ${isPlaying ? 'playing' : 'paused'}`}
                >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </button>
            </div>

            <div className="ambience-sounds-grid">
                {soundTypes.map(sound => (
                    <motion.button 
                        key={sound.name}
                        animate={{ 
                            backgroundColor: selected === sound.name ? 'var(--primary)' : 'var(--surface-container-lowest)',
                            color: selected === sound.name ? '#ffffff' : 'var(--on-surface)'
                        }}
                        whileHover={{ 
                            scale: 1.02, 
                            backgroundColor: selected === sound.name ? 'var(--primary)' : 'var(--surface-container-high)',
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelected(sound.name)}
                        className={`ambience-sound-btn ghost-boundary ${selected === sound.name ? 'is-active' : 'is-inactive'}`}
                    >
                        <sound.icon size={28} />
                        <span className="ambience-sound-label">{sound.name}</span>
                    </motion.button>
                ))}
            </div>

            <div className="ambience-volume-controls">
                <div className="ambience-volume-header">
                    <div className="ambience-volume-label">
                        <Volume2 size={18} />
                        <span>Volume</span>
                    </div>
                    <span className="ambience-volume-percent">{volume}%</span>
                </div>
                
                <input 
                    type="range" 
                    min="0" max="100" 
                    value={volume} 
                    onChange={e => setVolume(e.target.value)}
                    className="ambience-volume-slider"
                />
            </div>
        </div>
    );
}
