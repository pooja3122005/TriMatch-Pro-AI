import { useEffect, useState } from 'react';

const css = `
  :root {
    --bg-dark: #0f1115;
    --panel-glass: rgba(26, 29, 35, 0.7);
    --border-glass: rgba(255, 255, 255, 0.08);
    --text-main: #f3f4f6;
    --text-muted: #9ca3af;
    --text-dim: #6b7280;
    --pass: #4ade80;
    --pass-dim: rgba(74, 222, 128, 0.1);
    --pass-hover: rgba(74, 222, 128, 0.2);
    --radius: 12px;
    --font-ui: 'Inter', -apple-system, sans-serif;
    --ease-smooth: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .patient-login-page * { box-sizing: border-box; }
  .patient-login-page {
    margin: 0;
    background: var(--bg-dark);
    background-image: radial-gradient(circle at top right, rgba(74, 222, 128, 0.08), transparent 40%);
    background-attachment: fixed;
    color: var(--text-main);
    font-family: var(--font-ui);
    font-size: 15px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    display: flex;
    justify-content: center;
    padding: 3rem 1.25rem;
    min-height: 100vh;
  }
  @media (prefers-reduced-motion: reduce) {
    .patient-login-page * { transition: none !important; animation: none !important; }
  }
  .patient-login-page :focus-visible { outline: 2px solid var(--pass); outline-offset: 2px; }
  .patient-login-page .card {
    width: 100%; max-width: 420px;
    background: var(--panel-glass);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--border-glass);
    border-radius: var(--radius);
    padding: 2.5rem;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    animation: plFadeIn 0.5s ease-out;
    height: fit-content;
  }
  @keyframes plFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .patient-login-page .back-link {
    display: inline-block; color: var(--text-muted);
    text-decoration: none; font-size: 13px;
    margin-bottom: 2rem;
    transition: color var(--ease-smooth);
    cursor: pointer; background: none; border: none; padding: 0;
  }
  .patient-login-page .back-link:hover { color: var(--text-main); }
  .patient-login-page .badge-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
  .patient-login-page .portal-icon {
    width: 36px; height: 36px; border-radius: 8px;
    background: var(--pass-dim); color: var(--pass);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700; flex-shrink: 0;
    border: 1px solid rgba(74, 222, 128, 0.2);
  }
  .patient-login-page h1 { font-size: 22px; font-weight: 600; margin: 0; color: #fff; }
  .patient-login-page .sub { color: var(--text-muted); font-size: 14px; margin: 0.4rem 0 2rem; }
  .patient-login-page label {
    display: block; font-size: 12px; font-weight: 500;
    letter-spacing: 0.05em; text-transform: uppercase;
    color: var(--text-muted); margin-bottom: 0.5rem;
  }
  .patient-login-page .field { margin-bottom: 1.5rem; }
  .patient-login-page .hint { color: var(--text-dim); font-size: 12px; margin-top: 0.5rem; line-height: 1.4; }
  .patient-login-page input[type="text"] {
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    color: var(--text-main);
    font-family: var(--font-ui);
    font-size: 15px;
    transition: all var(--ease-smooth);
  }
  .patient-login-page input[type="text"]::placeholder { color: var(--text-dim); }
  .patient-login-page input[type="text"]:focus {
    border-color: var(--pass);
    background: rgba(0, 0, 0, 0.4);
    box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.1);
    outline: none;
  }
  .patient-login-page .btn-primary {
    width: 100%; background: var(--pass); color: #fff;
    border: none; border-radius: 8px;
    padding: 0.85rem 1rem; font-size: 15px; font-weight: 600;
    cursor: pointer; margin-top: 1rem;
    transition: all var(--ease-smooth);
    box-shadow: 0 4px 14px rgba(74, 222, 128, 0.3);
  }
  .patient-login-page .btn-primary:hover {
    background: #6ee7b7; transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(74, 222, 128, 0.4);
  }
  .patient-login-page .btn-primary:active { transform: translateY(1px); }
  .patient-login-page .footnote { color: var(--text-dim); font-size: 12px; margin-top: 2rem; text-align: center; }
`;

export default function PatientLogin({ navigate }) {
  const [name, setName] = useState('');
  const [patientId, setPatientId] = useState('');

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'patient-login-styles';
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = name.trim() || 'Patient';
    const pid = patientId.trim();
    if (!pid) return;
    sessionStorage.setItem('tm_patient_name', n);
    sessionStorage.setItem('tm_patient_id', pid);
    navigate('patient-home');
  };

  return (
    <div className="patient-login-page">
      <div className="card">
        <button className="back-link" onClick={() => navigate('landing')}>← Back to TriMatch home</button>

        <div className="badge-row">
          <div className="portal-icon">P</div>
          <h1>Patient sign in</h1>
        </div>
        <p className="sub">Enter your name and patient ID to see your trial invitations.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="nameInput">Name</label>
            <input type="text" id="nameInput" placeholder="e.g. Alex Rivera" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="patientIdInput">Patient ID</label>
            <input type="text" id="patientIdInput" placeholder="from your invitation letter or email" autoComplete="off" required value={patientId} onChange={e => setPatientId(e.target.value)} />
            <div className="hint">This is the ID your research coordinator gave you — it's how we find your invitations.</div>
          </div>
          <button type="submit" className="btn-primary">View my invitations</button>
        </form>

        <div className="footnote">Demo sign-in — any name is accepted, nothing is stored beyond this browser session.</div>
      </div>
    </div>
  );
}
