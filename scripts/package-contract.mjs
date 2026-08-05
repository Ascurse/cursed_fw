import assert from 'node:assert/strict';

// Сравнение идёт по отсортированным спискам, поэтому эталоны сортируются здесь же:
// иначе добавленный не по алфавиту экспорт даёт отказ, похожий на настоящую поломку.
const EXPECTED_PACKAGE_FILES = ['LICENSE', 'dist/cursed_fw.js', 'package.json'].sort();
const EXPECTED_PUBLIC_EXPORTS = ['createApp', 'h', 'hFragment', 'hString'].sort();

export const GENERATED_DIRECTORY = 'packages/runtime/dist';

export function assertPackageFiles(files) {
    assert.deepEqual(
        [...files].sort(),
        EXPECTED_PACKAGE_FILES,
        `Package files differ from ${EXPECTED_PACKAGE_FILES.join(', ')}`,
    );
}

// npm 11 печатает отчёт об упаковке массивом, npm 12 — объектом по имени пакета.
// Гейт разбирает обе формы, но незнакомую не угадывает: закреплённую версию проверяет doctor.
export function readPackedEntry(packOutput) {
    const report = JSON.parse(packOutput);
    const [entry] = Array.isArray(report) ? report : Object.values(report);

    assert.ok(
        entry?.filename && Array.isArray(entry.files),
        'npm pack --json reported an unknown shape; run npm run doctor to check the pinned npm version.',
    );

    return {
        filename: entry.filename,
        files: entry.files.map(({ path }) => path),
    };
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
