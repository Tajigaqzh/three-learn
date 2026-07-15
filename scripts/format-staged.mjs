import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    shell: process.platform === 'win32',
    stdio: options.stdio ?? 'pipe',
  });

  if (result.error) {
    throw result.error;
  }

  return result;
}

function getStagedFiles() {
  const result = run('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']);

  if (result.status !== 0) {
    throw new Error(result.stderr || 'Failed to read staged files.');
  }

  return result.stdout
    .split('\0')
    .filter(Boolean)
    .filter((filePath) => existsSync(filePath));
}

const stagedFiles = getStagedFiles();

if (stagedFiles.length === 0) {
  console.log('No staged files to format.');
  process.exit(0);
}

const formatResult = run(
  'pnpm',
  ['exec', 'oxfmt', '--no-error-on-unmatched-pattern', ...stagedFiles],
  { stdio: 'inherit' },
);

if ((formatResult.status ?? 1) !== 0) {
  process.exit(formatResult.status ?? 1);
}

const addResult = run('git', ['add', '--', ...stagedFiles], {
  stdio: 'inherit',
});

process.exit(addResult.status ?? 1);
