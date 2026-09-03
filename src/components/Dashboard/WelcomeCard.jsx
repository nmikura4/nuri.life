import { useEffect, useState, useMemo } from 'react';
import GlassCard from '../UI/GlassCard';
import { Search, Plus, List, Columns, X, Eye, EyeOff } from 'lucide-react';
import CustomSelect from '../UI/CustomSelect';
import Badge from '../UI/Badge';
import '../UI/UI.css';

const WelcomeCard = ({ 
  user,
  onAddTask, tasksCount = 0, searchQuery, setSearchQuery, 
  viewMode, setViewMode, theme, onThemeChange,
  sortBy, setSortBy, showDone, setShowDone,
  allTasks = [], statuses = []
}) => {
  // Debounce logic
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [notified, setNotified] = useState(false);

  const doneStatus = statuses.length > 0 ? statuses[statuses.length - 1] : 'done';

  const dueTasks = useMemo(() => {
    if (!allTasks) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allTasks.filter(t => {
      if (t.status === doneStatus || !t.deadline) return false;
      const [y, m, d] = t.deadline.split('-');
      const deadlineDate = new Date(y, m - 1, d);
      return deadlineDate <= today;
    });
  }, [allTasks, doneStatus]);

  useEffect(() => {
    if (dueTasks.length > 0 && !notified) {
      if (Notification.permission === 'granted') {
        new Notification('nuri.life', {
          body: `You have ${dueTasks.length} task(s) due today or overdue!`,
          icon: '/favicon.ico'
        });
        setNotified(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('nuri.life', {
              body: `You have ${dueTasks.length} task(s) due today or overdue!`,
              icon: '/favicon.ico'
            });
            setNotified(true);
          }
        });
      }
    }
  }, [dueTasks, notified]);

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
    <GlassCard className="welcome-card-header" style={{
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
      minHeight: 'auto',
      width: '100%',
      overflow: 'visible', /* Changed to visible so track is not clipped */
      zIndex: 10
    }}>
      
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', overflow: 'hidden', zIndex: -1 }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', bottom: 0, left: 0 }} viewBox="0 0 500 200" preserveAspectRatio="none">
          <path d="M0,100 C150,200 350,0 500,100 L500,200 L0,200 Z" fill="var(--accent-blue-wave)" opacity="0.4" />
          <path d="M0,150 C200,50 300,250 500,150 L500,200 L0,200 Z" fill="var(--accent-blue)" opacity="0.3" />
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            {getGreeting()}, {user?.displayName || user?.email?.split('@')[0] || 'User'}
          </h1>
        </div>

        <div className="welcome-search-wrapper" style={{
          background: 'var(--item-bg-hover)',
          borderRadius: '16px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: 'var(--shadow-inner)',
          width: '100%',
          maxWidth: '320px'
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
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="welcome-controls" style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <button className="pill-btn primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', fontSize: '13px' }} onClick={onAddTask}>
          <Plus size={16} /> New Task
        </button>

        {(sortBy !== undefined) && (
          <div className="welcome-filters" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Badge status="todo">{tasksCount} Tasks</Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '160px' }}>
                <CustomSelect 
                  value={sortBy} 
                  onChange={(val) => setSortBy(val)}
                  style={{ padding: '0', boxShadow: 'none', background: 'transparent' }}
                  innerStyle={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px' }}
                  options={[
                    { value: 'created_desc', label: 'Newest First' },
                    { value: 'created_asc', label: 'Oldest First' },
                    { value: 'date_asc', label: 'Nearest Deadline' },
                    { value: 'date_desc', label: 'Furthest Deadline' },
                    { value: 'priority', label: 'Highest Priority' },
                    { value: 'overdue', label: 'Overdue Tasks' }
                  ]}
                />
              </div>
              <button 
                onClick={() => setShowDone(!showDone)}
                className="pill-btn primary"
                style={{ padding: '8px 12px', fontSize: '13px', background: showDone ? 'var(--item-bg-hover)' : 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '20px', minWidth: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {showDone ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
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
