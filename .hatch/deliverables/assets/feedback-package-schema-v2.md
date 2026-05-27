# Feedback Package Schema (v2)

Authoritative schema for the JSON payload the package POSTs to the configured endpoint. Agreed in Phase 2. This is a versioned contract — treat changes as breaking.

Full example, field reference, and v1→v2 changes are documented here. The content checklist records the client decisions that produced this schema.

---

## Example payload

```json
{
  "id": "fb_01J8X...",
  "timestamp": "2026-03-07T12:00:00.000Z",
  "app": {
    "id": "my-app",
    "gitCommit": "a3f9c12",
    "gitRepo": "https://github.com/Simonvm9114/flag-feedback.git",
    "url": "https://example.com/dashboard",
    "route": "/dashboard"
  },
  "device": {
    "userAgent": "Mozilla/5.0 ...",
    "viewport": { "w": 1440, "h": 900 },
    "pixelRatio": 2
  },
  "feedback": {
    "text": "The save flow feels broken on mobile",
    "category": "bug-fix"
  },
  "elementTargets": [
    {
      "path": "main > section > button#save-btn",
      "comment": "This button does nothing when tapped on iOS"
    },
    {
      "path": "form#contact-form > label:nth-child(2)",
      "comment": "This label is misleading"
    }
  ],
  "interactions": [
    { "t": 1710000123456, "type": "click",  "path": "main > section > button#save-btn", "count": 1 },
    { "t": 1710000124100, "type": "scroll", "positionPct": 42,                          "count": 3 },
    { "t": 1710000125000, "type": "submit", "path": "form#contact-form",                "count": 1 }
  ],
  "recordingStart": 1710000098000
}
```

Minimal submission (comment and category only):

```json
{
  "id": "fb_01J8Y...",
  "timestamp": "2026-03-07T12:05:00.000Z",
  "app": { "id": null, "gitCommit": null, "gitRepo": null, "url": "https://example.com/", "route": "/" },
  "device": { "userAgent": "...", "viewport": { "w": 390, "h": 844 }, "pixelRatio": 3 },
  "feedback": {
    "text": "Overall navigation feels confusing",
    "category": "design-request"
  },
  "elementTargets": [],
  "interactions": [],
  "recordingStart": null
}
```

---

## Top-level fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | yes | Unique submission ID, prefixed `fb_` |
| `timestamp` | string (ISO 8601) | yes | Submission time |
| `app` | object | yes | Host application context (see below) |
| `device` | object | yes | Browser/device context (see below) |
| `feedback` | object | yes | User comment and category (see below) |
| `elementTargets` | array | yes | Deliberate element-level annotations; `[]` when none |
| `interactions` | array | yes | Passively recorded events; `[]` when not recording |
| `recordingStart` | number \| null | yes | Unix timestamp (ms) when recording started; `null` when not used |

---

## `app` object

| Field | Type | Description |
| --- | --- | --- |
| `id` | string \| null | Optional app identifier supplied by host developer |
| `gitCommit` | string \| null | Optional commit SHA |
| `gitRepo` | string \| null | Optional repository URL |
| `url` | string | Full page URL at submission time |
| `route` | string | Pathname + hash at submission time |

---

## `device` object

| Field | Type | Description |
| --- | --- | --- |
| `userAgent` | string | Browser user agent string |
| `viewport` | object | `{ "w": number, "h": number }` — inner width and height in px |
| `pixelRatio` | number | `window.devicePixelRatio` |

---

## `feedback` object

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `text` | string | yes | Free-text comment; truncated to 10,000 characters before submission |
| `category` | string | yes | One of: `"design-request"`, `"feature-request"`, `"bug-fix"` |

---

## `elementTargets` array

Each entry is a deliberate, user-annotated UI element selection from element-targeting mode.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | yes | CSS selector path (up to 5 ancestor levels), same convention as interaction events |
| `comment` | string | yes | User-written comment for this element |

**Note:** Use `path`, not `selector` — one field name across the payload.

---

## `interactions` array

Unchanged from the `flag-feedback` v1.x experiment. Each entry records one interaction (or folded sequence) from recording mode.

| Field | Present on | Description |
| --- | --- | --- |
| `t` | all | Unix timestamp (ms) of the most recent occurrence |
| `type` | all | `click`, `input`, `change`, `submit`, `scroll`, `popstate`, `hashchange`, `error`, `unhandledrejection` |
| `path` | element events | CSS selector path to the target element |
| `positionPct` | `scroll` | Scroll position as % of scrollable height |
| `count` | all | Consecutive identical events folded into this entry |
| `message` | `error`, `unhandledrejection` | Error message (truncated to 200 chars) |

Input field values are never captured. Password fields and elements marked `data-flag-feedback-ignore` are excluded.

---

## Changes from v1.x

| Change | v1.x (`flag-feedback` experiment) | v2.x (MVP) |
| --- | --- | --- |
| Screenshots | `screenshots` array (base64 images, max 5) | **Removed** |
| Category | not present | **Added** — required `feedback.category` |
| Element targets | not present | **Added** — `elementTargets` array |
| All other fields | as documented in experiment README | **Unchanged** |

---

## Empty and null conventions

- `elementTargets`: `[]` when the user did not target any elements
- `interactions`: `[]` when recording was not used
- `recordingStart`: `null` when recording was not used
- Optional `app` fields (`id`, `gitCommit`, `gitRepo`): `null` when not supplied by the host developer
