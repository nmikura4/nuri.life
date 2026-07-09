import React, { createContext, useContext, useState, useCallback } from 'react';
import GlassCard from '../components/UI/GlassCard';

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState(null);

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const handleConfirm = () => {
    if (confirmState) {
      confirmState.resolve(true);
      setConfirmState(null);
    }
  };

  const handleCancel = () => {
    if (confirmState) {
      confirmState.resolve(false);
      setConfirmState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {confirmState && (
        <div className="modal-overlay" style={{ zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GlassCard style={{ padding: '30px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>Confirm Action</h3>
            <p style={{ marginBottom: '30px', color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.5' }}>{confirmState.message}</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button onClick={handleCancel} className="pill-btn" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleConfirm} className="pill-btn danger" style={{ flex: 1 }}>Confirm</button>
            </div>
          </GlassCard>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);
