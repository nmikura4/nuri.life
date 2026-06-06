import React from 'react';
import ChatInterface from './ChatInterface';
import GlassCard from '../UI/GlassCard';

const AICoachView = () => {
  return (
    <GlassCard style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '0', overflow: 'hidden' }}>
      <ChatInterface isPopup={false} />
    </GlassCard>
  );
};

export default AICoachView;
