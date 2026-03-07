export const STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  [hidden] { display: none !important; }

  /* ── Floating button ─────────────────────────────────── */
  .fb-btn {
    position: fixed;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--fw-color, #6366F1);
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
    z-index: 9999;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.3s ease;
    line-height: 1;
    padding: 0;
  }

  @media (min-width: 501px) {
    .fb-btn { width: 48px; height: 48px; }
    .fb-btn svg { width: 18px; height: 18px; }
  }

  .fb-btn:hover { transform: scale(1.08); box-shadow: 0 6px 18px rgba(0, 0, 0, 0.28); }
  .fb-btn:active { transform: scale(0.96); }
  .fb-btn.success { background: #22c55e !important; }

  /* ── Recording pill ──────────────────────────────────── */
  .fb-pill {
    position: fixed;
    z-index: 9999;
    background: #111;
    color: #fff;
    border-radius: 999px;
    padding: 0 18px;
    height: 44px;
    border: none;
    cursor: pointer;
    display: none;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
  }

  .fb-pill.visible { display: flex; }

  .rec-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ef4444;
    flex-shrink: 0;
    animation: fw-blink 1.2s ease-in-out infinite;
  }

  @keyframes fw-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* ── Panel ───────────────────────────────────────────── */
  .fb-panel {
    position: fixed;
    z-index: 9999;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 36px rgba(0, 0, 0, 0.18);
    width: 420px;
    max-width: calc(100vw - 32px);
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: #111;
    opacity: 0;
    pointer-events: none;
    transform: scale(0.95) translateY(6px);
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  .fb-panel.open {
    opacity: 1;
    pointer-events: all;
    transform: scale(1) translateY(0);
  }

  .fb-panel.capture-hidden { display: none; }

  /* ── Panel header ────────────────────────────────────── */
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 12px;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0;
  }

  .panel-title { font-weight: 600; font-size: 15px; margin: 0; }

  .panel-close {
    background: none;
    border: none;
    cursor: pointer;
    color: #777;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
    padding: 0;
    font-family: inherit;
  }

  .panel-close:hover { background: #f5f5f5; color: #333; }

  /* ── Panel body ──────────────────────────────────────── */
  .panel-body {
    padding: 14px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    flex: 1;
  }

  /* ── Textarea ────────────────────────────────────────── */
  .fb-textarea {
    width: 100%;
    min-height: 90px;
    padding: 10px 12px;
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
    font: inherit;
    resize: vertical;
    outline: none;
    background: #fafafa;
    color: #111;
    transition: border-color 0.15s, background 0.15s;
  }

  .fb-textarea:focus {
    border-color: var(--fw-color, #6366F1);
    background: #fff;
  }

  /* ── Record toggle ───────────────────────────────────── */
  .toggle-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    padding: 10px 12px;
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
    transition: background 0.15s;
    user-select: none;
  }

  .toggle-row:hover { background: #f9f9fc; }

  .switch {
    position: relative;
    width: 40px;
    height: 22px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  .track {
    position: absolute;
    inset: 0;
    background: #d1d5db;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .track::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    top: 3px;
    left: 3px;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .switch input:checked + .track { background: var(--fw-color, #6366F1); }
  .switch input:checked + .track::after { transform: translateX(18px); }

  .toggle-info strong { display: block; font-weight: 500; font-size: 14px; color: #111; }
  .toggle-info small { color: #888; font-size: 12px; }

  /* ── Screenshot button ───────────────────────────────── */
  .screenshot-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    min-height: 44px;
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    font: inherit;
    color: #333;
    transition: border-color 0.15s, background 0.15s;
  }

  .screenshot-btn:hover {
    border-color: var(--fw-color, #6366F1);
    background: #f5f4ff;
  }

  /* ── Annotation toolbar ──────────────────────────────── */
  .ann-toolbar {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ann-hint {
    font-size: 12px;
    color: #888;
  }

  .ann-tools {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .tool-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    min-height: 32px;
    border: 1.5px solid #e0e0e0;
    border-radius: 6px;
    background: transparent;
    color: #444;
    font: 500 13px/1 inherit;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, color 0.15s;
  }

  .tool-btn:hover {
    border-color: var(--fw-color, #6366F1);
    background: #f5f4ff;
  }

  .tool-btn.active {
    border-color: var(--fw-color, #6366F1);
    background: #ede9fe;
    color: #4338ca;
  }

  .clear-ann-btn {
    display: inline-flex;
    align-items: center;
    padding: 5px 12px;
    min-height: 32px;
    border: 1.5px solid #e0e0e0;
    border-radius: 6px;
    background: transparent;
    color: #888;
    font: 500 13px/1 inherit;
    cursor: pointer;
    margin-left: auto;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }

  .clear-ann-btn:hover {
    background: #fef2f2;
    color: #dc2626;
    border-color: #fecaca;
  }

  /* ── Screenshot canvas ───────────────────────────────── */
  .screenshot-canvas {
    width: 100%;
    height: auto;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    cursor: crosshair;
    touch-action: none;
    display: block;
  }

  /* ── Submit ──────────────────────────────────────────── */
  .submit-btn {
    width: 100%;
    padding: 12px;
    min-height: 44px;
    background: var(--fw-color, #6366F1);
    color: #fff;
    border: none;
    border-radius: 8px;
    font: 600 15px/1 inherit;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
  }

  .submit-btn:hover:not(:disabled) { opacity: 0.9; }
  .submit-btn:active:not(:disabled) { transform: scale(0.98); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── Error ───────────────────────────────────────────── */
  .fb-error {
    color: #dc2626;
    font-size: 13px;
    text-align: center;
    margin: 0;
    display: none;
  }

  .fb-error.visible { display: block; }
`;
