import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { getRuntimeProblems } from './doctor.mjs';

const repositoryRoot = new URL('../', import.meta.url);
const readRepositoryFile = (path) => readFileSync(new URL(path, repositoryRoot), 'utf8');

test('accepts the pinned Node and npm versions', () => {
    assert.deepEqual(getRuntimeProblems({
        nodeVersion: '24.22.1',
        npmVersion: '11.17.0',
    }), []);
});

test('reports both mismatches with recovery commands', () => {
    assert.deepEqual(getRuntimeProblems({
        nodeVersion: '24.18.0',
        npmVersion: '12.0.0',
    }), [
        'Node 24.18.0 is unsupported; run nvm use 24.22.1.',
        'npm 12.0.0 is unsupported; run corepack prepare npm@11.17.0 --activate.',
    ]);
});

test('reports only the mismatched runtime', () => {
    assert.deepEqual(getRuntimeProblems({
        nodeVersion: '24.22.1',
        npmVersion: '11.16.0',
    }), [
        'npm 11.16.0 is unsupported; run corepack prepare npm@11.17.0 --activate.',
    ]);
});

test('reports an undetectable npm instead of crashing', () => {
    assert.deepEqual(getRuntimeProblems({
        nodeVersion: '24.22.1',
        npmVersion: null,
    }), [
        'npm was not found on PATH; run nvm use 24.22.1 to restore the bundled npm.',
    ]);
});

// Версии живут в четырёх местах: .nvmrc, engines, packageManager и константы doctor.
// Тест не даёт им разъехаться — расхождение падает до запуска самого doctor.
test('the pinned versions declared across the repository agree', () => {
    const manifest = JSON.parse(readRepositoryFile('package.json'));
    const nodeVersion = readRepositoryFile('.nvmrc').trim().replace(/^v/, '');
    const npmVersion = manifest.packageManager.replace(/^npm@/, '');

    assert.equal(manifest.engines.node, nodeVersion);
    assert.equal(manifest.engines.npm, npmVersion);
    assert.deepEqual(getRuntimeProblems({ nodeVersion, npmVersion }), []);
});
