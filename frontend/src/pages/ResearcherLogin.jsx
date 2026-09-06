import { useEffect, useState } from 'react';

const css = `
  :root {
    --bg-dark: #0f1115;
    --panel-glass: rgba(26, 29, 35, 0.7);
    --border-glass: rgba(255, 255, 255, 0.08);
    --text-main: #f3f4f6;
    --text-muted: #9ca3af;
    --text-dim: #6b7280;
    --accent: #38bdf8;
    --accent-dim: rgba(56, 189, 248, 0.1);
    --radius: 12px;
    --font-ui: 'Inter', -apple-system, sans-serif;
    --ease-smooth: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .researcher-login-page * { box-sizing: border-box; }
  .researcher-login-page {
    margin: 0;
    background: var(--bg-dark);
    background-image: radial-gradient(circle at top right, rgba(56,189,248,0.08), transparent 40%);
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
    .researcher-login-page * { transition: none !important; animation: none !important; }
  }
  .researcher-login-page :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .researcher-login-page .card {
    width: 100%; max-width: 420px;
    background: var(--panel-glass);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--border-glass);
    border-radius: var(--radius);
    padding: 2.5rem;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    animation: rlFadeIn 0.5s ease-out;
    height: fit-content;
  }
  @keyframes rlFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .researcher-login-page .back-link {
    display: inline-block; color: var(--text-muted);
    text-decoration: none; font-size: 13px;
    margin-bottom: 2rem;
    transition: color var(--ease-smooth);
    cursor: pointer; background: none; border: none; padding: 0;
  }
  .researcher-login-page .back-link:hover { color: var(--text-main); }
  .researcher-login-page .badge-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
  .researcher-login-page .portal-icon {
    width: 36px; height: 36px; border-radius: 8px;
    background: var(--accent-dim); color: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700; flex-shrink: 0;
    border: 1px solid rgba(56, 189, 248, 0.2);
  }
  .researcher-login-page h1 { font-size: 22px; font-weight: 600; margin: 0; color: #fff; }
  .researcher-login-page .sub { color: var(--text-muted); font-size: 14px; margin: 0.4rem 0 2rem; }
  .researcher-login-page label {
    display: block; font-size: 12px; font-weight: 500;
    letter-spacing: 0.05em; text-transform: uppercase;
    color: var(--text-muted); margin-bottom: 0.5rem;
  }
  .researcher-login-page .field { margin-bottom: 1.5rem; }
  .researcher-login-page input[type="text"] {
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
  .researcher-login-page input[type="text"]::placeholder { color: var(--text-dim); }
  .researcher-login-page input[type="text"]:focus {
    border-color: var(--accent);
    background: rgba(0, 0, 0, 0.4);
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
    outline: none;
  }
  .researcher-login-page .optional { text-transform: none; letter-spacing: 0; color: var(--text-dim); }
  .researcher-login-page .btn-primary {
    width: 100%; background: var(--accent); color: #fff;
    border: none; border-radius: 8px;
    padding: 0.85rem 1rem; font-size: 15px; font-weight: 600;
    cursor: pointer; margin-top: 1rem;
    transition: all var(--ease-smooth);
    box-shadow: 0 4px 14px rgba(56, 189, 248, 0.3);
  }
  .researcher-login-page .btn-primary:hover {
    background: #7dd3fc; transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(56, 189, 248, 0.4);
  }
  .researcher-login-page .btn-primary:active { transform: translateY(1px); }
  .researcher-login-page .footnote { color: var(--text-dim); font-size: 12px; margin-top: 2rem; text-align: center; }
`;

export default function ResearcherLogin({ navigate }) {
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'researcher-login-styles';
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = name.trim() || 'Researcher';
    sessionStorage.setItem('tm_researcher_name', n);
    sessionStorage.setItem('tm_researcher_org', org.trim());
    navigate('researcher');
  };

  return (
    <div className="researcher-login-page">
      <div className="card">
        <button className="back-link" onClick={() => navigate('landing')}>← Back to TriMatch home</button>

        <div className="badge-row">
          <div className="portal-icon">R</div>
          <h1>Researcher sign in</h1>
        </div>
        <p className="sub">Enter your name to continue to the research dashboard.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="nameInput">Name</label>
            <input type="text" id="nameInput" placeholder="e.g. Dr. Priya Anand" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="orgInput">Organization <span className="optional">(optional)</span></label>
            <input type="text" id="orgInput" placeholder="e.g. Northview Research Institute" autoComplete="organization" value={org} onChange={e => setOrg(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">Continue to dashboard</button>
        </form>

        <div className="footnote">Demo sign-in — any name is accepted, nothing is stored beyond this browser session.</div>
      </div>
    </div>
  );
}
