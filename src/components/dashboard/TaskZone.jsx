import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Search, Filter, ListFilter, ArrowUp, ArrowDown, X, AlertCircle, Clock } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { itemVariants } from '../../constants/FramerVariants';
import { DropdownMenu, NestedMenuItem, MenuItem } from '../ui/Dropdown';
import './TaskZone.css';

export default function TaskZone({ tasks, subjects, updateTask, setItemToDelete, setIsTaskModalOpen }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [completionFilter, setCompletionFilter] = useState('All');
    const [sortMethod, setSortMethod] = useState('Date');
    const [sortOrder, setSortOrder] = useState('asc');

    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1, 'None': 0, undefined: 0 };
    const priorityColors = { 'High': 'var(--tertiary)', 'Medium': 'var(--primary)', 'Low': 'var(--secondary)' };

    const getSubjectColor = (sid) => subjects.find(s => s.id === sid)?.color || 'var(--outline-variant)';
    const getSubjectTitle = (sid) => subjects.find(s => s.id === sid)?.title || 'General';

    const filteredTasks = tasks
        .filter(t => {
            const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;
            const matchSubject = subjectFilter === 'All' || t.subjectId === subjectFilter || (!t.subjectId && subjectFilter === 'None');
            const matchCompletion = completionFilter === 'All' || 
                                    (completionFilter === 'Completed' ? t.isCompleted : !t.isCompleted);
            return matchSearch && matchPriority && matchSubject && matchCompletion;
        })
        .sort((a, b) => {
            let result = 0;
            if (sortMethod === 'Date') {
                result = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            } else if (sortMethod === 'Priority') {
                result = priorityWeight[a.priority] - priorityWeight[b.priority];
            }
            return sortOrder === 'asc' ? result : -result;
        });

    return (
        <motion.section variants={itemVariants} className="card task-zone-container">
            <div className="task-zone-header">
                {/* Row 1: Title and Main Action */}
                <div className="task-zone-title-row">
                    <h2 className="text-title-lg flex-row gap-xs flex-shrink-0">
                        Pending Tasks
                    </h2>
                    <button className="btn btn-primary" onClick={() => setIsTaskModalOpen(true)}>
                        <Plus size={18} /> Add Task
                    </button>
                </div>
                
                {/* Row 2: Unified Control Bar */}
                <div className="task-zone-controls">
                    <div className="task-search-wrapper">
                        <Search size={18} className="task-search-icon" />
                        <input 
                            type="text" 
                            className="input-field task-search-input" 
                            placeholder="Search tasks..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <DropdownMenu label="Filter" icon={Filter}>
                        <NestedMenuItem label="By Subject" isActive={subjectFilter !== 'All'}>
                            <MenuItem label="All Subjects" onClick={() => setSubjectFilter('All')} isActive={subjectFilter === 'All'} />
                            {subjects.map(s => (
                                <MenuItem key={s.id} label={s.title} onClick={() => setSubjectFilter(s.id)} isActive={subjectFilter === s.id} />
                            ))}
                            <MenuItem label="No Subject" onClick={() => setSubjectFilter('None')} isActive={subjectFilter === 'None'} />
                        </NestedMenuItem>
                        
                        <NestedMenuItem label="By Priority" isActive={priorityFilter !== 'All'}>
                            <MenuItem label="All Priorities" onClick={() => setPriorityFilter('All')} isActive={priorityFilter === 'All'} />
                            <MenuItem label="High" onClick={() => setPriorityFilter('High')} isActive={priorityFilter === 'High'} />
                            <MenuItem label="Medium" onClick={() => setPriorityFilter('Medium')} isActive={priorityFilter === 'Medium'} />
                            <MenuItem label="Low" onClick={() => setPriorityFilter('Low')} isActive={priorityFilter === 'Low'} />
                        </NestedMenuItem>

                        <NestedMenuItem label="By Status" isActive={completionFilter !== 'All'}>
                            <MenuItem label="All" onClick={() => setCompletionFilter('All')} isActive={completionFilter === 'All'} />
                            <MenuItem label="Completed" onClick={() => setCompletionFilter('Completed')} isActive={completionFilter === 'Completed'} />
                            <MenuItem label="Pending" onClick={() => setCompletionFilter('Pending')} isActive={completionFilter === 'Pending'} />
                        </NestedMenuItem>
                    </DropdownMenu>

                    <div className="task-sort-controls">
                        <DropdownMenu label="Sort" icon={ListFilter}>
                            <MenuItem label="Date" onClick={() => setSortMethod('Date')} isActive={sortMethod === 'Date'} />
                            <MenuItem label="Priority" onClick={() => setSortMethod('Priority')} isActive={sortMethod === 'Priority'} />
                        </DropdownMenu>
                        <button 
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="task-sort-order-btn"
                            title={`Sort Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                        >
                            {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="custom-scrollbar task-list-viewport">
                <AnimatePresence>
                    {filteredTasks.map(task => (
                        <motion.div 
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="task-item-card ghost-boundary delete-container"
                        >
                           <div className="task-item-content" style={{ opacity: task.isCompleted ? 0.6 : 1 }}>
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateTask(task.id, { isCompleted: !task.isCompleted }); }}
                                className="task-check-button"
                                style={{ color: task.isCompleted ? 'var(--primary)' : 'var(--outline-variant)' }}
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                onMouseOut={(e) => e.currentTarget.style.color = task.isCompleted ? 'var(--primary)' : 'var(--outline-variant)'}
                              >
                                  {task.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                              </button>
                              
                              <div className="task-text-container" style={{ textDecoration: task.isCompleted ? 'line-through' : 'none' }}>
                                  <span className="text-title-md" style={{ fontSize: '1.125rem' }}>{task.title}</span>
                                  <div className="task-metadata-row">
                                      {task.subjectId && task.subjectId !== 'None' && (
                                        <span className="subject-tag" style={{ backgroundColor: getSubjectColor(task.subjectId), color: 'var(--on-surface)' }}>
                                            {getSubjectTitle(task.subjectId)}
                                        </span>
                                      )}
                                      
                                      {task.priority && task.priority !== 'None' && (
                                          <span className="priority-tag" style={{ color: priorityColors[task.priority] || 'inherit' }}>
                                             <AlertCircle size={15} /> {task.priority} Priority
                                          </span>
                                      )}
                                      
                                      {task.dueDate && (
                                          <span className="date-tag">
                                              <Clock size={15} /> {isToday(new Date(task.dueDate)) ? 'Due Today' : format(new Date(task.dueDate), 'MMM d')}
                                          </span>
                                      )}
                                  </div>
                              </div>
                           </div>

                           <div 
                             onClick={(e) => { e.stopPropagation(); setItemToDelete({ type: 'task', id: task.id }); }}
                             className="delete-pane task-delete-pane"
                           >
                               <X size={22} />
                           </div>
                        </motion.div>
                    ))}
                    {filteredTasks.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="task-empty-state">
                            No active tasks match your criteria. Enjoy the tranquility.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.section>
    );
}
