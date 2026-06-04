# Data Architecture Decision

## Decision

Each widget instance created by `initFeedback` holds **client-side session state** for the current feedback interaction. The session state machine is authoritative in memory; **`sessionStorage` persists in-progress drafts** across full page reloads and across `destroy()` / re-`initFeedback` cycles within the same browser tab (see `requirements/mvp/acceptance-criteria.md`, US-19). **`localStorage` is not used** in the MVP.

**Session model**

`idle → panel → targeting | recording → panel → submitting → idle`

Element-targeting mode and recording mode are independent sub-states (see `docs/functional/glossary.md`).

**Session contents**

| Field           | Description                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Comment text    | Free-form feedback text; truncation limits per `.hatch/deliverables/assets/feedback-package-schema-v2.md`                 |
| Category        | One of `design-request`, `feature-request`, or `bug-fix` (see `.hatch/deliverables/assets/feedback-package-schema-v2.md`) |
| Element targets | Array of `{ path, comment }` entries from element-targeting mode                                                          |
| Interaction log | Append-only array of interaction events from recording mode                                                               |
| Recording start | Timestamp when recording began, or `null` if unused                                                                       |
| Active mode     | Current mode/sub-state needed to restore UI and listeners after reload (see Persistence)                                  |

**Persistence (`sessionStorage`)**

| Aspect              | Choice                                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Storage API         | `sessionStorage` only                                                                                                                  |
| Default key         | `flag-feedback:draft`                                                                                                                  |
| Multiple instances  | Optional `sessionKey` in `initFeedback` config → key `flag-feedback:draft:{sessionKey}` (see `requirements/mvp/architecture.md`)       |
| When written        | Debounced snapshot after session field or mode changes                                                                                 |
| When cleared        | Successful submission only — not on `destroy()` or failed submit                                                                       |
| Restore             | On successful `initFeedback`, deserialize draft if present and re-enter stored mode (re-attach recorder/targeting listeners if needed) |
| Storage unavailable | Degrade to in-memory only; no unhandled errors (see `docs/constitution.md`, Principle 8)                                               |
| Quota exceeded      | Log developer-facing warning; continue in-memory without blocking the widget                                                           |

Draft persistence is **tab-scoped**: closing the tab discards the draft. Cross-tab or cross-device continuity is out of scope.

**Interaction log**

- Events appended passively during recording mode from **host application** activity only.
- Events whose target lies inside the package portal (open Shadow Root), mode indicators, or the activator element are **not** recorded (see `requirements/mvp/acceptance-criteria.md`, US-12).
- Captured events must be **meaningful for downstream AI agents**: enough context to trace which UI the user touched and what they did, without noise that drowns signal (see Meaningful capture below).
- Consecutive identical events (same type and CSS selector path) are **folded** into one entry with a `count` field.
- Password fields and elements marked with `data-flag-feedback-ignore` produce no events (see `docs/constitution.md`, Principle 5; `requirements/mvp/acceptance-criteria.md`, US-12).

**Meaningful capture**

The interaction log is a reconstruction aid for agents processing feedback — not a raw browser event dump. When implementing the recorder:

- Prefer **`event.isTrusted`** user gestures where the platform provides it; do not record synthetic/programmatic duplicates of the same action.
- **`input` events:** coalesce per element (e.g. one logical entry per focus cycle or debounced append) so keystrokes do not inflate the log; never capture values (see `docs/constitution.md`, Principle 5).
- **`scroll` events:** debounce or threshold so minor layout jitter does not flood the log.
- Retain the schema event types (`click`, `input`, `change`, `submit`, `scroll`, `popstate`, `hashchange`, `error`, `unhandledrejection`) — narrowing to clicks-only is not a goal; **signal quality** is.

**Payload assembly**

- Pure **`buildPackage()`** assembles JSON at submit time from session + config metadata.
- Package IDs: `fb_` + **`crypto.randomUUID()`** per submission (new ID each submit; draft restore does not reuse a prior package ID until submit).
- Exactly one POST per submission (see `docs/constitution.md`, Principle 7).
- On successful submission, session resets to idle with cleared fields and **storage is cleared** (see `requirements/mvp/acceptance-criteria.md`, US-16).

**Module boundaries**

| Module                  | Responsibility                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------- |
| Session / state machine | Mode transitions and session field ownership                                       |
| Persistence             | Serialize/deserialize draft to `sessionStorage`; debounced writes; clear on submit |
| Recorder                | Passive listener registration, meaningful event capture, folding, exclusions       |
| Targeting               | Element selection, highlight overlay, selector paths (up to 5 ancestor levels)     |
| Payload builder         | Schema-compliant JSON assembly and field truncation                                |

## Context

The feedback package schema is a versioned contract oriented toward AI agent consumption (see `docs/functional/context.md`, `.hatch/deliverables/assets/feedback-package-schema-v2.md`).

Experiment feedback showed that losing an in-progress recording on SPA navigation or reload blocks real-world use. Preserving drafts in `sessionStorage` is an MVP success criterion (see `requirements/mvp/user-stories.md`, US-19).

Complex mode interactions (panel hide/show, simultaneous mode indicators, submit validation) benefit from explicit state transitions rather than ad-hoc boolean flags.

## Alternatives considered

**In-memory only** — Simplest implementation but loses drafts on reload and when hosts call `destroy()` per route. Rejected for MVP after experiment pain.

**`localStorage`** — Survives tab close; increases privacy surface (drafts persist longer than a session). Rejected; tab-scoped `sessionStorage` matches “same browsing session” without cross-session retention.

**Mutable shared global state across activators** — Complicates multiple activator instances. Rejected; state remains instance-scoped, with optional `sessionKey` for separate storage keys only.

## Trade-offs accepted

| Axis                       | Assessment                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| **Prompt coherence**       | High — session fields map to payload schema; persistence module documents restore behaviour.  |
| **Failure surface**        | Moderate — restore edge cases (corrupt JSON, mode/listener mismatch); quota and private mode. |
| **Reversibility**          | Good — persistence format can evolve behind the persistence module without schema breaks.     |
| **Operational simplicity** | Moderate — debounced writes, restore tests, and clear-on-submit rules required in Phase 6.    |

**Accepted costs:** Implementation and tests for serialize/restore and recording listener re-attachment. Drafts are lost when the user closes the tab. Host developers with multiple widgets on one page should supply distinct `sessionKey` values.

## Consequences

- Phase 6 implements persistence in a dedicated module behind the session state machine; unit-test serialize/restore and corrupt-draft handling.
- Phase 6 implements and tests mode transitions explicitly (e.g. cannot submit without category; targeting clicks only while targeting mode is active).
- Recorder tests cover portal/activator exclusion, folding, and meaningful coalescing behaviour.
- Payload builder remains a pure function, unit-testable against the schema document.
- Host integration for submission endpoints remains in `docs/architecture/decisions/backend.md` — the package does not bypass browser security for direct database writes.
