import React, { useState, useEffect, useMemo } from 'react';
import { collection, doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import GlassCard from '../UI/GlassCard';
import NeumorphicButton from '../UI/NeumorphicButton';
import HabitModal from './HabitModal';
import { Activity, Plus, Check, Flame } from 'lucide-react';
import '../UI/UI.css';

const COLORS = {
  default: 'var(--card-bg)',
  blue: 'rgba(111, 168, 220, 0.2)',
  peach: 'rgba(244, 194, 194, 0.2)',
  green: 'rgba(143, 185, 168, 0.2)',
  lavender: 'rgba(182, 168, 220, 0.2)'
};

const getLast7Days = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push({ dateStr: `${y}-${m}-${day}`, dateObj: d });
  }
  return dates;
};

const calculateStreak = (logs) => {
  if (!logs) return 0;
  let streak = 0;
  let d = new Date();
  
  while (true) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    
    if (logs[dateStr]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (streak === 0 && d.toDateString() === new Date().toDateString()) {
      // It's okay if today is not logged yet, check yesterday
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

const HabitsView = () => {
  const [habits, setHabits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "users", user.uid, "habits"), (snapshot) => {
      const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setHabits(loaded);
    }, (error) => {
      console.error("Error reading habits:", error);
    });
    return () => unsub();
  }, [user]);

  const handleOpenNewHabit = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleSaveHabit = async (habitData) => {
    if (!user) return;
    try {
      const id = habitData.id || crypto.randomUUID();
      await setDoc(doc(db, "users", user.uid, "habits", id.toString()), { ...habitData, id }, { merge: true });
    } catch (e) {
      alert("Error saving habit: " + e.message);
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "habits", id.toString()));
    } catch (e) {
      alert("Error deleting habit: " + e.message);
    }
  };

  const handleToggleLog = async (habit, dateStr) => {
    if (!user) return;
    const newLogs = { ...(habit.logs || {}) };
    if (newLogs[dateStr]) {
      newLogs[dateStr] = false;
    } else {
      newLogs[dateStr] = true;
    }
    await handleSaveHabit({ ...habit, logs: newLogs });
  };

  const last7Days = useMemo(() => getLast7Days(), []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Header */}
      <GlassCard className="welcome-card-header" style={{ padding: '24px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-main)' }}>Habits Tracker</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
            Build good habits and track your daily progress.
          </p>
        </div>
        
        <button className="pill-btn primary" onClick={handleOpenNewHabit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Habit
        </button>
      </GlassCard>

      {/* Grid */}
      {habits.length === 0 ? (
        <GlassCard style={{ padding: '40px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
          <Activity size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>No habits tracked</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>
            Click 'New Habit' to start building streaks!
          </p>
        </GlassCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {habits.map(habit => {
            const streak = calculateStreak(habit.logs);
            const bgColor = COLORS[habit.color] || COLORS.default;

            return (
              <GlassCard 
                key={habit.id} 
                style={{ 
                  padding: '20px', 
                  background: bgColor,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  border: '1px solid var(--card-border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => handleEditHabit(habit)}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--text-main)', fontWeight: 600 }}>{habit.name}</h3>
                    {habit.desc && <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{habit.desc}</p>}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: streak > 0 ? 'var(--accent-coral)' : 'var(--text-muted)' }}>
                    <Flame size={18} fill={streak > 0 ? 'var(--accent-coral)' : 'none'} />
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>{streak}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                {(() => {
                  const completedInLast7Days = last7Days.filter(({dateStr}) => habit.logs && habit.logs[dateStr]).length;
                  const progressPercent = (completedInLast7Days / 7) * 100;
                  return (
                    <div style={{ marginTop: 'auto', marginBottom: '4px', width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                        <span>Weekly Progress</span>
                        <span>{completedInLast7Days} / 7 days</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--item-bg)', borderRadius: '3px', overflow: 'hidden', boxShadow: 'var(--shadow-inner)' }}>
                        <div style={{ height: '100%', background: 'var(--accent-blue)', width: `${progressPercent}%`, transition: 'width 0.3s ease', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  );
                })()}

                {/* 7 Days Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {last7Days.map(({ dateStr, dateObj }) => {
                    const isDone = habit.logs && habit.logs[dateStr];
                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
                    return (
                      <div key={dateStr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{dayName}</span>
                        <button
                          onClick={() => handleToggleLog(habit, dateStr)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: 'none',
                            background: isDone ? 'var(--accent-blue)' : 'var(--item-bg)',
                            color: isDone ? 'white' : 'transparent',
                            boxShadow: isDone ? 'var(--shadow-soft)' : 'var(--shadow-inner)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Check size={16} strokeWidth={3} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      <HabitModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        habit={editingHabit}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
      />
    </div>
  );
};

export default HabitsView;
