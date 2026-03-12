/** Panel container, header, body and form controls. */
export const STYLES_PANEL = `
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

  /* ── Record play button ───────────────────────────────── */
  .record-play-btn {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    padding: 10px 12px;
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
    background: transparent;
    transition: background 0.15s, border-color 0.15s;
    user-select: none;
    width: 100%;
    text-align: left;
    font: inherit;
    color: inherit;
  }

  .record-play-btn:hover {
    background: #f9f9fc;
    border-color: var(--fw-color, #6366F1);
  }

  .record-play-icon {
    width: 40px;
    height: 40px;
    min-width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--fw-color, #6366F1);
    color: #fff;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .record-play-btn:hover .record-play-icon {
    background: #4f46e5;
  }

  .record-play-info strong { display: block; font-weight: 500; font-size: 14px; color: #111; }
  .record-play-info small { color: #888; font-size: 12px; }

  /* ── Interactions row (counter + reset) ───────────────────── */
  .interactions-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .interactions-row[hidden] { display: none; }

  .interactions-count {
    margin: 0;
    font-size: 13px;
    color: #059669;
    flex: 1;
  }

  .reset-recording-btn {
    flex-shrink: 0;
    padding: 4px 10px;
    font-size: 12px;
    font-family: inherit;
    color: #666;
    background: transparent;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }

  .reset-recording-btn:hover {
    color: #333;
    border-color: #bbb;
  }

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
`;
