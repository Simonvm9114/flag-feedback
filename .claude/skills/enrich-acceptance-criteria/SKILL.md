---
name: enrich-acceptance-criteria
description: Enriches each user story's acceptance criteria with a "Relevant constraints" line pointing to the specific architecture decisions, implementation heuristics, design principles, and UI kit that apply to that story. Use this skill after any phase that introduces new constraints — after architecture decisions are written (Phase 3), after the UI kit is approved (Phase 4), and after implementation heuristics and design principles are established (Phase 5). Also invoke whenever a Phase 6 agent reads the acceptance criteria and lacks a clear picture of which constraints govern a particular story. Safe to re-run at any phase — each invocation only adds constraints not already listed; nothing is ever removed from an existing entry.
---

# Enrich Acceptance Criteria

Adds a `**Relevant constraints:**` line to each user story's section in `requirements/mvp/acceptance-criteria.md`, pointing to the architecture decisions, implementation heuristics, design principles, and UI kit that a Phase 6 agent needs to consult when building and verifying that story.

Acceptance criteria are written in Phase 1, before architecture and implementation guidance exist. A Phase 6 agent reading only the criteria knows what "done" looks like but not which architectural constraints govern how to get there. The `**Relevant constraints:**` line bridges this gap: it is not a criterion itself but a navigation guide — the specific documents that constrain this story's implementation.

This skill accumulates entries across the project lifecycle. Each invocation appends constraints not already present; it never removes existing entries. After Phases 3, 4, and 5 have each triggered this skill, the acceptance criteria for every story contain the full picture of constraints relevant to Phase 6.

---

## Input Documents

Read the following before starting:

1. `requirements/mvp/acceptance-criteria.md` — the file to enrich
2. `requirements/mvp/user-stories.md` — to understand each story's scope and subject matter
3. `docs/architecture/decisions/` — all decision files present
4. `docs/architecture/decisions/design-principles.md` — if present
5. `requirements/mvp/implementation-heuristics.md` — if present

**Checking for a UI kit:** Read `requirements/mvp/architecture.md` or `docs/architecture/decisions/frontend.md` to identify where UI components are expected to live in the project. If that component directory exists and contains files, a UI kit is present and should be noted as a constraint for all front-end stories.

---

## Determining Relevance

For each story section, identify which documents contain constraints that directly govern building or verifying that story. The test: if this constraint were violated during implementation, would this story's verification fail or the implementation be structurally wrong?

- **Architecture decisions** are relevant to a story if they constrain the technology, pattern, or boundary the story touches. A story about user authentication is constrained by the auth decision file; a story about displaying data is constrained by the frontend decision file and potentially the data decision file.
- **Design principles** are relevant to stories that involve the modules or layers named in the principle.
- **Implementation heuristics** are relevant to stories that involve the components or patterns the heuristic addresses. Reference specific heuristic numbers when the document numbers them.
- **UI kit** is relevant to every story whose implementation involves a user-facing interface. All front-end UI must be built with kit components — note the kit as a whole, not individual components.

Do not list a document as a constraint for every story. Relevance is specific: an agent reading the constraint line should immediately understand why that document matters for this story.

---

## How to Update

For each story section (`## [US-XX] Story title`):

1. Find the `**Relevant constraints:**` line if it exists — it appears at the bottom of the section, after all criteria checkboxes and before the next `## [US-XX]` heading.
2. If the line **does not exist**: append it at the bottom of the section with the newly identified constraints.
3. If the line **already exists**: read the entries currently listed, then append only constraints not already present. Do not remove or overwrite existing entries — constraints added by earlier runs represent decisions made in prior phases that remain valid.

---

## Format

Place all constraints on a single line. Use the file path as a code span, followed by a brief parenthetical naming the relevant section or concept:

```markdown
**Relevant constraints:** `docs/architecture/decisions/frontend.md` (rendering model), `docs/architecture/decisions/auth.md` (session model), `requirements/mvp/implementation-heuristics.md` (heuristics 2, 5)
```

For the UI kit, write: `UI kit components (all front-end UI must use kit components)`.

---

## Fallback

Read only the documents that currently exist. If an expected document is not yet present — for example, `requirements/mvp/implementation-heuristics.md` before Phase 5 completes — skip it and do not note its absence as a constraint gap. The skill will be re-run after that document is written.

---

## Output Quality Check

Before finishing, verify:

- [ ] Every story section in `requirements/mvp/acceptance-criteria.md` has a `**Relevant constraints:**` line
- [ ] No story's constraint line references a document that does not currently exist in the project
- [ ] No existing constraint entry was removed or overwritten
- [ ] No constraint appears twice in the same story's line

All output must be in **English**.
