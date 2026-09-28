import React from 'react';
import { Sun, Moon } from 'lucide-react';
import './CornerThemeSwitcher.css';

const CornerThemeSwitcher = ({ theme, onChange }) => {
  const toggleTheme = (e) => {
    e.stopPropagation();
    onChange(theme === 'light' ? 'dark' : 'light');
  };

  const isLight = theme === 'light';

  return (
    <button 
      onClick={toggleTheme}
      className={`corner-theme-toggle ${isLight ? 'light' : 'dark'}`}
      title={isLight ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
      aria-label="Toggle theme"
    >
      <div className="theme-toggle-thumb">
        {isLight ? (
          <Sun size={14} className="theme-sun-icon" />
        ) : (
          <Moon size={14} className="theme-moon-icon" />
        )}
      </div>
    </button>
  );
};

export default CornerThemeSwitcher;
