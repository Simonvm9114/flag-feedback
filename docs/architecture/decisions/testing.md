# Testing Decision

## Decision

| Aspect          | Choice                                                                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runner          | **Vitest** (Vite-aligned)                                                                                                                            |
| DOM environment | **happy-dom**                                                                                                                                        |
| MVP test types  | **Unit** and **component/DOM** per modules in `docs/architecture/decisions/data.md` (persistence, meaningful capture, draft restore; mocked `fetch`) |
| E2E             | **Not in MVP CI** — defer Playwright/Cypress; manual or host-app checks for full AC                                                                  |
| CI              | `npm test` on every PR/push, before build (see `docs/architecture/decisions/hosting.md`)                                                             |
| Coverage        | Not required in MVP CI                                                                                                                               |

## Consequences

- Phase 4 skeleton adds Vitest config and example tests for pure modules first.
- Browser quirks Shadow DOM / real mobile behaviour may need manual verification or E2E later.
