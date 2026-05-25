# Content Checklist

This checklist identifies everything that needs to be decided or supplied before the architecture conversation (Phase 3) can begin. Items marked **Required before Phase 3** must be resolved first. Items marked **Can be supplied later** are useful but will not block architecture decisions.

The delivery location for any files is `.hatch/deliverables/assets/`. Record the filename in the **Client answer** field once the file is placed there.

---

## Package Identity

**Required before Phase 3**

- [ ] **npm package name** — The name under which this package will be published to the npm registry. It must be unique on npm; check availability at [npmjs.com](https://www.npmjs.com) before deciding. The current working name is `flag-feedback-mvp`, but this may or may not be the intended final name.
  - Delivery: Inline text
  - **Client answer:** _(leave blank — fill in during Phase 2 interview)_

- [ ] **npm scope (if any)** — Whether the package should be published under a personal or organisation scope (e.g. `@simonvm/flag-feedback`) or without a scope (e.g. `flag-feedback`). A scoped package can be published as private or public; an unscoped package on npm is always public.
  - Delivery: Inline text
  - **Client answer:** _(leave blank — fill in during Phase 2 interview)_

- [ ] **npm account access** — Confirm that an npm account exists and that you have access to publish under the chosen name or scope. If a publish token will be used in CI/CD, it will need to be created and stored as a GitHub Actions secret.
  - Delivery: Inline text (confirm account exists; token to be added to GitHub secrets)
  - **Client answer:** _(leave blank — fill in during Phase 2 interview)_

---

## Repository and CI/CD

**Required before Phase 3**

- [ ] **GitHub repository** — Confirm the GitHub repository where this package will live. Provide the repository URL (or indicate that it needs to be created). The repository is the basis for all CI/CD decisions in Phase 3.
  - Delivery: Inline text (URL or "needs to be created")
  - **Client answer:** _(leave blank — fill in during Phase 2 interview)_

---

## Feedback Panel UI Direction

**Can be supplied later**

The feedback panel is rendered by the package itself and does have a visual appearance (unlike the activator, which is unstyled). The panel's design must be functional and clear for non-technical users, but it does not need to match any specific brand. Providing directional references now will help inform UI decisions during the build phase.

- [ ] **Visual direction references** — Links to any existing applications, widgets, or UI patterns that capture the visual feel you want for the feedback panel. These are references for tone and style, not a specification.
  - Delivery: Inline text (URLs or descriptions)
  - **Client answer:** _(leave blank — fill in during Phase 2 interview)_

- [ ] **Anti-examples (optional)** — Any visual styles or patterns you specifically want to avoid in the feedback panel.
  - Delivery: Inline text
  - **Client answer:** _(leave blank — fill in during Phase 2 interview)_

---

## Feedback Package Schema

**Required before Phase 3**

The package POSTs a JSON payload to the configured endpoint. The MVP extends the schema from the `flag-feedback` experiment with two new fields: `elementTargets` (array) and `feedback.category`. The schema must be agreed before implementation so that any receiving backend can be updated in parallel.

- [ ] **Element target schema** — Confirm the shape of each entry in the `elementTargets` array. The proposed structure is:
  ```json
  {
    "selector": "main > section > div.card",
    "comment": "This label is misleading"
  }
  ```
  Confirm this is acceptable, or describe the preferred structure.
  - Delivery: Inline text
  - **Client answer:** _(leave blank — fill in during Phase 2 interview)_

- [ ] **Category field name and values** — Confirm the exact string values to use for the three feedback categories in the payload. The proposed values are `"design-request"`, `"feature-request"`, and `"bug-fix"` (kebab-case). Confirm or specify alternatives.
  - Delivery: Inline text
  - **Client answer:** _(leave blank — fill in during Phase 2 interview)_
