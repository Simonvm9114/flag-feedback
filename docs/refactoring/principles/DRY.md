# DRY Principles

Extend the [checklist](../CHECKLIST.md) DRY section with these principles.

---

## Shared Rendering Logic

Identical canvas drawing, UI rendering, or similar visual logic in multiple places should be extracted to a shared utility. Duplicate rendering code diverges over time and causes inconsistent behaviour.

## Shared Async Patterns

Image loading, fetch wrappers, and other repeated async flows should be centralized in reusable helpers. A shared helper handles `onload`/`onerror`, timeouts, and rejection in one place; callers use a simple API.

## Named Constants

Reused values—line widths, colours, limits, dimensions—should be named and defined once. The name documents intent; scattered literals do not.
