import React, { useState, useMemo } from 'react';
import { X, Search, Tag, Check } from 'lucide-react';
import GlassCard from '../UI/GlassCard';
import { ICON_OPTIONS } from '../Settings/icons';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import '../UI/UI.css';

const CategoryPickerModal = ({
  isOpen,
  onClose,
  title = 'Выберите категорию',
  options = [],
  selectedId = '',
  onSelect,
  showTypeSwitch = false,
  type = 'expense',
  onTypeChange = null,
  placeholder = 'Поиск...'
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEscapeKey(onClose);

  const getIconComponent = (iconName) => {
    return ICON_OPTIONS.find(i => i.name === iconName)?.icon || Tag;
  };

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }
    const query = searchQuery.toLowerCase().trim();
    return options.filter(opt => opt.name?.toLowerCase().includes(query));
  }, [options, searchQuery]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay category-picker-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{ zIndex: 1100 }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          width: '100%',
          maxWidth: '560px',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {title ? (
                <h2 style={{ fontSize: '19px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  {title}
                </h2>
              ) : null}
              {showTypeSwitch && (
                <div style={{ display: 'flex', gap: '4px', background: 'var(--item-bg)', padding: '4px', borderRadius: '20px' }}>
                  <button 
                    type="button" 
                    onClick={() => onTypeChange && onTypeChange('expense')}
                    style={{ 
                      padding: '5px 12px', 
                      borderRadius: '16px', 
                      border: 'none', 
                      cursor: 'pointer', 
                      background: type === 'expense' ? 'var(--solid-card-bg)' : 'transparent', 
                      fontWeight: type === 'expense' ? 700 : 500, 
                      fontSize: '12px', 
                      color: type === 'expense' ? 'var(--accent-coral)' : 'var(--text-main)', 
                      boxShadow: type === 'expense' ? 'var(--shadow-soft)' : 'none', 
                      transition: 'all 0.2s ease' 
                    }}
                  >
                    Расход
                  </button>
                  <button 
                    type="button" 
                    onClick={() => onTypeChange && onTypeChange('income')}
                    style={{ 
                      padding: '5px 12px', 
                      borderRadius: '16px', 
                      border: 'none', 
                      cursor: 'pointer', 
                      background: type === 'income' ? 'var(--solid-card-bg)' : 'transparent', 
                      fontWeight: type === 'income' ? 700 : 500, 
                      fontSize: '12px', 
                      color: type === 'income' ? 'var(--accent-blue)' : 'var(--text-main)', 
                      boxShadow: type === 'income' ? 'var(--shadow-soft)' : 'none', 
                      transition: 'all 0.2s ease' 
                    }}
                  >
                    Доход
                  </button>
                </div>
              )}
            </div>

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

          {/* Search */}
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
              placeholder={placeholder}
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

          {/* Options Grid */}
          <div 
            style={{ 
              overflowY: 'auto', 
              paddingRight: '4px',
              marginRight: '-4px',
              maxHeight: 'calc(85vh - 170px)'
            }}
          >
            {filteredOptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0' }}>
                  Ничего не найдено
                </p>
                <p style={{ fontSize: '12px', margin: 0 }}>
                  Попробуйте изменить поисковый запрос
                </p>
              </div>
            ) : (
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                  gap: '10px' 
                }}
              >
                {filteredOptions.map(opt => {
                  const isSelected = selectedId === opt.id;
                  const IconComp = getIconComponent(opt.iconName);

                  return (
                    <div 
                      key={opt.id || 'none-option'}
                      onClick={() => {
                        onSelect(opt.id, opt);
                        onClose();
                      }}
                      className="category-picker-card"
                      style={{
                        background: isSelected ? 'var(--item-bg)' : 'var(--card-bg)',
                        borderRadius: '14px',
                        padding: '12px 14px',
                        boxShadow: isSelected ? 'var(--shadow-inner)' : 'var(--shadow-soft)',
                        border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--card-border)',
                        cursor: 'pointer',
                        userSelect: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div 
                          style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '10px', 
                            background: isSelected ? 'var(--accent-blue)' : 'var(--item-bg-hover)', 
                            color: isSelected ? '#ffffff' : (type === 'expense' ? 'var(--accent-coral)' : 'var(--accent-blue)'),
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: isSelected ? '0 3px 8px rgba(74, 137, 220, 0.3)' : 'var(--shadow-soft)'
                          }}
                        >
                          <IconComp size={18} />
                        </div>

                        <span style={{ 
                          fontWeight: isSelected ? 700 : 600, 
                          fontSize: '14px', 
                          color: 'var(--text-main)', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis' 
                        }}>
                          {opt.name}
                        </span>
                      </div>

                      {isSelected && (
                        <div style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          background: 'var(--accent-blue)', 
                          color: 'white', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Check size={12} />
                        </div>
                      )}
                    </div>
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

export default CategoryPickerModal;
