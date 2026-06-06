import React, { useState } from 'react';
import GlassCard from './UI/GlassCard';
import NeumorphicButton from './UI/NeumorphicButton';
import { Home, CheckSquare, Settings, Wallet, StickyNote, Activity, LogOut, Brain } from 'lucide-react';

const TooltipButton = ({ icon: Icon, label, active, onClick, color }) => {
  return (
    <div className="sidebar-tooltip-container" title={label}>
      <NeumorphicButton active={active} onClick={onClick}>
        <Icon size={20} color={color || "currentColor"} />
      </NeumorphicButton>
      <div className="sidebar-tooltip">
        {label}
      </div>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, avatarUrl, onLogout }) => {
  return (
    <GlassCard className="sidebar" style={{
      width: '72px',
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
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          marginBottom: '20px',
          objectFit: 'cover',
          boxShadow: 'var(--shadow-soft)',
          backgroundColor: 'transparent'
        }} />
      ) : (
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--item-bg)',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-soft)'
        }}></div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, width: '100%' }}>
        <TooltipButton label="Dashboard" icon={Home} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <TooltipButton label="Tasks" icon={CheckSquare} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
        <TooltipButton label="Finances" icon={Wallet} active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} />
        <TooltipButton label="Notes" icon={StickyNote} active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
        <TooltipButton label="Habits" icon={Activity} active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} />
        <TooltipButton label="AI Coach" icon={Brain} active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        <TooltipButton label="Settings" icon={Settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        <TooltipButton label="Logout" icon={LogOut} onClick={onLogout} color="var(--accent-coral)" />
      </div>
    </GlassCard>
  );
};

export default Sidebar;
