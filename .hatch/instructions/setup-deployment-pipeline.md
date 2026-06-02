# Set Up Version Control and Deployment Pipeline

Configure the version control and branching strategy and validate the full deployment pipeline for this MVP — branching model, CI/CD configuration, hosting platform connection, and environment structure. This instruction runs in Phase 4d, alongside the UI kit step. It is complete only when the branching strategy is implemented, a staging deployment has succeeded, and a URL is reachable — not when the configuration files are written.

Version control strategy and the deployment pipeline are configured as a unit. CI/CD triggers are branch-scoped, branch protection rules depend on CI status checks, and deployment targets map to specific branches. They must be set up together to form a coherent system.

The version control strategy and deployment pipeline must be in place before Phase 6 begins so that every feature built during the MVP is committed to the right branch and can be shipped immediately without additional infrastructure work.

## Inputs

Read the following before setting up anything:

- `requirements/mvp/architecture.md` — the authoritative source for deployment target type, CI/CD provider, hosting platform, environment names, build command, deploy command, and any platform-specific configuration files. The hosting section must contain all five required fields; if any are missing, stop and flag before continuing.
- `docs/architecture/decisions/version-control.md` — the agreed branching model, branch naming conventions, and branch protection rules
- `docs/architecture/decisions/hosting.md` — for context on why the platform was chosen and what trade-offs were accepted
- `.env.example` — the complete list of environment variables, including deployment credentials added during Phase 3
- `.env` — to verify which deployment credentials the developer has already populated

## What to set up

### Version control and branching

Implement the branching strategy recorded in `docs/architecture/decisions/version-control.md`.

Create any required long-lived branches (for example `main` and `develop` for a Gitflow model, or just `main` for trunk-based development). Set the default branch to the one the architecture decisions specify. Apply branch naming conventions to the repository if the VCS platform supports configuration-based enforcement.

Configure branch protection rules on the agreed protected branches. At minimum, apply the rules specified in `docs/architecture/decisions/version-control.md`. Common rules include requiring a passing CI status check before merge and restricting direct pushes to protected branches.

If the VCS platform does not support branch protection via committed configuration files — for example, GitHub branch protection is configured through the platform API or UI, not through a file in the repository — document the required rules clearly and flag them to the developer for manual application. Do not skip branch protection because it cannot be automated; flag it explicitly so the developer can apply it before Phase 6 begins.

### CI/CD configuration

Create the pipeline configuration file for the CI/CD provider specified in `requirements/mvp/architecture.md`. Use the provider's canonical location: `.github/workflows/deploy.yml` for GitHub Actions, `.gitlab-ci.yml` for GitLab CI, or the equivalent for other providers.

The pipeline must define three stages in sequence:

1. **Check** — run formal checks (lint, type-check, tests). Fail the pipeline if any check fails. Never deploy code that does not pass the agreed checks.
2. **Build** — produce the deployment artifact using the build command from `requirements/mvp/architecture.md`.
3. **Deploy** — push the artifact to the hosting platform using the deploy command from `requirements/mvp/architecture.md`.

Configure staging and production as separate deployment targets. If the hosting platform supports automatic preview deployments per branch or pull request, enable it — this serves as the staging environment during the MVP phase. Production deployments trigger on push to the branch specified in the architecture decisions (typically `main`).

### Hosting platform configuration

Create the platform configuration file specified in `requirements/mvp/architecture.md` — for example, `vercel.json`, `fly.toml`, or `railway.toml`. Configure it with the build command, output directory (for static targets), and production branch. Reference environment variables by name only — never hardcode secret values in configuration files.

### Environment variables

Add any deployment-specific variables not yet in `.env.example` under a clearly labelled deployment section. Common additions include CI/CD platform tokens, hosting platform project identifiers, and environment-specific base URLs.

If a required credential is missing from `.env` and cannot be deferred, stop and report exactly which variable is missing and where the developer can obtain it. Do not continue until it is supplied.

## What not to set up

Do not configure:

- Custom domains or SSL certificates — unless the architecture decisions explicitly require them for the MVP
- Production alerting, uptime monitoring, or error tracking — operational concerns addressed in later phases
- Database migrations as part of the deployment pipeline — migration strategy is determined during Phase 6 as features are built
- Multi-region distribution or CDN tuning beyond the platform's default — out of scope for the MVP

Mobile app deployment (App Store, Google Play) is out of scope for this instruction. Mobile distribution requires manual signing, certificates, and store review processes that cannot be automated at scaffold time.

## Fallback for missing input

If `docs/architecture/decisions/version-control.md` is missing or contains only a placeholder, stop immediately. Do not invent a branching model — the Phase 3 dialogue must resolve version control decisions before they can be implemented. Flag the missing document to the developer and wait.

If the hosting section of `requirements/mvp/architecture.md` does not specify the deployment target type, CI/CD provider, or hosting platform, stop immediately. Do not infer a platform or proceed with assumptions — the architecture dialogue in Phase 3 must resolve these before the pipeline can be set up. Flag the specific missing fields to the developer and wait.

If the CI/CD provider was not specified but the code repository platform is known (from `.hatch/deliverables/questionnaire.md` or `requirements/mvp/architecture.md`), you may infer the standard pairing — GitHub → GitHub Actions, GitLab → GitLab CI — and confirm with the developer before proceeding.

All output must be in **English**.

## Completion

Before deleting this instruction, verify:

- [ ] The branching model and branch naming conventions match `docs/architecture/decisions/version-control.md`
- [ ] Protected branches are configured, or the required protection rules are documented and flagged to the developer for manual application
- [ ] The default branch is set correctly
- [ ] A CI/CD configuration file exists and is committed to the repository
- [ ] A platform configuration file exists and is committed to the repository
- [ ] A staging deployment has run to completion and a URL is reachable and returns a non-error response
- [ ] No secret values are committed to the repository — only variable name references
- [ ] `.env.example` includes all deployment-specific variables added during this phase

Once all items are checked, delete this file.
