# MVP — User Stories

Roles used in these stories are defined in `docs/functional/glossary.md` and `docs/functional/context.md`.

---

## Package Integration

**[US-01] Install the package**
As a host developer, I want to install the package from npm so that I can add structured feedback collection to my application without building the capability from scratch.

**[US-02] Place the activator**
As a host developer, I want to place the activator component anywhere in my application's DOM so that it appears in a location that suits my application's layout and user experience.

**[US-03] Style the activator freely**
As a host developer, I want the activator to have no built-in visual style so that I can give it any appearance I choose using my application's existing CSS and design system.

**[US-04] Configure the submission endpoint**
As a host developer, I want to configure the URL the package POSTs feedback to so that submitted feedback is sent to my own backend and stored in my own database.

**[US-05] Pass application metadata**
As a host developer, I want to optionally supply an app ID, git commit SHA, and git repository URL so that submitted feedback packages contain enough context to identify which version and build of the application the feedback relates to.

---

## Opening the Widget

**[US-06] Open the feedback panel**
As a widget user, I want to open the feedback panel by interacting with the activator so that I can begin a feedback session.

---

## Composing Feedback

**[US-07] Write a comment**
As a widget user, I want to write a free-text comment in the feedback panel so that I can describe the feedback in my own words.

**[US-08] Select a feedback category**
As a widget user, I want to choose one of three feedback categories — Design request, Feature request, or Bug fix — so that the feedback is classified and easier to act on.

---

## Element-Level Feedback

**[US-09] Activate element-targeting mode**
As a widget user, I want to activate element-targeting mode from the feedback panel so that I can associate feedback with specific elements in the UI without interfering with normal application use when the mode is not active.

**[US-10] Select a UI element and attach a comment**
As a widget user, I want to click on any element in the application while element-targeting mode is active so that I can select that element and attach a written comment to it.

**[US-11] Target multiple elements in one session**
As a widget user, I want to target more than one UI element before submitting so that feedback covering several related elements can be captured and submitted in a single package.

---

## Interaction Recording

**[US-12] Start a recording session**
As a widget user, I want to start a recording session so that my interactions with the application are captured and included in the feedback package, giving the recipient context on how I was using the application.

**[US-13] Stop recording and return to the feedback panel**
As a widget user, I want to stop the recording session so that I can review the interaction count and proceed to complete and submit the feedback.

---

## Submission

**[US-14] Submit a combined feedback package**
As a widget user, I want to submit a single feedback package that includes my comment, my chosen category, any element targets I selected, and any recorded interactions so that the recipient receives all relevant context in one submission without me needing to submit multiple times.

**[US-15] Submit general feedback without element targets or recording**
As a widget user, I want to submit feedback with only a comment and a category — no element target and no recording — so that I can give feedback even when no specific element or interaction sequence is relevant.

**[US-16] Receive submission confirmation**
As a widget user, I want to see confirmation that my feedback was submitted successfully so that I know the submission was received and I can continue using the application.

---

## Widget Behaviour

**[US-17] Panel hides during recording**
As a widget user, I want the feedback panel to hide automatically when I start recording so that I can interact with the application naturally without the panel obscuring the UI.

**[US-18] Application interaction is unaffected outside active modes**
As a widget user, I want normal application clicks and interactions to work without any interception by the widget when neither element-targeting mode nor recording mode is active so that the widget does not disrupt my normal use of the application.
