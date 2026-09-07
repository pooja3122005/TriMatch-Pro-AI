import { useEffect, useState } from 'react';

const css = `
  .consent-page * { box-sizing: border-box; }
  .consent-page {
    margin: 0; min-height: 100vh;
    background: #08090d;
    background-image:
      radial-gradient(ellipse at 0% 0%, rgba(99,179,237,0.14) 0%, transparent 50%),
      radial-gradient(ellipse at 100% 100%, rgba(124,58,237,0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.04) 0%, transparent 70%);
    background-attachment: fixed;
    color: #e2e8f0;
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 14px; line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    display: flex; justify-content: center;
    align-items: flex-start;
    overflow-y: auto; padding: 2rem 1.25rem;
  }
  @media (prefers-reduced-motion: reduce) {
    .consent-page * { transition: none !important; animation: none !important; }
  }
  .consent-page button { font-family: inherit; font-size: inherit; color: inherit; }
  .consent-page :focus-visible { outline: 2px solid #63b3ed; outline-offset: 2px; }
  .consent-page .mono { font-family: ui-monospace, "SF Mono", "Consolas", monospace; }
  .consent-page .card {
    width: 100%; max-width: 600px;
    background: linear-gradient(145deg, rgba(16,22,36,0.85), rgba(10,14,24,0.9));
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(99,179,237,0.15);
    border-radius: 16px; padding: 2rem 2.25rem;
    box-shadow: 0 0 0 1px rgba(99,179,237,0.05) inset, 0 20px 60px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.06) inset;
    position: relative; overflow: hidden;
  }
  .consent-page .card::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,179,237,0.4), rgba(124,58,237,0.4), transparent);
  }
  .consent-page .crumb-row { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .consent-page .home-link { color: #e2e8f0; font-weight: 600; font-size: 14px; cursor: pointer; background: none; border: none; padding: 0; }
  .consent-page .home-link:hover { color: #63b3ed; }
  .consent-page .crumb-sep { color: #64748b; font-size: 12px; }
  .consent-page .crumb-text { color: #94a3b8; font-size: 13px; }
  .consent-page .back-link {
    display: inline-block; color: #64748b; font-size: 12.5px;
    margin-bottom: 1.25rem; cursor: pointer; background: none; border: none; padding: 0;
  }
  .consent-page .back-link:hover { color: #94a3b8; }
  .consent-page .trial-box { background: rgba(16,22,36,0.85); border: 1px solid rgba(99,179,237,0.1); border-radius: 10px; padding: 1.1rem 1.25rem; margin-bottom: 1.5rem; }
  .consent-page .trial-box .title { font-weight: 600; font-size: 15px; margin-bottom: 0.3rem; }
  .consent-page .trial-box .meta { font-family: ui-monospace, monospace; color: #94a3b8; font-size: 12px; }
  .consent-page h1 { font-size: 18px; font-weight: 600; margin: 0 0 0.75rem; }
  .consent-page .eyebrow { font-family: ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem; }
  .consent-page .terms { color: #94a3b8; font-size: 13px; line-height: 1.65; border-top: 1px solid rgba(99,179,237,0.1); border-bottom: 1px solid rgba(99,179,237,0.1); padding: 1.1rem 0; margin: 1.25rem 0; }
  .consent-page .terms p { margin: 0 0 0.85rem; }
  .consent-page .terms p:last-child { margin-bottom: 0; }
  .consent-page .actions { display: flex; gap: 0.75rem; }
  .consent-page .btn { flex: 1; padding: 0.7rem 1rem; border-radius: 10px; border: 1px solid rgba(99,179,237,0.1); background: transparent; cursor: pointer; font-size: 13.5px; transition: border-color 250ms, background 250ms, color 250ms; }
  .consent-page .btn-accept { background: rgba(52,211,153,0.12); color: #34d399; border-color: transparent; }
  .consent-page .btn-accept:hover { background: rgba(123,167,134,0.22); }
  .consent-page .btn-decline { color: #94a3b8; }
  .consent-page .btn-decline:hover { border-color: #64748b; color: #e2e8f0; }
  .consent-page .btn:disabled { opacity: 0.5; cursor: default; }
  .consent-page .status-box { background: rgba(16,22,36,0.85); border: 1px solid rgba(99,179,237,0.1); border-radius: 10px; padding: 1.25rem 1.4rem; }
  .consent-page .status-box.success { border-color: rgba(123,167,134,0.35); }
  .consent-page .status-box.declined { border-color: rgba(192,106,95,0.35); }
  .consent-page .status-box .headline { font-weight: 600; font-size: 14.5px; margin-bottom: 0.4rem; }
  .consent-page .status-box .body { color: #94a3b8; font-size: 13px; }
  .consent-page .footnote { color: #64748b; font-size: 11px; margin-top: 2rem; text-align: center; }
  .consent-page .skeleton { color: #64748b; font-size: 13px; }
  .consent-page .steps { display: flex; align-items: center; margin-bottom: 1.75rem; }
  .consent-page .step { display: flex; align-items: center; gap: 0.5rem; color: #64748b; }
  .consent-page .step .dot { width: 18px; height: 18px; border-radius: 50%; border: 1px solid rgba(99,179,237,0.1); display: flex; align-items: center; justify-content: center; font-size: 10px; font-family: ui-monospace, monospace; flex-shrink: 0; }
  .consent-page .step .label { font-size: 12px; white-space: nowrap; }
  .consent-page .step.done .dot { background: rgba(52,211,153,0.12); border-color: transparent; color: #34d399; }
  .consent-page .step.done .label { color: #e2e8f0; }
  .consent-page .step.active .dot { border-color: #63b3ed; color: #63b3ed; }
  .consent-page .step.active .label { color: #e2e8f0; font-weight: 600; }
  .consent-page .step-line { flex: 1; height: 1px; background: rgba(99,179,237,0.1); margin: 0 0.5rem; min-width: 1rem; }
  .consent-page .step-line.done { background: #34d399; opacity: 0.4; }
  .consent-page .badge-row { display: flex; justify-content: center; margin-bottom: 1.75rem; }
  .consent-page .status-pill { font-family: ui-monospace, monospace; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; padding: 0.3rem 0.7rem; border-radius: 999px; background: rgba(252,129,129,0.12); color: #fc8181; }
  .consent-page .progress-list { margin: 1rem 0 1.5rem; border-top: 1px solid rgba(99,179,237,0.1); }
  .consent-page .progress-row { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.7rem 0; border-bottom: 1px solid rgba(99,179,237,0.1); }
  .consent-page .progress-row .name { font-size: 13px; }
  .consent-page .progress-row .values { font-family: ui-monospace, monospace; font-size: 12px; color: #94a3b8; text-align: right; flex-shrink: 0; }
  .consent-page .trend-badge { font-family: ui-monospace, monospace; font-size: 10.5px; padding: 0.15rem 0.5rem; border-radius: 999px; white-space: nowrap; }
  .consent-page .trend-improved { background: rgba(52,211,153,0.12); color: #34d399; }
  .consent-page .trend-worsened { background: rgba(252,129,129,0.12); color: #fc8181; }
  .consent-page .trend-indeterminate, .consent-page .trend-no_data { background: rgba(246,173,85,0.12); color: #f6ad55; }
  .consent-page .baseline-note { color: #94a3b8; font-size: 12.5px; margin-bottom: 0.25rem; }
  .consent-page .withdraw-row { margin-top: 1.25rem; padding-top: 1.1rem; border-top: 1px solid rgba(99,179,237,0.1); }
  .consent-page .withdraw-link { background: none; border: none; color: #64748b; font-size: 12px; cursor: pointer; padding: 0; text-decoration: underline; text-underline-offset: 2px; }
  .consent-page .withdraw-link:hover { color: #fc8181; }
  .consent-page .confirm-box { background: rgba(252,129,129,0.12); border: 1px solid rgba(192,106,95,0.35); border-radius: 10px; padding: 0.9rem 1rem; margin-top: 0.75rem; }
  .consent-page .confirm-box p { margin: 0 0 0.75rem; font-size: 12.5px; color: #e2e8f0; }
  .consent-page .confirm-actions { display: flex; gap: 0.6rem; }
  .consent-page .btn-sm { padding: 0.4rem 0.8rem; font-size: 12px; border-radius: 10px; border: 1px solid rgba(99,179,237,0.1); background: transparent; cursor: pointer; }
  .consent-page .btn-sm.danger { background: #fc8181; border-color: transparent; color: #1a1110; }
  .consent-page .btn-sm:disabled { opacity: 0.5; cursor: default; }
`;

const STEP_ORDER = ['invited', 'consented', 'enrolled'];
function stepIndex(status) {
  if (status === 'accepted') return 1;
  const i = STEP_ORDER.indexOf(status);
  return i === -1 ? 0 : i;
}

function Steps({ status }) {
  if (status === 'declined' || status === 'withdrawn') {
    return <div className="badge-row"><span className="status-pill">{status}</span></div>;
  }
  const labels = ['Invited', 'Consented', 'Enrolled'];
  const current = stepIndex(status);
  return (
    <div className="steps">
      {labels.map((label, i) => {
        const done = i < current || (i === current && status === 'enrolled');
        const active = i === current && status !== 'enrolled';
        const cls = done ? 'done' : active ? 'active' : '';
        return [
          <div className={`step ${cls}`} key={i}>
            <span className="dot">{done ? '✓' : String(i + 1)}</span>
            <span className="label">{label}</span>
          </div>,
          i < labels.length - 1 && <div className={`step-line ${i < current ? 'done' : ''}`} key={`line-${i}`} />
        ];
      })}
    </div>
  );
}

const TREND_LABELS = { improved: 'Improved', worsened: 'Worsened', indeterminate: 'No clear trend', no_data: 'No follow-up data yet' };
const TREND_HELP = {
  improved: 'Your latest result is better than your baseline.',
  worsened: 'Your latest result is worse than your baseline.',
  indeterminate: 'A newer result exists, but the direction of change is unclear for this test.',
  no_data: 'No follow-up result has been recorded since your baseline yet.',
};

export default function ConsentPage({ navigate, params }) {
  const patientId = params?.patient || new URLSearchParams(window.location.search).get('patient');
  const nctId = params?.trial || new URLSearchParams(window.location.search).get('trial');
  const [view, setView] = useState(null); // { type, data }

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'consent-styles';
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (!patientId || !nctId) { setView({ type: 'error', msg: 'This link is missing patient or trial information.' }); return; }
    async function init() {
      try {
        const [trialRes, enrollRes] = await Promise.all([
          fetch(`/trials/${encodeURIComponent(nctId)}`),
          fetch(`/trials/${encodeURIComponent(nctId)}/enrollment`),
        ]);
        const trial = await trialRes.json();
        if (!trialRes.ok) { setView({ type: 'error', msg: trial.detail || 'No trial found for that ID.' }); return; }
        const enrollment = await enrollRes.json();
        const record = enrollRes.ok ? enrollment.find(e => e.patient_id === patientId) : null;
        if (!record) { setView({ type: 'no-invitation' }); return; }
        if (record.status === 'invited') { setView({ type: 'form', trial }); }
        else { handleStatus(record.status); }
      } catch { setView({ type: 'error', msg: 'Could not reach the server. Try again.' }); }
    }
    init();
  }, [patientId, nctId]);

  const handleStatus = async (status) => {
    if (status === 'enrolled') {
      setView({ type: 'enrolled-loading' });
      try {
        const res = await fetch(`/trials/${encodeURIComponent(nctId)}/progress`);
        const data = await res.json();
        const mine = res.ok ? (data.patients || []).find(p => p.patient_id === patientId) : null;
        setView({ type: 'enrolled', progress: mine });
      } catch { setView({ type: 'enrolled', progress: null }); }
    } else if (status === 'consented' || status === 'accepted') { setView({ type: 'consented' }); }
    else if (status === 'withdrawn') { setView({ type: 'withdrawn' }); }
    else { setView({ type: 'responded', status }); }
  };

  const respond = async (action) => {
    try {
      const res = await fetch(`/trials/${encodeURIComponent(nctId)}/patients/${encodeURIComponent(patientId)}/${action}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { setView({ type: 'error', msg: data.detail || 'Could not record your response. Try again.' }); return; }
      if (action === 'consent') setView({ type: 'consented' });
      else setView({ type: 'declined' });
    } catch { setView({ type: 'error', msg: 'Could not reach the server. Try again.' }); }
  };

  const withdraw = async () => {
    try {
      const res = await fetch(`/trials/${encodeURIComponent(nctId)}/patients/${encodeURIComponent(patientId)}/withdraw?actor=patient`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          // Likely already withdrawn or status changed, reload the state
          const enrollRes = await fetch(`/trials/${encodeURIComponent(nctId)}/enrollment`);
          if (enrollRes.ok) {
            const enrollment = await enrollRes.json();
            const record = enrollment.find(e => e.patient_id === patientId);
            if (record) { handleStatus(record.status); return; }
          }
        }
        setView({ type: 'error', msg: data.detail || 'Could not process your withdrawal. Try again.' });
        return;
      }
      setView({ type: 'withdrawn' });
    } catch { setView({ type: 'error', msg: 'Could not reach the server. Try again.' }); }
  };

  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  const WithdrawSection = () => (
    <div className="withdraw-row">
      {!confirmWithdraw
        ? <button className="withdraw-link" onClick={() => setConfirmWithdraw(true)}>Withdraw from this trial</button>
        : <div className="confirm-box">
            <p>Withdrawing stops your participation in this trial. This can't be undone, but it won't affect any other care you receive. Are you sure?</p>
            <div className="confirm-actions">
              <button className="btn-sm danger" onClick={withdraw}>Yes, withdraw</button>
              <button className="btn-sm" onClick={() => setConfirmWithdraw(false)}>Cancel</button>
            </div>
          </div>
      }
    </div>
  );

  const renderContent = () => {
    if (!view) return <div className="skeleton">Loading your invitation…</div>;
    if (view.type === 'error') return <div className="status-box"><div className="headline">Something's not right</div><div className="body">{view.msg}</div></div>;
    if (view.type === 'no-invitation') return <div className="status-box"><div className="headline">No pending invitation found</div><div className="body">We couldn't find an active invitation for this patient and trial. Check the link, or contact the research team.</div></div>;
    if (view.type === 'form') {
      const trial = view.trial;
      const phase = Array.isArray(trial.phase) ? trial.phase.join(', ') : trial.phase;
      return <>
        <Steps status="invited" />
        <div className="trial-box"><div className="title">{trial.title || trial.nct_id}</div><div className="meta">{trial.nct_id}{phase ? ' · ' + phase : ''}{trial.overall_status ? ' · ' + trial.overall_status : ''}</div></div>
        <h1>Invitation to participate</h1>
        <div className="eyebrow" title="This invitation is addressed to you, identified by your patient ID">Patient</div>
        <div className="mono" title="Full patient ID — shortened here for display">{patientId && patientId.length > 10 ? patientId.slice(0, 8) : patientId}</div>
        <div className="terms">
          {trial.primary_endpoint && <p>This trial is studying: <strong>{trial.primary_endpoint}</strong>.</p>}
          <p>You've been invited to take part in the trial above. Before you decide, please read the following:</p>
          <p>Participation is voluntary. You may decline this invitation, and if you accept now, you may withdraw from the trial at any time afterward without giving a reason.</p>
          <p>If you consent, a research coordinator will review your case and confirm enrollment. Enrollment sets a baseline date, and lab results taken from that point onward will be compared against your baseline values to track your progress in the trial.</p>
          <p>Your data is handled as part of this trial's records and reviewed by the research team for eligibility, safety, and compliance purposes.</p>
        </div>
        <div className="actions">
          <button className="btn btn-accept" onClick={() => respond('consent')}>Accept &amp; consent</button>
          <button className="btn btn-decline" onClick={() => respond('decline')}>Decline</button>
        </div>
      </>;
    }
    if (view.type === 'consented') return <><Steps status="consented" /><div className="status-box success"><div className="headline">Your consent is recorded</div><div className="body">A member of the research team will review your case and confirm enrollment. You'll see your baseline and progress here once that happens.</div></div><WithdrawSection /></>;
    if (view.type === 'declined') return <><Steps status="declined" /><div className="status-box declined"><div className="headline">You've declined this invitation</div><div className="body">Thank you for considering. No further action is needed.</div></div></>;
    if (view.type === 'withdrawn') return <><Steps status="withdrawn" /><div className="status-box declined"><div className="headline">You've withdrawn from this trial</div><div className="body">Thank you for your participation. No further data will be collected for this trial.</div></div></>;
    if (view.type === 'enrolled-loading') return <><Steps status="enrolled" /><div className="skeleton">Loading your progress…</div></>;
    if (view.type === 'enrolled') {
      const mine = view.progress;
      return <>
        <Steps status="enrolled" />
        <div className="status-box success"><div className="headline">You're enrolled — thank you for participating</div><div className="body">Your care team will keep tracking your results as part of this trial.</div></div>
        {mine && mine.tests && mine.tests.length > 0
          ? <><div className="baseline-note">Baseline set {mine.baseline_date ? mine.baseline_date.slice(0, 10) : '—'}. Compared against your most recent results:</div>
              <div className="progress-list">
                {mine.tests.map((t, i) => (
                  <div className="progress-row" key={i}>
                    <div className="name">{t.test_name || t.test_code}</div>
                    <div className="values">
                      {t.baseline_value != null ? t.baseline_value : '—'} → {t.latest_value != null ? t.latest_value : '—'}{t.unit ? ' ' + t.unit : ''}
                      <div className={`trend-badge trend-${t.status}`} title={TREND_HELP[t.status] || ''}>{TREND_LABELS[t.status] || t.status}</div>
                    </div>
                  </div>
                ))}
              </div></>
          : <div className="terms"><p>No follow-up lab results have been recorded since enrollment yet. Check back after your next visit.</p></div>
        }
        <WithdrawSection />
      </>;
    }
    if (view.type === 'responded') return <><Steps status={view.status} /><div className="status-box"><div className="headline">Already responded</div><div className="body">{{ declined: "You've already declined this invitation." }[view.status] || `Current status: ${view.status}`}</div></div></>;
    return null;
  };

  return (
    <div className="consent-page">
      <div className="card">
        <div className="crumb-row">
          <button className="home-link" onClick={() => navigate('landing')}>TriMatch</button>
          <span className="crumb-sep">›</span>
          <span className="crumb-text">Patient Portal › Trial Consent</span>
        </div>
        <button className="back-link" onClick={() => navigate('patient-home')}>← Back to my invitations</button>
        {renderContent()}
        <div className="footnote">This is a prototype consent screen for demonstration — not a legally binding consent form.</div>
      </div>
    </div>
  );
}
