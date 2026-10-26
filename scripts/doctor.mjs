import { execFileSync } from 'node:child_process';
import process from 'node:process';

const EXPECTED_NODE_VERSION = '24.22.1';
const EXPECTED_NPM_VERSION = '11.17.0';

export function getRuntimeProblems({ nodeVersion, npmVersion }) {
    const problems = [];

    if (nodeVersion !== EXPECTED_NODE_VERSION) {
        problems.push(`Node ${nodeVersion} is unsupported; run nvm use ${EXPECTED_NODE_VERSION}.`);
    }

    if (npmVersion === null) {
        problems.push(`npm was not found on PATH; run nvm use ${EXPECTED_NODE_VERSION} to restore the bundled npm.`);
    } else if (npmVersion !== EXPECTED_NPM_VERSION) {
        problems.push(`npm ${npmVersion} is unsupported; run corepack prepare npm@${EXPECTED_NPM_VERSION} --activate.`);
    }

    return problems;
}

// npm недоступен — это ровно та поломка окружения, которую doctor обязан объяснить,
// поэтому отказ запуска превращается в диагностику, а не в стек вызовов.
function detectNpmVersion() {
    try {
        return execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim();
    } catch {
        return null;
    }
}

if (import.meta.main) {
    const problems = getRuntimeProblems({
        nodeVersion: process.versions.node,
        npmVersion: detectNpmVersion(),
    });

    if (problems.length > 0) {
        console.error(problems.join('\n'));
        process.exitCode = 1;
    }
}
