import { useState, useEffect, useRef } from 'react';
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
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [isDescOpen, setIsDescOpen] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const today = `${y}-${m}-${day}`;
    
    if (task) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    if (isOpen && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

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

  const handleSubtaskChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(s => s.id === id ? { ...s, [field]: value } : s)
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
    <dialog ref={dialogRef} className="native-modal" onClick={handleBackdropClick} onCancel={(e) => { e.preventDefault(); onClose(); }} aria-label={task ? 'Edit Task' : 'New Task'}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%' }}>
        <GlassCard style={{ padding: '30px', position: 'relative', background: 'var(--solid-card-bg)' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
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

            <div className="responsive-grid-2">
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

            <div className="responsive-grid-2">
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

            <div className="responsive-grid-2">
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {formData.subtasks.map(sub => (
                  <div key={sub.id} style={{ display: 'flex', flexDirection: 'column', background: 'var(--item-bg)', padding: '8px 12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <input type="checkbox" checked={sub.isCompleted} onChange={() => handleToggleSubtask(sub.id)} style={{ cursor: 'pointer' }} />
                        <span 
                          onClick={() => setEditingSubtaskId(editingSubtaskId === sub.id ? null : sub.id)} 
                          style={{ fontSize: '13px', textDecoration: sub.isCompleted ? 'line-through' : 'none', color: sub.isCompleted ? 'var(--text-muted)' : 'inherit', cursor: 'pointer', flex: 1 }}
                        >
                          {sub.title}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <button type="button" onClick={() => setEditingSubtaskId(editingSubtaskId === sub.id ? null : sub.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                           {editingSubtaskId === sub.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <button type="button" onClick={() => handleDeleteSubtask(sub.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-coral)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={14}/></button>
                      </div>
                    </div>
                    {editingSubtaskId === sub.id && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>Title</label>
                          <input 
                            type="text" 
                            value={sub.title}
                            onChange={(e) => handleSubtaskChange(sub.id, 'title', e.target.value)}
                            className="neu-input"
                          />
                        </div>
                        <div className="responsive-grid-2">
                          <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>Deadline</label>
                            <CustomDatePicker 
                              value={sub.deadline || ''} 
                              onChange={(val) => handleSubtaskChange(sub.id, 'deadline', val)} 
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>Priority</label>
                            <CustomSelect 
                              value={sub.priority || priorities[0] || 'low'} 
                              onChange={(val) => handleSubtaskChange(sub.id, 'priority', val)}
                              options={priorities.map(p => ({ value: p, label: p }))}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}>Status</label>
                            <CustomSelect 
                              value={sub.status || statuses[0] || 'todo'} 
                              onChange={(val) => handleSubtaskChange(sub.id, 'status', val)}
                              options={statuses.map(s => ({ value: s, label: s }))}
                            />
                          </div>
                        </div>
                      </div>
                    )}
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
                <textarea name="desc" value={formData.desc} onChange={handleChange} className="neu-textarea" placeholder="Add details..." rows="1" style={{ resize: 'none', fieldSizing: 'content' }} />
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
    </dialog>
  );
};

export default TaskModal;
