# Repository health and autonomous agent workflow

**Status:** approved design
**Date:** 2026-08-05
**Beads epic:** `cursed_fw-84m`

## Purpose

The repository needs an executable definition of health that helps humans and AI agents make safe changes without turning every pull request into a slow release rehearsal. Health must answer two separate questions:

1. Is the current commit safe to merge according to the project's contracts?
2. Are speed, package size, browser behavior, and agent autonomy improving or degrading over time?

The first question is answered by binary gates. The second is answered by trends. A favorable trend must never compensate for a failed contract.

## Scope

This design covers:

- the repository-health model;
- the test layers and their responsibilities;
- pull-request, main-branch, nightly, and weekly CI;
- the command surface shared by local agents and CI;
- evidence and task contracts required for autonomous agent work;
- a staged rollout and promotion policy.

Publishing, version automation, GitHub Releases, and automatic merge are out of scope. An agent may prepare a green pull request, but a human approves merge and any future release.

## Design principles

1. **Binary invariants, separate trends.** Correctness and package integrity pass or fail. Metrics are reported independently and do not produce a synthetic health score.
2. **One local reproduction path.** The fast CI baseline is available through `npm run check` from the repository root.
3. **Cheapest faithful proof.** Behavior is tested at the lowest layer that observes the real contract. Browser- and package-specific behavior is not inferred from unit tests.
4. **Fast pull-request feedback.** Required PR checks have a p95 duration of at most five minutes.
5. **Evidence before promotion.** A nightly check becomes PR-blocking only after it is deterministic, reproducible, actionable, and fast enough.
6. **Repository structure creates autonomy.** Commands, contracts, issue metadata, and diagnostics carry the workflow. Prompt length is not the primary control mechanism.

## Health model

### Required invariants

A commit is healthy only when all applicable invariants pass:

- source lint and static architecture checks;
- unit, DOM integration, and public-contract tests;
- reproducible production build;
- expected public exports and option shapes;
- successful package creation and installation in a consumer fixture;
- expected tarball contents and zero unintended production dependencies;
- no unexpected generated or stale tracked artifacts after verification;
- valid Beads metadata and dependency graph for task changes;
- required browser acceptance scenarios once promoted to the PR lane.

There is no weighted score. A package-consumer failure cannot be offset by higher coverage or a smaller bundle.

### Trend signals

The following signals are stored and compared over time without initially blocking pull requests:

- test duration and flaky rate;
- runtime bundle and package tarball size;
- browser CPU, memory, long-task, and lifecycle results;
- compatibility-lane results;
- protected contract coverage;
- first-pass and final agent-eval acceptance;
- agent elapsed time, context cost, files read, files changed, and review corrections.

Coverage is interpreted through a contract matrix, not a repository-wide percentage:

```text
contract -> unit or DOM proof -> browser proof when required -> package proof when required
```

## Stable command surface

Root workspace scripts form the public operational interface for humans, agents, and CI:

- `npm run doctor` validates the supported Node/npm versions, install state, lockfile, and required local tools;
- `npm run check` runs the complete fast PR baseline;
- `npm run test:unit` runs pure behavior tests;
- `npm run test:dom` runs jsdom integration tests;
- `npm run check:package` builds, packs, installs, and exercises a consumer fixture;
- `npm run check:browser` runs real-browser acceptance;
- `npm run check:nightly` runs the extended non-PR suite.

The exact supported Node version has one executable source of truth reused by local tooling and CI. Installs use the committed npm lockfile and `npm ci`.

Commands must fail with the violated contract, observed result, and a direct local reproduction command. CI must invoke these commands rather than maintain a second implementation of repository checks.

## Test architecture

### Pure unit tests

Use unit tests for VNode normalization and child semantics, dispatcher and reducer state transitions, reconciliation decisions, and other pure functions. These tests must not create a DOM when plain data proves the behavior.

### DOM integration tests

Use jsdom for mount, update, and unmount behavior; attributes, properties, classes, and styles; listener registration and removal; lifecycle cleanup; and node identity where browser layout, native focus, and selection are irrelevant.

### Public-contract tests

Protect the published `createApp`, `h`, `hFragment`, and `hString` exports, their documented option shapes, and contract edge cases. Tests must also detect accidental internal exports. Public behavior is asserted through consumers rather than internal module structure.

### Package-consumer tests

The package lane must:

1. produce the production build;
2. create the real npm tarball;
3. inspect the tarball contents;
4. install it into a temporary minimal consumer;
5. import only the public API;
6. execute a small behavior scenario through the installed artifact;
7. confirm the repository has no unexpected generated diff.

Build success alone is not package evidence.

### Real-browser acceptance

Chromium acceptance uses the production artifact and a real example. The initial suite covers:

- add, edit, and remove todo flows;
- typing, focus, and selection preservation;
- exact event-handler call counts;
- repeated update and unmount behavior;
- absence of unexpected browser console errors.

Traces and screenshots are retained on failure rather than on every successful run. Browser tests must not use automatic retry to hide nondeterminism.

### Test-writing policy

Behavior changes follow RED, GREEN, REFACTOR. Tests assert observable state, DOM, calls, exports, and artifacts. Broad implementation snapshots, tautological tests, and raw coverage targets are excluded.

A flaky required test is an infrastructure defect. It is diagnosed and fixed or temporarily removed from the required lane with an explicit tracked decision; it is not retried until it happens to pass.

## CI architecture

### Pull-request workflow

`ci-pr` runs these jobs in parallel:

- `metadata`: Beads validation, dependency-cycle detection, lockfile consistency, and forbidden artifact checks;
- `quality`: lint and static architecture rules;
- `tests`: unit, DOM integration, and public-contract tests;
- `package`: production build, npm tarball inspection, and consumer smoke;
- `required`: one stable aggregate result used by branch protection.

New commits cancel obsolete runs for the same pull request. The workflow reports errors but never modifies or commits contributor code.

### Main workflow

`ci-main` repeats the required baseline on the exact merged `main` commit. This detects merge-queue, branch-protection, and workflow-context differences that a source-branch run cannot prove.

### Nightly workflow

`ci-nightly` runs on a schedule and through manual dispatch. It includes:

- full Chromium acceptance;
- lifecycle and memory scenarios;
- clean-checkout install, build, pack, and consumer verification;
- compatibility lanes approved by the architecture contract;
- bundle, package-size, and performance measurements;
- timing and flaky-rate artifacts.

Nightly regressions create an actionable signal and a tracked issue, but do not initially redefine the merge health of an unrelated pull request.

### Weekly health workflow

`ci-weekly-health` runs:

- dependency and supply-chain audits;
- pinned agent-evaluation scenarios;
- a trend summary for size, performance, flaky rate, and agent autonomy;
- checks for obsolete CI runtimes, actions, and suppressions.

GitHub Checks, job summaries, and retained artifacts are sufficient until an external dashboard has a demonstrated use case.

### CI security and reproducibility

- CI permissions are minimal per job.
- Third-party actions are pinned to full commit SHAs.
- Fork pull requests do not receive repository secrets.
- Logs and artifacts exclude tokens and sensitive environment data.
- Floating dependency installs are prohibited.
- CI has no package-publish, version-bump, release, or auto-merge permissions.

## Autonomous agent workflow

### Task contract

Every implementation-ready Beads issue includes:

- a description of the observable problem or outcome;
- the selected design and responsible system boundary;
- binary acceptance criteria;
- relevant contract files and expected change area;
- exact verification commands;
- browser or package QA requirements;
- explicit exclusions;
- dependencies and parent epic.

This metadata defines scope before implementation and prevents agents from inventing proof after changing code.

### Execution loop

```text
Beads issue
  -> doctor/preflight
  -> isolated branch or worktree
  -> failing behavioral proof
  -> smallest implementation
  -> focused checks
  -> aggregate local check
  -> browser/package proof when applicable
  -> complete-diff self-review
  -> pull request
  -> CI and review feedback loop
  -> human merge
```

Agents may create branches and worktrees, implement with TDD, update directly affected living documentation, create atomic commits and a pull request, and respond to CI or review findings.

Agents stop and request a human decision for a destructive migration, an unavailable secret, conflicting requirements, material scope expansion, or an unapproved breaking public-API change. A human confirms merge and any future release.

### Evidence contract

Pull requests record each applicable surface, its local command, and fresh result. Expected rows include lint/static analysis, focused and aggregate behavior tests, package verification, browser scenario IDs, and the aggregate check.

CI reruns the evidence. A prose statement that tests should pass is not evidence.

### Repository feedback loop

Repeated agent failures drive the smallest structural correction:

- missed contract -> improve the documentation route;
- wrong module -> strengthen a boundary or architecture check;
- missing browser proof -> encode the QA gate;
- opaque failure -> improve command diagnostics;
- broad diff -> record and address the locality failure in agent evaluations.

The repository becomes easier to operate instead of accumulating compensating prompt instructions.

## Rollout

### Phase 0: honest local baseline

- restore lint;
- inventory current tests and contracts;
- add characterization tests for the public API;
- make build and package checks reproducible;
- detect stale or unexpected generated artifacts;
- add `doctor` and the aggregate `check` command.

Exit condition: a fresh agent can determine locally, through one aggregate command, whether a pull request is ready for CI.

### Phase 1: required pull-request baseline

- add `ci-pr` and `ci-main`;
- parallelize quality, test, and package jobs;
- cancel obsolete runs;
- configure one stable aggregate required check;
- measure and enforce the five-minute p95 budget.

Exit condition: an unhealthy baseline cannot be merged through the normal protected-branch path.

### Phase 2: browser confidence

- run the production example in CI;
- implement critical Chromium scenarios;
- retain failure diagnostics;
- stabilize the suite in nightly;
- promote a short browser smoke to the PR lane.

Exit condition: focus, lifecycle, and real-event regressions are observed through a browser before release-readiness is claimed.

### Phase 3: health trends

- collect size, duration, flaky-rate, browser-performance, memory, and compatibility evidence;
- publish a weekly GitHub summary;
- compare trends only against pinned commits and environments.

Exit condition: regressions are visible without introducing a synthetic health score or an external dashboard dependency.

### Phase 4: measured agent autonomy

- automate the scenarios in `docs/agent-evals.md` in disposable worktrees;
- retain prompts, versions, diffs, verification results, and rubric scores;
- analyze repeated accepted runs rather than a single best run;
- convert repeated agent failures into repository improvements.

Exit condition: autonomy claims are backed by acceptance, locality, safety, verification, time, and context-cost evidence.

## Promotion policy

A nightly check may become PR-blocking only when all conditions hold:

1. at least 20 consecutive relevant runs pass;
2. no unexplained flaky failure remains;
3. the check has one documented local reproduction command;
4. failures identify the violated contract and observed result;
5. the complete PR baseline retains a p95 duration of at most five minutes.

A promoted check may return to nightly only through an explicit tracked issue that names the failure mode, temporary risk, owner, and restoration criterion.

## Success criteria

The design succeeds when:

- every merge-blocking invariant is executable locally and in CI;
- `npm run check` matches the fast required PR baseline;
- required PR feedback remains within the five-minute p95 budget;
- public contracts map to behavioral proof;
- browser and package claims use their real consumer surfaces;
- trends cannot mask failed correctness;
- agents can take a complete Beads issue to a green pull request without undocumented hints;
- merge and release authority remains human-controlled;
- agent-eval acceptance improves without broader diffs or increasing context cost hiding failures.

## Explicit non-goals

- automated package publishing or versioning;
- automatic merge;
- a single numeric repository-health score;
- a hosted health dashboard before GitHub-native reporting proves insufficient;
- running the full browser, compatibility, performance, and agent-eval suites on every pull request;
- pursuing global coverage percentage at the expense of contract-level evidence.
