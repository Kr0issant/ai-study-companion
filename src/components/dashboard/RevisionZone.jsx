import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths } from 'date-fns';
import { itemVariants } from '../../constants/FramerVariants';

export default function RevisionZone({ tasks, setSelectedDate, setIsRevModalOpen }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = eachDayOfInterval({ 
        start: startOfMonth(currentMonth), 
        end: endOfMonth(currentMonth) 
    });

    const isSameDay = (date1, date2) => {
        return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd');
    };

    const todayTasks = tasks.filter(t => isSameDay(new Date(t.dueDate), new Date()) && !t.isCompleted);

    return (
        <motion.section variants={itemVariants} className="card layer-highest ghost-boundary" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', height: '650px' }}>
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
                {['S','M','T','W','T','F','S'].map((day, i) => <div key={i}>{day}</div>)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem', alignContent: 'start', flexShrink: 0 }}>
                {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
                
                {daysInMonth.map(day => {
                    const hasTasks = tasks.some(t => isSameDay(new Date(t.dueDate), day) && !t.isCompleted);
                    const today = isToday(day);
                    
                    return (
                        <motion.button
                            key={day.toISOString()}
                            whileHover={{ scale: 1.1, backgroundColor: 'var(--surface-container-high)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { setSelectedDate(day); setIsRevModalOpen(true); }}
                            style={{
                                aspectRatio: '1',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                backgroundColor: today ? 'var(--primary)' : 'var(--surface-container-lowest)',
                                color: today ? 'white' : 'var(--on-surface)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                position: 'relative',
                                cursor: 'pointer',
                                fontWeight: today ? 700 : 500,
                                fontSize: '1rem',
                                boxShadow: today ? 'var(--shadow-glass)' : 'var(--shadow-ambient)'
                            }}
                        >
                            {format(day, 'd')}
                            {hasTasks && !today && (
                                <div style={{ position: 'absolute', bottom: '15%', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--tertiary)' }} />
                            )}
                            {hasTasks && today && (
                                <div style={{ position: 'absolute', bottom: '15%', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'white' }} />
                            )}
                        </motion.button>
                    );
                })}
            </div>
            
            {todayTasks.length > 0 ? (
                <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minHeight: 0 }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '1px', flexShrink: 0 }}>
                        Due Today
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
                        {todayTasks.map(t => (
                            <div 
                               key={t.id} 
                               style={{ 
                                   padding: '1rem', 
                                   backgroundColor: 'var(--surface-container-low)', 
                                   borderRadius: 'var(--radius-md)', 
                                   fontSize: '0.875rem', 
                                   fontWeight: 500, 
                                   flexShrink: 0,
                                   whiteSpace: 'nowrap',
                                   overflow: 'hidden',
                                   textOverflow: 'ellipsis'
                               }} 
                               className="ghost-boundary text-primary"
                               title={t.title}
                            >
                                • {t.title}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ marginTop: '2.5rem', padding: '1.5rem', backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-md)', flexShrink: 0 }} className="ghost-boundary text-center">
                    <p className="text-body-md" style={{ color: 'var(--on-surface-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        No tasks due today.
                    </p>
                </div>
            )}
        </motion.section>
    );
}
