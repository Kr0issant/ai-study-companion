import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Clock, Bot, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardLayout() {
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/subjects', icon: BookOpen, label: 'Curriculum' },
    { to: '/focus', icon: Clock, label: 'Focus Space' },
    { to: '/ai-tools', icon: Bot, label: 'AI Study Assistant' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="app-wrapper">
      {/* Sidebar - Tonal layering instead of strict borders */}
      <aside 
        style={{ 
          width: '280px', 
          backgroundColor: 'var(--surface-container-low)',
          /* Soft inner glow on the right edge to give an illusion of depth connecting to the main surface */
          boxShadow: 'inset -20px 0 20px -20px rgba(41, 98, 131, 0.05)',
          padding: '2.5rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10
        }}
      >
        <div style={{ padding: '0 1rem', marginBottom: '3rem' }}>
          <h2 className="text-title-lg text-gradient" style={{ letterSpacing: '0.5px' }}>
            Cognitive<br/>Sanctuary
          </h2>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={{ textDecoration: 'none' }}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {({ isActive }) => (
                <motion.div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'var(--primary)' : 'var(--on-surface-muted)',
                    backgroundColor: isActive ? 'var(--surface-container-highest)' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  whileHover={{ 
                    backgroundColor: isActive ? 'var(--surface-container-highest)' : 'var(--surface-hover)',
                    x: isActive ? 0 : 4 
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '10%',
                        bottom: '10%',
                        width: '4px',
                        background: 'linear-gradient(180deg, var(--primary) 0%, var(--primary-container) 100%)',
                        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
                      }}
                    />
                  )}
                  
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main UI Area */}
      <main 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '4rem 5rem',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
