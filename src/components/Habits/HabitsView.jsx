import React from 'react';
import GlassCard from '../UI/GlassCard';

const HabitsView = () => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <GlassCard style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Habits</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
          This is where your habits tracker will live.
        </p>
      </GlassCard>
    </div>
  );
};

export default HabitsView;
