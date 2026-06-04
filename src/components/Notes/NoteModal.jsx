import React, { useState, useEffect } from 'react';
import GlassCard from '../UI/GlassCard';
import { X, Check } from 'lucide-react';
import '../UI/UI.css';

const COLORS = [
  { id: 'default', value: 'var(--card-bg)' },
  { id: 'blue', value: 'rgba(111, 168, 220, 0.2)' },
  { id: 'peach', value: 'rgba(244, 194, 194, 0.2)' },
  { id: 'green', value: 'rgba(143, 185, 168, 0.2)' },
  { id: 'yellow', value: 'rgba(255, 230, 153, 0.2)' },
];

const NoteModal = ({ isOpen, onClose, onSave, onDelete, note = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: 'default'
  });

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        color: note.color || 'default'
      });
    } else {
      setFormData({
        title: '',
        content: '',
        color: 'default'
      });
    }
  }, [note, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Only save if there's actual content
    if (!formData.title.trim() && !formData.content.trim()) {
      onClose();
      return;
    }
    
    onSave({
      ...note,
      ...formData,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  const currentColorValue = COLORS.find(c => c.id === formData.color)?.value || 'var(--card-bg)';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <GlassCard 
        style={{ 
          width: '100%', 
          maxWidth: '600px', 
          position: 'relative', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          padding: '30px',
          background: currentColorValue,
          transition: 'background 0.3s ease'
        }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <input 
            type="text" 
            name="title" 
            placeholder="Note Title" 
            value={formData.title} 
            onChange={handleChange} 
            className="neu-input" 
            style={{ fontSize: '18px', fontWeight: 700 }} 
            autoFocus
          />
          
          <textarea 
            name="content" 
            placeholder="Type your thoughts here..." 
            value={formData.content} 
            onChange={handleChange} 
            className="neu-textarea" 
            style={{ 
              minHeight: '200px', 
              resize: 'vertical', 
              flex: 1
            }} 
          />

          <div className="note-color-picker" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Color:</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, color: c.id}))}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: c.value,
                    border: formData.color === c.id ? '2px solid var(--text-main)' : '2px solid var(--card-border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-soft)'
                  }}
                >
                  {formData.color === c.id && <Check size={16} color="var(--text-main)" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '15px' }}>
          {note ? (
            <button 
              type="button" 
              onClick={() => {
                if(window.confirm('Delete this note?')) {
                  onDelete(note.id);
                  onClose();
                }
              }} 
              className="pill-btn danger"
            >
              Delete Note
            </button>
          ) : (
            <div></div> // Placeholder to keep Save button on the right
          )}
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <button type="button" onClick={onClose} className="pill-btn" style={{ background: 'var(--item-bg)' }}>Cancel</button>
            <button type="button" onClick={handleSave} className="pill-btn primary">Save Note</button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default NoteModal;
