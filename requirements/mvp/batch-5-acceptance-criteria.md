# Batch 5 — Acceptance Criteria

Submission (US-14, US-15, US-16). Criteria are evaluated against the running package integrated into a host application.

---

## [US-14] Submit a combined feedback package

- [ ] A feedback package containing a comment, a category, at least one element target, and a non-empty interaction log can be submitted without error.
- [ ] The submitted JSON payload includes all four components: `feedback.text`, `feedback.category`, `elementTargets` (array), and `interactions` (array).
- [ ] Exactly one HTTP POST request is made to the configured endpoint for the submission.
- [ ] The submitted payload matches the feedback package schema (see `docs/functional/context.md` for schema description).

**Relevant constraints:** `docs/architecture/decisions/data.md` (`buildPackage()`), `docs/architecture/decisions/backend.md` (single POST), `.hatch/deliverables/assets/feedback-package-schema-v2.md`, `docs/constitution.md` (Principle 7), `requirements/mvp/implementation-heuristics.md` (heuristics 4, 16), `docs/architecture/decisions/design-principles.md` (principles 2, 3, 4), UI kit components (`src/components/`, `src/ui/` — all package-owned UI must use kit components)

---

## [US-15] Submit general feedback without element targets or recording

- [ ] A feedback package containing only a comment and a category (no element targets, no interactions) can be submitted without error.
- [ ] The submitted JSON includes `elementTargets: []` and `interactions: []`.
- [ ] No error or warning is shown to the user when submitting without element targets or recording.

**Relevant constraints:** `docs/architecture/decisions/data.md` (payload builder, empty arrays), `.hatch/deliverables/assets/feedback-package-schema-v2.md`, `docs/architecture/decisions/design-principles.md` (principles 2, 4), UI kit components (`src/components/`, `src/ui/` — all package-owned UI must use kit components)

---

## [US-16] Receive submission confirmation

- [ ] On a successful submission (HTTP 2xx response from the configured endpoint), the feedback panel closes and the activator shows a brief success indicator (e.g. a checkmark) for approximately 2 seconds.
- [ ] After successful submission, all session state is reset: the comment field is cleared, no category is selected, element targets are cleared, and the interaction log is cleared.
- [ ] On a failed submission (non-2xx HTTP response or network error), the feedback panel remains open and an inline error message is shown.
- [ ] The inline error message includes a way to retry submission without re-entering feedback.
- [ ] The error message does not expose raw server error details to the user.

**Relevant constraints:** `docs/architecture/decisions/data.md` (session reset, clear draft on submit), `docs/architecture/decisions/backend.md` (`fetch` response handling), `docs/architecture/decisions/frontend.md` (transient activator success state), `requirements/mvp/implementation-heuristics.md` (heuristics 8, 10, 14), `docs/architecture/decisions/design-principles.md` (principles 2, 5, 6), UI kit components (`src/components/`, `src/ui/` — all package-owned UI must use kit components)
