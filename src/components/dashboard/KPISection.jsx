import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Flame, BookOpen } from 'lucide-react';
import { itemVariants } from '../../constants/FramerVariants';

export default function KPISection({ pendingTasksCount, completedTasksCount, masteredTopicsCount, totalTopicsCount }) {
  return (
    <motion.section variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
      <div className="card layer-low ghost-boundary" style={{ position: 'relative', overflow: 'visible', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}>
              <CheckCircle2 size={120} color="var(--primary)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', position: 'relative', zIndex: 1 }}>
              <CheckCircle2 size={24} /> <h3 className="text-title-md">Tasks Completed</h3>
          </div>
          <p className="text-display-lg" style={{ position: 'relative', zIndex: 1 }}>{completedTasksCount}</p>
      </div>
      
      <div className="card layer-lowest ghost-boundary" style={{ position: 'relative', overflow: 'visible', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: 'var(--shadow-glass)' }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}>
              <Flame size={120} color="var(--tertiary)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--tertiary)', position: 'relative', zIndex: 1 }}>
              <Flame size={24} /> <h3 className="text-title-md">Pending Tasks</h3>
          </div>
          <p className="text-display-lg" style={{ position: 'relative', zIndex: 1 }}>{pendingTasksCount}</p>
      </div>
 
      <div className="card primary-gradient" style={{ position: 'relative', overflow: 'visible', display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'white' }}>
          <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.2 }}>
              <BookOpen size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white', position: 'relative', zIndex: 1 }}>
              <BookOpen size={24} /> <h3 className="text-title-md" style={{ color: 'white' }}>Topics Mastered</h3>
          </div>
          <p className="text-display-lg" style={{ position: 'relative', zIndex: 1, color: 'white' }}>
              {masteredTopicsCount} 
              <span style={{ fontSize: '1.5rem', fontWeight: 500, opacity: 0.7, color: 'white' }}> / {totalTopicsCount}</span>
          </p>
      </div>
    </motion.section>
  );
}
