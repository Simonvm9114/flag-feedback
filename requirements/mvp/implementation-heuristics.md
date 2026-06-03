# MVP — Implementation Heuristics

Orientation for Phase 6. Grounded in `docs/architecture.md`, `docs/architecture/decisions/`, and `requirements/mvp/architecture.md`. These are judgment signals for specific coding situations; structural constraints are in `docs/architecture/decisions/design-principles.md` (principles 1–6). Formal checks live in `docs/architecture/decisions/formal-checks.md`. Non-negotiable boundaries remain in `docs/constitution.md`.

---

## Structural heuristics

### 1. Keep activator and portal in separate ownership zones

**Signal:** Code touches the host `activator` or the body portal / Shadow Root.

**Response:** Never apply package styles or shadow encapsulation to the activator; never render host chrome inside the portal.

**Example:** `initFeedback` binds `click` on the activator only; `FeedbackPanel` and mode pills mount under `#flag-feedback-portal` with an open Shadow Root.

**Cost if ignored:** US-03 fails — package styles leak into nav/header buttons; host layout breaks.

---

### 2. Let the state machine own mode transitions

**Signal:** Showing/hiding the panel, entering targeting or recording, or moving to `submitting`.

**Response:** Transition through the session module (`idle → panel → targeting | recording → …`), not scattered flags in UI files.

**Example:** "Start recording" calls `session.enterRecording()`; the panel component reacts to state, not the reverse.

**Cost if ignored:** Panel visible during recording on some paths (US-17); submit while targeting active; category validation diverges between UI and `buildPackage()`.

---

### 3. Register document-level listeners on mode entry; remove on exit and on `destroy()`

**Signal:** `addEventListener` on `document` or `window` for targeting or recording.

**Response:** Symmetric teardown on mode exit and in `destroy()`; after US-19 restore, re-attach only when the restored mode requires it.

**Example:** Recorder registers `click` capture in `enterRecording()` and removes the same function reference in `exitRecording()`.

**Cost if ignored:** US-18 fails — idle pages capture clicks; SPA leaks duplicate handlers; restored recording sessions never append events.

---

### 4. Assemble the feedback package only through `buildPackage()` at submit time

**Signal:** Building JSON, truncating text, or mapping category enums.

**Response:** One pure payload builder reads session + init config; no second serializer in the network layer or UI.

**Example:** Submit handler awaits `fetch(endpoint, { body: JSON.stringify(buildPackage(session, config)) })`.

**Cost if ignored:** Schema drift for AI consumers — wrong category strings, inconsistent truncation vs `.hatch/deliverables/assets/feedback-package-schema-v2.md`.

---

### 5. Keep the published API surface thin

**Signal:** Adding exports from `src/index.ts` or importing feature modules from outside their layer.

**Response:** Export `initFeedback`, types, and `destroy` contract only; keep session, persistence, recorder, targeting, and builder internal.

**Example:** Host app `import { initFeedback } from 'flag-feedback'` — no `import { buildSelectorPath }`.

**Cost if ignored:** Semver-breaking refactors when internal modules change.

---

### 6. Build package-owned UI from the UI kit inside the Shadow Root

**Signal:** New panel, indicator, or overlay markup.

**Response:** Compose from `src/components/` and kit styles; tokens stay inside the portal boundary.

**Example:** `ModePill` and comment `Input` use kit CSS injected into the shadow root, not global `document` styles.

**Cost if ignored:** Inconsistent widget UX; style leakage violates `docs/constitution.md`, Principle 3.

---

### 7. Treat targeting as active and recording as passive

**Signal:** Implementing click handling in targeting vs recording.

**Response:** Targeting may guide selection and prompts; recording only observes — no click interception or "comment or continue" flows (see `docs/constitution.md`, Hard Boundaries; `requirements/mvp/out-of-scope.md`).

**Example:** Recording uses passive listeners without `preventDefault`; targeting uses its own selection handler separate from the recorder.

**Cost if ignored:** Host app feels broken during recording; deferred scope creeps into MVP.

---

### 8. Route draft persistence through a dedicated module behind the state machine

**Signal:** Saving or restoring comment, targets, interactions, mode, or recording state across reload.

**Response:** Debounced `sessionStorage` writes keyed per `docs/architecture/decisions/data.md`; deserialize on `initFeedback` after validation; clear storage only on successful submit — not on `destroy()` or failed POST.

**Example:** `persistence.save(session.snapshot())` after state transitions; `session.restore(persistence.load())` before binding the activator; US-19 restore re-enters recording and re-attaches recorder listeners.

**Cost if ignored:** Experiment pain returns — recording stops on SPA navigation/reload; users lose drafts on transient submit errors.

---

### 9. Prefer app-shell widget lifetime; rely on persistence when the host re-inits per route

**Signal:** Where the host calls `initFeedback` and `destroy()`.

**Response:** Document that mounting once at the app root avoids unnecessary teardown; when hosts do `destroy()` per route, `sessionStorage` must restore the draft on the next `initFeedback` in the same tab.

**Example:** React host calls `initFeedback` in `App.tsx` layout, not inside every page component — but `SessionRoute.tsx` that destroys on unmount still works if persistence restore is implemented.

**Cost if ignored:** Unnecessary restore bugs and flicker; developers blame the package for host integration choices.

---

## Defensive heuristics

### 10. Fail closed at init; preserve user work on submit failure

**Signal:** Invalid `endpoint`/activator or failed `fetch` POST.

**Response:** Invalid config → no portal, no listeners, `console` error for the host developer. Failed submit → panel open, session and `sessionStorage` draft retained, retry without re-entry (US-16).

**Example:** Missing `endpoint` returns early before `document.body.appendChild(portal)`.

**Cost if ignored:** Half-initialized widget pollutes the host DOM; users lose comments after a 503.

---

### 11. Treat host DOM as unstable; never record or target package-owned nodes

**Signal:** Resolving `event.target`, building selector paths, or handling clicks during targeting/recording.

**Response:** Best-effort paths (5 ancestors); drop events when target is inside the portal shadow tree, mode indicators, or activator; stopping recording must not append an interaction (US-12).

**Example:** `isHostEvent(target)` returns false for `portal.contains(target)` and `activator.contains(target)` before `interactionLog.append()`.

**Cost if ignored:** Self-referential targets (US-10); logs full of feedback-widget noise; agents cannot find host UI bugs.

---

### 12. Hard-stop before reading sensitive host state

**Signal:** `input`, `change`, or value-adjacent handling on host elements.

**Response:** Path and event type only; password and `data-flag-feedback-ignore` emit nothing (see `docs/constitution.md`, Principle 5).

**Example:** Recorder skips `input[type="password"]` before selector resolution.

**Cost if ignored:** `docs/constitution.md`, Principle 5 violation — non-recoverable trust failure.

---

### 13. Prefer meaningful interaction log entries over raw event volume

**Signal:** Appending to `interactions` during recording.

**Response:** Capture schema event types that help agents trace host UI (`click`, `change`, `scroll`, navigation, errors) but coalesce `input` and debounce `scroll`; prefer trusted user events where available; fold consecutive duplicates (see `docs/architecture/decisions/data.md`, Meaningful capture).

**Example:** Typing in a search field produces one coalesced `input` entry per element focus cycle, not twenty entries for twenty keypresses.

**Cost if ignored:** Payloads look active but are useless — agents cannot see which feature the user exercised under the noise.

---

### 14. Separate developer diagnostics from end-user error copy

**Signal:** Init validation errors vs submit HTTP/network failures.

**Response:** `console` for host misconfiguration; inline, non-technical retry in the panel without raw server bodies (US-16).

**Example:** `console.error('flag-feedback: endpoint must be absolute HTTPS')` vs panel text "Could not send feedback. Try again."

**Cost if ignored:** End users see API errors; developers never see misconfiguration in production.

---

### 15. Degrade gracefully when browser APIs are missing or storage fails

**Signal:** `crypto.randomUUID`, `fetch`, Shadow DOM, or `sessionStorage`.

**Response:** Guard with controlled failure or in-memory-only fallback; never throw through to the host app's uncaught error surface (see `docs/constitution.md`, Principle 8).

**Example:** `QuotaExceededError` on draft save logs a warning and continues in-memory without blocking submit.

**Cost if ignored:** One restrictive environment breaks the entire host application.

---

### 17. Design panel UI for small touchscreen viewports

**Signal:** Any new panel control, button, overlay, or layout element.

**Response:** Use a single-column layout with relative units that fits a 320px viewport without horizontal scrolling; size all tappable targets to at least 44×44 CSS pixels; keep the panel height short enough that the host application is partially visible behind it on a typical mobile screen.

**Example:** Category buttons stacked vertically on narrow screens; recording indicator anchored to a corner at a fixed size that does not obscure central host content on small screens.

**Cost if ignored:** `docs/constitution.md` Principle 8 fails — widget is unusable on mobile phones for super users and clients accessing host applications from handheld devices (see `requirements/mvp/user-stories.md`, US-21).

---

### 16. Never POST except on explicit submit to the configured endpoint

**Signal:** Any `fetch` or network call.

**Response:** Exactly one POST on submit to `config.endpoint`; no telemetry, prefetch, or background uploads (see `docs/constitution.md`, Principles 6–7). Direct database access from the package is impossible — host integration patterns live in `docs/architecture/decisions/backend.md`, not here.

**Example:** No health-check POST to the endpoint on `initFeedback`.

**Cost if ignored:** US-04 violation; accidental data exfiltration; false hope that the library can bypass CORS for external DB writes.
