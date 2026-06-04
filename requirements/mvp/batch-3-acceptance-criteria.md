# Batch 3 — Acceptance Criteria

Element targeting (US-09, US-10, US-11). Criteria are evaluated against the running package integrated into a host application.

---

## [US-09] Activate element-targeting mode

- [ ] The feedback panel contains a clearly labelled control for activating element-targeting mode.
- [ ] Activating element-targeting mode hides or minimises the feedback panel so that the full application UI is visible.
- [ ] A recording indicator (pill or badge) is visible while element-targeting mode is active, showing that the mode is on.
- [ ] Element-targeting mode can be activated independently of whether a recording session is active.
- [ ] Deactivating element-targeting mode without selecting any element returns the user to the feedback panel with no error.

**Relevant constraints:** `docs/architecture/decisions/frontend.md` (mode indicators), `docs/architecture/decisions/data.md` (independent modes, state machine), `docs/architecture/decisions/design-principles.md` (principles 2, 3), UI kit components (`src/components/`, `src/ui/` — all package-owned UI must use kit components)

---

## [US-10] Select a UI element and attach a comment

- [ ] While element-targeting mode is active, clicking any element in the host application opens a prompt for the user to write a comment on that element.
- [ ] The selected element is visually highlighted (e.g. with an outline or overlay) while the prompt is open.
- [ ] The user can confirm the element comment (adding the element target to the session) or cancel (returning to element-targeting mode without adding the target).
- [ ] After confirming an element comment, the user remains in element-targeting mode and can select another element.
- [ ] The element target recorded in the feedback package includes the element's CSS selector path (up to 5 ancestor levels) and the user's comment for that element.
- [ ] Clicking the activator element itself while in element-targeting mode does not create a self-referential element target.

**Relevant constraints:** `docs/architecture/decisions/data.md` (targeting module, selector paths), `docs/architecture/decisions/frontend.md` (document-level listeners), `docs/functional/glossary.md` (element target), `requirements/mvp/implementation-heuristics.md` (heuristic 11), `docs/architecture/decisions/design-principles.md` (principles 2, 3, 4), UI kit components (`src/components/`, `src/ui/` — all package-owned UI must use kit components)

---

## [US-11] Target multiple elements in one session

- [ ] After confirming a comment on one element, the user can select and comment on additional elements without leaving element-targeting mode.
- [ ] The feedback panel indicator (shown when element-targeting mode is active) displays the current count of element targets added in the session.
- [ ] All element targets are included in the submitted feedback package as an array under `elementTargets`.
- [ ] Submitting with three or more element targets works without error.

**Relevant constraints:** `docs/architecture/decisions/data.md` (session `elementTargets`, payload builder), `.hatch/deliverables/assets/feedback-package-schema-v2.md`, `docs/architecture/decisions/design-principles.md` (principles 2, 4), UI kit components (`src/components/`, `src/ui/` — all package-owned UI must use kit components)
