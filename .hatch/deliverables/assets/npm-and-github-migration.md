# npm and GitHub Migration Guide

Instructions for replacing the `flag-feedback` experiment (v1.x) with this MVP (v2.x) while reusing the **same npm package name** and **same GitHub repository**. Read this before connecting the Hatch project to the live repo or publishing the first MVP release.

---

## Decisions (locked in Phase 2)

| Asset | Decision |
| --- | --- |
| **npm package name** | `flag-feedback` (reuse existing; do not publish as `flag-feedback-mvp`) |
| **npm scope** | None — unscoped, public |
| **First MVP release** | `2.0.0` (breaking rewrite; v1.x remains available on npm) |
| **GitHub repository** | `https://github.com/Simonvm9114/flag-feedback.git` (evolve in place; no repo rename) |
| **Experiment preservation** | Tag `v1.3.1` and branch `legacy/v1` before replacing `main` |

---

## Why this approach

- **npm** keeps full version history automatically. Publishing `2.0.0` to `flag-feedback` does not require migrating or copying old versions — they stay on the registry.
- **GitHub** does not need to be renamed. A rename would break clone URLs, issues, and CI secrets without adding value. Instead, preserve the experiment on a legacy branch and replace `main` when the MVP is ready.
- **Consumers** on `^1.x` continue to receive v1.x until they explicitly upgrade to `2.x`.

---

## Prerequisites

Before starting the migration:

- [ ] MVP build is complete and tested locally in this Hatch project (`flag-feedback-mvp`).
- [ ] Acceptance criteria that reference `flag-feedback-mvp` as the install name have been updated to `flag-feedback`.
- [ ] Any backend or integration that receives feedback payloads is updated for the v2 schema (no `screenshots`; new `feedback.category` and `elementTargets` fields).
- [ ] npm account access confirmed; an npm publish token is ready (or will be created) for CI/CD.

---

## Part 1 — Preserve the experiment on GitHub

Run these steps **in the existing experiment repo** (`flag-feedback`), not in this Hatch project.

```powershell
cd C:\Users\simon\Documents\Programming\Projects\flag-feedback

# Ensure main is up to date
git checkout main
git pull origin main

# Tag the final experiment release (skip if tag v1.3.1 already exists)
git tag v1.3.1
git push origin v1.3.1

# Create a permanent legacy branch pointing at the experiment code
git branch legacy/v1
git push origin legacy/v1
```

After this, the experiment code remains reachable at:

- Branch: `legacy/v1`
- Tag: `v1.3.1`

---

## Part 2 — Connect this Hatch project to the GitHub repo

Run these steps **in this Hatch project** (`flag-feedback-mvp`).

```powershell
cd C:\Users\simon\Documents\Programming\Projects\flag-feedback-mvp

# Add the existing repo as remote (skip if origin already exists)
git remote add origin https://github.com/Simonvm9114/flag-feedback.git

# Fetch remote state
git fetch origin
```

**Recommended:** push MVP work to a feature branch first, not directly to `main`.

```powershell
git checkout -b mvp/v2
git push -u origin mvp/v2
```

Open a pull request on GitHub: `mvp/v2` → `main`. Review the diff — it should be a full replacement of the v1 codebase with the MVP.

When ready to ship:

```powershell
# Merge via GitHub PR, then locally:
git checkout main
git pull origin main
git tag v2.0.0
git push origin v2.0.0
```

---

## Part 3 — Publish to npm

Ensure `package.json` in the MVP uses:

```json
{
  "name": "flag-feedback",
  "version": "2.0.0"
}
```

Publish from the repo root after the v2.0.0 tag is on `main`:

```powershell
npm run build
npm publish
```

For CI/CD (Phase 3+), store an npm publish token as a GitHub Actions secret (e.g. `NPM_TOKEN`) and publish only from tagged releases on `main`.

---

## Part 4 — Communicate the breaking change

After publishing v2.0.0:

1. Update the repo README with a **Migration from v1** section covering:
   - Screenshots removed
   - New required `feedback.category` field
   - New optional `elementTargets` array
   - Activator is unstyled and host-placed (no fixed floating button)
2. Optionally add an npm deprecation notice on the latest v1 release pointing users to v2 — only if you want to actively discourage new v1 installs:

   ```powershell
   npm deprecate flag-feedback@1.3.1 "v1 is legacy. Upgrade to v2 for the MVP rewrite."
   ```

   Do **not** unpublish v1.x — existing consumers depend on it remaining available.

---

## What not to do

| Avoid | Why |
| --- | --- |
| Renaming the GitHub repo and creating a new one with the same name | Breaks URLs, issues, and CI; unnecessary when a legacy branch suffices |
| Publishing under `flag-feedback-mvp` | Splits npm history and contradicts the reuse decision |
| Replacing `main` before tagging and branching `legacy/v1` | Loses easy access to the experiment baseline |
| Skipping semver major bump | v2 removes screenshots and changes the payload schema — consumers need a clear breaking-change signal |

---

## Quick reference for agents

When implementing CI/CD or release automation in Phase 3+:

- **Package name:** `flag-feedback`
- **Repo URL:** `https://github.com/Simonvm9114/flag-feedback.git`
- **Legacy branch:** `legacy/v1` (experiment code; do not delete)
- **First MVP tag:** `v2.0.0`
- **npm scope:** none
- **Publish token:** GitHub Actions secret (to be configured in Phase 3)
