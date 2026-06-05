
import './UI.css';

const NeumorphicButton = ({ children, onClick, active = false, className = '' }) => {
  return (
    <button 
      className={`neu-btn ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default NeumorphicButton;
