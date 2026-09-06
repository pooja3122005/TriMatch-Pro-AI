import { useEffect, useState } from 'react';

const css = `
  .phase1-page * { box-sizing: border-box; }
  .phase1-page {
    margin: 0;
    background: #0f1115;
    background-image: radial-gradient(circle at top right, rgba(56, 189, 248, 0.15), transparent 40%),
                      radial-gradient(circle at bottom left, rgba(74, 222, 128, 0.15), transparent 40%),
                      radial-gradient(circle at 50% 50%, rgba(26, 29, 35, 0.8), #0f1115 100%);
    background-attachment: fixed;
    color: #f3f4f6;
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 14px; line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    padding: 1.5rem;
  }
  .phase1-page header { max-width: 900px; margin: 0 auto 1.5rem; }
  .phase1-page h1 { font-size: 1.4rem; margin: 0 0 0.25rem; }
  .phase1-page .subtitle { color: #9ca3af; font-size: 0.9rem; margin: 0 0 1.25rem; }
  .phase1-page .search-row { display: flex; gap: 0.5rem; max-width: 900px; margin: 0 auto 1rem; }
  .phase1-page input[type="text"] {
    flex: 1; padding: 0.6rem 0.8rem; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(26,29,35,0.7); color: #f3f4f6; font-size: 0.95rem;
    font-family: inherit;
  }
  .phase1-page input[type="text"]:focus { outline: 2px solid #38bdf8; }
  .phase1-page button {
    padding: 0.6rem 1.1rem; border-radius: 8px; border: none;
    background: #38bdf8; color: white; font-size: 0.95rem; cursor: pointer;
    font-family: inherit;
  }
  .phase1-page button:disabled { opacity: 0.5; cursor: default; }
  .phase1-page main { max-width: 900px; margin: 0 auto; }
  .phase1-page .status { color: #9ca3af; font-size: 0.9rem; margin: 1rem 0; }
  .phase1-page .error { background: #2a1416; border: 1px solid #e5484d; color: #ff9b9e; padding: 0.75rem 1rem; border-radius: 8px; margin: 1rem 0; }
  .phase1-page .trial-header { background: rgba(26,29,35,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; }
  .phase1-page .trial-header h2 { margin: 0 0 0.35rem; font-size: 1.1rem; }
  .phase1-page .trial-meta { color: #9ca3af; font-size: 0.85rem; }
  .phase1-page .candidate { background: rgba(26,29,35,0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; margin-bottom: 0.75rem; overflow: hidden; }
  .phase1-page .candidate-summary { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1.1rem; cursor: pointer; gap: 1rem; }
  .phase1-page .candidate-summary:hover { background: #1c2028; }
  .phase1-page .candidate-left { display: flex; align-items: center; gap: 0.75rem; }
  .phase1-page .patient-id { font-weight: 600; }
  .phase1-page .counts { color: #9ca3af; font-size: 0.85rem; }
  .phase1-page .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
  .phase1-page .badge-eligible { background: rgba(47,191,113,0.15); color: #2fbf71; }
  .phase1-page .badge-ineligible { background: rgba(229,72,77,0.15); color: #e5484d; }
  .phase1-page .badge-needs_more_data { background: rgba(230,184,0,0.15); color: #e6b800; }
  .phase1-page .verdict-pass { color: #2fbf71; }
  .phase1-page .verdict-fail { color: #e5484d; }
  .phase1-page .verdict-unknown { color: #9ca3af; }
  .phase1-page .chevron { color: #9ca3af; transition: transform 0.15s ease; display: inline-block; }
  .phase1-page .candidate.open .chevron { transform: rotate(90deg); }
  .phase1-page .criteria-table { display: none; border-top: 1px solid rgba(255,255,255,0.08); }
  .phase1-page .candidate.open .criteria-table { display: block; }
  .phase1-page table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  .phase1-page th, .phase1-page td { text-align: left; padding: 0.5rem 1.1rem; border-bottom: 1px solid rgba(255,255,255,0.08); vertical-align: top; }
  .phase1-page th { color: #9ca3af; font-weight: 500; font-size: 0.75rem; text-transform: uppercase; }
  .phase1-page tr:last-child td { border-bottom: none; }
  .phase1-page .crit-type { color: #9ca3af; font-size: 0.75rem; text-transform: uppercase; }
  .phase1-page .crit-text { color: #9ca3af; max-width: 260px; }
`;

export default function Phase1Dashboard({ navigate }) {
  const [nctId, setNctId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [trial, setTrial] = useState(null);
  const [openCandidates, setOpenCandidates] = useState({});

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'phase1-styles';
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const loadCandidates = async () => {
    const id = nctId.trim();
    if (!id) return;
    setLoading(true); setError(''); setTrial(null); setOpenCandidates({});
    setStatus('Fetching trial and parsing eligibility criteria with an LLM — this can take up to 30 seconds…');
    try {
      const res = await fetch(`/trials/${encodeURIComponent(id)}/candidates`);
      const data = await res.json();
      setStatus('');
      if (!res.ok) { setError(data.detail || 'Request failed'); }
      else setTrial(data);
    } catch (err) { setStatus(''); setError(`Request failed: ${err.message}`); }
    setLoading(false);
  };

  const toggleCandidate = (idx) => setOpenCandidates(p => ({ ...p, [idx]: !p[idx] }));

  return (
    <div className="phase1-page">
      <header>
        <h1>TriMatch Pro AI</h1>
        <p className="subtitle">Clinical trial matching &mdash; ranked candidates with a per-criterion explanation for every decision.</p>
        <div className="search-row">
          <input type="text" placeholder="Enter an NCT ID, e.g. NCT04280705" value={nctId} onChange={e => setNctId(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadCandidates()} />
          <button onClick={loadCandidates} disabled={loading}>Load candidates</button>
        </div>
        {status && <div className="status">{status}</div>}
      </header>

      <main>
        {error && <div className="error">{error}</div>}
        {trial && <>
          <div className="trial-header">
            <h2>{trial.title || trial.nct_id}</h2>
            <div className="trial-meta">{trial.nct_id} &middot; {trial.criteria?.length || 0} criteria parsed &middot; {trial.candidates?.length || 0} patients screened</div>
          </div>
          {trial.candidates?.map((c, idx) => (
            <div className={`candidate${openCandidates[idx] ? ' open' : ''}`} key={idx}>
              <div className="candidate-summary" onClick={() => toggleCandidate(idx)}>
                <div className="candidate-left">
                  <span className="chevron">&#9656;</span>
                  <span className="patient-id">{c.patient_id}</span>
                  <span className={`badge badge-${c.overall.replace(/ /g, '_')}`}>{c.overall}</span>
                </div>
                <div className="counts">{c.pass_count} pass &middot; {c.fail_count} fail &middot; {c.unknown_count} unknown</div>
              </div>
              <div className="criteria-table">
                <table>
                  <thead><tr><th>ID</th><th>Criterion</th><th>Verdict</th><th>Patient value</th><th>Reason</th></tr></thead>
                  <tbody>
                    {c.results?.map((r, ri) => (
                      <tr key={ri}>
                        <td>{r.id}<div className="crit-type">{r.type}</div></td>
                        <td className="crit-text">{r.text}</td>
                        <td className={`verdict-${r.verdict}`}>{r.verdict}</td>
                        <td>{Array.isArray(r.patient_value) ? r.patient_value.join(', ') : r.patient_value}</td>
                        <td className="crit-text">{r.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>}
      </main>
    </div>
  );
}
