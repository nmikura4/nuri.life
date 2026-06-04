import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './UI.css';

const CustomSelect = ({ options, value, onChange, placeholder = 'Select...', style = {}, innerStyle = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', ...style }}>
      <div 
        className="neu-input" 
        style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          cursor: 'pointer', userSelect: 'none',
          padding: '12px 16px',
          ...innerStyle 
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: 'var(--text-main)', fontSize: innerStyle.fontSize || '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0, marginLeft: '8px' }} />
      </div>
      
      {isOpen && (
        <div className="custom-select-dropdown">
          {options.map((opt) => (
            <div 
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className="custom-select-option"
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                color: opt.value === value ? 'var(--accent-blue)' : 'var(--text-main)',
                fontWeight: opt.value === value ? 700 : 500,
                fontSize: '13px',
                transition: 'background 0.2s ease',
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
