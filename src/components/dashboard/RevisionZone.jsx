import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, startOfWeek } from 'date-fns';
import { itemVariants } from '../../constants/FramerVariants';

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
        <motion.section variants={itemVariants} className="card layer-highest ghost-boundary" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', height: '720px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexShrink: 0 }}>
                <h2 className="text-title-md" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
                    <CalendarIcon size={20} /> Schedule
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-ghost" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft size={16} />
                    </button>
                    <button className="btn-ghost" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '2rem', fontFamily: 'Manrope', letterSpacing: '1.5px', textTransform: 'uppercase', fontSize: '1.125rem', flexShrink: 0 }}>
                {format(currentMonth, 'MMMM yyyy')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', color: 'var(--outline-variant)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', flexShrink: 0 }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <div key={i}>{day}</div>)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.625rem', alignContent: 'start', flexShrink: 0 }}>
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
                            style={{
                                aspectRatio: '1',
                                borderRadius: 'var(--radius-sm)',
                                border: today ? 'none' : isSelected ? '2px solid var(--primary)' : '1px solid var(--surface-variant)',
                                backgroundColor: today ? 'var(--primary)' : isSelected ? 'var(--surface-container-high)' : 'var(--surface-container-lowest)',
                                color: (today) ? 'white' : !isCurrentMonth ? 'var(--outline-variant)' : 'var(--on-surface)',
                                opacity: !isCurrentMonth && !isSelected && !today ? 0.35 : 1,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                position: 'relative',
                                cursor: 'pointer',
                                fontWeight: (today || isSelected) ? 700 : 500,
                                fontSize: '1rem',
                                boxShadow: (today || isSelected) ? 'var(--shadow-glass)' : 'var(--shadow-ambient)',
                                transition: 'all 0.05s linear',
                                flex: 1,
                                zIndex: isSelected ? 2 : 1
                            }}
                        >
                            {format(day, 'd')}
                            {hasTasks && (
                                <div style={{ 
                                    position: 'absolute', bottom: '15%', width: '4px', height: '4px', borderRadius: '50%', 
                                    backgroundColor: today ? 'white' : 'var(--tertiary)' 
                                }} />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {selectedDayTasks.length > 0 ? (
                <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, minHeight: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {isToday(selectedDate) ? "Today's Focus" : `Tasks for ${format(selectedDate, 'MMM d')}`}
                        </h3>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'var(--surface-container-highest)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'TASK' : 'TASKS'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
                        {selectedDayTasks.map(t => (
                            <div 
                               key={t.id} 
                               style={{ 
                                   padding: '1rem 1.25rem', 
                                   backgroundColor: 'var(--surface-container-low)', 
                                   borderRadius: 'var(--radius-md)', 
                                   fontSize: '0.9rem', 
                                   fontWeight: 600, 
                                   boxShadow: 'var(--shadow-ambient)',
                                   display: 'flex',
                                   alignItems: 'center',
                                   gap: '0.75rem',
                                   color: 'var(--on-surface)',
                                   transition: 'all 0.1s ease'
                               }} 
                               className="ghost-boundary"
                               title={t.title}
                            >
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ marginTop: '2.5rem', padding: '2rem', backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--outline-variant)', opacity: 0.6 }} className="text-center">
                    <p className="text-body-md" style={{ color: 'var(--on-surface-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
                        {isToday(selectedDate) ? "All clear for today." : `No tasks for ${format(selectedDate, 'MMMM d')}.`}
                    </p>
                </div>
            )}
        </motion.section>
    );
}
