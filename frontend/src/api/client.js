// Configurable API base URL: supports standalone hosting on Vercel/Netlify/Cloudflare
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMsg = (typeof data === 'object' && data?.detail) ? data.detail : (typeof data === 'string' && data ? data : `Request failed with status ${res.status}`);
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${url}]:`, err);
    throw err;
  }
}

export const api = {
  // Trials
  fetchTrial: (nctId) => request(`/trials/${encodeURIComponent(nctId)}`),
  importTrial: (nctId) => request(`/trials/${encodeURIComponent(nctId)}/import`, { method: 'POST' }),
  parseCriteria: (nctId) => request(`/trials/${encodeURIComponent(nctId)}/parse-criteria`, { method: 'POST' }),
  uploadTrialDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/trials/upload-document', { method: 'POST', body: formData });
  },

  // Candidate Matching
  getDbCandidates: (nctId, limit = 50, maxEvaluate = 200) =>
    request(`/trials/${encodeURIComponent(nctId)}/db-candidates?limit=${limit}&max_evaluate=${maxEvaluate}`),
  matchDbPatient: (nctId, patientId) =>
    request(`/trials/${encodeURIComponent(nctId)}/match/${encodeURIComponent(patientId)}`, { method: 'POST' }),
  getLabResult: (labResultId) => request(`/lab-results/${labResultId}`),

  // Trial Progress & Lab Outcomes
  getTrialProgress: (nctId, primaryTestCode = null) => {
    const param = primaryTestCode ? `?primary_test_code=${encodeURIComponent(primaryTestCode)}` : '';
    return request(`/trials/${encodeURIComponent(nctId)}/progress${param}`);
  },
  computeMetrics: (nctId, primaryTestCode = null) => {
    const param = primaryTestCode ? `?primary_test_code=${encodeURIComponent(primaryTestCode)}` : '';
    return request(`/trials/${encodeURIComponent(nctId)}/compute-metrics${param}`, { method: 'POST' });
  },

  // Enrollment & Workflow Transitions
  invitePatient: (nctId, patientId) =>
    request(`/trials/${encodeURIComponent(nctId)}/patients/${encodeURIComponent(patientId)}/invite`, { method: 'POST' }),
  consentPatient: (nctId, patientId) =>
    request(`/trials/${encodeURIComponent(nctId)}/patients/${encodeURIComponent(patientId)}/consent`, { method: 'POST' }),
  enrollPatient: (nctId, patientId) =>
    request(`/trials/${encodeURIComponent(nctId)}/patients/${encodeURIComponent(patientId)}/enroll`, { method: 'POST' }),
  withdrawPatient: (nctId, patientId, actor = 'researcher') =>
    request(`/trials/${encodeURIComponent(nctId)}/patients/${encodeURIComponent(patientId)}/withdraw?actor=${encodeURIComponent(actor)}`, { method: 'POST' }),
  declinePatient: (nctId, patientId) =>
    request(`/trials/${encodeURIComponent(nctId)}/patients/${encodeURIComponent(patientId)}/decline`, { method: 'POST' }),
  getTrialEnrollment: (nctId) => request(`/trials/${encodeURIComponent(nctId)}/enrollment`),
  getPatientEnrollment: (patientId) => request(`/patients/${encodeURIComponent(patientId)}/enrollment`),
  getTrialAudit: (nctId, limit = 200) => request(`/trials/${encodeURIComponent(nctId)}/audit?limit=${limit}`),

  // Patient Intake & Profile
  patientSignup: (payload) =>
    request('/patients/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  listPatients: () => request('/patients'),
  getPatient: (patientId) => request(`/patients/${encodeURIComponent(patientId)}`),

  // Lab & Document Ingestion
  uploadLabReportText: (patientId, text) =>
    request(`/patients/${encodeURIComponent(patientId)}/upload-lab`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }),
  uploadLabReportFile: (patientId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/patients/${encodeURIComponent(patientId)}/upload-lab-file`, {
      method: 'POST',
      body: formData,
    });
  },
  uploadPatientDocument: (patientId, documentType, file) => {
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', file);
    return request(`/patients/${encodeURIComponent(patientId)}/upload-document`, {
      method: 'POST',
      body: formData,
    });
  },

  // Sandbox & Audit
  parseCriteriaRaw: (text) =>
    request('/parse-criteria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }),
  matchPatientRaw: (payload) =>
    request('/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  getMemoryCandidates: (nctId) => request(`/trials/${encodeURIComponent(nctId)}/candidates`),
  getAuditLog: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/audit-log${query ? `?${query}` : ''}`);
  },
  getFlaggedForReview: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/flagged-for-review${query ? `?${query}` : ''}`);
  },
};
