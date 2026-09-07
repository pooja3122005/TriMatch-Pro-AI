import { useEffect, useRef } from 'react';

// ResearcherDashboard — premium UI with patient names, fixed audit labels, Chart.js visualisations.

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  .researcher-page { display: flex; flex-direction: column; height: 100vh; overflow: hidden; font-family: 'Inter', -apple-system, sans-serif; }
  .researcher-page * { box-sizing: border-box; }
  .researcher-page button, .researcher-page input { font-family: inherit; font-size: inherit; color: inherit; }
  .researcher-page :focus-visible { outline: 2px solid #63b3ed; outline-offset: 2px; }

  /* ── Scrollbar ── */
  .researcher-page ::-webkit-scrollbar { width: 5px; height: 5px; }
  .researcher-page ::-webkit-scrollbar-track { background: transparent; }
  .researcher-page ::-webkit-scrollbar-thumb { background: rgba(18, 39, 54, 0.25); border-radius: 99px; }

  /* ── Session bar ── */
  .researcher-page .session-bar {
    border-bottom: 1px solid rgba(99,179,237,0.1);
    padding: 0.6rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between;
    gap: 1rem; flex-wrap: wrap;
    background: rgba(6,8,14,0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    flex-shrink: 0;
    position: relative;
    z-index: 10;
  }
  .researcher-page .session-left { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
  .researcher-page .home-link {
    display: flex; align-items: center; gap: 0.4rem;
    color: #e2e8f0; font-weight: 700; font-size: 14px;
    padding: 0.2rem 0.5rem; border-radius: 8px;
    transition: color 200ms; cursor: pointer; background: none; border: none;
    letter-spacing: -0.01em;
  }
  .researcher-page .home-link:hover { color: #63b3ed; }
  .researcher-page .home-mark {
    display: inline-flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; border-radius: 6px;
    background: linear-gradient(135deg, #63b3ed, #7c3aed);
    font-size: 11px; color: #fff; font-weight: 700;
  }
  .researcher-page .crumb-sep { color: #475569; font-size: 12px; }
  .researcher-page .crumb-current { color: #94a3b8; font-size: 13px; }
  .researcher-page .role-badge {
    font-family: ui-monospace, monospace; font-size: 10px;
    letter-spacing: 0.06em; text-transform: uppercase;
    padding: 0.2rem 0.6rem; border-radius: 99px; font-weight: 600;
  }
  .researcher-page .role-badge.role-researcher { background: rgba(99,179,237,0.12); color: #63b3ed; border: 1px solid rgba(99,179,237,0.2); }
  .researcher-page .session-name { color: #64748b; font-size: 12.5px; }
  .researcher-page .signout-btn {
    background: transparent; border: 1px solid rgba(99,179,237,0.12);
    border-radius: 8px; padding: 0.35rem 0.8rem;
    color: #64748b; font-size: 12px; cursor: pointer;
    transition: border-color 200ms, color 200ms;
  }
  .researcher-page .signout-btn:hover { border-color: rgba(99,179,237,0.4); color: #e2e8f0; }

  /* ── Header ── */
  .researcher-page header {
    border-bottom: 1px solid rgba(99,179,237,0.08);
    padding: 0.85rem 1.5rem;
    display: flex; flex-wrap: wrap; align-items: center;
    gap: 0.75rem 1.5rem;
    background: rgba(8,10,18,0.6);
    backdrop-filter: blur(12px);
    flex-shrink: 0;
  }
  .researcher-page .brand { font-weight: 700; font-size: 16px; letter-spacing: -0.02em; white-space: nowrap; }
  .researcher-page .brand .dim { color: #475569; font-weight: 400; }
  .researcher-page .load-row { display: flex; gap: 0.5rem; flex: 1 1 320px; max-width: 580px; }
  .researcher-page #nctInput {
    flex: 1; background: rgba(12,16,28,0.9); border: 1px solid rgba(99,179,237,0.12);
    border-radius: 10px; padding: 0.55rem 0.8rem; color: #e2e8f0;
    transition: border-color 200ms;
  }
  .researcher-page #nctInput::placeholder { color: #475569; }
  .researcher-page #nctInput:focus-visible { border-color: rgba(99,179,237,0.5); }
  .researcher-page #patientCountInput {
    width: 5.5rem; flex: 0 0 auto; background: rgba(12,16,28,0.9);
    border: 1px solid rgba(99,179,237,0.12); border-radius: 10px;
    padding: 0.55rem 0.7rem; color: #e2e8f0;
    font-family: ui-monospace, monospace;
    transition: border-color 200ms;
  }
  .researcher-page #patientCountInput:focus-visible { border-color: rgba(99,179,237,0.5); }
  .researcher-page #loadBtn {
    background: linear-gradient(135deg, #3b82f6, #7c3aed);
    border: none; border-radius: 10px; padding: 0.55rem 1.25rem;
    cursor: pointer; transition: opacity 200ms, transform 150ms, box-shadow 200ms;
    color: white; font-weight: 600; font-size: 13px; letter-spacing: 0.01em;
    white-space: nowrap;
    box-shadow: 0 2px 12px rgba(99,179,237,0.2);
  }
  .researcher-page #loadBtn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(99,179,237,0.3); }
  .researcher-page #loadBtn:disabled { opacity: 0.35; cursor: default; transform: none; box-shadow: none; }
  .researcher-page .trial-info { display: flex; align-items: baseline; gap: 0.6rem; flex-wrap: wrap; min-width: 0; }
  .researcher-page .trial-info .title { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 36ch; font-size: 14px; }
  .researcher-page .trial-info .meta { color: #64748b; font-family: ui-monospace, monospace; font-size: 12px; white-space: nowrap; }
  .researcher-page .example-btn {
    background: transparent; border: 1px dashed rgba(99,179,237,0.25);
    border-radius: 8px; padding: 0.4rem 0.8rem;
    color: #64748b; cursor: pointer; white-space: nowrap;
    font-size: 12.5px;
    transition: border-color 200ms, color 200ms;
  }
  .researcher-page .example-btn:hover { border-color: #63b3ed; color: #63b3ed; }

  /* ── Status line ── */
  .researcher-page .status-line { padding: 0 1.5rem; min-height: 0; }
  .researcher-page .status-msg { color: #64748b; font-size: 12.5px; padding: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem; }
  .researcher-page .status-msg::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #63b3ed; animation: rp-pulse 1.4s ease-in-out infinite; }
  @keyframes rp-pulse { 0%,100% { opacity:1; transform: scale(1); } 50% { opacity:0.4; transform: scale(0.8); } }
  .researcher-page .error-msg { color: #f87171; font-size: 12.5px; padding: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem; }
  .researcher-page .error-msg::before { content: '⚠'; font-size: 11px; }

  /* ── Tabs ── */
  .researcher-page .tab-row { display: none; gap: 0.3rem; padding: 0.6rem 1.5rem; border-bottom: 1px solid rgba(99,179,237,0.08); flex-shrink: 0; background: rgba(8,10,18,0.4); }
  .researcher-page .tab-row.visible { display: flex; }
  .researcher-page .tab-btn {
    background: none; border: 1px solid transparent;
    border-radius: 8px; color: #64748b;
    padding: 0.4rem 1rem; cursor: pointer; font-size: 13px; font-weight: 500;
    transition: color 200ms, border-color 200ms, background 200ms;
  }
  .researcher-page .tab-btn:hover { color: #94a3b8; border-color: rgba(99,179,237,0.1); }
  .researcher-page .tab-btn.active { color: #e2e8f0; background: rgba(99,179,237,0.1); border-color: rgba(99,179,237,0.25); font-weight: 600; }

  /* ── Workspace ── */
  .researcher-page .view { display: none; flex: 1; overflow: hidden; }
  .researcher-page .view.active { display: flex; flex-direction: column; overflow: hidden; }
  .researcher-page .view-sub { color: #64748b; font-size: 12.5px; padding: 0.5rem 1.5rem; flex-shrink: 0; border-bottom: 1px solid rgba(99,179,237,0.05); }
  .researcher-page .workspace {
    display: grid; grid-template-columns: 340px 1fr;
    flex: 1; overflow: hidden;
    margin: 0.75rem 1rem 1rem;
    background: rgba(10,13,22,0.7);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(99,179,237,0.1);
    border-radius: 16px;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.03) inset, 0 24px 64px rgba(0,0,0,0.7);
  }
  @media (max-width: 900px) { .researcher-page .workspace { grid-template-columns: 1fr; margin: 0.5rem; } }
  .researcher-page .panel { padding: 1rem 1.1rem; }
  .researcher-page .candidates-panel {
    border-right: 1px solid rgba(99,179,237,0.08);
    display: flex; flex-direction: column; overflow: hidden;
    background: rgba(6,8,14,0.5);
  }
  @media (max-width: 900px) { .researcher-page .candidates-panel { border-right: none; border-bottom: 1px solid rgba(99,179,237,0.08); } }

  /* ── Funnel / Chart area ── */
  .researcher-page .funnel { margin-bottom: 0.75rem; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .researcher-page #funnelChart { max-height: 170px; width: 100%; margin-bottom: 0.4rem; }
  .researcher-page .funnel-figure { font-family: ui-monospace, monospace; font-size: 28px; font-weight: 600; color: #63b3ed; line-height: 1.1; letter-spacing: -0.02em; }
  .researcher-page .funnel-figure .of { color: #475569; font-size: 17px; font-weight: 400; }
  .researcher-page .funnel-label { color: #94a3b8; font-size: 12.5px; margin-top: 0.2rem; font-weight: 500; }
  .researcher-page .funnel-sub { color: #475569; font-size: 11.5px; margin-top: 0.3rem; font-family: ui-monospace, monospace; }

  /* ── Candidate list ── */
  .researcher-page .candidate-list {
    display: flex; flex-direction: column; gap: 1.1rem;
    overflow-y: auto; flex: 1;
    padding: 0.5rem 0.6rem 1rem 0.25rem;
    scrollbar-width: thin; scrollbar-color: rgba(99,179,237,0.2) transparent;
  }
  .researcher-page .candidate {
    display: block; width: 100%; text-align: left;
    background: rgba(12,16,28,0.7);
    border: 1px solid rgba(99,179,237,0.08);
    border-radius: 12px; padding: 1rem 1.15rem;
    cursor: pointer;
    transition: border-color 200ms, background 200ms, transform 150ms, box-shadow 200ms;
    position: relative; overflow: hidden;
    animation: rp-fadein 300ms ease both;
  }
  @keyframes rp-fadein { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: none; } }
  .researcher-page .candidate::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; border-radius: 2px;
    background: linear-gradient(180deg, #63b3ed, #7c3aed);
    opacity: 0; transition: opacity 200ms;
  }
  .researcher-page .candidate:hover { border-color: rgba(99,179,237,0.25); background: rgba(99,179,237,0.05); transform: translateX(2px); box-shadow: 0 4px 16px rgba(0,0,0,0.4); }
  .researcher-page .candidate:hover::before { opacity: 1; }
  .researcher-page .candidate.selected { border-color: rgba(99,179,237,0.4); background: rgba(99,179,237,0.09); box-shadow: 0 0 0 1px rgba(99,179,237,0.15) inset; }
  .researcher-page .candidate.selected::before { opacity: 1; }
  .researcher-page .candidate-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
  .researcher-page .candidate-name { font-size: 13.5px; font-weight: 600; color: #e2e8f0; }
  .researcher-page .candidate-id { font-family: ui-monospace, monospace; font-size: 11px; color: #475569; margin-top: 0.15rem; }
  .researcher-page .candidate-demo { color: #64748b; font-size: 12px; margin-top: 0.3rem; font-family: ui-monospace, monospace; }
  .researcher-page .candidate-tally { color: #475569; font-size: 11px; font-family: ui-monospace, monospace; margin-top: 0.45rem; padding-top: 0.45rem; border-top: 1px solid rgba(99,179,237,0.06); }

  /* ── Badges ── */
  .researcher-page .badge { font-family: ui-monospace, monospace; font-size: 9.5px; letter-spacing: 0.05em; text-transform: uppercase; padding: 0.15rem 0.5rem; border-radius: 99px; white-space: nowrap; font-weight: 700; }
  .researcher-page .badge-eligible { background: rgba(52,211,153,0.12); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
  .researcher-page .badge-ineligible { background: rgba(248,113,113,0.12); color: #f87171; border: 1px solid rgba(248,113,113,0.2); }
  .researcher-page .badge-needs_more_data { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }

  /* ── Detail panel ── */
  .researcher-page .detail-panel { overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(99,179,237,0.2) transparent; }
  .researcher-page .detail-empty { color: #475569; font-size: 13px; padding-top: 0.5rem; line-height: 1.7; }
  .researcher-page .detail-header {
    display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
    padding-bottom: 1rem; margin-bottom: 1rem;
    border-bottom: 1px solid rgba(99,179,237,0.08);
  }
  .researcher-page .detail-header .pt-name { font-size: 16px; font-weight: 700; color: #e2e8f0; letter-spacing: -0.01em; }
  .researcher-page .detail-header .pt-id { font-family: ui-monospace, monospace; font-size: 11px; color: #475569; }
  .researcher-page .detail-header .demo { color: #64748b; font-family: ui-monospace, monospace; font-size: 12.5px; }
  .researcher-page .group-label { margin: 1.4rem 0 0.6rem; font-family: ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: #475569; }
  .researcher-page .group-label:first-of-type { margin-top: 0; }
  .researcher-page .criterion { border-top: 1px solid rgba(99,179,237,0.07); padding: 0.85rem 0; }
  .researcher-page .criterion:first-of-type { border-top: none; }
  .researcher-page .criterion-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
  .researcher-page .criterion-text { flex: 1; font-size: 13px; line-height: 1.6; }
  .researcher-page .verdict-pill { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; padding: 0.18rem 0.5rem; border-radius: 6px; white-space: nowrap; flex-shrink: 0; font-weight: 600; }
  .researcher-page .verdict-pass { background: rgba(52,211,153,0.12); color: #34d399; }
  .researcher-page .verdict-fail { background: rgba(248,113,113,0.12); color: #f87171; }
  .researcher-page .verdict-unknown { background: rgba(251,191,36,0.12); color: #fbbf24; }
  .researcher-page .criterion-meta { display: flex; flex-wrap: wrap; gap: 0.4rem 1rem; margin-top: 0.5rem; font-family: ui-monospace, monospace; font-size: 11.5px; }
  .researcher-page .criterion-meta .kv-label { color: #475569; }
  .researcher-page .criterion-meta .kv-value { color: #94a3b8; }
  .researcher-page .criterion-reason { color: #64748b; font-size: 12px; margin-top: 0.4rem; line-height: 1.6; }
  .researcher-page .verify-btn { background: none; border: none; padding: 0; color: #3b82f6; font-family: ui-monospace, monospace; font-size: 11px; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
  .researcher-page .verify-btn:hover { color: #93c5fd; }
  .researcher-page .verify-btn:disabled { color: #374151; cursor: default; text-decoration: none; }
  .researcher-page .verify-panel { margin-top: 0.6rem; background: rgba(15,20,35,0.95); border: 1px solid rgba(99,179,237,0.1); border-radius: 10px; padding: 0.75rem 0.9rem; font-size: 12px; }
  .researcher-page .verify-panel .verify-row { display: flex; justify-content: space-between; gap: 1rem; padding: 0.2rem 0; font-family: ui-monospace, monospace; }
  .researcher-page .verify-panel .verify-row .k { color: #475569; }
  .researcher-page .verify-panel .verify-row .v { color: #e2e8f0; text-align: right; }
  .researcher-page .verify-panel .verify-row .v.abnormal { color: #f87171; }
  .researcher-page .verify-status { margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(99,179,237,0.08); font-family: ui-monospace, monospace; font-size: 11.5px; }
  .researcher-page .verify-status.ok { color: #34d399; }
  .researcher-page .verify-status.mismatch { color: #f87171; }
  .researcher-page .rule-breakdown { margin-top: 0.6rem; padding-left: 0.85rem; border-left: 2px solid rgba(99,179,237,0.1); }
  .researcher-page .rule-row { padding: 0.45rem 0; border-top: 1px solid rgba(99,179,237,0.07); font-size: 12px; }
  .researcher-page .rule-row:first-child { border-top: none; }
  .researcher-page .rule-row .rule-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; font-family: ui-monospace, monospace; color: #94a3b8; }
  .researcher-page .rule-row .rule-group-label { color: #475569; text-transform: uppercase; letter-spacing: 0.04em; font-size: 10px; margin-right: 0.5rem; }
  .researcher-page .skeleton { color: #475569; font-size: 12.5px; display: flex; align-items: center; gap: 0.5rem; }
  .researcher-page .skeleton::before { content: ''; display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #63b3ed; animation: rp-pulse 1.2s ease-in-out infinite; }

  /* ── Progress panel ── */
  .researcher-page #progressPanel { display: flex; flex-direction: column; position: sticky; top: 0; align-self: start; max-height: 100vh; overflow: hidden; }
  .researcher-page #progressPanel #metricsArea { flex-shrink: 0; }
  .researcher-page #progressList { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding-right: 0.25rem; margin-right: -0.25rem; scrollbar-width: thin; scrollbar-color: rgba(99,179,237,0.2) transparent; }
  @media (max-width: 900px) { .researcher-page #progressPanel { position: static; max-height: none; overflow: visible; } .researcher-page #progressList { overflow-y: visible; } }

  /* ── Metrics ── */
  .researcher-page .metrics-row { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
  .researcher-page .metric { min-width: 72px; }
  .researcher-page .metric-figure { font-family: ui-monospace, monospace; font-size: 22px; font-weight: 600; line-height: 1.1; letter-spacing: -0.01em; }
  .researcher-page .metric-figure.headline { font-size: 28px; color: #63b3ed; }
  .researcher-page .metric-label { color: #64748b; font-size: 12px; margin-top: 0.15rem; }
  .researcher-page .metric-sub { color: #475569; font-size: 11px; margin-top: 0.2rem; font-family: ui-monospace, monospace; max-width: 36ch; line-height: 1.5; }
  .researcher-page .disclaimer { color: #374151; font-size: 11px; line-height: 1.6; max-width: 60ch; padding: 0.6rem 0 1rem; border-bottom: 1px solid rgba(99,179,237,0.07); margin-bottom: 1rem; }
  .researcher-page .metrics-top { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1rem; }
  .researcher-page .progress-ring { width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; position: relative; }
  .researcher-page .progress-ring-hole { position: absolute; inset: 9px; background: #08090d; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .researcher-page .progress-ring-pct { font-family: ui-monospace, monospace; font-size: 17px; font-weight: 700; color: #63b3ed; }
  .researcher-page .metrics-side { display: flex; gap: 1.5rem; }

  /* ── Patient progress rows ── */
  .researcher-page .patient-progress-row {
    display: block; width: 100%; text-align: left;
    background: rgba(12,16,28,0.7); border: 1px solid rgba(99,179,237,0.08);
    border-radius: 10px; padding: 0.7rem 0.9rem; cursor: pointer;
    margin-bottom: 0.65rem;
    transition: border-color 200ms, background 200ms, transform 150ms;
    animation: rp-fadein 300ms ease both;
  }
  .researcher-page .patient-progress-row:hover { border-color: rgba(99,179,237,0.2); transform: translateX(2px); }
  .researcher-page .patient-progress-row.selected { border-color: rgba(99,179,237,0.4); background: rgba(99,179,237,0.09); }
  .researcher-page .ppr-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.15rem; }
  .researcher-page .ppr-name { font-size: 13px; font-weight: 600; color: #e2e8f0; }
  .researcher-page .ppr-id { font-family: ui-monospace, monospace; font-size: 10.5px; color: #475569; }
  .researcher-page .status-tag { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; color: #475569; }
  .researcher-page .ppr-tests { display: flex; flex-direction: column; gap: 0.15rem; margin-top: 0.4rem; }
  .researcher-page .test-readout { display: flex; align-items: center; gap: 0.5rem; font-family: ui-monospace, monospace; font-size: 11px; }
  .researcher-page .dev-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .researcher-page .dev-improved { background: #34d399; }
  .researcher-page .dev-worsened { background: #f87171; }
  .researcher-page .dev-indeterminate { background: #94a3b8; }
  .researcher-page .dev-no_data { background: #374151; }
  .researcher-page .readout-value { color: #64748b; }

  /* ── Test detail ── */
  .researcher-page .test-detail { border-top: 1px solid rgba(99,179,237,0.07); padding: 0.9rem 0; }
  .researcher-page .test-detail:first-of-type { border-top: none; }
  .researcher-page .test-detail-top { display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem; }
  .researcher-page .test-name { font-size: 13px; font-weight: 600; }
  .researcher-page .dev-pill { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; padding: 0.18rem 0.5rem; border-radius: 6px; white-space: nowrap; display: flex; align-items: center; gap: 0.35rem; font-weight: 600; }
  .researcher-page .dev-pill.dev-improved { background: rgba(52,211,153,0.12); color: #34d399; }
  .researcher-page .dev-pill.dev-worsened { background: rgba(248,113,113,0.12); color: #f87171; }
  .researcher-page .dev-pill.dev-indeterminate { background: rgba(148,163,184,0.1); color: #94a3b8; }
  .researcher-page .dev-pill.dev-no_data { background: rgba(55,65,81,0.3); color: #64748b; }
  .researcher-page .test-readout-line { font-family: ui-monospace, monospace; font-size: 13px; margin-top: 0.4rem; }
  .researcher-page .test-citations { display: flex; flex-wrap: wrap; gap: 0.4rem 1rem; margin-top: 0.4rem; font-family: ui-monospace, monospace; font-size: 11px; color: #475569; }
  .researcher-page .change-bar-wrap { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.15rem; }
  .researcher-page .change-bar-track { width: 56px; height: 4px; border-radius: 3px; background: rgba(99,179,237,0.08); overflow: hidden; flex-shrink: 0; }
  .researcher-page .change-bar-fill { height: 100%; border-radius: 3px; }
  .researcher-page .change-bar-fill.dev-improved { background: #34d399; }
  .researcher-page .change-bar-fill.dev-worsened { background: #f87171; }
  .researcher-page .change-bar-fill.dev-indeterminate { background: #94a3b8; }
  .researcher-page .change-bar-fill.dev-no_data { background: #374151; }

  /* ── Cohort chart ── */
  .researcher-page .cohort-chart { margin-top: 0.4rem; }
  .researcher-page .cohort-title { font-family: ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: #475569; margin-bottom: 0.9rem; }
  .researcher-page .cohort-row { margin-bottom: 0.9rem; }
  .researcher-page .cohort-row-label { display: flex; justify-content: space-between; font-family: ui-monospace, monospace; font-size: 12px; margin-bottom: 0.3rem; }
  .researcher-page .cohort-row-label .name { color: #e2e8f0; }
  .researcher-page .cohort-row-label .counts { color: #475569; font-size: 11px; }
  .researcher-page .cohort-track { display: flex; height: 6px; border-radius: 4px; overflow: hidden; background: rgba(99,179,237,0.08); }
  .researcher-page .cohort-segment { height: 100%; }
  .researcher-page .cohort-segment.seg-improved { background: #34d399; }
  .researcher-page .cohort-segment.seg-worsened { background: #f87171; }
  .researcher-page .cohort-segment.seg-indeterminate { background: #fbbf24; }
  .researcher-page .cohort-segment.seg-no_data { background: #374151; }
  .researcher-page .cohort-legend { display: flex; flex-wrap: wrap; gap: 0.3rem 1rem; margin-top: 1rem; padding-top: 0.9rem; border-top: 1px solid rgba(99,179,237,0.07); font-size: 11px; color: #64748b; }
  .researcher-page .cohort-legend .dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 0.35rem; }

  /* ── Enrollment rows ── */
  .researcher-page .enrollment-row {
    background: rgba(12,16,28,0.7); border: 1px solid rgba(99,179,237,0.08);
    border-radius: 10px; padding: 0.75rem 0.9rem; margin-bottom: 0.65rem;
    animation: rp-fadein 300ms ease both;
    transition: border-color 200ms;
  }
  .researcher-page .er-btn.loading { opacity: 0.5; cursor: wait; pointer-events: none; }
  .researcher-page .enrollment-row:hover { border-color: rgba(99,179,237,0.15); }
  .researcher-page .er-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; }
  .researcher-page .er-name { font-size: 13px; font-weight: 600; color: #e2e8f0; }
  .researcher-page .er-id { font-family: ui-monospace, monospace; font-size: 11px; color: #475569; }
  .researcher-page .er-id-btn {
    font-family: ui-monospace, monospace; font-size: 11px;
    background: none; border: none; padding: 0; color: #475569; cursor: pointer;
    text-decoration: underline dotted #374151; text-underline-offset: 2px;
  }
  .researcher-page .er-id-btn:hover { color: #63b3ed; }
  .researcher-page .er-id-btn.copied { color: #34d399; text-decoration: none; }
  .researcher-page .status-pill { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; padding: 0.15rem 0.5rem; border-radius: 99px; white-space: nowrap; font-weight: 600; }
  .researcher-page .status-pill.st-not_invited { background: rgba(55,65,81,0.3); color: #6b7280; }
  .researcher-page .status-pill.st-invited { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
  .researcher-page .status-pill.st-accepted { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
  .researcher-page .status-pill.st-consented { background: rgba(99,179,237,0.12); color: #63b3ed; border: 1px solid rgba(99,179,237,0.2); }
  .researcher-page .status-pill.st-enrolled { background: rgba(52,211,153,0.12); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
  .researcher-page .status-pill.st-declined { background: rgba(55,65,81,0.3); color: #6b7280; }
  .researcher-page .status-pill.st-withdrawn { background: rgba(248,113,113,0.12); color: #f87171; border: 1px solid rgba(248,113,113,0.2); }
  .researcher-page .er-actions { display: flex; gap: 0.35rem; margin-top: 0.5rem; flex-wrap: wrap; align-items: center; }
  .researcher-page .er-btn {
    font-size: 11.5px; padding: 0.3rem 0.65rem; border-radius: 8px;
    border: 1px solid rgba(99,179,237,0.12); background: transparent;
    color: #94a3b8; cursor: pointer;
    transition: border-color 200ms, color 200ms, background 200ms;
  }
  .researcher-page .er-btn:hover { border-color: rgba(99,179,237,0.4); color: #63b3ed; background: rgba(99,179,237,0.06); }
  .researcher-page .er-btn.danger:hover { border-color: rgba(248,113,113,0.4); color: #f87171; background: rgba(248,113,113,0.06); }
  .researcher-page .er-btn:disabled { opacity: 0.35; cursor: default; }
  .researcher-page .er-link { font-size: 11.5px; color: #3b82f6; text-decoration: none; }
  .researcher-page .er-link:hover { text-decoration: underline; }

  /* ── Enrollment summary + bar chart ── */
  .researcher-page .enrollment-summary-card {
    background: rgba(10,13,22,0.6); border: 1px solid rgba(99,179,237,0.08);
    border-radius: 12px; padding: 0.9rem 1rem; margin-bottom: 0.75rem;
  }
  .researcher-page .enr-stats { display: flex; gap: 1.25rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
  .researcher-page .enr-stat { }
  .researcher-page .enr-stat-num { font-family: ui-monospace, monospace; font-size: 20px; font-weight: 700; color: #e2e8f0; line-height: 1.1; }
  .researcher-page .enr-stat-label { font-size: 11px; color: #475569; margin-top: 0.1rem; }
  .researcher-page #enrollmentBarChart { max-height: 90px; width: 100%; }

  /* ── Audit table ── */
  .researcher-page .audit-wrap { overflow-x: auto; }
  .researcher-page .audit-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .researcher-page .audit-table th {
    text-align: left; color: #475569; font-family: ui-monospace, monospace;
    font-size: 9.5px; letter-spacing: 0.06em; text-transform: uppercase;
    font-weight: 600; padding: 0.5rem 0.75rem;
    border-bottom: 1px solid rgba(99,179,237,0.1);
    background: rgba(6,8,14,0.5);
  }
  .researcher-page .audit-table td {
    padding: 0.55rem 0.75rem; border-bottom: 1px solid rgba(99,179,237,0.05);
    font-family: ui-monospace, monospace; color: #64748b; vertical-align: top;
    transition: background 150ms;
  }
  .researcher-page .audit-table tr:hover td { background: rgba(99,179,237,0.03); }
  .researcher-page .audit-table td.actor-cell { }
  .researcher-page .actor-badge {
    display: inline-block; font-size: 9.5px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase;
    padding: 0.12rem 0.45rem; border-radius: 99px;
  }
  .researcher-page .actor-badge.actor-researcher { background: rgba(99,179,237,0.12); color: #63b3ed; border: 1px solid rgba(99,179,237,0.2); }
  .researcher-page .actor-badge.actor-patient { background: rgba(52,211,153,0.12); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
  .researcher-page .actor-badge.actor-system { background: rgba(148,163,184,0.1); color: #94a3b8; border: 1px solid rgba(148,163,184,0.15); }
  .researcher-page .audit-action { color: #94a3b8; }
  .researcher-page .audit-pt-name { color: #e2e8f0; font-weight: 500; }
  .researcher-page .audit-pt-id { color: #374151; font-size: 10px; }

  /* ── Legend ── */
  .researcher-page .legend { display: flex; flex-wrap: wrap; gap: 0.3rem 1rem; font-size: 11px; color: #64748b; margin: 0.6rem 0 1rem; }
  .researcher-page .legend .dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 0.35rem; }

  /* ── Empty state ── */
  .researcher-page .empty-state {
    border: 1px dashed rgba(99,179,237,0.1); border-radius: 12px;
    padding: 1.6rem 1.5rem; text-align: center;
  }
  .researcher-page .empty-state-icon { font-size: 28px; margin-bottom: 0.6rem; opacity: 0.4; }
  .researcher-page .empty-state-title { font-size: 14px; font-weight: 600; margin-bottom: 0.4rem; color: #94a3b8; }
  .researcher-page .empty-state-body { color: #475569; font-size: 12.5px; line-height: 1.7; max-width: 42ch; margin: 0 auto; }
  .researcher-page .empty-state .example-btn { margin-top: 1rem; }
`;

export default function ResearcherDashboard({ navigate }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'researcher-styles';
    style.textContent = STYLE;
    document.head.appendChild(style);

    let chartScript = document.getElementById('chartjs-cdn');
    const onChartReady = () => initResearcherApp(navigate, containerRef.current);

    if (!chartScript) {
      chartScript = document.createElement('script');
      chartScript.id = 'chartjs-cdn';
      chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      chartScript.onload = onChartReady;
      document.head.appendChild(chartScript);
    } else if (window.Chart) {
      onChartReady();
    } else {
      chartScript.addEventListener('load', onChartReady);
    }

    return () => {
      document.head.removeChild(style);
      if (window.__tmEnrollmentPollTimer) {
        clearInterval(window.__tmEnrollmentPollTimer);
        window.__tmEnrollmentPollTimer = null;
      }
    };
  }, []);

  return (
    <div
      className="researcher-page"
      ref={containerRef}
      style={{
        background: '#06080e',
        backgroundImage: 'radial-gradient(ellipse at 15% 0%, rgba(59,130,246,0.1) 0%, transparent 45%), radial-gradient(ellipse at 85% 100%, rgba(124,58,237,0.08) 0%, transparent 45%), radial-gradient(ellipse at 50% 55%, rgba(52,211,153,0.03) 0%, transparent 60%)',
        backgroundAttachment: 'fixed',
        color: '#e2e8f0',
        fontFamily: "'Inter', -apple-system, sans-serif",
        fontSize: 14,
        lineHeight: 1.6,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      <div className="session-bar">
        <div className="session-left">
          <button className="home-link" onClick={() => navigate('landing')}>
            <span className="home-mark">◆</span>
            TriMatch
          </button>
          <span className="crumb-sep">›</span>
          <span className="role-badge role-researcher">Researcher Portal</span>
          <span className="crumb-sep" id="crumbSep" style={{ display: 'none' }}>›</span>
          <span className="crumb-current" id="crumbCurrent"></span>
        </div>
        <div className="session-left">
          <span className="session-name" id="sessionName">Guest researcher</span>
          <button className="signout-btn" id="signoutBtn">Sign out</button>
        </div>
      </div>

      <header>
        <div className="brand">TriMatch <span className="dim">Researcher</span></div>
        <div className="load-row">
          <input type="text" id="nctInput" placeholder="NCT ID, e.g. NCT04280705" title="A ClinicalTrials.gov trial ID, or one of your own trial IDs" />
          <input type="number" id="patientCountInput" placeholder="Patients" defaultValue="30" min="1" max="1000" title="How many patients from the pool to evaluate" />
          <button id="loadBtn">Load trial</button>
        </div>
        <div className="trial-info" id="trialInfo"></div>
      </header>

      <div className="tab-row" id="tabRow">
        <button className="tab-btn active" id="tabCandidates">Candidates</button>
        <button className="tab-btn" id="tabProgress">Trial Progress</button>
        <button className="tab-btn" id="tabEnrollment">Enrollment &amp; Consent</button>
      </div>

      <div className="status-line" id="statusLine"></div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Candidates view */}
        <div className="view active" id="viewCandidates">
          <div className="view-sub" id="candidatesViewSub" style={{ display: 'none' }}>Patients ranked by how well they match this trial's eligibility criteria. Click any candidate for a full pass/fail breakdown.</div>
          <main className="workspace">
            <section className="panel candidates-panel">
              <div id="funnelArea"></div>
              <div className="candidate-list" id="candidateList">
                <div className="empty-state">
                  <div className="empty-state-icon">🔬</div>
                  <div className="empty-state-title">No trial loaded yet</div>
                  <div className="empty-state-body">Enter a clinical trial ID above — an NCT number from ClinicalTrials.gov, or your own trial ID — then click "Load trial" to see ranked, eligible candidates.</div>
                  <button type="button" className="example-btn" id="exampleBtnEmpty">Try example trial</button>
                </div>
              </div>
            </section>
            <section className="panel detail-panel" id="detailPanel">
              <div className="detail-empty">Load a trial and select a candidate on the left to see their full eligibility breakdown here.</div>
            </section>
          </main>
        </div>

        {/* Progress view */}
        <div className="view" id="viewProgress">
          <div className="view-sub">Compares each enrolled patient's most recent lab results against their baseline — see who's trending better or worse.</div>
          <main className="workspace">
            <section className="panel candidates-panel" id="progressPanel">
              <div id="metricsArea"></div>
              <div className="candidate-list" id="progressList"></div>
            </section>
            <section className="panel detail-panel" id="progressDetailPanel">
              <div className="detail-empty">Select a patient on the left to see their full test-by-test breakdown.</div>
            </section>
          </main>
        </div>

        {/* Enrollment view */}
        <div className="view" id="viewEnrollment">
          <div className="view-sub">Invite candidates, track consent status, and review a complete timestamped audit trail of every action taken.</div>
          <main className="workspace">
            <section className="panel candidates-panel">
              <div id="enrollmentSummary"></div>
              <div className="candidate-list" id="enrollmentList"></div>
            </section>
            <section className="panel detail-panel" id="auditPanel">
              <div className="detail-empty">The audit trail — a timestamped record of every invite, consent, and enrollment action — will appear here.</div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── App logic ────────────────────────────────────────────────────────────────

function initResearcherApp(navigate, container) {
  if (!container) return;

  // Session
  const name = sessionStorage.getItem('tm_researcher_name');
  const org = sessionStorage.getItem('tm_researcher_org');
  const sessionNameEl = container.querySelector('#sessionName');
  if (name && sessionNameEl) sessionNameEl.textContent = org ? `${name} · ${org}` : name;
  const signoutBtn = container.querySelector('#signoutBtn');
  if (signoutBtn) signoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('tm_researcher_name');
    sessionStorage.removeItem('tm_researcher_org');
    navigate('landing');
  });

  const nctInput = container.querySelector('#nctInput');
  const patientCountInput = container.querySelector('#patientCountInput');
  const loadBtn = container.querySelector('#loadBtn');
  const trialInfo = container.querySelector('#trialInfo');
  const statusLine = container.querySelector('#statusLine');
  const funnelArea = container.querySelector('#funnelArea');
  const candidateList = container.querySelector('#candidateList');
  const detailPanel = container.querySelector('#detailPanel');
  const tabRow = container.querySelector('#tabRow');
  const tabCandidates = container.querySelector('#tabCandidates');
  const tabProgress = container.querySelector('#tabProgress');
  const tabEnrollment = container.querySelector('#tabEnrollment');
  const viewCandidates = container.querySelector('#viewCandidates');
  const viewProgress = container.querySelector('#viewProgress');
  const viewEnrollment = container.querySelector('#viewEnrollment');
  const metricsArea = container.querySelector('#metricsArea');
  const progressList = container.querySelector('#progressList');
  const progressDetailPanel = container.querySelector('#progressDetailPanel');
  const enrollmentSummary = container.querySelector('#enrollmentSummary');
  const enrollmentList = container.querySelector('#enrollmentList');
  const auditPanel = container.querySelector('#auditPanel');
  const crumbSep = container.querySelector('#crumbSep');
  const crumbCurrent = container.querySelector('#crumbCurrent');
  const candidatesViewSub = container.querySelector('#candidatesViewSub');

  const EXAMPLE_TRIAL_ID = 'TM-METABOLIC-001';
  const TAB_LABELS = { candidates: 'Candidates', progress: 'Trial Progress', enrollment: 'Enrollment & Consent' };

  const OVERALL_HELP = {
    eligible: 'Meets every criterion the trial has structured data for.',
    ineligible: 'Fails at least one eligibility criterion.',
    'needs more data': "Doesn't fail anything, but is missing data needed to confirm eligibility.",
  };
  const VERDICT_HELP = {
    pass: 'This criterion is met.',
    fail: 'This criterion is not met.',
    unknown: "Missing data for this criterion — needs human review.",
  };
  const STATUS_HELP = {
    not_invited: 'Not yet invited to this trial.',
    invited: 'Invitation sent; awaiting the patient\'s response.',
    accepted: 'Patient is in the middle of responding to consent.',
    consented: 'Patient has consented; awaiting researcher enrollment.',
    enrolled: 'Enrolled in the trial — baseline set, progress is being tracked.',
    declined: 'Patient declined the invitation.',
    withdrawn: 'Patient withdrew after previously accepting or enrolling.',
  };

  // Audit action labels — includes both withdrawal variants
  const ACTION_LABELS = {
    'patient.invited': 'Invitation sent',
    'patient.accepted': 'Patient began responding',
    'consent.recorded': 'Consent recorded',
    'patient.enrolled': 'Enrollment confirmed',
    'patient.withdrawn': 'Patient withdrew',
    'patient.withdrawn_by_researcher': 'Withdrawn by researcher',
    'patient.declined': 'Patient declined',
  };

  let currentNctId = null, currentPatientCount = 30, selectedPatientId = null;
  let progressLoadedFor = null, enrollmentLoadedFor = null;
  let cachedCandidates = null, cachedCandidatesFor = null;
  // Name map: patient_id -> display name (built from candidates data)
  let nameMap = {};

  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function shortId(id) { return id && id.length > 10 ? id.slice(0, 8) + '…' : (id || '—'); }

  function displayName(patientId, candidateName) {
    if (candidateName) return candidateName;
    if (nameMap[patientId]) return nameMap[patientId];
    return shortId(patientId);
  }

  function copyFullId(btn) {
    const fullId = btn.dataset.fullId;
    const original = btn.textContent;
    const revert = () => { btn.textContent = original; btn.classList.remove('copied'); };
    navigator.clipboard.writeText(fullId)
      .then(() => { btn.textContent = 'Copied!'; btn.classList.add('copied'); setTimeout(revert, 1200); })
      .catch(() => { btn.textContent = fullId; setTimeout(revert, 2000); });
  }

  function setStatus(msg) { statusLine.innerHTML = msg ? `<div class="status-msg">${esc(msg)}</div>` : ''; }
  function setError(msg) { statusLine.innerHTML = `<div class="error-msg">${esc(msg)}</div>`; }
  function badgeClass(overall) { return 'badge-' + overall.replace(/ /g, '_'); }

  function emptyStateHtml(icon = '🔬', title = 'No trial loaded yet', body = 'Enter a clinical trial ID above — an NCT number from ClinicalTrials.gov, or your own trial ID — then click "Load trial" to see ranked, eligible candidates.', showBtn = true) {
    return `<div class="empty-state"><div class="empty-state-icon">${icon}</div><div class="empty-state-title">${title}</div><div class="empty-state-body">${body}</div>${showBtn ? '<button type="button" class="example-btn" id="exampleBtnEmpty">Try example trial</button>' : ''}</div>`;
  }

  function wireExampleButton() {
    const btn = container.querySelector('#exampleBtnEmpty');
    if (btn) btn.addEventListener('click', () => { nctInput.value = EXAMPLE_TRIAL_ID; loadTrial(); });
  }

  // ── Load trial ─────────────────────────────────────────────────────────────
  async function loadTrial() {
    const nctId = nctInput.value.trim();
    if (!nctId) return;
    const rawCount = parseInt(patientCountInput.value, 10);
    currentPatientCount = Number.isFinite(rawCount) ? Math.min(1000, Math.max(1, rawCount)) : 30;
    patientCountInput.value = currentPatientCount;
    loadBtn.disabled = true;
    nameMap = {};
    trialInfo.innerHTML = '';
    funnelArea.innerHTML = '';
    candidateList.innerHTML = '';
    detailPanel.innerHTML = '<div class="detail-empty">Select a candidate to see the full breakdown.</div>';
    metricsArea.innerHTML = ''; progressList.innerHTML = '';
    progressDetailPanel.innerHTML = '<div class="detail-empty">Select a patient to see their full test breakdown.</div>';
    enrollmentSummary.innerHTML = ''; enrollmentList.innerHTML = '';
    auditPanel.innerHTML = '<div class="detail-empty">Audit trail for this trial will appear here.</div>';
    selectedPatientId = null; progressLoadedFor = null; enrollmentLoadedFor = null;
    cachedCandidates = null; cachedCandidatesFor = null;
    tabRow.classList.remove('visible');
    crumbSep.style.display = 'none'; crumbCurrent.textContent = '';
    candidatesViewSub.style.display = 'none';
    switchTab('candidates'); stopEnrollmentPolling();
    setStatus(`Loading trial ${nctId}…`);
    try {
      const res = await fetch(`/trials/${encodeURIComponent(nctId)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'No trial found for that ID. Double-check the ID, or try our example trial.');
        candidateList.innerHTML = emptyStateHtml();
        wireExampleButton(); loadBtn.disabled = false; return;
      }
      currentNctId = data.nct_id;
      const phase = Array.isArray(data.phase) ? data.phase.join(', ') : data.phase;
      trialInfo.innerHTML = `<span class="title">${esc(data.title || data.nct_id)}</span><span class="meta">${esc(data.nct_id)}${phase ? ' · ' + esc(phase) : ''}${data.overall_status ? ' · ' + esc(data.overall_status) : ''}</span>`;
      tabRow.classList.add('visible');
      crumbSep.style.display = '';
      candidatesViewSub.style.display = '';
      switchTab('candidates');
      await loadCandidates(currentNctId);
    } catch (err) {
      setError('Could not reach the server. Try again.');
      candidateList.innerHTML = emptyStateHtml();
      wireExampleButton();
    } finally {
      loadBtn.disabled = false;
    }
  }

  function switchTab(tab) {
    crumbCurrent.textContent = TAB_LABELS[tab] || '';
    tabCandidates.classList.toggle('active', tab === 'candidates');
    tabProgress.classList.toggle('active', tab === 'progress');
    tabEnrollment.classList.toggle('active', tab === 'enrollment');
    viewCandidates.classList.toggle('active', tab === 'candidates');
    viewProgress.classList.toggle('active', tab === 'progress');
    viewEnrollment.classList.toggle('active', tab === 'enrollment');
  }

  // ── Candidates ─────────────────────────────────────────────────────────────
  async function loadCandidates(nctId) {
    setStatus(`Evaluating ${currentPatientCount} patients…`);
    candidateList.innerHTML = ''; funnelArea.innerHTML = '';
    try {
      const res = await fetch(`/trials/${encodeURIComponent(nctId)}/db-candidates?limit=${currentPatientCount}&max_evaluate=${currentPatientCount}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'No parsed criteria for this trial yet.');
        candidateList.innerHTML = emptyStateHtml('📋', 'No criteria found', 'This trial has no parsed eligibility criteria yet. Parse criteria first.');
        wireExampleButton(); return;
      }
      setStatus('');

      // Build name map
      nameMap = {};
      data.candidates.forEach(c => { if (c.name) nameMap[c.patient_id] = c.name; });

      const eligibleCount = data.candidates.filter(c => c.overall === 'eligible').length;
      const ineligibleCount = data.candidates.filter(c => c.overall === 'ineligible').length;
      const unknownCount = data.candidates.filter(c => c.overall === 'needs more data').length;

      // Doughnut chart with center stat
      funnelArea.innerHTML = `
        <div class="funnel">
          <div style="position:relative;max-height:170px;width:100%;">
            <canvas id="funnelChart" style="max-height:170px"></canvas>
            <div id="chartCenter" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-52%);text-align:center;pointer-events:none;">
              <div style="font-family:ui-monospace,monospace;font-size:24px;font-weight:700;color:#63b3ed;line-height:1">${eligibleCount}</div>
              <div style="font-size:10px;color:#64748b;letter-spacing:0.04em;text-transform:uppercase;margin-top:2px;">eligible</div>
            </div>
          </div>
          <div class="funnel-label" style="margin-top:0.5rem">
            ${data.evaluated_count} / ${data.total_patients} patients evaluated
          </div>
          <div class="funnel-sub">${data.coarse_filtered_count} passed initial screen · showing top ${data.returned}</div>
        </div>`;

      if (window.funnelChartInst) window.funnelChartInst.destroy();
      const ctx = container.querySelector('#funnelChart').getContext('2d');
      window.funnelChartInst = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Eligible', 'Ineligible', 'Needs More Data'],
          datasets: [{
            data: [eligibleCount, ineligibleCount, unknownCount],
            backgroundColor: ['rgba(52,211,153,0.8)', 'rgba(248,113,113,0.8)', 'rgba(251,191,36,0.8)'],
            borderColor: ['rgba(52,211,153,0.2)', 'rgba(248,113,113,0.2)', 'rgba(251,191,36,0.2)'],
            borderWidth: 1,
            hoverOffset: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#64748b', font: { family: 'Inter', size: 11 },
                padding: 12, boxWidth: 10, boxHeight: 10,
              },
            },
            tooltip: {
              backgroundColor: 'rgba(10,13,22,0.95)',
              titleFont: { family: 'Inter', size: 12 },
              bodyFont: { family: 'Inter', size: 12 },
              borderColor: 'rgba(99,179,237,0.15)', borderWidth: 1,
              padding: 10,
            },
          },
        },
      });

      if (data.candidates.length === 0) {
        candidateList.innerHTML = emptyStateHtml('🔍', 'No candidates matched', 'No patients matched this trial\'s criteria in the evaluated pool.', false);
        return;
      }

      candidateList.innerHTML = data.candidates.map((c, idx) => {
        const demo = [c.age != null ? `${c.age}y` : null, c.sex].filter(Boolean).join(' · ');
        const pName = c.name || shortId(c.patient_id);
        return `<button class="candidate" data-pid="${esc(c.patient_id)}" style="animation-delay:${idx * 30}ms ; ">
          <div class="candidate-top">
            <span class="candidate-name">${esc(pName)}</span>
            <span class="badge ${badgeClass(c.overall)}" title="${esc(OVERALL_HELP[c.overall] || '')}">${esc(c.overall)}</span>
          </div>
          ${c.name ? `<div class="candidate-id">${esc(shortId(c.patient_id))}</div>` : ''}
          ${demo ? `<div class="candidate-demo">${esc(demo)}</div>` : ''}
          <div class="candidate-tally">${c.pass_count} pass · ${c.fail_count} fail · ${c.unknown_count} unknown</div>
        </button>`;
      }).join('');

      candidateList.querySelectorAll('.candidate').forEach(btn => {
        btn.addEventListener('click', () => selectCandidate(btn.dataset.pid));
      });
    } catch (err) {
      setError('Could not reach the server. Try again.');
      candidateList.innerHTML = emptyStateHtml();
      wireExampleButton();
    }
  }

  // ── Select candidate ────────────────────────────────────────────────────────
  async function selectCandidate(patientId) {
    selectedPatientId = patientId;
    candidateList.querySelectorAll('.candidate').forEach(btn =>
      btn.classList.toggle('selected', btn.dataset.pid === patientId)
    );
    detailPanel.innerHTML = '<div class="skeleton">Loading breakdown…</div>';
    try {
      const res = await fetch(`/trials/${encodeURIComponent(currentNctId)}/match/${encodeURIComponent(patientId)}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        detailPanel.innerHTML = `<div class="detail-empty">${esc(data.detail || 'Could not load this candidate.')}</div>`;
        return;
      }
      const inclusions = data.results.filter(r => r.type === 'inclusion');
      const exclusions = data.results.filter(r => r.type === 'exclusion');

      const verifyButton = (labResultId, patientValue, panelId) => {
        if (labResultId === null || labResultId === undefined) return '';
        const expected = JSON.stringify(patientValue === undefined ? null : patientValue);
        return `<button class="verify-btn" data-lab-id="${esc(labResultId)}" data-expected='${esc(expected)}' data-panel="${panelId}" title="Fetch the original lab record and confirm it matches">Verify source &rarr;</button>`;
      };
      const renderRuleBreakdown = (r) => {
        if (!r.rule_results || !r.rule_results.length) return '';
        const rows = r.rule_results.map((rr, i) => {
          const panelId = `verify-${esc(r.id)}-${i}`;
          const groupLabel = (rr.group !== null && rr.group !== undefined)
            ? `<span class="rule-group-label">Path ${rr.group + 1}</span>` : '';
          return `<div class="rule-row"><div class="rule-head"><span>${groupLabel}${esc(rr.field)} ${esc(rr.operator)} ${esc(rr.value)}<span class="kv-value"> (patient: ${esc(rr.patient_value)})</span></span>${verifyButton(rr.source_lab_result_id, rr.patient_value, panelId)}</div><div id="${panelId}"></div></div>`;
        }).join('');
        return `<div class="rule-breakdown">${rows}</div>`;
      };
      const renderCriterion = (r) => {
        const topPanelId = `verify-${esc(r.id)}`;
        const valueLabel = r.field ? esc(r.field) : 'value';
        return `<div class="criterion">
          <div class="criterion-top">
            <div class="criterion-text">${esc(r.text)}</div>
            <span class="verdict-pill verdict-${esc(r.verdict)}" title="${esc(VERDICT_HELP[r.verdict] || '')}">${esc(r.verdict)}</span>
          </div>
          <div class="criterion-meta">
            ${r.patient_value !== null && r.patient_value !== undefined
              ? `<span><span class="kv-label">${valueLabel}: </span><span class="kv-value">${esc(Array.isArray(r.patient_value) ? r.patient_value.join(', ') : r.patient_value)}</span></span>`
              : ''}
            ${r.source_lab_result_id !== null && r.source_lab_result_id !== undefined
              ? `<span><span class="kv-label">source </span><span class="kv-value">#${esc(r.source_lab_result_id)}</span></span> ${verifyButton(r.source_lab_result_id, r.patient_value, topPanelId)}`
              : ''}
          </div>
          <div class="criterion-reason">${esc(r.reason)}</div>
          <div id="${topPanelId}"></div>
          ${renderRuleBreakdown(r)}
        </div>`;
      };

      const ptName = displayName(patientId, null);
      detailPanel.innerHTML = `
        <div class="detail-header">
          <div>
            <div class="pt-name">${esc(ptName)}</div>
            <div class="pt-id">${esc(patientId)}</div>
          </div>
          <span class="badge ${badgeClass(data.overall)}" title="${esc(OVERALL_HELP[data.overall] || '')}">${esc(data.overall)}</span>
        </div>
        <div class="legend">
          <span title="${esc(VERDICT_HELP.pass)}"><span class="dot" style="background:#34d399"></span>Pass = criterion met</span>
          <span title="${esc(VERDICT_HELP.fail)}"><span class="dot" style="background:#f87171"></span>Fail = not met</span>
          <span title="${esc(VERDICT_HELP.unknown)}"><span class="dot" style="background:#fbbf24"></span>Unknown = missing data</span>
        </div>
        ${inclusions.length ? `<div class="group-label">Inclusion criteria</div>${inclusions.map(renderCriterion).join('')}` : ''}
        ${exclusions.length ? `<div class="group-label">Exclusion criteria</div>${exclusions.map(renderCriterion).join('')}` : ''}`;
    } catch (err) {
      detailPanel.innerHTML = '<div class="detail-empty">Could not reach the server. Try again.</div>';
    }
  }

  // Source verification
  detailPanel.addEventListener('click', async (e) => {
    const btn = e.target.closest('.verify-btn');
    if (!btn) return;
    const panel = container.querySelector('#' + btn.dataset.panel);
    if (!panel) return;
    let expectedRaw = null;
    try { expectedRaw = JSON.parse(btn.dataset.expected); } catch (_) { /* leave null */ }
    const expectedValues = Array.isArray(expectedRaw) ? expectedRaw : [expectedRaw];
    btn.disabled = true;
    panel.innerHTML = '<div class="verify-panel">Loading source record…</div>';
    try {
      const res = await fetch(`/lab-results/${encodeURIComponent(btn.dataset.labId)}`);
      const data = await res.json();
      if (!res.ok) {
        panel.innerHTML = `<div class="verify-panel">${esc(data.detail || 'Could not load source record.')}</div>`;
        btn.disabled = false; return;
      }
      const actualNum = parseFloat(data.value);
      const comparable = expectedValues.filter(v => v !== null && v !== undefined && !isNaN(parseFloat(v)));
      const matches = comparable.some(v => Math.abs(parseFloat(v) - actualNum) < 1e-6);
      const hasRange = data.reference_min != null && data.reference_max != null;
      panel.innerHTML = `<div class="verify-panel">
        <div class="verify-row"><span class="k">test</span><span class="v">${esc(data.test_name)} (${esc(data.test_code)})</span></div>
        <div class="verify-row"><span class="k">value</span><span class="v${data.abnormal_flag ? ' abnormal' : ''}">${esc(data.value)}${data.unit ? ' ' + esc(data.unit) : ''}${data.abnormal_flag ? ' — abnormal' : ''}</span></div>
        ${hasRange ? `<div class="verify-row"><span class="k">reference</span><span class="v">${esc(data.reference_min)} – ${esc(data.reference_max)}</span></div>` : ''}
        <div class="verify-row"><span class="k">test date</span><span class="v">${esc((data.test_date || '').replace('T', ' ').slice(0, 19)) || '—'}</span></div>
        <div class="verify-row"><span class="k">entered</span><span class="v">${esc((data.created_at || '').replace('T', ' ').slice(0, 19)) || '—'}</span></div>
        <div class="verify-row"><span class="k">lab report</span><span class="v">${esc(data.lab_report_id) || '—'}</span></div>
        ${comparable.length ? `<div class="verify-status ${matches ? 'ok' : 'mismatch'}">${matches ? '✓ Verified — matches the value this verdict used' : '⚠ Mismatch — source value differs from what the verdict used'}</div>` : ''}
      </div>`;
      btn.remove();
    } catch (_) {
      panel.innerHTML = '<div class="verify-panel">Could not reach the server. Try again.</div>';
      btn.disabled = false;
    }
  });

  // ── Progress ────────────────────────────────────────────────────────────────
  function devClass(status) { return 'dev-' + status; }
  function fmtValue(v) {
    if (v === null || v === undefined) return '—';
    return typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(2)) : v;
  }
  function fmtDate(d) { if (!d) return null; return d.slice(0, 10); }
  function changeBarWidth(t) {
    if (t.deviation === null || t.deviation === undefined || !t.baseline_value) return 0;
    return Math.min(Math.abs(t.deviation / t.baseline_value) * 100, 50) / 50 * 100;
  }
  function changeBarHtml(t) {
    return `<div class="change-bar-track"><div class="change-bar-fill ${devClass(t.status)}" style="width:${changeBarWidth(t)}%"></div></div>`;
  }

  function renderCohortChart(patients) {
    const byTest = {};
    patients.forEach(p => {
      p.tests.forEach(t => {
        if (!byTest[t.test_code]) byTest[t.test_code] = { name: t.test_name || t.test_code, improved: 0, worsened: 0, indeterminate: 0, no_data: 0 };
        if (byTest[t.test_code][t.status] !== undefined) byTest[t.test_code][t.status]++;
      });
    });
    const codes = Object.keys(byTest).sort();
    if (!codes.length) return '<div class="detail-empty">No test data recorded for enrolled patients yet.</div>';
    const rows = codes.map(code => {
      const c = byTest[code];
      const total = c.improved + c.worsened + c.indeterminate + c.no_data;
      const seg = (n) => total ? (n / total * 100) : 0;
      return `<div class="cohort-row">
        <div class="cohort-row-label">
          <span class="name">${esc(c.name)}</span>
          <span class="counts">${c.improved} ↑ · ${c.worsened} ↓ · ${c.indeterminate + c.no_data} —</span>
        </div>
        <div class="cohort-track">
          <div class="cohort-segment seg-improved" style="width:${seg(c.improved)}%"></div>
          <div class="cohort-segment seg-worsened" style="width:${seg(c.worsened)}%"></div>
          <div class="cohort-segment seg-indeterminate" style="width:${seg(c.indeterminate)}%"></div>
          <div class="cohort-segment seg-no_data" style="width:${seg(c.no_data)}%"></div>
        </div>
      </div>`;
    }).join('');
    return `<div class="cohort-chart">
      <div class="cohort-title">Cohort trend by test — ${patients.length} enrolled patient${patients.length === 1 ? '' : 's'}</div>
      ${rows}
      <div class="cohort-legend">
        <span><span class="dot" style="background:#34d399"></span>Improved</span>
        <span><span class="dot" style="background:#f87171"></span>Worsened</span>
        <span><span class="dot" style="background:#fbbf24"></span>Indeterminate</span>
        <span><span class="dot" style="background:#374151"></span>No follow-up data</span>
      </div>
    </div>`;
  }

  async function loadProgress(nctId) {
    metricsArea.innerHTML = '<div class="skeleton">Comparing enrolled patients\' latest results to their baseline…</div>';
    progressList.innerHTML = '';
    try {
      const res = await fetch(`/trials/${encodeURIComponent(nctId)}/progress`);
      const data = await res.json();
      if (!res.ok) {
        metricsArea.innerHTML = `<div class="detail-empty">${esc(data.detail || 'Could not load progress for this trial.')}</div>`;
        return;
      }
      progressLoadedFor = nctId;
      window.__progressData = data;

      // Update name map from progress data
      data.patients.forEach(p => { if (p.name) nameMap[p.patient_id] = p.name; });

      const successRatePct = data.success_rate != null ? Math.round(data.success_rate * 100) : null;
      const successPct = successRatePct !== null ? successRatePct + '%' : '—';
      const ringGradient = successRatePct !== null
        ? `conic-gradient(#34d399 ${successRatePct * 3.6}deg, rgba(99,179,237,0.08) 0)`
        : `conic-gradient(rgba(99,179,237,0.08) 0deg, rgba(99,179,237,0.08) 0)`;

      metricsArea.innerHTML = `
        <div class="metrics-top">
          <div class="progress-ring" style="background:${ringGradient}">
            <div class="progress-ring-hole"><span class="progress-ring-pct">${successPct}</span></div>
          </div>
          <div class="metrics-side">
            <div class="metric"><div class="metric-figure">${data.enrolled}</div><div class="metric-label">enrolled</div></div>
            <div class="metric"><div class="metric-figure">${data.active}</div><div class="metric-label">active</div></div>
            <div class="metric"><div class="metric-figure">${data.dropouts}</div><div class="metric-label">dropouts</div></div>
          </div>
        </div>
        <div class="metric-sub" style="margin-bottom:0.6rem">${data.primary_test_code_used
          ? `success rate = share improved on ${esc(data.primary_test_code_used)}`
          : 'no direction-defined test with enough data yet'}</div>
        <div class="disclaimer">Measures the treatment cohort's trajectory against its own baseline on ${data.primary_test_code_used ? esc(data.primary_test_code_used) : 'a tracked test'} — not a controlled efficacy result. No control arm.</div>`;

      if (data.patients.length === 0) {
        progressList.innerHTML = '<div class="detail-empty">No patients enrolled in this trial yet.</div>';
        progressDetailPanel.innerHTML = '<div class="detail-empty">No patients enrolled in this trial yet.</div>';
        return;
      }
      progressDetailPanel.innerHTML = renderCohortChart(data.patients);
      progressList.innerHTML = data.patients.map((p, idx) => {
        const ptName = displayName(p.patient_id, p.name);
        const rows = p.tests.map(t =>
          `<div class="test-readout">
            <span class="dev-dot ${devClass(t.status)}"></span>
            <span>${esc(t.test_code)}</span>
            <span class="readout-value">${fmtValue(t.baseline_value)} → ${fmtValue(t.latest_value)}${t.unit ? ' ' + esc(t.unit) : ''}</span>
            ${changeBarHtml(t)}
          </div>`
        ).join('');
        return `<button class="patient-progress-row" data-pid="${esc(p.patient_id)}" style="animation-delay:${idx * 30}ms">
          <div class="ppr-top">
            <div>
              <div class="ppr-name">${esc(ptName)}</div>
              <div class="ppr-id">${esc(shortId(p.patient_id))}</div>
            </div>
            <span class="status-tag">${esc(p.status)}</span>
          </div>
          <div class="ppr-tests">${rows}</div>
        </button>`;
      }).join('');
      progressList.querySelectorAll('.patient-progress-row').forEach(btn => {
        btn.addEventListener('click', () => selectProgressPatient(btn.dataset.pid));
      });
    } catch (_) {
      metricsArea.innerHTML = '<div class="detail-empty">Could not reach the server. Try again.</div>';
    }
  }

  function selectProgressPatient(patientId) {
    progressList.querySelectorAll('.patient-progress-row').forEach(btn =>
      btn.classList.toggle('selected', btn.dataset.pid === patientId)
    );
    const data = window.__progressData;
    const patient = data && data.patients.find(p => p.patient_id === patientId);
    if (!patient) {
      progressDetailPanel.innerHTML = '<div class="detail-empty">Could not find this patient.</div>';
      return;
    }
    const ptName = displayName(patientId, patient.name);
    const renderTest = (t) =>
      `<div class="test-detail">
        <div class="test-detail-top">
          <span class="test-name">${esc(t.test_name)} <span class="mono" style="color:#475569;font-weight:400">(${esc(t.test_code)})</span></span>
          <span class="dev-pill ${devClass(t.status)}"><span class="dev-dot ${devClass(t.status)}"></span>${esc(t.status.replace('_', ' '))}</span>
        </div>
        <div class="test-readout-line">Baseline ${fmtValue(t.baseline_value)}${t.unit ? ' ' + esc(t.unit) : ''} → Latest ${fmtValue(t.latest_value)}${t.unit ? ' ' + esc(t.unit) : ''}${t.deviation !== null && t.deviation !== undefined ? ` <span style="color:#64748b">(${t.deviation > 0 ? '+' : ''}${t.deviation})</span>` : ''}</div>
        <div class="change-bar-wrap" style="margin-top:0.4rem">${changeBarHtml(t)}</div>
        <div class="test-citations">
          <span>baseline ${fmtDate(t.baseline_date) || '—'}${t.baseline_lab_result_id ? ` · src #${t.baseline_lab_result_id}` : ''}</span>
          <span>latest ${fmtDate(t.latest_date) || '—'}${t.latest_lab_result_id ? ` · src #${t.latest_lab_result_id}` : ''}</span>
        </div>
      </div>`;
    progressDetailPanel.innerHTML = `
      <div class="detail-header">
        <div>
          <div class="pt-name">${esc(ptName)}</div>
          <div class="pt-id">${esc(patientId)}</div>
        </div>
        <span class="demo">${esc(patient.status)} · baseline ${fmtDate(patient.baseline_date) || '—'}</span>
      </div>
      ${patient.tests.map(renderTest).join('')}`;
  }

  // ── Enrollment ──────────────────────────────────────────────────────────────
  function statusPillClass(status) { return 'st-' + status; }

  function renderEnrollmentActions(patientId, status) {
    const buttons = [];
    if (status === 'not_invited') buttons.push(`<button class="er-btn" data-action="invite" data-pid="${esc(patientId)}">Send invite</button>`);
    if (status === 'invited') buttons.push(`<a class="er-link" href="/?page=consent&patient=${encodeURIComponent(patientId)}&trial=${encodeURIComponent(currentNctId)}" target="_blank" rel="noopener">Open consent screen ↗</a>`);
    if (status === 'consented') buttons.push(`<button class="er-btn" data-action="enroll" data-pid="${esc(patientId)}">Confirm enrollment</button>`);
    if (['invited', 'accepted', 'consented', 'enrolled'].includes(status))
      buttons.push(`<button class="er-btn danger" data-action="withdraw" data-pid="${esc(patientId)}">Withdraw</button>`);
    return buttons.join('');
  }

  async function loadEnrollment(nctId, quiet) {
    const haveCache = cachedCandidatesFor === nctId && cachedCandidates !== null;
    if (!quiet && !haveCache) {
      enrollmentSummary.innerHTML = '<div class="skeleton">Loading enrollment status…</div>';
      enrollmentList.innerHTML = '';
    }
    try {
      let candidates;
      if (haveCache) {
        candidates = cachedCandidates;
      } else {
        const candRes = await fetch(`/trials/${encodeURIComponent(nctId)}/db-candidates?limit=${currentPatientCount}&max_evaluate=${currentPatientCount}`);
        const candData = await candRes.json();
        if (!candRes.ok) {
          enrollmentSummary.innerHTML = `<div class="detail-empty">${esc(candData.detail || 'No parsed criteria for this trial yet.')}</div>`;
          return;
        }
        candidates = candData.candidates;
        // Keep name map updated
        candidates.forEach(c => { if (c.name) nameMap[c.patient_id] = c.name; });
        cachedCandidates = candidates;
        cachedCandidatesFor = nctId;
      }
      await renderEnrollmentAndAudit(nctId, candidates, quiet);
    } catch (_) {
      enrollmentSummary.innerHTML = '<div class="detail-empty">Could not reach the server. Try again.</div>';
    }
  }

  async function renderEnrollmentAndAudit(nctId, candidates, quiet) {
    const enrollRes = await fetch(`/trials/${encodeURIComponent(nctId)}/enrollment`);
    const enrollData = await enrollRes.json();
    enrollmentLoadedFor = nctId;

    const statusByPatient = {};
    if (enrollRes.ok) enrollData.forEach(e => { statusByPatient[e.patient_id] = e.status; });

    const counts = {};
    candidates.forEach(c => {
      const st = statusByPatient[c.patient_id] || 'not_invited';
      counts[st] = (counts[st] || 0) + 1;
    });

    const STATUS_ORDER = ['enrolled', 'consented', 'invited', 'accepted', 'declined', 'withdrawn', 'not_invited'];
    const STATUS_COLORS = {
      enrolled: 'rgba(52,211,153,0.7)',
      consented: 'rgba(99,179,237,0.7)',
      invited: 'rgba(251,191,36,0.7)',
      accepted: 'rgba(251,191,36,0.5)',
      declined: 'rgba(100,116,139,0.4)',
      withdrawn: 'rgba(248,113,113,0.6)',
      not_invited: 'rgba(55,65,81,0.4)',
    };

    const enrolled = counts['enrolled'] || 0;
    const invited = (counts['invited'] || 0) + (counts['accepted'] || 0);
    const consented = counts['consented'] || 0;

    enrollmentSummary.innerHTML = `
      <div class="enrollment-summary-card">
        <div class="enr-stats">
          <div class="enr-stat"><div class="enr-stat-num">${candidates.length}</div><div class="enr-stat-label">candidates</div></div>
          <div class="enr-stat"><div class="enr-stat-num" style="color:#34d399">${enrolled}</div><div class="enr-stat-label">enrolled</div></div>
          <div class="enr-stat"><div class="enr-stat-num" style="color:#63b3ed">${consented}</div><div class="enr-stat-label">consented</div></div>
          <div class="enr-stat"><div class="enr-stat-num" style="color:#fbbf24">${invited}</div><div class="enr-stat-label">invited</div></div>
        </div>
        <canvas id="enrollmentBarChart"></canvas>
      </div>`;

    // Bar chart for enrollment breakdown
    if (window.enrollmentBarInst) window.enrollmentBarInst.destroy();
    const barCtx = container.querySelector('#enrollmentBarChart').getContext('2d');
    const barLabels = STATUS_ORDER.filter(s => counts[s]).map(s => s.replace('_', ' '));
    const barData = STATUS_ORDER.filter(s => counts[s]).map(s => counts[s]);
    const barColors = STATUS_ORDER.filter(s => counts[s]).map(s => STATUS_COLORS[s] || 'rgba(148,163,184,0.4)');
    window.enrollmentBarInst = new window.Chart(barCtx, {
      type: 'bar',
      data: {
        labels: barLabels,
        datasets: [{
          data: barData,
          backgroundColor: barColors,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10,13,22,0.95)',
            titleFont: { family: 'Inter', size: 11 },
            bodyFont: { family: 'Inter', size: 11 },
            borderColor: 'rgba(99,179,237,0.15)', borderWidth: 1,
          },
        },
        scales: {
          x: { grid: { color: 'rgba(99,179,237,0.05)' }, ticks: { color: '#475569', font: { family: 'Inter', size: 10 } } },
          y: { grid: { color: 'rgba(99,179,237,0.05)' }, ticks: { color: '#475569', font: { family: 'Inter', size: 10 }, stepSize: 1 }, beginAtZero: true },
        },
      },
    });

    enrollmentList.innerHTML = candidates.map((c, idx) => {
      const status = statusByPatient[c.patient_id] || 'not_invited';
      const ptName = displayName(c.patient_id, c.name);
      return `<div class="enrollment-row" style="animation-delay:${idx * 20}ms">
        <div class="er-top">
          <div>
            <div class="er-name">${esc(ptName)}</div>
            <button type="button" class="er-id-btn" data-full-id="${esc(c.patient_id)}" title="Click to copy the full patient ID">${esc(shortId(c.patient_id))}</button>
          </div>
          <div style="display:flex;align-items:center;gap:0.4rem">
            <span class="badge ${badgeClass(c.overall)}" title="${esc(OVERALL_HELP[c.overall] || '')}">${esc(c.overall)}</span>
            <span class="status-pill ${statusPillClass(status)}" title="${esc(STATUS_HELP[status] || '')}">${esc(status.replace('_', ' '))}</span>
          </div>
        </div>
        <div class="er-actions">${renderEnrollmentActions(c.patient_id, status)}</div>
      </div>`;
    }).join('');

    // NOTE: Do NOT add per-button listeners here — we use a single delegated
    // listener on enrollmentList (set up once below) so buttons survive re-renders.
    enrollmentList.querySelectorAll('.er-id-btn').forEach(btn => {
      btn.addEventListener('click', () => copyFullId(btn));
    });
    await loadAuditTrail(nctId, quiet);
  }

  async function loadAuditTrail(nctId, quiet) {
    if (!quiet) auditPanel.innerHTML = '<div class="skeleton">Loading audit trail…</div>';
    try {
      const res = await fetch(`/trials/${encodeURIComponent(nctId)}/audit?limit=100`);
      const data = await res.json();
      if (!res.ok) {
        auditPanel.innerHTML = `<div class="detail-empty">${esc(data.detail || 'Could not load audit trail.')}</div>`;
        return;
      }
      if (data.length === 0) {
        auditPanel.innerHTML = '<div class="detail-empty">No audit events for this trial yet. Every invite, consent, and enrollment action will be logged here.</div>';
        return;
      }

      const rows = data.map(row => {
        const detail = row.detail
          ? `${esc(row.detail.from_status || '—')} → ${esc(row.detail.to_status || '—')}`
          : '—';
        const fullPatientId = (row.entity_id || '').split(':')[0];
        const ptName = displayName(fullPatientId, null);
        const ptLabel = ptName !== fullPatientId ? ptName : shortId(fullPatientId);

        // Determine actor display: use action to differentiate withdrawal actor
        let actorDisplay = row.actor || 'system';
        // Normalise actor class
        const actorClass = ['researcher', 'patient', 'system'].includes(actorDisplay) ? actorDisplay : 'system';
        const actionLabel = ACTION_LABELS[row.action] || row.action;

        return `<tr>
          <td>${esc((row.created_at || '').replace('T', ' ').slice(0, 19))}</td>
          <td class="actor-cell"><span class="actor-badge actor-${esc(actorClass)}">${esc(actorDisplay)}</span></td>
          <td class="audit-action">${esc(actionLabel)}</td>
          <td>
            <div class="audit-pt-name">${esc(ptLabel)}</div>
            <div class="audit-pt-id">${esc(shortId(fullPatientId))}</div>
          </td>
          <td>${detail}</td>
        </tr>`;
      }).join('');

      auditPanel.innerHTML = `
        <div class="group-label" style="margin-top:0;margin-bottom:0.75rem">Audit Trail</div>
        <div class="audit-wrap">
          <table class="audit-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Patient</th>
                <th>Status change</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    } catch (_) {
      auditPanel.innerHTML = '<div class="detail-empty">Could not reach the server. Try again.</div>';
    }
  }

  // ── Enrollment event delegation (survives innerHTML re-renders) ──────────
  // Wire ONCE on the container — clicks bubble up from dynamically rendered buttons.
  enrollmentList.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('.er-btn[data-action]');
    if (actionBtn && !actionBtn.disabled && !actionBtn.classList.contains('loading')) {
      performAction(actionBtn.dataset.pid, actionBtn.dataset.action, actionBtn);
      return;
    }
    const idBtn = e.target.closest('.er-id-btn');
    if (idBtn) copyFullId(idBtn);
  });

  // Guard: only one enrollment render at a time to prevent race conditions.
  let _isRenderingEnrollment = false;



  async function performAction(patientId, action, sourceBtn) {
    // Visually disable the clicked button immediately
    if (sourceBtn) {
      sourceBtn.classList.add('loading');
      sourceBtn.disabled = true;
    }
    stopEnrollmentPolling(); // pause polling during action to avoid race
    try {
      const res = await fetch(
        `/trials/${encodeURIComponent(currentNctId)}/patients/${encodeURIComponent(patientId)}/${action}`,
        { method: 'POST' }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Action failed.');
        if (sourceBtn) { sourceBtn.classList.remove('loading'); sourceBtn.disabled = false; }
        startEnrollmentPolling();
        return;
      }
      setStatus('');
      await loadEnrollment(currentNctId, true);
    } catch (_) {
      setError('Could not reach the server. Try again.');
      if (sourceBtn) { sourceBtn.classList.remove('loading'); sourceBtn.disabled = false; }
    } finally {
      startEnrollmentPolling(); // resume after action completes
    }
  }

  async function pollEnrollmentStatus(nctId) {
    if (cachedCandidatesFor !== nctId || !cachedCandidates) return;
    if (_isRenderingEnrollment) return; // skip poll if a render is in progress
    _isRenderingEnrollment = true;
    try { await renderEnrollmentAndAudit(nctId, cachedCandidates, true); } catch (_) { }
    finally { _isRenderingEnrollment = false; }
  }

  function stopEnrollmentPolling() {
    if (window.__tmEnrollmentPollTimer) { clearInterval(window.__tmEnrollmentPollTimer); window.__tmEnrollmentPollTimer = null; }
  }
  function startEnrollmentPolling() {
    stopEnrollmentPolling();
    // 8 s interval — frequent enough to catch status changes, slow enough to
    // never overlap with a 2-3 s server round-trip under normal conditions.
    window.__tmEnrollmentPollTimer = setInterval(() => { if (currentNctId) pollEnrollmentStatus(currentNctId); }, 15000);
  }

  // Tab event listeners
  tabCandidates.addEventListener('click', () => { switchTab('candidates'); stopEnrollmentPolling(); });
  tabProgress.addEventListener('click', () => {
    switchTab('progress'); stopEnrollmentPolling();
    if (currentNctId && progressLoadedFor !== currentNctId) loadProgress(currentNctId);
  });
  tabEnrollment.addEventListener('click', () => {
    switchTab('enrollment');
    loadEnrollment(currentNctId, enrollmentLoadedFor === currentNctId);
    startEnrollmentPolling();
  });

  loadBtn.addEventListener('click', loadTrial);
  nctInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') loadTrial(); });
  wireExampleButton();
}
