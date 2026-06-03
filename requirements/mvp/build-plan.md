# MVP Build Plan

## Batch 1 — Host integration foundation

**Stories:** US-01, US-02, US-03, US-04, US-05

**Delivers:** A publishable `flag-feedback` package that a host developer can install, import in vanilla JS / React / Vue, and initialize with a host-owned activator, validated endpoint, and optional app metadata — without yet exposing the full feedback panel workflow.

**Rationale:** Every later story depends on `initFeedback`, the dual ESM/UMD build, endpoint validation, and the activator/portal separation. Grouping installation, activator placement, styling guarantees, endpoint rules, and metadata config establishes the integration contract before any widget-user flows are built. This batch can be reviewed by integrating into a minimal host page and confirming init behaviour and console errors for misconfiguration.

---

## Batch 2 — Feedback panel and composition

**Stories:** US-06, US-07, US-08

**Delivers:** A widget user can open the feedback panel from the activator, write a comment, and select one of three categories (with validation blocking submit until a category is chosen).

**Rationale:** Panel UI, Shadow Root portal, and session fields for comment and category are prerequisites for targeting, recording, and submission. Keeping submission out of this batch avoids building `buildPackage()` and network handling before the core panel UX is stable. Review focuses on panel open/close, host interactivity behind the panel, and in-panel composition controls.

---

## Batch 3 — Element targeting

**Stories:** US-09, US-10, US-11

**Delivers:** Full element-targeting mode: activate from the panel, select elements with per-element comments, highlight and prompt UX, multiple targets in one session, and target count in the mode indicator.

**Rationale:** Targeting requires the panel and state machine from Batch 2 plus a dedicated targeting module, document-level listeners, and selector paths. It is independent of recording and can be reviewed end-to-end without an interaction log. Sequencing before recording keeps each passive/active capture mode easier to verify in isolation.

---

## Batch 4 — Interaction recording

**Stories:** US-12, US-13, US-17

**Delivers:** Recording sessions with a passive interaction log (meaningful capture, exclusions, folding), recording indicator, panel hide during recording, stop/discard flows, and interaction count in the panel.

**Rationale:** Recording depends on the portal, state machine, and mode indicators from earlier batches but not on submission. US-17 is grouped here because panel visibility during recording is inseparable from the recording UX. Review exercises start/stop/discard and inspects the in-memory interaction log without requiring POST.

---

## Batch 5 — Submission

**Stories:** US-14, US-15, US-16

**Delivers:** End-to-end submit: combined and minimal payloads, single POST to the configured endpoint, schema-compliant JSON, success confirmation on the activator, error/retry UX, and session reset on success.

**Rationale:** `buildPackage()` and `fetch` must integrate comment, category, element targets, and interactions — all of which exist after Batches 2–4. US-15 (comment-only submit) and US-16 (confirmation and errors) belong with US-14 so the feedback loop is complete before persistence. Review uses a mock or local endpoint to verify payload shape and HTTP handling.

---

## Batch 6 — Idle behaviour and draft persistence

**Stories:** US-18, US-19

**Delivers:** Guaranteed non-interference when modes are off, and `sessionStorage` draft restore across reload and `destroy()` / re-init (including resuming recording).

**Rationale:** US-18 needs all modes implemented to prove listeners are absent when idle and after panel close. US-19 spans the full session model and must re-attach listeners after restore — safest after submission defines clear-on-success behaviour (Batch 5). This batch is the polish layer for SPA navigation and tab-scoped drafts without blocking earlier batches from delivering reviewable sub-products.
