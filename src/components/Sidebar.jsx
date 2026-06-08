import React from 'react';
import { NavLink } from 'react-router-dom';
import GlassCard from './UI/GlassCard';
import NeumorphicButton from './UI/NeumorphicButton';
import { Home, CheckSquare, Settings, Wallet, StickyNote, Activity, LogOut, Brain } from 'lucide-react';

const TooltipButton = ({ icon: Icon, label, to, onClick, color }) => {
  if (onClick) {
    return (
      <div className="sidebar-tooltip-container" title={label}>
        <NeumorphicButton onClick={onClick}>
          <Icon size={20} color={color || "currentColor"} />
        </NeumorphicButton>
        <div className="sidebar-tooltip">{label}</div>
      </div>
    );
  }

  return (
    <div className="sidebar-tooltip-container" title={label}>
      <NavLink to={to} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', width: '100%' }}>
        {({ isActive }) => (
          <NeumorphicButton active={isActive}>
            <Icon size={20} color={color || "currentColor"} />
          </NeumorphicButton>
        )}
      </NavLink>
      <div className="sidebar-tooltip">
        {label}
      </div>
    </div>
  );
};

const Sidebar = ({ avatarUrl, onLogout }) => {
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
        <TooltipButton label="Dashboard" icon={Home} to="/" />
        <TooltipButton label="Tasks" icon={CheckSquare} to="/tasks" />
        <TooltipButton label="Finances" icon={Wallet} to="/finances" />
        <TooltipButton label="Notes" icon={StickyNote} to="/notes" />
        <TooltipButton label="Habits" icon={Activity} to="/habits" />
        <TooltipButton label="AI Coach" icon={Brain} to="/ai" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        <TooltipButton label="Settings" icon={Settings} to="/settings" />
        <TooltipButton label="Logout" icon={LogOut} onClick={onLogout} color="var(--accent-coral)" />
      </div>
    </GlassCard>
  );
};

export default Sidebar;
