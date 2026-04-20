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

// Constants
import { containerVariants, itemVariants } from '../constants/FramerVariants';

// Styles
import './Dashboard.css';

export default function Dashboard() {
  const { subjects, topics, tasks, notes, updateTask, addTask, deleteTask, settings } = useStudy();
  
  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Deletion Confirmation State
  const [itemToDelete, setItemToDelete] = useState(null); // { type, id }
  
  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

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
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="dashboard-container">
      
      {/* 1. Header & Welcome */}
      <motion.header variants={itemVariants} className="dashboard-header">
          <div>
              <h1 className="text-display-lg dashboard-welcome-title">
                  Welcome back, {settings.displayName}.
              </h1>
              <p className="text-title-lg dashboard-welcome-text">
                  You have <span className="dashboard-active-count">{pendingTasks.length}</span> tasks needing your focus today.
              </p>
          </div>
      </motion.header>

      {/* 2. KPIs extracted */}
      <KPISection 
        pendingTasksCount={pendingTasks.length}
        completedTasksCount={completedTasks.length}
        totalNotesCount={notes.length}
      />

      {/* 3. Main Operational Grid */}
      <div className="dashboard-main-grid">
          {/* Active Tasks extracted */}
          <TaskZone 
            tasks={tasks}
            subjects={subjects}
            updateTask={updateTask}
            setItemToDelete={setItemToDelete}
            setIsTaskModalOpen={setIsTaskModalOpen}
          />

          {/* Revision Calendar extracted (Now shows Tasks directly) */}
          <RevisionZone 
            tasks={tasks}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
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
      </AnimatePresence>

      <ConfirmationModal 
        isOpen={itemToDelete !== null}
        onConfirm={handleConfirmDelete}
        onClose={() => setItemToDelete(null)}
      />

    </motion.div>
  );
}
