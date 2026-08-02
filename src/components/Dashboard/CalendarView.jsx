import React, { useState, useMemo } from 'react';
import GlassCard from '../UI/GlassCard';
import Badge from '../UI/Badge';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const CalendarView = ({ tasks = [], statuses = [], onEditTask, onAddTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const doneStatus = statuses.length > 0 ? statuses[statuses.length - 1] : 'done';

  return (
    <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, minHeight: 'calc(100vh - 100px)' }}>
      <GlassCard style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={prevMonth} className="neu-icon-btn" style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="pill-btn secondary">
            Today
          </button>
          <button onClick={nextMonth} className="neu-icon-btn" style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </GlassCard>

      <GlassCard style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '10px', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
          <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', flex: 1, gridAutoRows: 'minmax(120px, 1fr)' }}>
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} style={{ background: 'var(--item-bg)', opacity: 0.3, borderRadius: '12px' }}></div>;
            
            const isToday = day.getTime() === today.getTime();
            const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
            const dayTasks = tasks.filter(t => t.deadline === dateStr);

            return (
              <div key={dateStr} style={{ 
                background: isToday ? 'rgba(164, 201, 229, 0.15)' : 'var(--item-bg)', 
                border: isToday ? '2px solid var(--accent-blue)' : '2px solid transparent',
                borderRadius: '12px', 
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                position: 'relative',
                transition: 'all 0.2s ease',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '16px', fontWeight: isToday ? 700 : 600, color: isToday ? 'var(--accent-blue)' : 'var(--text-main)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: isToday ? 'var(--solid-card-bg)' : 'transparent', boxShadow: isToday ? 'var(--shadow-soft)' : 'none' }}>
                    {day.getDate()}
                  </span>
                  
                  <button onClick={() => onAddTask(dateStr)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', opacity: 0.6 }} title="Add task">
                    <Plus size={14} />
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1, paddingRight: '4px' }} className="custom-scroll">
                  {dayTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => onEditTask(task)}
                      style={{ 
                        fontSize: '11px', 
                        padding: '4px 8px', 
                        background: 'var(--solid-card-bg)', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        boxShadow: 'var(--shadow-inner)',
                        textDecoration: task.status === doneStatus ? 'line-through' : 'none',
                        opacity: task.status === doneStatus ? 0.6 : 1,
                        borderLeft: `3px solid ${task.priority === 'high' ? 'var(--accent-coral)' : task.priority === 'medium' ? 'var(--accent-peach)' : 'var(--accent-blue)'}`
                      }}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};

export default CalendarView;
