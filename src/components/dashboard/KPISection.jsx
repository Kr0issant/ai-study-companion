import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Flame, BookOpen } from 'lucide-react';
import { itemVariants } from '../../constants/FramerVariants';
import './KPISection.css';

export default function KPISection({ pendingTasksCount, completedTasksCount, masteredTopicsCount, totalTopicsCount }) {
  return (
    <motion.section variants={itemVariants} className="kpi-container">
      <div className="card layer-low ghost-boundary kpi-card">
          <div className="kpi-icon-bg">
              <CheckCircle2 size={120} color="var(--primary)" />
          </div>
          <div className="kpi-header" style={{ color: 'var(--primary)' }}>
              <CheckCircle2 size={24} /> <h3 className="text-title-md">Tasks Completed</h3>
          </div>
          <p className="text-display-lg kpi-value">{completedTasksCount}</p>
      </div>
      
      <div className="card layer-lowest ghost-boundary kpi-card" style={{ boxShadow: 'var(--shadow-glass)' }}>
          <div className="kpi-icon-bg">
              <Flame size={120} color="var(--tertiary)" />
          </div>
          <div className="kpi-header" style={{ color: 'var(--tertiary)' }}>
              <Flame size={24} /> <h3 className="text-title-md">Pending Tasks</h3>
          </div>
          <p className="text-display-lg kpi-value">{pendingTasksCount}</p>
      </div>
 
      <div className="card primary-gradient kpi-card" style={{ color: 'white' }}>
          <div className="kpi-icon-bg" style={{ opacity: 0.2 }}>
              <BookOpen size={120} />
          </div>
          <div className="kpi-header" style={{ color: 'white' }}>
              <BookOpen size={24} /> <h3 className="text-title-md" style={{ color: 'white' }}>Topics Mastered</h3>
          </div>
          <p className="text-display-lg kpi-value" style={{ color: 'white' }}>
              {masteredTopicsCount} 
              <span className="kpi-progress-fraction"> / {totalTopicsCount}</span>
          </p>
      </div>
    </motion.section>
  );
}
