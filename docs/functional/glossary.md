# Glossary

Terms are listed alphabetically. Each entry defines the term as it is used in this project.

---

**Activator**
Any DOM element the host developer creates and places in the host application's DOM to open the feedback panel. The package attaches an activation listener to the element passed as `activator` in `initFeedback`; it does not create, wrap, or style the activator. The activator has no built-in visual style from the package; its appearance is entirely determined by the host developer's markup and stylesheet (see `docs/constitution.md`, Principle 2). The activator is distinct from the feedback panel: the activator opens the panel, and the panel is where all feedback collection takes place. Do not confuse the activator with the feedback panel.

---

**Client (stakeholder)**
A stakeholder who has been given access to a live host application and uses the feedback widget to flag desired improvements. Clients are not developers; they use the widget to evaluate and direct the product. Distinct from the developer/owner (Simon) and from super users. When the term "client" appears in requirements or user stories, it refers to this stakeholder role — not to the npm package consumer (who is called the "host developer").

---

**CSS selector path**
The identifier used to describe a targeted UI element in the feedback payload. It is derived by walking up the DOM from the selected element and composing a CSS selector up to 5 ancestor levels deep. CSS selector paths are the package's mechanism for associating feedback with a specific element; they are not guaranteed to be stable across DOM-restructuring refactors.

---

**Element target**
A specific UI element selected by a widget user during element-targeting mode. Each element target consists of the element's CSS selector path and a written comment the user attaches to it. A single feedback package can contain multiple element targets. Do not confuse an element target with an interaction event: an element target is a deliberate, user-annotated selection; an interaction event is passively recorded during a recording session.

---

**Element-targeting mode**
A mode the widget user explicitly activates via a control in the feedback panel. While this mode is active, clicking any element in the host application selects it and opens a prompt for the user to write a comment on that element. Outside of element-targeting mode, clicks in the host application behave normally and are not intercepted by the package. Element-targeting mode and recording mode are independent — a user can activate one, the other, or both within a single feedback session.

---

**Feedback category**
One of three classification labels the widget user selects before submitting feedback: **Design request**, **Feature request**, or **Bug fix**. Selecting a category is required — a submission without a category is invalid. The category is included in the feedback package and is intended to help the receiving system (typically an AI agent) route or prioritise the feedback.

---

**Feedback package**
The JSON payload that the package POSTs to the configured endpoint when the user submits feedback. A feedback package always contains: a unique ID, a timestamp, app metadata, device metadata, the feedback text (comment), the feedback category, an array of element targets (empty if none were selected), an array of interaction events (empty if recording was not used), and the recording start timestamp (null if recording was not used). The schema of the feedback package is a versioned contract; changes to it are treated as breaking changes.

---

**Feedback panel**
The UI rendered by the package when the activator is triggered. The panel is mounted in a container appended to `document.body`, inside an open Shadow Root, separate from the activator's DOM subtree (see `docs/architecture/decisions/frontend.md`). The feedback panel contains all controls for feedback collection: the comment text area, the category selector, the element-targeting mode control, the recording mode control, and the submit button. The feedback panel is owned and rendered by the package — unlike the activator, it does have a visual appearance. The panel hides automatically when recording starts or when element-targeting mode is activated, so that the application UI is unobstructed.

---

**Host application**
The web application into which the `flag-feedback` npm package is installed. The host application is responsible for creating the activator element, calling `initFeedback`, and controlling which users have access to the widget. The package has no knowledge of the host application's framework, routing, or authentication system.

---

**Host developer**
The developer who installs the package into a host application and configures it. In the context of this project, Simon is the host developer for his own applications. The host developer creates the activator element, calls `initFeedback` with the endpoint and optional metadata, and controls access by deciding which users receive an initialized activator.

---

**initFeedback**
The package's primary integration function. The host developer calls `initFeedback({ activator, endpoint, appId?, gitCommit?, gitRepo? })` to bind an activator element, validate configuration, and create the overlay UI portal. It returns a widget instance. On invalid configuration (for example a missing or disallowed endpoint), initialization fails without attaching listeners or creating portal UI (see `docs/architecture/decisions/backend.md`).

---

**Interaction event**
A single entry in the interaction log captured during a recording session. Each interaction event records the event type (e.g. click, scroll, input, form submit, navigation error), the timestamp, the CSS selector path of the target element (where applicable), and a count of how many consecutive identical events were folded into this entry. Input field values are never captured. Do not confuse an interaction event with an element target: interaction events are passively recorded; element targets are deliberately selected by the user.

---

**Recording mode**
A mode the widget user explicitly activates via a "Start recording" control in the feedback panel. While recording mode is active, the package passively captures interaction events generated by the user's activity in the host application. The feedback panel hides when recording starts; a recording indicator (a persistent pill or badge) is visible to the user. The user stops recording by interacting with the recording indicator, at which point the feedback panel reopens and shows the count of recorded interactions. Recording mode and element-targeting mode are independent.

---

**Recording indicator**
A minimal UI element rendered by the package in the body portal while recording mode or element-targeting mode is active. It indicates to the user that the mode is in progress and provides the control to stop or deactivate it. The recording indicator must not substantially obstruct the host application's UI.

---

**Super user**
An end user of a host application who has been granted access to the feedback widget as part of a higher usage tier. Super users are not developers; they are motivated contributors who want to help shape the product. The host application is responsible for granting or revoking super user access to the widget — the package has no role in this.

---

**Widget**
An informal collective term for the feedback collection system as a whole: the activator, the feedback panel, the recording indicator, and all associated behaviour. When the term "widget" appears in conversation or documentation without further qualification, it refers to the entire package as experienced by the end user — not to any single component.

---

**Widget instance**
The object returned by a successful `initFeedback` call. It exposes `destroy()` for lifecycle cleanup — removing portal UI, event listeners, and activator bindings when the host application unmounts the widget (for example on SPA route change).

---

**Widget user**
Any person who uses the feedback widget within a host application: the developer/owner (Simon), a super user, or a client stakeholder. This term is used in user stories to describe the role that interacts with the widget's UI. It is distinct from the host developer role, which describes the person who installs and configures the package.
