import React, { useState, useRef, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import './UI.css';

const CustomDatePicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const initialDate = value ? new Date(value + 'T12:00:00') : new Date();
  
  const [displayYear, setDisplayYear] = useState(initialDate.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const monthName = new Date(displayYear, displayMonth).toLocaleString('default', { month: 'long' });

  const goToPrevMonth = (e) => {
    e.preventDefault();
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(prev => prev - 1);
    } else {
      setDisplayMonth(prev => prev - 1);
    }
  };
  
  const goToNextMonth = (e) => {
    e.preventDefault();
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(prev => prev + 1);
    } else {
      setDisplayMonth(prev => prev + 1);
    }
  };

  const handleSelectDate = (d) => {
    const y = displayYear;
    const m = String(displayMonth + 1).padStart(2, '0');
    const day = String(d).padStart(2, '0');
    onChange(`${y}-${m}-${day}`);
    setIsOpen(false);
  };

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(displayYear, displayMonth, 1).getDay();
  const emptySlots = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const displayValue = value 
    ? new Date(value + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
    : 'Select a date...';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        className="neu-input" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <span>{displayValue}</span>
        <Calendar size={16} color="var(--text-muted)" />
      </div>

      {isOpen && (
        <GlassCard style={{ 
          position: 'absolute', 
          top: 'calc(100% + 8px)', 
          left: 0, 
          width: '280px', 
          padding: '20px', 
          zIndex: 100,
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button onClick={goToPrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
              <ChevronLeft size={18} />
            </button>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{monthName} {displayYear}</h3>
            <button onClick={goToNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
              <ChevronRight size={18} />
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} style={{color: 'var(--text-muted)'}}>{d}</div>)}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', fontSize: '13px' }}>
            {Array.from({ length: emptySlots }, (_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1;
              const yStr = String(displayYear);
              const mStr = String(displayMonth + 1).padStart(2, '0');
              const dStr = String(d).padStart(2, '0');
              const currentDateStr = `${yStr}-${mStr}-${dStr}`;
              const isSelected = value === currentDateStr;
              
              const today = new Date();
              const isToday = displayYear === today.getFullYear() && displayMonth === today.getMonth() && d === today.getDate();

              return (
                <div 
                  key={d} 
                  onClick={() => handleSelectDate(d)}
                  style={{
                    padding: '8px 0',
                    borderRadius: '8px',
                    background: isSelected ? 'var(--accent-blue)' : (isToday ? 'var(--card-bg)' : 'transparent'),
                    color: isSelected ? '#fff' : 'var(--text-main)',
                    boxShadow: isSelected ? 'var(--shadow-soft)' : (isToday ? 'var(--shadow-inner)' : 'none'),
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'var(--item-bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = isToday ? 'var(--card-bg)' : 'transparent';
                    }
                  }}
                >
                  <span style={{ color: isToday && !isSelected ? 'var(--accent-coral)' : 'inherit' }}>
                    {d}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default CustomDatePicker;
