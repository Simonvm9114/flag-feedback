# Batch 1 — Acceptance Criteria

Host integration foundation (US-01, US-02, US-03, US-04, US-05). Criteria are evaluated against the running package integrated into a host application.

---

## [US-01] Install the package

- [ ] Running `npm install flag-feedback` in a clean Node environment succeeds without errors.
- [ ] The package's entry point can be imported in a vanilla JS application without errors.
- [ ] The package can be imported in a React application without runtime errors.
- [ ] The package can be imported in a Vue application without runtime errors.
- [ ] The package has zero production runtime dependencies on third-party libraries.

**Relevant constraints:** `docs/architecture/decisions/backend.md` (ESM/UMD, zero runtime deps), `requirements/mvp/architecture.md` (package identity), `docs/architecture/decisions/formal-checks.md`, `docs/architecture/decisions/design-principles.md` (principle 1)

---

## [US-02] Place the activator

- [ ] The activator component can be placed inside a `<nav>`, a `<header>`, a `<sidebar>`, a `<div>`, or any other standard HTML container element without causing a layout error.
- [ ] The activator renders at the position in the DOM where the host developer placed it — it does not reposition itself to a fixed corner of the viewport.
- [ ] Placing two activator instances in the DOM simultaneously does not cause JavaScript errors.

**Relevant constraints:** `docs/architecture/decisions/frontend.md` (host-owned activator, portal separate from activator DOM), `docs/architecture/decisions/design-principles.md` (principle 1)

---

## [US-03] Style the activator freely

- [ ] The activator element has no default background colour, border, padding, margin, font size, or dimensions applied by the package's stylesheet.
- [ ] CSS rules targeting the activator's container element in the host application's stylesheet fully control the activator's appearance.
- [ ] Inspecting the activator in browser DevTools shows no package-injected inline styles on the activator element.

**Relevant constraints:** `docs/architecture/decisions/frontend.md` (no package styles on activator), `docs/constitution.md` (Principle 2), `docs/architecture/decisions/design-principles.md` (principle 1)

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

**Relevant constraints:** `docs/architecture/decisions/backend.md` (endpoint validation, `fetch` POST, host integration patterns), `docs/constitution.md` (Principles 6–7), `requirements/mvp/implementation-heuristics.md` (heuristic 16), `docs/architecture/decisions/design-principles.md` (principles 1, 3, 5, 6)

---

## [US-05] Pass application metadata

- [ ] The host developer can optionally supply `appId`, `gitCommit`, and `gitRepo` in the `initFeedback` configuration object.
- [ ] When all three are supplied, the submitted feedback package includes them under an `app` key with fields `id`, `gitCommit`, and `gitRepo`.
- [ ] When none are supplied, the package initializes and operates without error; the `app` fields are absent or null in the submitted payload.
- [ ] Supplying a subset (e.g. only `appId`) does not cause an error; only the supplied fields appear in the payload.

**Relevant constraints:** `docs/architecture/decisions/backend.md` (config shape), `docs/architecture/decisions/data.md` (payload builder), `.hatch/deliverables/assets/feedback-package-schema-v2.md`, `docs/architecture/decisions/design-principles.md` (principles 1, 2)
