import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import GlassCard from './UI/GlassCard';
import NeumorphicButton from './UI/NeumorphicButton';
import { Home, CheckSquare, Settings, Wallet, StickyNote, Activity, LogOut, Brain, Menu } from 'lucide-react';

const TooltipButton = ({ icon: Icon, label, to, onClick, color }) => {
  const content = (
    <div className="sidebar-tooltip-container" title={label}>
      <NeumorphicButton onClick={onClick}>
        <Icon size={20} color={color || "currentColor"} />
      </NeumorphicButton>
      <div className="sidebar-tooltip">{label}</div>
    </div>
  );

  if (to) {
    return (
      <NavLink to={to} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', width: '100%' }} onClick={onClick}>
        {({ isActive }) => (
          <div className="sidebar-tooltip-container" title={label}>
            <NeumorphicButton active={isActive}>
              <Icon size={20} color={color || "currentColor"} />
            </NeumorphicButton>
            <div className="sidebar-tooltip">{label}</div>
          </div>
        )}
      </NavLink>
    );
  }

  return content;
};

const Sidebar = ({ avatarUrl, onLogout, onMenuToggle }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (onMenuToggle) {
      onMenuToggle(isMoreMenuOpen);
    }
  }, [isMoreMenuOpen, onMenuToggle]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
      if (window.innerWidth > 900) {
        setIsMoreMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isMobile) {
    return (
      <GlassCard className="sidebar" style={{
        width: '100%',
        height: 'auto',
        minHeight: '70px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '10px 15px calc(25px + env(safe-area-inset-bottom))',
        position: 'fixed',
        bottom: 0,
        left: 0,
        zIndex: 100,
        borderRadius: '24px 24px 0 0',
        background: 'var(--solid-card-bg)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        boxSizing: 'border-box',
        flexWrap: 'nowrap'
      }}>
        <TooltipButton label="Dashboard" icon={Home} to="/" />
        <TooltipButton label="Tasks" icon={CheckSquare} to="/tasks" />
        <TooltipButton label="Finances" icon={Wallet} to="/finances" />
        <TooltipButton label="Notes" icon={StickyNote} to="/notes" />
        
        <div ref={menuRef} style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center' }}>
          <TooltipButton label="More" icon={Menu} onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} color={isMoreMenuOpen ? "var(--accent-blue)" : "currentColor"} />
          
          {isMoreMenuOpen && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              right: '-10px',
              marginBottom: '15px',
              padding: '15px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              alignItems: 'center',
              borderRadius: '24px',
              background: 'var(--solid-card-bg)',
              boxShadow: '0 -10px 30px rgba(0,0,0,0.1)',
              border: '1px solid var(--card-border)',
              zIndex: 101,
              animation: 'slideUp 0.2s ease'
            }}>
              <TooltipButton label="Habits" icon={Activity} to="/habits" onClick={() => setIsMoreMenuOpen(false)} />
              <TooltipButton label="AI Coach" icon={Brain} to="/ai" onClick={() => setIsMoreMenuOpen(false)} />
              <TooltipButton label="Settings" icon={Settings} to="/settings" onClick={() => setIsMoreMenuOpen(false)} />
              <div style={{ width: '100%', height: '1px', background: 'var(--card-border)', margin: '5px 0' }}></div>
              <TooltipButton label="Logout" icon={LogOut} onClick={() => { setIsMoreMenuOpen(false); onLogout(); }} color="var(--accent-coral)" />
            </div>
          )}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="sidebar" style={{
      width: '72px',
      minWidth: '72px',
      flexShrink: 0,
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
