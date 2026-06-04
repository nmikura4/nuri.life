import React, { useState, useEffect } from 'react';
import GlassCard from '../UI/GlassCard';
import CustomSelect from '../UI/CustomSelect';
import { X, Check, Paperclip, Smile, Meh, Frown, Zap, Coffee, CloudRain } from 'lucide-react';
import '../UI/UI.css';

const COLORS = [
  { id: 'default', value: 'var(--card-bg)' },
  { id: 'blue', value: 'rgba(111, 168, 220, 0.2)' },
  { id: 'peach', value: 'rgba(244, 194, 194, 0.2)' },
  { id: 'green', value: 'rgba(143, 185, 168, 0.2)' },
  { id: 'yellow', value: 'rgba(255, 230, 153, 0.2)' },
];

const MOOD_OPTIONS = [
  { value: 'happy', label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Smile size={14} /> Happy</span> },
  { value: 'neutral', label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Meh size={14} /> Neutral</span> },
  { value: 'sad', label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Frown size={14} /> Sad</span> },
  { value: 'energetic', label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={14} /> Energetic</span> },
  { value: 'relaxed', label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Coffee size={14} /> Relaxed</span> },
  { value: 'gloomy', label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CloudRain size={14} /> Gloomy</span> },
];

const NoteModal = ({ isOpen, onClose, onSave, onDelete, note = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: 'default',
    mood: 'happy'
  });
  
  const [file, setFile] = useState(null);

  // Dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        color: note.color || 'default',
        mood: note.mood || 'happy'
      });
      setFile(note.file || null);
    } else {
      setFormData({
        title: '',
        content: '',
        color: 'default',
        mood: 'happy'
      });
      setFile(null);
    }
    // Reset position when opened
    setPosition({ x: 0, y: 0 });
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
    if (!formData.title.trim() && !formData.content.trim()) {
      onClose();
      return;
    }
    
    onSave({
      ...note,
      ...formData,
      file: file,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  const handlePointerDown = (e) => {
    if (e.button === 2) { // Right click
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const currentColorValue = COLORS.find(c => c.id === formData.color)?.value || 'var(--card-bg)';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'center' }}>
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
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)', // Removed excessive glow
          transition: isDragging ? 'none' : 'background 0.3s ease',
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'auto'
        }} 
        onClick={e => e.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onContextMenu={e => e.preventDefault()}
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
            style={{ 
              fontSize: '18px', 
              fontWeight: 700,
              boxShadow: 'none', 
              border: '1px solid var(--card-border)',
              background: 'var(--item-bg)'
            }} 
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
              flex: 1,
              boxShadow: 'none', 
              border: '1px solid var(--card-border)',
              background: 'var(--item-bg)'
            }} 
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div className="note-color-picker" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Color:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
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
                      boxShadow: 'none'
                    }}
                  >
                    {formData.color === c.id && <Check size={16} color="var(--text-main)" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="note-mood-picker" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Mood:</span>
              <div style={{ width: '140px' }}>
                <CustomSelect 
                  value={formData.mood} 
                  onChange={(val) => setFormData(prev => ({ ...prev, mood: val }))}
                  options={MOOD_OPTIONS}
                  style={{ background: 'var(--item-bg)', borderRadius: '16px', border: '1px solid var(--card-border)' }}
                  innerStyle={{ padding: '8px 16px', background: 'transparent', boxShadow: 'none' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input 
                type="file" 
                id="note-file" 
                style={{ display: 'none' }} 
                onChange={(e) => setFile(e.target.files[0])} 
              />
              <label htmlFor="note-file" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '14px', fontWeight: 600, background: 'var(--item-bg)', padding: '8px 16px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                <Paperclip size={16} /> {file ? (file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name) : 'Attach File'}
              </label>
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
              style={{ boxShadow: 'none' }}
            >
              Delete Note
            </button>
          ) : (
            <div></div>
          )}
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <button type="button" onClick={onClose} className="pill-btn" style={{ background: 'var(--item-bg)', boxShadow: 'none' }}>Cancel</button>
            <button type="button" onClick={handleSave} className="pill-btn primary" style={{ boxShadow: 'none' }}>Save Note</button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default NoteModal;

