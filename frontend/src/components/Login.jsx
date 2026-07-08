import React, { useState } from 'react';
import { Shield, Key, User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic mock authentication for premium SOC portal feel
    setTimeout(() => {
      if (username.trim() && password.trim()) {
        onLogin(username);
      } else {
        setError('Please enter a valid username and password.');
      }
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div style={styles.container}>
      <div style={styles.backdropGrid} />
      <div style={styles.glowCircle1} />
      <div style={styles.glowCircle2} />
      
      <div style={styles.loginCard}>
        <div style={styles.logoSection}>
          <div style={styles.logoHex}>
            <Shield size={36} color="#00f2fe" style={styles.logoShield} />
          </div>
          <h1 style={styles.logoText}>SOC COPILOT</h1>
          <span style={styles.logoSub}>ENTERPRISE SECURITY PORTAL</span>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>OPERATOR LOGON ID</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.icon} />
              <input
                type="text"
                placeholder="operator_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>CRYPTOGRAPHIC KEY</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.icon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.showPassBtn}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.8 : 1,
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div style={styles.loadingWrapper}>
                <div style={styles.spinner} />
                <span>AUTHORIZING LOGON...</span>
              </div>
            ) : (
              <div style={styles.btnContent}>
                <Key size={18} />
                <span>INITIALIZE CONSOLE SECURE SESSION</span>
              </div>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <span>AUTHORIZED USE ONLY • ALL CONNECTIONS AUDITED</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#05070f',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    margin: 0,
    padding: '20px',
  },
  backdropGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(rgba(0, 102, 255, 0.1) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    zIndex: 1,
  },
  glowCircle1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0, 102, 255, 0.15) 0%, transparent 70%)',
    top: '-10%',
    right: '-10%',
    zIndex: 2,
    pointerEvents: 'none',
  },
  glowCircle2: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0, 242, 254, 0.1) 0%, transparent 70%)',
    bottom: '-20%',
    left: '-10%',
    zIndex: 2,
    pointerEvents: 'none',
  },
  loginCard: {
    width: '450px',
    maxWidth: '100%',
    backgroundColor: '#0c0f1d',
    border: '1px solid #1e293b',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '32px',
  },
  logoHex: {
    width: '72px',
    height: '72px',
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    border: '2px solid rgba(0, 102, 255, 0.3)',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16px',
    boxShadow: '0 0 20px rgba(0, 102, 255, 0.2)',
  },
  logoShield: {
    filter: 'drop-shadow(0 0 8px #00f2fe)',
  },
  logoText: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800',
    letterSpacing: '1px',
    color: '#f8fafc',
    background: 'linear-gradient(135deg, #f8fafc 40%, #00f2fe)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  logoSub: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: '2px',
    marginTop: '6px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '1px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '14px',
    color: '#475569',
  },
  input: {
    width: '100%',
    backgroundColor: '#070913',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '12px 16px 12px 42px',
    color: '#f8fafc',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  showPassBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#475569',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#f87171',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#0066ff',
    border: '1px solid rgba(0, 102, 255, 0.5)',
    borderRadius: '8px',
    padding: '14px',
    color: '#f8fafc',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 12px rgba(0, 102, 255, 0.3)',
    transition: 'all 0.2s ease',
  },
  btnContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
  },
  loadingWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderTop: '2px solid #f8fafc',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
    fontSize: '10px',
    color: '#475569',
    letterSpacing: '1px',
    fontWeight: '600',
  },
};
