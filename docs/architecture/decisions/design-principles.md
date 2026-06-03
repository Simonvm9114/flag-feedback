# Design Principles

## Decision

The `flag-feedback` MVP is governed by **six structural design principles**. Each principle is stated as a constraint on what the system does not do, which layers do not depend on which others, and which module owns which concern. Phase 6 implementation must respect these constraints; `requirements/mvp/implementation-heuristics.md` describes how they manifest in specific coding situations without restating them here.

Principles are named after established system design concepts where applicable. They are durable across feature rewrites and portable to future embeddable-library work.

---

## Context

`flag-feedback` is a **client-side embeddable library** with a thin public surface (`initFeedback` / `destroy`), an internal **session state machine**, mode-specific capabilities (targeting, recording), a **portal UI** in an open Shadow Root, a **persistence adapter** for `sessionStorage` drafts (US-19), and a single **payload assembly** path to a versioned JSON contract (see `docs/architecture.md`, `docs/architecture/decisions/data.md`).

The library runs inside a **host bounded context** it does not control. Structural failures (listener leaks, schema drift, privacy violations, half-initialized widgets) are more costly than feature bugs because they break host applications and the feedback contract simultaneously.

---

## Alternatives considered

**A single undifferentiated “best practices” list** — Merges structural constraints with coding tips. Rejected: heuristics and principles serve different lifecycles (temporary vs permanent) and audiences (situation-specific signals vs system shape).

**Many fine-grained principles (one per heuristic)** — Maximises checklist coverage. Rejected after dialogue: duplicates the heuristic document and overwhelms human review without adding falsifiable structure.

**Abstract principles only (no module names)** — Portable but not actionable for Phase 6 agents. Rejected: each principle must anchor to actual modules and integration points in this repository.

---

## Trade-offs accepted

| Axis                 | Assessment                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Prompt coherence** | High — six constraints map cleanly to session, portal, recorder, targeting, persistence, payload builder, and integration API. |
| **Failure surface**  | Low if principles are followed — violations are detectable (e.g. export of internal module, POST outside submit).              |
| **Reversibility**    | Good — internal refactors preserve principles; changing principles requires explicit architecture revision.                    |
| **Document size**    | Moderate — principles are folded; detail lives in ADRs, schema, and implementation heuristics.                                 |

**Accepted costs:** Agents must read `design-principles.md` together with `implementation-heuristics.md` and relevant ADRs. Some overlap in topic area is intentional; overlap in prose is not.

---

## Consequences

The following principles are active from Phase 6 onward.

### 1. Bounded context isolation (guest library)

**Constraint:** The package runtime bounded context **does not implement** host-application concerns: user identity, routing, server-side storage, activator presentation, or access control. The host bounded context **does not depend on** package internal modules.

**Grounding:** Host developers own the `activator` element and `endpoint` URL (see `docs/architecture/decisions/backend.md`, Host integration patterns). The package owns the portal, session, and POST of the feedback package only (see `docs/constitution.md`, Hard Boundaries). Public exports are limited to the integration API (see `requirements/mvp/implementation-heuristics.md`, heuristic 5).

**Structural cost of violation:** The library becomes a partial application framework; hosts cannot embed without adopting package assumptions; internal refactors break consumers.

---

### 2. Finite state machine authority and single source of truth

**Constraint:** All feedback session fields and mode behaviour are owned **exclusively** by the **session / state machine** module. UI, persistence, and wire format are **derived projections** of that model — not parallel sources of truth. No valid observable state exists outside the defined transitions (`idle → panel → targeting | recording → panel → submitting → idle`).

**Grounding:** Session holds comment, category, element targets, interaction log, recording start, and active mode (see `docs/architecture/decisions/data.md`). The panel and mode indicators request transitions; they do not store authoritative copies. `buildPackage()` reads session once at submit (see `docs/architecture/decisions/data.md`, Payload assembly).

**Structural cost of violation:** Illegal mode combinations ship; US-19 restore cannot reattach listeners; UI validation and submit path disagree; AI consumers receive inconsistent payloads.

---

### 3. Capability-based activation (principle of least privilege)

**Constraint:** Privileged effects on the host environment — **document-level listeners**, **interaction capture**, **element selection**, and **network egress** — are **unavailable** unless the state machine explicitly grants the capability for the current mode. Idle and panel-only states impose **no** host instrumentation and **no** HTTP requests.

**Grounding:** Recorder and targeting register listeners on mode entry and remove them on mode exit and `destroy()` (see `docs/architecture/decisions/frontend.md`, Consequences). Submission performs exactly one `fetch` POST on user submit (see `docs/constitution.md`, Principles 6–7). Recording does not call `preventDefault` or intercept clicks (see `docs/constitution.md`, Hard Boundaries).

**Structural cost of violation:** US-18 fails; SPA routes accumulate duplicate handlers; recording becomes host-flow hijack; unconfigured egress violates constitution.

---

### 4. Anti-corruption layer and trust-boundary data minimization

**Constraint:** Host-supplied inputs (DOM events, elements, configuration) pass through a **translation boundary** before entering session state or the versioned wire contract. **Structural metadata** (selector paths, event types, timestamps) may cross inward and outward; **host field values**, **password fields**, and **package-owned DOM** (portal, indicators, activator) **do not** cross into the interaction log or payload as captured content.

**Grounding:** Recorder and targeting reject events whose target lies in the portal or on the activator (see `requirements/mvp/acceptance-criteria.md`, US-12). Selector paths, folding, coalescing, and category mapping occur in recorder and `buildPackage()` only (see `docs/architecture/decisions/data.md`, Meaningful capture; `.hatch/deliverables/assets/feedback-package-schema-v2.md`). Password and `data-flag-feedback-ignore` exclusions enforce Principle 5 at the capture boundary.

**Structural cost of violation:** Feedback packages document the widget instead of the host product; AI agents cannot locate defects; constitutional privacy boundaries fail irreversibly.

---

### 5. Ports and adapters: persistence and integration at the edge

**Constraint:** **Policy** (when to save, when to clear, what constitutes a valid draft, restore rules) lives in **session**. **Mechanism** (serialization to `sessionStorage`, debounced writes, `fetch` transport) lives in **adapters** that do not define business rules. `sessionStorage` holds a **mirror** of session state; it is not authoritative. Draft clear occurs only on **successful** submit, not on `destroy()` or failed POST (see US-19, US-16).

**Grounding:** Persistence module behind the state machine (see `docs/architecture/decisions/data.md`, Persistence). Optional `sessionKey` for multiple instances (see `docs/functional/glossary.md`, initFeedback). Server-side databases and shared stores are reached only via host-configured endpoints — not client secrets (see `docs/architecture/decisions/backend.md`, Host integration patterns).

**Structural cost of violation:** Draft format and session diverge; corrupt restore leaves undefined modes; developers embed API keys in `initFeedback`; US-19 experiment pain returns.

---

### 6. Fail-closed composition and fault containment

**Constraint:** **Invalid `initFeedback` configuration** produces **zero** host-visible footprint: no portal, no listeners, no partial widget. **Runtime faults** inside the package (missing browser APIs, storage quota, submit failure) are **contained** — degrade or warn without uncaught exceptions propagating to the host application. Developer diagnostics use `console`; end-user submit errors use non-technical inline copy (see US-16).

**Grounding:** Endpoint and activator validation before DOM mutation (see `docs/architecture/decisions/backend.md`). Principle 8 degradation for storage and APIs (see `docs/architecture/decisions/data.md`). Failed submit retains session and `sessionStorage` draft for retry.

**Structural cost of violation:** Misconfigured production hosts run zombie listeners or broken half-widgets; one browser quirk crashes the host SPA; users lose drafts on transient 503 errors.

---

## Related documents

| Document                                        | Role                                                     |
| ----------------------------------------------- | -------------------------------------------------------- |
| `requirements/mvp/implementation-heuristics.md` | Situation-specific build signals; maps to principles 1–6 |
| `docs/architecture/decisions/data.md`           | Session model, persistence, meaningful capture           |
| `docs/architecture/decisions/frontend.md`       | Portal, activator separation, listener lifecycle         |
| `docs/architecture/decisions/backend.md`        | Integration API, endpoint rules, host integration        |
| `docs/constitution.md`                          | Non-negotiable boundaries principles must not contradict |
