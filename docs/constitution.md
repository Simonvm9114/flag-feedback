# Constitution

## Core Purpose

flag-feedback-mvp is a client-side JavaScript package that enables structured, element-level feedback collection from users of any web application. It is not a backend system, not a full-stack solution, and not a UI framework — it is a single installable package that a host application imports and integrates on its own terms.

---

## Principles

1. **The package has no runtime dependencies on third-party libraries.** All functionality is implemented using vanilla JavaScript and native browser APIs. Adding a runtime dependency requires explicit justification and developer approval.

2. **The activator component has no built-in visual appearance.** The package does not apply any default CSS styles — no colour, no dimensions, no border, no padding — to the activator element. Its appearance is entirely determined by the host application's container and stylesheet.

3. **The feedback panel UI is owned and rendered by the package.** When the widget is active, the package renders a panel for comment input, category selection, element-targeting controls, recording controls, and submission. This panel must not alter the host application's layout, styles, or z-index context outside its own rendered surface.

4. **Element-targeting mode is inactive by default.** Normal interaction with the host application is never intercepted by the package unless the user has explicitly activated element-targeting mode through the feedback panel. A user who has not activated element-targeting mode must be able to use the host application without any interference from the package.

5. **User input values in the host application are never captured.** The package may record which element was interacted with (via its CSS selector path), but never the value the user typed, selected, or chose. Password fields are always excluded from recording, regardless of any other configuration.

6. **The package communicates only with the developer-configured endpoint.** Feedback data is POSTed to exactly one URL: the endpoint the host developer has configured. The package never transmits data to any third-party service, analytics platform, or URL not explicitly configured by the host developer.

7. **All feedback for a single issue is submitted in one package.** A submission combines the comment, category, all element targets, and all recorded interactions into a single JSON POST. The package does not submit partial payloads or multiple requests for one user feedback session.

8. **The package must work in all modern browsers on desktop and mobile.** No polyfills for current evergreen browser capabilities are acceptable. If a browser API is not available in a target environment, the package must degrade gracefully rather than throw an unhandled error.

9. **Infrastructure costs are minimised.** Free tiers are preferred for all tooling and services. Paid services are only acceptable when no reasonable free alternative exists.

---

## Hard Boundaries

The following are absolute prohibitions. Before implementing any feature or making any change, verify it does not conflict with an entry in this list. If it does, stop and ask the developer before proceeding.

| Boundary | Description |
|----------|-------------|
| No screenshot capture | The package does not capture, render, or transmit screenshots of the host application in any form. |
| No server-side code | The package is client-side only. It contains no server, no database adapter, and no backend logic of any kind. |
| No authentication or access control | The package does not implement user identity, session management, or access tiers. Controlling who has access to the widget is the host application's responsibility. |
| No framework-specific bindings | The package ships no React, Vue, Angular, Svelte, or other framework-specific wrappers in this release. |
| No real-time click interception during recording | While a recording session is active, the package does not intercept clicks to offer a "comment or continue?" dialogue. This feature is explicitly deferred. |
| No transmission to unconfigured URLs | The package may only POST data to the endpoint explicitly configured by the host developer. Hardcoded external URLs are prohibited. |
| No capture of input field values | The content of any input, textarea, select, or equivalent element in the host application is never read or transmitted. |
