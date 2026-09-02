import React, { useState, useEffect, useRef, useMemo } from 'react';
import GlassCard from '../UI/GlassCard';
import { Plus, Clock, CheckCircle2, Circle, Calendar as CalendarIcon, Tag, CheckSquare, FileText } from 'lucide-react';
import { isTaskOnDate } from '../../utils/recurrence';

const QUARTERS = ['00', '15', '30', '45'];
const SLOT_HEIGHT = 28; // Height in px for each 15-minute slot

const DayHourlyView = ({ date = new Date(), tasks = [], statuses = [], onEditTask, onAddTask, startHour = 0, endHour = 23 }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineRef = useRef(null);
  const hourRowRefs = useRef({});

  const validStartHour = typeof startHour === 'number' ? Math.max(0, Math.min(23, startHour)) : 0;
  const validEndHour = typeof endHour === 'number' ? Math.max(validStartHour, Math.min(23, endHour)) : 23;

  const hours = useMemo(() => {
    const list = [];
    for (let h = validStartHour; h <= validEndHour; h++) {
      list.push(h);
    }
    return list;
  }, [validStartHour, validEndHour]);

  const startHourMinutes = validStartHour * 60;
  const endHourMinutes = (validEndHour + 1) * 60;

  // Keep current time updated every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const dateObj = useMemo(() => (date instanceof Date ? date : new Date(date)), [date]);
  
  const dateStr = useMemo(() => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [dateObj]);

  const isToday = useMemo(() => {
    const now = new Date();
    return now.getFullYear() === dateObj.getFullYear() &&
           now.getMonth() === dateObj.getMonth() &&
           now.getDate() === dateObj.getDate();
  }, [dateObj]);

  const doneStatus = statuses.length > 0 ? statuses[statuses.length - 1] : 'done';

  // Filter tasks for this day (including recurring tasks)
  const dayTasks = useMemo(() => {
    return tasks.filter(t => isTaskOnDate(t, dateStr));
  }, [tasks, dateStr]);

  // Separate all-day tasks and timed tasks with exact minute layout
  const { allDayTasks, timedTasks, completedCount, totalCount } = useMemo(() => {
    const allDay = [];
    const timed = [];
    let completed = 0;

    dayTasks.forEach(task => {
      if (task.status === doneStatus) completed++;

      const hasStart = task.startTime && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(task.startTime.trim());
      const hasEnd = task.deadlineTime && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(task.deadlineTime.trim());

      if (hasStart || hasEnd) {
        let startM = 0;
        let endM = 0;

        if (hasStart) {
          const [sh, sm] = task.startTime.trim().split(':').map(Number);
          startM = sh * 60 + sm;
          if (hasEnd) {
            const [eh, em] = task.deadlineTime.trim().split(':').map(Number);
            endM = eh * 60 + em;
            if (endM <= startM) endM = startM + 30;
          } else {
            endM = startM + 45;
          }
        } else {
          // only deadlineTime is present
          const [eh, em] = task.deadlineTime.trim().split(':').map(Number);
          startM = eh * 60 + em;
          endM = startM + 30;
        }

        if (endM <= startHourMinutes || startM >= endHourMinutes) {
          allDay.push(task);
        } else {
          timed.push({
            task,
            startM,
            endM,
            durationM: Math.max(15, endM - startM),
            isDone: task.status === doneStatus
          });
        }
      } else {
        allDay.push(task);
      }
    });

    // Sort timed tasks by start time, then longer duration first
    timed.sort((a, b) => a.startM - b.startM || b.durationM - a.durationM);

    // Compute overlapping columns (side-by-side positioning)
    const columns = [];
    timed.forEach(item => {
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        if (columns[col] <= item.startM) {
          columns[col] = item.endM;
          item.column = col;
          placed = true;
          break;
        }
      }
      if (!placed) {
        item.column = columns.length;
        columns.push(item.endM);
      }
    });

    // Compute total columns for each overlapping group
    timed.forEach(item => {
      const overlapping = timed.filter(o => o.startM < item.endM && o.endM > item.startM);
      const maxCol = Math.max(...overlapping.map(o => o.column)) + 1;
      item.totalColumns = maxCol;
    });

    return { 
      allDayTasks: allDay, 
      timedTasks: timed, 
      completedCount: completed, 
      totalCount: dayTasks.length 
    };
  }, [dayTasks, doneStatus, startHourMinutes, endHourMinutes]);

  // Scroll to current hour or first task on mount/date change
  useEffect(() => {
    const currentH = new Date().getHours();
    const targetHour = isToday 
      ? Math.max(validStartHour, Math.min(validEndHour, currentH - 1))
      : (timedTasks.length > 0 ? Math.max(validStartHour, Math.min(validEndHour, Math.floor(timedTasks[0].startM / 60))) : Math.max(validStartHour, Math.min(validEndHour, 8)));

    const targetEl = hourRowRefs.current[targetHour];
    if (targetEl && timelineRef.current) {
      const containerTop = timelineRef.current.getBoundingClientRect().top;
      const elTop = targetEl.getBoundingClientRect().top;
      const scrollOffset = elTop - containerTop + timelineRef.current.scrollTop - 10;
      timelineRef.current.scrollTo({ top: Math.max(0, scrollOffset), behavior: 'smooth' });
    }
  }, [dateStr, isToday, validStartHour, validEndHour]);

  const currentMinutesFromMidnight = currentTime.getHours() * 60 + currentTime.getMinutes();
  const isCurrentTimeVisible = isToday && currentMinutesFromMidnight >= startHourMinutes && currentMinutesFromMidnight <= endHourMinutes;
  const relativeCurrentM = currentMinutesFromMidnight - startHourMinutes;
  const currentTimelineTopPx = (relativeCurrentM / 15) * SLOT_HEIGHT;
  const currentFormattedTime = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;

  const formatHourLabel = (hour) => {
    return `${String(hour).padStart(2, '0')}:00`;
  };

  const formatSlotTime = (hour, quarterIndex) => {
    return `${String(hour).padStart(2, '0')}:${QUARTERS[quarterIndex]}`;
  };

  const formatMinutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const formatDurationText = (durationM) => {
    const h = Math.floor(durationM / 60);
    const m = durationM % 60;
    if (h > 0 && m > 0) return `${h} ч ${m} мин`;
    if (h > 0) return `${h} ч`;
    return `${m} мин`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--accent-coral)';
      case 'medium': return 'var(--accent-peach)';
      default: return 'var(--accent-blue)';
    }
  };

  const handleSlotClick = (hour, quarterIdx) => {
    const startStr = formatSlotTime(hour, quarterIdx);
    const endHour = (hour + 1) % 24;
    const endStr = formatSlotTime(endHour, quarterIdx);
    onAddTask(dateStr, startStr, endStr);
  };

  return (
    <div className="day-hourly-view" style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0 }}>
      {/* Day Summary / Stats Bar */}
      <GlassCard style={{ 
        padding: '16px 24px', 
        borderRadius: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'var(--item-bg)',
            boxShadow: 'var(--shadow-inner)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-blue)'
          }}>
            <CalendarIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
              {isToday ? 'Сегодня' : dateStr}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {totalCount === 0 ? 'Задач нет' : `Задач: ${totalCount} • Выполнено: ${completedCount}`}
            </div>
          </div>
        </div>

        {totalCount > 0 && (
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: '20px',
            background: completedCount === totalCount ? 'rgba(76, 175, 80, 0.15)' : 'var(--item-bg)',
            color: completedCount === totalCount ? '#2e7d32' : 'var(--text-main)',
            boxShadow: 'var(--shadow-inner)'
          }}>
            {Math.round((completedCount / totalCount) * 100)}% завершено
          </div>
        )}
      </GlassCard>

      {/* All-Day Tasks Section */}
      {allDayTasks.length > 0 && (
        <GlassCard className="all-day-section" style={{ 
          padding: '16px 24px', 
          borderRadius: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Clock size={15} style={{ color: 'var(--accent-blue)' }} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Весь день ({allDayTasks.length})
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {allDayTasks.map(task => {
              const isDone = task.status === doneStatus;
              const priorityColor = getPriorityColor(task.priority);
              return (
                <div
                  key={task.id}
                  onClick={() => onEditTask(task)}
                  className="all-day-task-chip"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 14px',
                    background: isDone ? 'var(--item-bg)' : 'linear-gradient(135deg, rgba(255, 235, 208, 0.85), rgba(246, 222, 193, 0.7))',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-soft)',
                    border: '1px solid rgba(230, 200, 168, 0.65)',
                    borderLeft: `4px solid ${priorityColor}`,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    textDecoration: isDone ? 'line-through' : 'none',
                    opacity: isDone ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    maxWidth: '300px'
                  }}
                  title={task.title}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 size={15} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                  ) : (
                    <Circle size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* 15-Minute Timeline Grid (GlassCard Matching Other Pages) */}
      <GlassCard 
        className="hourly-timeline-card custom-scroll" 
        style={{ 
          padding: '16px 20px', 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          position: 'relative', 
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 210px)',
          borderRadius: '24px'
        }}
      >
        <div ref={timelineRef} style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          
          {/* Main Grid Rows (Hours & 15-min slots) */}
          {hours.map(hour => {
            const isCurrentHour = isToday && currentTime.getHours() === hour;

            return (
              <div
                key={hour}
                ref={el => (hourRowRefs.current[hour] = el)}
                className="hour-slot-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '65px 1fr',
                  minHeight: `${SLOT_HEIGHT * 4}px`,
                  borderTop: '1px solid var(--card-border)',
                  position: 'relative',
                  background: isCurrentHour ? 'rgba(164, 201, 229, 0.04)' : 'transparent'
                }}
              >
                {/* Hour / 15-min Time Marks Column */}
                <div style={{
                  userSelect: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRight: '1px solid var(--card-border)'
                }}>
                  {/* :00 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: `${SLOT_HEIGHT}px`, padding: '0 6px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: isCurrentHour ? 800 : 700,
                      color: isCurrentHour ? '#ffffff' : 'var(--text-main)',
                      background: isCurrentHour ? 'var(--accent-blue)' : 'var(--item-bg)',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      boxShadow: isCurrentHour ? '0 2px 6px rgba(164, 201, 229, 0.5)' : 'var(--shadow-inner)',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>
                      {formatHourLabel(hour)}
                    </span>
                  </div>

                  {/* :15 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: `${SLOT_HEIGHT}px`, paddingRight: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', opacity: 0.7, lineHeight: '1' }}>
                      :15
                    </span>
                  </div>

                  {/* :30 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: `${SLOT_HEIGHT}px`, paddingRight: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', opacity: 0.7, lineHeight: '1' }}>
                      :30
                    </span>
                  </div>

                  {/* :45 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: `${SLOT_HEIGHT}px`, paddingRight: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', opacity: 0.7, lineHeight: '1' }}>
                      :45
                    </span>
                  </div>
                </div>

                {/* 4 Quarter Background Clickable Slots */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                  {[0, 1, 2, 3].map(quarterIdx => {
                    const slotTimeStr = formatSlotTime(hour, quarterIdx);

                    return (
                      <div
                        key={quarterIdx}
                        onClick={() => handleSlotClick(hour, quarterIdx)}
                        className="quarter-slot-bg"
                        style={{
                          height: `${SLOT_HEIGHT}px`,
                          borderBottom: quarterIdx < 3 ? '1px dashed rgba(190, 168, 159, 0.15)' : 'none',
                          padding: '0 8px',
                          display: 'flex',
                          alignItems: 'center',
                          position: 'relative',
                          cursor: 'pointer',
                          borderRadius: '6px'
                        }}
                        onMouseEnter={(e) => {
                          const addBtn = e.currentTarget.querySelector('.slot-quick-add-btn');
                          if (addBtn) {
                            addBtn.style.opacity = '1';
                            addBtn.style.transform = 'translateY(-50%) scale(1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          const addBtn = e.currentTarget.querySelector('.slot-quick-add-btn');
                          if (addBtn) {
                            addBtn.style.opacity = '0';
                            addBtn.style.transform = 'translateY(-50%) scale(0.95)';
                          }
                        }}
                      >
                        {/* Compact Time Badge on Hover */}
                        <div
                          className="slot-quick-add-btn"
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%) scale(0.95)',
                            opacity: 0,
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-blue)',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: 'var(--card-bg)',
                            backdropFilter: 'blur(10px)',
                            padding: '3px 9px',
                            borderRadius: '12px',
                            boxShadow: 'var(--shadow-soft)',
                            border: '1px solid var(--card-border)',
                            pointerEvents: 'none',
                            zIndex: 5
                          }}
                        >
                          <span>{slotTimeStr}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Absolute Overlaid Layer: Note-style Cards (Matching NotesView) */}
          <div 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: '65px', 
              right: '8px', 
              bottom: 0, 
              pointerEvents: 'none' 
            }}
          >
            {timedTasks.map(({ task, startM, endM, durationM, isDone, column, totalColumns }) => {
              const visibleStartM = Math.max(startHourMinutes, startM);
              const visibleEndM = Math.min(endHourMinutes, endM);
              const relativeStartM = visibleStartM - startHourMinutes;
              const visibleDurationM = Math.max(15, visibleEndM - visibleStartM);

              const topPx = (relativeStartM / 15) * SLOT_HEIGHT;
              const heightPx = Math.max(SLOT_HEIGHT - 2, (visibleDurationM / 15) * SLOT_HEIGHT - 2);
              const colWidthPercent = 100 / totalColumns;
              const leftPercent = column * colWidthPercent;
              const priorityColor = getPriorityColor(task.priority);

              const timeRangeDisplay = `${task.startTime || formatMinutesToTime(startM)} – ${task.deadlineTime || formatMinutesToTime(endM)}`;
              const durationText = formatDurationText(durationM);

              const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
              const completedSubtasks = subtasks.filter(s => s.isCompleted).length;

              return (
                <div
                  key={task.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTask(task);
                  }}
                  className="timeline-event-span-card"
                  style={{
                    position: 'absolute',
                    top: `${topPx + 1}px`,
                    height: `${heightPx}px`,
                    left: `calc(${leftPercent}% + 4px)`,
                    width: `calc(${colWidthPercent}% - 8px)`,
                    background: isDone ? 'var(--item-bg)' : 'linear-gradient(135deg, rgba(255, 235, 208, 0.85), rgba(246, 222, 193, 0.7))',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-card)',
                    border: '1px solid rgba(230, 200, 168, 0.65)',
                    borderLeft: `4px solid ${priorityColor}`,
                    padding: heightPx < 50 ? '4px 12px' : '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: heightPx < 50 ? 'center' : 'flex-start',
                    gap: '4px',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    zIndex: 10 + column,
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  title={`${task.title} (${timeRangeDisplay})`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.zIndex = '30';
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.zIndex = `${10 + column}`;
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  }}
                >
                  {/* Top Bar: Time Pill + Duration + Tags */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      {/* Time Range Pill */}
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        background: 'var(--item-bg)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-inner)',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Clock size={11} style={{ color: priorityColor }} />
                        <span>{timeRangeDisplay}</span>
                      </span>

                      {/* Duration Tag */}
                      {durationM > 15 && (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          padding: '2px 4px',
                          whiteSpace: 'nowrap'
                        }}>
                          {durationText}
                        </span>
                      )}
                    </div>

                    {/* Right side: Project Tag */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {task.project && (
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          background: 'var(--item-bg)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          boxShadow: 'var(--shadow-inner)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          maxWidth: '120px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          <Tag size={10} />
                          {task.project}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Task Title & Checkbox */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: heightPx < 50 ? 'center' : 'flex-start', 
                    gap: '8px', 
                    minWidth: 0, 
                    marginTop: heightPx >= 50 ? '2px' : '0' 
                  }}>
                    {isDone ? (
                      <CheckCircle2 size={15} style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: heightPx >= 50 ? '2px' : '0' }} />
                    ) : (
                      <Circle size={15} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: heightPx >= 50 ? '2px' : '0' }} />
                    )}

                    <span style={{
                      fontSize: heightPx >= 65 ? '14px' : '12px',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      opacity: isDone ? 0.6 : 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: heightPx < 65 ? 'nowrap' : 'normal',
                      lineHeight: '1.3'
                    }}>
                      {task.title}
                    </span>
                  </div>

                  {/* Description preview (like a Note preview) */}
                  {heightPx >= 85 && task.desc && (
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      background: 'var(--item-bg)',
                      padding: '6px 10px',
                      borderRadius: '10px',
                      boxShadow: 'var(--shadow-inner)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: Math.floor((heightPx - 75) / 18),
                      WebkitBoxOrient: 'vertical',
                      lineHeight: '1.4',
                      marginTop: '2px'
                    }}>
                      {task.desc}
                    </div>
                  )}

                  {/* Subtasks Progress Bar (if task has subtasks and card >= 110px) */}
                  {heightPx >= 110 && subtasks.length > 0 && (
                    <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '3px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckSquare size={11} /> Подзадачи
                        </span>
                        <span>{completedSubtasks}/{subtasks.length}</span>
                      </div>
                      <div style={{ height: '5px', background: 'var(--item-bg)', borderRadius: '3px', overflow: 'hidden', boxShadow: 'var(--shadow-inner)' }}>
                        <div style={{
                          height: '100%',
                          width: `${(completedSubtasks / subtasks.length) * 100}%`,
                          background: priorityColor,
                          borderRadius: '3px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Time Indicator Line with live red/coral glow across the whole timeline */}
          {isCurrentTimeVisible && (
            <div 
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${currentTimelineTopPx}px`,
                zIndex: 25,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {/* Current time pill badge */}
              <div style={{
                background: 'var(--accent-coral)',
                color: '#fff',
                fontSize: '9px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(239, 154, 138, 0.6)',
                marginRight: '4px',
                flexShrink: 0
              }}>
                {currentFormattedTime}
              </div>

              {/* Glowing dot */}
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--accent-coral)',
                boxShadow: '0 0 8px 2px rgba(239, 154, 138, 0.8)',
                flexShrink: 0
              }} />

              {/* Horizontal red/coral glowing bar */}
              <div style={{
                flex: 1,
                height: '2px',
                background: 'linear-gradient(90deg, var(--accent-coral), var(--accent-pink))',
                boxShadow: '0 0 6px rgba(239, 154, 138, 0.7)',
                marginLeft: '4px'
              }} />
            </div>
          )}

        </div>
      </GlassCard>
    </div>
  );
};

export default DayHourlyView;
