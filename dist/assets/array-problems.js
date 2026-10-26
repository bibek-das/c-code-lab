const code = [
  '#include <stdio.h>',
  '',
  'int main(void) {',
  '    int n;',
  '    scanf("%d", &n);',
  '    int a[8];',
  '    for (int i = 0; i < n; i++) {',
  '        scanf("%d", &a[i]);',
  '    }',
  '    int ans = a[0];',
  '    int ansIndex = 0;',
  '    for (int i = 0; i < n; i++) {',
  '        if (a[i] < ans) {',
  '            ans = a[i];',
  '            ansIndex = i;',
  '        }',
  '    }',
  '    printf("Smallest: %d at index %d", ans, ansIndex);',
  '    return 0;',
  '}',
];

function traceSmallest(input) {
  const a = [...input];
  const n = a.length;
  const steps = [];
  const variables = { n: null, i: null, ans: null, ansIndex: null };
  let output = '';
  let readCount = 0;
  let bestIndex = null;
  const add = (line, title, detail, changes = {}, printed = '', phase = '', currentIndex = null) => {
    Object.assign(variables, changes);
    output += printed;
    steps.push({ line, title, detail, variables: { ...variables }, output, phase, currentIndex, bestIndex, readCount });
  };

  add(3, 'Enter main', 'Execution starts in main.');
  add(4, 'Declare n', 'Reserve an integer for the array size.');
  add(5, 'Read the size', `The array has ${n} elements.`, { n });
  add(6, 'Reserve array space', 'a has room for up to eight integers.');
  add(7, 'Start reading', 'Set i to 0 so the input loop can fill the first box.', { i: 0 }, '', 'input');
  for (let i = 0; i < n; i++) {
    add(7, 'Check the input loop', `${i} < ${n} is true. Read a[${i}] next.`, {}, '', 'input', i);
    readCount = i + 1;
    add(8, `Read a[${i}]`, `Store ${a[i]} in the box at index ${i}.`, {}, '', 'read', i);
    add(7, 'Move to the next box', `i becomes ${i + 1}.`, { i: i + 1 }, '', 'input');
  }
  add(7, 'Input loop ends', `${n} < ${n} is false. The array is ready.`, {}, '', 'input-exit');

  let ans = a[0];
  bestIndex = 0;
  add(10, 'Choose the first answer', `Start with a[0] = ${ans}. A value is needed before comparisons begin.`, { ans }, '', 'best', 0);
  add(11, 'Remember its index', 'The current smallest value is at index 0.', { ansIndex: 0 }, '', 'best', 0);
  add(12, 'Start scanning', 'Set i to 0. The loop will inspect every array box.', { i: 0 }, '', 'scan');
  for (let i = 0; i < n; i++) {
    add(12, 'Check the scan loop', `${i} < ${n} is true. Look at a[${i}].`, {}, '', 'scan', i);
    const smaller = a[i] < ans;
    add(13, 'Compare values', `${a[i]} < ${ans} is ${smaller ? 'true' : 'false'}.`, {}, '', 'compare', i);
    if (smaller) {
      ans = a[i];
      bestIndex = i;
      add(14, 'Update the smallest', `ans becomes ${ans}. The highlighted box is now the best candidate.`, { ans }, '', 'update', i);
      add(15, 'Update the index', `ansIndex becomes ${i}.`, { ansIndex: i }, '', 'update', i);
    } else {
      add(13, 'Keep the answer', `${a[i]} is not smaller. Keep ${ans} at index ${bestIndex}.`, {}, '', 'keep', i);
    }
    add(12, 'Move to the next element', `i becomes ${i + 1}.`, { i: i + 1 }, '', 'scan');
  }
  add(12, 'Scan loop ends', 'Every element has been compared.', {}, '', 'scan-exit');
  add(18, 'Print the result', `The smallest value is ${ans}, first found at index ${bestIndex}.`, {}, `Smallest: ${ans} at index ${bestIndex}`, 'print-result');
  add(19, 'Finish', 'main returns 0.', {}, '', 'done');
  return steps;
}

export const arrayProblems = [{
  id: 'array-smallest',
  topic: 'arrays',
  section: 'Finding values',
  label: 'ARRAY 01',
  title: 'Find the Smallest Number',
  level: 'Beginner',
  time: '5 min',
  statement: 'Input N integers. Find the smallest value and the index where it first appears. Array indexes begin at 0.',
  example: { input: '5 values: 7, 3, 9, -2, 4', output: 'Smallest: -2 at index 3' },
  input: { type: 'array', label: 'Edit the array', minLength: 1, maxLength: 8, minValue: -20, maxValue: 99, default: [7, 3, 9, -2, 4] },
  code,
  trace: traceSmallest,
}];
