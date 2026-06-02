# Hosting and Deployment Decision

## Decision

This package has no runtime deployment. Distribution is **artifact publish to npm** (`flag-feedback` on `registry.npmjs.org`).

| Field | Value |
|-------|-------|
| Deployment target | npm registry (build artifacts only — no static, server, serverless, or container runtime) |
| CI/CD | **GitHub Actions** — CI on push and pull request; **publish on `v*.*.*` git tags only** |
| Environments | **`latest` dist-tag only** — no `beta` or staging/production servers |
| Build command | `npm run build` (Vite library mode → `dist/`) |
| Deploy command | `npm publish --access public` (CI only, after tests pass on tag) |
| Config files | `.github/workflows/ci.yml`, `.github/workflows/publish.yml`, `package.json` (`files`, `exports`, `publishConfig`) |

**Secrets:** `NPM_TOKEN` stored as a GitHub Actions secret for the publish workflow. No runtime environment variables in the package.

**Deferred:** No demo or documentation site for MVP.

## Consequences

- Releases are deliberate: bump version, merge to `main`, tag (e.g. `v2.0.0`), CI publishes to npm.
- CI must pass on PRs before merge; publish runs only when a semver tag is pushed.
