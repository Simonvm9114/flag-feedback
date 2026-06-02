# Formal Checks Decision

## Decision

| Check        | Tool                                                               |
| ------------ | ------------------------------------------------------------------ |
| Lint         | **ESLint 9** flat config + **typescript-eslint**                   |
| Format       | **Prettier** (`eslint-config-prettier` to avoid conflicts)         |
| Types        | **TypeScript** with **`strict: true`**; CI runs **`tsc --noEmit`** |
| Declarations | `.d.ts` emitted via Vite library build (e.g. `vite-plugin-dts`)    |

**CI gate (in order):** `lint` → `typecheck` → `test` → `build`

**Local hooks:** None for MVP — enforcement via GitHub Actions only (branch protection requires CI green).

All tooling is **devDependencies** only (zero production runtime dependencies).

## Consequences

- Phase 4 adds ESLint/Prettier configs and npm scripts matching the CI workflow.
- Experiment used ESLint flat config on plain JS; MVP extends that pattern for TypeScript.
