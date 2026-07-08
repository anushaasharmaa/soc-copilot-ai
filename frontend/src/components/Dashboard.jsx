import React from 'react';
import { Shield, AlertTriangle, ShieldAlert, Cpu, Network, FileText, Plus, Radio, Clock, UserCheck, RotateCcw } from 'lucide-react';
import IncidentReport from './IncidentReport';

export default function Dashboard({ uploadedData, onNavigate, onReset }) {
  const hasData = !!uploadedData;
  const analysis = uploadedData?.threatAnalysis || {};
  const parsedLogs = uploadedData?.parsedLogs || [];
  const iocs = uploadedData?.extractedIocs || { ips: [], domains: [], urls: [], emails: [], hashes: [], cves: [] };
  const report = uploadedData?.incidentReport || null;
  const upload = uploadedData?.upload || null;
  const totalIocs = iocs.ips.length + iocs.domains.length + iocs.urls.length + iocs.emails.length + iocs.hashes.length + iocs.cves.length;
  const mitreTechniqueId = report?.mitre_attack_mapping?.technique_id || analysis.mitre_attack?.split(' - ')[0] || 'N/A';
  const mitreTechnique = report?.mitre_attack_mapping?.technique || analysis.technique || 'N/A';
  const mitreTactic = report?.mitre_attack_mapping?.tactic || analysis.tactic || 'N/A';
  const mitreDescription = report?.mitre_attack_mapping?.description || 'No MITRE ATT&CK mapping returned yet.';

  const incidentFeed = hasData
    ? (report?.timeline?.length ? report.timeline : parsedLogs.slice(0, 3)).slice(0, 3).map((item, index) => ({
        id: report?.report_id ? `${report.report_id}-${index + 1}` : `LOG-${index + 1}`,
        timestamp: item.timestamp || upload?.upload_time || 'N/A',
        title: item.event || item.message || analysis.attack_type || 'Telemetry event observed',
        severity: report?.severity || analysis.severity || 'Low',
        status: index === 0 ? 'Latest' : 'Observed',
      }))
    : [
        { id: 'INC-1022', timestamp: '10 min ago', title: 'Unauthorized Administrator Logon Attempt', severity: 'High', status: 'Investigating' },
        { id: 'INC-1021', timestamp: '1 hour ago', title: 'PowerShell Encoded Command Process Spawn', severity: 'Critical', status: 'Mitigated' },
        { id: 'INC-1020', timestamp: '4 hours ago', title: 'Multi-host ICMP Internal Sweep', severity: 'Medium', status: 'Closed' }
      ];

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
    <div style={styles.grid}>
      <div style={styles.spanFull}>
        <div className="card" style={styles.welcomeCard}>
          <div style={styles.welcomeInfo}>
            <Radio size={20} color="#00f2fe" className="animate-blink" />
            <div>
              <h2 style={{ margin: 0, fontSize: '18px' }}>ACTIVE SECURITY MONITORING SYSTEM</h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                LOG ANALYTICS CONSOLE OVERVIEW • CONFIGURED MODELS: GEMINI-2.5-FLASH
              </p>
              {hasData && (
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Source: {uploadedData.filename} {upload?.upload_time ? `• Uploaded ${new Date(upload.upload_time).toLocaleString()}` : ''}
                </p>
              )}
            </div>
          </div>
          <div style={styles.headerActions}>
            {hasData && (
              <button style={styles.resetBtn} onClick={onReset}>
                <RotateCcw size={16} />
                <span>RESET SESSION</span>
              </button>
            )}
            <button style={styles.quickUploadBtn} onClick={() => onNavigate('upload')}>
              <Plus size={16} />
              <span>INGEST NEW LOG SOURCE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full incident report is rendered below when available */}

      <div style={styles.spanFull}>
        <div style={styles.statsRow}>
          <div className="card" style={styles.statCard}>
            <ShieldAlert size={24} color={getSeverityColor(report?.severity || analysis.severity || 'low')} />
            <div>
              <span style={styles.statLabel}>THREAT SEVERITY</span>
              <h3 style={{ ...styles.statVal, color: getSeverityColor(report?.severity || analysis.severity || 'low') }}>
                {report?.severity || analysis.severity || 'NORMAL'}
              </h3>
            </div>
          </div>
          <div className="card" style={styles.statCard}>
            <AlertTriangle size={24} color="#eab308" />
            <div>
              <span style={styles.statLabel}>AI RISK SCORE</span>
              <h3 style={styles.statVal}>{hasData ? `${report?.risk_score ?? analysis.risk_score ?? 0}/100` : '0/100'}</h3>
            </div>
          </div>
          <div className="card" style={styles.statCard}>
            <Cpu size={24} color="#0066ff" />
            <div>
              <span style={styles.statLabel}>LOG TELEMETRY ITEMS</span>
              <h3 style={styles.statVal}>{parsedLogs.length} EVENTS</h3>
            </div>
          </div>
          <div className="card" style={styles.statCard}>
            <Network size={24} color="#00f2fe" />
            <div>
              <span style={styles.statLabel}>EXTRACTED IOCS</span>
              <h3 style={styles.statVal}>{totalIocs} UNIQUE</h3>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.spanEight}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-title">
              <Cpu size={18} color="#0066ff" />
              <span>CO-PILOT THREAT EVALUATION SUMMARY</span>
            </div>
            {hasData ? (
              <div>
                <div style={styles.threatHeader}>
                  <span style={styles.threatTypeLabel}>DETECTED ATTACK CLASS:</span>
                  <span style={styles.threatTypeValue}>{analysis.attack_type || report?.mitre_attack_mapping?.technique || 'Unknown'}</span>
                </div>
                <div style={styles.reasoningBox}>
                  <h4 style={styles.reasoningTitle}>AI Incident Reasoning</h4>
                  <p style={styles.reasoningText}>{analysis.reasoning || report?.technical_summary}</p>
                </div>
                <div style={styles.actionsBox}>
                  <h4 style={styles.reasoningTitle}>Containment Playbook Guidelines</h4>
                  <ul style={styles.actionsList}>
                    {(report?.recommended_containment || analysis.recommended_actions || []).map((act, index) => (
                      <li key={index} style={styles.actionItem}>{act}</li>
                    ))}
                  </ul>
                </div>
                <div style={styles.resultsBtnContainer}>
                  <button style={styles.detailsBtn} onClick={() => onNavigate('analysis')}>
                    VIEW FULL DETAILED ANALYSIS
                  </button>
                  <button style={styles.reportBtn} onClick={() => onNavigate('report')}>
                    <FileText size={16} />
                    <span>OPEN FULL INCIDENT REPORT</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <Shield size={36} color="#1e293b" />
                <span>No logs uploaded yet. Ingest a log source to evaluate threat alerts.</span>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title">
              <Network size={18} color="#00f2fe" />
              <span>MITRE ATT&CK® TACTICAL ALIGNMENT MATRIX</span>
            </div>
            {hasData ? (
              <>
                <div style={styles.mitreDetailsGrid}>
                  <div style={styles.mitreDetailCard}>
                    <span style={styles.mitreColTitle}>Tactic</span>
                    <span style={styles.mitreCellActive}>{mitreTactic}</span>
                  </div>
                  <div style={styles.mitreDetailCard}>
                    <span style={styles.mitreColTitle}>Technique</span>
                    <span style={styles.mitreCellActive}>{mitreTechnique}</span>
                  </div>
                  <div style={styles.mitreDetailCard}>
                    <span style={styles.mitreColTitle}>Technique ID</span>
                    <span style={styles.mitreCellActive}>{mitreTechniqueId}</span>
                  </div>
                </div>
                <div style={styles.mitreSummary}>
                  <span style={styles.mitreHighlight}>Description:</span> {mitreDescription}
                </div>
              </>
            ) : (
              <div style={styles.emptyState}>
                <span>No MITRE ATT&CK mapping available yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.spanFour}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-title">
              <Shield size={18} color="#ef4444" />
              <span>LOG EXTRACTED IOC WIDGET</span>
            </div>
            {hasData ? (
              <div style={styles.iocSection}>
                <div style={styles.iocRow}>
                  <span style={styles.iocLabel}>IP Addresses</span>
                  <span style={styles.iocBadge}>{iocs.ips.length} Found</span>
                </div>
                <div style={styles.iocList}>
                  {iocs.ips.slice(0, 3).map((ip, i) => (
                    <code key={i} style={styles.code}>{ip}</code>
                  ))}
                  {iocs.ips.length === 0 && <span style={styles.noneText}>None</span>}
                </div>

                <div style={styles.iocRow}>
                  <span style={styles.iocLabel}>Domains & URLs</span>
                  <span style={styles.iocBadge}>{iocs.domains.length + iocs.urls.length} Found</span>
                </div>
                <div style={styles.iocList}>
                  {iocs.domains.slice(0, 2).map((dom, i) => (
                    <code key={i} style={styles.code}>{dom}</code>
                  ))}
                  {iocs.urls.slice(0, 1).map((url, i) => (
                    <code key={i} style={styles.code}>{url}</code>
                  ))}
                  {iocs.domains.length + iocs.urls.length === 0 && <span style={styles.noneText}>None</span>}
                </div>

                <div style={styles.iocRow}>
                  <span style={styles.iocLabel}>File Hashes</span>
                  <span style={styles.iocBadge}>{iocs.hashes.length} Found</span>
                </div>
                <div style={styles.iocList}>
                  {iocs.hashes.slice(0, 2).map((hash, i) => (
                    <code key={i} style={styles.code}>{hash.substring(0, 16)}...</code>
                  ))}
                  {iocs.hashes.length === 0 && <span style={styles.noneText}>None</span>}
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <span>No IOC alerts processed yet.</span>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title">
              <Clock size={18} color="#64748b" />
              <span>RECENT TELEMETRY INCIDENTS</span>
            </div>
            <div style={styles.incidentList}>
              {incidentFeed.map((inc) => (
                <div key={inc.id} style={styles.incidentItem}>
                  <div style={styles.incidentHeader}>
                    <span style={styles.incId}>{inc.id}</span>
                    <span style={{
                      ...styles.incSeverity,
                      color: inc.severity === 'Critical' ? '#ef4444' : inc.severity === 'High' ? '#f97316' : '#eab308'
                    }}>{inc.severity}</span>
                  </div>
                  <span style={styles.incTitle}>{inc.title}</span>
                  <div style={styles.incidentFooter}>
                    <span style={styles.incTime}>{inc.timestamp}</span>
                    <div style={styles.incStatusWrapper}>
                      <UserCheck size={12} color="#10b981" />
                      <span style={styles.incStatus}>{inc.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Render full incident report on the dashboard once available */}
      {report && (
        <div style={styles.spanFull}>
          <IncidentReport
            uploadedData={uploadedData}
            onReportGenerated={() => {}}
            onNavigate={onNavigate}
            onReset={onReset}
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '24px',
    marginTop: '8px',
  },
  spanFull: {
    gridColumn: 'span 12',
  },
  spanEight: {
    gridColumn: 'span 8',
    '@media (max-width: 1024px)': {
      gridColumn: 'span 12',
    },
  },
  spanFour: {
    gridColumn: 'span 4',
    '@media (max-width: 1024px)': {
      gridColumn: 'span 12',
    },
  },
  welcomeCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#090d16',
    border: '1px dashed #1e293b',
    borderRadius: '8px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  welcomeInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  quickUploadBtn: {
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
  resetBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #1e293b',
    borderRadius: '6px',
    padding: '10px 18px',
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    width: '100%',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '18px 24px',
  },
  statLabel: {
    fontSize: '10px',
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  statVal: {
    margin: '4px 0 0 0',
    fontSize: '18px',
    fontWeight: '800',
    color: '#f8fafc',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '40px 0',
    color: '#475569',
    fontSize: '14px',
    textAlign: 'center',
  },
  threatHeader: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '20px',
  },
  threatTypeLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '700',
  },
  threatTypeValue: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#f8fafc',
  },
  reasoningBox: {
    backgroundColor: '#080c15',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
  },
  reasoningTitle: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: '700',
    color: '#38bdf8',
    letterSpacing: '0.5px',
  },
  reasoningText: {
    margin: 0,
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: '1.6',
  },
  actionsBox: {
    backgroundColor: '#080c15',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '28px',
  },
  actionsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: '1.7',
  },
  reportSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  reportSummaryPanel: {
    backgroundColor: '#080c15',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '16px',
  },
  reportPanelLabel: {
    display: 'block',
    marginBottom: '10px',
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  reportPanelText: {
    margin: 0,
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: '1.7',
  },
  reportList: {
    margin: 0,
    paddingLeft: '18px',
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: '1.7',
  },
  actionItem: {
    marginBottom: '6px',
  },
  resultsBtnContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '20px',
  },
  detailsBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #1e293b',
    borderRadius: '6px',
    padding: '10px 18px',
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
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
  mitreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },
  mitreColumn: {
    backgroundColor: '#080c15',
    border: '1px solid #1e293b',
    borderRadius: '6px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  mitreColTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    borderBottom: '1px solid #1e293b',
    paddingBottom: '6px',
    marginBottom: '4px',
    textAlign: 'center',
  },
  mitreCell: {
    fontSize: '10px',
    color: '#334155',
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.02)',
    padding: '8px',
    borderRadius: '4px',
    textAlign: 'center',
  },
  mitreCellActive: {
    fontSize: '10px',
    color: '#00f2fe',
    backgroundColor: 'rgba(0, 242, 254, 0.05)',
    border: '1px solid rgba(0, 242, 254, 0.2)',
    padding: '8px',
    borderRadius: '4px',
    fontWeight: '600',
    textAlign: 'center',
    boxShadow: '0 0 10px rgba(0, 242, 254, 0.05)',
  },
  mitreSummary: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  mitreDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  mitreDetailCard: {
    backgroundColor: '#080c15',
    border: '1px solid #1e293b',
    borderRadius: '6px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  mitreHighlight: {
    color: '#64748b',
    fontWeight: '600',
  },
  iocSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  iocRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iocLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '0.5px',
  },
  iocBadge: {
    fontSize: '10px',
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    padding: '2px 8px',
    borderRadius: '20px',
    fontWeight: '600',
  },
  iocList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backgroundColor: '#080c15',
    border: '1px solid #1e293b',
    borderRadius: '6px',
    padding: '12px',
  },
  code: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '11.5px',
    color: '#38bdf8',
    wordBreak: 'break-all',
  },
  noneText: {
    fontSize: '12px',
    color: '#475569',
  },
  incidentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  incidentItem: {
    backgroundColor: '#080c15',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
  },
  incidentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    fontWeight: '700',
  },
  incId: {
    color: '#64748b',
  },
  incSeverity: {
    letterSpacing: '0.5px',
  },
  incTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#f8fafc',
    lineHeight: '1.4',
  },
  incidentFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#475569',
    marginTop: '4px',
  },
  incStatusWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  incStatus: {
    color: '#10b981',
    fontWeight: '600',
  },
};
