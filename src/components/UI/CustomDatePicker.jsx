import { useState, useRef, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import './UI.css';

const CustomDatePicker = ({ 
  value, 
  onChange, 
  enableTime = false, 
  startTimeValue = '', 
  onStartTimeChange = null,
  timeValue = '', 
  onTimeChange = null, 
  alignRight = false 
}) => {
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
    if (!enableTime) setIsOpen(false);
  };

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(displayYear, displayMonth, 1).getDay();
  const emptySlots = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const formatTimeRangeText = () => {
    if (!enableTime) return '';
    if (timeValue) return `, ${timeValue}`;
    if (startTimeValue) return `, ${startTimeValue}`;
    return '';
  };

  const displayValue = value 
    ? new Date(value + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + formatTimeRangeText()
    : 'Select a date...';

  const handleTimeBlur = (rawVal, callback) => {
    if (!rawVal || !callback) return;
    let h = 0, m = 0;
    if (!rawVal.includes(':') && rawVal.length > 2) {
      h = parseInt(rawVal.substring(0, 2), 10);
      m = parseInt(rawVal.substring(2, 4), 10);
    } else {
      let parts = rawVal.split(':');
      h = parseInt(parts[0] || '0', 10);
      m = parseInt(parts[1] || '0', 10);
    }
    if (isNaN(h)) h = 0;
    if (isNaN(m)) m = 0;
    if (h > 23) h = 23;
    if (m > 59) m = 59;
    const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    callback(formatted);
  };

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
          boxSizing: 'border-box',
          gap: '8px'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayValue}</span>
        <Calendar size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
      </div>

      {isOpen && (
        <GlassCard style={{ 
          position: 'absolute', 
          top: 'calc(100% + 8px)', 
          ...(alignRight ? { right: 0 } : { left: 0 }),
          width: '300px', 
          padding: '18px', 
          zIndex: 100,
          boxShadow: 'var(--shadow-card)',
          background: 'var(--solid-card-bg)',
          borderRadius: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <button onClick={goToPrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
              <ChevronLeft size={18} />
            </button>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{monthName} {displayYear}</h3>
            <button onClick={goToNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
              <ChevronRight size={18} />
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d, i) => <div key={i} style={{color: 'var(--text-muted)'}}>{d}</div>)}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '13px' }}>
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
                    padding: '6px 0',
                    borderRadius: '8px',
                    background: isSelected ? 'var(--accent-blue)' : (isToday ? 'var(--card-bg)' : 'transparent'),
                    color: isSelected ? '#fff' : 'var(--text-main)',
                    boxShadow: isSelected ? 'var(--shadow-soft)' : (isToday ? 'var(--shadow-inner)' : 'none'),
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    fontWeight: isSelected || isToday ? 700 : 500
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

          {enableTime && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Start Time */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <Clock size={12} style={{ color: 'var(--accent-blue)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Начало</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="16:00"
                    value={startTimeValue || ''} 
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^\d:]/g, '');
                      if (val.length === 2 && !val.includes(':') && (startTimeValue || '').length < 2) {
                        val += ':';
                      }
                      if (onStartTimeChange) onStartTimeChange(val);
                    }}
                    onBlur={(e) => handleTimeBlur(e.target.value, onStartTimeChange)}
                    className="neu-input"
                    style={{ width: '100%', padding: '6px 8px', fontSize: '13px', textAlign: 'center', boxSizing: 'border-box' }}
                    maxLength="5"
                  />
                </div>

                {/* End Time / Deadline */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <Clock size={12} style={{ color: 'var(--accent-coral)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Дедлайн</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="18:00"
                    value={timeValue || ''} 
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^\d:]/g, '');
                      if (val.length === 2 && !val.includes(':') && (timeValue || '').length < 2) {
                        val += ':';
                      }
                      if (onTimeChange) onTimeChange(val);
                    }}
                    onBlur={(e) => handleTimeBlur(e.target.value, onTimeChange)}
                    className="neu-input"
                    style={{ width: '100%', padding: '6px 8px', fontSize: '13px', textAlign: 'center', boxSizing: 'border-box' }}
                    maxLength="5"
                  />
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
};

export default CustomDatePicker;
