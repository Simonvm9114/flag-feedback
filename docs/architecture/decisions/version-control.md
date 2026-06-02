# Version Control Decision

## Decision

**GitHub Flow** on `https://github.com/Simonvm9114/flag-feedback.git`.

- **`main`** — integration branch; CI must pass before merge.
- **`legacy/v1`** — preserved experiment code (read-only archive).
- **`mvp/v2`** — current MVP rewrite branch until merged to `main`.
- **After MVP merge** — short-lived branches named `feature/<description>` or `fix/<description>`.
- **Pull requests** — into `main` even when self-merged; no required second reviewer.
- **Release tags** — semver tags (`v2.0.0+`) on `main` trigger npm publish.

**Branch protection:** Require CI green before merging to `main`.

**Local workflow:** Development continues in this Hatch project locally until MVP is ready to push and merge via the migration guide (`mvp/v2` → PR → `main`).

## Consequences

- Feature work stays on branches until CI passes and merges to `main`.
- npm releases align with git tags, not every merge to `main`.
