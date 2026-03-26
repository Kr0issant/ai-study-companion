import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, startOfWeek } from 'date-fns';
import { itemVariants } from '../../constants/FramerVariants';
import './RevisionZone.css';

export default function RevisionZone({ tasks, selectedDate, setSelectedDate }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const startMonth = startOfMonth(currentMonth);
    const startDate = startOfWeek(startMonth, { weekStartsOn: 1 });

    const daysInGrid = Array.from({ length: 42 }).map((_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        return d;
    });

    const isSameDay = (date1, date2) => {
        return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd');
    };

    const selectedDayTasks = tasks.filter(t => isSameDay(new Date(t.dueDate), selectedDate) && !t.isCompleted);

    return (
        <motion.section variants={itemVariants} className="card layer-highest ghost-boundary revision-zone-container">
            <div className="revision-zone-header">
                <h2 className="text-title-md flex-row gap-sm" style={{ color: 'var(--primary)' }}>
                    <CalendarIcon size={20} /> Schedule
                </h2>
                <div className="flex-row gap-xs">
                    <button className="btn-ghost" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft size={16} />
                    </button>
                    <button className="btn-ghost" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="revision-month-title">
                {format(currentMonth, 'MMMM yyyy')}
            </div>

            <div className="calendar-weekday-header">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <div key={i}>{day}</div>)}
            </div>

            <div className="calendar-grid">
                {daysInGrid.map(day => {
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    const hasTasks = tasks.some(t => isSameDay(new Date(t.dueDate), day) && !t.isCompleted);
                    const today = isToday(day);

                    const isSelected = isSameDay(day, selectedDate);
                    
                    return (
                        <motion.button
                            key={day.toISOString()}
                            whileHover={{
                                backgroundColor: isSelected || today ? 'var(--primary)' : 'var(--surface-container-high)'
                            }}
                            transition={{ duration: 0.05, ease: 'linear' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { setSelectedDate(day); }}
                            className={`calendar-day-btn ${today ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${!isCurrentMonth ? 'is-neighbor' : ''}`}
                        >
                            {format(day, 'd')}
                            {hasTasks && (
                                <div 
                                    className="day-task-indicator"
                                    style={{ backgroundColor: today ? 'white' : 'var(--tertiary)' }} 
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {selectedDayTasks.length > 0 ? (
                <div className="revision-task-feed">
                    <div className="revision-feed-header">
                        <h3 className="premium-muted-label">
                            {isToday(selectedDate) ? "Today's Focus" : `Tasks for ${format(selectedDate, 'MMM d')}`}
                        </h3>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'var(--surface-container-highest)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'TASK' : 'TASKS'}
                        </span>
                    </div>
                    <div className="custom-scrollbar revision-feed-list">
                        {selectedDayTasks.map(t => (
                            <div key={t.id} className="ghost-boundary revision-task-item" title={t.title}>
                                <div className="revision-task-dot" />
                                <span className="text-ellipsis">{t.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="revision-empty-state text-center">
                    <p className="text-body-md" style={{ color: 'var(--on-surface-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
                        {isToday(selectedDate) ? "All clear for today." : `No tasks for ${format(selectedDate, 'MMMM d')}.`}
                    </p>
                </div>
            )}
        </motion.section>
    );
}
