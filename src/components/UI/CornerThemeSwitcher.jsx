import React from 'react';
import { Sun, Moon } from 'lucide-react';
import './CornerThemeSwitcher.css';

const CornerThemeSwitcher = ({ theme, onChange }) => {
  const getThemeOffset = () => {
    if (theme === 'light') return '0%';
    return '100%';
  };

  const toggleTheme = (e) => {
    e.stopPropagation();
    onChange(theme === 'light' ? 'dark' : 'light');
  };

  const Icon = theme === 'light' ? Sun : Moon;

  return (
    <div className="offset-track-container">
      <svg className="offset-track-svg" viewBox="0 0 160 160">
        <path 
          className="offset-track-path"
          d="M 10 68 L 48 68 A 44 44 0 0 1 92 112 L 92 140" 
          onClick={toggleTheme}
        />
      </svg>

      <div 
        className="offset-thumb"
        onClick={toggleTheme}
        style={{ offsetDistance: getThemeOffset() }}
      >
        <div className="offset-thumb-glow"></div>
        <Icon size={14} className="offset-thumb-icon" />
      </div>
    </div>
  );
};

export default CornerThemeSwitcher;
