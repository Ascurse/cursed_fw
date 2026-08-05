# Development workflow

## Source of work

Beads is the source of current scope, priority, dependencies, and progress. Every non-trivial change starts from a claimed issue with Description, Design, Acceptance Criteria, Notes, exact files, verification commands, and explicit exclusions.

Documentation never mirrors issue status. It records only current system truth and durable rationale.

## Implementation loop

1. Read `AGENTS.md`, the active issue, the relevant contract, and targeted journal entries.
2. Work on a feature branch or isolated worktree, never directly on `main`.
3. For behavior changes, capture a failing test for the right reason before production code.
4. Implement the smallest change that makes the test pass.
5. Refactor only while the focused checks remain green.
6. Exercise the real surface when behavior reaches a browser or package consumer.
7. Update contracts or architecture in the same diff when their facts change.
8. Review the complete diff for unrelated edits, debug output, accidental exports, and stale generated artifacts.

## Current command surfaces

Run workspace scripts from the repository root:

```bash
npm ci
npm run check
```

`npm run check` is the single aggregate gate and the project baseline. It runs, in order:

```bash
npm run doctor
npm run check:metadata
npm run lint
npm run test:run
npm run check:package
```

Each of these also runs standalone for a focused loop, plus `npm run build`:

```bash
npm run doctor         # environment sanity checks
npm run check:metadata # fails if packages/runtime/dist is tracked by git
npm run lint
npm run test:run
npm run build
npm run check:package  # packs the workspace and verifies the installed consumer
```

A single focused green command is not a green project baseline — only `npm run check` is.

## Test layers

- **Pure/unit:** VNode normalization, reducers, dispatcher, and reconciliation decisions without a browser.
- **DOM integration:** mount, patch, unmount, attributes, event listeners, and node identity in jsdom where browser layout is irrelevant.
- **Browser acceptance:** typing, focus, selection, add/edit/remove flows, and other behavior that depends on real browser events or DOM lifecycle.
- **Consumer/package:** install the generated tarball into a fixture and import only public exports.

Avoid broad snapshots of implementation structure. Assert observable DOM, state, calls at real boundaries, and package exports.

## Definition of Done

- The active issue's acceptance criteria pass with fresh command output.
- New behavior has failing-first evidence and regression coverage at the cheapest faithful layer.
- Browser-facing behavior has a real browser scenario; package changes have a packed-tarball consumer scenario.
- Public exports and contracts are intentionally unchanged or explicitly migrated.
- Documentation facts changed by the work are updated in the same diff.
- `bd lint` and `bd dep cycles` pass for task metadata changes.
- The working tree contains no temporary servers, generated caches, debug code, or unrelated files.

## Release discipline

Build output is not release evidence by itself. A release candidate must pass the aggregate checks, package dry-run, packed consumer fixture, browser example, clean-tree check, and an explicit version/compatibility review.
