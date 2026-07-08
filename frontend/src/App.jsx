import React, { useState } from 'react';
import { Shield, Upload, Activity, FileText, LogOut, LayoutDashboard } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UploadLogs from './components/UploadLogs';
import AnalysisResults from './components/AnalysisResults';
import IncidentReport from './components/IncidentReport';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null); // 'username' when logged in
  const [page, setPage] = useState('dashboard'); // dashboard | upload | analysis | report
  const [uploadedData, setUploadedData] = useState(null); // { filename, parsedLogs, extractedIocs, threatAnalysis, incidentReport }
  const [notification, setNotification] = useState(null);

  const handleLogin = (username) => {
    setUser(username);
  };

  const handleLogout = () => {
    setUser(null);
    setPage('dashboard');
    setUploadedData(null);
    setNotification(null);
  };

  const handleUploadSuccess = (data) => {
    setUploadedData(data);
    setPage('dashboard');
    setNotification({
      type: 'success',
      message: `Incident report generated successfully for ${data.filename}.`,
    });
  };

  const handleReportGenerated = (report) => {
    setUploadedData(prev => ({
      ...prev,
      incidentReport: report
    }));
  };

  const handleResetWorkflow = () => {
    setUploadedData(null);
    setPage('dashboard');
    setNotification({
      type: 'success',
      message: 'Dashboard state has been reset.',
    });
  };

  // If not authorized, show Login view
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard uploadedData={uploadedData} onNavigate={setPage} onReset={handleResetWorkflow} />;
      case 'upload':
        return <UploadLogs onUploadSuccess={handleUploadSuccess} onNavigate={setPage} />;
      case 'analysis':
        return <AnalysisResults uploadedData={uploadedData} onNavigate={setPage} onReset={handleResetWorkflow} />;
      case 'report':
        return <IncidentReport 
          uploadedData={uploadedData} 
          onReportGenerated={handleReportGenerated} 
          onNavigate={setPage}
          onReset={handleResetWorkflow}
        />;
      default:
        return <Dashboard uploadedData={uploadedData} onNavigate={setPage} />;
    }
  };

  return (
    <div className="app-container">
      {/* Universal SOC Header */}
      <header className="header no-print">
        <div className="header-brand">
          <div className="logo-badge" style={styles.headerLogo}>
            <Shield size={20} color="#00f2fe" />
          </div>
          <h1>AI SOC COPILOT</h1>
        </div>

        <nav className="header-nav">
          <button 
            className={`nav-btn ${page === 'dashboard' ? 'active' : ''}`}
            onClick={() => setPage('dashboard')}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav-btn ${page === 'upload' ? 'active' : ''}`}
            onClick={() => setPage('upload')}
          >
            <Upload size={16} />
            <span>Upload Logs</span>
          </button>
          <button 
            className={`nav-btn ${page === 'analysis' ? 'active' : ''}`}
            onClick={() => setPage('analysis')}
            disabled={!uploadedData}
            style={{ opacity: uploadedData ? 1 : 0.5, cursor: uploadedData ? 'pointer' : 'not-allowed' }}
          >
            <Activity size={16} />
            <span>Analysis Results</span>
          </button>
          <button 
            className={`nav-btn ${page === 'report' ? 'active' : ''}`}
            onClick={() => setPage('report')}
            disabled={!uploadedData}
            style={{ opacity: uploadedData ? 1 : 0.5, cursor: uploadedData ? 'pointer' : 'not-allowed' }}
          >
            <FileText size={16} />
            <span>Incident Report</span>
          </button>
        </nav>

        <div style={styles.headerRight}>
          <div className="user-badge">
            <span className="badge-dot"></span>
            <span>{user.toUpperCase()}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Sign Out Secure Console">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="main-content">
        {notification && (
          <div style={{
            ...styles.notification,
            ...(notification.type === 'error' ? styles.notificationError : styles.notificationSuccess),
          }}>
            <span>{notification.message}</span>
            <button style={styles.notificationDismiss} onClick={() => setNotification(null)}>
              DISMISS
            </button>
          </div>
        )}
        {renderView()}
      </main>
    </div>
  );
}

const styles = {
  headerLogo: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: '1px solid rgba(0, 102, 255, 0.2)',
    backgroundColor: 'rgba(0, 102, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #1e293b',
    borderRadius: '6px',
    padding: '8px',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  notification: {
    marginBottom: '20px',
    borderRadius: '8px',
    padding: '14px 16px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  notificationSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    color: '#34d399',
  },
  notificationError: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#f87171',
  },
  notificationDismiss: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '6px',
    padding: '6px 10px',
    color: 'inherit',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};
