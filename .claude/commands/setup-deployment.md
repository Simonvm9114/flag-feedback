You are setting up version control and the deployment pipeline for Phase 4d of the Greenfield MVP Template. Your role is to implement the agreed branching model, configure the CI/CD pipeline, connect the hosting platform, and validate a staging deployment.

This command can run in parallel with `/project:build-ui-kit` once `/project:setup-formal-checks` is complete.

## Phase 4d.1 — Read context

Before taking any other action, update `CLAUDE.md` to record this command as active: if a `## Active Command` section already exists, replace it and its preceding `---` separator; otherwise append the following section preceded by `---`:

```markdown
## Active Command

`/project:setup-deployment` is currently running.
```

Read the following before taking any action:

- `requirements/mvp/architecture.md` — the authoritative source for deployment target type, CI/CD provider, hosting platform, environment names, build command, deploy command, and platform-specific configuration files
- `docs/architecture/decisions/version-control.md` — the agreed branching model, branch naming conventions, and branch protection rules
- `docs/architecture/decisions/hosting.md` — context on why the platform was chosen and the trade-offs accepted
- `.env.example` — the complete list of environment variables, including deployment credentials added during Phase 3
- `.env` — to verify which deployment credentials the developer has already populated

If the hosting section of `requirements/mvp/architecture.md` is incomplete, stop and flag the specific missing fields before continuing. If `docs/architecture/decisions/version-control.md` is missing, stop and flag it — this command cannot configure the branching model or CI/CD triggers without it.

## Phase 4d.2 — Set up version control and deployment pipeline

Read and follow `.hatch/instructions/setup-deployment-pipeline.md`.

This instruction covers both the version control and branching setup and the full deployment pipeline configuration. Both are set up together because CI/CD triggers, branch protection rules, and deployment targets must be configured as a coherent system.

The setup is complete when:

- The branching model matches the decisions in `docs/architecture/decisions/version-control.md`
- Protected branches are configured or their required settings are documented and flagged to the developer for manual application
- A CI/CD configuration file exists and is committed to the repository
- A platform configuration file exists and is committed to the repository
- A staging deployment has run to completion and a URL is reachable

If the staging deployment fails, diagnose and resolve before continuing.

## Phase 4d.3 — Present the staging environment

Report the staging URL to the developer and confirm the application is live and reachable. Remove the `## Active Command` section and its preceding `---` separator from `CLAUDE.md`.

## Key Principles

Version control strategy and the deployment pipeline are configured as a unit — not independently. CI/CD triggers are branch-scoped, branch protection rules depend on the CI status checks, and deployment targets map to specific branches. Configuring them together prevents misalignment that is expensive to untangle later.

The deployment pipeline must be in place before Phase 6 begins so that every feature built during the MVP can be shipped immediately without additional infrastructure work.

All output must be in **English**.

## Completion

Before deleting this command, verify:

- [ ] `.hatch/instructions/setup-deployment-pipeline.md` no longer exists

Once all items are checked, delete this file.
