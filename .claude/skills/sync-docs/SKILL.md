---
name: sync-docs
description: Scans all authoritative documents (constitution, context, glossary, requirements) and all derivative documents (architecture decisions, architecture overview, MVP architecture spec, vision, implementation heuristics) to add missing citations, replace stale duplicate facts with pointers, and correct contradictions. Use this skill whenever a document has been written or revised in the current phase, whenever you suspect a constraint in one document is not reflected in another, or whenever an agent reading multiple documents has flagged a conflict. Safe to re-run — applying it a second time produces the same result as the first.
---

# Sync Documentation

Keeps the project's document set internally consistent by adding missing citations to derivative documents and replacing uncited duplicate facts with pointers. Run this skill after any phase that writes or revises documentation.

A document set without citations drifts: the same constraint gets restated in multiple places, and when the source changes, the restatements don't. An agent reading a derivative document in isolation has no way to know a fact it's relying on is stale. Citations make the source of every constraint visible and machine-scannable — so that when a constraint changes, the derivative can be updated in one place rather than hunted across the document set.

---

## Document Tiers

Two tiers determine who is authoritative when documents conflict:

**Authoritative documents** — the source of truth. Never modify these to match a derivative.

| Document                                  | Authority over                                            |
| ----------------------------------------- | --------------------------------------------------------- |
| `docs/constitution.md`                    | Non-negotiable principles and hard constraints            |
| `docs/functional/context.md`              | Domain background, stakeholder profiles, business context |
| `docs/functional/glossary.md`             | Term definitions                                          |
| `requirements/mvp/user-stories.md`        | What users need the system to do                          |
| `requirements/mvp/acceptance-criteria.md` | What "done" means per story                               |
| `requirements/mvp/out-of-scope.md`        | What is explicitly excluded                               |

**Derivative documents** — produced by phases. Rewrite these when they contradict an authoritative source.

| Document                                        | Derives from                                         |
| ----------------------------------------------- | ---------------------------------------------------- |
| `docs/architecture.md`                          | All authoritative documents                          |
| `docs/architecture/decisions/` (all files)      | Authoritative documents + Phase 3 dialogue           |
| `docs/architecture/vision.md`                   | Authoritative documents + all architecture decisions |
| `requirements/mvp/architecture.md`              | All of the above (if present)                        |
| `requirements/mvp/implementation-heuristics.md` | Architecture + requirements (if present)             |

---

## Checks to Apply

Read all existing documents from both tiers. For each derivative document, apply these checks in order:

**1. Constitution citations**

Any statement that restates a constraint from `docs/constitution.md` without citing its source should have `(see docs/constitution.md, Principle N)` appended inline. Locate the matching principle first — if the statement is a close paraphrase rather than an exact match, verify the intent before citing. If no matching principle exists, the restatement may have been invented; flag it to the developer rather than guessing.

**2. Glossary citations**

Any glossary term used in a derivative document in a way that could be ambiguous to a reader unfamiliar with the project should be cited on its first occurrence in that document: `(see docs/functional/glossary.md)`.

**3. Cross-document duplication**

If a substantive fact — a constraint, a threshold, a technical choice — appears verbatim or near-verbatim in more than one derivative document without one citing the other, retain it in the most specific document (the one whose primary subject is that fact) and replace the duplicate with a pointer: `(see docs/architecture/decisions/[file].md, [section])`.

**4. Contradictions**

If a statement in a derivative document contradicts its authoritative source — for example, a decision file restates a cap that differs from the constitution — rewrite the derivative to match the authoritative source. Flag each correction to the developer with a brief note: what was changed, which document is authoritative, and why the derivative was stale. Do not silently correct — the developer needs to know.

---

## Fallback

Read only the documents that currently exist. Skip any document listed above that is not yet present — do not flag absent documents as gaps unless `docs/constitution.md` or `docs/functional/glossary.md` is missing. Both are required for citation verification; flag their absence and stop if either is not found.

---

## Citation Format

Use this format throughout:

```
(see docs/constitution.md, Principle 3)
(see docs/functional/glossary.md)
(see docs/architecture/decisions/frontend.md, Decision: Rendering Model)
```

Place citations inline, immediately after the statement they support. Do not use footnotes or a references section at the end of a document.

---

## Output Quality Check

Before finishing, verify:

- [ ] Every non-negotiable constraint restated in a derivative document now cites its constitution principle
- [ ] No substantive fact appears verbatim in two derivative documents without one citing the other
- [ ] Every contradiction found has been corrected in the derivative and flagged to the developer
- [ ] No authoritative document was modified — only derivative documents are changed by this skill

All output must be in **English**.
