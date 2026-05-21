import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logPath = path.join(root, 'build-output.txt');

const result = spawnSync('npm', ['run', 'build'], {
  cwd: root,
  encoding: 'utf8',
  shell: true,
});

const lines = [
  `exit: ${result.status ?? 'unknown'}`,
  '--- stdout ---',
  result.stdout ?? '',
  '--- stderr ---',
  result.stderr ?? '',
];

const text = lines.join('\n');
writeFileSync(logPath, text, 'utf8');
console.log(text);
process.exit(result.status === 0 ? 0 : 1);
