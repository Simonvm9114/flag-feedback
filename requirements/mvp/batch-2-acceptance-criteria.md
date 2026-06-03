# Batch 2 — Acceptance Criteria

Feedback panel and composition (US-06, US-07, US-08). Criteria are evaluated against the running package integrated into a host application.

---

## [US-06] Open the feedback panel

- [ ] Clicking (or otherwise activating) the activator element opens the feedback panel.
- [ ] The feedback panel contains: a text area for the comment, a category selector with exactly three options (Design request, Feature request, Bug fix), a control for activating element-targeting mode, a control for starting a recording session, and a submit button.
- [ ] The host application remains fully interactive behind the feedback panel (e.g. links work, inputs accept focus).
- [ ] The feedback panel can be closed without submitting.

**Relevant constraints:** `docs/architecture/decisions/frontend.md` (panel in Shadow Root portal), `docs/architecture/decisions/data.md` (state machine), `docs/architecture/decisions/design-principles.md` (principles 1, 2), UI kit components (`src/components/`, `src/ui/` — all package-owned UI must use kit components)

---

## [US-07] Write a comment

- [ ] The feedback panel contains a text area that accepts free-form text input.
- [ ] Text typed into the comment field is included in the submitted feedback package under `feedback.text`.
- [ ] Text exceeding 10,000 characters is truncated to 10,000 characters before submission; no error is thrown.

**Relevant constraints:** `docs/architecture/decisions/data.md` (session fields, truncation), `requirements/mvp/architecture.md`, `docs/architecture/decisions/design-principles.md` (principle 2), UI kit components (`src/components/`, `src/ui/` — all package-owned UI must use kit components)

---

## [US-08] Select a feedback category

- [ ] The category selector presents exactly three options: "Design request", "Feature request", and "Bug fix".
- [ ] No category is pre-selected when the feedback panel opens for the first time in a session (i.e. no prior draft exists).
- [ ] Attempting to submit without selecting a category is blocked; an inline error message is displayed.
- [ ] The selected category value is included in the submitted feedback package under `feedback.category`.

**Relevant constraints:** `docs/architecture/decisions/data.md` (state machine, required category), `.hatch/deliverables/assets/feedback-package-schema-v2.md`, `docs/architecture/decisions/design-principles.md` (principle 2), UI kit components (`src/components/`, `src/ui/` — all package-owned UI must use kit components)

---

## [US-20] Keep draft when panel is dismissed

- [ ] Closing the feedback panel without submitting does not clear the comment text or category selection.
- [ ] Re-opening the panel restores the previously entered comment and the previously selected category (if any).
- [ ] Comment and category are cleared only after a successful submission — not on close, not on `destroy()`.

**Relevant constraints:** `docs/architecture/decisions/data.md` (session cleared on successful submission only), `docs/architecture/decisions/design-principles.md` (principles 2, 5)
