import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmationModal({ isOpen, onConfirm, onClose, message = "Are you sure you want to delete this?" }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,31,42,0.4)', backdropFilter: 'blur(8px)' }} 
            onClick={onClose} 
          />
          
          {/* Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '400px', 
              backgroundColor: 'var(--surface-container-lowest)', 
              borderRadius: 'var(--radius-xl)', 
              padding: '2.5rem', 
              boxShadow: '0 24px 64px rgba(0,31,42,0.15)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem'
            }}
            className="ghost-boundary"
          >
            <h2 className="text-title-lg" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--on-surface)' }}>
              {message}
            </h2>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="btn btn-ghost" 
                style={{ flex: 1, padding: '0.75rem' }} 
                onClick={onClose}
              >
                No
              </button>
              <button 
                className="btn btn-primary" 
                style={{ 
                    flex: 1, 
                    padding: '0.75rem', 
                    background: 'linear-gradient(135deg, var(--tertiary) 0%, var(--tertiary-container) 100%)' 
                }} 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                Yes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
