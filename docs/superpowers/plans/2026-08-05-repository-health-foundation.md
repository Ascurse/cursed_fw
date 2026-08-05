# Repository Health Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the deterministic local and GitHub pull-request baseline defined by Phases 0 and 1 of the approved repository-health design.

**Architecture:** Root npm scripts are the operational API shared by local agents and CI. Focused checks own lint, behavior, package-consumer integrity, and repository artifacts; `npm run check` composes them locally, while GitHub Actions runs the same checks in parallel and exposes one stable required result.

**Tech Stack:** Node.js 24.19.0 LTS, npm 11.17.0, npm workspaces, ESLint 9 flat config, Vitest 3 with jsdom, Rollup 4, Node standard-library test/process APIs, GitHub Actions.

## Global Constraints

- Preserve exactly the public exports `createApp`, `h`, `hFragment`, and `hString`.
- Keep the browser runtime standards-based ESM with zero production dependencies.
- Use npm and the committed lockfile as the canonical install path.
- Required pull-request checks must retain a measured p95 duration of at most five minutes.
- Do not add browser acceptance, performance gates, agent-eval automation, CD, publish, version-bump, release, or auto-merge behavior in this plan.
- A human approves merge and every future release.
- Follow RED, GREEN, REFACTOR for behavior; configuration failures use the failing executable command as RED.
- Run every task in its own claimed Beads issue and keep commits atomic.

## Scope and existing Beads ownership

This plan implements only the first independently useful subsystem from the approved design. It reuses existing work rather than duplicating it:

| Deliverable | Beads owner |
| --- | --- |
| ESLint 9 flat configuration | `cursed_fw-zvo` |
| Generated `dist` policy | `cursed_fw-cdq` |
| Toolchain, smoke, package gate, aggregate check | `cursed_fw-kv0.2` |
| Published API characterization | `cursed_fw-kv0.3` |
| Pull-request/main GitHub Actions and required status | `cursed_fw-7wt` |

Browser CI remains in `cursed_fw-kv0.12`; agent evaluation remains in `cursed_fw-kv0.11`; size, performance, memory, and portability trends remain in `cursed_fw-ntl.2`, `.5`, `.6`, `.7`, and `.10`. Those surfaces receive separate implementation plans after their prerequisites are ready.

## File structure

| Path | Responsibility |
| --- | --- |
| `.nvmrc` | Exact Node runtime for local tools and CI |
| `package.json` | Root operational command surface and npm version contract |
| `package-lock.json` | Reproducible workspace dependency graph |
| `scripts/doctor.mjs` | Actionable Node/npm environment validation |
| `scripts/doctor.test.mjs` | Pure tests for environment diagnostics |
| `scripts/package-contract.mjs` | Pure tarball/export contract assertions |
| `scripts/package-contract.test.mjs` | Tests for package-contract assertions |
| `scripts/check-package.mjs` | Pack, inspect, install, and execute a temporary consumer |
| `scripts/check-repository.mjs` | Detect forbidden tracked generated artifacts |
| `packages/runtime/eslint.config.js` | ESLint 9 flat configuration for runtime source/tests |
| `packages/runtime/src/__tests__/runtime-smoke.test.js` | Cheapest meaningful runtime smoke |
| `packages/runtime/src/__tests__/public-api.test.js` | Published export and application-flow characterization |
| `.github/workflows/ci.yml` | Parallel PR/main checks and stable aggregate status |
| `docs/development.md` | Current command and Definition-of-Done truth |
| `CONTRIBUTING.md` | Contributor-facing setup and verification truth |
| `.github/pull_request_template.md` | Evidence table for the new command surface |
| `docs/journal/gotchas.md` | Active traps only |
| `docs/journal/gotchas-archive.md` | Retired ESLint 9 trap for human audit |

---

### Task 1: Restore ESLint 9 flat configuration (`cursed_fw-zvo`)

**Files:**
- Create: `packages/runtime/eslint.config.js`
- Delete: `packages/runtime/.eslintrc.js`
- Modify: `packages/runtime/package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: runtime source under `packages/runtime/src/**/*.js`
- Produces: `npm run lint --workspace cursed_fw` with exit code `0`

- [ ] **Step 1: Claim the issue and capture RED**

Run:

```bash
bd update cursed_fw-zvo --claim
npm ci
npm run lint --workspace cursed_fw
```

Expected: lint exits non-zero because ESLint 9 cannot find `eslint.config.js`. Record the exact failure in the issue notes.

- [ ] **Step 2: Add explicit flat-config dependencies**

```bash
npm install --workspace cursed_fw --save-dev @eslint/js@9.31.0 globals@16.3.0
```

Expected: manifests declare direct configuration dependencies; production dependencies remain empty.

- [ ] **Step 3: Replace the legacy configuration**

Create `packages/runtime/eslint.config.js`:

```js
import js from '@eslint/js';
import globals from 'globals';

export default [
    { ignores: ['dist/**'] },
    js.configs.recommended,
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
        },
    },
];
```

Delete `packages/runtime/.eslintrc.js`. Do not reformat unrelated source unless an active ESLint rule blocks the command.

- [ ] **Step 4: Verify GREEN**

```bash
npm run lint --workspace cursed_fw
```

Expected: ESLint analyzes `src/**/*.js` and exits `0`.

- [ ] **Step 5: Commit and close**

```bash
git add packages/runtime/eslint.config.js packages/runtime/.eslintrc.js packages/runtime/package.json package-lock.json
git commit -m "fix(tooling): [cursed_fw-zvo] восстановлен lint на ESLint 9"
bd close cursed_fw-zvo --reason "ESLint flat config проверен командой workspace lint"
```

### Task 2: Stop tracking generated runtime output (`cursed_fw-cdq`)

**Files:**
- Delete from Git index: `packages/runtime/dist/cursed_fw.js`
- Verify: `.gitignore`
- Verify: `packages/runtime/package.json`

**Interfaces:**
- Consumes: Rollup output at `packages/runtime/dist/cursed_fw.js`
- Produces: buildable tarball without a tracked `dist` diff

- [ ] **Step 1: Claim the issue and capture RED**

```bash
bd update cursed_fw-cdq --claim
npm run build --workspace cursed_fw
git status --short -- packages/runtime/dist/cursed_fw.js
```

Expected: the tracked bundle appears modified after build.

- [ ] **Step 2: Apply the generated-artifact policy**

```bash
git rm --cached packages/runtime/dist/cursed_fw.js
git check-ignore -v packages/runtime/dist/cursed_fw.js
```

Expected: Git removes the bundle from the index and the existing `/packages/runtime/dist` rule ignores future builds. Keep `prepack: npm run build`; do not delete the local generated file manually.

- [ ] **Step 3: Verify build and package behavior**

```bash
npm run build --workspace cursed_fw
test -f packages/runtime/dist/cursed_fw.js
git status --short -- packages/runtime/dist/cursed_fw.js
npm pack --workspace cursed_fw --dry-run
```

Expected: the built file exists, Git reports no `dist` modification, and the dry-run includes `dist/cursed_fw.js`.

- [ ] **Step 4: Commit and close**

```bash
git diff --cached -- packages/runtime/dist/cursed_fw.js
git commit -m "fix(package): [cursed_fw-cdq] исключён generated dist из Git"
bd close cursed_fw-cdq --reason "Build создаёт ignored dist и package dry-run включает bundle"
```

### Task 3: Pin the canonical toolchain and add `doctor` (`cursed_fw-kv0.2`)

**Files:**
- Create: `.nvmrc`
- Create: `scripts/doctor.mjs`
- Create: `scripts/doctor.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `getRuntimeProblems({ nodeVersion, npmVersion }) => string[]`
- Produces: `npm run doctor`, silent on success and actionable on mismatch

- [ ] **Step 1: Write the failing diagnostic tests**

Create `scripts/doctor.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { getRuntimeProblems } from './doctor.mjs';

test('accepts the pinned Node and npm versions', () => {
    assert.deepEqual(getRuntimeProblems({
        nodeVersion: '24.19.0',
        npmVersion: '11.17.0',
    }), []);
});

test('reports both mismatches with recovery commands', () => {
    assert.deepEqual(getRuntimeProblems({
        nodeVersion: '24.18.0',
        npmVersion: '12.0.0',
    }), [
        'Node 24.18.0 is unsupported; run nvm use 24.19.0.',
        'npm 12.0.0 is unsupported; run corepack prepare npm@11.17.0 --activate.',
    ]);
});
```

- [ ] **Step 2: Verify RED**

```bash
node --test scripts/doctor.test.mjs
```

Expected: FAIL because `scripts/doctor.mjs` does not exist.

- [ ] **Step 3: Implement the doctor**

Create `scripts/doctor.mjs`:

```js
import { execFileSync } from 'node:child_process';
import process from 'node:process';

const EXPECTED_NODE_VERSION = '24.19.0';
const EXPECTED_NPM_VERSION = '11.17.0';

export function getRuntimeProblems({ nodeVersion, npmVersion }) {
    const problems = [];

    if (nodeVersion !== EXPECTED_NODE_VERSION) {
        problems.push(`Node ${nodeVersion} is unsupported; run nvm use ${EXPECTED_NODE_VERSION}.`);
    }

    if (npmVersion !== EXPECTED_NPM_VERSION) {
        problems.push(`npm ${npmVersion} is unsupported; run corepack prepare npm@${EXPECTED_NPM_VERSION} --activate.`);
    }

    return problems;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
    const problems = getRuntimeProblems({
        nodeVersion: process.versions.node,
        npmVersion: execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim(),
    });

    if (problems.length > 0) {
        console.error(problems.join('\n'));
        process.exitCode = 1;
    }
}
```

Create `.nvmrc` containing `v24.19.0`. Add `packageManager: npm@11.17.0`, exact `engines.node`/`engines.npm`, and `doctor: node --test scripts/doctor.test.mjs && node scripts/doctor.mjs` to root `package.json`.

- [ ] **Step 4: Verify GREEN under the pinned toolchain**

```bash
nvm use
corepack prepare npm@11.17.0 --activate
npm install --package-lock-only
npm run doctor
npm ci
```

Expected: every command exits `0`; lockfile package versions/license metadata match manifests.

- [ ] **Step 5: Commit**

```bash
git add .nvmrc package.json package-lock.json scripts/doctor.mjs scripts/doctor.test.mjs
git commit -m "chore(tooling): [cursed_fw-kv0.2] зафиксирован Node и npm baseline"
```

### Task 4: Replace the sample with a behavioral smoke (`cursed_fw-kv0.2`)

**Files:**
- Delete: `packages/runtime/src/__tests__/sample.test.js`
- Create: `packages/runtime/src/__tests__/runtime-smoke.test.js`

**Interfaces:**
- Consumes: public `h`, `hString`, and `hFragment`
- Produces: a fast test proving VNode kind and child order

- [ ] **Step 1: Add the smoke test**

Create `packages/runtime/src/__tests__/runtime-smoke.test.js`:

```js
import { expect, test } from 'vitest';
import { h, hFragment, hString } from '../index.js';

test('public VNode helpers preserve node kind and child order', () => {
    const first = hString('first');
    const second = h('strong', {}, ['second']);

    expect(hFragment([first, second])).toEqual({
        type: 'fragment',
        children: [
            { type: 'text', value: 'first' },
            {
                type: 'element',
                tag: 'strong',
                props: {},
                children: [{ type: 'text', value: 'second' }],
            },
        ],
    });
});
```

- [ ] **Step 2: Prove the smoke detects a broken seam**

Temporarily change `hString()` to return `type: 'broken'`, run the focused test, verify the type mismatch, then restore `h.js`.

```bash
npm run test:run --workspace cursed_fw -- src/__tests__/runtime-smoke.test.js
git restore packages/runtime/src/h.js
```

Expected: RED with the mutation, then GREEN after restoration.

- [ ] **Step 3: Remove the tautological sample and run the suite**

```bash
git rm packages/runtime/src/__tests__/sample.test.js
npm run test:run --workspace cursed_fw
```

Expected: the behavioral smoke passes and no `expect(1).toBe(1)` remains.

- [ ] **Step 4: Commit**

```bash
git add packages/runtime/src/__tests__/runtime-smoke.test.js packages/runtime/src/__tests__/sample.test.js
git commit -m "test(runtime): [cursed_fw-kv0.2] добавлен behavioral smoke"
```

### Task 5: Add package-consumer, metadata, and aggregate checks (`cursed_fw-kv0.2`)

**Files:**
- Create: `scripts/package-contract.mjs`
- Create: `scripts/package-contract.test.mjs`
- Create: `scripts/check-package.mjs`
- Create: `scripts/check-repository.mjs`
- Modify: `package.json`
- Modify: `docs/development.md`
- Modify: `CONTRIBUTING.md`
- Modify: `.github/pull_request_template.md`
- Modify: `docs/journal/gotchas.md`
- Create: `docs/journal/gotchas-archive.md`

**Interfaces:**
- Produces: `assertPackageFiles(files: string[]): void`
- Produces: `assertPublicExports(names: string[]): void`
- Produces: `npm run check:package`, `npm run check:metadata`, and `npm run check`

- [ ] **Step 1: Write failing pure package-contract tests**

Create `scripts/package-contract.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { assertPackageFiles, assertPublicExports } from './package-contract.mjs';

test('accepts only the intended tarball files', () => {
    assert.doesNotThrow(() => assertPackageFiles([
        'LICENSE',
        'dist/cursed_fw.js',
        'package.json',
    ]));
});

test('rejects a missing bundle', () => {
    assert.throws(
        () => assertPackageFiles(['LICENSE', 'package.json']),
        /Package files differ.*dist\/cursed_fw\.js/,
    );
});

test('accepts exactly the published runtime exports', () => {
    assert.doesNotThrow(() => assertPublicExports([
        'createApp',
        'h',
        'hFragment',
        'hString',
    ]));
});
```

- [ ] **Step 2: Verify RED**

```bash
node --test scripts/package-contract.test.mjs
```

Expected: FAIL because `scripts/package-contract.mjs` does not exist.

- [ ] **Step 3: Implement the pure assertions**

Create `scripts/package-contract.mjs`:

```js
import assert from 'node:assert/strict';

const EXPECTED_PACKAGE_FILES = ['LICENSE', 'dist/cursed_fw.js', 'package.json'];
const EXPECTED_PUBLIC_EXPORTS = ['createApp', 'h', 'hFragment', 'hString'];

export function assertPackageFiles(files) {
    assert.deepEqual(
        [...files].sort(),
        EXPECTED_PACKAGE_FILES,
        `Package files differ from ${EXPECTED_PACKAGE_FILES.join(', ')}`,
    );
}

export function assertPublicExports(names) {
    assert.deepEqual([...names].sort(), EXPECTED_PUBLIC_EXPORTS);
}
```

Run `node --test scripts/package-contract.test.mjs`; expected result is PASS.

- [ ] **Step 4: Implement the real tarball consumer**

Create `scripts/check-package.mjs` using only Node standard-library modules. It must:

1. create a directory with `mkdtemp(join(tmpdir(), 'cursed-fw-package-'))`;
2. run `npm pack --workspace cursed_fw --json --pack-destination <temp>`;
3. pass `packResult[0].files.map(({ path }) => path)` to `assertPackageFiles`;
4. create a minimal `{ "type": "module", "private": true }` consumer;
5. install the generated tarball with `npm install --ignore-scripts --no-audit --no-fund <tarball>`;
6. write a consumer module that imports `* as runtime` from `cursed_fw` and prints JSON containing `Object.keys(runtime)` plus `runtime.hString('ok')`;
7. execute the consumer, parse its JSON in `check-package.mjs`, pass the export names to `assertPublicExports`, and assert the text node equals `{ type: 'text', value: 'ok' }`;
8. remove the temporary directory in `finally`.

Do not invoke the network after `npm ci`; the consumer installs the local tarball only.

- [ ] **Step 5: Add the repository artifact check**

Create `scripts/check-repository.mjs` that runs `git ls-files packages/runtime/dist` and exits non-zero with `Generated files under packages/runtime/dist must not be tracked.` when output is non-empty. This check must ignore unrelated pre-existing local changes.

- [ ] **Step 6: Compose the root scripts**

Add these root scripts without shell-specific syntax:

```json
{
  "scripts": {
    "doctor": "node --test scripts/doctor.test.mjs && node scripts/doctor.mjs",
    "lint": "npm run lint --workspace cursed_fw",
    "test:run": "npm run test:run --workspace cursed_fw",
    "build": "npm run build --workspace cursed_fw",
    "check:metadata": "node scripts/check-repository.mjs",
    "check:package": "node --test scripts/package-contract.test.mjs && node scripts/check-package.mjs",
    "check": "npm run doctor && npm run check:metadata && npm run lint && npm run test:run && npm run check:package"
  }
}
```

- [ ] **Step 7: Verify the package and aggregate gates**

```bash
npm run check:package
npm run check
git status --short -- packages/runtime/dist
```

Expected: every command exits `0`, the installed consumer executes, and build/pack leaves no tracked `dist` change.

- [ ] **Step 8: Update living workflow documentation**

Update `docs/development.md`, `CONTRIBUTING.md`, and the PR template to use `npm run doctor`, `npm run check`, and the focused commands. Move the resolved ESLint 9 entry from active gotchas into a new archive file; retain the package-consumer gotcha because build success still does not prove installation.

- [ ] **Step 9: Commit and close the baseline**

```bash
git add package.json scripts docs/development.md CONTRIBUTING.md .github/pull_request_template.md docs/journal/gotchas.md docs/journal/gotchas-archive.md
git commit -m "feat(tooling): [cursed_fw-kv0.2] добавлен воспроизводимый health baseline"
bd close cursed_fw-kv0.2 --reason "Doctor, lint, behavior, package consumer и aggregate check проходят"
```

### Task 6: Characterize the published API (`cursed_fw-kv0.3`)

**Files:**
- Create: `packages/runtime/src/__tests__/public-api.test.js`
- Verify: `docs/contracts/public-api.md`
- Do not modify: `packages/runtime/src/index.js`, `app.js`, `h.js`, `dispatcher.js`

**Interfaces:**
- Consumes: the four published exports and `createApp({ state, view, reducers })`
- Produces: mutation-proven consumer behavior for export, render, reducer, emit, and instance isolation

- [ ] **Step 1: Claim the now-unblocked issue**

```bash
bd update cursed_fw-kv0.3 --claim
```

- [ ] **Step 2: Add exact export and application-flow tests**

Create `packages/runtime/src/__tests__/public-api.test.js`. The export test compares sorted keys with `['createApp', 'h', 'hFragment', 'hString']`. The application test mounts this public-only view:

```js
const view = (state, emit) => h('button', {
    on: {
        click: () => emit('increment', 2),
    },
}, [String(state.count)]);

const app = createApp({
    state: { count: 0 },
    view,
    reducers: {
        increment: (state, payload) => ({ count: state.count + payload }),
    },
});
```

Assert that mount renders `0`, one click renders `2`, and `unmount()` removes the rendered node. Add a second test with two parents and two app instances; clicking the first app must not change the second parent.

- [ ] **Step 3: Record mutation RED for each guarantee**

Perform and restore one mutation at a time:

- remove `hFragment` from `src/index.js` to fail the export test;
- call the reducer without `payload` to fail the state-flow test;
- move `const dispatcher = new Dispatcher()` outside `createApp` to fail instance isolation.

Run the focused test after each mutation and record the expected failure in Beads notes. Restore the mutated file before the next mutation.

- [ ] **Step 4: Verify GREEN without production changes**

```bash
npm run test:run --workspace cursed_fw -- src/__tests__/public-api.test.js
npm run check
git diff --exit-code -- packages/runtime/src/index.js packages/runtime/src/app.js packages/runtime/src/h.js packages/runtime/src/dispatcher.js
```

Expected: focused and aggregate checks pass; runtime production files have no diff. Confirm `docs/contracts/public-api.md` already matches the proven behavior.

- [ ] **Step 5: Commit and close**

```bash
git add packages/runtime/src/__tests__/public-api.test.js
git commit -m "test(api): [cursed_fw-kv0.3] зафиксирован опубликованный контракт"
bd close cursed_fw-kv0.3 --reason "Public exports, app flow и instance isolation имеют mutation proof"
```

### Task 7: Add parallel PR/main CI (`cursed_fw-7wt`)

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `docs/development.md`

**Interfaces:**
- Consumes: `.nvmrc`, `package-lock.json`, and root focused scripts
- Produces: jobs `metadata`, `quality`, `tests`, `package`, and stable aggregate `required`

- [ ] **Step 1: Update and claim the CI issue**

Make `cursed_fw-7wt` depend on `cursed_fw-kv0.2` and `cursed_fw-kv0.3`, then claim it. The older direct dependency on `cursed_fw-zvo` is redundant once the baseline dependency exists.

- [ ] **Step 2: Create the workflow with immutable actions**

Use these verified action SHAs:

- `actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd` (`v6.0.2`)
- `actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e` (`v6.4.0`)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  metadata:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
      - uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # v6.4.0
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run check:metadata

  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
      - uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # v6.4.0
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run lint

  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
      - uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # v6.4.0
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run test:run

  package:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
      - uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # v6.4.0
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run check:package

  required:
    if: ${{ always() }}
    needs: [metadata, quality, tests, package]
    runs-on: ubuntu-latest
    steps:
      - run: |
          test '${{ needs.metadata.result }}' = 'success'
          test '${{ needs.quality.result }}' = 'success'
          test '${{ needs.tests.result }}' = 'success'
          test '${{ needs.package.result }}' = 'success'
```

- [ ] **Step 3: Verify local parity before push**

```bash
npm ci
npm run check
git diff --check
```

Expected: local baseline exits `0`; workflow uses no secrets, write permissions, publish action, floating action tags, or CI-only check logic.

- [ ] **Step 4: Observe the real GitHub surface**

Push the task branch and open a pull request. Observe one successful run where all four parallel jobs and `required` pass. Push a documentation-only follow-up commit while the prior run is active and verify the obsolete run is cancelled. Record run URLs and job durations in Beads notes.

- [ ] **Step 5: Update the current workflow truth**

Update `docs/development.md` to name `CI / required` as the branch-protection check and state that PR and `main` run the same focused root commands. Do not claim the five-minute p95 budget until at least 20 relevant runs exist; record the candidate budget and measurement rule.

- [ ] **Step 6: Commit, request human branch-protection approval, and close**

```bash
git add .github/workflows/ci.yml docs/development.md
git commit -m "ci(quality): [cursed_fw-7wt] добавлен обязательный health baseline"
```

After the workflow is green, request human approval to make `CI / required` mandatory for `main`. Verify the rule after approval, then close `cursed_fw-7wt` with run and branch-protection evidence.

## Final verification for this plan

Run on one clean commit after all seven tasks:

```bash
nvm use
corepack prepare npm@11.17.0 --activate
npm ci
npm run doctor
npm run lint
npm run test:run
npm run check:package
npm run check:metadata
npm run check
git diff --check
git status --short
bd lint cursed_fw-zvo cursed_fw-cdq cursed_fw-kv0.2 cursed_fw-kv0.3 cursed_fw-7wt
bd dep cycles
```

Expected: all npm/Git commands exit `0`, worktree is clean, dependency cycles are absent, and task metadata has no warnings. The matching GitHub commit has successful `metadata`, `quality`, `tests`, `package`, and `required` jobs. No browser, performance, agent-eval, publish, release, or auto-merge code is introduced.

## Remaining approved-design coverage

| Approved design surface | Next plan owner |
| --- | --- |
| Chromium acceptance and integrated readiness | `cursed_fw-kv0.12` after renderer prerequisites |
| Reproducible fresh-agent evaluation | `cursed_fw-kv0.11` |
| Size/startup trends | `cursed_fw-ntl.5` |
| Memory and leak trends | `cursed_fw-ntl.6` |
| Compatibility lanes | `cursed_fw-ntl.7` |
| Statistical budgets and regression promotion | `cursed_fw-ntl.10` |
| Nightly/weekly orchestration across those artifacts | `cursed_fw-84m.1`, blocked by the rows above |
