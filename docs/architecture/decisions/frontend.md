# Frontend Architecture Decision

## Decision

The package delivers UI through an **imperative mount API** (`initFeedback`), a **host-owned activator element**, and **overlay UI in a body portal** with an **open Shadow Root**.

- The host developer creates and styles any DOM element as the activator. The package attaches only an activation listener; it does not create, wrap, or style the activator (see `docs/constitution.md`, Principle 2).
- The feedback panel, element-targeting overlays, and mode indicators render inside a dedicated container appended to `document.body`, outside the activator's DOM subtree.
- That container uses an open Shadow Root so panel and indicator styles are encapsulated and do not alter host layout or styles outside the package's own surface (see `docs/constitution.md`, Principle 3).
- Mode indicators (recording and element-targeting pills) are fixed-position overlays within the portal; they occupy a small viewport footprint and do not use full-screen overlays.

Source is **TypeScript**. The published package ships **ESM and UMD** bundles plus **TypeScript declaration files** (`.d.ts`).

## Context

Functional requirements require: an activator placed anywhere in the host DOM with no package-imposed appearance; a package-owned feedback panel; independent element-targeting and recording modes; and panel or indicator UI that hides during active modes without disrupting normal host interaction when modes are off (see `requirements/mvp/user-stories.md`, US-02–US-03, US-09, US-12, US-17–US-18).

The activator and the overlay UI serve different roles. The activator is part of the host application's layout and branding. The panel and mode indicators are transient, floating UI owned entirely by the package. Keeping the activator in host DOM while rendering overlay UI in a body portal matches that separation directly.

The package must work in vanilla JS, React, and Vue host applications without framework-specific bindings (see `requirements/mvp/out-of-scope.md`). An imperative init API with explicit lifecycle teardown integrates cleanly with SPA mount/unmount patterns.

## Alternatives considered

**Custom element (`<flag-feedback>`) with a slotted activator** — Provides declarative HTML integration but wraps the activator in a foreign element, couples activator placement to a custom tag, and adds attribute/property bridging complexity in React hosts. Rejected because the strongest MVP constraint is full host ownership of activator markup and styling.

**Monolithic custom element with package-rendered trigger** — Conflicts with the requirement that the activator carry no package visual identity and sit at a host-chosen DOM position.

**Light DOM panel without Shadow Root** — Simpler to theme but increases risk of style leakage and z-index conflicts with the host application. Rejected in favour of encapsulation required by Principle 3.

## Trade-offs accepted

| Axis | Assessment |
|------|------------|
| **Prompt coherence** | High — `initFeedback({ activator, endpoint, … })` plus portal rendering is unambiguous for agents and host developers. |
| **Failure surface** | Moderate — portal lifecycle and document-level listeners for targeting/recording require disciplined `destroy()` cleanup in SPAs. |
| **Reversibility** | Good — entry API and rendering strategy can change without altering the feedback payload contract. |
| **Operational simplicity** | High — no runtime dependencies; standard library build; no consumer environment variables. |

**Accepted costs:** Host developers must call `initFeedback` in JavaScript (no drop-in HTML tag). The package must implement and document lifecycle teardown. Success feedback after submission may apply a transient state to the activator element (for example an `aria` attribute or removable child node) without imposing default visual styles.

## Consequences

- Phase 4 skeleton exposes `initFeedback` as the primary integration surface and documents activator setup with host-owned markup.
- Panel and indicator styling live inside the portal Shadow Root; theme adaptation is handled within that boundary.
- UI implementation must register and remove document-level listeners when targeting or recording modes activate and deactivate, and must remove the portal container on `destroy()`.
- Framework wrappers remain out of scope; React and Vue hosts call `initFeedback` from their standard mount hooks.
