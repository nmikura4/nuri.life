import React, { useState } from 'react';
import GlassCard from '../UI/GlassCard';
import Badge from '../UI/Badge';

const KanbanView = ({ tasks, onEditTask, setTasks, onStatusChange, statuses = [] }) => {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [isDoneCollapsed, setIsDoneCollapsed] = useState(true);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    
    if (onStatusChange) {
      onStatusChange(taskId, newStatus);
    } else {
      setTasks(prev => prev.map(t => 
        t.id.toString() === taskId ? { ...t, status: newStatus } : t
      ));
    }
    setDraggedTaskId(null);
    
    // Auto-expand if dropping into the last column and it's collapsed
    if (statuses.length > 0 && newStatus === statuses[statuses.length - 1] && isDoneCollapsed) {
      setIsDoneCollapsed(false);
    }
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOverCol(null);
  };

  const colors = ['var(--accent-blue)', 'var(--accent-peach)', 'var(--text-muted)', 'var(--accent-coral)', 'var(--accent-pink)'];
  const columns = statuses.map((status, idx) => ({
    id: status,
    title: status,
    color: colors[idx % colors.length]
  }));

  return (
    <div style={{ flex: 1, display: 'flex', gap: '20px', minHeight: 'calc(100vh - 60px)', overflowX: 'auto', paddingBottom: '20px' }}>
      {columns.map(col => {
        const columnTasks = tasks.filter(t => t.status === col.id);
        const isHovered = dragOverCol === col.id;
        const isDoneCol = statuses.length > 0 && col.id === statuses[statuses.length - 1];
        const isCollapsed = isDoneCol && isDoneCollapsed;
        
        return (
          <GlassCard 
            key={col.id}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onClick={() => {
              if (isCollapsed) setIsDoneCollapsed(false);
            }}
            style={{ 
              flex: isCollapsed ? 0 : 1, 
              minWidth: isCollapsed ? '60px' : '320px', 
              padding: isCollapsed ? '20px 10px' : '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              background: isHovered ? 'var(--item-bg)' : 'transparent',
              border: isHovered ? `2px dashed ${col.color}` : '2px solid transparent',
              transition: 'all 0.3s ease',
              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
              alignItems: isCollapsed ? 'center' : 'stretch',
              cursor: isCollapsed ? 'pointer' : 'default'
            }}
          >
            {isCollapsed ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: '20px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: col.color, boxShadow: 'var(--shadow-soft)' }}></div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', flex: 1, textAlign: 'center', letterSpacing: '2px', whiteSpace: 'nowrap' }}>
                  {col.title} <span style={{opacity: 0.5}}>({columnTasks.length})</span>
                </h3>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: col.color, boxShadow: 'var(--shadow-soft)' }}></div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{col.title}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge>{columnTasks.length}</Badge>
                    {isDoneCol && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsDoneCollapsed(true); }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                        title="Collapse Column"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                  {columnTasks.map(task => {
                    const isDragging = draggedTaskId === task.id;
                    
                    return (
                      <div 
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                        style={{
                          background: 'var(--card-bg)',
                          padding: '16px',
                          borderRadius: '16px',
                          boxShadow: 'var(--shadow-soft)',
                          cursor: isDragging ? 'grab' : 'pointer',
                          opacity: isDragging ? 0.4 : 1,
                          border: '1px solid var(--card-border)',
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          if(!draggedTaskId) e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ position: 'absolute', top: '16px', right: '16px', opacity: 0.3, cursor: 'grab' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle>
                            <circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle>
                          </svg>
                        </div>

                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px', paddingRight: '20px', textDecoration: (statuses.length > 0 && task.status === statuses[statuses.length - 1]) ? 'line-through' : 'none' }}>
                          {task.title}
                        </h4>
                        
                        {task.project && (
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-blue)', display: 'block', marginBottom: '8px' }}>
                            #{task.project}
                          </span>
                        )}
                        
                        {task.recurrence && task.recurrence !== 'none' && (
                          <div style={{ fontSize: '11px', color: 'var(--accent-coral)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
                            <span style={{ textTransform: 'capitalize' }}>{task.recurrence}</span>
                          </div>
                        )}
                        
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                            Subtasks: {task.subtasks.filter(s => s.isCompleted).length} / {task.subtasks.length}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                          {task.deadline && (() => {
                            const [y, m, d] = task.deadline.split('-');
                            const deadlineDate = new Date(y, m - 1, d);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const isOverdue = deadlineDate < today;
                            return (
                              <span style={{ fontSize: '11px', color: isOverdue ? 'var(--accent-coral)' : 'var(--text-muted)' }}>
                                {deadlineDate.toLocaleDateString()}
                              </span>
                            );
                          })()}
                          <Badge priority={task.priority}>{task.priority}</Badge>
                        </div>
                      </div>
                    );
                  })}
                  
                  {columnTasks.length === 0 && (
                    <div style={{ 
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      color: 'var(--text-muted)', fontSize: '13px', 
                      border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '16px',
                      background: isHovered ? 'rgba(0,0,0,0.02)' : 'transparent'
                    }}>
                      Drop tasks here
                    </div>
                  )}
                </div>
              </>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
};

export default KanbanView;
