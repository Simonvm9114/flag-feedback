You are building Batch 3 — Element targeting of the MVP. The stories in this batch are: US-09, US-10, US-11. The done definition for this batch is `requirements/mvp/batch-3-acceptance-criteria.md`.

**Phase 3.1 — Read context**

Before taking any other action, update `CLAUDE.md` to record this command as active: if a `## Active Command` section already exists, replace it and its preceding `---` separator; otherwise append a new `## Active Command` section (preceded by `---`) stating that `/project:build-batch-3` is currently running. Only one active command may appear in `CLAUDE.md` at a time.

Read the following before writing any code. Where documents conflict, higher entries override lower ones:

1. `docs/constitution.md`
2. `requirements/mvp/batch-3-acceptance-criteria.md` — the done definition for this batch
3. `requirements/mvp/user-stories.md`
4. `requirements/mvp/architecture.md`
5. `requirements/mvp/implementation-heuristics.md`
6. `docs/functional/context.md`
7. `docs/architecture/decisions/`
8. `.hatch/deliverables/content-checklist.md` — Phase 2 content and branding requirements
9. `.hatch/deliverables/assets/` — delivered assets and branding from Phase 2

After reading all context, identify which Phase 2 content and branding requirements apply to the stories in this batch, and which implementation heuristics and architecture decisions are most relevant. These inform what "done" means for this batch beyond the acceptance criteria file — carry them into the verify step.

The project skeleton, UI kit components, and configured toolchain from Phase 4 are already in place. Do not recreate or move them — build on top of them directly.

**Phase 3.2 — Build the batch**

Build each story in this batch in dependency order: data model and schema changes first, then backend services and API layer, then UI using the existing UI kit components. Complete each story fully before starting the next.

When a document is ambiguous or silent on a specific implementation detail, apply `docs/constitution.md` and `docs/architecture/decisions/` as the authoritative reference before making a judgment call.

**Phase 3.3 — Verify**

Run the full formal checks suite: linter, formatter, and type checker. Resolve any failures before proceeding.

Then rebuild the package and refresh the sandbox so it runs the new implementation:

```
npm run build          # project root — rebuilds dist/
npm install            # sandbox/ — picks up the updated dist
```

Start the sandbox dev server (`npm run dev` from `sandbox/`) and open `http://localhost:5174` in a browser. The sandbox contains a labelled test-controls section for every user story. Use the sections relevant to this batch to manually verify each acceptance criterion against the running package. `console.error` output and intercepted `fetch` POST payloads appear in the on-screen log panel at the bottom of the page.

Then verify each criterion in `requirements/mvp/batch-3-acceptance-criteria.md`. For each one, determine whether it is met by the current implementation. If any criterion is not met, address it now.

Also verify the implementation quality dimensions identified in Phase 3.1: confirm that Phase 2 content and branding requirements are correctly applied where relevant to this batch, that the implementation heuristics are respected, and that no architecture decision is violated.

Phase 3.3 is complete when formal checks pass, every criterion in `requirements/mvp/batch-3-acceptance-criteria.md` is met, and the implementation quality checks pass.

**Phase 3.4 — Refinement loop**

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

- [ ] All acceptance criteria in `requirements/mvp/batch-3-acceptance-criteria.md` are met
- [ ] Formal checks pass
- [ ] Developer has explicitly confirmed the batch is complete

Once all items are checked, delete this file.
