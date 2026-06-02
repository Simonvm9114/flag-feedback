# MVP — Acceptance Criteria

Each section corresponds to a user story in `requirements/mvp/user-stories.md`. Criteria are evaluated against the running package integrated into a host application.

---

## [US-01] Install the package

- [ ] Running `npm install flag-feedback` in a clean Node environment succeeds without errors.
- [ ] The package's entry point can be imported in a vanilla JS application without errors.
- [ ] The package can be imported in a React application without runtime errors.
- [ ] The package can be imported in a Vue application without runtime errors.
- [ ] The package has zero production runtime dependencies on third-party libraries.

**Relevant constraints:** `docs/architecture/decisions/backend.md` (ESM/UMD, zero runtime deps), `requirements/mvp/architecture.md` (package identity), `docs/architecture/decisions/formal-checks.md`

---

## [US-02] Place the activator

- [ ] The activator component can be placed inside a `<nav>`, a `<header>`, a `<sidebar>`, a `<div>`, or any other standard HTML container element without causing a layout error.
- [ ] The activator renders at the position in the DOM where the host developer placed it — it does not reposition itself to a fixed corner of the viewport.
- [ ] Placing two activator instances in the DOM simultaneously does not cause JavaScript errors.

**Relevant constraints:** `docs/architecture/decisions/frontend.md` (host-owned activator, portal separate from activator DOM)

---

## [US-03] Style the activator freely

- [ ] The activator element has no default background colour, border, padding, margin, font size, or dimensions applied by the package's stylesheet.
- [ ] CSS rules targeting the activator's container element in the host application's stylesheet fully control the activator's appearance.
- [ ] Inspecting the activator in browser DevTools shows no package-injected inline styles on the activator element.

**Relevant constraints:** `docs/architecture/decisions/frontend.md` (no package styles on activator), `docs/constitution.md` (Principle 2)

---

## [US-04] Configure the submission endpoint

- [ ] The host developer can specify an endpoint URL in the `initFeedback` configuration object.
- [ ] On submission, the package sends exactly one HTTP POST request to the configured URL.
- [ ] No HTTP request is made to any URL other than the configured endpoint at any point during the widget's lifecycle.
- [ ] If the endpoint is absent or empty, `initFeedback` does not initialize the widget and logs a developer-facing error to the browser console.
- [ ] A relative URL (e.g. `/api/feedback`) is rejected: `initFeedback` does not initialize the widget and logs a developer-facing error.
- [ ] An `http://` URL that is not `localhost` or `127.x.x.x` is rejected: `initFeedback` does not initialize the widget and logs a developer-facing error.
- [ ] An `https://` URL is accepted.
- [ ] `http://localhost/...` and `http://127.0.0.1/...` URLs are accepted.

**Relevant constraints:** `docs/architecture/decisions/backend.md` (endpoint validation, `fetch` POST), `docs/constitution.md` (Principles 6–7)

---

## [US-05] Pass application metadata

- [ ] The host developer can optionally supply `appId`, `gitCommit`, and `gitRepo` in the `initFeedback` configuration object.
- [ ] When all three are supplied, the submitted feedback package includes them under an `app` key with fields `id`, `gitCommit`, and `gitRepo`.
- [ ] When none are supplied, the package initializes and operates without error; the `app` fields are absent or null in the submitted payload.
- [ ] Supplying a subset (e.g. only `appId`) does not cause an error; only the supplied fields appear in the payload.

**Relevant constraints:** `docs/architecture/decisions/backend.md` (config shape), `docs/architecture/decisions/data.md` (payload builder), `.hatch/deliverables/assets/feedback-package-schema-v2.md`

---

## [US-06] Open the feedback panel

- [ ] Clicking (or otherwise activating) the activator element opens the feedback panel.
- [ ] The feedback panel contains: a text area for the comment, a category selector with exactly three options (Design request, Feature request, Bug fix), a control for activating element-targeting mode, a control for starting a recording session, and a submit button.
- [ ] The host application remains fully interactive behind the feedback panel (e.g. links work, inputs accept focus).
- [ ] The feedback panel can be closed without submitting.

**Relevant constraints:** `docs/architecture/decisions/frontend.md` (panel in Shadow Root portal), `docs/architecture/decisions/data.md` (state machine)

---

## [US-07] Write a comment

- [ ] The feedback panel contains a text area that accepts free-form text input.
- [ ] Text typed into the comment field is included in the submitted feedback package under `feedback.text`.
- [ ] Text exceeding 10,000 characters is truncated to 10,000 characters before submission; no error is thrown.

**Relevant constraints:** `docs/architecture/decisions/data.md` (session fields, truncation), `requirements/mvp/architecture.md`

---

## [US-08] Select a feedback category

- [ ] The category selector presents exactly three options: "Design request", "Feature request", and "Bug fix".
- [ ] No category is pre-selected when the feedback panel opens.
- [ ] Attempting to submit without selecting a category is blocked; an inline error message is displayed.
- [ ] The selected category value is included in the submitted feedback package under `feedback.category`.

**Relevant constraints:** `docs/architecture/decisions/data.md` (state machine, required category), `.hatch/deliverables/assets/feedback-package-schema-v2.md`

---

## [US-09] Activate element-targeting mode

- [ ] The feedback panel contains a clearly labelled control for activating element-targeting mode.
- [ ] Activating element-targeting mode hides or minimises the feedback panel so that the full application UI is visible.
- [ ] A recording indicator (pill or badge) is visible while element-targeting mode is active, showing that the mode is on.
- [ ] Element-targeting mode can be activated independently of whether a recording session is active.
- [ ] Deactivating element-targeting mode without selecting any element returns the user to the feedback panel with no error.

**Relevant constraints:** `docs/architecture/decisions/frontend.md` (mode indicators), `docs/architecture/decisions/data.md` (independent modes, state machine)

---

## [US-10] Select a UI element and attach a comment

- [ ] While element-targeting mode is active, clicking any element in the host application opens a prompt for the user to write a comment on that element.
- [ ] The selected element is visually highlighted (e.g. with an outline or overlay) while the prompt is open.
- [ ] The user can confirm the element comment (adding the element target to the session) or cancel (returning to element-targeting mode without adding the target).
- [ ] After confirming an element comment, the user remains in element-targeting mode and can select another element.
- [ ] The element target recorded in the feedback package includes the element's CSS selector path (up to 5 ancestor levels) and the user's comment for that element.
- [ ] Clicking the activator element itself while in element-targeting mode does not create a self-referential element target.

**Relevant constraints:** `docs/architecture/decisions/data.md` (targeting module, selector paths), `docs/architecture/decisions/frontend.md` (document-level listeners), `docs/functional/glossary.md` (element target)

---

## [US-11] Target multiple elements in one session

- [ ] After confirming a comment on one element, the user can select and comment on additional elements without leaving element-targeting mode.
- [ ] The feedback panel indicator (shown when element-targeting mode is active) displays the current count of element targets added in the session.
- [ ] All element targets are included in the submitted feedback package as an array under `elementTargets`.
- [ ] Submitting with three or more element targets works without error.

**Relevant constraints:** `docs/architecture/decisions/data.md` (session `elementTargets`, payload builder), `.hatch/deliverables/assets/feedback-package-schema-v2.md`

---

## [US-12] Start a recording session

- [ ] The feedback panel contains a clearly labelled "Start recording" control.
- [ ] Activating recording hides the feedback panel and shows a recording indicator in the host application.
- [ ] The recording indicator is visible during the recording session without substantially obstructing the host application's UI.
- [ ] While recording, the package captures click events with the target element's CSS selector path.
- [ ] While recording, the package captures scroll events with the scroll position as a percentage of scrollable height.
- [ ] While recording, the package captures input and change events with the element's CSS selector path only — no field values are captured.
- [ ] While recording, the package captures form submit events with the form's CSS selector path.
- [ ] While recording, the package captures navigation events (popstate, hashchange).
- [ ] While recording, the package captures unhandled JavaScript errors and promise rejections with their message (truncated to 200 characters).
- [ ] Password fields (`input[type="password"]`) are excluded from recording — no interaction event is emitted for them.
- [ ] Elements with `data-flag-feedback-ignore` (or an equivalent attribute) are excluded from recording.
- [ ] Consecutive identical events (same type and same element path) are collapsed into a single entry with a `count` field.

**Relevant constraints:** `docs/architecture/decisions/data.md` (recorder module, folding, exclusions), `docs/constitution.md` (Principle 5), `docs/architecture/decisions/frontend.md` (panel hides during recording)

---

## [US-13] Stop recording and return to the feedback panel

- [ ] The user can tap or click the recording indicator to stop recording.
- [ ] Stopping recording reopens the feedback panel.
- [ ] The feedback panel displays the count of interactions captured (e.g. "12 interactions recorded").
- [ ] The user can discard the recording via an explicit control, resetting the interaction count to zero.
- [ ] After discarding, the user can start a new recording session from the feedback panel.

**Relevant constraints:** `docs/architecture/decisions/data.md` (state machine, interaction log), `docs/architecture/decisions/frontend.md` (recording indicator)

---

## [US-14] Submit a combined feedback package

- [ ] A feedback package containing a comment, a category, at least one element target, and a non-empty interaction log can be submitted without error.
- [ ] The submitted JSON payload includes all four components: `feedback.text`, `feedback.category`, `elementTargets` (array), and `interactions` (array).
- [ ] Exactly one HTTP POST request is made to the configured endpoint for the submission.
- [ ] The submitted payload matches the feedback package schema (see `docs/functional/context.md` for schema description).

**Relevant constraints:** `docs/architecture/decisions/data.md` (`buildPackage()`), `docs/architecture/decisions/backend.md` (single POST), `.hatch/deliverables/assets/feedback-package-schema-v2.md`, `docs/constitution.md` (Principle 7)

---

## [US-15] Submit general feedback without element targets or recording

- [ ] A feedback package containing only a comment and a category (no element targets, no interactions) can be submitted without error.
- [ ] The submitted JSON includes `elementTargets: []` and `interactions: []`.
- [ ] No error or warning is shown to the user when submitting without element targets or recording.

**Relevant constraints:** `docs/architecture/decisions/data.md` (payload builder, empty arrays), `.hatch/deliverables/assets/feedback-package-schema-v2.md`

---

## [US-16] Receive submission confirmation

- [ ] On a successful submission (HTTP 2xx response from the configured endpoint), the feedback panel closes and the activator shows a brief success indicator (e.g. a checkmark) for approximately 2 seconds.
- [ ] After successful submission, all session state is reset: the comment field is cleared, no category is selected, element targets are cleared, and the interaction log is cleared.
- [ ] On a failed submission (non-2xx HTTP response or network error), the feedback panel remains open and an inline error message is shown.
- [ ] The inline error message includes a way to retry submission without re-entering feedback.
- [ ] The error message does not expose raw server error details to the user.

**Relevant constraints:** `docs/architecture/decisions/data.md` (session reset), `docs/architecture/decisions/backend.md` (`fetch` response handling), `docs/architecture/decisions/frontend.md` (transient activator success state)

---

## [US-17] Panel hides during recording

- [ ] Starting a recording session causes the feedback panel to become not visible.
- [ ] The host application is fully interactive during a recording session.
- [ ] The recording indicator does not cover more than a small, fixed area of the viewport (it is not a full-screen overlay).

**Relevant constraints:** `docs/architecture/decisions/frontend.md` (panel hide, fixed-position indicator), `docs/architecture/decisions/data.md` (recording sub-state)

---

## [US-18] Application interaction is unaffected outside active modes

- [ ] On page load, element-targeting mode is not active; clicks in the host application are not intercepted.
- [ ] On page load, recording mode is not active; interactions in the host application are not captured.
- [ ] After the feedback panel is closed (without activating either mode), the host application behaves as if the package were not present.
- [ ] No global event listeners added by the package emit errors or side effects during normal application use.

**Relevant constraints:** `docs/architecture/decisions/frontend.md` (`destroy()` cleanup, listener registration), `docs/architecture/decisions/data.md` (default idle state, mode-gated listeners), `docs/constitution.md` (Principle 4)
