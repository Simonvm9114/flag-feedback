# Architecture Overview

`flag-feedback` is a **client-side npm library** that host applications import to collect structured, element-level feedback. The library POSTs a single JSON **feedback package** (see `docs/functional/glossary.md`) to a URL the host developer configures (see `docs/constitution.md`, Principles 6–7). There is no server, database, or runtime third-party integration inside the package (see `docs/constitution.md`, Hard Boundaries; Principle 1).

---

## System shape

```text
Host application
├── Host-owned activator (DOM + CSS)
├── initFeedback({ activator, endpoint, ... })
└── Host backend ←── POST feedback package (fetch)

flag-feedback package (browser)
├── Integration API (initFeedback / destroy)
├── Session state machine + sessionStorage draft persistence
├── Portal UI (Shadow Root on document.body)
│   ├── Feedback panel
│   ├── Element-targeting overlays
│   └── Mode indicators (recording / targeting)
├── Recorder (passive interaction capture)
├── Targeting (element selection + selector paths)
└── Payload builder → JSON schema v2
```

---

## Components

| Component                   | Role                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Integration API**         | `initFeedback` validates config, binds activator, creates portal; `destroy()` tears down listeners and DOM |
| **Session / state machine** | Owns feedback session fields and mode transitions                                                          |
| **Persistence**             | Debounced `sessionStorage` draft save/restore; clear on successful submit (see `docs/architecture/decisions/data.md`) |
| **Portal UI**               | Renders panel and indicators in an open Shadow Root; does not style the activator                          |
| **Targeting**               | Element-targeting mode, highlights, CSS selector paths (see `docs/functional/glossary.md`, CSS selector path) |
| **Recorder**                | Recording mode, meaningful event capture, folding, exclusions (see `docs/architecture/decisions/data.md`)   |
| **Payload builder**         | Assembles schema-compliant JSON at submit time                                                             |

---

## Data flow

1. Widget user activates the host-placed **activator** → feedback **panel** opens.
2. User may add comment, category, element targets, and/or a recording session (modes are independent).
3. On submit, `buildPackage()` produces one JSON payload; **`fetch` POST** to `endpoint`.
4. On success, session resets and the draft is cleared; on failure, panel stays open with retry and the draft remains (see `docs/architecture/decisions/data.md`).

In-progress drafts (including an active recording session) persist across reload and `destroy()` / re-init within the same tab (see `docs/architecture/decisions/data.md`; `requirements/mvp/acceptance-criteria.md`, US-19).

---

## Access control

Not implemented in the package — the host application controls activator visibility and endpoint protection (see `docs/constitution.md`, Hard Boundaries; `requirements/mvp/out-of-scope.md`).

---

## Third-party services

| Service    | Use                                     |
| ---------- | --------------------------------------- |
| **npm**    | Publish ESM/UMD + types for consumers   |
| **GitHub** | Source control and GitHub Actions CI/CD |

No runtime integrations (analytics, email, storage, auth providers) in the library (see `docs/constitution.md`, Principle 1).

---

## Build, quality, and release

| Layer       | Stack                                           |
| ----------- | ----------------------------------------------- |
| **Source**  | TypeScript                                      |
| **Build**   | Vite library mode                               |
| **Checks**  | See `docs/architecture/decisions/formal-checks.md`                            |
| **Tests**   | See `docs/architecture/decisions/testing.md`                                  |
| **CI**      | See `docs/architecture/decisions/hosting.md`                                  |
| **Release** | See `docs/architecture/decisions/hosting.md`, `version-control.md`            |

Details: `docs/architecture/decisions/` and `requirements/mvp/architecture.md`.

---

## Related documents

| Document                                                   | Purpose                                |
| ---------------------------------------------------------- | -------------------------------------- |
| `docs/architecture/decisions/`                             | Per-dimension decisions and trade-offs |
| `docs/architecture/decisions/design-principles.md`        | Structural constraints (Phase 6+)      |
| `docs/architecture/vision.md`                              | Target architecture beyond MVP         |
| `requirements/mvp/architecture.md`                         | MVP implementation specification       |
| `.hatch/deliverables/assets/feedback-package-schema-v2.md` | Payload contract                       |
