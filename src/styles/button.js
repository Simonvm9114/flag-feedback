/** Floating button and recording pill styles. */
export const STYLES_BUTTON = `
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
  .fb-btn.recording-hidden { display: none; }

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
`;
