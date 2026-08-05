# Agent guide

`cursed_fw` is a small frontend framework built to be easy to understand and change by both humans and AI agents. Prefer explicit data flow, narrow modules, executable contracts, and small diffs over clever abstractions.

## Start here

Before a non-trivial task:

1. Read [docs/README.md](docs/README.md) for the documentation map.
2. Read [docs/vision.md](docs/vision.md) and the relevant section of [docs/architecture.md](docs/architecture.md).
3. Read [docs/performance.md](docs/performance.md) for performance, benchmark, package-tooling, or comparative work.
4. Read only the contract files related to the surface you will change.
5. Read the active entries in `docs/journal/decisions.md` and `docs/journal/gotchas.md`. Use `docs/journal/glossary.md` for unfamiliar project terms.
6. Open the active Beads issue with `bd show <id>` and treat its scope and acceptance criteria as the task contract.

Do not read archive files from `docs/journal/` during normal task work. They exist only for human historical audits.

## Repository boundaries

- `packages/runtime/src/` contains framework behavior.
- `packages/runtime/src/index.js` is the public package boundary. Do not add public exports accidentally.
- `examples/` contains real browser consumers. Examples are executable acceptance surfaces, not disposable demos.
- `docs/contracts/` describes behavior consumers may rely on.
- `docs/journal/` records only decisions and gotchas that cannot be reconstructed cheaply from the current code.
- `benchmarks/` contains reproducible fixtures, runners, and raw evidence; it must not contain benchmark-only runtime APIs.

Keep one runtime package until a second renderer or another independently consumable product creates a real package boundary.

## Change protocol

Before editing a concrete file, search the active journal for its path or basename:

```bash
ygrep "packages/runtime/src/app.js" -p docs/journal/ --text-only
```

If the ygrep index is stale, run `ygrep index`; use a targeted `rg` only when the refreshed index still returns nothing. Never include `decisions-archive.md` or `gotchas-archive.md` in routine retrieval.

For behavior changes:

1. Identify the public or internal contract affected.
2. Add a failing behavioral test that proves the requested outcome for the right reason.
3. Make the smallest implementation change.
4. Run the task-specific unit, browser, build, and package checks from the Beads issue.
5. Update the relevant contract or architecture document in the same diff when a recorded fact changes.
6. Add a journal entry only for a durable reason, non-obvious limitation, or tool/runtime trap.

## Design rules

- Prefer plain data, pure functions, explicit parameters, and discriminated states.
- Avoid decorators, reflection, implicit globals, hidden dependency injection, and compiler-only behavior in the core runtime.
- Keep DOM concerns out of application state and VNode normalization.
- Preserve the published API unless the active issue includes an approved migration and versioning decision.
- Names explain intent. Comments explain only non-obvious reasons or platform constraints.
- Do not add speculative compatibility layers, plugin systems, routers, SSR, JSX transforms, or reactivity primitives inside unrelated work.

## Verification

The current scripts live in `packages/runtime/package.json`. Until the unified `npm run check` task is complete, use the exact commands declared by the active Beads issue and report each exit code separately.

Tests alone do not prove browser behavior. Changes to rendering, events, attributes, focus, or lifecycle require a real browser scenario against an example or consumer fixture. Build success alone does not prove the packed package is usable.

## Documentation lifecycle

- Living truth: `docs/vision.md`, `docs/architecture.md`, `docs/development.md`, and `docs/contracts/`.
- Measurement truth: `docs/performance.md` defines the protocol; versioned benchmark artifacts hold results.
- Durable rationale: `docs/journal/decisions.md`.
- Non-obvious traps: `docs/journal/gotchas.md`.
- Current work and dependencies: Beads only.

Do not put branch status, task progress, commit lists, or temporary measurements into documentation. New journal entries go at the top, use `YYYY-MM-DD`, stay within one to four sentences per field, and always link to the relevant code path when one exists.
