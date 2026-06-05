
import './UI.css';

const Badge = ({ children, status, priority, className = '' }) => {
  let classes = 'pill-badge';
  if (status) classes += ` status-${status}`;
  if (priority) classes += ` priority-${priority}`;
  
  return (
    <span className={`${classes} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
