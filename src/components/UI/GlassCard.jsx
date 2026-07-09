import React, { forwardRef } from 'react';

const GlassCard = forwardRef(({ children, className = '', style = {}, ...props }, ref) => {
  return (
    <div className={`glass-panel ${className}`} style={style} ref={ref} {...props}>
      {children}
    </div>
  );
});

export default GlassCard;
