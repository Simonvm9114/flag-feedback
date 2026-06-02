# Architecture Overview

`flag-feedback` is a **client-side npm library** that host applications import to collect structured, element-level feedback. The library POSTs a single JSON **feedback package** to a URL the host developer configures (see `docs/constitution.md`, Principles 6–7). There is no server, database, or runtime third-party integration inside the package (see `docs/constitution.md`, Hard Boundaries; Principle 1).

---

## System shape

```text
Host application
├── Host-owned activator (DOM + CSS)
├── initFeedback({ activator, endpoint, ... })
└── Host backend ←── POST feedback package (fetch)

flag-feedback package (browser)
├── Integration API (initFeedback / destroy)
├── Session state machine + in-memory session
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
| **Portal UI**               | Renders panel and indicators in an open Shadow Root; does not style the activator                          |
| **Targeting**               | Element-targeting mode, highlights, CSS selector paths (up to 5 ancestors)                                 |
| **Recorder**                | Recording mode, event capture, folding, exclusions                                                         |
| **Payload builder**         | Assembles schema-compliant JSON at submit time                                                             |

---

## Data flow

1. Widget user activates the host-placed **activator** → feedback **panel** opens.
2. User may add comment, category, element targets, and/or a recording session (modes are independent).
3. On submit, `buildPackage()` produces one JSON payload; **`fetch` POST** to `endpoint`.
4. On success, session resets; on failure, panel stays open with retry.

No persistence across page reloads in the MVP (see `docs/architecture/decisions/data.md`).

---

## Access control

Not implemented in the package — the host application controls activator visibility and endpoint protection (see `docs/constitution.md`, Hard Boundaries; `requirements/mvp/out-of-scope.md`).

---

## Third-party services

| Service    | Use                                     |
| ---------- | --------------------------------------- |
| **npm**    | Publish ESM/UMD + types for consumers   |
| **GitHub** | Source control and GitHub Actions CI/CD |

No runtime integrations (analytics, email, storage, auth providers) in the library.

---

## Build, quality, and release

| Layer       | Stack                                           |
| ----------- | ----------------------------------------------- |
| **Source**  | TypeScript                                      |
| **Build**   | Vite library mode                               |
| **Checks**  | ESLint, Prettier, `tsc --strict`                |
| **Tests**   | Vitest + happy-dom (unit + component/DOM)       |
| **CI**      | GitHub Actions: lint → typecheck → test → build |
| **Release** | Semver git tag → `npm publish` (`latest` only)  |

Details: `docs/architecture/decisions/` and `requirements/mvp/architecture.md`.

---

## Related documents

| Document                                                   | Purpose                                |
| ---------------------------------------------------------- | -------------------------------------- |
| `docs/architecture/decisions/`                             | Per-dimension decisions and trade-offs |
| `docs/architecture/vision.md`                              | Target architecture beyond MVP         |
| `requirements/mvp/architecture.md`                         | MVP implementation specification       |
| `.hatch/deliverables/assets/feedback-package-schema-v2.md` | Payload contract                       |
