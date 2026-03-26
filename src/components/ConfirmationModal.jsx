import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmationModal({ isOpen, onConfirm, onClose, message = "Are you sure you want to delete this?" }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="modal-backdrop"
            onClick={onClose} 
          />
          
          {/* Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="modal-content-card ghost-boundary"
            style={{ maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}
          >
            <h2 className="text-title-lg" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--on-surface)' }}>
              {message}
            </h2>

            <div className="modal-footer" style={{ justifyContent: 'center', marginTop: '1rem' }}>
              <button 
                className="btn btn-ghost" 
                style={{ flex: 1 }} 
                onClick={onClose}
              >
                No
              </button>
              <button 
                className="btn btn-primary" 
                style={{ 
                    flex: 1, 
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
