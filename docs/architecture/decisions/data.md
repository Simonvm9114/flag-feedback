# Data Architecture Decision

## Decision

Each widget instance created by `initFeedback` holds **client-side, in-memory session state** for the current feedback interaction. MVP persistence is session-only — no `sessionStorage` or `localStorage` (see Alternatives considered).

**Session model**

`idle → panel → targeting | recording → panel → submitting → idle`

Element-targeting mode and recording mode are independent sub-states (see `docs/functional/glossary.md`).

**Session contents**

| Field | Description |
|-------|-------------|
| Comment text | Free-form feedback text, truncated to 10,000 characters before submission |
| Category | One of `design-request`, `feature-request`, or `bug-fix` (see `.hatch/deliverables/assets/feedback-package-schema-v2.md`) |
| Element targets | Array of `{ path, comment }` entries from element-targeting mode |
| Interaction log | Append-only array of interaction events from recording mode |
| Recording start | Timestamp when recording began, or `null` if unused |

**Interaction log**

- Events appended passively during recording mode.
- Consecutive identical events (same type and CSS selector path) are **folded** into one entry with a `count` field.
- Password fields and elements marked with `data-flag-feedback-ignore` produce no events (see `requirements/mvp/acceptance-criteria.md`, US-12).

**Payload assembly**

- Pure **`buildPackage()`** assembles JSON at submit time from session + config metadata.
- Package IDs: `fb_` + **`crypto.randomUUID()`**.
- Exactly one POST per submission (see `docs/constitution.md`, Principle 7).
- On successful submission, session resets to idle with cleared fields (see `requirements/mvp/acceptance-criteria.md`, US-16).

**Module boundaries**

| Module | Responsibility |
|--------|----------------|
| Session / state machine | Mode transitions and session field ownership |
| Recorder | Passive listener registration, event capture, folding |
| Targeting | Element selection, highlight overlay, selector paths (up to 5 ancestor levels) |
| Payload builder | Schema-compliant JSON assembly and field truncation |

## Context

The feedback package schema is a versioned contract oriented toward AI agent consumption (see `docs/functional/context.md`, `.hatch/deliverables/assets/feedback-package-schema-v2.md`).

Complex mode interactions (panel hide/show, simultaneous mode indicators, submit validation) benefit from explicit state transitions rather than ad-hoc boolean flags.

## Alternatives considered

**sessionStorage draft persistence** — Preserves in-progress feedback across navigation. Not required by MVP user stories; adds restoration edge cases. Deferred from MVP.

**Mutable shared global state** — Complicates multiple activator instances and SPA lifecycle. Rejected; state is instance-scoped per `initFeedback` call.

## Trade-offs accepted

| Axis | Assessment |
|------|------------|
| **Prompt coherence** | High — session fields map to payload schema; state machine documents valid mode sequences. |
| **Failure surface** | Low–moderate — in-memory only; lost on refresh. Listener cleanup handled by `destroy()`. |
| **Reversibility** | Good — persistence or ID strategy can be added later without breaking the payload contract. |
| **Operational simplicity** | High — no sync or cache invalidation in MVP. |

**Accepted costs:** Unsaved feedback is lost on refresh or tab close. State machine requires upfront design before UI work.

## Consequences

- Phase 6 implements and tests mode transitions explicitly (e.g. cannot submit without category; targeting clicks only while targeting mode is active).
- Payload builder is a pure function, unit-testable against the schema document.
- Draft persistence later is additive behind the session module, not a schema break.
