# MVP Architecture Specification

Implementation specification for the `flag-feedback` v2.0.0 MVP. Rationale lives in `docs/architecture/decisions/`. Structural constraints: `docs/architecture/decisions/design-principles.md`.

---

## Frontend

- **Language:** TypeScript
- **API:** `initFeedback({ activator, endpoint, appId?, gitCommit?, gitRepo?, sessionKey? })` → widget instance `{ destroy() }`
- **Activator:** Host-owned `HTMLElement` (see `docs/functional/glossary.md`); package attaches listener only; no package CSS on activator (see `docs/constitution.md`, Principle 2)
- **Overlay UI:** Container on `document.body` with **open Shadow Root** — panel, targeting UI, mode indicators
- **Mode indicators:** Fixed-position pills inside portal; not full-screen
- **Published formats:** ESM + UMD bundles + `.d.ts` (see Backend)

---

## Backend (integration API and build)

- **No server** in this repository
- **Network:** Single `fetch` POST of JSON to configured `endpoint` (see `docs/architecture/decisions/backend.md`; `docs/constitution.md`, Principles 6–7)
- **Endpoint rules:** Required; absolute URL; `https://` or `http://` for `localhost` / `127.x.x.x` only; relative URLs rejected; init fails with console error if invalid
- **Build:** Vite library mode → `dist/flag-feedback.esm.js`, `dist/flag-feedback.umd.js`
- **Package:** npm name `flag-feedback`, version `2.0.0`, unscoped public
- **`package.json` exports:** `"import"` / `"require"` map to ESM/UMD; `"types"` → `.d.ts`
- **Production dependencies:** None (see `docs/constitution.md`, Principle 1)

---

## Data

- **Persistence, state machine, modules, interaction log, limits:** See `docs/architecture/decisions/data.md` (includes `sessionStorage` drafts for US-19; no `localStorage` / database)
- **Schema:** v2 per `.hatch/deliverables/assets/feedback-package-schema-v2.md` (no `screenshots`; see `requirements/mvp/out-of-scope.md`)

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

See `docs/architecture/decisions/hosting.md`.

---

## Version control

See `docs/architecture/decisions/version-control.md`.

---

## Testing

See `docs/architecture/decisions/testing.md`.

---

## Formal checks

See `docs/architecture/decisions/formal-checks.md`.

---

## Explicitly out of scope (MVP)

Per `requirements/mvp/out-of-scope.md`: screenshots; click interception during recording; in-repo feedback receiver; package auth; framework wrappers; offline support; shared multi-activator state; i18n; custom categories.
