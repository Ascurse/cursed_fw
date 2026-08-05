import assert from 'node:assert/strict';
import test from 'node:test';

import {
    assertNoTrackedArtifacts,
    assertPackageFiles,
    assertPublicExports,
    readPackedEntry,
} from './package-contract.mjs';

const PACKED_ENTRY = {
    filename: 'cursed_fw-1.0.5.tgz',
    files: [{ path: 'LICENSE' }, { path: 'dist/cursed_fw.js' }, { path: 'package.json' }],
};

const EXPECTED_ENTRY = {
    filename: 'cursed_fw-1.0.5.tgz',
    files: ['LICENSE', 'dist/cursed_fw.js', 'package.json'],
};

test('reads the pack report npm 11 prints as an array', () => {
    assert.deepEqual(readPackedEntry(JSON.stringify([PACKED_ENTRY])), EXPECTED_ENTRY);
});

test('reads the pack report npm 12 prints as an object keyed by package name', () => {
    assert.deepEqual(readPackedEntry(JSON.stringify({ cursed_fw: PACKED_ENTRY })), EXPECTED_ENTRY);
});

test('rejects a pack report of an unknown shape with an actionable message', () => {
    assert.throws(() => readPackedEntry('{}'), /npm run doctor/);
});

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

test('rejects an unexpected extra file', () => {
    assert.throws(
        () => assertPackageFiles([
            'LICENSE',
            'dist/cursed_fw.js',
            'package.json',
            'src/h.js',
        ]),
        /Package files differ/,
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

test('rejects a dropped public export', () => {
    assert.throws(() => assertPublicExports(['createApp', 'h', 'hString']));
});

test('accepts a generated directory that git does not track', () => {
    assert.doesNotThrow(() => assertNoTrackedArtifacts([]));
});

test('rejects a generated bundle that git tracks', () => {
    assert.throws(
        () => assertNoTrackedArtifacts(['packages/runtime/dist/cursed_fw.js']),
        /must not be tracked/,
    );
});

test('rejects an accidentally published internal export', () => {
    assert.throws(() => assertPublicExports([
        'createApp',
        'h',
        'hFragment',
        'hString',
        'mapTextNodes',
    ]));
});
