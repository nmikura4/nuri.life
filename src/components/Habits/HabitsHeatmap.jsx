import React, { useMemo } from 'react';
import GlassCard from '../UI/GlassCard';

const HabitsHeatmap = ({ habits = [] }) => {
  // Generate last 91 days (13 weeks)
  const heatmapDays = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // We want the grid to end on today, but to look like a calendar, we might want to end on the current day of the week,
    // or just show exactly 90 days. GitHub style typically aligns columns by week.
    // Let's just generate 90 days backwards from today.
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({
        dateObj: d,
        dateStr: dateStr
      });
    }
    return days;
  }, []);

  const { maxCompletions, completionData, totalCompletions, globalStreak } = useMemo(() => {
    const data = {};
    let max = 0;
    let total = 0;

    // Calculate completions per day
    heatmapDays.forEach(day => {
      let count = 0;
      habits.forEach(h => {
        if (!h.archived && h.logs && h.logs[day.dateStr]) {
          count++;
          total++;
        }
      });
      data[day.dateStr] = count;
      if (count > max) max = count;
    });

    // Calculate global streak (days in a row where AT LEAST ONE habit was done)
    let streak = 0;
    let d = new Date();
    while (true) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      let doneToday = false;
      for (const h of habits) {
        if (!h.archived && h.logs && h.logs[dateStr]) {
          doneToday = true;
          break;
        }
      }

      if (doneToday) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else if (streak === 0 && d.toDateString() === new Date().toDateString()) {
        d.setDate(d.getDate() - 1); // skip today if not done yet
      } else {
        break;
      }
    }

    return { maxCompletions: max, completionData: data, totalCompletions: total, globalStreak: streak };
  }, [habits, heatmapDays]);

  const getColor = (count) => {
    if (count === 0) return 'var(--item-bg)';
    
    // 4 levels of green
    if (maxCompletions === 1) return 'rgba(143, 185, 168, 0.8)'; // default green
    
    const ratio = count / maxCompletions;
    if (ratio <= 0.25) return 'rgba(143, 185, 168, 0.3)';
    if (ratio <= 0.5) return 'rgba(143, 185, 168, 0.6)';
    if (ratio <= 0.75) return 'rgba(143, 185, 168, 0.8)';
    return 'rgba(143, 185, 168, 1)'; // darkest
  };

  return (
    <GlassCard style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-main)' }}>Activity (Last 90 Days)</h3>
        <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <div>Total done: <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{totalCompletions}</span></div>
          <div>Global streak: <span style={{ fontWeight: 700, color: 'var(--accent-coral)' }}>{globalStreak} 🔥</span></div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '6px' }} className="custom-scroll">
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', minWidth: 'min-content' }}>
          {heatmapDays.map((day) => {
            const count = completionData[day.dateStr] || 0;
            return (
              <div
                key={day.dateStr}
                title={`${day.dateStr}: ${count} habit(s) completed`}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '3px',
                  background: getColor(count),
                  transition: 'transform 0.1s ease',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.2)';
                  e.currentTarget.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              ></div>
            );
          })}
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
        Less
        <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--item-bg)' }}></div>
        <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(143, 185, 168, 0.3)' }}></div>
        <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(143, 185, 168, 0.6)' }}></div>
        <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(143, 185, 168, 0.8)' }}></div>
        <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(143, 185, 168, 1)' }}></div>
        More
      </div>
    </GlassCard>
  );
};

export default HabitsHeatmap;
