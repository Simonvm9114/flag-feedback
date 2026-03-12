# Reliability and Error Handling Principles

Extend the [checklist](../CHECKLIST.md) RELIABILITY_AND_ERROR_HANDLING section with these principles.

---

## Async Rejection Handling

Every async operation that can fail—Image load, fetch, JSON parse—must reject or call `onerror`. Callers must handle the rejection. Promises that never resolve on failure leave the UI stuck and frustrate users.

## Network Timeouts

Long-running network requests should use AbortController and a timeout. Without a timeout, a slow or hanging server can leave the request pending indefinitely. Provide a sensible default (e.g. 30 seconds).

## Differentiated Error Messages

Distinguish network failures (connection refused, timeout, CORS) from HTTP status errors (4xx, 5xx). Users benefit from actionable messages: "Check your connection" vs "Server error, try again later."

## Dev Logging

Use environment checks (e.g. dev mode or build flag) to log caught errors during development. In production, avoid logging that could affect or clutter the host page. Silent swallowing in production keeps the widget non-intrusive; dev logging helps debug.
