import React, { useEffect, useState } from 'react';
import GlassCard from '../UI/GlassCard';
import CornerThemeSwitcher from '../UI/CornerThemeSwitcher';
import { Search, Plus, List, Columns, X, Eye, EyeOff } from 'lucide-react';
import CustomSelect from '../UI/CustomSelect';
import Badge from '../UI/Badge';
import '../UI/UI.css';

const WelcomeCard = ({ 
  onAddTask, tasksCount = 0, searchQuery, setSearchQuery, 
  viewMode, setViewMode, theme, onThemeChange,
  sortBy, setSortBy, showDone, setShowDone 
}) => {
  // Debounce logic
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 250); // 250ms debounce
    return () => clearTimeout(handler);
  }, [localSearch, setSearchQuery]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    if (hour >= 18 && hour < 22) return 'Good evening';
    return 'Good night';
  };

  return (
    <GlassCard style={{
      padding: '24px 30px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
      minHeight: '160px',
      overflow: 'visible', /* Changed to visible so track is not clipped */
      zIndex: 10
    }}>
      <CornerThemeSwitcher theme={theme} onChange={onThemeChange} />
      
      <svg width="100%" height="100%" style={{ position: 'absolute', bottom: 0, left: 0, zIndex: -1 }} viewBox="0 0 500 200" preserveAspectRatio="none">
        <path d="M0,100 C150,200 350,0 500,100 L500,200 L0,200 Z" fill="var(--accent-blue-wave)" opacity="0.4" />
        <path d="M0,150 C200,50 300,250 500,150 L500,200 L0,200 Z" fill="var(--accent-blue)" opacity="0.3" />
      </svg>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            {getGreeting()}, Mika
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>You have {tasksCount} tasks for today. Let's get things done!</p>
        </div>
        
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{
          background: 'var(--item-bg-hover)',
          borderRadius: '16px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: 'var(--shadow-inner)',
          flex: 1,
          maxWidth: '350px'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            className="welcome-search-input"
            placeholder="Search tasks, projects, tags..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: '13px',
              color: 'var(--text-main)',
              width: '100%'
            }}
          />
          {localSearch && (
            <button 
              onClick={() => setLocalSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '2px' }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button className="pill-btn primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', fontSize: '13px' }} onClick={onAddTask}>
          <Plus size={16} /> New Task
        </button>

        {(sortBy !== undefined) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Tasks</h2>
              <Badge status="todo">{tasksCount} Tasks</Badge>
            </div>

            <div style={{ width: '180px' }}>
              <CustomSelect 
                value={sortBy} 
                onChange={setSortBy}
                style={{ padding: '0', boxShadow: 'none', background: 'transparent' }}
                innerStyle={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px' }}
                options={[
                  { value: 'date_asc', label: 'Nearest Deadline' },
                  { value: 'date_desc', label: 'Furthest Deadline' },
                  { value: 'priority', label: 'Highest Priority' },
                  { value: 'overdue', label: 'Overdue Tasks' }
                ]}
              />
            </div>

            <button 
              onClick={() => setShowDone(!showDone)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: showDone ? 'var(--accent-blue)' : 'var(--card-bg)',
                color: showDone ? '#fff' : 'var(--text-main)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: showDone ? 'var(--shadow-inner)' : 'var(--shadow-soft)',
                transition: 'all 0.2s ease'
              }}
            >
              {showDone ? <Eye size={16} /> : <EyeOff size={16} />}
              Done
            </button>
          </div>
        )}

        {setViewMode && (
          <div style={{ marginLeft: sortBy !== undefined ? '0' : 'auto', display: 'flex', background: 'var(--item-bg)', borderRadius: '16px', padding: '4px', boxShadow: 'var(--shadow-inner)' }}>
            <button 
              onClick={() => setViewMode('list')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', border: 'none', borderRadius: '12px', cursor: 'pointer',
                background: viewMode === 'list' ? 'var(--card-bg)' : 'transparent',
                color: viewMode === 'list' ? 'var(--accent-blue)' : 'var(--text-muted)',
                boxShadow: viewMode === 'list' ? 'var(--shadow-soft)' : 'none',
                fontWeight: 600, fontSize: '13px', transition: 'all 0.2s'
              }}>
              <List size={16} /> List
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', border: 'none', borderRadius: '12px', cursor: 'pointer',
                background: viewMode === 'kanban' ? 'var(--card-bg)' : 'transparent',
                color: viewMode === 'kanban' ? 'var(--accent-blue)' : 'var(--text-muted)',
                boxShadow: viewMode === 'kanban' ? 'var(--shadow-soft)' : 'none',
                fontWeight: 600, fontSize: '13px', transition: 'all 0.2s'
              }}>
              <Columns size={16} /> Board
            </button>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default WelcomeCard;
