import { useState } from 'react';
import GlassCard from '../UI/GlassCard';
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react';
import '../UI/UI.css';
import FinanceCategoriesManager from './FinanceCategoriesManager';

const ListManager = ({ title, items, setItems, onRename, onDelete, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (newItem.trim() && !items.includes(newItem.trim())) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setEditValue(item);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditValue('');
  };

  const saveEdit = (oldName) => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== oldName) {
      if (!items.includes(trimmed)) {
        onRename(oldName, trimmed);
      }
    }
    setEditingItem(null);
  };

  const moveItem = (index, direction) => {
    const newItems = [...items];
    if (direction === 'up' && index > 0) {
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      setItems(newItems);
    } else if (direction === 'down' && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      setItems(newItems);
    }
  };

  return (
    <div style={{ background: 'var(--item-bg)', padding: '20px 30px', borderRadius: '24px', boxShadow: 'var(--shadow-soft)' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{title}</h2>
        <button style={{ background: 'none', border: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {isOpen && (
        <div style={{ marginTop: '20px' }}>
          <form className="settings-item" onSubmit={handleAdd} style={{ display: 'flex', gap: '16px', marginBottom: '30px' }}>
        <input 
          type="text" 
          className="neu-input" 
          placeholder={placeholder} 
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="pill-btn primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No items available.</p>
        ) : (
          items.map((item, index) => (
            <div className="settings-item" key={item} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--item-bg-hover)', padding: '16px 20px', borderRadius: '16px',
              boxShadow: 'var(--shadow-inner)'
            }}>
              {editingItem === item ? (
                <div style={{ display: 'flex', gap: '12px', flex: 1, marginRight: '16px' }}>
                  <input 
                    type="text" 
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(item); if (e.key === 'Escape') cancelEdit(); }}
                    className="neu-input"
                    style={{ flex: 1, padding: '8px 12px' }}
                    autoFocus
                  />
                  <button onClick={() => saveEdit(item)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center' }}>
                    <Check size={20} />
                  </button>
                  <button onClick={cancelEdit} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center' }}>
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <>
                  <span style={{ fontWeight: 600 }}>{item}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      style={{ background: 'none', border: 'none', color: index === 0 ? 'transparent' : 'var(--text-muted)', cursor: index === 0 ? 'default' : 'pointer', padding: '10px', display: 'flex', alignItems: 'center' }}
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button 
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1}
                      style={{ background: 'none', border: 'none', color: index === items.length - 1 ? 'transparent' : 'var(--text-muted)', cursor: index === items.length - 1 ? 'default' : 'pointer', padding: '10px', display: 'flex', alignItems: 'center' }}
                    >
                      <ArrowDown size={18} />
                    </button>
                    <button 
                      onClick={() => startEdit(item)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center' }}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => { if (window.confirm(`Delete "${item}"?`)) onDelete(item); }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-coral)', cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
            ))
          )}
        </div>
      </div>
      )}
    </div>
  );
};

const SettingsView = ({ 
  projects, setProjects, onRenameProject, onDeleteProject,
  priorities, setPriorities, onRenamePriority, onDeletePriority,
  statuses, setStatuses, onRenameStatus, onDeleteStatus,
  avatarUrl, setAvatarUrl
}) => {

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Сжимаем изображение через canvas, чтобы не превысить лимит Firestore (1MB)
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = 200; // 200x200 — достаточно для аватарки
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          // Обрезаем по центру (квадрат)
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          setAvatarUrl(compressed);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
  };

  const [activeSettingsTab, setActiveSettingsTab] = useState('general');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', paddingRight: '10px' }}>
      <GlassCard className="responsive-card" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700 }}>Settings</h1>
          <div style={{ display: 'flex', gap: '10px', background: 'var(--item-bg)', padding: '5px', borderRadius: '20px', boxShadow: 'var(--shadow-inner)' }}>
            <button 
              onClick={() => setActiveSettingsTab('general')}
              style={{ padding: '8px 16px', borderRadius: '16px', border: 'none', cursor: 'pointer', background: activeSettingsTab === 'general' ? 'var(--solid-card-bg)' : 'transparent', fontWeight: activeSettingsTab === 'general' ? 600 : 400, color: 'var(--text-main)', boxShadow: activeSettingsTab === 'general' ? 'var(--shadow-card)' : 'none', transition: 'all 0.3s ease' }}
            >
              General
            </button>
            <button 
              onClick={() => setActiveSettingsTab('finances')}
              style={{ padding: '8px 16px', borderRadius: '16px', border: 'none', cursor: 'pointer', background: activeSettingsTab === 'finances' ? 'var(--solid-card-bg)' : 'transparent', fontWeight: activeSettingsTab === 'finances' ? 600 : 400, color: 'var(--text-main)', boxShadow: activeSettingsTab === 'finances' ? 'var(--shadow-card)' : 'none', transition: 'all 0.3s ease' }}
            >
              Finances
            </button>
          </div>
        </div>
        
        {activeSettingsTab === 'general' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ background: 'var(--item-bg)', padding: '20px 30px', borderRadius: '24px', boxShadow: 'var(--shadow-soft)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Profile Avatar</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', boxShadow: 'var(--shadow-inner)' }} />
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-coral)', boxShadow: 'var(--shadow-inner)' }}></div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label className="pill-btn primary" style={{ cursor: 'pointer', textAlign: 'center', padding: '8px 16px', fontSize: '13px' }}>
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                </label>
                {avatarUrl && (
                  <button onClick={handleRemoveAvatar} className="pill-btn danger" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <ListManager 
            title="Manage Projects" 
            items={projects} setItems={setProjects} onRename={onRenameProject} onDelete={onDeleteProject} 
            placeholder="Enter new project name..." 
          />
          <ListManager 
            title="Manage Priorities" 
            items={priorities} setItems={setPriorities} onRename={onRenamePriority} onDelete={onDeletePriority} 
            placeholder="Enter new priority name (e.g. Urgent)..." 
          />
          <ListManager 
            title="Manage Statuses" 
            items={statuses} setItems={setStatuses} onRename={onRenameStatus} onDelete={onDeleteStatus} 
            placeholder="Enter new status (e.g. Review)..." 
          />
        </div>
        ) : (
          <FinanceCategoriesManager />
        )}
      </GlassCard>
    </div>
  );
};

export default SettingsView;
