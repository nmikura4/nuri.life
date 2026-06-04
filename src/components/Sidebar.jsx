import React from 'react';
import GlassCard from './UI/GlassCard';
import NeumorphicButton from './UI/NeumorphicButton';
import { Home, CheckSquare, Settings, Wallet, StickyNote, Activity } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, avatarUrl }) => {
  return (
    <GlassCard className="sidebar" style={{
      width: '80px',
      height: 'calc(100vh - 60px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '30px 0',
      gap: '30px',
      position: 'sticky',
      top: '30px',
      zIndex: 100
    }}>
      {avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          marginBottom: '20px',
          objectFit: 'cover',
          boxShadow: 'var(--shadow-soft)'
        }} />
      ) : (
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--accent-coral)',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-soft)'
        }}></div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        <NeumorphicButton active={activeTab === 'home'} onClick={() => setActiveTab('home')}>
          <Home size={20} />
        </NeumorphicButton>
        <NeumorphicButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')}>
          <CheckSquare size={20} />
        </NeumorphicButton>
        <NeumorphicButton active={activeTab === 'finances'} onClick={() => setActiveTab('finances')}>
          <Wallet size={20} />
        </NeumorphicButton>
        <NeumorphicButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')}>
          <StickyNote size={20} />
        </NeumorphicButton>
        <NeumorphicButton active={activeTab === 'habits'} onClick={() => setActiveTab('habits')}>
          <Activity size={20} />
        </NeumorphicButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <NeumorphicButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
          <Settings size={20} />
        </NeumorphicButton>
      </div>
    </GlassCard>
  );
};

export default Sidebar;
