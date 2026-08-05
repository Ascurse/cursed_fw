import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { assertNoTrackedArtifacts, GENERATED_DIRECTORY } from './package-contract.mjs';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

// Спрашиваем индекс, а не рабочее дерево: посторонние локальные правки проверку
// не касаются, значение имеет только то, что git действительно отслеживает.
const trackedPaths = execFileSync('git', ['ls-files', GENERATED_DIRECTORY], {
    cwd: repositoryRoot,
    encoding: 'utf8',
})
    .split('\n')
    .filter((line) => line.length > 0);

assertNoTrackedArtifacts(trackedPaths);
