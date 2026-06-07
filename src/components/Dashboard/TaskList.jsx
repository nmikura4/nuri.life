
import GlassCard from '../UI/GlassCard';
import Badge from '../UI/Badge';

const TaskList = ({ tasks, onEditTask, onToggleStatus, setSortBy, onClearDate, statuses = [] }) => {
  const isDone = (task) => statuses.length > 0 && task.status === statuses[statuses.length - 1];

  return (
    <GlassCard className="responsive-card" style={{ padding: '30px', flex: 1, minHeight: '300px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {tasks.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)' }}>Задач не найдено</p>
            <p style={{ fontSize: '14px' }}>На выбранную дату или по вашему запросу нет активных задач.</p>
            {setSortBy && (
              <button 
                onClick={() => {
                  setSortBy('overdue');
                  if (onClearDate) onClearDate();
                }}
                style={{
                  marginTop: '15px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid var(--accent-coral)',
                  background: 'transparent',
                  color: 'var(--accent-coral)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-coral)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent-coral)'; }}
              >
                Посмотреть просроченные задачи
              </button>
            )}
          </div>
        ) : (
          tasks.map(task => (
              <div className="task-row" key={task.id} 
              onClick={() => onEditTask(task)}
              style={{
                background: 'var(--item-bg)',
                borderRadius: '20px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-soft)',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div 
                  onClick={(e) => onToggleStatus(task.id, e)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    border: '2px solid var(--accent-blue)',
                    background: isDone(task) ? 'var(--accent-blue)' : 'transparent',
                    boxShadow: 'var(--shadow-inner)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                  }}>
                    {isDone(task) && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    )}
                  </div>
                
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: isDone(task) ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: isDone(task) ? 'line-through' : 'none' }}>
                    {task.title}
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                    {task.project && (
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-blue)' }}>#{task.project}</span>
                    )}
                    {task.desc && (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {task.desc.length > 40 ? task.desc.substring(0, 40) + '...' : task.desc}
                      </p>
                    )}
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {task.tags.map(tag => (
                        <span key={tag} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: 'var(--card-bg)', color: 'var(--text-muted)', boxShadow: 'var(--shadow-soft)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {task.subtasks && task.subtasks.length > 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 600 }}>
                      Subtasks: {task.subtasks.filter(s => s.isCompleted).length} / {task.subtasks.length}
                    </div>
                  )}
                </div>
              </div>

              <div className="task-row-meta" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                  {task.recurrence && task.recurrence !== 'none' && (
                    <div style={{ fontSize: '11px', color: 'var(--accent-coral)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
                      <span style={{ textTransform: 'capitalize' }}>{task.recurrence}</span>
                    </div>
                  )}
                  {task.deadline && (() => {
                      const [y, m, d] = task.deadline.split('-');
                      const deadlineDate = new Date(y, m - 1, d);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const isOverdue = deadlineDate < today;
                      return (
                        <span style={{ fontSize: '12px', fontWeight: 600, color: isOverdue ? 'var(--accent-coral)' : 'var(--text-muted)' }}>
                          {deadlineDate.toLocaleDateString()}
                        </span>
                      );
                    })()}
                  <Badge priority={task.priority}>{task.priority}</Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
};

export default TaskList;
