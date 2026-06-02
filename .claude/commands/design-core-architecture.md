
You are leading Phase 3a of the Greenfield MVP Template: Core Architecture. Your role is to propose well-considered stack options grounded in the project's functional requirements, facilitate a dialogue until the developer and client reach consensus on the four core decisions, then commit those decisions to documentation.

## Phase 3a.1 — Read context

Before taking any other action, update `CLAUDE.md` to record this command as active: if a `## Active Command` section already exists, replace it and its preceding `---` separator; otherwise append the following section preceded by `---`:

```markdown
## Active Command

`/project:design-core-architecture` is currently running.
```

Read the following documents in full before proposing anything:

- `docs/constitution.md`
- `docs/functional/context.md`
- `docs/functional/glossary.md`
- `.hatch/deliverables/content-checklist.md`
- `requirements/mvp/user-stories.md`
- `requirements/mvp/acceptance-criteria.md`
- `requirements/mvp/out-of-scope.md`

If any of the essential Phase 1 documents — constitution, context, and requirements — are missing or contain only a placeholder, flag it to the developer. Do not proceed until they are available.

Note any requirement-imposed constraints that limit the core stack options: external services the project must use, platforms the business is committed to, or integration obligations that narrow the technology choices. These are not decisions to be made here — they are constraints that shape what options are viable.

## Phase 3a.2 — Propose core stack options

Before forming your recommendations, reflect critically on your own tendencies. Agents are prone to recommending well-established, heavily documented patterns — not because those patterns are most suitable for the project, but because more training material exists on them. Actively consider what practitioners and teams are choosing today for systems of this type and scale. Let the functional requirements and the trade-off model below determine each recommendation, not familiarity.

Assess the four core architecture dimensions:

- **Frontend** — rendering model, framework, and delivery approach
- **Backend** — API model, runtime, and server model
- **Data** — database type, storage model, and access pattern
- **Auth** — authentication approach and session model

Rather than proposing options per individual dimension, present **three complete stack options** — each one combining all four dimensions into a coherent system that fits together. For each stack, evaluate it as a whole against these four axes:

- **Prompt coherence** — how fully and unambiguously can this stack be described in documentation an agent reads cold?
- **Failure surface** — how many things can go wrong across the stack, and how easily can failures be identified and fixed?
- **Reversibility** — how easily can individual components be swapped as requirements grow?
- **Operational simplicity** — how much ongoing human intervention does running and deploying this stack require?

Conclude with a clear recommendation grounded in the constitution, requirements, and these axes. Note any environment variables the chosen stack would introduce.

## Phase 3a.3 — Dialogue

After presenting your proposals, invite the developer and client to ask questions, challenge assumptions, and add considerations that the documents may not have captured. Engage with their input and revise any recommendation where they raise a valid point. Continue until all four dimensions are resolved and the developer confirms consensus.

Move to Phase 3a.4 when the developer explicitly signals that all core decisions are settled.

## Phase 3a.4 — Write core decisions and hand off

Read and follow `.hatch/instructions/write-core-decisions.md`.

After the instruction completes, remove the `## Active Command` section and its preceding `---` separator from `CLAUDE.md`. Then inform the developer that Commands B, C, and D can be run in any order — each covers a self-contained set of architecture decisions. The available commands are:

- `/project:design-third-party-integrations` — required integrations and their architectural implications
- `/project:design-hosting-and-vcs` — hosting, deployment, and version control strategy
- `/project:design-testing-and-checks` — testing framework and formal checks tooling

## Key Principles

The goal is three coherent stacks, not a menu. Per-element options obscure how choices interact across the system; full stacks make trade-offs visible and give the developer and client something concrete to react to.

Consensus over completeness. A clear recommendation grounded in the trade-off model moves the project forward. An exhaustive survey of options does not.

All output must be in **English**.

## Completion

Before deleting this command, verify:

- [ ] `.hatch/instructions/write-core-decisions.md` no longer exists

Once all items are checked, delete this file.
