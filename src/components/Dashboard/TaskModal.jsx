import { useState, useEffect, useRef } from 'react';
import GlassCard from '../UI/GlassCard';
import CustomSelect from '../UI/CustomSelect';
import CustomDatePicker from '../UI/CustomDatePicker';
import { X, Edit2, ChevronDown, ChevronUp, Tag as TagIcon } from 'lucide-react';
import '../UI/UI.css';

const SubtaskModal = ({ subtask, onClose, onSave, priorities = [], statuses = [] }) => {
  const [formData, setFormData] = useState(subtask);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick} style={{ alignItems: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px' }}>
        <GlassCard className="responsive-card" style={{ padding: '30px', position: 'relative', background: 'var(--solid-card-bg)', overflow: 'visible' }}>
          <button type="button" onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
          
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
            Edit Subtask
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Title</label>
              <input 
                type="text" 
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="neu-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            
            <div className="responsive-grid-2">
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Deadline</label>
                <CustomDatePicker 
                  value={formData.deadline || ''} 
                  onChange={(val) => handleChange('deadline', val)} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Priority</label>
                <CustomSelect 
                  value={formData.priority || priorities[0] || 'low'} 
                  onChange={(val) => handleChange('priority', val)}
                  options={priorities.map(p => ({ value: p, label: p }))}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Status</label>
              <CustomSelect 
                value={formData.status || statuses[0] || 'todo'} 
                onChange={(val) => handleChange('status', val)}
                options={statuses.map(s => ({ value: s, label: s }))}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '10px' }}>
              <button type="button" className="pill-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="pill-btn primary">Save Subtask</button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

const TaskModal = ({ isOpen, onClose, onSave, onDelete, task = null, projects = [], priorities = [], statuses = [], notes = [], onOpenNote, zIndex }) => {
  const defaultStatus = statuses.length > 0 ? statuses[0] : 'todo';
  
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    status: defaultStatus,
    priority: 'low',
    project: '',
    tags: '',
    deadline: '',
    recurrence: 'none',
    subtasks: [],
    linkedNotes: []
  });

  const [newSubtask, setNewSubtask] = useState('');
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');

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
        status: task.status || defaultStatus,
        priority: task.priority || 'low',
        project: task.project || '',
        tags: Array.isArray(task.tags) ? task.tags.join(', ') : (task.tags || ''),
        deadline: task.deadline || today,
        recurrence: task.recurrence || 'none',
        subtasks: task.subtasks || [],
        linkedNotes: task.linkedNotes || []
      });
      setIsDescOpen(!!task.desc);
    } else {
      setFormData({
        title: '',
        desc: '',
        status: defaultStatus,
        priority: 'low',
        project: '',
        tags: [],
        deadline: today,
        recurrence: 'none',
        subtasks: [],
        linkedNotes: []
      });
      setIsDescOpen(false);
    }
  }, [task, isOpen, statuses]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
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

  const handleSaveSubtask = (updatedSubtask) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(s => s.id === updatedSubtask.id ? updatedSubtask : s)
    }));
    setEditingSubtask(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    let tagsArray = [];
    if (typeof formData.tags === 'string') {
      tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    } else {
      tagsArray = formData.tags;
    }
    
    onSave({ 
      ...task, 
      ...formData, 
      tags: tagsArray,
      id: task?.id || crypto.randomUUID() 
    });
    onClose();
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label={task ? 'Edit Task' : 'New Task'} style={{ zIndex }}>
        <div onClick={e => e.stopPropagation()} style={{ margin: 'auto', width: '100%', maxWidth: '500px' }}>
          <GlassCard className="responsive-card" style={{ padding: '30px', position: 'relative', background: 'var(--solid-card-bg)' }}>
            <button type="button" onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>
            
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
              {task ? 'Edit Task' : 'New Task'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Task Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="neu-input" placeholder="What needs to be done?" style={{ width: '100%', boxSizing: 'border-box' }} autoFocus />
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
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Tags (Press Enter)</label>
                  <div className="neu-input" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px 16px', minHeight: '44px', alignItems: 'center' }}>
                    {Array.isArray(formData.tags) && formData.tags.map(tag => (
                      <span key={tag} style={{ background: 'var(--item-bg)', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TagIcon size={12} /> {tag}
                        <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><X size={12} /></button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder={(!formData.tags || formData.tags.length === 0) ? "Add tags..." : ""}
                      style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, minWidth: '80px', color: 'var(--text-main)', fontSize: '14px' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Linked Notes</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {formData.linkedNotes.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {formData.linkedNotes.map(noteId => {
                        const linkedNote = notes.find(n => n.id === noteId);
                        if (!linkedNote) return null;
                        return (
                          <span key={noteId} style={{ background: 'var(--item-bg)', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span 
                              style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', textDecoration: 'underline' }}
                              onClick={() => onOpenNote && onOpenNote(noteId)}
                            >
                              {linkedNote.title || 'Untitled Note'}
                            </span>
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, linkedNotes: prev.linkedNotes.filter(id => id !== noteId) }))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><X size={12} /></button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <CustomSelect 
                    placeholder="Attach a note..."
                    value=""
                    onChange={(val) => {
                      if (val && !formData.linkedNotes.includes(val)) {
                        setFormData(prev => ({ ...prev, linkedNotes: [...prev.linkedNotes, val] }));
                      }
                    }}
                    options={notes.filter(n => !formData.linkedNotes.includes(n.id)).map(n => ({
                      value: n.id,
                      label: n.title || 'Untitled Note'
                    }))}
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
                    style={{ width: '100%', boxSizing: 'border-box' }}
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
                            onClick={() => setEditingSubtask(sub)} 
                            style={{ fontSize: '13px', textDecoration: sub.isCompleted ? 'line-through' : 'none', color: sub.isCompleted ? 'var(--text-muted)' : 'inherit', cursor: 'pointer', flex: 1 }}
                          >
                            {sub.title}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <button type="button" onClick={() => setEditingSubtask(sub)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                             <Edit2 size={16} />
                          </button>
                          <button type="button" onClick={() => handleDeleteSubtask(sub.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-coral)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={14}/></button>
                        </div>
                      </div>
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
                  <textarea name="desc" value={formData.desc} onChange={handleChange} className="neu-textarea" placeholder="Add details..." rows="3" style={{ resize: 'none', fieldSizing: 'content', width: '100%', boxSizing: 'border-box' }} />
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

        {editingSubtask && (
          <SubtaskModal 
            subtask={editingSubtask} 
            onClose={() => setEditingSubtask(null)} 
            onSave={handleSaveSubtask} 
            priorities={priorities} 
            statuses={statuses} 
          />
        )}
      </div>
    </>
  );
};

export default TaskModal;
