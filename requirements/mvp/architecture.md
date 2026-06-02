# MVP Architecture Specification

Implementation specification for the `flag-feedback` v2.0.0 MVP. Rationale lives in `docs/architecture/decisions/`.

---

## Frontend

- **Language:** TypeScript
- **API:** `initFeedback({ activator, endpoint, appId?, gitCommit?, gitRepo? })` → widget instance `{ destroy() }`
- **Activator:** Host-owned `HTMLElement`; package attaches listener only; no package CSS on activator
- **Overlay UI:** Container on `document.body` with **open Shadow Root** — panel, targeting UI, mode indicators
- **Mode indicators:** Fixed-position pills inside portal; not full-screen
- **Published formats:** ESM + UMD bundles + `.d.ts` (see Backend)

---

## Backend (integration API and build)

- **No server** in this repository
- **Network:** Single `fetch` POST of JSON to configured `endpoint` (see `docs/architecture/decisions/backend.md`)
- **Endpoint rules:** Required; absolute URL; `https://` or `http://` for `localhost` / `127.x.x.x` only; relative URLs rejected; init fails with console error if invalid
- **Build:** Vite library mode → `dist/flag-feedback.esm.js`, `dist/flag-feedback.umd.js`
- **Package:** npm name `flag-feedback`, version `2.0.0`, unscoped public
- **`package.json` exports:** `"import"` / `"require"` map to ESM/UMD; `"types"` → `.d.ts`
- **Production dependencies:** None

---

## Data

- **Persistence:** In-memory session per widget instance only; no `localStorage` / `sessionStorage` / database
- **State machine:** `idle → panel → targeting | recording → panel → submitting → idle`
- **Modules:** session/state machine, recorder, targeting, payload builder (`buildPackage()`)
- **IDs:** `fb_` + `crypto.randomUUID()`
- **Schema:** v2 per `.hatch/deliverables/assets/feedback-package-schema-v2.md` — categories `design-request` | `feature-request` | `bug-fix`; `elementTargets` as `{ path, comment }[]`; no `screenshots`
- **Limits:** Comment max 10,000 chars; selector paths up to 5 ancestors; error messages in interactions truncated to 200 chars

---

## Access control

- See `docs/constitution.md` (Hard Boundaries) and `requirements/mvp/out-of-scope.md` — host-owned; not implemented in this package

---

## Integrations

- **Runtime:** None — no third-party SDKs or API keys in the library
- **Distribution:** npm registry (`docs/architecture/decisions/hosting.md`)
- **Source / CI:** GitHub + GitHub Actions (`docs/architecture/decisions/version-control.md`, `hosting.md`)

---

## Hosting and deployment

| Item | Value |
|------|-------|
| Deployment target | npm registry (artifact publish) |
| CI/CD | GitHub Actions — CI on push and PR; publish on `v*.*.*` tags |
| Platform / environments | `registry.npmjs.org` — `latest` dist-tag only |
| Build command | `npm run build` |
| Deploy command | `npm publish --access public` (tag workflow, after CI checks) |
| Config files | `.github/workflows/ci.yml`, `.github/workflows/publish.yml`, `package.json` |

**Secret:** `NPM_TOKEN` in GitHub Actions (not in package runtime).

**Deferred:** Demo/documentation site.

---

## Version control

- **Repository:** `https://github.com/Simonvm9114/flag-feedback.git`
- **Flow:** GitHub Flow — `mvp/v2` until MVP merge, then `feature/*` / `fix/*` → PR → `main`
- **Branches:** `legacy/v1` (experiment archive); `main` (integration)
- **Releases:** Semver git tags on `main` trigger npm publish
- **Protection:** CI must pass before merge to `main`

---

## Testing

- **Runner:** Vitest + happy-dom
- **In scope:** Unit (payload, state machine, validation, folding, selectors); component/DOM (`initFeedback`, panel, modes, mocked `fetch`)
- **Out of MVP CI:** Playwright/Cypress E2E
- **CI script:** `npm test`

---

## Formal checks

- **Lint:** ESLint 9 flat config + typescript-eslint — `npm run lint`
- **Format:** Prettier — `npm run format` (or equivalent)
- **Types:** TypeScript `strict: true` — `npm run typecheck` (`tsc --noEmit`)
- **Declarations:** `vite-plugin-dts` (or equivalent) in build
- **CI order:** lint → typecheck → test → build
- **Pre-commit hooks:** None for MVP

---

## Explicitly out of scope (MVP)

Per `requirements/mvp/out-of-scope.md`: screenshots; click interception during recording; in-repo feedback receiver; package auth; framework wrappers; offline support; shared multi-activator state; i18n; custom categories.
