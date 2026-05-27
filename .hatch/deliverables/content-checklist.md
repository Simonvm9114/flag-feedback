# Content Checklist

This checklist identifies everything that needs to be decided or supplied before the architecture conversation (Phase 3) can begin. Items marked **Required before Phase 3** must be resolved first. Items marked **Can be supplied later** are useful but will not block architecture decisions.

The delivery location for any files is `.hatch/deliverables/assets/`. Record the filename in the **Client answer** field once the file is placed there.

**How to read this document:** Each item has a **Question** (what the agent asked), a **Delivery** note (how to supply the answer), and a **Client answer** (what was decided in the Phase 2 interview). Text above the item list in each section is background context only — it is not a question and has no answer field.

---

## Package Identity

**Required before Phase 3**

- [x] **npm package name**

  **Question:** What name should this package be published under on npm? It must be unique on the registry. The working project name is `flag-feedback-mvp`, but the published name may differ.
  **Delivery:** Inline text
  **Client answer:** Reuse the existing npm package name `flag-feedback`. The MVP ships as v2.0.0 — a breaking major release that replaces the experiment (v1.x). npm retains full version history automatically; no migration of old versions is required.

- [x] **npm scope (if any)**

  **Question:** Should the package be published under a personal or organisation scope (e.g. `@simonvm/flag-feedback`) or without a scope (e.g. `flag-feedback`)?
  **Delivery:** Inline text
  **Client answer:** No scope — publish as unscoped `flag-feedback`, public, same as the experiment.

- [x] **npm account access**

  **Question:** Does an npm account exist with access to publish under the chosen name or scope? Will a publish token be needed for CI/CD?
  **Delivery:** Inline text (confirm account exists; token to be added to GitHub secrets)
  **Client answer:** npm account exists and has access to publish `flag-feedback`. An npm publish token will be created and stored as a GitHub Actions secret before CI/CD publish is configured in Phase 3.

---

## Repository and CI/CD

**Required before Phase 3**

- [x] **GitHub repository**

  **Question:** Where will this package's source code live on GitHub? Provide an existing repository URL or indicate that one needs to be created.
  **Delivery:** Inline text (URL or "needs to be created")
  **Client answer:** Reuse `https://github.com/Simonvm9114/flag-feedback.git`. Evolve the existing repo in place — no rename. Before replacing `main` with the MVP, tag the experiment at `v1.3.1` and create a `legacy/v1` branch. Develop the MVP in this Hatch project and push to a feature branch (`mvp/v2`) before merging to `main`. Step-by-step instructions: `assets/npm-and-github-migration.md`.

---

## Feedback Panel UI Direction

**Can be supplied later**

The feedback panel is rendered by the package itself and does have a visual appearance (unlike the activator, which is unstyled). The panel's design must be functional and clear for non-technical users, but it does not need to match any specific brand. Providing directional references now will help inform UI decisions during the build phase.

- [x] **Visual direction references**

  **Question:** Which applications, widgets, or UI patterns capture the visual feel you want for the feedback panel and mode indicators? These are references for tone and style, not a detailed specification.
  **Delivery:** Inline text (URLs or descriptions)
  **Client answer:** Use the existing `flag-feedback` experiment panel as the baseline for the feedback panel (white card, system fonts, compact form layout). For recording and element-targeting mode indicators, start from the experiment's minimal pill (compact, fixed position, small footprint) and refine toward a Windows flyout/snap-assist feel — modern, unobtrusive, easy to ignore. Overall tone: professional, neutral, and functional — utilitarian, gets out of the way. Panel and indicators should be straightforward to adapt to the host application's theme (colours, typography) without fighting the host app's visual identity.

- [x] **Anti-examples (optional)**

  **Question:** Are there visual styles or patterns you specifically want to avoid in the feedback panel?
  **Delivery:** Inline text
  **Client answer:** Avoid: loud branded colours or heavy gradients; full-screen modal overlays; long bureaucratic "support ticket" form layouts; dark or heavy chrome that competes with the host application; overly playful or cartoonish styling.

---

## Feedback Package Schema

**Required before Phase 3**

The package POSTs a JSON payload to the configured endpoint. The MVP extends the v1.x experiment schema: `screenshots` is removed; `feedback.category` and `elementTargets` are added. All other v1.x fields are retained unchanged. The full schema — example payloads, field reference, and v1→v2 changes — is documented in `assets/feedback-package-schema-v2.md`.

- [x] **Element target schema**

  **Question:** What is the shape of each entry in the `elementTargets` array?
  **Delivery:** Inline text
  **Client answer:** Each entry: `{ "path": "<css selector, up to 5 ancestor levels>", "comment": "<user-written text>" }`. Use `path` (not `selector`) for consistency with interaction events and the glossary. `elementTargets` is a top-level array; `[]` when no elements were targeted. See `assets/feedback-package-schema-v2.md` for the full payload.

- [x] **Category field name and values**

  **Question:** What is the exact field name and allowed values for feedback categories in the payload?
  **Delivery:** Inline text
  **Client answer:** Field: `feedback.category` (required on every submission). Values: `"design-request"`, `"feature-request"`, `"bug-fix"`. All other v1.x payload fields are retained except `screenshots`, which is removed in v2. See `assets/feedback-package-schema-v2.md` for the full payload and v1→v2 change summary.
