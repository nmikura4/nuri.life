import { useState, useMemo, useEffect } from 'react';
import { 
  DndContext, 
  useDroppable, 
  DragOverlay, 
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor 
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GlassCard from '../UI/GlassCard';
import Badge from '../UI/Badge';

const DraggableTask = ({ task, onEditTask, statuses }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'Task', task }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    background: 'var(--card-bg)',
    padding: '16px',
    borderRadius: '16px',
    boxShadow: isDragging ? 'var(--shadow-card)' : 'var(--shadow-soft)',
    border: '1px solid var(--card-border)',
    position: 'relative',
    cursor: 'grab',
    touchAction: 'pan-x pan-y' // Allow scrolling on mobile
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
        }
      }}
    >
      <div style={{ position: 'absolute', top: '16px', right: '16px', opacity: 0.3 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle>
          <circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle>
        </svg>
      </div>

      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px', paddingRight: '20px', wordBreak: 'break-word', textDecoration: (statuses.length > 0 && task.status === statuses[statuses.length - 1]) ? 'line-through' : 'none' }}>
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
      
      {task.subtasks && task.subtasks.length > 0 && (() => {
        const completed = task.subtasks.filter(s => s.isCompleted).length;
        const total = task.subtasks.length;
        const progress = (completed / total) * 100;
        return (
          <div style={{ marginBottom: '10px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
              <span>Subtasks</span>
              <span>{completed} / {total}</span>
            </div>
            <div style={{ height: '6px', background: 'var(--item-bg)', borderRadius: '3px', overflow: 'hidden', boxShadow: 'var(--shadow-inner)' }}>
              <div style={{ height: '100%', background: 'var(--accent-blue)', width: `${progress}%`, transition: 'width 0.3s ease', borderRadius: '3px' }}></div>
            </div>
          </div>
        );
      })()}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        {task.deadline && (() => {
          const [y, m, d] = task.deadline.split('-');
          const deadlineDate = new Date(y, m - 1, d);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isOverdue = deadlineDate < today;
          return (
            <span style={{ fontSize: '11px', color: isOverdue ? 'var(--accent-coral)' : 'var(--text-muted)' }}>
              {deadlineDate.toLocaleDateString()}{task.deadlineTime ? ` ${task.deadlineTime}` : ''}
            </span>
          );
        })()}
        <Badge priority={task.priority}>{task.priority}</Badge>
      </div>
    </div>
  );
};

const DroppableColumn = ({ col, tasks, isCollapsed, toggleCollapse, onEditTask, statuses, onAddTaskWithStatus }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: col.id,
    data: { type: 'Column', col }
  });

  return (
    <GlassCard 
      ref={setNodeRef}
      onClick={() => {
        if (isCollapsed) toggleCollapse(col.id);
      }}
      style={{ 
        flex: isCollapsed ? 0 : 1, 
        minWidth: isCollapsed ? '60px' : 'min(320px, 85vw)', 
        padding: isCollapsed ? '20px 10px' : '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        background: isOver ? 'var(--item-bg)' : 'transparent',
        border: isOver ? `2px dashed ${col.color}` : '2px solid transparent',
        transition: 'all 0.3s ease',
        transform: isOver ? 'scale(1.02)' : 'scale(1)',
        alignItems: isCollapsed ? 'center' : 'stretch',
        cursor: isCollapsed ? 'pointer' : 'default'
      }}
    >
      {isCollapsed ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: '20px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: col.color, boxShadow: 'var(--shadow-soft)' }}></div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', flex: 1, textAlign: 'center', letterSpacing: '2px', whiteSpace: 'nowrap' }}>
            {col.title} <span style={{opacity: 0.5}}>({tasks.length})</span>
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
              <Badge>{tasks.length}</Badge>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleCollapse(col.id); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                title="Collapse Column"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {tasks.map(task => (
                <DraggableTask key={task.id} task={task} onEditTask={onEditTask} statuses={statuses} />
              ))}
            </SortableContext>
            
            {tasks.length === 0 && (
              <div style={{ 
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: 'var(--text-muted)', fontSize: '13px', 
                border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '16px',
                background: isOver ? 'rgba(0,0,0,0.02)' : 'transparent',
                minHeight: '100px'
              }}>
                Drop tasks here
              </div>
            )}
            
            <button 
              onClick={(e) => { e.stopPropagation(); onAddTaskWithStatus(col.id); }}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: '2px dashed var(--card-border)',
                borderRadius: '16px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                marginTop: 'auto',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--item-bg)';
                e.currentTarget.style.borderColor = col.color;
                e.currentTarget.style.color = col.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--card-border)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Task
            </button>
          </div>
        </>
      )}
    </GlassCard>
  );
};

const KanbanView = ({ tasks, onEditTask, setTasks, onStatusChange, onReorderTasks, statuses = [], onAddTaskWithStatus }) => {
  const [activeId, setActiveId] = useState(null);
  const [boardTasks, setBoardTasks] = useState([]);
  
  useEffect(() => {
    if (!activeId) {
      setBoardTasks([...tasks].sort((a, b) => (a.order || 0) - (b.order || 0)));
    }
  }, [tasks, activeId]);

  const [collapsedCols, setCollapsedCols] = useState(() => {
    return statuses.length > 0 ? [statuses[statuses.length - 1]] : ['done'];
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    
    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    setBoardTasks(prev => {
      const activeIndex = prev.findIndex(t => t.id === activeId);
      const activeTask = prev[activeIndex];
      
      if (isOverTask) {
        const overIndex = prev.findIndex(t => t.id === overId);
        const overTask = prev[overIndex];
        
        if (activeTask.status !== overTask.status) {
          activeTask.status = overTask.status;
          return arrayMove(prev, activeIndex, overIndex);
        }
        return arrayMove(prev, activeIndex, overIndex);
      }
      
      if (isOverColumn) {
        if (activeTask.status !== overId) {
          activeTask.status = overId;
          return arrayMove(prev, activeIndex, prev.length - 1);
        }
      }
      return prev;
    });
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const overId = over.id;
    
    // Recalculate order for all tasks to be safe
    const reordered = boardTasks.map((t, index) => ({ ...t, order: index }));
    setBoardTasks(reordered);
    
    if (onReorderTasks) {
      onReorderTasks(reordered);
    } else if (onStatusChange) {
      const activeTask = reordered.find(t => t.id === active.id);
      if (activeTask) onStatusChange(active.id, activeTask.status);
    }

    if (over.data.current?.type === 'Column' && collapsedCols.includes(overId)) {
      setCollapsedCols(prev => prev.filter(c => c !== overId));
    }
  };

  const toggleCollapse = (colId) => {
    setCollapsedCols(prev => 
      prev.includes(colId) ? prev.filter(c => c !== colId) : [...prev, colId]
    );
  };

  const colors = ['var(--accent-blue)', 'var(--accent-peach)', 'var(--text-muted)', 'var(--accent-coral)', 'var(--accent-pink)'];
  const columns = statuses.map((status, idx) => ({
    id: status,
    title: status,
    color: colors[idx % colors.length]
  }));

  const activeTask = useMemo(() => boardTasks.find(t => t.id === activeId), [activeId, boardTasks]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div style={{ flex: 1, display: 'flex', gap: '20px', minHeight: 'calc(100dvh - 95px)', overflowX: 'auto', paddingBottom: '20px' }}>
        {columns.map(col => {
          const columnTasks = boardTasks.filter(t => t.status === col.id);
          const isCollapsed = collapsedCols.includes(col.id);
          
          return (
              <DroppableColumn 
                key={col.id} 
                col={col} 
                tasks={columnTasks} 
                isCollapsed={isCollapsed} 
                toggleCollapse={toggleCollapse} 
                onEditTask={onEditTask} 
                statuses={statuses} 
                onAddTaskWithStatus={onAddTaskWithStatus}
              />
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div style={{ opacity: 0.8, transform: 'rotate(2deg)' }}>
            <DraggableTask task={activeTask} onEditTask={() => {}} statuses={statuses} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanView;
