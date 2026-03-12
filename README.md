# flag-feedback

A framework-agnostic vanilla JS Web Component that developers drop into any web application to collect structured feedback. It renders as a floating button. When activated, it opens a feedback panel where users can describe the issue, optionally annotate a screenshot, and optionally record a session of their interactions.

On submission a feedback package is POSTed as JSON to a configured endpoint.

## Installation

```bash
npm install flag-feedback
```

## Usage

### Minimal

```js
import 'flag-feedback';
```

```html
<flag-feedback endpoint="https://your-api.com/feedback"></flag-feedback>
```

### CDN (UMD)

```html
<script src="https://unpkg.com/flag-feedback@1.3.1/dist/flag-feedback.umd.js"></script>
<flag-feedback endpoint="https://your-api.com/feedback"></flag-feedback>
```

### Endpoint validation (security hardening)

`endpoint` is validated before the widget renders:

- Allowed: `https://...` endpoints
- Allowed for local development: `http://localhost/...` and `http://127.x.x.x/...`
- Rejected: relative URLs (for example `/api/feedback`), `http://` non-localhost URLs, and non-HTTP schemes (`javascript:`, `data:`, `blob:`, `file:`)

If validation fails, the widget does not render.

### With optional config

```html
<flag-feedback
  endpoint="https://your-api.com/feedback"
  app-id="my-app"
  git-commit="a3f9c12"
  git-repo="https://github.com/your-org/your-repo.git"
  position="bottom-right"
  button-color="#6366F1"
  button-label="Give feedback"
></flag-feedback>
```

## Attributes

| Attribute      | Type   | Default         | Description                                                                      |
| -------------- | ------ | --------------- | -------------------------------------------------------------------------------- |
| `endpoint`     | string | **required**    | Validated URL to POST the feedback package to (must be `https://...`, or local `http://localhost` / `http://127.x.x.x`) |
| `app-id`       | string | —               | Identifier for the app, included in the package                                  |
| `git-commit`   | string | —               | Git commit SHA (short or full), included in the package                          |
| `git-repo`     | string | —               | Git repository URL, included in the package                                      |
| `position`     | string | `bottom-right`  | Floating button position: `bottom-right`, `bottom-left`, `top-right`, `top-left` |
| `button-color` | string | `#6366F1`       | CSS colour for the floating button                                               |
| `button-label` | string | `Give feedback` | Accessible label / tooltip text                                                  |

## User flow

1. **Floating button** — always visible, fixed to the chosen corner of the viewport.
2. **Feedback panel** — click the button to open a panel. The app remains fully interactive behind it.
3. **Record interactions** — tap *Start recording* to minimise the panel to a recording pill and capture interactions. Tap the pill to stop recording and reopen the panel.
4. **Screenshot** — tap *Add screenshot* to capture the page (the panel hides momentarily for a clean capture). Multiple screenshots are supported. Rectangle and circle tools annotate the active screenshot.
5. **Submit** — posts the feedback package to the configured endpoint. Shows a brief ✓ confirmation on success, or an inline error with retry on failure.

## Feedback package schema

The JSON body POSTed to your endpoint:

```json
{
  "id": "fb_01J8X...",
  "timestamp": "2026-03-07T12:00:00.000Z",
  "app": {
    "id": "my-app",
    "gitCommit": "a3f9c12",
    "gitRepo": "https://github.com/your-org/your-repo.git",
    "url": "https://example.com/dashboard",
    "route": "/dashboard"
  },
  "device": {
    "userAgent": "...",
    "viewport": { "w": 1440, "h": 900 },
    "pixelRatio": 2
  },
  "feedback": {
    "text": "The save button does nothing on iOS"
  },
  "screenshots": [
    "data:image/png;base64,..."
  ],
  "interactions": [
    { "t": 1710000123456, "type": "click",  "path": "main > section > button#save-btn", "count": 1 },
    { "t": 1710000124100, "type": "scroll", "positionPct": 42,                          "count": 3 },
    { "t": 1710000125000, "type": "submit", "path": "form#contact-form",                "count": 1 }
  ],
  "recordingStart": 1710000098000
}
```

`screenshots` is an array and is `[]` when no screenshots are included. `recordingStart` is `null` when not used. `interactions` is `[]` when recording was not active.
Feedback text is truncated to 10,000 characters. A maximum of 5 screenshots is submitted (additional screenshots are ignored).

## Migration notes

If you are upgrading from older versions:

- Replace relative endpoints (for example `/api/feedback`) with absolute URLs (for example `https://your-domain/api/feedback`)
- Update backend payload handling to consume `screenshots` (array) instead of legacy `screenshot` (single value), if your integration still expects the old shape
- If your backend previously relied on very large payloads, note that text is truncated to 10,000 chars and at most 5 screenshots are submitted

### Interaction event fields

| Field        | Present on          | Description                                              |
| ------------ | ------------------- | -------------------------------------------------------- |
| `t`          | all                 | Unix timestamp (ms) of the most recent occurrence        |
| `type`       | all                 | Event type: `click`, `input`, `change`, `submit`, `scroll`, `popstate`, `hashchange`, `error`, `unhandledrejection` |
| `path`       | element events      | CSS selector path to the target element (up to 5 levels) |
| `positionPct`| `scroll`            | Scroll position as % of scrollable height                |
| `count`      | all                 | How many consecutive identical events were folded into this entry |
| `message`    | `error`, `unhandledrejection` | Error message (truncated to 200 chars)         |

Consecutive events of the same type and path are folded into a single entry — `count` reflects how many times that event occurred rather than emitting duplicate entries.

## Privacy

- Input **values** are never captured — only the element's CSS path is recorded
- `password` fields are always excluded from interaction recording
- Any element (or ancestor) with `data-flag-feedback-ignore` is excluded from recording
- Screenshots capture exactly what is visible on screen — the annotated version (including any shapes the user draws) is what gets submitted; mask sensitive UI before deployment

## Browser support

Works on iOS Safari 16+, Chrome for Android, and all modern desktop browsers. Zero framework dependencies.
