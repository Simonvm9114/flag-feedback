/** Screenshot list, annotation toolbar, submit and error styles. */
export const STYLES_COMPONENTS = `
  /* ── Screenshots list (thumbnails) ────────────────────── */
  .screenshots-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .screenshot-thumb {
    position: relative;
    width: 64px;
    height: 48px;
    border-radius: 6px;
    overflow: hidden;
    border: 2px solid transparent;
    cursor: pointer;
    flex-shrink: 0;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .screenshot-thumb:hover {
    border-color: var(--fw-color, #6366F1);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
  }

  .screenshot-thumb.active {
    border-color: var(--fw-color, #6366F1);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  }

  .screenshot-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .screenshot-thumb .screenshot-remove {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .screenshot-thumb:hover .screenshot-remove {
    opacity: 1;
  }

  .screenshot-thumb .screenshot-remove:hover {
    background: #dc2626;
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
