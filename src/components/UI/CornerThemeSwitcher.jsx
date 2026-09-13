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
      className="corner-theme-toggle"
      title={isLight ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
      aria-label="Toggle theme"
    >
      {isLight ? (
        <Sun size={20} className="theme-sun-icon" />
      ) : (
        <Moon size={20} className="theme-moon-icon" />
      )}
    </button>
  );
};

export default CornerThemeSwitcher;
