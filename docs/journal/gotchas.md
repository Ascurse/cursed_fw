# Gotchas

Non-obvious traps that have already cost investigation time. Newest entries go first. Each entry links to the relevant code so agents can retrieve it before editing.

## 2026-08-05 — A green build does not prove a usable package

**Symptom:** Rollup can produce a valid bundle while the tracked `dist` remains stale or `npm pack --dry-run` fails during prepack.
**Cause:** Build, repository artifact state, lifecycle scripts, and packed consumer resolution are separate surfaces.
**Workaround:** Verify build, package dry-run, tarball contents, and an installed consumer fixture independently; require a clean-tree check after generation.
**Where in code:** [packages/runtime/package.json](../../packages/runtime/package.json), [packages/runtime/rollup.config.mjs](../../packages/runtime/rollup.config.mjs), [packages/runtime/dist/cursed_fw.js](../../packages/runtime/dist/cursed_fw.js).

## 2026-08-05 — Full rerender loses browser DOM identity

**Symptom:** An input value may update, but focus moves to `document.body`; multi-step interactions such as add or edit become unreliable even when unit tests are green.
**Cause:** Every command destroys the previous VNode DOM and mounts a new tree, replacing the focused element.
**Workaround:** Preserve this failure in a browser acceptance test, then replace teardown/remount with incremental patching that reuses compatible nodes.
**Where in code:** [packages/runtime/src/app.js](../../packages/runtime/src/app.js), [packages/runtime/src/destroy-dom.js](../../packages/runtime/src/destroy-dom.js), [packages/runtime/src/mount-dom.js](../../packages/runtime/src/mount-dom.js), [examples/ch02/TODO.js](../../examples/ch02/TODO.js).

## 2026-08-05 — ESLint 9 ignores the legacy configuration by default

**Symptom:** `npm run lint --workspace cursed_fw` exits before checking source and reports that no `eslint.config.*` exists.
**Cause:** The package uses ESLint 9 with a legacy `.eslintrc.js` configuration.
**Workaround:** Migrate intentionally to flat config and verify the actual source; do not report lint coverage from dependency installation or editor diagnostics.
**Where in code:** [packages/runtime/package.json](../../packages/runtime/package.json), [packages/runtime/.eslintrc.js](../../packages/runtime/.eslintrc.js).
