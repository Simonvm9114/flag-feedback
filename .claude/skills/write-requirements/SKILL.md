---
name: write-requirements
description: Generates requirements documentation (user stories, acceptance criteria, out-of-scope) for a feature in an AI-native MVP project. Invoke before any implementation of a new feature begins — a feature without requirements documentation should not be built. If the developer mentions wanting to add or implement something new, trigger this skill before any code is written.
---

# Write Requirements Documentation

Generate requirements documentation for a feature or feature set. This skill is reusable for any feature added throughout the project lifecycle.

---

## Usage

When invoked, identify the feature name and write to `requirements/{feature-name}/`. Create this folder if it does not exist.

If no feature name is specified, derive a short, descriptive name from the feature being discussed — for example `user-notifications` or `export-pipeline`. This name becomes the folder name and the permanent identifier for this feature's requirements. Confirm the chosen name with the developer before creating the folder.

The `requirements/` folder is a **permanent, lifecycle-persistent workspace** — it is not cleaned up after the MVP is delivered. Each new feature is scoped here before implementation begins.

---

## The Three Documents

### 1. user-stories.md

User stories describe what each type of user needs to be able to do, written from the user's perspective rather than the system's.

**Format:**
```markdown
# [Feature Set / MVP] — User Stories

## [Role or Feature Area]

**[US-01] Story title**
As a [role], I want to [action] so that [outcome].
```

Write each story at the grain of a single, implementable piece of functionality. A story that covers a broad capability ("the user can manage their account") is too coarse — a coding agent can't translate it into a discrete task without making assumptions about scope. The outcome should describe value to the user, not system behaviour, because "the user can see their balance" is verifiable where "the ledger table is updated" is not.

Roles used in stories must be defined in `docs/functional/glossary.md` or `docs/functional/context.md`. An undefined role invites the agent to guess what that user type wants. Number each story — acceptance criteria reference stories by ID, and stable numbering is what keeps the two documents in sync.

If a questionnaire section is too vague to derive specific user stories, write what can be inferred and mark the gap: `<!-- TODO: clarify expected behaviour for [scenario] -->`. Flag this to the developer before proceeding — a vague story produces a vague implementation.

### 2. acceptance-criteria.md

Acceptance criteria define when a story or feature is complete. An agent uses this document at the **end** of implementation to verify completeness — not at the beginning. Keeping them separate from user stories reflects this: the agent reads user-stories.md to understand what to build, then reads acceptance-criteria.md to confirm it's done.

**Format:**
```markdown
# [Feature Set / MVP] — Acceptance Criteria

## [US-01] Story title

- [ ] [Criterion]
- [ ] [Criterion]
```

Each criterion must be observable without interpretation — a human or agent should be able to evaluate it against the running application and reach a clear yes or no. Subjectivity is the enemy here: "the interface is intuitive" cannot be verified; "the user completes registration in under 3 steps without consulting help documentation" can be.

If a criterion requires a specific threshold — timing, count, error rate, character limit — state it explicitly. Vague thresholds ("fast", "minimal", "reasonable") defer the decision to implementation time, which is the wrong moment.

If a story has no clear acceptance criterion yet, mark it `<!-- TODO: acceptance criterion needed for [US-XX] -->` and flag it. An unverifiable story will be built to the agent's interpretation of "done".

### 3. out-of-scope.md

A definitive list of what is explicitly excluded from this feature set. This document is a **guardrail**: before implementing anything, a coding agent checks whether it appears here. If it does, the agent stops and asks for confirmation before proceeding. Without this list, an agent expanding scope feels like helpfulness — it has no way to know it's doing something unwanted.

**Format:**
```markdown
# [Feature Set / MVP] — Out of Scope

The following items are explicitly excluded from this feature set:

| Item | Reason / Deferral Note |
|------|------------------------|
| [Feature or capability] | [Brief reason: deferred to phase 2, out of budget, not needed for MVP, etc.] |
```

Include everything that was explicitly deferred, not just what was rejected. A future developer or agent consulting this document should be able to understand why each item was excluded — "deferred to phase 2" is more useful than a bare item with no explanation.

---

## Where to Find Input

- The feature brief or specification provided by the developer
- `docs/functional/glossary.md` — for role and term definitions
- `docs/constitution.md` — for non-negotiable constraints
- `requirements/mvp/out-of-scope.md` — previously deferred items may now be in scope and can be promoted

---

## Output

Before writing, verify: every user story has a corresponding acceptance criterion entry; no acceptance criterion is subjective or requires interpretation to evaluate; the out-of-scope list captures everything mentioned as deferred, not only what was explicitly rejected.

Write three files to the target folder:
1. `user-stories.md`
2. `acceptance-criteria.md`
3. `out-of-scope.md`

Replace placeholder content if the files already exist.

All output must be in **English**.
