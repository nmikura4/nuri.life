import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearCacheAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed to clear storage', e);
    }
    window.location.href = window.location.origin + '?ts=' + Date.now();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100dvh',
          padding: '20px',
          background: 'var(--bg-gradient, linear-gradient(135deg, #eef2f7 0%, #dbe4ee 100%))',
          fontFamily: 'inherit'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            padding: '36px',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            color: 'var(--text-primary, #1e293b)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              color: '#ef4444'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>
              Что-то пошло не так
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #64748b)', marginBottom: '24px', lineHeight: 1.5 }}>
              При загрузке страницы возникла ошибка. Попробуйте обновить страницу или очистить кэш приложения.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <RefreshCw size={16} />
                Обновить страницу
              </button>

              <button
                onClick={this.handleClearCacheAndReload}
                style={{
                  padding: '10px 16px',
                  borderRadius: '14px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  background: 'rgba(255, 255, 255, 0.5)',
                  color: 'var(--text-secondary, #64748b)',
                  fontWeight: '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                Очистить локальный кэш и перезагрузить
              </button>
            </div>

            {this.state.error && (
              <div style={{ marginTop: '20px', textAlign: 'left' }}>
                <button
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '12px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  {this.state.showDetails ? 'Скрыть технические детали' : 'Показать технические детали'}
                </button>
                {this.state.showDetails && (
                  <pre style={{
                    marginTop: '10px',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '10px',
                    fontSize: '11px',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    color: '#e11d48'
                  }}>
                    {this.state.error?.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
