import { useEffect, useState } from 'react';

const css = `
  :root {
    --bg: #08090d;
    --panel: rgba(16, 22, 36, 0.8);
    --panel-2: rgba(22, 30, 50, 0.9);
    --text: #e2e8f0;
    --muted: #94a3b8;
    --muted-2: #64748b;
    --line: rgba(99, 179, 237, 0.1);
    --accent: #63b3ed;
    --accent-2: #7c3aed;
    --accent-dim: rgba(99, 179, 237, 0.12);
    --pass: #34d399;
    --pass-dim: rgba(52, 211, 153, 0.12);
    --fail: #fc8181;
    --fail-dim: rgba(252, 129, 129, 0.12);
    --unknown: #f6ad55;
    --unknown-dim: rgba(246, 173, 85, 0.12);
    --radius: 10px;
    --radius-lg: 16px;
    --font-ui: 'Inter', -apple-system, sans-serif;
    --font-mono: ui-monospace, "SF Mono", "Consolas", monospace;
    --ease: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .patient-home-page * { box-sizing: border-box; }
  .patient-home-page {
    margin: 0;
    background: var(--bg);
    background-image:
      radial-gradient(ellipse at 0% 0%, rgba(52,211,153,0.12) 0%, transparent 50%),
      radial-gradient(ellipse at 100% 100%, rgba(99,179,237,0.1) 0%, transparent 50%);
    background-attachment: fixed;
    color: var(--text);
    font-family: var(--font-ui);
    font-size: 14px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }
  @media (prefers-reduced-motion: reduce) {
    .patient-home-page * { transition: none !important; animation: none !important; }
  }
  .patient-home-page :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .patient-home-page .mono { font-family: var(--font-mono); }
  .patient-home-page .session-bar {
    border-bottom: 1px solid var(--line);
    padding: 0.85rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between;
    gap: 1rem; flex-wrap: wrap;
  }
  .patient-home-page .session-left { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
  .patient-home-page .brand { font-weight: 600; font-size: 15px; letter-spacing: 0.01em; }
  .patient-home-page .brand .dim { color: var(--muted); font-weight: 400; }
  .patient-home-page .home-link {
    display: flex; align-items: center; gap: 0.4rem;
    color: var(--text); text-decoration: none; font-weight: 600;
    font-size: 13px; padding: 0.2rem 0.3rem 0.2rem 0.1rem;
    border-radius: var(--radius); transition: color var(--ease);
    cursor: pointer; background: none; border: none;
  }
  .patient-home-page .home-link:hover { color: var(--accent); }
  .patient-home-page .home-mark { color: var(--pass); }
  .patient-home-page .crumb-sep { color: var(--muted-2); font-size: 12px; }
  .patient-home-page .role-badge {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 0.06em; text-transform: uppercase;
    padding: 0.2rem 0.5rem; border-radius: var(--radius);
  }
  .patient-home-page .role-badge.role-patient { background: var(--pass-dim); color: var(--pass); }
  .patient-home-page .session-name { color: var(--muted); font-size: 13px; }
  .patient-home-page .signout-btn {
    background: transparent; border: 1px solid var(--line);
    border-radius: var(--radius); padding: 0.4rem 0.8rem;
    color: var(--muted); font-size: 12.5px; cursor: pointer;
    transition: border-color var(--ease), color var(--ease);
  }
  .patient-home-page .signout-btn:hover { border-color: var(--muted-2); color: var(--text); }
  .patient-home-page main {
    max-width: 640px; margin: 2rem auto;
    background: linear-gradient(145deg, rgba(16,22,36,0.85), rgba(10,14,24,0.9));
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(99,179,237,0.15);
    border-radius: var(--radius-lg);
    padding: 2rem 2.25rem;
    box-shadow: 0 0 0 1px rgba(99,179,237,0.05) inset, 0 20px 60px rgba(0,0,0,0.6);
    position: relative; overflow: hidden;
  }
  .patient-home-page main::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(52,211,153,0.4), rgba(99,179,237,0.4), transparent);
  }
  .patient-home-page .page-title { font-size: 19px; font-weight: 600; margin: 0 0 0.3rem; }
  .patient-home-page .page-sub { color: var(--muted); font-size: 13.5px; margin: 0 0 2rem; }
  .patient-home-page .skeleton, .patient-home-page .detail-empty {
    color: var(--muted-2); font-size: 13px;
    background: var(--panel); border: 1px solid var(--line);
    border-radius: var(--radius); padding: 1.25rem 1.4rem;
  }
  .patient-home-page .invite-card {
    background: rgba(16,22,36,0.6);
    border: 1px solid rgba(99,179,237,0.12);
    border-radius: var(--radius);
    padding: 1rem 1.15rem; margin-bottom: 0.75rem;
    transition: border-color var(--ease), box-shadow var(--ease), transform var(--ease);
    position: relative;
  }
  .patient-home-page .invite-card:hover {
    border-color: rgba(99,179,237,0.3);
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    transform: translateY(-1px);
  }
  .patient-home-page .invite-top {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 0.75rem; margin-bottom: 0.3rem;
  }
  .patient-home-page .invite-title { font-weight: 600; font-size: 14.5px; }
  .patient-home-page .invite-meta {
    font-size: 11.5px; color: var(--muted-2);
    text-transform: uppercase; letter-spacing: 0.04em; margin-right: 0.4rem;
  }
  .patient-home-page .invite-meta-value { font-family: var(--font-mono); color: var(--muted); font-size: 11.5px; margin-bottom: 0.75rem; }
  .patient-home-page .status-pill {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 0.04em; text-transform: uppercase;
    padding: 0.15rem 0.5rem; border-radius: var(--radius);
    white-space: nowrap; flex-shrink: 0;
  }
  .patient-home-page .status-pill.st-invited { background: var(--unknown-dim); color: var(--unknown); border: 1px solid rgba(246,173,85,0.25); }
  .patient-home-page .status-pill.st-accepted { background: var(--unknown-dim); color: var(--unknown); border: 1px solid rgba(246,173,85,0.25); }
  .patient-home-page .status-pill.st-consented { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(99,179,237,0.25); }
  .patient-home-page .status-pill.st-enrolled { background: var(--pass-dim); color: var(--pass); border: 1px solid rgba(52,211,153,0.25); }
  .patient-home-page .status-pill.st-declined { background: rgba(30,30,40,0.5); color: var(--muted-2); }
  .patient-home-page .status-pill.st-withdrawn { background: var(--fail-dim); color: var(--fail); border: 1px solid rgba(252,129,129,0.25); }
  .patient-home-page .invite-action a { color: var(--accent); text-decoration: none; font-size: 12.5px; }
  .patient-home-page .invite-action a:hover { text-decoration: underline; }
  .patient-home-page .invite-action span.note { color: var(--muted-2); font-size: 12.5px; }
  .patient-home-page .footnote { color: var(--muted-2); font-size: 11px; margin-top: 2rem; text-align: center; }
  .patient-home-page .upload-lab-cta {
    display: flex; align-items: center; justify-content: space-between;
    gap: 1rem; flex-wrap: wrap;
    background: var(--panel); border: 1px solid var(--line);
    border-radius: var(--radius); padding: 1rem 1.25rem; margin-bottom: 1.5rem;
  }
  .patient-home-page .upload-lab-cta-title { font-weight: 600; font-size: 13.5px; }
  .patient-home-page .upload-lab-cta-sub { color: var(--muted); font-size: 12.5px; margin-top: 0.15rem; }
  .patient-home-page .upload-lab-cta-btn {
    flex-shrink: 0; color: white;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    border-radius: var(--radius); padding: 0.5rem 1rem;
    font-size: 12.5px; font-weight: 600;
    text-decoration: none; cursor: pointer; border: none;
    transition: opacity var(--ease), transform var(--ease);
  }
  .patient-home-page .upload-lab-cta-btn:hover { opacity: 0.85; transform: translateY(-1px); }
`;

const STATUS_LABEL = {
  invited: 'Awaiting your response',
  accepted: 'Response in progress',
  consented: 'Consent recorded — pending enrollment',
  enrolled: 'Enrolled',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
};

const STATUS_HELP = {
  invited: 'A research team has invited you to this trial. Open it to review the details and respond.',
  accepted: "You're in the middle of responding to this invitation.",
  consented: 'You said yes — a research coordinator will confirm your enrollment soon.',
  enrolled: "You're enrolled. The care team is tracking your results as part of this trial.",
  declined: 'You declined this invitation. No further action is needed.',
  withdrawn: 'You withdrew from this trial. No further data is being collected.',
};

export default function PatientHome({ navigate }) {
  const [invitations, setInvitations] = useState(null);
  const [error, setError] = useState('');

  const patientId = sessionStorage.getItem('tm_patient_id');
  const patientName = sessionStorage.getItem('tm_patient_name');

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'patient-home-styles';
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (!patientId) { navigate('patient-login'); return; }
    async function init() {
      try {
        const enrollRes = await fetch(`/patients/${encodeURIComponent(patientId)}/enrollment`);
        const enrollments = await enrollRes.json();
        if (!enrollRes.ok) { setError(enrollments.detail || 'Could not load your invitations.'); return; }
        if (!enrollments.length) { setInvitations([]); return; }
        const trials = await Promise.all(
          enrollments.map(async (e) => {
            try {
              const res = await fetch(`/trials/${encodeURIComponent(e.nct_id)}`);
              const trial = await res.json();
              return res.ok ? trial : { nct_id: e.nct_id };
            } catch { return { nct_id: e.nct_id }; }
          })
        );
        setInvitations(enrollments.map((e, i) => ({ enrollment: e, trial: trials[i] })));
      } catch { setError('Could not reach the server. Try again.'); }
    }
    init();
  }, [patientId]);

  const signOut = () => {
    sessionStorage.removeItem('tm_patient_name');
    sessionStorage.removeItem('tm_patient_id');
    navigate('landing');
  };

  return (
    <div className="patient-home-page">
      <div className="session-bar">
        <div className="session-left">
          <button className="home-link" onClick={() => navigate('landing')}><span className="home-mark">◆</span> TriMatch</button>
          <span className="crumb-sep">›</span>
          <span className="role-badge role-patient">Patient Portal</span>
          <span className="session-name">{patientName || ''}</span>
        </div>
        <button className="signout-btn" onClick={signOut}>Sign out</button>
      </div>

      <main>
        <div className="page-title">Your trial invitations</div>
        <div className="page-sub">Trials a research team has invited you to, or that you're currently part of. Open any invitation below to review the trial and respond.</div>
        <div className="upload-lab-cta">
          <div>
            <div className="upload-lab-cta-title">Have a new lab report?</div>
            <div className="upload-lab-cta-sub">Paste it in and we'll read the values into your record automatically.</div>
          </div>
          <button className="upload-lab-cta-btn" onClick={() => navigate('upload-lab')}>Upload lab report →</button>
        </div>

        {error && <div className="detail-empty">{error}</div>}
        {!error && invitations === null && <div className="skeleton">Loading your trial invitations…</div>}
        {!error && invitations !== null && invitations.length === 0 && (
          <div className="detail-empty">No trial invitations found for patient ID <span className="mono">{patientId}</span>. If you believe this is an error, check the ID with your research coordinator.</div>
        )}
        {!error && invitations && invitations.map(({ enrollment: e, trial }, i) => {
          const phase = Array.isArray(trial.phase) ? trial.phase.join(', ') : trial.phase;
          const canOpen = ['invited', 'accepted', 'consented', 'enrolled'].includes(e.status);
          return (
            <div className="invite-card" key={i}>
              <div className="invite-top">
                <div className="invite-title">{trial.title || e.nct_id}</div>
                <span className={`status-pill st-${e.status}`} title={STATUS_HELP[e.status] || ''}>{STATUS_LABEL[e.status] || e.status}</span>
              </div>
              <div><span className="invite-meta">Trial ID</span><span className="invite-meta-value">{e.nct_id}{phase ? ' · ' + phase : ''}</span></div>
              <div className="invite-action">
                {canOpen
                  ? <a href="#" onClick={(ev) => { ev.preventDefault(); navigate('consent', { patient: patientId, trial: e.nct_id }); }}>Open trial details &amp; consent status →</a>
                  : <span className="note">No further action available.</span>}
              </div>
            </div>
          );
        })}

        <div className="footnote">This is a prototype patient portal for demonstration.</div>
      </main>
    </div>
  );
}
