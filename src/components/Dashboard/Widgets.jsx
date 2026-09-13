import { useState, useMemo, useRef, useEffect } from 'react';
import GlassCard from '../UI/GlassCard';
import CustomSelect from '../UI/CustomSelect';
import { X, ChevronLeft, ChevronRight, Edit2, Plus, Eye, Play, Pause, RotateCcw } from 'lucide-react';
import { isTaskOnDate } from '../../utils/recurrence';

export const ProgressWidget = ({ tasks = [], statuses = [] }) => {
  const [timeframe, setTimeframe] = useState('day');

  const filteredTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return tasks.filter(task => {
      if (!task.deadline) return false;
      
      if (timeframe === 'day') {
        return isTaskOnDate(task, todayStr);
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

        for (let cur = new Date(monday); cur <= sunday; cur.setDate(cur.getDate() + 1)) {
          const curStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
          if (isTaskOnDate(task, curStr)) return true;
        }
        return false;
      }

      if (timeframe === 'month') {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        for (let cur = new Date(firstDay); cur <= lastDay; cur.setDate(cur.getDate() + 1)) {
          const curStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
          if (isTaskOnDate(task, curStr)) return true;
        }
        return false;
      }

      return false;
    });
  }, [tasks, timeframe]);

  const totalTasks = filteredTasks.length;
  const doneStatus = statuses.length > 0 ? statuses[statuses.length - 1] : 'done';
  const doneTasks = filteredTasks.filter(t => t.status === doneStatus).length;
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });
  const widgetRef = useRef(null);

  const handleMouseMove = (e, text) => {
    if (!widgetRef.current) return;
    const rect = widgetRef.current.getBoundingClientRect();
    setTooltip({ visible: true, text, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const handleMouseLeave = () => setTooltip({ visible: false, text: '', x: 0, y: 0 });

  return (
    <GlassCard ref={widgetRef} className="responsive-card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Progress</h3>
        <div style={{ width: '90px' }}>
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
      
      <div style={{ position: 'relative', width: '120px', height: '120px' }}>
        <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
          <circle 
            cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="10" 
            style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))', cursor: 'pointer', pointerEvents: 'stroke' }} 
            onPointerMove={(e) => handleMouseMove(e, `Осталось: ${totalTasks - doneTasks}`)}
            onPointerLeave={handleMouseLeave}
          />
          <circle 
            cx="60" cy="60" r={radius} fill="none" stroke="var(--accent-coral)" strokeWidth="10" 
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" 
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out', cursor: 'pointer', pointerEvents: 'stroke' }}
            onPointerMove={(e) => handleMouseMove(e, `Сделано: ${doneTasks}`)}
            onPointerLeave={handleMouseLeave}
          />
        </svg>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', pointerEvents: 'none' }}>
          <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>{progress}%</span>
        </div>
      </div>
      
      <p style={{ marginTop: '14px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
        {totalTasks === 0 ? "No tasks for this period." : (doneTasks === totalTasks ? "All done! Great job!" : `${totalTasks - doneTasks} tasks remaining.`)}
      </p>

      {tooltip.visible && (
        <div style={{
          position: 'absolute',
          left: tooltip.x + 15,
          top: tooltip.y + 15,
          background: 'var(--card-bg)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          padding: '8px 12px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-card)',
          color: 'var(--text-main)',
          fontSize: '13px',
          fontWeight: 600,
          pointerEvents: 'none',
          zIndex: 10000,
          border: '1px solid var(--card-border)'
        }}>
          {tooltip.text}
        </div>
      )}
    </GlassCard>
  );
};

export const MiniCalendarWidget = ({ selectedDate, onSelectDate, tasks = [], statuses = [], onToggleCalendar }) => {
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

  const doneStatus = statuses.length > 0 ? statuses[statuses.length - 1] : 'done';
  const taskDates = new Set(
    tasks.filter(t => t.deadline && t.status !== doneStatus).map(t => t.deadline)
  );

  const handleDateClick = (dateObj) => {
    if (selectedDate && selectedDate.toDateString() === dateObj.toDateString()) {
      onSelectDate(null);
    } else {
      onSelectDate(dateObj);
    }
  };

  return (
    <GlassCard className="responsive-card" style={{ padding: '30px' }}>
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
          <button onClick={onToggleCalendar} className="neu-btn" style={{ height: '44px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
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
                const hasTask = tasks.some(t => t.status !== doneStatus && isTaskOnDate(t, dateStr));
                return hasTask ? (
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

export const WeeklyCalendarWidget = ({ tasks = [], statuses = [], onAddTask, selectedDate, onSelectDate, onToggleCalendar }) => {
  const [viewMode, setViewMode] = useState('weekly');
  const referenceDate = selectedDate || new Date();
  const currentMonthName = referenceDate.toLocaleString('en-US', { month: 'long' });
  const currentDateNum = referenceDate.getDate();

  const doneStatus = statuses.length > 0 ? statuses[statuses.length - 1] : 'done';
  const taskDates = new Set(
    tasks.filter(t => t.deadline && t.status !== doneStatus).map(t => t.deadline)
  );

  const [noteText, setNoteText] = useState('');

  const getDaysOfWeek = () => {
    const date = new Date(referenceDate);
    const startOfWindow = new Date(date);
    startOfWindow.setDate(date.getDate() - 3);
    
    // Parabolic wave offsets: center rises by -13px, adjacent by -9px and -4px
    const offsets = ['0px', '-4px', '-9px', '-13px', '-9px', '-4px', '0px'];

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWindow);
      d.setDate(d.getDate() + i);
      const isSelected = selectedDate ? d.toDateString() === selectedDate.toDateString() : d.toDateString() === new Date().toDateString();
      return {
        dateObj: d,
        day: d.toLocaleString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        active: isSelected,
        offset: offsets[i]
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
    newDate.setDate(1); // Fix month shift bug for 31st day
    newDate.setMonth(monthIndex);
    if (onSelectDate) onSelectDate(newDate);
    setViewMode('weekly'); // switch back to weekly to see the days of the selected month
  };
  return (
    <div className="responsive-card" style={{ 
      position: 'relative',
      borderRadius: '28px',
      padding: '18px 20px', 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%', 
      boxSizing: 'border-box', 
      gap: '14px',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
      background: 'var(--card-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Секция 1: Шапка (Top Bar) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex', 
            background: 'var(--item-bg)', 
            borderRadius: '20px', 
            padding: '4px',
            width: '160px',
            maxWidth: '100%',
            boxShadow: 'var(--shadow-inner)'
          }}>
            <button 
              onClick={() => setViewMode('weekly')}
              style={{ 
              flex: 1,
              background: viewMode === 'weekly' ? 'var(--card-bg)' : 'transparent', 
              border: 'none', 
              borderRadius: '16px', 
              padding: '6px 0', 
              fontSize: '12px', 
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
              borderRadius: '16px', 
              padding: '6px 0', 
              fontSize: '12px', 
              fontWeight: viewMode === 'monthly' ? 700 : 600, 
              color: viewMode === 'monthly' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: viewMode === 'monthly' ? 'var(--shadow-soft)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>Monthly</button>
          </div>
          <button onClick={onToggleCalendar} className="neu-btn" style={{ height: '34px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, borderRadius: '16px' }}>
            <Eye size={14} /> View
          </button>
        </div>

        {/* Секция 2: Заголовок даты (Header) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
          <h1 className="calendar-title" style={{ fontSize: 'clamp(22px, 2.2vw, 28px)', fontWeight: 800, color: 'var(--text-main)', margin: 0, lineHeight: 1, letterSpacing: '-0.5px' }}>
            {viewMode === 'weekly' ? currentMonthName : referenceDate.getFullYear()}
          </h1>
          <h1 className="calendar-title" style={{ fontSize: 'clamp(22px, 2.2vw, 28px)', fontWeight: 800, color: 'var(--accent-coral)', margin: 0, lineHeight: 1, flexShrink: 0 }}>
            {viewMode === 'weekly' ? currentDateNum : currentMonthName.substring(0,3)}
          </h1>
        </div>

        {/* Секция 3: Выбор дней/месяцев с дугой волны */}
        <div style={{ position: 'relative', minHeight: viewMode === 'weekly' ? '84px' : 'auto', display: 'flex', alignItems: 'center' }}>
          {viewMode === 'weekly' ? (
            <>
              {/* Dynamic curved wave SVG */}
              <svg viewBox="0 0 400 90" preserveAspectRatio="none" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}>
                <path d="M 0 52 Q 200 32 400 52 L 400 82 Q 200 62 0 82 Z" fill="var(--item-bg-hover)" />
              </svg>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                width: '100%',
                position: 'relative',
                zIndex: 1
              }}>
                {weekDays.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleDateClick(item.dateObj)} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '6px', 
                      transform: `translateY(${item.offset})`, 
                      cursor: 'pointer',
                      transition: 'transform 0.25s ease'
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 600, color: item.active ? 'var(--text-main)' : 'var(--text-muted)' }}>{item.day}</span>
                    <div style={{
                      position: 'relative',
                      width: item.active ? '34px' : '30px',
                      height: item.active ? '34px' : '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      fontSize: '13px',
                      fontWeight: 700,
                      background: item.active ? 'linear-gradient(135deg, var(--accent-coral), var(--accent-pink))' : 'transparent',
                      color: item.active ? '#fff' : 'var(--text-main)',
                      boxShadow: item.active ? '0 4px 12px rgba(239, 154, 138, 0.45)' : 'none',
                      marginTop: item.active ? '-2px' : '0',
                      transition: 'all 0.2s ease'
                    }}>
                      {item.date}
                      {(() => {
                        const y2 = item.dateObj.getFullYear();
                        const m2 = String(item.dateObj.getMonth() + 1).padStart(2, '0');
                        const d2 = String(item.dateObj.getDate()).padStart(2, '0');
                        const dateStr = `${y2}-${m2}-${d2}`;
                        const hasTask = tasks.some(t => t.status !== doneStatus && isTaskOnDate(t, dateStr));
                        return hasTask ? (
                          <div style={{ position: 'absolute', bottom: '2px', width: '4px', height: '4px', borderRadius: '50%', background: item.active ? '#fff' : 'var(--accent-coral)' }}></div>
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
              gap: '10px',
              width: '100%',
              background: 'var(--item-bg)',
              borderRadius: '20px',
              padding: '12px',
              boxShadow: 'var(--shadow-inner)'
            }}>
              {months.map((item, idx) => (
                <div key={idx} onClick={() => handleMonthClick(item.index)} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 0',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: item.active ? 'linear-gradient(135deg, var(--accent-coral), var(--accent-pink))' : 'transparent',
                  color: item.active ? '#fff' : 'var(--text-main)',
                  boxShadow: item.active ? '2px 2px 8px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.2s'
                }}>
                  {item.month}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Секция 4: Подвал (Footer) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <Edit2 size={13} />
            <input 
              type="text" 
              placeholder="Add a note..." 
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="neu-input"
              style={{ 
                border: 'none', 
                background: 'transparent', 
                outline: 'none', 
                boxShadow: 'none',
                padding: '4px 6px',
                color: 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 600,
                width: '110px'
              }} 
            />
          </div>
          <button className="pill-btn primary" onClick={onAddTask} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '6px 14px',
            fontSize: '12px'
          }}>
            <Plus size={14} /> New Task
          </button>
        </div>
      </div>
    </div>
  );
};

export const PomodoroWidget = () => {
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isRunning && timeLeft === 0) {
      if (mode === 'work') {
        setMode('break');
        setTimeLeft(5 * 60);
        if (Notification.permission === 'granted') {
          new Notification('nuri.life', { body: 'Work time is over! Take a 5 minute break.', icon: '/favicon.ico' });
        }
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
        setIsRunning(false);
        if (Notification.permission === 'granted') {
          new Notification('nuri.life', { body: 'Break is over! Ready to work?', icon: '/favicon.ico' });
        }
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const progress = mode === 'work' ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <GlassCard className="responsive-card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Focus Timer</h3>
        <span style={{ fontSize: '11px', fontWeight: 700, color: mode === 'work' ? 'var(--accent-coral)' : 'var(--accent-green)', background: mode === 'work' ? 'rgba(239, 154, 138, 0.2)' : 'rgba(164, 201, 229, 0.2)', padding: '3px 8px', borderRadius: '10px' }}>
          {mode === 'work' ? 'WORK' : 'BREAK'}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="120" height="120" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--card-border)" strokeWidth="8" />
            <circle cx="60" cy="60" r="54" fill="none" stroke={mode === 'work' ? 'var(--accent-coral)' : 'var(--accent-green)'} strokeWidth="8" strokeDasharray="339.3" strokeDashoffset={339.3 - (progress / 100) * 339.3} style={{ transition: 'stroke-dashoffset 1s linear' }} strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)', zIndex: 1 }}>{timeString}</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button onClick={toggleTimer} className="pill-btn primary" style={{ width: '42px', height: '42px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: mode === 'work' ? 'var(--accent-coral)' : 'var(--accent-green)' }}>
            {isRunning ? <Pause size={18} color="#fff" /> : <Play size={18} color="#fff" />}
          </button>
          <button onClick={resetTimer} className="neu-icon-btn" style={{ width: '42px', height: '42px', borderRadius: '50%' }}>
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    </GlassCard>
  );
};
