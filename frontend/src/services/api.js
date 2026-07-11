/**
 * API Service for communicating with the SOC Copilot Flask backend.
 * In development, uses the Vite proxy (/api/* → http://127.0.0.1:5001/*).
 * In production (Vercel), uses VITE_API_URL pointing directly to the Render backend.
 */

// In dev: VITE_API_URL is undefined → use /api (Vite proxy strips /api before hitting Flask).
// In prod: VITE_API_URL = Render URL → Flask routes are at /upload, /parse, etc. (no /api prefix).
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function uploadLogFile(file, onUploadProgress) {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && typeof onUploadProgress === 'function') {
        const percent = Math.round((event.loaded / event.total) * 100);
        onUploadProgress(percent);
      }
    };

    xhr.onload = async () => {
      let responseData = {};
      try {
        responseData = JSON.parse(xhr.responseText || '{}');
      } catch {
        responseData = {};
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(responseData);
      } else {
        reject(new Error(responseData.error || `Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Upload failed due to a network error.'));
    };

    xhr.send(formData);
  });
}

export async function parseLogFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/parse`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Parsing failed with status ${response.status}`);
  }

  return response.json();
}

export async function extractIOCs(parsedLogs) {
  const response = await fetch(`${API_BASE}/ioc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parsedLogs),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `IOC extraction failed with status ${response.status}`);
  }

  return response.json();
}

export async function analyzeThreats(parsedLogs, iocs = null) {
  const payload = {
    logs: parsedLogs,
  };
  if (iocs) {
    payload.iocs = iocs;
  }

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Threat analysis failed with status ${response.status}`);
  }

  return response.json();
}

export async function generateReport(analysis, parsedLogs = null) {
  const payload = {
    analysis: analysis,
  };
  if (parsedLogs) {
    payload.logs = parsedLogs;
  }

  const response = await fetch(`${API_BASE}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Report generation failed with status ${response.status}`);
  }

  return response.json();
}

export async function runIncidentWorkflow(file, onProgress) {
  const notifyProgress = (message, percent) => {
    if (typeof onProgress === 'function') {
      onProgress({ message, percent });
    }
  };

  notifyProgress('Uploading security log...', 5);
  const upload = await uploadLogFile(file, (uploadPercent) => {
    notifyProgress(`Uploading security log... ${uploadPercent}%`, Math.max(5, Math.min(25, Math.round(uploadPercent * 0.25))));
  });

  notifyProgress('Upload complete. Parsing uploaded log events...', 35);
  const parsedLogs = await parseLogFile(file);
  if (!Array.isArray(parsedLogs) || parsedLogs.length === 0) {
    throw new Error('Logs were parsed but no events were found.');
  }

  notifyProgress('Extracting indicators of compromise...', 55);
  const extractedIocs = await extractIOCs(parsedLogs);

  notifyProgress('Running AI threat analysis...', 75);
  const threatAnalysis = await analyzeThreats(parsedLogs, extractedIocs);

  notifyProgress('Generating incident report...', 90);
  const incidentReport = await generateReport(threatAnalysis, parsedLogs);
  notifyProgress('Incident report ready.', 100);

  return {
    upload,
    parsedLogs,
    extractedIocs,
    threatAnalysis,
    incidentReport,
  };
}
