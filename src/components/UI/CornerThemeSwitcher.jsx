import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import './CornerThemeSwitcher.css';

const CornerThemeSwitcher = ({ theme, onChange }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getThemeOffset = () => {
    if (theme === 'light') return '0%';
    return '100%';
  };

  const toggleTheme = (e) => {
    e.stopPropagation();
    onChange(theme === 'light' ? 'dark' : 'light');
  };

  const DesktopIcon = theme === 'light' ? Sun : Moon;
  const MobileIcon = theme === 'light' ? Moon : Sun;

  if (isMobile) {
    return (
      <button 
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '0px',
          right: '5px',
          zIndex: 1000,
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-soft)',
          color: theme === 'light' ? 'var(--text-muted)' : '#FDB813',
          cursor: 'pointer',
          transition: 'background 0.3s, border 0.3s'
        }}
      >
        <MobileIcon size={20} />
      </button>
    );
  }

  return (
    <div className="offset-track-container">
      <svg className="offset-track-svg" viewBox="0 0 160 160">
        <path 
          className="offset-track-path"
          d="M 50 48 L 68 48 A 44 44 0 0 1 112 92 L 112 110" 
          fill="none"
          onClick={toggleTheme}
        />
      </svg>

      <div 
        className="offset-thumb"
        onClick={toggleTheme}
        style={{ offsetDistance: getThemeOffset() }}
      >
        <div className="offset-thumb-glow"></div>
        <DesktopIcon size={14} className="offset-thumb-icon" />
      </div>
    </div>
  );
};

export default CornerThemeSwitcher;
