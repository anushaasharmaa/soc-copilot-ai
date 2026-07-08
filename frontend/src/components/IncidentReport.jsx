import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, Printer, RefreshCw, AlertTriangle, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import { generateReport } from '../services/api';

export default function IncidentReport({ uploadedData, onReportGenerated, onNavigate }) {
  const [report, setReport] = useState(uploadedData?.incidentReport || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Track checked containment items manually for interactive playbook feel
  const [containmentStatus, setContainmentStatus] = useState({});

  useEffect(() => {
    // If we have uploaded logs & analysis but no report yet, generate it!
    if (uploadedData && uploadedData.threatAnalysis && !report) {
      triggerReportGeneration();
    }
  }, [uploadedData, report]);

  const triggerReportGeneration = async () => {
    setIsLoading(true);
    setError('');
    try {
      const generated = await generateReport(
        uploadedData.threatAnalysis,
        uploadedData.parsedLogs
      );
      setReport(generated);
      onReportGenerated(generated); // save back to main state
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate the AI Incident Report.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContainmentStep = (idx) => {
    setContainmentStatus(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const getSeverityColor = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#3b82f6';
      default: return '#64748b';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div style={styles.centerContainer}>
        <div className="card" style={styles.loadingCard}>
          <RefreshCw size={36} className="animate-spin" color="#00f2fe" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>GENERATING INCIDENT NARRATIVES</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Gemini is compiling executive reviews, mapping threat metrics, and generating timeline audits...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerContainer}>
        <div className="card" style={styles.errorCard}>
          <AlertTriangle size={36} color="#ef4444" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#f87171' }}>REPORT GENERATION FAILED</h3>
          <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#94a3b8' }}>{error}</p>
          <div style={styles.errorActions}>
            <button style={styles.backBtn} onClick={() => onNavigate('dashboard')}>
              <ArrowLeft size={14} />
              <span>RETURN TO DASHBOARD</span>
            </button>
            <button style={styles.retryBtn} onClick={triggerReportGeneration}>
              <RefreshCw size={14} />
              <span>RETRY GENERATION</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={styles.centerContainer}>
        <div className="card" style={styles.errorCard}>
          <AlertTriangle size={36} color="#eab308" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>NO DATA AVAILABLE</h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
            Please ingest a log source and perform threat analysis before compiling reports.
          </p>
          <button style={styles.backBtn} onClick={() => onNavigate('dashboard')}>
            <ArrowLeft size={14} />
            <span>RETURN TO DASHBOARD</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Control Banner - hidden during printing */}
      <div style={styles.controlBanner} className="no-print">
        <button style={styles.backBtn} onClick={() => onNavigate('dashboard')}>
          <ArrowLeft size={16} />
          <span>RETURN TO DASHBOARD</span>
        </button>
        <button style={styles.printBtn} onClick={handlePrint}>
          <Printer size={16} />
          <span>PRINT / SAVE AS PDF</span>
        </button>
      </div>

      {/* Structured Report Layout */}
      <div className="card" style={styles.reportSheet}>
        {/* Header Block */}
        <div style={styles.reportHeader}>
          <div>
            <div style={styles.irBadge}>INCIDENT SECURITY AUDIT REPORT</div>
            <h1 style={styles.irTitle}>CYBERSECURITY INCIDENT RESPONSE SHEET</h1>
            <span style={styles.irSub}>REPORT REF: {report.report_id}</span>
          </div>
          <div style={styles.irMetaBlock}>
            <div style={styles.metaBox}>
              <span style={styles.metaLabel}>GENERATED DATE (UTC)</span>
              <span style={styles.metaVal}>{report.generated_at ? new Date(report.generated_at).toLocaleString() : 'N/A'}</span>
            </div>
            <div style={styles.metaBox}>
              <span style={styles.metaLabel}>THREAT RISK INDEX</span>
              <span style={{ ...styles.metaVal, color: getSeverityColor(report.severity) }}>
                {report.risk_score || 0}/100 ({report.severity})
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div style={styles.reportSection}>
          <h3 style={styles.sectionHeader}>1. EXECUTIVE BRIEFING</h3>
          <p style={styles.summaryText}>{report.executive_summary}</p>
        </div>

        {/* Technical Summary */}
        <div style={styles.reportSection}>
          <h3 style={styles.sectionHeader}>2. TECHNICAL DIAGNOSTICS & VECTOR</h3>
          <p style={styles.summaryText}>{report.technical_summary}</p>
        </div>

        {/* Indicators of Compromise */}
        <div style={styles.reportSection}>
          <h3 style={styles.sectionHeader}>3. INDICATORS OF COMPROMISE (IOCS)</h3>
          <div style={styles.iocGrid}>
            <div style={styles.iocCol}>
              <span style={styles.iocHeaderLabel}>IP Addresses</span>
              <div style={styles.iocItemContainer}>
                {report.indicators_of_compromise?.ips?.map((ip, i) => (
                  <code key={i} style={styles.code}>{ip}</code>
                ))}
                {(!report.indicators_of_compromise?.ips || report.indicators_of_compromise.ips.length === 0) && (
                  <span style={styles.noIocs}>No IP indicators logged.</span>
                )}
              </div>
            </div>
            <div style={styles.iocCol}>
              <span style={styles.iocHeaderLabel}>Network Assets (Domains/URLs)</span>
              <div style={styles.iocItemContainer}>
                {report.indicators_of_compromise?.domains?.map((d, i) => (
                  <code key={i} style={styles.code}>{d}</code>
                ))}
                {report.indicators_of_compromise?.urls?.map((u, i) => (
                  <code key={i} style={styles.code}>{u}</code>
                ))}
                {(!report.indicators_of_compromise?.domains && !report.indicators_of_compromise?.urls) && (
                  <span style={styles.noIocs}>No network indicators logged.</span>
                )}
              </div>
            </div>
            <div style={styles.iocCol}>
              <span style={styles.iocHeaderLabel}>Target Vulnerability / CVEs</span>
              <div style={styles.iocItemContainer}>
                {report.indicators_of_compromise?.cves?.map((c, i) => (
                  <code key={i} style={styles.code}>{c}</code>
                ))}
                {(!report.indicators_of_compromise?.cves || report.indicators_of_compromise.cves.length === 0) && (
                  <span style={styles.noIocs}>No vulnerability indicators logged.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MITRE ATT&CK Mapping */}
        <div style={styles.reportSection}>
          <h3 style={styles.sectionHeader}>4. MITRE ATT&CK® MATRIX MAPPING</h3>
          <div style={styles.mitreCard}>
            <div style={styles.mitreCol}>
              <span style={styles.mitreLabel}>Tactic Category</span>
              <span style={styles.mitreVal}>{report.mitre_attack_mapping?.tactic || 'Credential Access'}</span>
            </div>
            <div style={styles.mitreCol}>
              <span style={styles.mitreLabel}>Technique Name</span>
              <span style={styles.mitreVal}>{report.mitre_attack_mapping?.technique || 'Brute Force'}</span>
            </div>
            <div style={styles.mitreCol}>
              <span style={styles.mitreLabel}>Technique ID</span>
              <code style={styles.code}>{report.mitre_attack_mapping?.technique_id || 'T1110'}</code>
            </div>
          </div>
          <p style={styles.mitreDesc}>{report.mitre_attack_mapping?.description}</p>
        </div>

        {/* Event Timeline */}
        <div style={styles.reportSection}>
          <h3 style={styles.sectionHeader}>5. EVENT CHRONOLOGY TIMELINE</h3>
          <div style={styles.timeline}>
            {report.timeline?.map((item, idx) => (
              <div key={idx} style={styles.timelineItem}>
                <div style={styles.timelineMarker} />
                <div style={styles.timelineContent}>
                  <span style={styles.timelineTime}>{item.timestamp}</span>
                  <p style={styles.timelineText}>{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Containment Playbook Actions */}
        <div style={styles.reportSection}>
          <h3 style={styles.sectionHeader}>6. RECOMMENDED CONTAINMENT AUDIT</h3>
          <div style={styles.playbook}>
            {report.recommended_containment?.map((act, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.playbookItem,
                  backgroundColor: containmentStatus[idx] ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                  borderColor: containmentStatus[idx] ? 'rgba(16, 185, 129, 0.2)' : '#1e293b'
                }}
                onClick={() => toggleContainmentStep(idx)}
              >
                {containmentStatus[idx] ? (
                  <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0 }} />
                ) : (
                  <Square size={18} color="#475569" style={{ flexShrink: 0 }} />
                )}
                <span style={{
                  ...styles.playbookText,
                  textDecoration: containmentStatus[idx] ? 'line-through' : 'none',
                  color: containmentStatus[idx] ? '#64748b' : '#f8fafc'
                }}>{act}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recovery and Analyst Notes */}
        <div style={styles.reportSection}>
          <h3 style={styles.sectionHeader}>7. POST-INCIDENT RECOVERY & ERADICATION</h3>
          <ul style={styles.recoveryList}>
            {report.recovery_steps?.map((step, idx) => (
              <li key={idx} style={styles.recoveryItem}>{step}</li>
            ))}
          </ul>
        </div>

        {/* Analyst Comments */}
        <div style={styles.reportSection} style={{ borderBottom: 'none' }}>
          <h3 style={styles.sectionHeader}>8. THREAT INTEL & FORENSIC NOTES</h3>
          <p style={styles.summaryText}>{report.analyst_notes}</p>
        </div>

        {/* Footer */}
        <div style={styles.reportFooter}>
          <span>AUTHORIZED SOC TEAM COPY • CONFIDENTIAL</span>
          <span>REPORT END IR-{report.report_id}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '900px',
    margin: '0 auto',
    paddingBottom: '40px',
  },
  centerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 0',
  },
  loadingCard: {
    width: '500px',
    textAlign: 'center',
    padding: '40px',
  },
  errorCard: {
    width: '500px',
    textAlign: 'center',
    padding: '40px',
  },
  errorActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  controlBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0c0f1d',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '12px 20px',
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
  },
  printBtn: {
    backgroundColor: '#0066ff',
    border: '1px solid rgba(0, 102, 255, 0.5)',
    borderRadius: '6px',
    padding: '8px 16px',
    color: '#f8fafc',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 102, 255, 0.2)',
  },
  retryBtn: {
    backgroundColor: '#3b82f6',
    border: '1px solid rgba(59, 130, 246, 0.5)',
    borderRadius: '6px',
    padding: '8px 16px',
    color: '#f8fafc',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  reportSheet: {
    backgroundColor: '#0c0f1d',
    borderRadius: '12px',
    border: '1px solid #1e293b',
    padding: '40px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '2px solid #1e293b',
    paddingBottom: '24px',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '24px',
  },
  irBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#00f2fe',
    letterSpacing: '1.5px',
    marginBottom: '8px',
  },
  irTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '800',
    color: '#f8fafc',
  },
  irSub: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '600',
    display: 'block',
    marginTop: '6px',
  },
  irMetaBlock: {
    display: 'flex',
    gap: '24px',
  },
  metaBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metaLabel: {
    fontSize: '10px',
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  metaVal: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#f8fafc',
  },
  reportSection: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '24px',
    marginBottom: '24px',
  },
  sectionHeader: {
    margin: '0 0 14px 0',
    fontSize: '13px',
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: '0.5px',
  },
  summaryText: {
    margin: 0,
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: '1.7',
  },
  iocGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  iocCol: {
    backgroundColor: '#080c15',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  iocHeaderLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    borderBottom: '1px solid #1e293b',
    paddingBottom: '6px',
  },
  iocItemContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  code: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '11px',
    color: '#00f2fe',
    wordBreak: 'break-all',
  },
  noIocs: {
    fontSize: '12px',
    color: '#475569',
  },
  mitreCard: {
    display: 'flex',
    gap: '28px',
    backgroundColor: '#080c15',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '14px',
  },
  mitreCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  mitreLabel: {
    fontSize: '10px',
    color: '#64748b',
    fontWeight: '700',
  },
  mitreVal: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#f8fafc',
  },
  mitreDesc: {
    margin: 0,
    fontSize: '13.5px',
    color: '#94a3b8',
    lineHeight: '1.6',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'relative',
    paddingLeft: '24px',
  },
  timelineItem: {
    position: 'relative',
  },
  timelineMarker: {
    position: 'absolute',
    left: '-24px',
    top: '4px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#00f2fe',
    boxShadow: '0 0 8px #00f2fe',
  },
  timelineContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  timelineTime: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
  },
  timelineText: {
    margin: 0,
    fontSize: '13.5px',
    color: '#94a3b8',
    lineHeight: '1.5',
  },
  playbook: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  playbookItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '14px 18px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  playbookText: {
    fontSize: '13px',
    fontWeight: '600',
  },
  recoveryList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: '1.7',
  },
  recoveryItem: {
    marginBottom: '8px',
  },
  reportFooter: {
    marginTop: '32px',
    borderTop: '2px solid #1e293b',
    paddingTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: '#475569',
    fontWeight: '700',
    letterSpacing: '1px',
  },
};
