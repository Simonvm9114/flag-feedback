# Batch 6 — Acceptance Criteria

Idle behaviour and draft persistence (US-18, US-19). Criteria are evaluated against the running package integrated into a host application.

---

## [US-18] Application interaction is unaffected outside active modes

- [ ] On page load, element-targeting mode is not active; clicks in the host application are not intercepted.
- [ ] On page load, recording mode is not active; interactions in the host application are not captured.
- [ ] After the feedback panel is closed (without activating either mode), the host application behaves as if the package were not present.
- [ ] No global event listeners added by the package emit errors or side effects during normal application use.

**Relevant constraints:** `docs/architecture/decisions/frontend.md` (`destroy()` cleanup, listener registration), `docs/architecture/decisions/data.md` (default idle state, mode-gated listeners), `docs/constitution.md` (Principle 4), `requirements/mvp/implementation-heuristics.md` (heuristics 3, 9), `docs/architecture/decisions/design-principles.md` (principles 1, 3), UI kit components (`src/components/`, `src/ui/` — all package-owned UI must use kit components)

---

## [US-19] Persist in-progress feedback across navigation

- [ ] While a feedback session is in progress (panel open, targeting active, recording active, or unsubmitted draft fields present), changes are persisted to `sessionStorage` under `flag-feedback:draft` (or `flag-feedback:draft:{sessionKey}` when `sessionKey` is configured).
- [ ] After a full page reload in the same tab, calling `initFeedback` again restores the draft: comment text, category selection, element targets, interaction log, and recording state as applicable.
- [ ] After the host application calls `destroy()` and later calls `initFeedback` again in the same tab (e.g. SPA route change), the draft is restored the same way as after reload.
- [ ] If the user was in recording mode before reload or re-init, recording resumes: listeners are active again and new host interactions append to the restored log.
- [ ] On successful submission (HTTP 2xx), the `sessionStorage` draft entry is removed.
- [ ] On failed submission, the draft remains in `sessionStorage` so a reload does not lose the user's work.
- [ ] Closing the browser tab clears the draft (tab-scoped storage); no cross-tab restore is required.

**Relevant constraints:** `docs/architecture/decisions/data.md` (persistence module, restore, clear on submit), `requirements/mvp/architecture.md` (draft keys), `docs/architecture/decisions/backend.md` (optional `sessionKey`), `requirements/mvp/implementation-heuristics.md` (heuristics 3, 8, 9, 15), `docs/architecture/decisions/design-principles.md` (principles 2, 3, 5, 6)
