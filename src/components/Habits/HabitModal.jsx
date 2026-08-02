import React, { useState, useEffect } from 'react';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import GlassCard from '../UI/GlassCard';
import CustomSelect from '../UI/CustomSelect';
import { X, Save, Activity, Trash2 } from 'lucide-react';
import { useConfirm } from '../../hooks/useConfirm';
import '../UI/UI.css';

const HabitModal = ({ isOpen, onClose, onSave, onDelete, habit = null }) => {
  useEscapeKey(onClose);
  const confirm = useConfirm();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [color, setColor] = useState('default');
  const [archived, setArchived] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (habit) {
        setName(habit.name || '');
        setDesc(habit.desc || '');
        setFrequency(habit.frequency || 'daily');
        setColor(habit.color || 'default');
        setArchived(habit.archived || false);
      } else {
        setName('');
        setDesc('');
        setFrequency('daily');
        setColor('default');
        setArchived(false);
      }
    }
  }, [isOpen, habit]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
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
      archived,
      createdAt: habit?.createdAt || new Date().toISOString(),
      logs: habit?.logs || {}
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label={habit ? 'Edit Habit' : 'New Habit'}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px', margin: 'auto' }}>
        <GlassCard style={{ padding: '30px', position: 'relative', background: 'var(--solid-card-bg)', maxHeight: '90vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={24} color="var(--accent-coral)" />
              {habit ? 'Edit Habit' : 'New Habit'}
            </h2>
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Habit Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="neu-input" 
                placeholder="e.g. Drink Water"
                style={{ width: '100%', boxSizing: 'border-box' }}
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Description (Optional)</label>
              <textarea 
                value={desc} 
                onChange={(e) => setDesc(e.target.value)} 
                className="neu-textarea" 
                placeholder="Why are you doing this?"
                style={{ minHeight: '80px', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div className="responsive-grid-2">
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Frequency</label>
                <CustomSelect 
                  value={frequency}
                  onChange={(val) => setFrequency(val)}
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' }
                  ]}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Color Tag</label>
                <CustomSelect 
                  value={color}
                  onChange={(val) => setColor(val)}
                  options={[
                    { value: 'default', label: 'Default' },
                    { value: 'blue', label: 'Blue' },
                    { value: 'green', label: 'Green' },
                    { value: 'peach', label: 'Peach' },
                    { value: 'lavender', label: 'Lavender' }
                  ]}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '10px' }}>
              {habit && (
                <>
                  <button 
                    type="button"
                    className="pill-btn danger" 
                    style={{ marginRight: 'auto' }}
                    onClick={async () => {
                      if (await confirm("Are you sure you want to delete this habit?")) {
                        onDelete(habit.id);
                        onClose();
                      }
                    }}
                  >
                    Delete
                  </button>
                  <button 
                    type="button"
                    className="pill-btn secondary"
                    onClick={() => {
                      onSave({ ...(habit || {}), name, desc, frequency, color, archived: !archived, createdAt: habit?.createdAt || new Date().toISOString(), logs: habit?.logs || {} });
                      onClose();
                    }}
                  >
                    {archived ? 'Unarchive' : 'Archive'}
                  </button>
                </>
              )}
              <button type="button" className="pill-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="pill-btn primary">Save Habit</button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default HabitModal;
