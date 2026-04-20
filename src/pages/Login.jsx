import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const { login, signup, loginWithGoogle, resetPassword, user, checkUsernameUnique } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [isUsernameValid, setIsUsernameValid] = useState(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  useEffect(() => {
    if (isLogin || isForgotPassword || !username.trim()) {
      setIsUsernameValid(null);
      setIsCheckingUsername(false);
      return;
    }

    setIsCheckingUsername(true);
    setIsUsernameValid(null);

    const timer = setTimeout(async () => {
      try {
        const unique = await checkUsernameUnique(username.trim());
        setIsUsernameValid(unique);
      } catch (err) {
        setIsUsernameValid(null);
      }
      setIsCheckingUsername(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [username, isLogin, isForgotPassword, checkUsernameUnique]);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        await resetPassword(email);
        setMsg('Password reset email sent. Check your inbox.');
      } else if (isLogin) {
        await login(email, password);
      } else {
        if (isUsernameValid === false) {
           setError("Username is already taken.");
           setLoading(false);
           return;
        }
        await signup(email, password, username.trim());
      }
    } catch (err) {
      setError(err.message);
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async (e) => {
    if (e) e.preventDefault();

    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="app-wrapper flex-center" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="card glass-panel" style={{ width: '100%', maxWidth: '450px', margin: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="text-display-md text-gradient" style={{ marginBottom: '0.5rem', fontFamily: 'Manrope, sans-serif' }}>
            Cognitive Sanctuary
          </h1>
          <p style={{ color: 'var(--on-surface-muted)', fontSize: '1.1rem' }}>
            {isForgotPassword ? 'Reset your password' : isLogin ? 'Welcome back' : 'Create an account'}
          </p>
        </div>

        {error && <div style={{ color: 'var(--tertiary)', backgroundColor: 'var(--tertiary-container)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}
        {msg && <div style={{ color: 'var(--on-primary)', backgroundColor: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{msg}</div>}

        <form onSubmit={handleSubmit} className="flex-column gap-md">
          {!isLogin && !isForgotPassword && (
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                style={{ 
                  backgroundColor: '#ffffff', 
                  color: '#001f2a', 
                  width: '100%',
                  border: isUsernameValid === true ? '2px solid #10b981' : isUsernameValid === false ? '2px solid #ef4444' : '1px solid var(--outline)'
                }}
                required 
              />
              {isUsernameValid === false && (
                <div style={{ color: 'var(--tertiary)', fontSize: '0.8rem', marginTop: '0.35rem', paddingLeft: '0.5rem', textAlign: 'left' }}>
                  Username is already taken.
                </div>
              )}
            </div>
          )}

          <input 
            type="email" 
            className="input-field" 
            placeholder="Email Address" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={{ backgroundColor: '#ffffff', color: '#001f2a' }}
            required 
          />

          {!isForgotPassword && (
            <input 
              type="password" 
              className="input-field" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={{ backgroundColor: '#ffffff', color: '#001f2a' }}
              required 
            />
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
            {loading ? 'Processing...' : isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {!isForgotPassword && (
          <div className="flex-column gap-md" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--outline-variant)' }} />
              <span className="premium-muted-label">OR</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--outline-variant)' }} />
            </div>
            
            <button 
              type="button"
              className="btn btn-ghost" 
              onClick={handleGoogleSignIn} 
              disabled={loading}
              style={{ width: '100%', padding: '1rem', backgroundColor: '#ffffff', color: '#444', border: '1px solid #ddd', display: 'flex', justifyContent: 'center', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        )}

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
          {isForgotPassword ? (
            <button type="button" style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }} onClick={() => setIsForgotPassword(false)}>Back to Login</button>
          ) : (
            <div className="flex-column gap-md">
              <button type="button" style={{ border: 'none', background: 'none', color: 'var(--on-surface-muted)', cursor: 'pointer' }} onClick={() => setIsForgotPassword(true)}>Forgot Password?</button>
              <button type="button" style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
