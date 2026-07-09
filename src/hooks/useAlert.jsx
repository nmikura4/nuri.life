import React, { createContext, useContext, useState, useCallback } from 'react';
import GlassCard from '../components/UI/GlassCard';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState(null);

  const showAlert = useCallback((message) => {
    setAlertState({ message });
  }, []);

  const handleClose = () => {
    setAlertState(null);
  };

  return (
    <AlertContext.Provider value={showAlert}>
      {children}
      {alertState && (
        <div className="modal-overlay" style={{ zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GlassCard className="responsive-card" style={{ padding: '30px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', background: 'var(--solid-card-bg)' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>Внимание</h3>
            <p style={{ marginBottom: '30px', color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.5' }}>{alertState.message}</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={handleClose} className="pill-btn primary" style={{ minWidth: '120px' }}>OK</button>
            </div>
          </GlassCard>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
