import { useEffect, useRef } from 'react';

// This component faithfully preserves the original researcher.html logic
// by injecting Chart.js and running the original script in a useEffect
// after the DOM is set up. All href navigation is remapped to the navigate prop.

const STYLE = `
  .researcher-page { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  .researcher-page :root, .researcher-page * { box-sizing: border-box; }
  .researcher-page button, .researcher-page input { font-family: inherit; font-size: inherit; color: inherit; }
  .researcher-page :focus-visible { outline: 2px solid #63b3ed; outline-offset: 2px; }
  .researcher-page .eyebrow { font-family: ui-monospace, "SF Mono", "Consolas", monospace; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; }
  .researcher-page .mono { font-family: ui-monospace, "SF Mono", "Consolas", monospace; }
  .researcher-page .session-bar { border-bottom: 1px solid rgba(99,179,237,0.1); padding: 0.55rem 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; background: rgba(8,9,13,0.6); backdrop-filter: blur(10px); flex-shrink: 0; }
  .researcher-page .session-left { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
  .researcher-page .home-link { display: flex; align-items: center; gap: 0.4rem; color: #e2e8f0; font-weight: 600; font-size: 13px; padding: 0.2rem 0.3rem; border-radius: 10px; transition: color 250ms; cursor: pointer; background: none; border: none; }
  .researcher-page .home-link:hover { color: #63b3ed; }
  .researcher-page .home-mark { color: #63b3ed; }
  .researcher-page .crumb-sep { color: #64748b; font-size: 12px; }
  .researcher-page .crumb-current { color: #94a3b8; font-size: 13px; }
  .researcher-page .role-badge { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; padding: 0.2rem 0.5rem; border-radius: 10px; }
  .researcher-page .role-badge.role-researcher { background: rgba(99,179,237,0.12); color: #63b3ed; }
  .researcher-page .session-name { color: #94a3b8; font-size: 13px; }
  .researcher-page .signout-btn { background: transparent; border: 1px solid rgba(99,179,237,0.1); border-radius: 10px; padding: 0.4rem 0.8rem; color: #94a3b8; font-size: 12.5px; cursor: pointer; transition: border-color 250ms, color 250ms; }
  .researcher-page .signout-btn:hover { border-color: #64748b; color: #e2e8f0; }
  .researcher-page header { border-bottom: 1px solid rgba(99,179,237,0.1); padding: 0.75rem 1.25rem; display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem 1.25rem; background: rgba(8,9,13,0.4); flex-shrink: 0; }
  .researcher-page .brand { font-weight: 600; font-size: 15px; letter-spacing: 0.01em; white-space: nowrap; }
  .researcher-page .brand .dim { color: #94a3b8; font-weight: 400; }
  .researcher-page .load-row { display: flex; gap: 0.5rem; flex: 1 1 320px; max-width: 560px; }
  .researcher-page #nctInput { flex: 1; background: rgba(16,22,36,0.8); border: 1px solid rgba(99,179,237,0.1); border-radius: 10px; padding: 0.5rem 0.7rem; color: #e2e8f0; }
  .researcher-page #nctInput::placeholder { color: #64748b; }
  .researcher-page #nctInput:focus-visible { border-color: #63b3ed; }
  .researcher-page #patientCountInput { width: 5.5rem; flex: 0 0 auto; background: rgba(16,22,36,0.8); border: 1px solid rgba(99,179,237,0.1); border-radius: 10px; padding: 0.5rem 0.6rem; color: #e2e8f0; font-family: ui-monospace, monospace; }
  .researcher-page #patientCountInput::placeholder { color: #64748b; }
  .researcher-page #patientCountInput:focus-visible { border-color: #63b3ed; }
  .researcher-page #loadBtn { background: linear-gradient(135deg, #63b3ed, #7c3aed); border: none; border-radius: 10px; padding: 0.5rem 1.1rem; cursor: pointer; transition: opacity 250ms, transform 250ms; color: white; font-weight: 600; letter-spacing: 0.01em; }
  .researcher-page #loadBtn:hover { opacity: 0.88; transform: translateY(-1px); }
  .researcher-page #loadBtn:disabled { opacity: 0.4; cursor: default; transform: none; }
  .researcher-page .trial-info { display: flex; align-items: baseline; gap: 0.6rem; flex-wrap: wrap; min-width: 0; }
  .researcher-page .trial-info .title { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 32ch; }
  .researcher-page .trial-info .meta { color: #94a3b8; font-family: ui-monospace, monospace; font-size: 12px; white-space: nowrap; }
  .researcher-page .example-btn { background: transparent; border: 1px dashed #64748b; border-radius: 10px; padding: 0.5rem 0.8rem; color: #94a3b8; cursor: pointer; white-space: nowrap; transition: border-color 250ms, color 250ms; }
  .researcher-page .example-btn:hover { border-color: #63b3ed; color: #63b3ed; }
  .researcher-page .status-line { padding: 0 1.5rem; min-height: 0; }
  .researcher-page .status-msg { color: #94a3b8; font-size: 12.5px; padding: 0.6rem 0; }
  .researcher-page .error-msg { color: #fc8181; font-size: 12.5px; padding: 0.6rem 0; border-top: 1px solid rgba(99,179,237,0.1); }
  .researcher-page .workspace { display: grid; grid-template-columns: 340px 1fr; flex: 1; overflow: hidden; margin: 0.75rem 1rem 1rem; background: linear-gradient(145deg, rgba(16,22,36,0.7), rgba(10,14,24,0.8)); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(99,179,237,0.12); border-radius: 16px; box-shadow: 0 0 0 1px rgba(99,179,237,0.05) inset, 0 20px 60px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset; }
  @media (max-width: 880px) { .researcher-page .workspace { grid-template-columns: 1fr; margin: 0.5rem; } }
  .researcher-page .panel { padding: 1rem 1.1rem; }
  .researcher-page .candidates-panel { border-right: 1px solid rgba(99,179,237,0.1); display: flex; flex-direction: column; overflow: hidden; background: rgba(8,9,13,0.3); }
  @media (max-width: 880px) { .researcher-page .candidates-panel { border-right: none; border-bottom: 1px solid rgba(99,179,237,0.1); } }
  .researcher-page .funnel { margin-bottom: 0.75rem; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .researcher-page #funnelChart { max-height: 160px; width: 100%; margin-bottom: 0.5rem; }
  .researcher-page .funnel-figure { font-family: ui-monospace, monospace; font-size: 30px; font-weight: 500; color: #63b3ed; line-height: 1.1; letter-spacing: -0.01em; }
  .researcher-page .funnel-figure .of { color: #94a3b8; font-size: 18px; font-weight: 400; }
  .researcher-page .funnel-label { color: #94a3b8; font-size: 12px; margin-top: 0.15rem; }
  .researcher-page .funnel-sub { color: #64748b; font-size: 11.5px; margin-top: 0.35rem; font-family: ui-monospace, monospace; }
  .researcher-page .candidate-list { display: flex; flex-direction: column; gap: 0.4rem; overflow-y: auto; flex: 1; padding-right: 0.5rem; scrollbar-width: thin; scrollbar-color: #64748b transparent; }
  .researcher-page #progressPanel { display: flex; flex-direction: column; position: sticky; top: 0; align-self: start; max-height: 100vh; overflow: hidden; }
  .researcher-page #progressPanel #metricsArea { flex-shrink: 0; }
  .researcher-page #progressList { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding-right: 0.5rem; margin-right: -0.5rem; scrollbar-width: thin; scrollbar-color: #64748b transparent; }
  @media (max-width: 880px) { .researcher-page #progressPanel { position: static; max-height: none; overflow: visible; } .researcher-page #progressList { overflow-y: visible; } }
  .researcher-page .candidate { display: block; width: 100%; text-align: left; background: rgba(16,22,36,0.6); border: 1px solid rgba(99,179,237,0.1); border-radius: 10px; padding: 0.6rem 0.75rem; cursor: pointer; transition: border-color 250ms, background 250ms, transform 250ms, box-shadow 250ms; position: relative; }
  .researcher-page .candidate::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 10px 0 0 10px; background: #63b3ed; opacity: 0; transition: opacity 250ms; }
  .researcher-page .candidate:hover { border-color: rgba(99,179,237,0.35); background: rgba(99,179,237,0.06); transform: translateX(2px); box-shadow: 0 2px 12px rgba(0,0,0,0.3); }
  .researcher-page .candidate:hover::before { opacity: 1; }
  .researcher-page .candidate.selected { border-color: #63b3ed; background: rgba(99,179,237,0.12); box-shadow: 0 0 0 1px #63b3ed inset, 0 4px 16px rgba(99,179,237,0.15); }
  .researcher-page .candidate.selected::before { opacity: 1; }
  .researcher-page .candidate-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
  .researcher-page .candidate-id { font-family: ui-monospace, monospace; font-size: 12.5px; }
  .researcher-page .candidate-demo { color: #94a3b8; font-size: 11.5px; margin-top: 0.15rem; font-family: ui-monospace, monospace; }
  .researcher-page .candidate-tally { color: #94a3b8; font-size: 11px; font-family: ui-monospace, monospace; margin-top: 0.35rem; }
  .researcher-page .badge { font-family: ui-monospace, monospace; font-size: 9.5px; letter-spacing: 0.05em; text-transform: uppercase; padding: 0.15rem 0.5rem; border-radius: 999px; white-space: nowrap; font-weight: 600; }
  .researcher-page .badge-eligible { background: rgba(52,211,153,0.12); color: #34d399; border: 1px solid rgba(52,211,153,0.25); }
  .researcher-page .badge-ineligible { background: rgba(252,129,129,0.12); color: #fc8181; border: 1px solid rgba(252,129,129,0.25); }
  .researcher-page .badge-needs_more_data { background: rgba(246,173,85,0.12); color: #f6ad55; border: 1px solid rgba(246,173,85,0.25); }
  .researcher-page .detail-panel { overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(99,179,237,0.3) transparent; }
  .researcher-page .detail-empty { color: #94a3b8; font-size: 13px; padding-top: 0.25rem; }
  .researcher-page .detail-header { display: flex; align-items: baseline; gap: 0.75rem; flex-wrap: wrap; padding-bottom: 0.9rem; margin-bottom: 1rem; border-bottom: 1px solid rgba(99,179,237,0.1); }
  .researcher-page .detail-header .id { font-family: ui-monospace, monospace; font-size: 15px; }
  .researcher-page .detail-header .demo { color: #94a3b8; font-family: ui-monospace, monospace; font-size: 12.5px; }
  .researcher-page .group-label { margin: 1.4rem 0 0.6rem; }
  .researcher-page .group-label:first-of-type { margin-top: 0; }
  .researcher-page .criterion { border-top: 1px solid rgba(99,179,237,0.1); padding: 0.85rem 0; }
  .researcher-page .criterion:first-of-type { border-top: none; }
  .researcher-page .criterion-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
  .researcher-page .criterion-text { flex: 1; font-size: 13px; }
  .researcher-page .verdict-pill { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; padding: 0.18rem 0.5rem; border-radius: 10px; white-space: nowrap; flex-shrink: 0; }
  .researcher-page .verdict-pass { background: rgba(52,211,153,0.12); color: #34d399; }
  .researcher-page .verdict-fail { background: rgba(252,129,129,0.12); color: #fc8181; }
  .researcher-page .verdict-unknown { background: rgba(246,173,85,0.12); color: #f6ad55; }
  .researcher-page .criterion-meta { display: flex; flex-wrap: wrap; gap: 0.4rem 1rem; margin-top: 0.5rem; font-family: ui-monospace, monospace; font-size: 11.5px; }
  .researcher-page .criterion-meta .kv-label { color: #64748b; }
  .researcher-page .criterion-meta .kv-value { color: #94a3b8; }
  .researcher-page .criterion-reason { color: #94a3b8; font-size: 12.5px; margin-top: 0.4rem; }
  .researcher-page .verify-btn { background: none; border: none; padding: 0; color: #63b3ed; font-family: ui-monospace, monospace; font-size: 11px; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
  .researcher-page .verify-btn:hover { color: #e2e8f0; }
  .researcher-page .verify-btn:disabled { color: #64748b; cursor: default; text-decoration: none; }
  .researcher-page .verify-panel { margin-top: 0.6rem; background: rgba(22,30,50,0.9); border: 1px solid rgba(99,179,237,0.1); border-radius: 10px; padding: 0.75rem 0.9rem; font-size: 12px; }
  .researcher-page .verify-panel .verify-row { display: flex; justify-content: space-between; gap: 1rem; padding: 0.2rem 0; font-family: ui-monospace, monospace; }
  .researcher-page .verify-panel .verify-row .k { color: #64748b; }
  .researcher-page .verify-panel .verify-row .v { color: #e2e8f0; text-align: right; }
  .researcher-page .verify-panel .verify-row .v.abnormal { color: #fc8181; }
  .researcher-page .verify-status { margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(99,179,237,0.1); font-family: ui-monospace, monospace; font-size: 11.5px; }
  .researcher-page .verify-status.ok { color: #34d399; }
  .researcher-page .verify-status.mismatch { color: #fc8181; }
  .researcher-page .rule-breakdown { margin-top: 0.6rem; padding-left: 0.85rem; border-left: 2px solid rgba(99,179,237,0.1); }
  .researcher-page .rule-row { padding: 0.45rem 0; border-top: 1px solid rgba(99,179,237,0.1); font-size: 12px; }
  .researcher-page .rule-row:first-child { border-top: none; }
  .researcher-page .rule-row .rule-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; font-family: ui-monospace, monospace; color: #94a3b8; }
  .researcher-page .rule-row .rule-group-label { color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; font-size: 10px; margin-right: 0.5rem; }
  .researcher-page .skeleton { color: #64748b; font-size: 12.5px; }
  .researcher-page .tab-row { display: none; gap: 0.25rem; padding: 0.5rem 1.25rem; border-bottom: 1px solid rgba(99,179,237,0.1); flex-shrink: 0; }
  .researcher-page .tab-row.visible { display: flex; }
  .researcher-page .tab-btn { background: none; border: 1px solid transparent; border-radius: 8px; color: #94a3b8; padding: 0.35rem 0.8rem; cursor: pointer; font-size: 12.5px; font-weight: 500; transition: color 250ms, border-color 250ms, background 250ms; }
  .researcher-page .tab-btn:hover { color: #e2e8f0; border-color: rgba(99,179,237,0.1); background: rgba(99,179,237,0.06); }
  .researcher-page .tab-btn.active { color: #63b3ed; background: rgba(99,179,237,0.12); border-color: rgba(99,179,237,0.3); font-weight: 600; }
  .researcher-page .view { display: none; flex: 1; overflow: hidden; }
  .researcher-page .view.active { display: flex; flex-direction: column; overflow: hidden; }
  .researcher-page .view-sub { color: #94a3b8; font-size: 12px; padding: 0.6rem 1.25rem 0; flex-shrink: 0; }
  .researcher-page .empty-state { border: 1px dashed rgba(99,179,237,0.1); border-radius: 10px; padding: 1.4rem 1.5rem; }
  .researcher-page .empty-state-title { font-size: 13.5px; font-weight: 600; margin-bottom: 0.4rem; }
  .researcher-page .empty-state-body { color: #94a3b8; font-size: 12.5px; line-height: 1.6; max-width: 46ch; }
  .researcher-page .empty-state .example-btn { margin-top: 0.9rem; }
  .researcher-page .legend { display: flex; flex-wrap: wrap; gap: 0.3rem 1rem; font-size: 11px; color: #94a3b8; margin: 0.6rem 0 1.1rem; }
  .researcher-page .legend .dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 0.35rem; }
  .researcher-page .metrics-row { display: flex; gap: 2.25rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
  .researcher-page .metric { min-width: 90px; }
  .researcher-page .metric-figure { font-family: ui-monospace, monospace; font-size: 22px; font-weight: 500; line-height: 1.1; }
  .researcher-page .metric-figure.headline { font-size: 30px; color: #63b3ed; }
  .researcher-page .metric-label { color: #94a3b8; font-size: 12px; margin-top: 0.15rem; }
  .researcher-page .metric-sub { color: #64748b; font-size: 11px; margin-top: 0.2rem; font-family: ui-monospace, monospace; max-width: 34ch; }
  .researcher-page .disclaimer { color: #64748b; font-size: 11.5px; line-height: 1.5; max-width: 60ch; padding: 0.75rem 0 1.25rem; border-bottom: 1px solid rgba(99,179,237,0.1); margin-bottom: 1.1rem; }
  .researcher-page .patient-progress-row { display: block; width: 100%; text-align: left; background: rgba(16,22,36,0.8); border: 1px solid rgba(99,179,237,0.1); border-radius: 10px; padding: 0.65rem 0.8rem; cursor: pointer; margin-bottom: 0.4rem; transition: border-color 250ms, background 250ms; }
  .researcher-page .patient-progress-row:hover { border-color: #64748b; }
  .researcher-page .patient-progress-row.selected { border-color: #63b3ed; background: rgba(99,179,237,0.12); }
  .researcher-page .ppr-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
  .researcher-page .ppr-id { font-family: ui-monospace, monospace; font-size: 12.5px; }
  .researcher-page .status-tag { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; color: #64748b; }
  .researcher-page .ppr-tests { display: flex; flex-direction: column; gap: 0.2rem; margin-top: 0.5rem; }
  .researcher-page .test-readout { display: flex; align-items: center; gap: 0.5rem; font-family: ui-monospace, monospace; font-size: 11.5px; }
  .researcher-page .dev-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .researcher-page .dev-improved { background: #34d399; }
  .researcher-page .dev-worsened { background: #fc8181; }
  .researcher-page .dev-indeterminate { background: #94a3b8; }
  .researcher-page .dev-no_data { background: #64748b; }
  .researcher-page .readout-value { color: #94a3b8; }
  .researcher-page .test-detail { border-top: 1px solid rgba(99,179,237,0.1); padding: 0.9rem 0; }
  .researcher-page .test-detail:first-of-type { border-top: none; }
  .researcher-page .test-detail-top { display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem; }
  .researcher-page .test-name { font-size: 13px; font-weight: 600; }
  .researcher-page .dev-pill { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; padding: 0.18rem 0.5rem; border-radius: 10px; white-space: nowrap; display: flex; align-items: center; gap: 0.35rem; }
  .researcher-page .dev-pill.dev-improved { background: rgba(52,211,153,0.12); color: #34d399; }
  .researcher-page .dev-pill.dev-worsened { background: rgba(252,129,129,0.12); color: #fc8181; }
  .researcher-page .dev-pill.dev-indeterminate { background: rgba(138,143,152,0.14); color: #94a3b8; }
  .researcher-page .dev-pill.dev-no_data { background: rgba(93,97,105,0.12); color: #64748b; }
  .researcher-page .test-readout-line { font-family: ui-monospace, monospace; font-size: 13px; margin-top: 0.4rem; }
  .researcher-page .test-citations { display: flex; flex-wrap: wrap; gap: 0.4rem 1rem; margin-top: 0.4rem; font-family: ui-monospace, monospace; font-size: 11px; color: #64748b; }
  .researcher-page .metrics-top { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.25rem; }
  .researcher-page .progress-ring { width: 84px; height: 84px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; position: relative; }
  .researcher-page .progress-ring-hole { position: absolute; inset: 9px; background: #08090d; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .researcher-page .progress-ring-pct { font-family: ui-monospace, monospace; font-size: 18px; font-weight: 600; color: #63b3ed; }
  .researcher-page .metrics-side { display: flex; gap: 1.75rem; }
  .researcher-page .cohort-chart { margin-top: 0.4rem; }
  .researcher-page .cohort-title { font-family: ui-monospace, monospace; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin-bottom: 0.9rem; }
  .researcher-page .cohort-row { margin-bottom: 0.9rem; }
  .researcher-page .cohort-row-label { display: flex; justify-content: space-between; font-family: ui-monospace, monospace; font-size: 12px; margin-bottom: 0.3rem; }
  .researcher-page .cohort-row-label .name { color: #e2e8f0; }
  .researcher-page .cohort-row-label .counts { color: #64748b; font-size: 11px; }
  .researcher-page .cohort-track { display: flex; height: 8px; border-radius: 4px; overflow: hidden; background: rgba(99,179,237,0.1); }
  .researcher-page .cohort-segment { height: 100%; }
  .researcher-page .cohort-segment.seg-improved { background: #34d399; }
  .researcher-page .cohort-segment.seg-worsened { background: #fc8181; }
  .researcher-page .cohort-segment.seg-indeterminate { background: #f6ad55; }
  .researcher-page .cohort-segment.seg-no_data { background: #64748b; opacity: 0.5; }
  .researcher-page .cohort-legend { display: flex; flex-wrap: wrap; gap: 0.3rem 1rem; margin-top: 1.1rem; padding-top: 0.9rem; border-top: 1px solid rgba(99,179,237,0.1); font-size: 11px; color: #94a3b8; }
  .researcher-page .cohort-legend .dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 0.35rem; }
  .researcher-page .change-bar-wrap { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.15rem; }
  .researcher-page .change-bar-track { width: 56px; height: 5px; border-radius: 3px; background: rgba(99,179,237,0.1); overflow: hidden; flex-shrink: 0; }
  .researcher-page .change-bar-fill { height: 100%; border-radius: 3px; }
  .researcher-page .change-bar-fill.dev-improved { background: #34d399; }
  .researcher-page .change-bar-fill.dev-worsened { background: #fc8181; }
  .researcher-page .change-bar-fill.dev-indeterminate { background: #f6ad55; }
  .researcher-page .change-bar-fill.dev-no_data { background: #64748b; }
  .researcher-page .enrollment-row { background: rgba(16,22,36,0.8); border: 1px solid rgba(99,179,237,0.1); border-radius: 10px; padding: 0.65rem 0.8rem; margin-bottom: 0.4rem; }
  .researcher-page .er-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; }
  .researcher-page .er-id { font-family: ui-monospace, monospace; font-size: 12.5px; }
  .researcher-page .er-id-btn { font-family: ui-monospace, monospace; font-size: 12.5px; background: none; border: none; padding: 0; color: #e2e8f0; cursor: pointer; text-decoration: underline dotted #64748b; text-underline-offset: 2px; }
  .researcher-page .er-id-btn:hover { color: #63b3ed; }
  .researcher-page .er-id-btn.copied { color: #34d399; text-decoration: none; }
  .researcher-page .status-pill { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; padding: 0.15rem 0.5rem; border-radius: 10px; white-space: nowrap; }
  .researcher-page .status-pill.st-not_invited { background: rgba(93,97,105,0.12); color: #64748b; }
  .researcher-page .status-pill.st-invited { background: rgba(246,173,85,0.12); color: #f6ad55; }
  .researcher-page .status-pill.st-accepted { background: rgba(246,173,85,0.12); color: #f6ad55; }
  .researcher-page .status-pill.st-consented { background: rgba(99,179,237,0.12); color: #63b3ed; }
  .researcher-page .status-pill.st-enrolled { background: rgba(52,211,153,0.12); color: #34d399; }
  .researcher-page .status-pill.st-declined { background: rgba(93,97,105,0.12); color: #64748b; }
  .researcher-page .status-pill.st-withdrawn { background: rgba(252,129,129,0.12); color: #fc8181; }
  .researcher-page .er-actions { display: flex; gap: 0.4rem; margin-top: 0.5rem; flex-wrap: wrap; }
  .researcher-page .er-btn { font-size: 11.5px; padding: 0.3rem 0.6rem; border-radius: 10px; border: 1px solid rgba(99,179,237,0.1); background: transparent; color: #e2e8f0; cursor: pointer; transition: border-color 250ms, color 250ms; }
  .researcher-page .er-btn:hover { border-color: #63b3ed; color: #63b3ed; }
  .researcher-page .er-btn.danger:hover { border-color: #fc8181; color: #fc8181; }
  .researcher-page .er-btn:disabled { opacity: 0.45; cursor: default; }
  .researcher-page .er-link { font-size: 11.5px; color: #63b3ed; text-decoration: none; }
  .researcher-page .er-link:hover { text-decoration: underline; }
  .researcher-page .audit-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  .researcher-page .audit-table th { text-align: left; color: #64748b; font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; font-weight: 400; padding: 0.4rem 0.6rem; border-bottom: 1px solid rgba(99,179,237,0.1); }
  .researcher-page .audit-table td { padding: 0.45rem 0.6rem; border-bottom: 1px solid rgba(99,179,237,0.1); font-family: ui-monospace, monospace; color: #94a3b8; vertical-align: top; }
  .researcher-page .audit-table td.actor-researcher { color: #63b3ed; }
  .researcher-page .audit-table td.actor-patient { color: #34d399; }
`;

export default function ResearcherDashboard({ navigate }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Inject styles
    const style = document.createElement('style');
    style.id = 'researcher-styles';
    style.textContent = STYLE;
    document.head.appendChild(style);

    // Load Chart.js
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
      // Clean up polling
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
      style={{ background: '#08090d', backgroundImage: 'radial-gradient(ellipse at 0% 0%, rgba(99,179,237,0.12) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(124,58,237,0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.04) 0%, transparent 70%)', backgroundAttachment: 'fixed', color: '#e2e8f0', fontFamily: "'Inter', -apple-system, sans-serif", fontSize: 14, lineHeight: 1.6, WebkitFontSmoothing: 'antialiased' }}
    >
      <div className="session-bar">
        <div className="session-left">
          <button className="home-link" onClick={() => navigate('landing')}><span className="home-mark">◆</span> TriMatch</button>
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
        <button className="tab-btn" id="tabProgress">Trial progress</button>
        <button className="tab-btn" id="tabEnrollment">Enrollment &amp; consent</button>
      </div>

      <div className="status-line" id="statusLine"></div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="view active" id="viewCandidates">
          <div className="view-sub" id="candidatesViewSub" style={{ display: 'none' }}>Patients ranked by how well they match this trial's eligibility criteria. Click any candidate for a full pass/fail breakdown.</div>
          <main className="workspace">
            <section className="panel candidates-panel">
              <div id="funnelArea"></div>
              <div className="candidate-list" id="candidateList">
                <div className="empty-state">
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

        <div className="view" id="viewProgress">
          <div className="view-sub">Compares each enrolled patient's most recent lab results against their baseline (the values recorded when they were enrolled), so you can see who's trending better or worse.</div>
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

        <div className="view" id="viewEnrollment">
          <div className="view-sub">Invite candidates to the trial, track their consent status as it changes, and review a complete audit log of every action taken.</div>
          <main className="workspace">
            <section className="panel candidates-panel">
              <div id="enrollmentSummary"></div>
              <div className="candidate-list" id="enrollmentList"></div>
            </section>
            <section className="panel detail-panel" id="auditPanel">
              <div className="detail-empty">The audit trail — a timestamped record of every invite, consent, and enrollment action for this trial — will appear here.</div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

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
  const TAB_LABELS = { candidates: 'Candidates', progress: 'Trial progress', enrollment: 'Enrollment & consent' };
  const OVERALL_HELP = { eligible: 'Meets every criterion the trial has structured data for.', ineligible: 'Fails at least one eligibility criterion.', 'needs more data': "Doesn't fail anything, but is missing data needed to confirm eligibility on at least one criterion." };
  const VERDICT_HELP = { pass: 'This criterion is met.', fail: 'This criterion is not met.', unknown: "Missing data for this criterion — can't be confirmed either way, needs human review." };
  const STATUS_HELP = { not_invited: 'Not yet invited to this trial.', invited: 'Invitation sent; awaiting the patient\'s response.', accepted: 'Patient is in the middle of responding to consent.', consented: 'Patient has consented; awaiting researcher enrollment.', enrolled: 'Enrolled in the trial — baseline set, progress is being tracked.', declined: 'Patient declined the invitation.', withdrawn: 'Patient withdrew after previously accepting or enrolling.' };

  let currentNctId = null, currentPatientCount = 30, selectedPatientId = null;
  let progressLoadedFor = null, enrollmentLoadedFor = null, cachedCandidates = null, cachedCandidatesFor = null;

  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function shortId(id) { return id.length > 10 ? id.slice(0, 8) : id; }

  function copyFullId(btn) {
    const fullId = btn.dataset.fullId;
    const original = btn.textContent;
    const revert = () => { btn.textContent = original; btn.classList.remove('copied'); };
    navigator.clipboard.writeText(fullId).then(() => { btn.textContent = 'Copied full ID'; btn.classList.add('copied'); setTimeout(revert, 1200); }).catch(() => { btn.textContent = fullId; setTimeout(revert, 2000); });
  }

  function setStatus(msg) { statusLine.innerHTML = msg ? `<div class="status-msg">${esc(msg)}</div>` : ''; }
  function setError(msg) { statusLine.innerHTML = `<div class="error-msg">${esc(msg)}</div>`; }
  function badgeClass(overall) { return 'badge-' + overall.replace(/ /g, '_'); }
  function emptyStateHtml() { return `<div class="empty-state"><div class="empty-state-title">No trial loaded yet</div><div class="empty-state-body">Enter a clinical trial ID above — an NCT number from ClinicalTrials.gov, or your own trial ID — then click "Load trial" to see ranked, eligible candidates.</div><button type="button" class="example-btn" id="exampleBtnEmpty">Try example trial</button></div>`; }

  function wireExampleButton() {
    const btn = container.querySelector('#exampleBtnEmpty');
    if (btn) btn.addEventListener('click', () => { nctInput.value = EXAMPLE_TRIAL_ID; loadTrial(); });
  }

  async function loadTrial() {
    const nctId = nctInput.value.trim();
    if (!nctId) return;
    const rawCount = parseInt(patientCountInput.value, 10);
    currentPatientCount = Number.isFinite(rawCount) ? Math.min(1000, Math.max(1, rawCount)) : 30;
    patientCountInput.value = currentPatientCount;
    loadBtn.disabled = true;
    trialInfo.innerHTML = ''; funnelArea.innerHTML = ''; candidateList.innerHTML = '';
    detailPanel.innerHTML = '<div class="detail-empty">Select a candidate to see the full breakdown.</div>';
    metricsArea.innerHTML = ''; progressList.innerHTML = '';
    progressDetailPanel.innerHTML = '<div class="detail-empty">Select a patient to see their full test breakdown.</div>';
    enrollmentSummary.innerHTML = ''; enrollmentList.innerHTML = '';
    auditPanel.innerHTML = '<div class="detail-empty">Audit trail for this trial will appear here.</div>';
    selectedPatientId = null; progressLoadedFor = null; enrollmentLoadedFor = null; cachedCandidates = null; cachedCandidatesFor = null;
    tabRow.classList.remove('visible'); crumbSep.style.display = 'none'; crumbCurrent.textContent = ''; candidatesViewSub.style.display = 'none';
    switchTab('candidates'); stopEnrollmentPolling(); setStatus(`Loading trial ${nctId}…`);
    try {
      const res = await fetch(`/trials/${encodeURIComponent(nctId)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'No trial found for that ID. Double-check the ID, or try our example trial.'); candidateList.innerHTML = emptyStateHtml(); wireExampleButton(); loadBtn.disabled = false; return; }
      currentNctId = data.nct_id;
      const phase = Array.isArray(data.phase) ? data.phase.join(', ') : data.phase;
      trialInfo.innerHTML = `<span class="title">${esc(data.title || data.nct_id)}</span><span class="meta">${esc(data.nct_id)}${phase ? ' · ' + esc(phase) : ''}${data.overall_status ? ' · ' + esc(data.overall_status) : ''}</span>`;
      tabRow.classList.add('visible'); crumbSep.style.display = ''; candidatesViewSub.style.display = '';
      switchTab('candidates'); await loadCandidates(currentNctId);
    } catch (err) { setError('Could not reach the server. Try again.'); candidateList.innerHTML = emptyStateHtml(); wireExampleButton(); } finally { loadBtn.disabled = false; }
  }

  function switchTab(tab) {
    crumbCurrent.textContent = TAB_LABELS[tab] || '';
    tabCandidates.classList.toggle('active', tab === 'candidates'); tabProgress.classList.toggle('active', tab === 'progress'); tabEnrollment.classList.toggle('active', tab === 'enrollment');
    viewCandidates.classList.toggle('active', tab === 'candidates'); viewProgress.classList.toggle('active', tab === 'progress'); viewEnrollment.classList.toggle('active', tab === 'enrollment');
  }

  async function loadCandidates(nctId) {
    setStatus(`Evaluating ${currentPatientCount} patients against this trial's eligibility criteria…`); candidateList.innerHTML = ''; funnelArea.innerHTML = '';
    try {
      const res = await fetch(`/trials/${encodeURIComponent(nctId)}/db-candidates?limit=${currentPatientCount}&max_evaluate=${currentPatientCount}`);
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'No parsed criteria for this trial yet.'); candidateList.innerHTML = emptyStateHtml(); wireExampleButton(); return; }
      setStatus('');
      const eligibleCount = data.candidates.filter(c => c.overall === 'eligible').length;
      const ineligibleCount = data.candidates.filter(c => c.overall === 'ineligible').length;
      const unknownCount = data.candidates.filter(c => c.overall === 'needs more data').length;
      funnelArea.innerHTML = `<div class="funnel"><canvas id="funnelChart"></canvas><div class="funnel-label" style="margin-top:0.5rem;font-weight:700;font-size:16px;color:var(--text)">${data.evaluated_count} / ${data.total_patients} patients evaluated</div><div class="funnel-sub">${data.coarse_filtered_count} passed an initial screen · showing top ${data.returned}</div></div>`;
      if (window.funnelChartInst) window.funnelChartInst.destroy();
      const ctx = container.querySelector('#funnelChart').getContext('2d');
      window.funnelChartInst = new window.Chart(ctx, { type: 'pie', data: { labels: ['Eligible', 'Ineligible', 'Needs More Data'], datasets: [{ data: [eligibleCount, ineligibleCount, unknownCount], backgroundColor: ['#4ade80', '#f87171', '#fbbf24'], borderWidth: 0, hoverOffset: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { family: 'Inter' }, padding: 15 } }, tooltip: { backgroundColor: 'rgba(26,29,35,0.9)', titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' }, borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1 } } } });
      if (data.candidates.length === 0) { candidateList.innerHTML = '<div class="detail-empty">No candidates matched this trial\'s criteria in the evaluated pool.</div>'; return; }
      candidateList.innerHTML = data.candidates.map(c => {
        const demo = [c.age !== null && c.age !== undefined ? c.age : null, c.sex].filter(Boolean).join(' · ');
        return `<button class="candidate" data-pid="${esc(c.patient_id)}"><div class="candidate-top"><span class="candidate-id mono" title="Patient ID (shortened)">${esc(shortId(c.patient_id))}</span><span class="badge ${badgeClass(c.overall)}" title="${esc(OVERALL_HELP[c.overall] || '')}">${esc(c.overall)}</span></div>${demo ? `<div class="candidate-demo">${esc(demo)}</div>` : ''}<div class="candidate-tally">${c.pass_count} pass · ${c.fail_count} fail · ${c.unknown_count} unknown</div></button>`;
      }).join('');
      candidateList.querySelectorAll('.candidate').forEach(btn => { btn.addEventListener('click', () => selectCandidate(btn.dataset.pid)); });
    } catch (err) { setError('Could not reach the server. Try again.'); candidateList.innerHTML = emptyStateHtml(); wireExampleButton(); }
  }

  async function selectCandidate(patientId) {
    selectedPatientId = patientId;
    candidateList.querySelectorAll('.candidate').forEach(btn => btn.classList.toggle('selected', btn.dataset.pid === patientId));
    detailPanel.innerHTML = '<div class="skeleton">Loading breakdown…</div>';
    try {
      const res = await fetch(`/trials/${encodeURIComponent(currentNctId)}/match/${encodeURIComponent(patientId)}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { detailPanel.innerHTML = `<div class="detail-empty">${esc(data.detail || 'Could not load this candidate.')}</div>`; return; }
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
          const groupLabel = (rr.group !== null && rr.group !== undefined) ? `<span class="rule-group-label">Path ${rr.group + 1}</span>` : '';
          return `<div class="rule-row"><div class="rule-head"><span>${groupLabel}${esc(rr.field)} ${esc(rr.operator)} ${esc(rr.value)}<span class="kv-value"> (patient's value: ${esc(rr.patient_value)})</span></span>${verifyButton(rr.source_lab_result_id, rr.patient_value, panelId)}</div><div id="${panelId}"></div></div>`;
        }).join('');
        return `<div class="rule-breakdown">${rows}</div>`;
      };
      const renderCriterion = (r) => {
        const topPanelId = `verify-${esc(r.id)}`;
        const valueLabel = r.field ? esc(r.field) : 'value';
        return `<div class="criterion"><div class="criterion-top"><div class="criterion-text">${esc(r.text)}</div><span class="verdict-pill verdict-${esc(r.verdict)}" title="${esc(VERDICT_HELP[r.verdict] || '')}">${esc(r.verdict)}</span></div><div class="criterion-meta">${r.patient_value !== null && r.patient_value !== undefined ? `<span><span class="kv-label">${valueLabel}: </span><span class="kv-value">${esc(Array.isArray(r.patient_value) ? r.patient_value.join(', ') : r.patient_value)}</span></span>` : ''}${r.source_lab_result_id !== null && r.source_lab_result_id !== undefined ? `<span><span class="kv-label">source record </span><span class="kv-value">#${esc(r.source_lab_result_id)}</span></span> ${verifyButton(r.source_lab_result_id, r.patient_value, topPanelId)}` : ''}</div><div class="criterion-reason">${esc(r.reason)}</div><div id="${topPanelId}"></div>${renderRuleBreakdown(r)}</div>`;
      };
      detailPanel.innerHTML = `<div class="detail-header"><span class="id" title="Full patient ID — shortened here for display">${esc(shortId(patientId))}</span><span class="badge ${badgeClass(data.overall)}" title="${esc(OVERALL_HELP[data.overall] || '')}">${esc(data.overall)}</span></div><div class="legend"><span title="${esc(VERDICT_HELP.pass)}"><span class="dot" style="background:var(--pass,#34d399)"></span>Pass = criterion met</span><span title="${esc(VERDICT_HELP.fail)}"><span class="dot" style="background:var(--fail,#fc8181)"></span>Fail = not met</span><span title="${esc(VERDICT_HELP.unknown)}"><span class="dot" style="background:var(--unknown,#f6ad55)"></span>Unknown = missing data</span></div>${inclusions.length ? `<div class="eyebrow group-label">Inclusion criteria</div>${inclusions.map(renderCriterion).join('')}` : ''}${exclusions.length ? `<div class="eyebrow group-label">Exclusion criteria</div>${exclusions.map(renderCriterion).join('')}` : ''}`;
    } catch (err) { detailPanel.innerHTML = '<div class="detail-empty">Could not reach the server. Try again.</div>'; }
  }

  detailPanel.addEventListener('click', async (e) => {
    const btn = e.target.closest('.verify-btn');
    if (!btn) return;
    const panel = container.querySelector('#' + btn.dataset.panel);
    if (!panel) return;
    let expectedRaw = null;
    try { expectedRaw = JSON.parse(btn.dataset.expected); } catch (err) { /* leave null */ }
    const expectedValues = Array.isArray(expectedRaw) ? expectedRaw : [expectedRaw];
    btn.disabled = true; panel.innerHTML = '<div class="verify-panel">Loading source record…</div>';
    try {
      const res = await fetch(`/lab-results/${encodeURIComponent(btn.dataset.labId)}`);
      const data = await res.json();
      if (!res.ok) { panel.innerHTML = `<div class="verify-panel">${esc(data.detail || 'Could not load source record.')}</div>`; btn.disabled = false; return; }
      const actualNum = parseFloat(data.value);
      const comparable = expectedValues.filter(v => v !== null && v !== undefined && !isNaN(parseFloat(v)));
      const matches = comparable.some(v => Math.abs(parseFloat(v) - actualNum) < 1e-6);
      const hasRange = data.reference_min !== null && data.reference_min !== undefined && data.reference_max !== null && data.reference_max !== undefined;
      panel.innerHTML = `<div class="verify-panel"><div class="verify-row"><span class="k">test</span><span class="v">${esc(data.test_name)} (${esc(data.test_code)})</span></div><div class="verify-row"><span class="k">value</span><span class="v${data.abnormal_flag ? ' abnormal' : ''}">${esc(data.value)}${data.unit ? ' ' + esc(data.unit) : ''}${data.abnormal_flag ? ' — abnormal' : ''}</span></div>${hasRange ? `<div class="verify-row"><span class="k">reference range</span><span class="v">${esc(data.reference_min)} – ${esc(data.reference_max)}</span></div>` : ''}<div class="verify-row"><span class="k">test date</span><span class="v">${esc((data.test_date || '').replace('T', ' ').slice(0, 19)) || '—'}</span></div><div class="verify-row"><span class="k">entered into system</span><span class="v">${esc((data.created_at || '').replace('T', ' ').slice(0, 19)) || '—'}</span></div><div class="verify-row"><span class="k">lab report</span><span class="v">${esc(data.lab_report_id) || '—'}</span></div>${comparable.length ? `<div class="verify-status ${matches ? 'ok' : 'mismatch'}">${matches ? '✓ Verified — matches the value this verdict used' : '⚠ Mismatch — source value differs from what the verdict used'}</div>` : ''}</div>`;
      btn.remove();
    } catch (err) { panel.innerHTML = '<div class="verify-panel">Could not reach the server. Try again.</div>'; btn.disabled = false; }
  });

  function devClass(status) { return 'dev-' + status; }
  function fmtValue(v) { if (v === null || v === undefined) return '—'; return typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(2)) : v; }
  function fmtDate(d) { if (!d) return null; return d.slice(0, 10); }
  function changeBarWidth(t) { if (t.deviation === null || t.deviation === undefined || !t.baseline_value) return 0; return Math.min(Math.abs(t.deviation / t.baseline_value) * 100, 50) / 50 * 100; }
  function changeBarHtml(t) { return `<div class="change-bar-track"><div class="change-bar-fill ${devClass(t.status)}" style="width:${changeBarWidth(t)}%"></div></div>`; }

  function renderCohortChart(patients) {
    const byTest = {};
    patients.forEach(p => { p.tests.forEach(t => { if (!byTest[t.test_code]) { byTest[t.test_code] = { name: t.test_name || t.test_code, improved: 0, worsened: 0, indeterminate: 0, no_data: 0 }; } if (byTest[t.test_code][t.status] !== undefined) byTest[t.test_code][t.status]++; }); });
    const codes = Object.keys(byTest).sort();
    if (!codes.length) return '<div class="detail-empty">No test data recorded for enrolled patients yet.</div>';
    const rows = codes.map(code => { const c = byTest[code]; const total = c.improved + c.worsened + c.indeterminate + c.no_data; const seg = (n) => total ? (n / total * 100) : 0; return `<div class="cohort-row"><div class="cohort-row-label"><span class="name">${esc(c.name)}</span><span class="counts">${c.improved} improved · ${c.worsened} worsened · ${c.indeterminate + c.no_data} no signal</span></div><div class="cohort-track"><div class="cohort-segment seg-improved" style="width:${seg(c.improved)}%"></div><div class="cohort-segment seg-worsened" style="width:${seg(c.worsened)}%"></div><div class="cohort-segment seg-indeterminate" style="width:${seg(c.indeterminate)}%"></div><div class="cohort-segment seg-no_data" style="width:${seg(c.no_data)}%"></div></div></div>`; }).join('');
    return `<div class="cohort-chart"><div class="cohort-title">Cohort trend by test — ${patients.length} enrolled patient${patients.length === 1 ? '' : 's'}</div>${rows}<div class="cohort-legend"><span><span class="dot" style="background:#34d399"></span>Improved</span><span><span class="dot" style="background:#fc8181"></span>Worsened</span><span><span class="dot" style="background:#f6ad55"></span>Indeterminate</span><span><span class="dot" style="background:#64748b;opacity:0.5"></span>No follow-up data</span></div></div>`;
  }

  async function loadProgress(nctId) {
    metricsArea.innerHTML = '<div class="skeleton">Comparing enrolled patients\' latest results to their baseline…</div>'; progressList.innerHTML = '';
    try {
      const res = await fetch(`/trials/${encodeURIComponent(nctId)}/progress`);
      const data = await res.json();
      if (!res.ok) { metricsArea.innerHTML = `<div class="detail-empty">${esc(data.detail || 'Could not load progress for this trial.')}</div>`; return; }
      progressLoadedFor = nctId; window.__progressData = data;
      const successRatePct = data.success_rate !== null && data.success_rate !== undefined ? Math.round(data.success_rate * 100) : null;
      const successPct = successRatePct !== null ? successRatePct + '%' : '—';
      const ringGradient = successRatePct !== null ? `conic-gradient(#34d399 ${successRatePct * 3.6}deg, rgba(99,179,237,0.1) 0)` : `conic-gradient(rgba(99,179,237,0.1) 0deg, rgba(99,179,237,0.1) 0)`;
      metricsArea.innerHTML = `<div class="metrics-top"><div class="progress-ring" style="background:${ringGradient}"><div class="progress-ring-hole"><span class="progress-ring-pct">${successPct}</span></div></div><div class="metrics-side"><div class="metric"><div class="metric-figure">${data.enrolled}</div><div class="metric-label">enrolled</div></div><div class="metric"><div class="metric-figure">${data.active}</div><div class="metric-label">active</div></div><div class="metric"><div class="metric-figure">${data.dropouts}</div><div class="metric-label">dropouts</div></div></div></div><div class="metric-sub" style="margin-bottom:0.75rem">${data.primary_test_code_used ? `success rate = share of enrolled patients improved on ${esc(data.primary_test_code_used)}` : 'no direction-defined test with enough data yet'}</div><div class="disclaimer">This measures the treatment cohort's trajectory against its own baseline on ${data.primary_test_code_used ? esc(data.primary_test_code_used) : 'a tracked test'} — not a controlled efficacy result. There is no control arm here.</div>`;
      if (data.patients.length === 0) { progressList.innerHTML = '<div class="detail-empty">No patients enrolled in this trial yet.</div>'; progressDetailPanel.innerHTML = '<div class="detail-empty">No patients enrolled in this trial yet.</div>'; return; }
      progressDetailPanel.innerHTML = renderCohortChart(data.patients);
      progressList.innerHTML = data.patients.map(p => { const rows = p.tests.map(t => `<div class="test-readout"><span class="dev-dot ${devClass(t.status)}"></span><span>${esc(t.test_code)}</span><span class="readout-value">${fmtValue(t.baseline_value)} → ${fmtValue(t.latest_value)}${t.unit ? ' ' + esc(t.unit) : ''}</span>${changeBarHtml(t)}</div>`).join(''); return `<button class="patient-progress-row" data-pid="${esc(p.patient_id)}"><div class="ppr-top"><span class="ppr-id mono">${esc(shortId(p.patient_id))}</span><span class="status-tag">${esc(p.status)}</span></div><div class="ppr-tests">${rows}</div></button>`; }).join('');
      progressList.querySelectorAll('.patient-progress-row').forEach(btn => { btn.addEventListener('click', () => selectProgressPatient(btn.dataset.pid)); });
    } catch (err) { metricsArea.innerHTML = '<div class="detail-empty">Could not reach the server. Try again.</div>'; }
  }

  function selectProgressPatient(patientId) {
    progressList.querySelectorAll('.patient-progress-row').forEach(btn => btn.classList.toggle('selected', btn.dataset.pid === patientId));
    const data = window.__progressData;
    const patient = data && data.patients.find(p => p.patient_id === patientId);
    if (!patient) { progressDetailPanel.innerHTML = '<div class="detail-empty">Could not find this patient.</div>'; return; }
    const renderTest = (t) => `<div class="test-detail"><div class="test-detail-top"><span class="test-name">${esc(t.test_name)} <span class="mono" style="color:#94a3b8;font-weight:400">(${esc(t.test_code)})</span></span><span class="dev-pill ${devClass(t.status)}"><span class="dev-dot ${devClass(t.status)}"></span>${esc(t.status.replace('_', ' '))}</span></div><div class="test-readout-line">Baseline ${fmtValue(t.baseline_value)}${t.unit ? ' ' + esc(t.unit) : ''} → Latest ${fmtValue(t.latest_value)}${t.unit ? ' ' + esc(t.unit) : ''}${t.deviation !== null && t.deviation !== undefined ? ` <span style="color:#94a3b8">(${t.deviation > 0 ? '+' : ''}${t.deviation})</span>` : ''}</div><div class="change-bar-wrap" style="margin-top:0.4rem">${changeBarHtml(t)}</div><div class="test-citations"><span>baseline ${fmtDate(t.baseline_date) || '—'}${t.baseline_lab_result_id ? ` · source record #${t.baseline_lab_result_id}` : ''}</span><span>latest ${fmtDate(t.latest_date) || '—'}${t.latest_lab_result_id ? ` · source record #${t.latest_lab_result_id}` : ''}</span></div></div>`;
    progressDetailPanel.innerHTML = `<div class="detail-header"><span class="id">${esc(shortId(patientId))}</span><span class="demo">${esc(patient.status)} · baseline ${fmtDate(patient.baseline_date) || '—'}</span></div>${patient.tests.map(renderTest).join('')}`;
  }

  function statusPillClass(status) { return 'st-' + status; }
  function renderEnrollmentActions(patientId, status) {
    const buttons = [];
    if (status === 'not_invited') buttons.push(`<button class="er-btn" data-action="invite" data-pid="${esc(patientId)}">Send invite</button>`);
    if (status === 'invited') buttons.push(`<a class="er-link" href="/?page=consent&patient=${encodeURIComponent(patientId)}&trial=${encodeURIComponent(currentNctId)}" target="_blank" rel="noopener">Open consent screen ↗</a>`);
    if (status === 'consented') buttons.push(`<button class="er-btn" data-action="enroll" data-pid="${esc(patientId)}">Confirm enrollment</button>`);
    if (['invited', 'accepted', 'consented', 'enrolled'].includes(status)) buttons.push(`<button class="er-btn danger" data-action="withdraw" data-pid="${esc(patientId)}">Withdraw</button>`);
    return buttons.join('');
  }

  async function loadEnrollment(nctId, quiet) {
    const haveCache = cachedCandidatesFor === nctId && cachedCandidates !== null;
    if (!quiet && !haveCache) { enrollmentSummary.innerHTML = '<div class="skeleton">Loading candidates and enrollment status…</div>'; enrollmentList.innerHTML = ''; }
    try {
      let candidates;
      if (haveCache) { candidates = cachedCandidates; }
      else {
        const candRes = await fetch(`/trials/${encodeURIComponent(nctId)}/db-candidates?limit=${currentPatientCount}&max_evaluate=${currentPatientCount}`);
        const candData = await candRes.json();
        if (!candRes.ok) { enrollmentSummary.innerHTML = `<div class="detail-empty">${esc(candData.detail || 'No parsed criteria for this trial yet.')}</div>`; return; }
        candidates = candData.candidates; cachedCandidates = candidates; cachedCandidatesFor = nctId;
      }
      await renderEnrollmentAndAudit(nctId, candidates, quiet);
    } catch (err) { enrollmentSummary.innerHTML = '<div class="detail-empty">Could not reach the server. Try again.</div>'; }
  }

  async function renderEnrollmentAndAudit(nctId, candidates, quiet) {
    const enrollRes = await fetch(`/trials/${encodeURIComponent(nctId)}/enrollment`);
    const enrollData = await enrollRes.json();
    enrollmentLoadedFor = nctId;
    const statusByPatient = {};
    if (enrollRes.ok) enrollData.forEach(e => { statusByPatient[e.patient_id] = e.status; });
    const counts = {};
    candidates.forEach(c => { const st = statusByPatient[c.patient_id] || 'not_invited'; counts[st] = (counts[st] || 0) + 1; });
    enrollmentSummary.innerHTML = `<div class="funnel"><div class="funnel-figure">${candidates.length}<span class="of"> candidates</span></div><div class="funnel-label">from the ranked list</div><div class="funnel-sub">${Object.entries(counts).map(([k, v]) => `<span title="${esc(STATUS_HELP[k] || '')}">${v} ${k.replace('_', ' ')}</span>`).join(' · ')}</div></div>`;
    enrollmentList.innerHTML = candidates.map(c => { const status = statusByPatient[c.patient_id] || 'not_invited'; return `<div class="enrollment-row"><div class="er-top"><button type="button" class="er-id-btn mono" data-full-id="${esc(c.patient_id)}" title="Click to copy the full patient ID">${esc(shortId(c.patient_id))}</button><span class="badge ${badgeClass(c.overall)}" title="${esc(OVERALL_HELP[c.overall] || '')}">${esc(c.overall)}</span></div><div class="candidate-demo"><span class="status-pill ${statusPillClass(status)}">${esc(status.replace('_', ' '))}</span></div><div class="er-actions">${renderEnrollmentActions(c.patient_id, status)}</div></div>`; }).join('');
    enrollmentList.querySelectorAll('.er-btn').forEach(btn => { btn.addEventListener('click', () => performAction(btn.dataset.pid, btn.dataset.action)); });
    enrollmentList.querySelectorAll('.er-id-btn').forEach(btn => { btn.addEventListener('click', () => copyFullId(btn)); });
    await loadAuditTrail(nctId, quiet);
  }

  async function pollEnrollmentStatus(nctId) {
    if (cachedCandidatesFor !== nctId || !cachedCandidates) return;
    try { await renderEnrollmentAndAudit(nctId, cachedCandidates, true); } catch (err) { /* Transient poll failure */ }
  }

  async function loadAuditTrail(nctId, quiet) {
    if (!quiet) auditPanel.innerHTML = '<div class="skeleton">Loading audit trail…</div>';
    try {
      const res = await fetch(`/trials/${encodeURIComponent(nctId)}/audit?limit=100`);
      const data = await res.json();
      if (!res.ok) { auditPanel.innerHTML = `<div class="detail-empty">${esc(data.detail || 'Could not load audit trail.')}</div>`; return; }
      if (data.length === 0) { auditPanel.innerHTML = '<div class="detail-empty">No audit events for this trial yet. Every invite, consent, and enrollment action will be logged here as it happens.</div>'; return; }
      const ACTION_LABELS = { 'patient.invited': 'Invitation sent', 'patient.accepted': 'Patient began responding', 'consent.recorded': 'Consent recorded', 'patient.enrolled': 'Enrollment confirmed', 'patient.withdrawn': 'Patient withdrew', 'patient.declined': 'Patient declined' };
      const rows = data.map(row => { const detail = row.detail ? `${esc(row.detail.from_status || '—')} → ${esc(row.detail.to_status || '—')}` : '—'; const fullPatientId = (row.entity_id || '').split(':')[0]; return `<tr><td>${esc((row.created_at || '').replace('T', ' ').slice(0, 19))}</td><td class="actor-${esc(row.actor)}">${esc(row.actor)}</td><td>${esc(ACTION_LABELS[row.action] || row.action)}</td><td class="mono">${esc(shortId(fullPatientId))}</td><td>${detail}</td></tr>`; }).join('');
      auditPanel.innerHTML = `<div class="eyebrow group-label">Audit trail</div><div style="overflow-x:auto"><table class="audit-table"><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Patient</th><th>Status change</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    } catch (err) { auditPanel.innerHTML = '<div class="detail-empty">Could not reach the server. Try again.</div>'; }
  }

  async function performAction(patientId, action) {
    try {
      const res = await fetch(`/trials/${encodeURIComponent(currentNctId)}/patients/${encodeURIComponent(patientId)}/${action}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Action failed.'); return; }
      setStatus(''); await loadEnrollment(currentNctId, true);
    } catch (err) { setError('Could not reach the server. Try again.'); }
  }

  function stopEnrollmentPolling() { if (window.__tmEnrollmentPollTimer) { clearInterval(window.__tmEnrollmentPollTimer); window.__tmEnrollmentPollTimer = null; } }
  function startEnrollmentPolling() { stopEnrollmentPolling(); window.__tmEnrollmentPollTimer = setInterval(() => { if (currentNctId) pollEnrollmentStatus(currentNctId); }, 4000); }

  tabCandidates.addEventListener('click', () => { switchTab('candidates'); stopEnrollmentPolling(); });
  tabProgress.addEventListener('click', () => { switchTab('progress'); stopEnrollmentPolling(); if (currentNctId && progressLoadedFor !== currentNctId) loadProgress(currentNctId); });
  tabEnrollment.addEventListener('click', () => { switchTab('enrollment'); loadEnrollment(currentNctId, enrollmentLoadedFor === currentNctId); startEnrollmentPolling(); });
  loadBtn.addEventListener('click', loadTrial);
  nctInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') loadTrial(); });
  wireExampleButton();
}
