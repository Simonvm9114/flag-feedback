# Decomposition Principles

Extend the [checklist](../CHECKLIST.md) DECOMPOSITION section with these principles.

---

## Module Size

Keep modules under ~250 lines. If a module grows beyond that, split it into smaller modules or extract logic into dedicated utilities. Large modules become hard to reason about and test.

## Single Responsibility

Each module should have one clear purpose. If you cannot describe its responsibility in one sentence, it likely does too much. Extract distinct concerns into separate modules.

## Extract Cross-Cutting Concerns

State persistence, network calls, layout/positioning, and validation belong in dedicated modules. Do not mix these concerns into the main component. Cross-cutting concerns are reused and change independently.

## Thin Orchestrators

The main component should coordinate and delegate. It should not implement persistence logic, fetch logic, or layout logic inline. Orchestrators call modules; they do not contain large blocks of implementation.
