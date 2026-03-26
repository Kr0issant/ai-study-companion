import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

// Context
import { useStudy } from '../context/StudyContext';

// Components
import ConfirmationModal from '../components/ConfirmationModal';
import KPISection from '../components/dashboard/KPISection';
import TaskZone from '../components/dashboard/TaskZone';
import RevisionZone from '../components/dashboard/RevisionZone';

// Modals
import TaskCreationModal from '../components/modals/TaskCreationModal';
import RevisionModal from '../components/modals/RevisionModal';

// Constants
import { containerVariants, itemVariants } from '../constants/FramerVariants';

export default function Dashboard() {
  const { subjects, topics, tasks, updateTask, addTask, deleteTask } = useStudy();
  
  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isRevModalOpen, setIsRevModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Deletion Confirmation State
  const [itemToDelete, setItemToDelete] = useState(null); // { type, id }
  
  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);
  const masteredTopicsCount = topics.filter(t => t.completionStatus === 'done').length;

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'task') {
      deleteTask(itemToDelete.id);
    }
    
    setItemToDelete(null);
  };

  const isSameDay = (date1, date2) => {
    return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd');
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '4rem' }}>
      
      {/* 1. Header & Welcome */}
      <motion.header variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
          <div>
              <h1 className="text-display-lg" style={{ letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                  Welcome back.
              </h1>
              <p className="text-title-lg" style={{ color: 'var(--on-surface-muted)' }}>
                  You have <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{pendingTasks.length}</span> tasks needing your focus today.
              </p>
          </div>
      </motion.header>

      {/* 2. KPIs extracted */}
      <KPISection 
        pendingTasksCount={pendingTasks.length}
        completedTasksCount={completedTasks.length}
        masteredTopicsCount={masteredTopicsCount}
        totalTopicsCount={topics.length}
      />

      {/* 3. Main Operational Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(360px, 1fr)', gap: '3rem', alignItems: 'start' }}>
          {/* Active Tasks extracted */}
          <TaskZone 
            tasks={tasks}
            subjects={subjects}
            updateTask={updateTask}
            setItemToDelete={setItemToDelete}
            setIsTaskModalOpen={setIsTaskModalOpen}
          />

          {/* Revision Calendar extracted (Now shows Tasks) */}
          <RevisionZone 
            tasks={tasks}
            setSelectedDate={setSelectedDate}
            setIsRevModalOpen={setIsRevModalOpen}
          />
      </div>
      
      {/* Modals */}
      <AnimatePresence>
          {isTaskModalOpen && (
              <TaskCreationModal 
                onClose={() => setIsTaskModalOpen(false)} 
                subjects={subjects} 
                addTask={addTask} 
              />
          )}
          {isRevModalOpen && selectedDate && (
               <RevisionModal 
                   date={selectedDate} 
                   onClose={() => setIsRevModalOpen(false)} 
                   tasks={tasks.filter(t => isSameDay(new Date(t.dueDate), selectedDate))}
               />
          )}
      </AnimatePresence>

      <ConfirmationModal 
        isOpen={itemToDelete !== null}
        onConfirm={handleConfirmDelete}
        onClose={() => setItemToDelete(null)}
      />

    </motion.div>
  );
}
