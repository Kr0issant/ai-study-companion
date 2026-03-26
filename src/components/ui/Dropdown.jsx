import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

// Styles
import './Dropdown.css';

export function DropdownMenu({ label, icon: Icon, children }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div 
            className="dropdown-container"
            onMouseEnter={() => setIsOpen(true)} 
            onMouseLeave={() => setIsOpen(false)}
        >
            <div className={`dropdown-trigger ${isOpen ? 'is-open' : 'is-closed'}`}>
                {Icon && <Icon size={16} />} {label}
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="dropdown-menu-box"
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
            className="nested-dropdown-container"
            onMouseEnter={() => setIsSubOpen(true)}
            onMouseLeave={() => setIsSubOpen(false)}
        >
           <div 
               className={`nested-dropdown-trigger ${isActive ? 'dropdown-active-item' : (isSubOpen ? 'dropdown-hover-item' : 'dropdown-inactive-item')}`}
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
                        className="nested-dropdown-menu-box"
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
             className={`dropdown-item-btn ${isActive ? 'dropdown-active-item' : (isHovered ? 'dropdown-hover-item' : 'dropdown-inactive-item')}`}
         >
             <span className={isActive ? 'is-active-primary' : ''}>{label}</span>
             {isActive && <CheckCircle2 size={14} className="is-active-primary" />}
         </button>
    );
}
