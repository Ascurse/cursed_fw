import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { assertPackageFiles, assertPublicExports } from './package-contract.mjs';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

const CONSUMER_MANIFEST = JSON.stringify({ type: 'module', private: true });

// Потребитель печатает ровно то, что видит снаружи: имена экспортов и результат
// вызова через установленный артефакт. Разбор и проверки остаются на стороне гейта.
const CONSUMER_SOURCE = `import * as runtime from 'cursed_fw';

console.log(JSON.stringify({
    exports: Object.keys(runtime),
    text: runtime.hString('ok'),
}));
`;

function run(command, args, cwd, env = process.env) {
    return execFileSync(command, args, { cwd, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
}

// Сторонний потребитель не наследует ни настройки этого репозитория, ни те, что npm run
// раскладывает по npm_config_*. Без очистки установка ловит чужой allow-scripts из ~/.npmrc
// и результат гейта начинает зависеть от машины.
const NEUTRAL_ENVIRONMENT = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.toLowerCase().startsWith('npm_config_')),
);

function runVisibly(command, args, cwd) {
    execFileSync(command, args, { cwd, stdio: ['ignore', 'inherit', 'inherit'] });
}

function packRuntime(destination) {
    // prepack печатает отчёт сборки в stdout и ломает JSON, поэтому упаковка разделена:
    // dry-run проверяет, что lifecycle-цепочка собирает пакет, второй запуск даёт чистый JSON
    // уже собранного артефакта.
    runVisibly('npm', ['pack', '--workspace', 'cursed_fw', '--dry-run'], repositoryRoot);

    const output = run('npm', [
        'pack',
        '--workspace', 'cursed_fw',
        '--json',
        '--ignore-scripts',
        '--pack-destination', destination,
    ], repositoryRoot);

    const [packed] = JSON.parse(output);

    return {
        tarball: join(destination, packed.filename),
        files: packed.files.map(({ path }) => path),
    };
}

function readConsumerReport(consumerDirectory, tarball) {
    mkdirSync(consumerDirectory);
    writeFileSync(join(consumerDirectory, 'package.json'), CONSUMER_MANIFEST);
    run(
        'npm',
        ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball],
        consumerDirectory,
        NEUTRAL_ENVIRONMENT,
    );

    writeFileSync(join(consumerDirectory, 'main.mjs'), CONSUMER_SOURCE);

    return JSON.parse(run('node', ['main.mjs'], consumerDirectory, NEUTRAL_ENVIRONMENT));
}

const workspace = mkdtempSync(join(tmpdir(), 'cursed-fw-package-'));

try {
    const { tarball, files } = packRuntime(workspace);
    assertPackageFiles(files);

    const report = readConsumerReport(join(workspace, 'consumer'), tarball);
    assertPublicExports(report.exports);
    assert.deepEqual(report.text, { type: 'text', value: 'ok' });
} finally {
    rmSync(workspace, { recursive: true, force: true });
}
