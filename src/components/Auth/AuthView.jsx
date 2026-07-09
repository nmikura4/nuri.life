import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';

const AuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Этот email уже используется.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Неверный email или пароль.');
      } else if (err.code === 'auth/weak-password') {
        setError('Пароль слишком слабый (минимум 6 символов).');
      } else {
        setError('Произошла ошибка при авторизации: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      setError('Ошибка входа через Google: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Пожалуйста, введите ваш email для сброса пароля.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Ссылка для сброса пароля отправлена на ваш email.');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('Пользователь с таким email не найден.');
      } else {
        setError('Ошибка при сбросе пароля: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      padding: '20px',
      background: 'var(--solid-card-bg)', // Matches project design
    }}>
      <div style={{
        width: '380px',
        padding: '40px 30px',
        background: 'var(--solid-card-bg)',
        borderRadius: '30px',
        boxShadow: 'var(--shadow-soft)', // Uses project's neumorphic shadow
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: 'var(--text-main)',
            marginBottom: '5px' 
          }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </h1>
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '14px',
              cursor: 'pointer',
              padding: 0
            }}
          >
            {isLogin ? 'Create a new account' : 'Already have an account? Sign In'}
          </button>
        </div>

        {error && (
          <div style={{
            color: '#ef4444',
            padding: '10px',
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Username / Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)', paddingLeft: '5px' }}>Username</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@nuri.life"
              required
              className="neu-input"
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '25px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)', paddingLeft: '5px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              required
              className="neu-input"
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '25px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Remember Me & Forget Password */}
          {isLogin && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 5px', marginTop: '-8px' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                onClick={() => setRememberMe(!rememberMe)}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  background: 'var(--solid-card-bg)',
                  boxShadow: 'var(--shadow-soft)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {rememberMe && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Remember me</span>
              </div>
              <a href="#" onClick={handleResetPassword} style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>Forget password?</a>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '25px',
              border: 'none',
              background: 'var(--text-main)',
              color: 'var(--solid-card-bg)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-soft)',
              marginTop: '10px',
              opacity: loading ? 0.8 : 1,
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'translateY(2px)')}
            onMouseUp={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '20px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>or sign in with</span>
        </div>

        {/* Social Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          {[
            { id: 'google', icon: <span style={{ fontWeight: 'bold', fontSize: '18px', fontFamily: 'sans-serif' }}>G</span>, action: handleGoogleSignIn }
          ].map((social) => (
            <button
              key={social.id}
              onClick={social.action}
              style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                border: 'none',
                background: 'var(--solid-card-bg)',
                color: 'var(--text-main)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-soft)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-inner)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
              }}
            >
              {social.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthView;

