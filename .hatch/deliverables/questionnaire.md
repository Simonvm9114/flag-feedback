# Project Intake Questionnaire

This is the project intake questionnaire. It records the foundational information gathered during the intake interview and serves as the primary input for documentation generation in Phase 1.

---

## 1. Purpose & Goal

_What is the application or website for? What problem does it solve, for whom, and why now? Include any relevant background on the domain or market context._

**Answer:**

flag-feedback-mvp is a framework-agnostic JavaScript package that can be imported into any web application — in production or test environments — to collect structured feedback on the running UI. It builds on an existing experiment located at `C:\Users\simon\Documents\Programming\Projects\flag-feedback` and addresses two key limitations of that experiment: the widget's trigger is currently fixed in position and carries its own visual style, and it does not support giving feedback on a specific element in the UI.

The MVP improves on the experiment in three ways. First, the trigger component has no built-in visual appearance and no fixed position; developers drop it anywhere in their application's DOM and it inherits the container's styling. Second, users can click on any element in the UI to select it and attach a comment to it — enabling targeted, element-level feedback without requiring an active recording session. Third, feedback is categorised at submission time as one of three types: design request, feature request, or bug fix request. Feedback is still POSTed as JSON to a developer-configured endpoint and stored in whatever database the receiving server manages.

The screenshot capture feature present in the experiment is explicitly removed in the MVP.

---

## 2. Minimum Success Definition

_What must the MVP be able to do for it to be considered a success on day one? Describe the minimum functionality that delivers real value to the end user. Be as specific as possible — this directly determines what gets built._

**Answer:**

The MVP is a success on day one if it can do the following:

1. **Trigger placement** — a trigger component with no built-in visual style can be dropped anywhere in a host application's DOM, and its appearance is determined entirely by the container element the developer places it in.
2. **Feedback categorisation** — when submitting feedback, the user can choose between three types: design request, feature request, or bug fix request.
3. **Element-level feedback** — the user can activate an element-targeting mode via an explicit mechanism (separate from the recording controls). While this mode is active, clicking any element in the UI selects it and opens a prompt to attach a written comment to that element. Outside of this mode, the application behaves normally and the user can interact with it without interference. The selected element is identified in the feedback payload (e.g. via its CSS selector or equivalent identifier).
4. **Interaction recording** — the existing interaction-capture behaviour from the experiment is retained: the user can start a recording session, interact with the page, stop recording, and have those interactions included in the feedback submission.
5. **Submission** — the complete feedback package (comment, category, targeted element if any, recorded interactions) is POSTed as JSON to a developer-configured endpoint.

The more ambitious "intercept every click during recording to offer a comment-or-continue dialogue" is explicitly deferred beyond the MVP.

---

## 3. Explicit Out-of-Scope

_What is explicitly NOT part of this MVP? List features, integrations, user flows, or use cases that are intentionally deferred or excluded. Being specific here prevents scope creep during the build phase._

**Answer:**

The following are explicitly excluded from the MVP:

- **Screenshot capture** — the screenshot and annotation feature present in the experiment is removed. It added marginal value and significantly increased the token cost when feedback was processed by an AI agent. It may be reconsidered in a future version.
- **Real-time click interception during recording** — the more ambitious flow in which every click during a recording session opens a "comment or continue?" dialogue is deferred. The MVP handles element-level targeting separately, outside of active recording sessions.
- **Backend / server implementation** — the package only handles the client side. It POSTs a JSON payload to a developer-configured endpoint; the receiving server and database are entirely outside the scope of this package.
- **Built-in authentication or access control** — managing which users of a host application have access to the widget is left to the host application. The package does not implement tiers, permissions, or user identity.
- **Framework-specific bindings** — the MVP is a vanilla JS / Web Component implementation. React, Vue, or other framework wrappers are not part of this release.

---

## 4. Stakeholders

_Who is involved in this project? For each stakeholder, describe their role, their domain knowledge, and what success looks like from their perspective._

**Client:**
(Who commissioned the project, their background, their goals, and any constraints they bring)

**End Users:**
(Who will use the application — their technical level, their context of use, and how the user base might evolve over time)

**Developer:**
(Who is building it, relevant technical expertise, and any constraints on their side)

**Answer:**

**Client:** Simon van Meegdenburg — the project is self-commissioned. Simon is building this package primarily for use in his own applications and is both the decision-maker and the developer. Success from the client's perspective means a package he can import into his own live applications to collect actionable improvement feedback without friction.

**End Users:** Three overlapping groups will use the widget inside host applications. First, Simon himself, reviewing and improving his own products. Second, "super users" — engaged users of a given application who are granted access to the widget as part of a higher usage tier, allowing them to contribute feedback as active collaborators rather than passive users. Third, clients who have been given access to a live application and want to flag improvements. Across all groups, technical level varies; the widget must be intuitive enough for non-developers to use without instruction. The context of use is a live, running web application, not a staging or review environment specifically — the goal is continuous improvement of production software.

**Developer:** Simon van Meegdenburg. He built the existing `flag-feedback` experiment and has full context on the codebase. No external development team is involved.

---

## 5. Constraints

_What constraints apply to this project? Consider all relevant dimensions:_

- **Technical:** High-level platform and device requirements only — for example, which devices or operating systems the MVP must support, whether it must work offline, or whether there are hard integration requirements with existing systems. If the client or developer already uses a specific code repository platform (GitHub, GitLab, Bitbucket) or has an existing hosting provider account, note it here — these are infrastructure constraints that affect the CI/CD and deployment choices made in Phase 3. Do not choose frameworks, tools, or infrastructure here — those decisions are made in Phase 3 (Architecture), where the full project context is available and trade-offs can be properly evaluated.
- **Legal / Compliance:** data privacy, regulations, licensing, or accessibility requirements
- **Budget:** any financial limits on tooling, infrastructure, or third-party services
- **Timeline:** deadlines or milestones that affect the scope or approach

**Answer:**

- **Technical:** The package targets all modern browsers on both desktop and mobile — no specific minimum version beyond current evergreen standards. It must work as a vanilla JS / Web Component that can be dropped into any web application regardless of framework. The package will be distributed via npm. GitHub is the code repository and will be used for CI/CD (e.g. automated publishing on release). No separate hosting provider is required.
- **Legal / Compliance:** No specific data privacy regulations, accessibility requirements, or licensing constraints have been identified for the MVP. As the widget captures element selectors and user-written text from live applications, the host application developer is responsible for ensuring appropriate disclosure to end users; the package itself carries no compliance obligations beyond what the existing experiment already handles (e.g. no capture of input values).
- **Budget:** There is no dedicated budget for this project. Third-party tooling and infrastructure should be as cheap as possible — free tiers are preferred, and paid services should be avoided unless there is no reasonable free alternative.
- **Timeline:** No deadline or milestone. The MVP will be developed at the developer's own pace.
