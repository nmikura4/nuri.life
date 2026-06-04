import React, { useState, useEffect } from 'react';
import GlassCard from '../UI/GlassCard';
import CustomSelect from '../UI/CustomSelect';
import CustomDatePicker from '../UI/CustomDatePicker';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import '../UI/UI.css';

const TaskModal = ({ isOpen, onClose, onSave, task = null, onDelete, projects = [], priorities = [], statuses = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    status: 'todo',
    priority: 'low',
    project: '',
    tags: '',
    deadline: '',
    recurrence: 'none',
    subtasks: []
  });

  const [newSubtask, setNewSubtask] = useState('');
  const [isDescOpen, setIsDescOpen] = useState(false);

  useEffect(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const today = `${y}-${m}-${day}`;
    
    if (task) {
      setFormData({
        title: task.title || '',
        desc: task.desc || '',
        status: task.status || 'todo',
        priority: task.priority || 'low',
        project: task.project || '',
        tags: Array.isArray(task.tags) ? task.tags.join(', ') : (task.tags || ''),
        deadline: task.deadline || today,
        recurrence: task.recurrence || 'none',
        subtasks: task.subtasks || []
      });
      setIsDescOpen(!!task.desc);
    } else {
      setFormData({
        title: '',
        desc: '',
        status: 'todo',
        priority: 'low',
        project: '',
        tags: '',
        deadline: today,
        recurrence: 'none',
        subtasks: []
      });
      setIsDescOpen(false);
    }
  }, [task, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (newSubtask.trim()) {
      setFormData(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, { id: crypto.randomUUID(), title: newSubtask.trim(), isCompleted: false }]
      }));
      setNewSubtask('');
    }
  };

  const handleToggleSubtask = (id) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(s => s.id === id ? { ...s, isCompleted: !s.isCompleted } : s)
    }));
  };

  const handleDeleteSubtask = (id) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(s => s.id !== id)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    
    onSave({ 
      ...task, 
      ...formData, 
      tags: tagsArray,
      id: task?.id || crypto.randomUUID() 
    });
    onClose();
  };

  return (
    <div className="modal-overlay modal-wrapper" onClick={onClose} role="dialog" aria-modal="true" aria-label={task ? 'Edit Task' : 'New Task'}>
      <div onClick={e => e.stopPropagation()} style={{ margin: 'auto', width: '100%', maxWidth: '500px' }}>
        <GlassCard className="modal-card" style={{ padding: '30px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={24} />
          </button>
          
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
            {task ? 'Edit Task' : 'New Task'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Task Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="neu-input" placeholder="What needs to be done?" autoFocus />
            </div>



            <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Project</label>
                <CustomSelect 
                  value={formData.project} 
                  onChange={(val) => setFormData(prev => ({ ...prev, project: val }))}
                  options={[
                    { value: '', label: 'No Project' },
                    ...projects.map(p => ({ value: p, label: p }))
                  ]}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Deadline</label>
                <CustomDatePicker 
                  value={formData.deadline} 
                  onChange={(val) => setFormData(prev => ({ ...prev, deadline: val }))} 
                />
              </div>
            </div>

            <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Priority</label>
                <CustomSelect 
                  value={formData.priority} 
                  onChange={(val) => setFormData(prev => ({ ...prev, priority: val }))}
                  options={priorities.map(p => ({ value: p, label: p }))}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Status</label>
                <CustomSelect 
                  value={formData.status} 
                  onChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                  options={statuses.map(s => ({ value: s, label: s }))}
                />
              </div>
            </div>

            <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Recurrence</label>
                <CustomSelect 
                  value={formData.recurrence} 
                  onChange={(val) => setFormData(prev => ({ ...prev, recurrence: val }))}
                  options={[
                    { value: 'none', label: 'None' },
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'yearly', label: 'Yearly' }
                  ]}
                />
              </div>
              <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Tags</label>
              <input 
                type="text" 
                name="tags" 
                value={formData.tags} 
                onChange={handleChange} 
                className="neu-input" 
                placeholder="e.g. UI, Bug"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Subtasks</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input 
                  type="text" 
                  value={newSubtask} 
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask(e))}
                  className="neu-input" 
                  placeholder="Add a step..." 
                />
                <button type="button" onClick={handleAddSubtask} className="pill-btn" style={{ padding: '8px 12px' }}>Add</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                {formData.subtasks.map(sub => (
                  <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--item-bg)', padding: '8px 12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="checkbox" checked={sub.isCompleted} onChange={() => handleToggleSubtask(sub.id)} style={{ cursor: 'pointer' }} />
                      <span style={{ fontSize: '13px', textDecoration: sub.isCompleted ? 'line-through' : 'none', color: sub.isCompleted ? 'var(--text-muted)' : 'inherit' }}>{sub.title}</span>
                    </div>
                    <button type="button" onClick={() => handleDeleteSubtask(sub.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-coral)', cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center' }}><X size={14}/></button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', borderRadius: '12px', padding: '12px', boxShadow: 'var(--shadow-soft)' }}>
              <div 
                onClick={() => setIsDescOpen(!isDescOpen)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: isDescOpen ? '12px' : '0' }}
              >
                <label style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer', margin: 0 }}>Description</label>
                {isDescOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </div>
              {isDescOpen && (
                <textarea name="desc" value={formData.desc} onChange={handleChange} className="neu-textarea" placeholder="Add details..." rows="3" style={{ resize: 'none' }} />
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '10px' }}>
              {task && (
                <button type="button" className="pill-btn danger" onClick={() => { if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) { onDelete(task.id); onClose(); } }} style={{ marginRight: 'auto' }}>
                  Delete
                </button>
              )}
              <button type="button" className="pill-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="pill-btn primary">Save Task</button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default TaskModal;
