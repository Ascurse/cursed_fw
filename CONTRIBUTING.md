# Contributing

`cursed_fw` is optimized for one thing: staying easy to understand and change, for humans and for
coding agents alike. Contributions are judged against that first and against feature count last.

## Before you write code

Read [AGENTS.md](AGENTS.md) — it is the change protocol for everyone, not only for agents. Then read
the [documentation map](docs/README.md) and only the contract files covering the surface you touch.

Open an issue before a non-trivial change. A pull request that arrives without an agreed problem
statement is likely to conflict with a recorded decision in `docs/journal/decisions.md` or with an
explicit non-goal in `docs/vision.md`.

Internal task tracking, priorities, and dependencies live in Beads, not in GitHub Issues. GitHub
Issues are the inbound channel; you are not expected to run Beads to contribute.

## Setup

```bash
npm ci
npm run serve:examples
```

The second command serves `examples/` with caching disabled, which is how browser-facing behavior is
actually checked.

## Working on a change

Work on a branch, never directly on `main`.

For a behavior change, write a test that fails first and fails for the right reason, then make the
smallest change that turns it green. Refactor only while the focused checks stay green. If a fact
recorded in a contract or in `docs/architecture.md` changes, update that document in the same diff.

## Verifying

There is no aggregate check command yet. Run each and report each exit code separately:

```bash
npm run test:run --workspace cursed_fw
npm run build --workspace cursed_fw
npm pack --workspace cursed_fw --dry-run
```

`npm run lint --workspace cursed_fw` currently fails for an unrelated reason: ESLint 9 no longer
reads the `.eslintrc.js` format still present in `packages/runtime/`. The migration to
`eslint.config.js` is tracked separately — do not work around it inside an unrelated change, and do
not treat its failure as caused by your diff.

A green test run is not proof of browser behavior. Changes to rendering, events, attributes, focus,
or lifecycle need a real browser scenario against an example or a consumer fixture. A successful
build is not proof that the published package is usable; that is what the `npm pack` dry run and a
packed-tarball fixture are for.

## What gets sent back

- Speculative infrastructure: plugin systems, routers, SSR, JSX transforms, reactivity primitives,
  or compatibility layers added inside unrelated work.
- New public exports in `packages/runtime/src/index.js` that the issue did not agree to.
- Regenerated `dist/` output, debug logging, or unrelated reformatting mixed into the diff.
- Broad snapshots asserting implementation structure instead of observable behavior.
- Documentation edits that record task status or progress rather than current system truth.

## License

By contributing you agree that your contribution is licensed under the [MIT License](LICENSE).
