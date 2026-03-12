/**
 * HTML template for the feedback panel body.
 */

/**
 * Returns the panel inner HTML string with icons injected.
 * @param {{ play: string, camera: string }} icons - Icon SVG strings.
 * @returns {string}
 */
export function getPanelTemplate(icons) {
  return `
    <div class="panel-header">
      <p class="panel-title">Feedback</p>
      <button class="panel-close" type="button" aria-label="Close feedback panel">\u2715</button>
    </div>
    <div class="panel-body">
      <textarea class="fb-textarea" rows="4" placeholder="What happened? (Use Wispr Flow to dictate)" aria-label="Describe the issue or feedback"></textarea>
      <button class="record-play-btn" type="button" aria-label="Start recording my interactions">
        <span class="record-play-icon">${icons.play}</span>
        <span class="record-play-info">
          <strong>Start recording</strong>
          <small>Captures clicks &amp; navigation from this point</small>
        </span>
      </button>
      <button class="screenshot-btn" type="button">
        ${icons.camera}
        <span class="screenshot-btn-label">Add screenshot</span>
      </button>
      <div class="screenshots-list" hidden></div>
      <div class="ann-toolbar" hidden>
        <span class="ann-hint">Draw to highlight the problem area</span>
        <div class="ann-tools">
          <button type="button" class="tool-btn active" data-tool="rect">&#9645; Rect</button>
          <button type="button" class="tool-btn" data-tool="circle">&#9711; Circle</button>
          <button type="button" class="clear-ann-btn">Clear</button>
        </div>
      </div>
      <canvas class="screenshot-canvas" hidden></canvas>
      <button class="submit-btn" type="button">Submit</button>
      <p class="fb-error" role="alert"></p>
    </div>
  `;
}
