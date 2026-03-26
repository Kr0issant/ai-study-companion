import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Search, Filter, ListFilter, ArrowUp, ArrowDown, Trash2, AlertCircle, Clock } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { itemVariants } from '../../constants/FramerVariants';
import { DropdownMenu, NestedMenuItem, MenuItem } from '../ui/Dropdown';

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
        <motion.section variants={itemVariants} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '720px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderBottom: '1px solid var(--surface-variant)', paddingBottom: '1.5rem', flexShrink: 0 }}>
                {/* Row 1: Title and Main Action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 className="text-title-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        Pending Tasks
                    </h2>
                    <button className="btn btn-primary" onClick={() => setIsTaskModalOpen(true)} style={{ padding: '0.85rem 1.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        <Plus size={18} /> Add Task
                    </button>
                </div>
                
                {/* Row 2: Unified Control Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline-variant)' }} />
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Search tasks..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ padding: '0.75rem 1rem 0.75rem 2.5rem', width: '100%', fontSize: '0.875rem' }}
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <DropdownMenu label="Sort" icon={ListFilter}>
                            <MenuItem label="Date" onClick={() => setSortMethod('Date')} isActive={sortMethod === 'Date'} />
                            <MenuItem label="Priority" onClick={() => setSortMethod('Priority')} isActive={sortMethod === 'Priority'} />
                        </DropdownMenu>
                        <button 
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="input-field"
                            style={{ padding: '0.65rem', display: 'flex', alignItems: 'center', cursor: 'pointer', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-lowest)', color: 'var(--on-surface)' }}
                            title={`Sort Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                        >
                            {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem', paddingBottom: '1rem', maxWidth: '800px' }}>
                <AnimatePresence>
                    {filteredTasks.map(task => (
                        <motion.div 
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                            className="ghost-boundary delete-container"
                        >
                           <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', padding: '1.5rem', paddingRight: '4rem', width: '100%', transition: 'opacity 0.2s ease', opacity: task.isCompleted ? 0.6 : 1 }}>
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateTask(task.id, { isCompleted: !task.isCompleted }); }}
                                style={{ background: 'none', border: 'none', color: task.isCompleted ? 'var(--primary)' : 'var(--outline-variant)', marginTop: '0.2rem', cursor: 'pointer', transition: 'color 0.2s ease', zIndex: 5, flexShrink: 0 }}
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                onMouseOut={(e) => e.currentTarget.style.color = task.isCompleted ? 'var(--primary)' : 'var(--outline-variant)'}
                              >
                                  {task.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                              </button>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem', textDecoration: task.isCompleted ? 'line-through' : 'none' }}>
                                  <span className="text-title-md" style={{ fontSize: '1.125rem' }}>{task.title}</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', textDecoration: 'none' }}>
                                      {task.subjectId && task.subjectId !== 'None' && (
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', backgroundColor: getSubjectColor(task.subjectId), color: 'var(--on-surface)' }}>
                                            {getSubjectTitle(task.subjectId)}
                                        </span>
                                      )}
                                      
                                      {task.priority && task.priority !== 'None' && (
                                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: priorityColors[task.priority] || 'inherit' }}>
                                             <AlertCircle size={15} /> {task.priority} Priority
                                          </span>
                                      )}
                                      
                                      {task.dueDate && (
                                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--outline-variant)' }}>
                                              <Clock size={15} /> {isToday(new Date(task.dueDate)) ? 'Due Today' : format(new Date(task.dueDate), 'MMM d')}
                                          </span>
                                      )}
                                  </div>
                              </div>
                           </div>

                           <div 
                             onClick={(e) => { e.stopPropagation(); setItemToDelete({ type: 'task', id: task.id }); }}
                             className="delete-pane"
                             style={{ borderTopRightRadius: 'var(--radius-md)', borderBottomRightRadius: 'var(--radius-md)' }}
                           >
                               <Trash2 size={20} />
                           </div>
                        </motion.div>
                    ))}
                    {filteredTasks.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '4rem', textAlign: 'center', color: 'var(--outline-variant)' }}>
                            No active tasks match your criteria. Enjoy the tranquility.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.section>
    );
}
