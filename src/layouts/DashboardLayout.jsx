import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Clock, Bot, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudy } from '../context/StudyContext';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { activeSidebar, setActiveSidebar } = useStudy();

  const isDrawerOpen = activeSidebar === 'main';
  const closeDrawer = () => setActiveSidebar('none');

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/subjects', icon: BookOpen, label: 'Curriculum' },
    { to: '/focus', icon: Clock, label: 'Focus Space' },
    { to: '/ai-tools', icon: Bot, label: 'AI Study Assistant' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="app-wrapper">
      {/* Mobile Header (Hamburger) */}
      <header className="mobile-nav-header">
        <h2 className="text-title-md text-gradient">Cognitive Sanctuary</h2>
        <button 
          className="btn btn-ghost hamburger-btn"
          onClick={() => setActiveSidebar('main')}
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Drawer Overlay (Shared for both Main and AI sidebars) */}
      <div 
        className={`mobile-nav-overlay ${activeSidebar !== 'none' ? 'visible' : ''}`}
        onClick={closeDrawer}
      />

      {/* Mobile Navigation Drawer */}
      <aside className={`mobile-nav-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2 className="text-title-lg text-gradient">Sanctuary</h2>
          <button className="btn btn-ghost" onClick={closeDrawer}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="nav-link"
              onClick={closeDrawer}
            >
              {({ isActive }) => (
                <div className={`nav-item-wrapper ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}>
                  <item.icon size={20} />
                  <span className="nav-label">{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="sidebar-nav">
        <div className="sidebar-logo-container">
          <h2 className="text-title-lg text-gradient sidebar-logo-text">
            Cognitive<br/>Sanctuary
          </h2>
        </div>
        
        <nav className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="nav-link"
            >
              {({ isActive }) => (
                <div className={`nav-item-wrapper ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}>
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <motion.div 
                      layoutId="sidebarActiveIndicator"
                      className="nav-active-indicator"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="nav-label">{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main UI Area */}
      <main className="main-content">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
