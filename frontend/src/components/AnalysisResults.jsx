import React from 'react';
import { Cpu, ShieldAlert, Award, FileText, ArrowLeft, Terminal, ShieldAlert as AlertIcon, Clock } from 'lucide-react';

export default function AnalysisResults({ uploadedData, onNavigate }) {
  const hasData = !!uploadedData;
  const analysis = uploadedData?.threatAnalysis || {};
  const parsedLogs = uploadedData?.parsedLogs || [];

  const getSeverityColor = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#3b82f6';
      default: return '#64748b';
    }
  };

  return (
    <div style={styles.container}>
      {/* Back navigation */}
      <div style={styles.backContainer}>
        <button style={styles.backBtn} onClick={() => onNavigate('dashboard')}>
          <ArrowLeft size={16} />
          <span>RETURN TO OPERATIONAL DASHBOARD</span>
        </button>
      </div>

      <div style={styles.layout}>
        {/* Left pane: Threat Gauges & Indicators */}
        <div style={styles.leftPane}>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-title">
              <Award size={18} color="#00f2fe" />
              <span>AI SECURITY CLASSIFICATION METRIC</span>
            </div>
            
            <div style={styles.gaugeContainer}>
              <div style={{ ...styles.gaugeInner, borderColor: getSeverityColor(analysis.severity) }}>
                <span style={styles.gaugeValue}>{analysis.risk_score || 0}</span>
                <span style={styles.gaugeLabel}>RISK INDEX</span>
              </div>
            </div>

            <div style={styles.metaRows}>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>ATTACK VECTOR TYPE:</span>
                <span style={styles.metaValue}>{analysis.attack_type || 'Unknown'}</span>
              </div>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>AI MODEL CONFIDENCE:</span>
                <span style={styles.metaValue}>{analysis.confidence || 0}%</span>
              </div>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>ALERT CLASSIFICATION:</span>
                <span style={{ ...styles.metaValue, color: getSeverityColor(analysis.severity) }}>
                  {analysis.severity?.toUpperCase() || 'LOW'}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <AlertIcon size={18} color="#ef4444" />
              <span>MITRE ATT&CK® DEFINITION</span>
            </div>
            <div style={styles.mitreSection}>
              <div style={styles.mitreRow}>
                <span style={styles.mitreLabel}>TACTIC:</span>
                <span style={styles.mitreVal}>{analysis.tactic || 'Credential Access'}</span>
              </div>
              <div style={styles.mitreRow}>
                <span style={styles.mitreLabel}>TECHNIQUE:</span>
                <span style={styles.mitreVal}>{analysis.technique || 'Brute Force'}</span>
              </div>
              <div style={styles.mitreRow}>
                <span style={styles.mitreLabel}>TECHNIQUE ID:</span>
                <code style={styles.code}>{analysis.mitre_attack?.split(' - ')[0] || 'T1110'}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Right pane: Narrative logs and playbooks */}
        <div style={styles.rightPane}>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-title">
              <Cpu size={18} color="#0066ff" />
              <span>AI DETAILED SECURITY REASONING</span>
            </div>
            <p style={styles.reasoningText}>{analysis.reasoning}</p>

            <div style={styles.reportRedirectBox}>
              <div>
                <h4 style={styles.redirectTitle}>Export Incident Report</h4>
                <p style={styles.redirectDesc}>
                  Generate a client-ready professional incident report outlining executive summaries, forensics, and remediation timelines.
                </p>
              </div>
              <button style={styles.reportBtn} onClick={() => onNavigate('report')}>
                <FileText size={16} />
                <span>GENERATE REPORT</span>
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <Terminal size={18} color="#00f2fe" />
              <span>INGESTED LOG TELEMETRY SOURCE</span>
            </div>
            <div style={styles.logConsole}>
              {parsedLogs.map((log, i) => (
                <div key={i} style={styles.consoleLine}>
                  <span style={styles.consoleTime}>[{log.timestamp || 'N/A'}]</span>
                  <span style={styles.consoleMsg}>{log.message}</span>
                </div>
              ))}
              {parsedLogs.length === 0 && (
                <div style={styles.emptyConsole}>No raw log telemetry items present.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  backContainer: {
    display: 'flex',
  },
  backBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #1e293b',
    borderRadius: '6px',
    padding: '8px 16px',
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  layout: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  leftPane: {
    flex: '1 1 350px',
  },
  rightPane: {
    flex: '2 1 650px',
  },
  gaugeContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '24px 0',
  },
  gaugeInner: {
    width: '130px',
    height: '130px',
    borderRadius: '50%',
    border: '4px solid #0066ff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#090d16',
    boxShadow: '0 0 20px rgba(0, 102, 255, 0.1)',
  },
  gaugeValue: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#f8fafc',
  },
  gaugeLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '1px',
    marginTop: '2px',
  },
  metaRows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '16px',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
  },
  metaLabel: {
    fontWeight: '700',
    color: '#64748b',
  },
  metaValue: {
    fontWeight: '600',
    color: '#f8fafc',
  },
  mitreSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  mitreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12.5px',
    alignItems: 'center',
  },
  mitreLabel: {
    fontWeight: '700',
    color: '#64748b',
  },
  mitreVal: {
    fontWeight: '600',
    color: '#f8fafc',
  },
  code: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '11px',
    color: '#00f2fe',
    backgroundColor: '#070913',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #1e293b',
  },
  reasoningText: {
    fontSize: '14.5px',
    color: '#94a3b8',
    lineHeight: '1.7',
    margin: '0 0 24px 0',
  },
  reportRedirectBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 102, 255, 0.05)',
    border: '1px solid rgba(0, 102, 255, 0.15)',
    borderRadius: '8px',
    padding: '16px 20px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  redirectTitle: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: '700',
    color: '#f8fafc',
  },
  redirectDesc: {
    margin: 0,
    fontSize: '12.5px',
    color: '#64748b',
    maxWidth: '450px',
  },
  reportBtn: {
    backgroundColor: '#0066ff',
    border: '1px solid rgba(0, 102, 255, 0.5)',
    borderRadius: '6px',
    padding: '10px 18px',
    color: '#f8fafc',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 102, 255, 0.2)',
  },
  logConsole: {
    backgroundColor: '#070913',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '16px',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '12px',
    maxHeight: '400px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  consoleLine: {
    display: 'flex',
    gap: '12px',
    lineHeight: '1.5',
  },
  consoleTime: {
    color: '#475569',
    flexShrink: 0,
  },
  consoleMsg: {
    color: '#94a3b8',
    wordBreak: 'break-all',
  },
  emptyConsole: {
    color: '#475569',
    textAlign: 'center',
    padding: '20px 0',
  },
};
