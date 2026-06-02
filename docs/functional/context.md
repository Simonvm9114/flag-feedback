# Context

## Project Background

flag-feedback-mvp is a client-side JavaScript package for collecting structured, element-level feedback from users of live web applications. It is designed to run in production environments — not only in QA or staging — enabling a continuous improvement loop between a product's users and its developer.

The package originates from a working experiment (`flag-feedback`, located at `C:\Users\simon\Documents\Programming\Projects\flag-feedback`) that proved the core concept but had two practical limitations: the widget's trigger was visually opinionated and fixed in position, and it had no way to associate feedback with a specific element in the running UI. The MVP addresses both limitations and removes the screenshot feature from the experiment, which added significant AI token cost at the receiving end without proportionate value.

The dominant consumption pattern for submitted feedback is processing by an AI agent. This shapes the package's design philosophy: feedback payloads are structured and information-dense rather than free-form, carrying element identifiers, interaction logs, and categorisation metadata so that an AI agent receiving the payload can act on it with minimal ambiguity.

## Stakeholders

### Client

Simon van Meegdenburg — self-commissioned. Simon is building this package primarily for use in his own web applications and is the sole decision-maker on the project. Success from the client's perspective means a package that can be dropped into any of his live applications and immediately start producing actionable, well-structured feedback — without friction for the person giving the feedback and without requiring Simon to process unstructured text manually.

### End Users

Three overlapping groups use the widget inside host applications. Their interaction with the package is identical; what differs is their relationship to the application they are giving feedback on.

**Developer / owner (Simon):** Uses the widget in his own applications to monitor and improve them. Technically proficient; comfortable with developer tools. Will be the primary tester of the package and the person most likely to notice edge-case behaviour.

**Super users:** Engaged users of a host application who have been granted access to the widget as part of a higher usage tier. They are not developers — the widget must be usable without instruction or technical knowledge. They are motivated contributors who want to help shape the product; the feedback experience should feel collaborative rather than like a support ticket form.

**Clients:** Stakeholders who have been given access to a live application and want to flag improvements. Similar to super users in technical level, but their relationship to the product is more evaluative — they are assessing and directing rather than enthusiastically contributing. Clarity and simplicity are especially important for this group.

Across all three groups, the widget must be operable without prior instruction. All three groups use the widget in the context of a live, running web application on a modern browser — both desktop and mobile.

### Developer

Simon van Meegdenburg — the sole developer. There is no external development team. Development proceeds at Simon's own pace with no fixed deadline.

## Domain Notes

**Positioning:** flag-feedback-mvp sits at the intersection of developer tooling and user feedback UX. Unlike general-purpose feedback widgets (such as Hotjar or UserVoice), this package is intentionally invisible until activated, and its activation control carries no imposed visual identity. This makes it suitable for embedding in polished, branded applications where a floating "Give feedback" button would be intrusive.

**Package distribution:** The package is published on npm as `flag-feedback` and is intended to be framework-agnostic. Host developers import it and call `initFeedback` with a host-owned activator element and configuration (see `docs/architecture/decisions/frontend.md`, `docs/architecture/decisions/backend.md`).

**Feedback schema as a contract:** The JSON payload the package POSTs to the configured endpoint is effectively a contract between the package and the receiving system (typically a backend controlled by Simon). Changes to the payload schema should be treated as breaking changes. The schema must remain machine-readable and consistent so that AI agents processing submissions do not need to handle multiple payload shapes.

**Element identification:** The package identifies targeted UI elements using CSS selector paths (up to 5 levels deep, matching the convention established in the experiment). This is sufficient for AI agent processing but relies on the host application having a reasonably stable DOM structure. Dynamic, randomly generated class names (common in some CSS-in-JS setups) may reduce the usefulness of selector-based identification — this is a known limitation, not a bug to fix in the MVP.

**Privacy responsibility:** The package captures element selectors and user-written text, but never input field values. However, element selectors can sometimes expose structural or semantic information about the host application's UI. The host application developer is responsible for determining whether use of this package in their application requires privacy disclosure to end users.
