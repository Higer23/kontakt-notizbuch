import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const reportDir = process.argv[2];
assert.ok(reportDir, 'Usage: node tests/verify-test-count.mjs <report-directory>');
const statusPath = path.join(reportDir, 'status.txt');
const statuses = readFileSync(statusPath, 'utf8').trim().split(/\r?\n/).filter(Boolean);
const failures = statuses.map((line) => {
  const [name, code] = line.split('|');
  return Number(code) === 0 ? null : `${name} (exit ${code})`;
}).filter(Boolean);

let total = 0;
const breakdown = [];
for (const file of readdirSync(reportDir).filter((name) => name.endsWith('.log'))) {
  const output = readFileSync(path.join(reportDir, file), 'utf8');
  const namedChecks = (output.match(/^(?:ok\s{2,}|PASS\s+|ok\s+\d+\s+-)/gm) || []).length;
  const pythonSummary = output.match(/Ran (\d+) tests?/i);
  const count = namedChecks + (pythonSummary ? Number(pythonSummary[1]) : 0);
  total += count;
  breakdown.push(`${file.replace(/\.log$/, '')}: ${count}`);
}

console.log('Detailed test-count breakdown:');
for (const line of breakdown) console.log(`- ${line}`);
console.log(`Total independently reported checks: ${total}`);

if (failures.length) {
  console.error(`Failed suites: ${failures.join(', ')}`);
  process.exitCode = 1;
}
if (total < 30) {
  console.error(`Quality gate requires at least 30 independently reported passing tests; counted ${total}.`);
  process.exitCode = 1;
}
if (!statuses.some((line) => line.startsWith('schema|'))) {
  console.error('Schema suite did not run; refusing to pass the quality gate.');
  process.exitCode = 1;
}
