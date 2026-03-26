import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

export function DropdownMenu({ label, icon: Icon, children }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div 
            style={{ position: 'relative' }} 
            onMouseEnter={() => setIsOpen(true)} 
            onMouseLeave={() => setIsOpen(false)}
        >
            <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', fontSize: '0.875rem', backgroundColor: isOpen ? 'var(--surface-container-high)' : 'var(--surface-container-lowest)', cursor: 'default', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)' }}>
                {Icon && <Icon size={16} />} {label}
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        style={{ 
                            position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', 
                            backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-md)', 
                            padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
                            minWidth: '220px', zIndex: 60, boxShadow: 'var(--shadow-glass)', border: '1px solid var(--outline-variant)'
                        }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function NestedMenuItem({ label, isActive, children }) {
    const [isSubOpen, setIsSubOpen] = useState(false);
    return (
        <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setIsSubOpen(true)}
            onMouseLeave={() => setIsSubOpen(false)}
        >
           <div 
               style={{ 
                   width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                   padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)',
                   backgroundColor: isActive ? 'var(--primary-container)' : (isSubOpen ? 'var(--surface-container-high)' : 'transparent'),
                   color: isActive ? 'var(--on-primary-container)' : 'var(--on-surface)',
                   fontSize: '0.875rem', cursor: 'default'
               }}
           >
               {label} 
               <ChevronRight size={14} />
           </div>
            <AnimatePresence>
                {isSubOpen && (
                    <motion.div 
                        initial={{ opacity: 0, x: 5 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: 5 }}
                        transition={{ duration: 0.15 }}
                        style={{ 
                            position: 'absolute', top: 0, left: '100%', marginLeft: '0.5rem', 
                            backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-md)', 
                            padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
                            minWidth: '180px', zIndex: 70, boxShadow: 'var(--shadow-glass)', border: '1px solid var(--outline-variant)'
                        }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function MenuItem({ label, onClick, isActive }) {
    const [isHovered, setIsHovered] = useState(false);
    return (
         <button 
             onClick={onClick}
             onMouseEnter={() => setIsHovered(true)}
             onMouseLeave={() => setIsHovered(false)}
             style={{ 
                   width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                   padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)', border: 'none',
                   backgroundColor: isActive ? 'var(--primary-container)' : (isHovered ? 'var(--surface-container-high)' : 'transparent'),
                   color: isActive ? 'var(--primary)' : 'var(--on-surface)',
                   fontSize: '0.875rem', cursor: 'pointer', textAlign: 'left', fontWeight: isActive ? 600 : 400
             }}
         >
             {label}
             {isActive && <CheckCircle2 size={14} />}
         </button>
    );
}
