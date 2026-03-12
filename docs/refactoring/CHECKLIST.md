# Refactoring Standards Checklist

Use this checklist during agent sessions or code reviews to maintain decomposition, DRY, and reliability standards.

---

## DECOMPOSITION

- [ ] **Module size** – No module exceeds ~250 lines; split if it does
- [ ] **Single responsibility** – Each module has one clear purpose
- [ ] **Extract cross-cutting concerns** – Persistence, network, positioning live in dedicated modules
- [ ] **Thin orchestrators** – Main component delegates; it does not contain large inline logic

---

## DRY

- [ ] **Shared rendering logic** – Duplicate drawing/rendering code extracted to a utility
- [ ] **Shared async patterns** – Repeated load/error patterns (e.g. Image loading) in a reusable helper
- [ ] **Named constants** – Shared values (colours, dimensions) defined once

---

## RELIABILITY_AND_ERROR_HANDLING

- [ ] **Async rejection handling** – Promises that can fail have `onerror`/`reject` and callers handle rejection
- [ ] **Network timeouts** – Fetch requests use AbortController/timeout to avoid hanging
- [ ] **Differentiated error messages** – Network vs HTTP errors surfaced distinctly to the user
- [ ] **Dev logging** – Caught errors logged in development; silent in production to avoid breaking host page

---

## Extensions

For more detail on each area, see:

- [DECOMPOSITION.md](principles/DECOMPOSITION.md)
- [DRY.md](principles/DRY.md)
- [RELIABILITY_AND_ERROR_HANDLING.md](principles/RELIABILITY_AND_ERROR_HANDLING.md)
