# Architecture Vision

Target system shape beyond the MVP. MVP implementation constraints live in `requirements/mvp/architecture.md`.

---

## Target state

The **flag-feedback** package remains a **framework-agnostic, zero-runtime-dependency** browser library. Host developers own branding (activator), access control, and the feedback receiver. The package continues to own the feedback UX (panel, targeting, recording) and the **versioned feedback package contract** optimized for AI agent consumption (see `docs/functional/context.md`).

Core shape is stable: `initFeedback` → in-browser session → single POST to a host-configured endpoint. Shadow DOM encapsulation for overlay UI remains the default pattern for style isolation.

---

## Evolution signals

| Area | Direction |
|------|-----------|
| **Distribution** | npm remains primary; optional CDN consumption via registry mirrors |
| **Testing** | Add browser E2E (e.g. Playwright) when manual AC verification becomes a bottleneck |
| **Persistence** | Optional draft persistence (`sessionStorage` or similar) behind the session module — additive, not a schema break |
| **Framework ergonomics** | React/Vue/Svelte wrappers as separate packages or exports — deferred from MVP |
| **Recording UX** | Comment-or-continue click interception during recording — explicitly deferred |
| **Payload** | Schema changes are breaking; extensions require version bumps and migration notes |

---

## MVP vs vision

| Deferred | Constraint |
|----------|------------|
| Framework bindings | See `requirements/mvp/out-of-scope.md` — vanilla `initFeedback` only |
| Package auth | See `docs/constitution.md`, Hard Boundaries — host responsibility |
| In-repo backend | See `requirements/mvp/out-of-scope.md` |
| E2E in CI | See `docs/architecture/decisions/testing.md` |
| Demo site | See `docs/architecture/decisions/hosting.md` |
| Screenshots | See `requirements/mvp/out-of-scope.md` |
| sessionStorage drafts | See `docs/architecture/decisions/data.md` |

The MVP is a **complete v2 rewrite** of the experiment (`legacy/v1`), not an incremental feature on v1.x internals.
