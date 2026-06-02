# Deployment Pipeline

This package deploys to the **npm registry**, not a web server. There is no staging URL for a running application (demo site deferred per `docs/architecture/decisions/hosting.md`).

## Environments

| Environment               | Trigger                     | Result                                                           | Verification URL                                                                                                                                               |
| ------------------------- | --------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CI / pre-release**      | Push or PR to any branch    | Lint, format, test, build; `dist/` uploaded as workflow artifact | [GitHub Actions](https://github.com/Simonvm9114/flag-feedback/actions)                                                                                         |
| **Production (`latest`)** | Push tag `v*.*.*` on `main` | `npm publish --access public`                                    | [npm package page](https://www.npmjs.com/package/flag-feedback) · [unpkg ESM](https://unpkg.com/flag-feedback@2.0.0/dist/flag-feedback.esm.js) (after publish) |

## Workflows

| File                            | Stages                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`      | Check → build → `npm publish --dry-run` → upload `dist/` artifact (pre-release / “staging”) |
| `.github/workflows/publish.yml` | Check → build → `npm publish` to registry (production on tags)                              |

`package.json` `publishConfig`, `repository`, `files`, and `exports` are the npm platform configuration (no `vercel.json` / `fly.toml` — not applicable).

## Secrets (GitHub repository settings)

| Secret      | Purpose                                                 |
| ----------- | ------------------------------------------------------- |
| `NPM_TOKEN` | Automation token with publish access to `flag-feedback` |

Do not commit tokens. Local publish uses gitignored `.npmrc` (see `.npmrc.example`).

## Branch protection (manual — GitHub UI)

Apply on **`main`** before Phase 6 merges:

1. Settings → Branches → Add rule for `main`
2. Require a pull request before merging (optional for solo dev; recommended)
3. Require status check **`check`** (from CI workflow) to pass
4. Restrict direct pushes if desired
5. Do not require reviews if self-merging per `docs/architecture/decisions/version-control.md`

Current MVP work targets branch **`mvp/v2`** until merge (see `.hatch/deliverables/assets/npm-and-github-migration.md`).
