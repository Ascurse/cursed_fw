import assert from 'node:assert/strict';

const EXPECTED_PACKAGE_FILES = ['LICENSE', 'dist/cursed_fw.js', 'package.json'];
const EXPECTED_PUBLIC_EXPORTS = ['createApp', 'h', 'hFragment', 'hString'];

export const GENERATED_DIRECTORY = 'packages/runtime/dist';

export function assertPackageFiles(files) {
    assert.deepEqual(
        [...files].sort(),
        EXPECTED_PACKAGE_FILES,
        `Package files differ from ${EXPECTED_PACKAGE_FILES.join(', ')}`,
    );
}

export function assertNoTrackedArtifacts(trackedPaths) {
    assert.equal(
        trackedPaths.length,
        0,
        `Generated files under ${GENERATED_DIRECTORY} must not be tracked: ${trackedPaths.join(', ')}`,
    );
}

export function assertPublicExports(names) {
    assert.deepEqual(
        [...names].sort(),
        EXPECTED_PUBLIC_EXPORTS,
        `Public exports differ from ${EXPECTED_PUBLIC_EXPORTS.join(', ')}`,
    );
}
