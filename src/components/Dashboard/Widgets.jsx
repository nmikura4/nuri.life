import React, { useState, useMemo } from 'react';
import GlassCard from '../UI/GlassCard';
import CustomSelect from '../UI/CustomSelect';
import Badge from '../UI/Badge';
import { X, ChevronLeft, ChevronRight, Settings, Edit2, Plus, Eye } from 'lucide-react';

export const ProgressWidget = ({ tasks = [], statuses = [] }) => {
  const [timeframe, setTimeframe] = useState('day');

  const filteredTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter(task => {
      if (!task.deadline) return false;
      
      const [y, m, d] = task.deadline.split('-');
      const taskDate = new Date(y, m - 1, d);
      taskDate.setHours(0, 0, 0, 0);

      if (timeframe === 'day') {
        return taskDate.getTime() === today.getTime();
      } 
      
      if (timeframe === 'week') {
        const weekRef = new Date(today.getTime());
        const day = weekRef.getDay();
        const diffToMonday = weekRef.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(weekRef);
        monday.setDate(diffToMonday);
        monday.setHours(0, 0, 0, 0);
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        return taskDate >= monday && taskDate <= sunday;
      }

      if (timeframe === 'month') {
        return taskDate.getMonth() === today.getMonth() && taskDate.getFullYear() === today.getFullYear();
      }

      return false;
    });
  }, [tasks, timeframe]);

  const totalTasks = filteredTasks.length;
  const doneStatus = statuses.length > 0 ? statuses[statuses.length - 1] : 'done';
  const doneTasks = filteredTasks.filter(t => t.status === doneStatus).length;
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <GlassCard style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Progress</h3>
        <div style={{ width: '100px' }}>
          <CustomSelect 
            value={timeframe} 
            onChange={setTimeframe}
            style={{
              padding: '0',
              boxShadow: 'none',
              background: 'transparent'
            }}
            options={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' }
            ]}
          />
        </div>
      </div>
      
      <div style={{ position: 'relative', width: '140px', height: '140px' }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r={radius} fill="transparent" stroke="rgba(255,255,255,0.5)" strokeWidth="16" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))' }} />
          <circle cx="70" cy="70" r={radius} fill="transparent" stroke="var(--accent-coral)" strokeWidth="16" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} />
        </svg>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>{progress}%</span>
        </div>
      </div>
      
      <p style={{ marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
        {totalTasks === 0 ? "No tasks for this period." : (doneTasks === totalTasks ? "All done! Great job!" : `${totalTasks - doneTasks} tasks remaining.`)}
      </p>
    </GlassCard>
  );
};

export const MiniCalendarWidget = ({ selectedDate, onSelectDate, tasks = [], onToggleCalendar }) => {
  const today = new Date();
  const [displayYear, setDisplayYear] = useState(today.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(today.getMonth());
  
  const monthName = new Date(displayYear, displayMonth).toLocaleString('default', { month: 'long' });
  
  const goToPrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(prev => prev - 1);
    } else {
      setDisplayMonth(prev => prev - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(prev => prev + 1);
    } else {
      setDisplayMonth(prev => prev + 1);
    }
  };

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
    return new Date(displayYear, displayMonth, i + 1, 12, 0, 0); 
  });

  const firstDayOfWeek = new Date(displayYear, displayMonth, 1).getDay();
  const emptySlots = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const taskDates = new Set(
    tasks.filter(t => t.deadline).map(t => t.deadline)
  );

  const handleDateClick = (dateObj) => {
    if (selectedDate && selectedDate.toDateString() === dateObj.toDateString()) {
      onSelectDate(null);
    } else {
      onSelectDate(dateObj);
    }
  };

  return (
    <GlassCard style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={goToPrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', padding: '4px' }} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <h3 style={{ fontSize: '16px', fontWeight: 600, minWidth: '120px', textAlign: 'center' }}>{monthName} {displayYear}</h3>
          <button onClick={goToNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', padding: '4px' }} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedDate && (
            <button onClick={() => onSelectDate(null)} style={{ display: 'flex', alignItems: 'center', background: 'var(--accent-coral)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
              <X size={12} style={{ marginRight: '4px' }} /> Clear Filter
            </button>
          )}
          <button onClick={onToggleCalendar} className="neu-btn" style={{ height: '32px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
            <Eye size={14} /> View
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} style={{color: 'var(--text-muted)'}}>{d}</div>)}
        {Array.from({ length: emptySlots }, (_, i) => <div key={`empty-${i}`} />)}
        {daysArray.map((dateObj, i) => {
          const isSelected = selectedDate && selectedDate.toDateString() === dateObj.toDateString();
          const isToday = today.toDateString() === dateObj.toDateString();
          
          return (
            <div key={i} onClick={() => handleDateClick(dateObj)} style={{
              padding: '6px 0 2px',
              borderRadius: '50%',
              background: isSelected ? 'var(--accent-blue)' : (isToday ? 'var(--card-bg)' : 'transparent'),
              color: isSelected ? '#fff' : 'var(--text-main)',
              boxShadow: isSelected ? 'var(--shadow-soft)' : (isToday ? 'var(--shadow-inner)' : 'none'),
              cursor: 'pointer',
              border: isToday && !isSelected ? '1px solid var(--accent-blue)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: '36px'
            }}>
              <span style={{ color: isToday && !isSelected ? 'var(--accent-coral)' : 'inherit' }}>
                {dateObj.getDate()}
              </span>
              {(() => {
                const y2 = dateObj.getFullYear();
                const m2 = String(dateObj.getMonth() + 1).padStart(2, '0');
                const d2 = String(dateObj.getDate()).padStart(2, '0');
                const dateStr = `${y2}-${m2}-${d2}`;
                return taskDates.has(dateStr) ? (
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: isSelected ? '#fff' : 'var(--accent-coral)', marginTop: '2px' }}></div>
                ) : null;
              })()}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

export const WeeklyCalendarWidget = ({ tasks = [], onAddTask, selectedDate, onSelectDate, onToggleCalendar }) => {
  const [viewMode, setViewMode] = useState('weekly');
  const referenceDate = selectedDate || new Date();
  const currentMonthName = referenceDate.toLocaleString('en-US', { month: 'long' });
  const currentDateNum = referenceDate.getDate();

  const taskDates = new Set(
    tasks.filter(t => t.deadline).map(t => t.deadline)
  );

  const getDaysOfWeek = () => {
    const date = new Date(referenceDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(date.setDate(diff));
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const isSelected = selectedDate ? d.toDateString() === selectedDate.toDateString() : d.toDateString() === new Date().toDateString();
      return {
        dateObj: d,
        day: d.toLocaleString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        active: isSelected,
        offset: i === 3 ? '-2px' : (i === 2 || i === 4 ? '0px' : (i === 1 || i === 5 ? '5px' : '15px'))
      };
    });
  };

  const weekDays = getDaysOfWeek();

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(referenceDate.getFullYear(), i, 1);
    return {
      index: i,
      month: d.toLocaleString('en-US', { month: 'short' }),
      active: referenceDate.getMonth() === i
    };
  });

  const handleDateClick = (d) => {
    if (onSelectDate) {
      if (selectedDate && selectedDate.toDateString() === d.toDateString()) {
        onSelectDate(null);
      } else {
        onSelectDate(d);
      }
    }
  };

  const handleMonthClick = (monthIndex) => {
    const newDate = new Date(referenceDate);
    newDate.setMonth(monthIndex);
    if (onSelectDate) onSelectDate(newDate);
    setViewMode('weekly'); // switch back to weekly to see the days of the selected month
  };
  return (
    <div style={{ 
      position: 'relative',
      borderRadius: '32px',
      padding: '30px', 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%', 
      boxSizing: 'border-box', 
      gap: '24px',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
      background: 'var(--card-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Секция 1: Шапка (Top Bar) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex', 
            background: 'var(--item-bg)', 
            borderRadius: '24px', 
            padding: '4px',
            width: '200px',
            boxShadow: 'var(--shadow-inner)'
          }}>
            <button 
              onClick={() => setViewMode('weekly')}
              style={{ 
              flex: 1,
              background: viewMode === 'weekly' ? 'var(--card-bg)' : 'transparent', 
              border: 'none', 
              borderRadius: '20px', 
              padding: '8px 0', 
              fontSize: '13px', 
              fontWeight: viewMode === 'weekly' ? 700 : 600, 
              color: viewMode === 'weekly' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: viewMode === 'weekly' ? 'var(--shadow-soft)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>Weekly</button>
            <button 
              onClick={() => setViewMode('monthly')}
              style={{ 
              flex: 1,
              background: viewMode === 'monthly' ? 'var(--card-bg)' : 'transparent', 
              border: 'none', 
              borderRadius: '20px', 
              padding: '8px 0', 
              fontSize: '13px', 
              fontWeight: viewMode === 'monthly' ? 700 : 600, 
              color: viewMode === 'monthly' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: viewMode === 'monthly' ? 'var(--shadow-soft)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>Monthly</button>
          </div>
          <button onClick={onToggleCalendar} className="neu-btn" style={{ height: '32px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
            <Eye size={14} /> View
          </button>
        </div>

        {/* Секция 2: Заголовок даты (Header) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-1px' }}>
            {viewMode === 'weekly' ? currentMonthName : referenceDate.getFullYear()}
          </h1>
          <h1 style={{ fontSize: '48px', fontWeight: 800, color: 'var(--accent-coral)', margin: 0 }}>
            {viewMode === 'weekly' ? currentDateNum : currentMonthName.substring(0,3)}
          </h1>
        </div>

        {/* Секция 3: Выбор дней/месяцев */}
        <div style={{ position: 'relative', height: viewMode === 'weekly' ? '90px' : 'auto', display: 'flex', alignItems: 'center' }}>
          {viewMode === 'weekly' ? (
            <>
              {/* Curved band SVG aligned behind dates */}
              <svg viewBox="0 0 400 100" preserveAspectRatio="none" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: 0 }}>
                <path d="M 0 44 Q 200 26 400 44 L 400 92 Q 200 74 0 92 Z" fill="var(--item-bg-hover)" />
              </svg>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                width: '100%',
                position: 'relative',
                zIndex: 1
              }}>
                {weekDays.map((item, idx) => (
                  <div key={idx} onClick={() => handleDateClick(item.dateObj)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transform: `translateY(${item.offset})`, cursor: 'pointer' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: item.active ? 'var(--text-main)' : 'var(--text-muted)' }}>{item.day}</span>
                    <div style={{
                      position: 'relative',
                      width: item.active ? '36px' : '32px',
                      height: item.active ? '36px' : '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      fontSize: '15px',
                      fontWeight: 700,
                      background: item.active ? 'linear-gradient(135deg, var(--accent-coral), var(--accent-pink))' : 'transparent',
                      color: item.active ? '#fff' : 'var(--text-main)',
                      boxShadow: item.active ? 'var(--shadow-soft)' : 'none',
                      marginTop: item.active ? '-2px' : '0'
                    }}>
                      {item.date}
                      {(() => {
                        const y2 = item.dateObj.getFullYear();
                        const m2 = String(item.dateObj.getMonth() + 1).padStart(2, '0');
                        const d2 = String(item.dateObj.getDate()).padStart(2, '0');
                        const dateStr = `${y2}-${m2}-${d2}`;
                        return taskDates.has(dateStr) ? (
                          <div style={{ position: 'absolute', bottom: '3px', width: '4px', height: '4px', borderRadius: '50%', background: item.active ? '#fff' : 'var(--accent-coral)' }}></div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '12px',
              width: '100%',
              background: 'var(--item-bg)',
              borderRadius: '24px',
              padding: '16px',
              boxShadow: 'var(--shadow-inner)'
            }}>
              {months.map((item, idx) => (
                <div key={idx} onClick={() => handleMonthClick(item.index)} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 0',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: item.active ? 'linear-gradient(135deg, var(--accent-coral), var(--accent-pink))' : 'transparent',
                  color: item.active ? '#fff' : 'var(--text-main)',
                  boxShadow: item.active ? 'var(--shadow-soft)' : 'none',
                  transition: 'all 0.2s'
                }}>
                  {item.month}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Секция 4: Подвал (Footer) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Edit2 size={14} />
            <input 
              type="text" 
              placeholder="Add a note..." 
              className="neu-input"
              style={{ 
                border: 'none', 
                background: 'transparent', 
                outline: 'none', 
                boxShadow: 'none',
                padding: '4px',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 600,
                width: '120px'
              }} 
            />
          </div>
          <button className="pill-btn primary" onClick={onAddTask} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '8px 16px',
            fontSize: '13px'
          }}>
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>
    </div>
  );
};
