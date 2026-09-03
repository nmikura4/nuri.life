import React, { useState, useMemo } from 'react';
import { X, Search, Tag } from 'lucide-react';
import GlassCard from './GlassCard';
import { ICON_OPTIONS } from '../Settings/icons';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import './UI.css';

const IconPickerModal = ({
  isOpen,
  onClose,
  selectedIcon = 'Tag',
  onSelect,
  title = 'Выберите иконку'
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEscapeKey(onClose);

  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return ICON_OPTIONS;
    }
    const q = searchQuery.toLowerCase().trim();
    return ICON_OPTIONS.filter(opt => opt.name.toLowerCase().includes(q));
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{ zIndex: 1200, padding: '20px' }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          width: '100%',
          maxWidth: '520px',
          margin: 'auto',
          animation: 'modalScaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <GlassCard 
          className="responsive-card" 
          style={{ 
            padding: '24px', 
            position: 'relative', 
            background: 'var(--solid-card-bg)', 
            maxHeight: '85vh', 
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-modal)',
            border: '1px solid var(--card-border)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              {title}
            </h3>
            <button 
              type="button" 
              onClick={onClose} 
              className="neu-icon-btn"
              style={{ width: '34px', height: '34px', borderRadius: '50%', color: 'var(--text-muted)' }}
              title="Закрыть"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }} 
            />
            <input 
              type="text"
              className="neu-input"
              placeholder="Поиск иконки..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', 
                paddingLeft: '42px', 
                paddingRight: searchQuery ? '36px' : '14px', 
                fontSize: '14px',
                height: '42px',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Icons Grid */}
          <div 
            style={{ 
              overflowY: 'auto', 
              paddingRight: '4px',
              marginRight: '-4px',
              maxHeight: 'calc(85vh - 170px)'
            }}
          >
            {filteredIcons.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0' }}>
                  Ничего не найдено
                </p>
                <p style={{ fontSize: '12px', margin: 0 }}>
                  Попробуйте другой запрос
                </p>
              </div>
            ) : (
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))', 
                  gap: '10px',
                  padding: '4px'
                }}
              >
                {filteredIcons.map(opt => {
                  const IconComponent = opt.icon;
                  const isSelected = selectedIcon === opt.name;

                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => {
                        onSelect(opt.name);
                        onClose();
                      }}
                      className={`neu-icon-btn ${isSelected ? 'selected' : ''}`}
                      style={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        height: 'auto',
                        minHeight: '44px',
                        borderRadius: '12px',
                        background: isSelected ? 'var(--item-bg)' : 'var(--card-bg)',
                        color: isSelected ? 'var(--accent-blue)' : 'var(--text-main)',
                        boxShadow: isSelected ? 'var(--shadow-inner)' : 'var(--shadow-soft)',
                        border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--card-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.18s ease'
                      }}
                      title={opt.name}
                    >
                      <IconComponent size={20} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default IconPickerModal;
