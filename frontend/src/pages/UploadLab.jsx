import { useEffect, useState } from 'react';

const css = `
  .upload-lab-page * { box-sizing: border-box; }
  .upload-lab-page {
    margin: 0;
    background: #0f1115;
    background-image: radial-gradient(circle at top left, rgba(74, 222, 128, 0.15), transparent 40%),
                      radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.15), transparent 40%),
                      radial-gradient(circle at 50% 50%, rgba(26, 29, 35, 0.8), #0f1115 100%);
    background-attachment: fixed;
    color: #f3f4f6;
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 14px; line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }
  @media (prefers-reduced-motion: reduce) {
    .upload-lab-page * { transition: none !important; animation: none !important; }
  }
  .upload-lab-page :focus-visible { outline: 2px solid #38bdf8; outline-offset: 2px; }
  .upload-lab-page .mono { font-family: ui-monospace, "SF Mono", "Cascadia Code", "Consolas", monospace; }
  .upload-lab-page .session-bar {
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 0.85rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between;
    gap: 1rem; flex-wrap: wrap;
  }
  .upload-lab-page .session-left { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
  .upload-lab-page .home-link {
    display: flex; align-items: center; gap: 0.4rem;
    color: #f3f4f6; font-weight: 600; font-size: 13px;
    border-radius: 12px; transition: color 300ms;
    cursor: pointer; background: none; border: none; padding: 0.2rem 0.3rem;
  }
  .upload-lab-page .home-link:hover { color: #38bdf8; }
  .upload-lab-page .home-mark { color: #4ade80; }
  .upload-lab-page .crumb-sep { color: #6b7280; font-size: 12px; }
  .upload-lab-page .crumb-link {
    color: #9ca3af; text-decoration: none; font-size: 13px;
    cursor: pointer; background: none; border: none; padding: 0;
  }
  .upload-lab-page .crumb-link:hover { color: #f3f4f6; }
  .upload-lab-page .role-badge {
    font-family: ui-monospace, monospace; font-size: 10px;
    letter-spacing: 0.06em; text-transform: uppercase;
    padding: 0.2rem 0.5rem; border-radius: 12px;
    background: rgba(74,222,128,0.15); color: #4ade80;
  }
  .upload-lab-page .session-name { color: #9ca3af; font-size: 13px; }
  .upload-lab-page .signout-btn {
    background: transparent; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 0.4rem 0.8rem;
    color: #9ca3af; font-size: 12.5px; cursor: pointer;
    transition: border-color 300ms, color 300ms;
  }
  .upload-lab-page .signout-btn:hover { border-color: #6b7280; color: #f3f4f6; }
  .upload-lab-page main {
    max-width: 680px; margin: 3rem auto;
    background: rgba(26,29,35,0.45);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 2.5rem;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .upload-lab-page .page-title { font-size: 19px; font-weight: 600; margin: 0 0 0.3rem; }
  .upload-lab-page .page-sub { color: #9ca3af; font-size: 13.5px; margin: 0 0 1.75rem; max-width: 56ch; }
  .upload-lab-page .panel {
    background: rgba(26,29,35,0.7);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 1.25rem 1.4rem; margin-bottom: 1.25rem;
  }
  .upload-lab-page label {
    display: block; font-family: ui-monospace, monospace;
    font-size: 10.5px; letter-spacing: 0.06em; text-transform: uppercase;
    color: #6b7280; margin-bottom: 0.6rem;
  }
  .upload-lab-page textarea {
    width: 100%; min-height: 190px;
    background: rgba(35,40,48,0.8);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; color: #f3f4f6;
    font-family: ui-monospace, monospace;
    font-size: 12.5px; line-height: 1.6;
    padding: 0.85rem; resize: vertical;
    transition: border-color 300ms;
  }
  .upload-lab-page textarea:focus { border-color: #38bdf8; outline: none; }
  .upload-lab-page textarea::placeholder { color: #6b7280; }
  .upload-lab-page .panel-actions {
    display: flex; align-items: center; justify-content: space-between;
    gap: 0.75rem; margin-top: 0.9rem; flex-wrap: wrap;
  }
  .upload-lab-page .sample-btn {
    background: transparent; border: none; color: #38bdf8;
    font-size: 12.5px; cursor: pointer; padding: 0;
  }
  .upload-lab-page .sample-btn:hover { text-decoration: underline; }
  .upload-lab-page .btn {
    padding: 0.65rem 1.1rem; border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(56,189,248,0.15); color: #38bdf8;
    cursor: pointer; font-size: 13.5px; font-weight: 600;
    transition: border-color 300ms, background 300ms;
  }
  .upload-lab-page .btn:hover { background: rgba(91,141,184,0.24); }
  .upload-lab-page .btn:disabled { opacity: 0.5; cursor: default; }
  .upload-lab-page .status-line { font-size: 12.5px; color: #9ca3af; margin-top: 0.75rem; }
  .upload-lab-page .status-line.error { color: #f87171; }
  .upload-lab-page .results-panel { display: none; }
  .upload-lab-page .results-panel.show { display: block; }
  .upload-lab-page .results-headline { font-weight: 600; font-size: 14.5px; color: #4ade80; margin-bottom: 0.3rem; }
  .upload-lab-page .results-source { font-size: 12.5px; color: #9ca3af; margin-bottom: 1rem; }
  .upload-lab-page .lab-row {
    display: grid; grid-template-columns: 1fr auto auto;
    align-items: baseline; gap: 0.75rem;
    padding: 0.6rem 0; border-top: 1px solid rgba(255,255,255,0.08);
  }
  .upload-lab-page .lab-row:first-of-type { border-top: none; }
  .upload-lab-page .lab-name { font-size: 13px; }
  .upload-lab-page .lab-code { font-family: ui-monospace, monospace; font-size: 10.5px; color: #6b7280; margin-left: 0.4rem; }
  .upload-lab-page .lab-value { font-family: ui-monospace, monospace; font-size: 14px; text-align: right; }
  .upload-lab-page .lab-unit { font-family: ui-monospace, monospace; font-size: 11.5px; color: #9ca3af; text-align: right; min-width: 5.5rem; }
  .upload-lab-page .flag-note {
    display: inline-block; margin-top: 0.15rem;
    font-family: ui-monospace, monospace; font-size: 10px;
    letter-spacing: 0.03em; text-transform: uppercase;
    color: #fbbf24; background: rgba(251,191,36,0.15);
    padding: 0.1rem 0.4rem; border-radius: 12px;
  }
  .upload-lab-page .dropped-note { font-size: 12px; color: #fbbf24; margin-top: 0.9rem; }
  .upload-lab-page .again-link {
    display: inline-block; margin-top: 1.1rem;
    color: #38bdf8; font-size: 12.5px;
    cursor: pointer; background: none; border: none; padding: 0;
  }
  .upload-lab-page .again-link:hover { text-decoration: underline; }
  .upload-lab-page .footnote { color: #6b7280; font-size: 11px; margin-top: 2rem; text-align: center; }
`;

const SAMPLE_REPORT = `Quest Diagnostics — Report Date: 2026-08-05

Glycated Haemoglobin (HbA1c): 6.1 %
Estimated GFR: 72 mL/min
ALT: 34 U/L
AST: 29 U/L
Total Cholesterol: 188 mg/dL

Comments: Patient advised to continue current diet and follow up in 3 months.`;

export default function UploadLab({ navigate }) {
  const [reportText, setReportText] = useState('');
  const [status, setStatus] = useState({ text: '', error: false });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const patientId = sessionStorage.getItem('tm_patient_id');
  const patientName = sessionStorage.getItem('tm_patient_name');

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'upload-lab-styles';
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => { if (!patientId) navigate('patient-login'); }, [patientId]);

  const signOut = () => {
    sessionStorage.removeItem('tm_patient_name');
    sessionStorage.removeItem('tm_patient_id');
    navigate('landing');
  };

  const handleSubmit = async () => {
    const text = reportText.trim();
    if (!text) { setStatus({ text: 'Paste a lab report first.', error: true }); return; }
    setStatus({ text: 'Reading your report and extracting values…', error: false });
    setLoading(true); setResults(null);
    try {
      const res = await fetch(`/patients/${encodeURIComponent(patientId)}/upload-lab`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus({ text: data.detail || 'Could not process this report.', error: true }); setLoading(false); return; }
      setStatus({ text: '', error: false });
      setResults(data);
    } catch { setStatus({ text: 'Could not reach the server. Try again.', error: true }); }
    setLoading(false);
  };

  return (
    <div className="upload-lab-page">
      <div className="session-bar">
        <div className="session-left">
          <button className="home-link" onClick={() => navigate('landing')}><span className="home-mark">◆</span> TriMatch</button>
          <span className="crumb-sep">›</span>
          <button className="crumb-link" onClick={() => navigate('patient-home')}>Patient Portal</button>
          <span className="crumb-sep">›</span>
          <span className="role-badge">Upload lab report</span>
          <span className="session-name">{patientName || ''}</span>
        </div>
        <button className="signout-btn" onClick={signOut}>Sign out</button>
      </div>

      <main>
        <div className="page-title">Upload a lab report</div>
        <div className="page-sub">Paste the text of a lab report below. We'll read it, pull out the individual test results, and add them to your record — each one linked back to this upload so it stays traceable.</div>

        <div className="panel">
          <label htmlFor="reportText">Lab report text</label>
          <textarea id="reportText" placeholder="Paste your lab report text here…" value={reportText} onChange={e => setReportText(e.target.value)} />
          <div className="panel-actions">
            <button className="sample-btn" onClick={() => setReportText(SAMPLE_REPORT)}>Use a sample report</button>
            <button className="btn" onClick={handleSubmit} disabled={loading}>Extract &amp; add to my record</button>
          </div>
          {status.text && <div className={`status-line${status.error ? ' error' : ''}`}>{status.text}</div>}
        </div>

        {results && (
          <div className="panel results-panel show">
            <div className="results-headline" style={{ color: results.extracted?.length ? '#4ade80' : '#fbbf24' }}>
              {results.extracted?.length ? `Extracted ${results.extracted.length} lab value${results.extracted.length === 1 ? '' : 's'} and added to your record` : 'No lab values found'}
            </div>
            {results.extracted?.length > 0 && (
              <div className="results-source">source: <span className="mono">{results.document_name}</span> · document #{results.document_id}</div>
            )}
            {results.extracted?.map((lab, i) => (
              <div className="lab-row" key={i}>
                <div>
                  <span className="lab-name">{lab.test_name}</span><span className="lab-code">{lab.test_code}</span>
                  {lab.flagged_unmapped && <div className="flag-note" title="This test does not match one of our standard codes yet -- stored as-is, flagged for review.">unmapped code</div>}
                </div>
                <div className="lab-value mono">{lab.value}</div>
                <div className="lab-unit">{lab.unit || ''} · {lab.test_date ? lab.test_date.slice(0, 10) : ''}</div>
              </div>
            ))}
            {results.dropped_count > 0 && (
              <div className="dropped-note">{results.dropped_count} line{results.dropped_count === 1 ? '' : 's'} in your report couldn't be read as a lab value and {results.dropped_count === 1 ? 'was' : 'were'} skipped.</div>
            )}
            <button className="again-link" onClick={() => { setReportText(''); setResults(null); setStatus({ text: '', error: false }); }}>Upload another report</button>
          </div>
        )}

        <div className="footnote">This is a prototype for demonstration — extracted values are synthetic and not medical advice.</div>
      </main>
    </div>
  );
}
