import React, { useState, useEffect } from 'react';
import GlassCard from '../UI/GlassCard';
import NeumorphicButton from '../UI/NeumorphicButton';
import { X, Save, Activity, Trash2 } from 'lucide-react';

const HabitModal = ({ isOpen, onClose, habit, onSave, onDelete }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [color, setColor] = useState('default');

  useEffect(() => {
    if (isOpen) {
      if (habit) {
        setName(habit.name || '');
        setDesc(habit.desc || '');
        setFrequency(habit.frequency || 'daily');
        setColor(habit.color || 'default');
      } else {
        setName('');
        setDesc('');
        setFrequency('daily');
        setColor('default');
      }
    }
  }, [isOpen, habit]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    onSave({
      ...(habit || {}),
      name,
      desc,
      frequency,
      color,
      createdAt: habit?.createdAt || new Date().toISOString(),
      logs: habit?.logs || {}
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <GlassCard className="modal-content" style={{ maxWidth: '500px', width: '100%', padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={24} color="var(--accent-primary)" />
            {habit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <NeumorphicButton onClick={onClose}>
            <X size={20} />
          </NeumorphicButton>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label>Habit Name</label>
            <input 
              type="text" 
              className="neumorphic-input" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Drink Water"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea 
              className="neumorphic-input" 
              value={desc} 
              onChange={(e) => setDesc(e.target.value)} 
              placeholder="Why are you doing this?"
              style={{ minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Frequency</label>
              <select 
                className="neumorphic-input"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Color Tag</label>
              <select 
                className="neumorphic-input"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="peach">Peach</option>
                <option value="lavender">Lavender</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          {habit ? (
            <button 
              className="pill-btn" 
              style={{ background: 'var(--accent-coral)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => {
                if (window.confirm("Delete this habit?")) {
                  onDelete(habit.id);
                  onClose();
                }
              }}
            >
              <Trash2 size={16} /> Delete
            </button>
          ) : <div></div>}
          
          <button 
            className="pill-btn primary" 
            onClick={handleSave}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={16} /> Save Habit
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default HabitModal;
