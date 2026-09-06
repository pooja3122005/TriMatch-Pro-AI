import { useEffect } from 'react';

const css = `
  :root {
    --bg-dark: #0f1115;
    --bg-gradient: linear-gradient(135deg, #0f1115 0%, #171a21 100%);
    --panel-glass: rgba(26, 29, 35, 0.7);
    --panel-hover: rgba(35, 40, 48, 0.8);
    --border-glass: rgba(255, 255, 255, 0.08);
    --text-main: #f3f4f6;
    --text-muted: #9ca3af;
    --text-dim: #6b7280;
    --accent-gradient: linear-gradient(135deg, #38bdf8, #818cf8);
    --accent-glow: rgba(56, 189, 248, 0.4);
    --pass-gradient: linear-gradient(135deg, #4ade80, #10b981);
    --pass-glow: rgba(74, 222, 128, 0.4);
    --radius: 16px;
    --font-ui: 'Inter', -apple-system, sans-serif;
    --ease-bounce: 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
    --ease-smooth: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .landing-page * { box-sizing: border-box; }
  .landing-page {
    margin: 0;
    background: var(--bg-dark);
    background-image: radial-gradient(circle at 15% 50%, rgba(56, 189, 248, 0.15), transparent 30%),
                      radial-gradient(circle at 85% 30%, rgba(74, 222, 128, 0.15), transparent 30%),
                      radial-gradient(circle at 50% 50%, rgba(26, 29, 35, 0.8), #0f1115 100%);
    background-attachment: fixed;
    color: var(--text-main);
    font-family: var(--font-ui);
    font-size: 15px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem 1.25rem;
  }
  @media (prefers-reduced-motion: reduce) {
    .landing-page * { transition: none !important; animation: none !important; }
  }
  .landing-page :focus-visible {
    outline: 2px solid #818cf8;
    outline-offset: 4px;
    border-radius: 4px;
  }
  .landing-page .wrap {
    width: 100%;
    max-width: 800px;
    text-align: center;
    animation: landingFadeIn 0.8s ease-out;
  }
  @keyframes landingFadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .landing-page .eyebrow {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin-bottom: 1.5rem;
    display: inline-block;
    padding: 6px 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 30px;
  }
  .landing-page h1 {
    font-size: 46px;
    font-weight: 700;
    margin: 0 0 1rem;
    letter-spacing: -0.02em;
    line-height: 1.1;
    color: var(--text-main);
  }
  .landing-page h1 .dim {
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 800;
  }
  .landing-page .tagline {
    color: var(--text-muted);
    font-size: 18px;
    margin: 0 auto 4rem;
    max-width: 500px;
  }
  .landing-page .portals {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    text-align: left;
  }
  @media (max-width: 640px) {
    .landing-page .portals { grid-template-columns: 1fr; }
  }
  .landing-page .portal-card {
    background: var(--panel-glass);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--border-glass);
    border-radius: var(--radius);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-decoration: none;
    color: inherit;
    transition: all var(--ease-smooth);
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    position: relative;
    overflow: hidden;
    cursor: pointer;
  }
  .landing-page .portal-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    opacity: 0.5;
    transition: opacity var(--ease-smooth);
  }
  .landing-page .portal-card.researcher::before { background: var(--accent-gradient); }
  .landing-page .portal-card.patient::before { background: var(--pass-gradient); }
  .landing-page .portal-card:hover {
    transform: translateY(-5px);
    background: var(--panel-hover);
    border-color: rgba(255, 255, 255, 0.15);
  }
  .landing-page .portal-card:hover::before { opacity: 1; }
  .landing-page .portal-card.researcher:hover { box-shadow: 0 10px 30px rgba(56, 189, 248, 0.15); }
  .landing-page .portal-card.patient:hover { box-shadow: 0 10px 30px rgba(74, 222, 128, 0.15); }
  .landing-page .portal-card:active { transform: translateY(0); }
  .landing-page .portal-icon {
    width: 48px; height: 48px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; font-weight: 700;
    margin-bottom: 0.5rem;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  }
  .landing-page .portal-card.researcher .portal-icon {
    background: rgba(56, 189, 248, 0.1); color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.2);
  }
  .landing-page .portal-card.patient .portal-icon {
    background: rgba(74, 222, 128, 0.1); color: #4ade80;
    border: 1px solid rgba(74, 222, 128, 0.2);
  }
  .landing-page .portal-title { font-size: 20px; font-weight: 600; color: #fff; }
  .landing-page .portal-desc { color: var(--text-muted); font-size: 14px; line-height: 1.6; flex-grow: 1; }
  .landing-page .portal-cta {
    font-size: 13px; font-weight: 600;
    letter-spacing: 0.05em; text-transform: uppercase;
    color: var(--text-dim); margin-top: 1rem;
    display: flex; align-items: center; gap: 8px;
    transition: color var(--ease-smooth);
  }
  .landing-page .portal-cta svg { width: 16px; height: 16px; transition: transform var(--ease-smooth); }
  .landing-page .portal-card.researcher:hover .portal-cta { color: #38bdf8; }
  .landing-page .portal-card.patient:hover .portal-cta { color: #4ade80; }
  .landing-page .portal-card:hover .portal-cta svg { transform: translateX(4px); }
  .landing-page .footnote {
    color: var(--text-dim); font-size: 12px;
    margin-top: 4rem;
    background: rgba(255,255,255,0.02);
    padding: 10px 20px; border-radius: 20px;
    display: inline-block;
  }
`;

export default function LandingPage({ navigate }) {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'landing-styles';
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="landing-page">
      <div className="wrap">
        <div className="eyebrow">Clinical Trial Matching</div>
        <h1>TriMatch <span className="dim">Pro AI</span></h1>
        <p className="tagline">Automated, auditable clinical trial patient matching powered by advanced artificial intelligence.</p>

        <div className="portals">
          <div className="portal-card researcher" onClick={() => navigate('researcher-login')} role="link" tabIndex={0}>
            <div className="portal-icon">R</div>
            <div className="portal-title">Researcher Portal</div>
            <div className="portal-desc">Import trials, screen candidates against real patient data, track enrollment and trial-level outcomes with deep insights.</div>
            <div className="portal-cta">
              Enter as researcher
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </div>
          </div>
          <div className="portal-card patient" onClick={() => navigate('patient-login')} role="link" tabIndex={0}>
            <div className="portal-icon">P</div>
            <div className="portal-title">Patient Portal</div>
            <div className="portal-desc">Review personalized trial invitations, read simplified study details, and securely manage your consent requests.</div>
            <div className="portal-cta">
              Enter as patient
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </div>
          </div>
        </div>

        <div className="footnote">Prototype demonstration — sign-in accepts any name and does not store credentials.</div>
      </div>
    </div>
  );
}
