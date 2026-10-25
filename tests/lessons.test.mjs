import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { problems, topics } from '../dist/assets/problems.js';

const cases = {
  'print-1-to-n': [1, 4, 8], 'print-n-to-1': [1, 4, 8],
  'sum-first-n': [1, 4, 10], 'sum-even': [1, 2, 6, 12],
  'multiplication-table': [1, 3, 12], 'count-digits': [1, 10, 482, 9999],
  'reverse-number': [1, 10, 482, 1200, 9999], 'sum-digits': [1, 10, 482, 9999],
  factorial: [0, 1, 5, 8], 'prime-check': [1, 2, 4, 7, 9, 25],
  'nested-square': [1, 3, 6], 'nested-rectangle': [1, 5, 6],
  'nested-growing': [1, 5, 6], 'nested-shrinking': [1, 5, 6],
  'nested-growing-while': [1, 5, 6], 'nested-growing-countdown': [1, 5, 6],
  'nested-shrinking-while': [1, 5, 6], 'nested-number-growing': [1, 5, 6],
  'nested-number-shrinking': [1, 5, 6], 'nested-binary': [1, 5, 6],
};

test('twenty lessons and seven topics are available', () => {
  assert.equal(problems.length, 20);
  assert.equal(topics.length, 7);
  assert.equal(new Set(problems.map(p => p.id)).size, 20);
  assert.equal(problems.filter(p => p.section === 'Nested loops').length, 10);
});

test('traces highlight valid lines and end with their full output', () => {
  for (const problem of problems) for (const input of cases[problem.id]) {
    assert.ok(input >= problem.input.min && input <= problem.input.max);
    const steps = problem.trace(input);
    assert.ok(steps.length > 0, problem.id);
    assert.equal(steps.at(-1).phase, 'done', problem.id);
    for (const step of steps) {
      assert.ok(step.line >= 1 && step.line <= problem.code.length, `${problem.id}: line ${step.line}`);
      assert.equal(typeof step.detail, 'string');
      assert.equal(typeof step.output, 'string');
    }
  }
});

test('nested patterns have the intended shape for input 5', () => {
  const expected = {
    'nested-square': ['* * * * *', '* * * * *', '* * * * *', '* * * * *', '* * * * *'],
    'nested-rectangle': Array(5).fill('* * * * * * *'),
    'nested-growing': ['*', '* *', '* * *', '* * * *', '* * * * *'],
    'nested-shrinking': ['* * * * *', '* * * *', '* * *', '* *', '*'],
    'nested-growing-while': ['*', '* *', '* * *', '* * * *', '* * * * *'],
    'nested-growing-countdown': ['*', '* *', '* * *', '* * * *', '* * * * *'],
    'nested-shrinking-while': ['* * * * *', '* * * *', '* * *', '* *', '*'],
    'nested-number-growing': ['1', '1 2', '1 2 3', '1 2 3 4', '1 2 3 4 5'],
    'nested-number-shrinking': ['1 2 3 4 5', '1 2 3 4', '1 2 3', '1 2', '1'],
    'nested-binary': ['1', '0 1', '1 0 1', '0 1 0 1', '1 0 1 0 1'],
  };
  for (const problem of problems.filter(p => p.section === 'Nested loops')) {
    const rows = problem.trace(5).at(-1).output.trim().split('\n').map(row => row.trim());
    assert.deepEqual(rows, expected[problem.id], problem.id);
    assert.ok(problem.trace(5).some(step => step.phase === 'print' && step.cell), problem.id);
  }
});

const gccAvailable = spawnSync('gcc', ['--version'], { encoding: 'utf8' }).status === 0;
test('trace output matches compiled C code', { skip: !gccAvailable }, () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'c-code-lab-'));
  const source = path.join(directory, 'lesson.c');
  const executable = path.join(directory, 'lesson.exe');
  try {
    for (const problem of problems) {
      writeFileSync(source, problem.code.join('\n') + '\n');
      const build = spawnSync('gcc', ['-std=c99', '-Wall', '-Wextra', source, '-o', executable], { encoding: 'utf8' });
      assert.equal(build.status, 0, `${problem.id}: ${build.stderr}`);
      for (const input of cases[problem.id]) {
        const run = spawnSync(executable, { input: `${input}\n`, encoding: 'utf8' });
        assert.equal(run.status, 0, `${problem.id} input ${input}: ${run.stderr}`);
        assert.equal(problem.trace(input).at(-1).output, run.stdout.replace(/\r\n/g, '\n'), `${problem.id} input ${input}`);
      }
    }
  } finally {
    for (const file of [source, executable]) {
      try { unlinkSync(file); } catch { /* File may not have been created. */ }
    }
    rmdirSync(directory);
  }
});
