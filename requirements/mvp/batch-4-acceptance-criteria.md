# Batch 4 — Acceptance Criteria

Interaction recording (US-12, US-13, US-17). Criteria are evaluated against the running package integrated into a host application.

---

## [US-12] Start a recording session

- [ ] The feedback panel contains a clearly labelled "Start recording" control.
- [ ] Activating recording hides the feedback panel and shows a recording indicator in the host application.
- [ ] The recording indicator is visible during the recording session without substantially obstructing the host application's UI.
- [ ] While recording, the package captures click events with the target element's CSS selector path.
- [ ] While recording, the package captures scroll events with the scroll position as a percentage of scrollable height.
- [ ] While recording, the package captures input and change events with the element's CSS selector path only — no field values are captured.
- [ ] While recording, the package captures form submit events with the form's CSS selector path.
- [ ] While recording, the package captures navigation events (popstate, hashchange).
- [ ] While recording, the package captures unhandled JavaScript errors and promise rejections with their message (truncated to 200 characters).
- [ ] Password fields (`input[type="password"]`) are excluded from recording — no interaction event is emitted for them.
- [ ] Elements with `data-flag-feedback-ignore` (or an equivalent attribute) are excluded from recording.
- [ ] Consecutive identical events (same type and same element path) are collapsed into a single entry with a `count` field.
- [ ] Clicks and other interactions on the package portal, mode indicators, or activator element are not recorded in the interaction log (including using the recording indicator to stop recording).
- [ ] The interaction log does not contain a burst of per-keystroke `input` entries for a single field where the user typed a short phrase — input activity is coalesced so the log stays useful for tracing UI behaviour.
- [ ] Recorded events use CSS selector paths on host-application elements so an agent can locate the relevant UI (schema types unchanged: click, input, change, submit, scroll, navigation, errors).

**Relevant constraints:** `docs/architecture/decisions/data.md` (recorder module, folding, exclusions, meaningful capture), `docs/constitution.md` (Principle 5), `docs/architecture/decisions/frontend.md` (panel hides during recording), `requirements/mvp/implementation-heuristics.md` (heuristics 7, 11, 13), `docs/architecture/decisions/design-principles.md` (principles 3, 4)

---

## [US-13] Stop recording and return to the feedback panel

- [ ] The user can tap or click the recording indicator to stop recording.
- [ ] Stopping recording reopens the feedback panel.
- [ ] The feedback panel displays the count of interactions captured (e.g. "12 interactions recorded").
- [ ] The user can discard the recording via an explicit control, resetting the interaction count to zero.
- [ ] After discarding, the user can start a new recording session from the feedback panel.

**Relevant constraints:** `docs/architecture/decisions/data.md` (state machine, interaction log), `docs/architecture/decisions/frontend.md` (recording indicator), `requirements/mvp/implementation-heuristics.md` (heuristic 11), `docs/architecture/decisions/design-principles.md` (principles 2, 3), UI kit components (`src/components/`, `src/ui/` — all package-owned UI must use kit components)

---

## [US-17] Panel hides during recording

- [ ] Starting a recording session causes the feedback panel to become not visible.
- [ ] The host application is fully interactive during a recording session.
- [ ] The recording indicator does not cover more than a small, fixed area of the viewport (it is not a full-screen overlay).

**Relevant constraints:** `docs/architecture/decisions/frontend.md` (panel hide, fixed-position indicator), `docs/architecture/decisions/data.md` (recording sub-state), `docs/architecture/decisions/design-principles.md` (principles 2, 3), UI kit components (`src/components/`, `src/ui/` — all package-owned UI must use kit components)

---

## [US-21] Use the feedback panel on a mobile device

Implemented as part of Batch 4 — the responsive panel layout was added alongside the recording indicator work.

- [x] The feedback panel renders without horizontal scrolling or clipped controls on a viewport 320 CSS pixels wide.
- [x] All interactive controls — comment text area, category selector, element-targeting control, recording control, and submit button — are fully reachable and operable without a mouse.
- [x] All tappable targets (buttons, controls, the recording indicator) meet a minimum touch-target size of 44×44 CSS pixels.
- [x] The panel does not occupy the full viewport height on a typical mobile screen; the host application is partially visible behind or around the panel.
- [x] The recording indicator remains accessible and tappable on a small-screen viewport.
- [x] Element-targeting mode can be activated and a target selected on a touch device (tap-to-target).

**Relevant constraints:** `docs/constitution.md` (Principle 8 — responsive panel, 320px minimum, adequate touch targets), `docs/architecture/decisions/frontend.md` (Shadow Root portal, responsive layout in Consequences), `requirements/mvp/implementation-heuristics.md` (heuristic 17), `docs/architecture/decisions/design-principles.md` (principle 6)
