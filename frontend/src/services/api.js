/**
 * API Service for communicating with the SOC Copilot Flask backend.
 * Uses the local Vite proxy configuration (/api/* redirects to http://127.0.0.1:5001/*).
 */

export async function uploadLogFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed with status ${response.status}`);
  }

  return response.json();
}

export async function parseLogFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/parse', {
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
  const response = await fetch('/api/ioc', {
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

  const response = await fetch('/api/analyze', {
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

  const response = await fetch('/api/report', {
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
