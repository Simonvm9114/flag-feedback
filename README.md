# flag-feedback

A framework-agnostic vanilla JS library that developers drop into any web application to collect structured, element-level feedback. You supply a trigger element; the library attaches a feedback panel to it. When the panel is submitted, a feedback package is POSTed as JSON to a configured endpoint.

## Installation

```bash
npm install flag-feedback
```

## Usage

### ES module

```js
import { initFeedback } from 'flag-feedback';

const instance = initFeedback({
  activator: document.getElementById('feedback-btn'),
  endpoint: 'https://your-api.com/feedback',
});
```

Add any element to your HTML as the trigger:

```html
<button id="feedback-btn">Give feedback</button>
```

### CDN (UMD)

```html
<script src="https://unpkg.com/flag-feedback@2.0.0/dist/flag-feedback.umd.js"></script>
<script>
  FlagFeedback.initFeedback({
    activator: document.getElementById('feedback-btn'),
    endpoint: 'https://your-api.com/feedback',
  });
</script>
```

### With optional config

```js
import { initFeedback } from 'flag-feedback';

const instance = initFeedback({
  activator: document.getElementById('feedback-btn'),
  endpoint: 'https://your-api.com/feedback',
  appId: 'my-app',
  gitCommit: 'a3f9c12',
  gitRepo: 'https://github.com/your-org/your-repo.git',
  sessionKey: 'my-app',
});
```

### Cleanup

`initFeedback` returns a widget instance. Call `destroy()` to remove all event listeners and DOM nodes — useful in SPAs when the host component unmounts:

```js
const instance = initFeedback({ ... });

// later:
instance.destroy();
```

### Endpoint validation (security hardening)

`endpoint` is validated before the widget initializes:

- Allowed: `https://...` endpoints
- Allowed for local development: `http://localhost/...` and `http://127.x.x.x/...`
- Rejected: relative URLs (e.g. `/api/feedback`), `http://` non-localhost URLs, and non-HTTP schemes (`javascript:`, `data:`, `blob:`, `file:`)

If validation fails, the widget does not initialize and logs a warning to the console. The returned instance is a no-op.

## Configuration

| Option       | Type          | Default  | Description                                                                                            |
| ------------ | ------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `activator`  | `HTMLElement` | required | The element that opens the feedback panel on click                                                     |
| `endpoint`   | `string`      | required | Validated URL to POST the feedback package to                                                          |
| `appId`      | `string`      | —        | Identifier for the app, included in the package                                                        |
| `gitCommit`  | `string`      | —        | Git commit SHA (short or full), included in the package                                                |
| `gitRepo`    | `string`      | —        | Git repository URL, included in the package                                                            |
| `sessionKey` | `string`      | —        | Scopes draft persistence to this key (uses `sessionStorage`). Use to isolate multiple widget instances |

## User flow

1. **Activator click** — user clicks your trigger element to open the feedback panel.
2. **Feedback panel** — user writes a comment and selects a category (`Bug`, `Feature request`, or `Design request`). The rest of the app remains interactive.
3. **Element targeting** — user can click _Target element_ to minimise the panel and click specific UI elements on the page to attach them to the report.
4. **Record interactions** — user can click _Start recording_ to minimise the panel to a recording pill and capture interactions. Clicking the pill stops recording and reopens the panel.
5. **Submit** — posts the feedback package to the configured endpoint. Shows a brief ✓ on the activator element on success, or an inline error with retry on failure.
6. **Draft persistence** — the draft is saved to `sessionStorage` automatically and restored if the user reloads or navigates away mid-flow.

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
    "text": "The save button does nothing on iOS",
    "category": "bug-fix"
  },
  "elementTargets": [{ "path": "main > section > button#save-btn", "comment": "This button" }],
  "interactions": [
    { "t": 1710000123456, "type": "click", "path": "main > section > button#save-btn", "count": 1 },
    { "t": 1710000124100, "type": "scroll", "positionPct": 42, "count": 3 }
  ],
  "recordingStart": 1710000098000
}
```

`elementTargets` is `[]` when no elements were targeted. `interactions` is `[]` when recording was not active. `recordingStart` is `null` when recording was not used. Feedback text is truncated to 10,000 characters.

### Feedback categories

| `category` value  | Label shown in panel |
| ----------------- | -------------------- |
| `bug-fix`         | Bug                  |
| `feature-request` | Feature request      |
| `design-request`  | Design request       |

An empty string is submitted when the user does not select a category.

### Interaction event fields

| Field         | Present on                    | Description                                                                                                         |
| ------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `t`           | all                           | Unix timestamp (ms) of the most recent occurrence                                                                   |
| `type`        | all                           | Event type: `click`, `input`, `change`, `submit`, `scroll`, `popstate`, `hashchange`, `error`, `unhandledrejection` |
| `path`        | element events                | CSS selector path to the target element (up to 5 levels)                                                            |
| `positionPct` | `scroll`                      | Scroll position as % of scrollable height                                                                           |
| `count`       | all                           | How many consecutive identical events were folded into this entry                                                   |
| `message`     | `error`, `unhandledrejection` | Error message (truncated to 200 chars)                                                                              |

Consecutive events of the same type and path are folded into a single entry — `count` reflects how many times that event occurred rather than emitting duplicate entries.

## Migration from v1

v1.x shipped as a Web Component (`<flag-feedback>`). If you are upgrading from that version, here is what changed and what to update.

**Activator** — remove the `<flag-feedback>` element. Add your own trigger element to the HTML and pass it as `activator` to `initFeedback()`. The `position`, `button-color`, and `button-label` attributes no longer exist; styling and placement of the trigger are entirely up to you.

**Screenshots** — the screenshot and annotation feature has been removed. Element targeting (`elementTargets` in the payload) replaces it as the mechanism for pointing to specific UI elements.

**Payload shape** — `elementTargets` is a new top-level array. `feedback.category` is a new field; update your backend to handle both. The `screenshots` field from v1 is gone.

**Lifecycle** — `initFeedback()` returns an instance object. Store it and call `instance.destroy()` when the widget should be torn down (e.g. on SPA unmount).

## Privacy

- Input **values** are never captured — only the element's CSS path is recorded
- `password` fields are always excluded from interaction recording
- Any element (or ancestor) with `data-flag-feedback-ignore` is excluded from recording

## Browser support

Works on iOS Safari 16+, Chrome for Android, and all modern desktop browsers. Zero runtime dependencies.
