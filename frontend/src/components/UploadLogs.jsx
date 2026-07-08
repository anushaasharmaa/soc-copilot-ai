import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';
import { runIncidentWorkflow } from '../services/api';

export default function UploadLogs({ onUploadSuccess, onNavigate }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [progressText, setProgressText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError('');
      setStatus('idle');
      setProgressText('');
      setProgressPercent(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selected = e.dataTransfer.files[0];
    if (selected) {
      const ext = selected.name.split('.').pop().toLowerCase();
      if (['txt', 'json', 'csv'].includes(ext)) {
        setFile(selected);
        setError('');
        setStatus('idle');
        setProgressText('');
        setProgressPercent(0);
      } else {
        setError('Unsupported file type. Only .txt, .json, and .csv files are permitted.');
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleProcess = async () => {
    if (!file) return;
    setStatus('loading');
    setError('');
    setProgressPercent(0);

    try {
      const workflowData = await runIncidentWorkflow(file, ({ message, percent }) => {
        setProgressText(message);
        setProgressPercent(percent ?? 0);
      });

      setStatus('success');
      setProgressText('Incident report generated successfully.');
      setProgressPercent(100);

      setTimeout(() => {
        onUploadSuccess({
          filename: file.name,
          ...workflowData,
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during processing.');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus('idle');
    setProgressText('');
    setProgressPercent(0);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <div className="card-title">
          <Upload size={18} color="#0066ff" />
          <span>LOG SOURCE INGESTION</span>
        </div>

        <p style={styles.desc}>
          Upload text logs, syslogs, Windows event logs (.txt), JSON logs, or CSV logs. 
          The Copilot will parse fields, extract potential security indicators, and run threat classification.
        </p>

        <div
          style={{
            ...styles.dropzone,
            borderColor: status === 'error' ? '#ef4444' : file ? '#0066ff' : '#1e293b',
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={status === 'loading' ? null : triggerFileSelect}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.json,.csv"
            style={{ display: 'none' }}
          />

          <div style={styles.dropzoneContent}>
            {file ? (
              <>
                <FileText size={48} color="#00f2fe" style={styles.iconPulse} />
                <span style={styles.filename}>{file.name}</span>
                <span style={styles.filesize}>
                  {(file.size / 1024).toFixed(2)} KB
                </span>
              </>
            ) : (
              <>
                <Upload size={48} color="#475569" style={styles.uploadIcon} />
                <span style={styles.dropText}>
                  Drag & Drop log file here or <span style={styles.highlight}>Browse</span>
                </span>
                <span style={styles.dropSub}>Supported formats: .txt, .json, .csv</span>
              </>
            )}
          </div>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {status === 'loading' && (
          <div style={styles.loaderBox}>
            <RefreshCw size={20} className="animate-spin" style={styles.spinIcon} />
            <div style={styles.loaderTextContainer}>
              <span style={styles.loaderText}>{progressText}</span>
              <span style={styles.progressMeta}>{progressPercent}% complete</span>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div style={styles.successBox}>
            <CheckCircle size={18} />
            <span>{progressText}</span>
          </div>
        )}

        <div style={styles.actionPanel}>
          <button
            style={styles.cancelBtn}
            onClick={() => onNavigate('dashboard')}
            disabled={status === 'loading'}
          >
            RETURN TO DASHBOARD
          </button>
          <button
            style={{
              ...styles.cancelBtn,
              opacity: status === 'loading' ? 0.6 : 1,
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            }}
            onClick={handleReset}
            disabled={status === 'loading'}
          >
            RESET
          </button>
          <button
            style={{
              ...styles.processBtn,
              opacity: !file || status === 'loading' ? 0.6 : 1,
              cursor: !file || status === 'loading' ? 'not-allowed' : 'pointer',
            }}
            onClick={handleProcess}
            disabled={!file || status === 'loading'}
          >
            <ShieldAlert size={18} />
            <span>ANALYZE LOG INGESTION</span>
          </button>
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
    padding: '24px 0',
  },
  card: {
    width: '650px',
    maxWidth: '100%',
  },
  desc: {
    color: '#94a3b8',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0 0 24px 0',
  },
  dropzone: {
    border: '2px dashed #1e293b',
    borderRadius: '8px',
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#090d16',
    transition: 'all 0.2s ease',
  },
  dropzoneContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  uploadIcon: {
    marginBottom: '8px',
  },
  dropText: {
    fontSize: '14px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  highlight: {
    color: '#0066ff',
    textDecoration: 'underline',
  },
  dropSub: {
    fontSize: '12px',
    color: '#475569',
  },
  filename: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#f8fafc',
  },
  filesize: {
    fontSize: '12px',
    color: '#64748b',
  },
  errorBox: {
    marginTop: '20px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    padding: '14px 16px',
    color: '#f87171',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  loaderBox: {
    marginTop: '20px',
    backgroundColor: 'rgba(0, 102, 255, 0.05)',
    border: '1px solid rgba(0, 102, 255, 0.15)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  spinIcon: {
    color: '#00f2fe',
    animation: 'spin 1s linear infinite',
  },
  loaderTextContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  loaderText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#94a3b8',
  },
  progressBar: {
    height: '4px',
    backgroundColor: '#0f172a',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00f2fe',
    borderRadius: '2px',
    transition: 'width 0.25s ease',
  },
  progressMeta: {
    fontSize: '12px',
    color: '#64748b',
  },
  successBox: {
    marginTop: '20px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
    padding: '14px 16px',
    color: '#34d399',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  actionPanel: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '32px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '20px',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #1e293b',
    borderRadius: '6px',
    padding: '10px 20px',
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  processBtn: {
    backgroundColor: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    borderRadius: '6px',
    padding: '10px 20px',
    color: '#f8fafc',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
    transition: 'all 0.2s ease',
  },
};
