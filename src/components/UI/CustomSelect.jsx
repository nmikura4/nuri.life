import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import './UI.css';

const CustomSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select...', 
  style = {}, 
  innerStyle = {}, 
  menuPlacement = 'auto',
  searchable = false,
  center = false
}) => {
  const isCentered = center || innerStyle?.textAlign === 'center';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  const searchInputRef = useRef(null);
  const [placement, setPlacement] = useState(menuPlacement === 'top' ? 'top' : 'bottom');
  const [maxMenuHeight, setMaxMenuHeight] = useState(260);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom - 16;
        const spaceAbove = rect.top - 16;

        let targetPlacement = menuPlacement;
        if (menuPlacement === 'auto') {
          // If there is adequate space below (at least 180px) or more space below than above, open downwards
          if (spaceBelow >= 180 || spaceBelow >= spaceAbove) {
            targetPlacement = 'bottom';
          } else {
            targetPlacement = 'top';
          }
        }

        setPlacement(targetPlacement);
        const availableSpace = targetPlacement === 'top' ? spaceAbove : spaceBelow;
        setMaxMenuHeight(Math.max(140, Math.min(280, availableSpace)));
      }
    }
  }, [isOpen, menuPlacement, options?.length]);

  useEffect(() => {
    if (isOpen) {
      if (searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      } else if (listRef.current) {
        const selectedEl = listRef.current.querySelector('.custom-select-option.selected');
        if (selectedEl) {
          selectedEl.scrollIntoView({ block: 'nearest' });
        }
      }
    }
  }, [isOpen, searchable]);

  const selectedOption = options?.find(opt => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm.trim()) return options || [];
    const term = searchTerm.toLowerCase();
    return (options || []).filter(opt => 
      opt.label.toLowerCase().includes(term) || 
      String(opt.value).toLowerCase().includes(term)
    );
  }, [options, searchable, searchTerm]);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', ...style }}>
      <div 
        className="neu-input" 
        style={{ 
          display: 'flex', 
          justifyContent: isCentered ? 'center' : 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer', 
          userSelect: 'none',
          padding: '12px 16px',
          position: isCentered ? 'relative' : 'static',
          ...innerStyle 
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isCentered ? 'center' : 'flex-start',
          gap: '8px', 
          minWidth: 0, 
          overflow: 'hidden',
          width: isCentered ? '100%' : 'auto',
          paddingRight: isCentered ? '16px' : '0',
          paddingLeft: isCentered ? (selectedOption?.icon ? '0' : '16px') : '0'
        }}>
          {selectedOption?.icon && (
            <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
              {selectedOption.icon}
            </span>
          )}
          <span style={{ 
            color: 'var(--text-main)', 
            fontSize: innerStyle.fontSize || '14px', 
            fontWeight: 600, 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            textAlign: isCentered ? 'center' : 'inherit'
          }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          color="var(--text-muted)" 
          style={{ 
            transition: 'transform 0.2s ease', 
            flexShrink: 0, 
            marginLeft: isCentered ? '0' : '8px',
            ...(isCentered ? {
              position: 'absolute',
              right: innerStyle.paddingRight || '10px',
              top: '50%',
              transform: isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)'
            } : {
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            })
          }} 
        />
      </div>
      
      {isOpen && (
        <div 
          ref={listRef}
          className={`custom-select-dropdown ${placement === 'top' ? 'top' : ''}`}
          style={{ maxHeight: `${maxMenuHeight}px` }}
        >
          {searchable && (
            <div 
              style={{ 
                padding: '6px 10px', 
                position: 'sticky', 
                top: 0, 
                background: 'var(--solid-card-bg)', 
                zIndex: 10,
                borderBottom: '1px solid var(--card-border)'
              }} 
              onClick={e => e.stopPropagation()}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  className="neu-input" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '6px 10px 6px 30px', 
                    fontSize: '13px', 
                    minHeight: '30px', 
                    boxSizing: 'border-box' 
                  }}
                />
              </div>
            </div>
          )}

          {filteredOptions && filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`custom-select-option ${opt.value === value ? 'selected' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCentered ? 'center' : 'flex-start',
                  gap: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  color: opt.value === value ? 'var(--accent-blue)' : 'var(--text-main)',
                  fontWeight: opt.value === value ? 700 : 500,
                  fontSize: '13px',
                  transition: 'background 0.2s ease',
                  background: opt.value === value ? 'var(--item-bg-hover)' : 'transparent'
                }}
              >
                {opt.icon && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                    {opt.icon}
                  </span>
                )}
                <span>{opt.label}</span>
              </div>
            ))
          ) : (
            <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
