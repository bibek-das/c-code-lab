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
  'array-smallest': [[7, 3, 9, -2, 4], [5], [4, 1, 1, 7], [-3, -8, -1, -8, 2, 0, 9, 1]],
  'array-even-odd': [[4, 7, 0, 9, 2], [-3], [2, 4, 6, 8], [1, 3, 5, 7]],
  'array-search': [[7, 3, 9, 3, 4], [3], [1, 2, 4], [3, 3, 3]],
  'array-occurrences': [[2, 4, 2, 7, 2], [2], [1, 3, 4], [2, 2, 2, 2]],
  'array-reverse': [[1, 2, 3, 4, 5], [9], [1, 2, 3, 4], [1, 2, 3, 4, 5, 6, 7, 8]],
};

test('twenty-five lessons and seven topics are available', () => {
  assert.equal(problems.length, 25);
  assert.equal(topics.length, 7);
  assert.equal(new Set(problems.map(p => p.id)).size, 25);
  assert.equal(problems.filter(p => p.section === 'Nested loops').length, 10);
  assert.equal(problems.filter(p => p.topic === 'arrays').length, 5);
  for (const problem of problems) assert.equal(problem.code[2], 'int main() {', problem.id);
});

test('traces highlight valid lines and end with their full output', () => {
  for (const problem of problems) for (const input of cases[problem.id]) {
    if (problem.input.type === 'array') {
      assert.ok(input.length >= problem.input.minLength && input.length <= problem.input.maxLength);
      assert.ok(input.every(value => value >= problem.input.minValue && value <= problem.input.maxValue));
    } else {
      assert.ok(input >= problem.input.min && input <= problem.input.max);
    }
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

test('array trace marks comparisons and keeps the first matching minimum index', () => {
  const lesson = problems.find(problem => problem.id === 'array-smallest');
  const steps = lesson.trace([4, 1, 1, 7]);
  assert.equal(steps.at(-1).output, 'Smallest: 1 at index 1');
  assert.deepEqual(steps.filter(step => step.phase === 'compare').map(step => step.currentIndex), [0, 1, 2, 3]);
  assert.equal(steps.find(step => step.phase === 'update').bestIndex, 1);
  assert.equal(steps.at(-1).readCount, 4);
  for (const size of [1, 5, 8]) {
    const source = lesson.codeFor(Array(size).fill(2));
    assert.ok(source.includes(`    int a[${size}];`));
    assert.equal(source.length, lesson.code.length);
  }
});

test('new array traces count, find, and reverse correctly', () => {
  const get = id => problems.find(problem => problem.id === id);
  assert.equal(get('array-even-odd').trace([-2, 0, 3, 5]).at(-1).output, 'There are 2 even numbers\nThere are 2 odd numbers\n');
  const search = get('array-search');
  assert.equal(search.trace([3, 8, 3], 3).at(-1).output, 'Found 3 at index 0');
  assert.equal(search.trace([3, 8, 3], 5).at(-1).output, 'Not found');
  assert.equal(search.trace([3, 8, 3], 3).filter(step => step.phase === 'compare').length, 1);
  assert.equal(get('array-occurrences').trace([2, 2, 7, 2], 2).at(-1).output, '3');
  const reverse = get('array-reverse').trace([1, 2, 3, 4, 5]);
  assert.deepEqual(reverse.filter(step => step.phase === 'swap-lift').map(step => step.array), [[1, 2, 3, 4, 5], [5, 2, 3, 4, 1]]);
  assert.deepEqual(reverse.filter(step => step.phase === 'swap-place').map(step => step.array), [[5, 2, 3, 4, 1], [5, 4, 3, 2, 1]]);
  assert.equal(reverse.at(-1).output, '5 4 3 2 1 ');
  for (const lesson of problems.filter(problem => problem.topic === 'arrays')) {
    for (const size of [1, 5, 8]) assert.ok(lesson.codeFor(Array(size).fill(2)).includes(`    int a[${size}];`), lesson.id);
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
      for (const [index, input] of cases[problem.id].entries()) {
        if (index === 0 || problem.codeFor) {
          const shownCode = problem.codeFor ? problem.codeFor(input) : problem.code;
          writeFileSync(source, shownCode.join('\n') + '\n');
          const build = spawnSync('gcc', ['-std=c99', '-Wall', '-Wextra', source, '-o', executable], { encoding: 'utf8' });
          assert.equal(build.status, 0, `${problem.id} input ${input}: ${build.stderr}`);
        }
        const stdin = problem.input.type === 'array' ? `${input.length}${problem.input.key === undefined ? '' : ` ${problem.input.key}`}\n${input.join(' ')}\n` : `${input}\n`;
        const run = spawnSync(executable, { input: stdin, encoding: 'utf8' });
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
