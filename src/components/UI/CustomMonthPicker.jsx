import { useState, useRef, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Calendar } from 'lucide-react';
import './UI.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CustomMonthPicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // value is YYYY-MM
  const initialYear = value ? parseInt(value.split('-')[0], 10) : new Date().getFullYear();
  const [displayYear, setDisplayYear] = useState(initialYear);

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

  const handleSelectMonth = (monthIndex) => {
    const m = String(monthIndex + 1).padStart(2, '0');
    onChange(`${displayYear}-${m}`);
    setIsOpen(false);
  };

  const handleThisMonth = () => {
    const d = new Date();
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const displayValue = value 
    ? `${FULL_MONTHS[parseInt(value.split('-')[1], 10) - 1]} ${value.split('-')[0]}`
    : 'Select Month';

  const selectedYear = value ? parseInt(value.split('-')[0], 10) : null;
  const selectedMonth = value ? parseInt(value.split('-')[1], 10) - 1 : null;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '200px' }}>
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
          width: '240px', 
          padding: '15px', 
          zIndex: 100,
          background: 'var(--card-bg)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ background: 'var(--item-bg-hover)', padding: '8px 12px', borderRadius: '8px', marginBottom: '15px', fontWeight: 600, fontSize: '15px' }}>
            {displayYear}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '20px' }}>
            {MONTHS.map((m, i) => {
              const isSelected = selectedYear === displayYear && selectedMonth === i;
              return (
                <div 
                  key={m} 
                  onClick={() => handleSelectMonth(i)}
                  style={{
                    padding: '8px 0',
                    borderRadius: '4px',
                    background: isSelected ? 'var(--accent-blue)' : 'transparent',
                    color: isSelected ? '#fff' : 'var(--text-main)',
                    border: isSelected ? '2px solid #0056b3' : '2px solid transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isSelected ? 700 : 500
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--item-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {m}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={handleClear} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '14px' }}>Clear</button>
            <button onClick={handleThisMonth} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '14px' }}>This month</button>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default CustomMonthPicker;
