# Backend Architecture Decision

## Decision

The "backend" dimension for this package is the **public integration API** and the **build and distribution pipeline** (see `docs/constitution.md`, Hard Boundaries — no server code in this repository).

**Integration API**

- Primary export: `initFeedback(config)` returning a **widget instance** with `{ destroy() }` for lifecycle cleanup (see `docs/functional/glossary.md`).
- Required config: `activator` (HTMLElement) and `endpoint` (absolute HTTPS URL, or `http://` for localhost/127.0.0.1 only — see `requirements/mvp/acceptance-criteria.md`, US-04).
- Optional config: `appId`, `gitCommit`, `gitRepo` for application metadata in the feedback package (see `requirements/mvp/acceptance-criteria.md`, US-05).
- Optional config: `sessionKey` — distinguishes `sessionStorage` draft keys when multiple widget instances exist on one page (see `docs/architecture/decisions/data.md`).
- On invalid or missing `endpoint`, initialization fails without attaching listeners or creating portal UI; a developer-facing message is logged to the browser console.
- Submission uses the browser **`fetch` API** to POST a single JSON body to the configured endpoint (see `docs/constitution.md`, Principles 6–7).

**Build and distribution**

- **TypeScript** source compiled with **Vite library mode** to produce dual **ESM + UMD** outputs.
- Package name: unscoped **`flag-feedback`**, published at **v2.0.0** (see `.hatch/deliverables/content-checklist.md`).
- Ship **TypeScript declaration files** (`.d.ts`) alongside bundles.
- **Zero production runtime dependencies** (see `docs/constitution.md`, Principle 1).

All consumer configuration is supplied through the `initFeedback` config object at call time — no package runtime environment variables.

## Context

Host developers install from npm and import the library into varied tooling. Dual ESM/UMD output and `.d.ts` declarations support modern bundlers and script-tag consumption.

Endpoint validation rules (HTTPS required except localhost, relative URLs rejected) are functional requirements evaluated at initialization.

## Alternatives considered

**Custom element attribute API** — Configuration via HTML attributes on a wrapper element. Rejected with the frontend decision; configuration belongs on the `initFeedback` config object.

**ESM-only distribution** — Smaller publish surface but excludes legacy script-tag consumers. Rejected to preserve dual-format distribution for npm library consumers.

## Trade-offs accepted

| Axis                       | Assessment                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| **Prompt coherence**       | High — one entry function, one POST action, explicit config shape.                         |
| **Failure surface**        | Low — init-time validation catches misconfiguration early.                                 |
| **Reversibility**          | Good — build tool or module format can change without altering the public config contract. |
| **Operational simplicity** | High — publish artifacts to npm.                                                           |

**Accepted costs:** TypeScript and dual-format builds add dev-time tooling compared to a single plain JS file. Host developers must supply a valid absolute endpoint URL at init time.

## Host integration patterns

The package only performs a browser **`fetch` POST** to the configured `endpoint`. It cannot connect to a database, hold write credentials, or bypass the same-origin policy. Host developers who want **one shared database** across dev, test, and production should use **server-side ingestion**, not a client-exposed secret.

| Goal | Recommended pattern |
| ---- | ------------------- |
| Feedback stored in the host app's database | Each environment configures its own absolute `endpoint` (e.g. `https://app-dev.example.com/api/feedback`). The host backend validates the request and writes to storage — optionally forwarding to a **shared** database or pipeline server-side. |
| Same logical store for all environments | Use separate endpoints per environment (required by URL validation) that all forward to one store with server-held credentials. The widget never embeds API keys. |
| Cross-origin POST to a dedicated receiver | The receiver must respond with appropriate **CORS** headers for the host origin. A thin serverless function or API gateway is still a backend; it is not a package feature. |
| Secrets and auth | Belong on the server receiving the POST. Do not pass database tokens, Supabase service keys, or similar through `initFeedback` — they would be visible to every end user (see `docs/constitution.md`, Hard Boundaries; Principle 6). |

Relative URLs are rejected (see `requirements/mvp/acceptance-criteria.md`, US-04) so each environment must supply a full URL pointing at an origin that accepts the POST. Routing all environments through the **host application's backend** remains the default, secure integration path.

## Consequences

- `package.json` exports map `"import"` and `"require"` to ESM and UMD bundles respectively, with types pointing to `.d.ts`.
- Phase 6 implementation validates endpoint rules before creating portal UI or binding the activator listener.
- CI/CD publish targets the `flag-feedback` npm package (see `docs/architecture/decisions/hosting.md`).
- Host developers gate widget access and protect the feedback endpoint (see `docs/constitution.md`, Hard Boundaries; `requirements/mvp/out-of-scope.md`).
- Host integration documentation for endpoints and shared storage lives in this file — not in implementation heuristics.
