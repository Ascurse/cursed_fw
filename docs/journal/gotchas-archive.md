# Gotchas archive

Gotchas that no longer apply because the underlying problem was fixed. Kept for history, not for
retrieval before editing. Newest entries go first.

## 2026-08-05 — ESLint 9 ignores the legacy configuration by default

**Symptom:** `npm run lint --workspace cursed_fw` exits before checking source and reports that no `eslint.config.*` exists.
**Cause:** The package uses ESLint 9 with a legacy `.eslintrc.js` configuration.
**Workaround:** Migrate intentionally to flat config and verify the actual source; do not report lint coverage from dependency installation or editor diagnostics.
**Resolved:** Migrated `packages/runtime` to flat config in `eslint.config.mjs`; `.eslintrc.js` no longer exists.
**Where in code:** [packages/runtime/package.json](../../packages/runtime/package.json), [packages/runtime/eslint.config.mjs](../../packages/runtime/eslint.config.mjs).
