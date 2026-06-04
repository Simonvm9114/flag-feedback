You are leading Phase 6a of the Greenfield MVP Template: Build Planning. Your role is to decompose the full MVP requirements into a sequencing plan, generate a standalone acceptance criteria document for each batch, and generate a dedicated build command for each batch. No code is written in this command.

## Phase 6a.1 — Read context

Before taking any other action, update `CLAUDE.md` to record this command as active: if a `## Active Command` section already exists, replace it and its preceding `---` separator; otherwise append the following section preceded by `---`:

```markdown
## Active Command

`/project:plan-build` is currently running.
```

Read the following documents before planning. Where documents conflict, this order is also the order of authority — higher entries override lower ones:

1. `docs/constitution.md`
2. `requirements/mvp/acceptance-criteria.md`
3. `requirements/mvp/user-stories.md`
4. `requirements/mvp/architecture.md`
5. `requirements/mvp/implementation-heuristics.md`
6. `docs/functional/context.md`
7. `docs/architecture/decisions/`
8. `.hatch/deliverables/content-checklist.md`
9. `.hatch/deliverables/assets/`

The goal is to understand the full scope of the MVP before proposing a batching plan. Let the dependencies between stories — data models, services, and UI — determine which stories belong together and which must be sequenced.

## Phase 6a.2 — Decompose into batches

Group user stories into logical batches. Each batch must satisfy two conditions: it can be implemented independently of unstarted batches, and it delivers a coherent sub-product that can be reviewed on its own.

Write the plan to `requirements/mvp/build-plan.md`:

```markdown
# MVP Build Plan

## Batch 1 — [Name]

**Stories:** US-01, US-02
**Delivers:** [Coherent sub-product]
**Rationale:** [Why these stories belong together and why this batch is sequenced here]

## Batch 2 — [Name]

...
```

## Phase 6a.3 — Generate per-batch acceptance criteria

For each batch, generate `requirements/mvp/batch-{n}-acceptance-criteria.md` containing only the acceptance criteria for the stories in that batch. Use the same format as `requirements/mvp/acceptance-criteria.md`. This document is the standalone "done" definition for the batch and is the file the batch command verifies against at completion.

Do not modify `requirements/mvp/acceptance-criteria.md` — it remains the complete reference for the full MVP.

## Phase 6a.4 — Generate batch commands

For each batch, generate a command file at `.claude/commands/build-batch-{n}.md`. Each command file must be fully self-contained. Use the following structure for every generated command, substituting the batch number, name, and story list:

---

You are building [Batch N — Name] of the MVP. The stories in this batch are: [US-XX, US-XX, ...]. The done definition for this batch is `requirements/mvp/batch-{n}-acceptance-criteria.md`.

**Phase N.1 — Read context**

Before taking any other action, update `CLAUDE.md` to record this command as active: if a `## Active Command` section already exists, replace it and its preceding `---` separator; otherwise append a new `## Active Command` section (preceded by `---`) stating that `/project:build-batch-{n}` is currently running. Only one active command may appear in `CLAUDE.md` at a time.

Read the following before writing any code. Where documents conflict, higher entries override lower ones:

1. `docs/constitution.md`
2. `requirements/mvp/batch-{n}-acceptance-criteria.md` — the done definition for this batch
3. `requirements/mvp/user-stories.md`
4. `requirements/mvp/architecture.md`
5. `requirements/mvp/implementation-heuristics.md`
6. `docs/functional/context.md`
7. `docs/architecture/decisions/`
8. `.hatch/deliverables/content-checklist.md` — Phase 2 content and branding requirements
9. `.hatch/deliverables/assets/` — delivered assets and branding from Phase 2

After reading all context, identify which Phase 2 content and branding requirements apply to the stories in this batch, and which implementation heuristics and architecture decisions are most relevant. These inform what "done" means for this batch beyond the acceptance criteria file — carry them into the verify step.

The project skeleton, UI kit components, and configured toolchain from Phase 4 are already in place. Do not recreate or move them — build on top of them directly.

**Phase N.2 — Build the batch**

Build each story in this batch in dependency order: data model and schema changes first, then backend services and API layer, then UI using the existing UI kit components. Complete each story fully before starting the next.

When a document is ambiguous or silent on a specific implementation detail, apply `docs/constitution.md` and `docs/architecture/decisions/` as the authoritative reference before making a judgment call.

**Phase N.3 — Verify**

Run the full formal checks suite: linter, formatter, and type checker. Resolve any failures before proceeding.

Then verify each criterion in `requirements/mvp/batch-{n}-acceptance-criteria.md`. For each one, determine whether it is met by the current implementation. If any criterion is not met, address it now.

Also verify the implementation quality dimensions identified in Phase N.1: confirm that Phase 2 content and branding requirements are correctly applied where relevant to this batch, that the implementation heuristics are respected, and that no architecture decision is violated.

Phase N.3 is complete when formal checks pass, every criterion in `requirements/mvp/batch-{n}-acceptance-criteria.md` is met, and the implementation quality checks pass.

**Phase N.4 — Refinement loop**

Present a summary to the developer with one entry per story in this batch: the story title, what was built, and the acceptance criteria status (met / not met).

Invite the developer to give feedback. Address any issues raised, then re-verify all batch acceptance criteria. Stay in this loop until the developer explicitly confirms the batch is complete. Once confirmed, remove the `## Active Command` section and its preceding `---` separator from `CLAUDE.md`.

**Key Principles**

The documentation package is the specification. The coding agent's assumptions are subordinate to what the documents say — and within the documents, the constitution is the final word.

Build order reflects dependency. Data models underpin services; services underpin UI. Inverting this order introduces assumptions that may break when the real data layer is in place.

The batch acceptance criteria are the only objective finish line for this batch. A story that functions but does not satisfy its criteria is not done.

Refinement is built in, not deferred. This batch is not complete until the developer explicitly confirms it — address all feedback before closing.

All output must be in **English**.

**Completion**

Before deleting this command, verify:

- [ ] All acceptance criteria in `requirements/mvp/batch-{n}-acceptance-criteria.md` are met
- [ ] Formal checks pass
- [ ] Developer has explicitly confirmed the batch is complete

Once all items are checked, delete this file.

---

## Phase 6a.5 — Present for review

Present the batching plan, the list of generated acceptance criteria files, and the list of generated command names to the developer. Invite feedback on sequencing, grouping, or batch size. If the developer requests changes, revise `requirements/mvp/build-plan.md`, regenerate the affected acceptance criteria files, and regenerate the affected commands.

Once the developer confirms the plan, remove the `## Active Command` section and its preceding `---` separator from `CLAUDE.md`. Phase 6a is then complete.

## Key Principles

Batch boundaries follow dependency and deliverability, not arbitrary sizing. A batch that cannot be reviewed as a coherent whole is too coarse; a batch that delivers nothing a developer can evaluate is too fine.

No code is written in this command. The plan, the acceptance criteria files, and the generated commands are the only output.

Developer confirmation gates the transition to the first batch command. The developer should be able to read `requirements/mvp/build-plan.md` and each batch's acceptance criteria file before any implementation begins.

All output must be in **English**.

## Completion

Before deleting this command, verify:

- [ ] `requirements/mvp/build-plan.md` has been written
- [ ] Acceptance criteria files exist for every batch
- [ ] Batch command files exist for every batch
- [ ] Developer has explicitly confirmed the plan

Once all items are checked, delete this file.
