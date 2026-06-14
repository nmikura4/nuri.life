import { useState, useEffect } from 'react';
import GlassCard from '../UI/GlassCard';
import CustomSelect from '../UI/CustomSelect';
import { X, Check, Paperclip, Smile, Meh, Frown, Zap, Coffee, CloudRain, Tag as TagIcon } from 'lucide-react';
import { Tldraw, DefaultSizeStyle, DefaultStylePanel, iconTypes } from 'tldraw';
import 'tldraw/tldraw.css';
import '../UI/UI.css';

let globalEditor = null;
let globalBgPattern = 'none';

const customAssetUrls = {
  icons: Object.fromEntries(
    iconTypes.map(name => [name, `/tldraw/0_merged.svg#${name}`])
  )
};

const CustomGrid = ({ x, y, z, size }) => {
  const patternType = globalBgPattern || 'none';
  if (patternType === 'none') return null;

  const baseSize = patternType === 'lines' ? 36 : (patternType === 'grid' ? 30 : 24);
  const s = baseSize * z;
  
  const xo = 0.5 + x * z;
  const yo = 0.5 + y * z;
  const gxo = xo > 0 ? xo % s : s + (xo % s);
  const gyo = yo > 0 ? yo % s : s + (yo % s);

  const strokeColor = 'rgba(0, 0, 0, 0.08)'; 
  const id = `custom-grid-pattern`;

  return (
    <svg className="tl-grid" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <defs>
        <pattern id={id} width={s} height={s} patternUnits="userSpaceOnUse">
          {patternType === 'dots' && <circle cx={gxo} cy={gyo} r={1.5} fill={strokeColor} />}
          {patternType === 'lines' && <line x1={0} y1={gyo} x2={s} y2={gyo} stroke={strokeColor} strokeWidth={1.5} />}
          {patternType === 'grid' && (
            <>
              <line x1={gxo} y1={0} x2={gxo} y2={s} stroke={strokeColor} strokeWidth={1.5} />
              <line x1={0} y1={gyo} x2={s} y2={gyo} stroke={strokeColor} strokeWidth={1.5} />
            </>
          )}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
};

const CustomStylePanel = (props) => {
  const [size, setSize] = useState(() => localStorage.getItem('tldraw_pen_size') || '2');

  const handleChange = (e) => {
    const val = e.target.value;
    setSize(val);
    localStorage.setItem('tldraw_pen_size', val);
    if (globalEditor) {
      const sizes = ['s', 'm', 'l', 'xl', 'xl'];
      const sizeValue = sizes[parseInt(val, 10) - 1] || 's';
      globalEditor.setStyleForNextShapes(DefaultSizeStyle, sizeValue);
      globalEditor.setStyleForSelectedShapes(DefaultSizeStyle, sizeValue);
    }
  };

  const sliderPercentage = ((size - 1) / 4) * 100;

  return (
    <div className="custom-tldraw-panel-wrapper" style={{ display: 'flex', flexDirection: 'column', pointerEvents: 'all' }}>
      <div className="custom-tldraw-panel" style={{ 
        background: 'var(--color-panel)', 
        borderRadius: 'var(--radius-4)', 
        boxShadow: 'var(--shadow-2)',
        border: '1px solid var(--color-divider)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <DefaultStylePanel {...props} />
        
        <div style={{ height: '1px', background: 'var(--color-divider)', margin: '0 12px' }}></div>
        
        <div style={{ 
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--color-text-1)', fontWeight: 600 }}>
            <span>Thickness</span>
            <span style={{ background: 'var(--color-background-1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--color-divider)' }}>
              {size}
            </span>
          </div>
          <input 
            type="range" 
            min="1" max="5" step="1" 
            value={size} 
            onChange={handleChange} 
            className="tldraw-like-slider"
            style={{ 
              '--slider-percent': `${sliderPercentage}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

const COLORS = [
  { id: 'default', value: 'transparent', label: 'Default' },
  { id: 'blue', value: 'rgba(111, 168, 220, 0.2)', label: 'Blue' },
  { id: 'peach', value: 'rgba(244, 194, 194, 0.2)', label: 'Peach' },
  { id: 'green', value: 'rgba(143, 185, 168, 0.2)', label: 'Green' },
  { id: 'yellow', value: 'rgba(255, 230, 153, 0.2)', label: 'Yellow' },
  { id: 'lavender', value: 'rgba(182, 168, 220, 0.2)', label: 'Lavender' },
  { id: 'mint', value: 'rgba(168, 220, 182, 0.2)', label: 'Mint' },
  { id: 'gray', value: 'rgba(150, 150, 150, 0.2)', label: 'Gray' }
];

const COLOR_OPTIONS = COLORS.map(c => ({
  value: c.id,
  label: (
    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ 
        width: '14px', height: '14px', borderRadius: '50%', 
        background: c.value === 'transparent' ? 'var(--text-muted)' : c.value,
      }}></span> 
      {c.label}
    </span>
  )
}));

const MOOD_OPTIONS = [
  { value: 'happy', label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Smile size={14} /> Happy</span> },
  { value: 'neutral', label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Meh size={14} /> Neutral</span> },
  { value: 'sad', label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Frown size={14} /> Sad</span> },
  { value: 'energetic', label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={14} /> Energetic</span> },
  { value: 'relaxed', label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Coffee size={14} /> Relaxed</span> },
  { value: 'gloomy', label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CloudRain size={14} /> Gloomy</span> },
];

const NoteModal = ({ isOpen, onClose, onSave, onDelete, note = null, tasks = [], onOpenTask, zIndex }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: 'default',
    mood: 'neutral',
    tags: [],
    linkedTasks: [],
    type: 'text',
    strokeColor: '#000000'
  });
  
  const [file, setFile] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [editor, setEditor] = useState(null);

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
        mood: note.mood || 'neutral',
        tags: note.tags || [],
        linkedTasks: note.linkedTasks || [],
        type: note.type || 'text',
        strokeColor: note.strokeColor || '#000000',
        canvasBg: note.canvasBg || '#ffffff',
        bgPattern: note.bgPattern || 'none'
      });
      globalBgPattern = note.bgPattern || 'none';
      setFile(note.file || null);
    } else {
      setFormData({
        title: '',
        content: '',
        color: 'default',
        mood: 'neutral',
        tags: [],
        linkedTasks: [],
        type: 'text',
        strokeColor: '#000000',
        canvasBg: '#ffffff',
        bgPattern: 'none'
      });
      globalBgPattern = 'none';
      setFile(null);
    }
    // Reset position when opened
    setPosition({ x: 0, y: 0 });
  }, [note, isOpen]);

  const handleMount = (editorInstance) => {
    setEditor(editorInstance);
    globalEditor = editorInstance;

    const savedSize = localStorage.getItem('tldraw_pen_size') || '2';
    const sizes = ['s', 'm', 'l', 'xl'];
    const sizeValue = sizes[parseInt(savedSize, 10) - 1] || 's';
    editorInstance.setStyleForNextShapes(DefaultSizeStyle, sizeValue);
    // Grid toggling via updateInstanceState
    const isGrid = globalBgPattern !== 'none';
    if (editorInstance) {
      if (typeof editorInstance.updateInstanceState === 'function') {
        try { editorInstance.updateInstanceState({ isGridMode: isGrid }); } catch (e) {}
      }
      if (typeof editorInstance.setGridMode === 'function') {
        try { editorInstance.setGridMode(isGrid); } catch (e) {}
      }
    }

    if (note?.tldrawSnapshot) {
      try {
        editorInstance.store.loadSnapshot(note.tldrawSnapshot);
      } catch (e) {
        console.error("Failed to load tldraw snapshot", e);
      }
    }
  };



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

  const handleSave = async () => {
    if (!formData.title.trim() && !formData.content.trim() && formData.type !== 'drawing') {
      onClose();
      return;
    }
    
    let canvasImage = note?.canvasImage || null;
    let tldrawSnapshot = note?.tldrawSnapshot || null;

    if (formData.type === 'drawing' && editor) {
      try {
        tldrawSnapshot = editor.store.getSnapshot();
        const shapeIds = Array.from(editor.getCurrentPageShapeIds());
        
        if (shapeIds.length > 0) {
          const { blob } = await editor.toImage(shapeIds, { format: 'png' });
          const base64data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => resolve(reader.result);
          });
          canvasImage = base64data;
        } else {
          canvasImage = null;
        }
      } catch (e) {
        console.error("Canvas export failed", e);
      }
    }

    const finalTags = [...formData.tags];
    if (tagInput.trim() && !finalTags.includes(tagInput.trim())) {
      finalTags.push(tagInput.trim());
    }
    
    onSave({
      ...note,
      ...formData,
      tags: finalTags,
      file: file,
      canvasImage,
      tldrawSnapshot,
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

  const currentColorValue = COLORS.find(c => c.id === formData.color)?.value || 'transparent';

  if (formData.type === 'drawing') {
    return (
      <div className="drawing-modal-container" style={{ background: 'var(--bg-main)' }}>
        <div className="drawing-modal-header">
          <input 
            type="text" 
            name="title" 
            placeholder="Drawing Title..." 
            value={formData.title} 
            onChange={handleChange} 
            style={{ border: 'none', background: 'transparent', fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', outline: 'none', flex: '1 1 200px' }}
          />
          <div className="drawing-modal-controls">
            <div className="drawing-modal-options">
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Background:</span>
              <button type="button" onClick={() => setFormData(p => ({...p, canvasBg: '#ffffff'}))} style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#ffffff', border: formData.canvasBg === '#ffffff' ? '2px solid var(--accent-blue)' : '1px solid #ddd', cursor: 'pointer', transition: 'all 0.2s' }} title="White"></button>
              <button type="button" onClick={() => setFormData(p => ({...p, canvasBg: '#fffdf0'}))} style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fffdf0', border: formData.canvasBg === '#fffdf0' ? '2px solid var(--accent-blue)' : '1px solid #ddd', cursor: 'pointer', transition: 'all 0.2s' }} title="Paper"></button>
              <button type="button" onClick={() => setFormData(p => ({...p, canvasBg: '#f0f8ff'}))} style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f0f8ff', border: formData.canvasBg === '#f0f8ff' ? '2px solid var(--accent-blue)' : '1px solid #ddd', cursor: 'pointer', transition: 'all 0.2s' }} title="Light Blue"></button>
              <button type="button" onClick={() => setFormData(p => ({...p, canvasBg: '#f0fff4'}))} style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f0fff4', border: formData.canvasBg === '#f0fff4' ? '2px solid var(--accent-blue)' : '1px solid #ddd', cursor: 'pointer', transition: 'all 0.2s' }} title="Mint"></button>
            </div>
            
            <div className="drawing-modal-options">
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Pattern:</span>
              <select 
                value={formData.bgPattern || 'none'} 
                onChange={(e) => {
                  const pat = e.target.value;
                  setFormData(p => ({...p, bgPattern: pat}));
                  globalBgPattern = pat;
                  // Pattern change triggers grid mode toggle
                  const isGrid = pat !== 'none';
                  if (globalEditor) {
                    if (typeof globalEditor.updateInstanceState === 'function') {
                      try { globalEditor.updateInstanceState({ isGridMode: isGrid }); } catch (e) {}
                    }
                    if (typeof globalEditor.setGridMode === 'function') {
                      try { globalEditor.setGridMode(isGrid); } catch (e) {}
                    }
                  }
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="none">None</option>
                <option value="dots">Dots</option>
                <option value="lines">Lines</option>
                <option value="grid">Grid</option>
              </select>
            </div>

            <div className="drawing-modal-actions">
              {note && (
                <button 
                  type="button" 
                  onClick={() => {
                    if(window.confirm('Delete this drawing?')) {
                      onDelete(note.id);
                      onClose();
                    }
                  }} 
                  className="pill-btn danger"
                >
                  Delete
                </button>
              )}
              <button type="button" onClick={onClose} className="pill-btn">Cancel</button>
              <button type="button" onClick={handleSave} className="pill-btn primary">Save & Exit</button>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative', touchAction: 'none', background: formData.canvasBg || '#ffffff', transition: 'background 0.3s ease' }}>
          <Tldraw onMount={handleMount} components={{ StylePanel: CustomStylePanel, Grid: CustomGrid }} assetUrls={customAssetUrls} />
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'center', zIndex }}>
      <GlassCard 
        style={{ 
          width: '100%', 
          maxWidth: '600px', 
          position: 'relative', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          padding: '30px',
          background: `linear-gradient(${currentColorValue}, ${currentColorValue}), var(--solid-card-bg)`,
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
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
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Note Title</label>
            <input 
              type="text" 
              name="title" 
              placeholder="What's on your mind?" 
              value={formData.title} 
              onChange={handleChange} 
              className="neu-input" 
              autoFocus
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Content</label>
            <textarea 
              name="content" 
              placeholder="Type your thoughts here..." 
              value={formData.content} 
              onChange={handleChange} 
              className="neu-textarea" 
              style={{ minHeight: '200px', resize: 'vertical' }} 
            />
          </div>

          <div className="responsive-grid-2">
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Color</label>
              <CustomSelect 
                value={formData.color} 
                onChange={(val) => setFormData(prev => ({...prev, color: val}))}
                options={COLOR_OPTIONS}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Mood</label>
              <CustomSelect 
                value={formData.mood} 
                onChange={(val) => setFormData(prev => ({ ...prev, mood: val }))}
                options={MOOD_OPTIONS}
              />
            </div>
          </div>

          <div className="responsive-grid-2">
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Attachment</label>
              <div className="neu-input" style={{ display: 'flex', alignItems: 'center', minHeight: '44px', padding: '0 16px' }}>
                <input 
                  type="file" 
                  id="note-file" 
                  style={{ display: 'none' }} 
                  onChange={(e) => setFile(e.target.files[0])} 
                />
                <label htmlFor="note-file" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '14px', width: '100%', margin: 0 }}>
                  <Paperclip size={16} /> {file ? (file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name) : 'Attach File'}
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Tags (Press Enter)</label>
              <div className="neu-input" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px 16px', minHeight: '44px', alignItems: 'center' }}>
                {formData.tags.map(tag => (
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
                  placeholder={formData.tags.length === 0 ? "Add tags..." : ""}
                  style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, minWidth: '80px', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Linked Tasks</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formData.linkedTasks.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {formData.linkedTasks.map(taskId => {
                    const linkedTask = tasks.find(t => t.id === taskId);
                    if (!linkedTask) return null;
                    return (
                      <span key={taskId} style={{ background: 'var(--item-bg)', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span 
                          style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => onOpenTask && onOpenTask(taskId)}
                        >
                          {linkedTask.title || 'Untitled Task'}
                        </span>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, linkedTasks: prev.linkedTasks.filter(id => id !== taskId) }))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><X size={12} /></button>
                      </span>
                    );
                  })}
                </div>
              )}
              <select 
                className="neu-select"
                value=""
                onChange={(e) => {
                  if (e.target.value && !formData.linkedTasks.includes(e.target.value)) {
                    setFormData(prev => ({ ...prev, linkedTasks: [...prev.linkedTasks, e.target.value] }));
                  }
                }}
                style={{ width: '100%', boxSizing: 'border-box', appearance: 'none', cursor: 'pointer' }}
              >
                <option value="" disabled>Attach a task...</option>
                {tasks.filter(t => !formData.linkedTasks.includes(t.id)).map(t => (
                  <option key={t.id} value={t.id}>{t.title || 'Untitled Task'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '15px' }}>
          {note && (
            <button 
              type="button" 
              onClick={() => {
                if(window.confirm('Delete this note?')) {
                  onDelete(note.id);
                  onClose();
                }
              }} 
              className="pill-btn danger"
              style={{ marginRight: 'auto' }}
            >
              Delete Note
            </button>
          )}
          
          <button type="button" onClick={onClose} className="pill-btn">Cancel</button>
          <button type="button" onClick={handleSave} className="pill-btn primary">Save Note</button>
        </div>
      </GlassCard>
    </div>
  );
};

export default NoteModal;
