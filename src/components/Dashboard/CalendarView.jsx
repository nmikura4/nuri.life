import React, { useState, useMemo } from 'react';
import GlassCard from '../UI/GlassCard';
import Badge from '../UI/Badge';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import DayHourlyView from './DayHourlyView';
import { isTaskOnDate } from '../../utils/recurrence';

const WEEKDAYS = [
  { full: 'Mon', short: 'M' },
  { full: 'Tue', short: 'T' },
  { full: 'Wed', short: 'W' },
  { full: 'Thu', short: 'T' },
  { full: 'Fri', short: 'F' },
  { full: 'Sat', short: 'S' },
  { full: 'Sun', short: 'S' }
];

const CalendarView = ({ tasks = [], statuses = [], onEditTask, onAddTask, startHour = 0, endHour = 23 }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'day'
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty slots for days before the first day of the month
    let startDayOfWeek = firstDay.getDay(); // 0 is Sunday
    if (startDayOfWeek === 0) startDayOfWeek = 7; // Convert to 1-7 (Mon-Sun)
    
    for (let i = 1; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const prev = new Date(selectedDate);
      prev.setDate(prev.getDate() - 1);
      setSelectedDate(prev);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const next = new Date(selectedDate);
      next.setDate(next.getDate() + 1);
      setSelectedDate(next);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleSelectDay = (day) => {
    setSelectedDate(day);
    setViewMode('day');
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const doneStatus = statuses.length > 0 ? statuses[statuses.length - 1] : 'done';

  const formatHeaderTitle = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
    }
    return selectedDate.toLocaleString('ru-RU', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="calendar-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, minHeight: 'calc(100vh - 100px)' }}>
      {/* Calendar Header */}
      <GlassCard className="calendar-header-card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h2 className="calendar-title" style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--text-main)', textTransform: 'capitalize' }}>
            {formatHeaderTitle()}
          </h2>

          {/* View Mode Toggle */}
          <div style={{ 
            display: 'flex', 
            background: 'var(--item-bg)', 
            padding: '4px', 
            borderRadius: '24px', 
            boxShadow: 'var(--shadow-inner)',
            gap: '4px'
          }}>
            <button 
              onClick={() => setViewMode('month')} 
              className={viewMode === 'month' ? 'pill-btn primary' : 'pill-btn'}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: viewMode === 'month' ? 'var(--accent-blue)' : 'transparent',
                color: viewMode === 'month' ? '#fff' : 'var(--text-muted)'
              }}
            >
              <CalendarIcon size={14} />
              <span>Месяц</span>
            </button>
            <button 
              onClick={() => {
                setViewMode('day');
                if (!selectedDate) setSelectedDate(new Date());
              }} 
              className={viewMode === 'day' ? 'pill-btn primary' : 'pill-btn'}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: viewMode === 'day' ? 'var(--accent-blue)' : 'transparent',
                color: viewMode === 'day' ? '#fff' : 'var(--text-muted)'
              }}
            >
              <Clock size={14} />
              <span>День</span>
            </button>
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={handlePrev} className="neu-icon-btn" style={{ width: '38px', height: '38px', borderRadius: '50%' }} aria-label="Previous">
            <ChevronLeft size={18} />
          </button>
          <button onClick={handleToday} className="pill-btn secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Сегодня
          </button>
          <button onClick={handleNext} className="neu-icon-btn" style={{ width: '38px', height: '38px', borderRadius: '50%' }} aria-label="Next">
            <ChevronRight size={18} />
          </button>
        </div>
      </GlassCard>

      {/* Main Content: Month Grid or Day Hourly View */}
      {viewMode === 'day' ? (
        <DayHourlyView 
          date={selectedDate}
          tasks={tasks}
          statuses={statuses}
          onEditTask={onEditTask}
          onAddTask={onAddTask}
          startHour={startHour}
          endHour={endHour}
        />
      ) : (
        <GlassCard className="calendar-grid-card" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="calendar-weekdays" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '10px', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
            {WEEKDAYS.map((d, i) => (
              <div key={i}>
                <span className="weekday-full">{d.full}</span>
                <span className="weekday-short">{d.short}</span>
              </div>
            ))}
          </div>
          
          <div className="calendar-month-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', flex: 1, gridAutoRows: 'minmax(110px, 1fr)' }}>
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="calendar-cell-empty" style={{ background: 'var(--item-bg)', opacity: 0.3, borderRadius: '12px' }}></div>;
              
              const isToday = day.getTime() === today.getTime();
              const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
              const dayTasks = tasks.filter(t => isTaskOnDate(t, dateStr));

              return (
                <div 
                  key={dateStr} 
                  className="calendar-day-cell" 
                  onClick={() => handleSelectDay(day)}
                  style={{ 
                    background: isToday ? 'rgba(164, 201, 229, 0.15)' : 'var(--item-bg)', 
                    border: isToday ? '2px solid var(--accent-blue)' : '2px solid transparent',
                    borderRadius: '12px', 
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    minWidth: 0,
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span 
                      className="calendar-day-number" 
                      style={{ 
                        fontSize: '14px', 
                        fontWeight: isToday ? 700 : 600, 
                        color: isToday ? 'var(--accent-blue)' : 'var(--text-main)', 
                        width: '24px', 
                        height: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        borderRadius: '50%', 
                        background: isToday ? 'var(--solid-card-bg)' : 'transparent', 
                        boxShadow: isToday ? 'var(--shadow-soft)' : 'none' 
                      }}
                    >
                      {day.getDate()}
                    </span>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddTask(dateStr);
                      }} 
                      className="calendar-add-task-btn" 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', opacity: 0.6 }} 
                      title="Add task"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <div className="calendar-tasks-list custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', flex: 1, minWidth: 0 }}>
                    {dayTasks.map(task => (
                      <div 
                        key={task.id} 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task);
                        }}
                        className="calendar-task-item"
                        title={task.startTime && task.deadlineTime ? `${task.startTime} - ${task.deadlineTime}: ${task.title}` : (task.startTime || task.deadlineTime ? `${task.startTime || task.deadlineTime}: ${task.title}` : task.title)}
                        style={{ 
                          fontSize: '11px', 
                          padding: '3px 6px', 
                          background: 'var(--solid-card-bg)', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          boxShadow: 'var(--shadow-inner)',
                          textDecoration: task.status === doneStatus ? 'line-through' : 'none',
                          opacity: task.status === doneStatus ? 0.6 : 1,
                          borderLeft: `3px solid ${task.priority === 'high' ? 'var(--accent-coral)' : task.priority === 'medium' ? 'var(--accent-peach)' : 'var(--accent-blue)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {task.startTime && task.deadlineTime ? (
                          <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: 700, flexShrink: 0 }}>{task.startTime}-{task.deadlineTime}</span>
                        ) : (task.startTime || task.deadlineTime) ? (
                          <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: 700, flexShrink: 0 }}>{task.startTime || task.deadlineTime}</span>
                        ) : null}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default CalendarView;
