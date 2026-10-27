const program = (...body) => ['#include <stdio.h>', '', 'int main() {', ...body, '    return 0;', '}'];
const arrayCode = (source, input) => source.map(line => line.replace('int a[8];', `int a[${input.length}];`));
const inputConfig = { type: 'array', label: 'Edit the array', minLength: 1, maxLength: 8, minValue: -20, maxValue: 99 };

function recorder(source, input, variableNames, hasKey = false, key = null) {
  const values = [...input];
  const variables = Object.fromEntries(variableNames.map(name => [name, null]));
  const steps = [];
  let output = '';
  let readCount = 0;
  let array = Array(input.length).fill(null);
  const line = (fragment, occurrence = 0) => {
    const matches = source.flatMap((text, index) => text.trim() === fragment ? [index + 1] : []);
    if (matches.length <= occurrence) throw new Error(`Missing source line: ${fragment}`);
    return matches[occurrence];
  };
  const add = (at, title, detail, changes = {}, options = {}) => {
    Object.assign(variables, changes);
    output += options.printed || '';
    steps.push({ line: at, title, detail, variables: { ...variables }, output,
      phase: options.phase || '', currentIndex: options.currentIndex ?? null,
      secondIndex: options.secondIndex ?? null, readCount, array: [...array],
      key, swap: options.swap || null });
  };
  add(3, 'Enter main', 'Execution starts in main.');
  add(4, hasKey ? 'Declare n and k' : 'Declare n', hasKey ? 'Reserve the array size and target value.' : 'Reserve the array size.');
  add(5, hasKey ? 'Read n and k' : 'Read n', hasKey ? `n is ${values.length} and k is ${key}.` : `The array has ${values.length} elements.`, hasKey ? { n: values.length, k: key } : { n: values.length });
  add(6, 'Reserve the array', `a has ${values.length} boxes.`);
  add(7, 'Start the input loop', 'Set i to 0 to read the first value.', { i: 0 }, { phase: 'input' });
  for (let i = 0; i < values.length; i++) {
    add(7, 'Check the input loop', `${i} < ${values.length} is true.`, { i }, { phase: 'input', currentIndex: i });
    array[i] = values[i]; readCount = i + 1;
    add(8, `Read a[${i}]`, `Store ${values[i]} at index ${i}.`, {}, { phase: 'read', currentIndex: i });
    add(7, 'Advance the input loop', `i becomes ${i + 1}.`, { i: i + 1 }, { phase: 'input' });
  }
  add(7, 'Input loop ends', `${values.length} < ${values.length} is false.`, {}, { phase: 'input-exit' });
  return { values, variables, steps, line, add, setArray(next) { array = [...next]; } };
}

const evenCode = program(
  '    int n;', '    scanf("%d", &n);', '    int a[8];',
  '    for (int i = 0; i < n; i++) {', '        scanf("%d", &a[i]);', '    }',
  '    int evenCnt = 0;',
  '    for (int i = 0; i < n; i++) {',
  '        if (a[i] % 2 == 0) {', '            evenCnt++;', '        }', '    }',
  '    printf("There are %d even numbers\\n", evenCnt);',
  '    printf("There are %d odd numbers\\n", n - evenCnt);'
);
function traceEven(input) {
  const { values, steps, line, add } = recorder(evenCode, input, ['n', 'i', 'evenCnt']);
  let evenCnt = 0;
  add(line('int evenCnt = 0;'), 'Start the even count', 'No even values have been found yet.', { evenCnt });
  add(line('for (int i = 0; i < n; i++) {', 1), 'Start scanning', 'Set i to 0.', { i: 0 });
  for (let i = 0; i < values.length; i++) {
    add(line('for (int i = 0; i < n; i++) {', 1), 'Check the loop', `${i} < ${values.length} is true.`, { i }, { phase: 'scan', currentIndex: i });
    const even = values[i] % 2 === 0;
    add(line('if (a[i] % 2 == 0) {'), 'Check parity', `${values[i]} % 2 ${even ? '= 0: even.' : '≠ 0: odd.'}`, {}, { phase: 'compare', currentIndex: i });
    if (even) { evenCnt++; add(line('evenCnt++;'), 'Count an even value', `evenCnt becomes ${evenCnt}.`, { evenCnt }, { phase: 'match', currentIndex: i }); }
    add(line('for (int i = 0; i < n; i++) {', 1), 'Advance the loop', `i becomes ${i + 1}.`, { i: i + 1 }, { phase: 'scan' });
  }
  add(line('for (int i = 0; i < n; i++) {', 1), 'Scan complete', 'Every element has been checked.', {}, { phase: 'scan-exit' });
  add(line('printf("There are %d even numbers\\n", evenCnt);'), 'Print even count', `${evenCnt} values are even.`, {}, { printed: `There are ${evenCnt} even numbers\n`, phase: 'print-result' });
  add(line('printf("There are %d odd numbers\\n", n - evenCnt);'), 'Print odd count', `n - evenCnt = ${values.length} - ${evenCnt} = ${values.length - evenCnt}.`, {}, { printed: `There are ${values.length - evenCnt} odd numbers\n`, phase: 'print-result' });
  add(evenCode.length - 1, 'Finish', 'main returns 0.', {}, { phase: 'done' });
  return steps;
}

const searchCode = program(
  '    int n, k;', '    scanf("%d%d", &n, &k);', '    int a[8];',
  '    for (int i = 0; i < n; i++) {', '        scanf("%d", &a[i]);', '    }',
  '    int found = 0, idx = -1;',
  '    for (int i = 0; i < n; i++) {',
  '        if (a[i] == k) {', '            found = 1;', '            idx = i;', '            break;', '        }', '    }',
  '    if (found == 1) {', '        printf("Found %d at index %d", k, idx);',
  '    } else {', '        printf("Not found");', '    }'
);
function traceSearch(input, key) {
  const { values, steps, line, add } = recorder(searchCode, input, ['n', 'k', 'i', 'found', 'idx'], true, key);
  let found = 0, idx = -1;
  add(line('int found = 0, idx = -1;'), 'Initialize the result', 'found is false; idx is -1 until a match appears.', { found, idx });
  add(line('for (int i = 0; i < n; i++) {', 1), 'Start searching', 'Search from index 0.', { i: 0 });
  for (let i = 0; i < values.length; i++) {
    add(line('for (int i = 0; i < n; i++) {', 1), 'Check the loop', `${i} < ${values.length} is true.`, { i }, { phase: 'scan', currentIndex: i });
    const match = values[i] === key;
    add(line('if (a[i] == k) {'), 'Compare with k', `${values[i]} == ${key} is ${match}.`, {}, { phase: 'compare', currentIndex: i });
    if (match) {
      found = 1; idx = i;
      add(line('found = 1;'), 'Mark as found', `The first match is at index ${i}.`, { found }, { phase: 'match', currentIndex: i });
      add(line('idx = i;'), 'Save the index', `idx becomes ${i}.`, { idx }, { phase: 'match', currentIndex: i });
      add(line('break;'), 'Stop searching', 'break leaves the loop at the first match.', {}, { phase: 'match', currentIndex: i });
      break;
    }
    add(line('for (int i = 0; i < n; i++) {', 1), 'Advance the loop', `i becomes ${i + 1}.`, { i: i + 1 }, { phase: 'scan' });
  }
  if (!found) add(line('for (int i = 0; i < n; i++) {', 1), 'Search complete', 'No matching value was found.', {}, { phase: 'scan-exit' });
  add(line('if (found == 1) {'), 'Choose the output', `found == 1 is ${Boolean(found)}.`, {}, { phase: 'result', currentIndex: found ? idx : null });
  if (found) add(line('printf("Found %d at index %d", k, idx);'), 'Print the match', `Found ${key} at index ${idx}.`, {}, { printed: `Found ${key} at index ${idx}`, phase: 'print-result', currentIndex: idx });
  else add(line('printf("Not found");'), 'Print not found', `${key} does not appear in the array.`, {}, { printed: 'Not found', phase: 'print-result' });
  add(searchCode.length - 1, 'Finish', 'main returns 0.', {}, { phase: 'done' });
  return steps;
}

const occurrenceCode = program(
  '    int n, k;', '    scanf("%d%d", &n, &k);', '    int a[8];',
  '    for (int i = 0; i < n; i++) {', '        scanf("%d", &a[i]);', '    }',
  '    int cnt = 0;',
  '    for (int i = 0; i < n; i++) {',
  '        if (a[i] == k) {', '            cnt++;', '        }', '    }',
  '    printf("%d", cnt);'
);
function traceOccurrences(input, key) {
  const { values, steps, line, add } = recorder(occurrenceCode, input, ['n', 'k', 'i', 'cnt'], true, key);
  let cnt = 0;
  add(line('int cnt = 0;'), 'Start the count', 'No matches have been counted yet.', { cnt });
  add(line('for (int i = 0; i < n; i++) {', 1), 'Start scanning', 'Set i to 0.', { i: 0 });
  for (let i = 0; i < values.length; i++) {
    add(line('for (int i = 0; i < n; i++) {', 1), 'Check the loop', `${i} < ${values.length} is true.`, { i }, { phase: 'scan', currentIndex: i });
    const match = values[i] === key;
    add(line('if (a[i] == k) {'), 'Compare with k', `${values[i]} == ${key} is ${match}.`, {}, { phase: 'compare', currentIndex: i });
    if (match) { cnt++; add(line('cnt++;'), 'Count this match', `cnt becomes ${cnt}.`, { cnt }, { phase: 'match', currentIndex: i }); }
    add(line('for (int i = 0; i < n; i++) {', 1), 'Advance the loop', `i becomes ${i + 1}.`, { i: i + 1 }, { phase: 'scan' });
  }
  add(line('for (int i = 0; i < n; i++) {', 1), 'Scan complete', 'All occurrences have been counted.', {}, { phase: 'scan-exit' });
  add(line('printf("%d", cnt);'), 'Print the count', `${key} appears ${cnt} time${cnt === 1 ? '' : 's'}.`, {}, { printed: String(cnt), phase: 'print-result' });
  add(occurrenceCode.length - 1, 'Finish', 'main returns 0.', {}, { phase: 'done' });
  return steps;
}

const reverseCode = program(
  '    int n;', '    scanf("%d", &n);', '    int a[8];',
  '    for (int i = 0; i < n; i++) {', '        scanf("%d", &a[i]);', '    }',
  '    for (int i = 0; i < n / 2; i++) {',
  '        int j = n - i - 1;', '        int tmp = a[j];',
  '        a[j] = a[i];', '        a[i] = tmp;', '    }',
  '    for (int i = 0; i < n; i++) {', '        printf("%d ", a[i]);', '    }'
);
function traceReverse(input) {
  const { values, steps, line, add, setArray } = recorder(reverseCode, input, ['n', 'i', 'j', 'tmp']);
  const array = [...values];
  add(line('for (int i = 0; i < n / 2; i++) {'), 'Start swapping', `Only ${Math.floor(values.length / 2)} pair${values.length < 4 ? '' : 's'} need swapping.`, { i: 0 });
  for (let i = 0; i < Math.floor(values.length / 2); i++) {
    const j = values.length - i - 1;
    add(line('for (int i = 0; i < n / 2; i++) {'), 'Check the swap loop', `${i} < ${values.length} / 2 is true.`, { i }, { phase: 'scan', currentIndex: i, secondIndex: j });
    add(line('int j = n - i - 1;'), 'Select the pair', `Index ${i} faces index ${j}. Watch both values rise.`, { j }, { phase: 'swap-select', currentIndex: i, secondIndex: j, swap: { from: i, to: j, left: array[i], right: array[j] } });
    const tmp = array[j];
    add(line('int tmp = a[j];'), 'Lift both values', `Save a[${j}] = ${tmp} in tmp. Both values leave their boxes.`, { tmp }, { phase: 'swap-lift', currentIndex: i, secondIndex: j, swap: { from: i, to: j, left: array[i], right: array[j] } });
    add(line('a[j] = a[i];'), 'Move across', `Move ${array[i]} right to a[${j}] and ${tmp} left to a[${i}].`, {}, { phase: 'swap-travel', currentIndex: i, secondIndex: j, swap: { from: i, to: j, left: array[i], right: tmp } });
    array[j] = array[i];
    setArray(array);
    add(line('a[j] = a[i];'), 'Place the right value', `a[${j}] now holds ${array[j]}; tmp still holds ${tmp}.`, {}, { phase: 'swap-right', currentIndex: i, secondIndex: j, swap: { from: i, to: j, left: array[i], right: tmp } });
    array[i] = tmp;
    setArray(array);
    add(line('a[i] = tmp;'), 'Complete the swap', `a[${i}] now holds ${tmp}. The pair has exchanged positions.`, {}, { phase: 'swap-place', currentIndex: i, secondIndex: j, swap: { from: i, to: j, left: array[j], right: array[i] } });
    add(line('for (int i = 0; i < n / 2; i++) {'), 'Move inward', `i becomes ${i + 1}.`, { i: i + 1 }, { phase: 'scan' });
  }
  add(line('for (int i = 0; i < n / 2; i++) {'), 'Swaps complete', 'The left and right sides have met.', {}, { phase: 'scan-exit' });
  add(line('for (int i = 0; i < n; i++) {', 1), 'Start printing', 'Print the reversed array from index 0.', { i: 0 });
  for (let i = 0; i < array.length; i++) {
    add(line('for (int i = 0; i < n; i++) {', 1), 'Check print loop', `${i} < ${array.length} is true.`, { i }, { phase: 'scan', currentIndex: i });
    add(line('printf("%d ", a[i]);'), 'Print this value', `Print a[${i}] = ${array[i]}.`, {}, { printed: `${array[i]} `, phase: 'print-result', currentIndex: i });
    add(line('for (int i = 0; i < n; i++) {', 1), 'Advance print loop', `i becomes ${i + 1}.`, { i: i + 1 });
  }
  add(reverseCode.length - 1, 'Finish', 'main returns 0.', {}, { phase: 'done' });
  return steps;
}

const withKey = (code, trace, data) => ({ ...data, code, codeFor: input => arrayCode(code, input), trace: (input, key = data.input.key) => trace(input, key) });

export const extraArrayProblems = [
  { id: 'array-even-odd', topic: 'arrays', section: 'Counting values', label: 'ARRAY 02', title: 'Count Even and Odd Numbers', level: 'Beginner', time: '5 min', statement: 'Input N integers. Count even values, then use N minus the even count to find how many are odd.', example: { input: '5 values: 4, 7, 0, 9, 2', output: 'There are 3 even numbers\nThere are 2 odd numbers' }, input: { ...inputConfig, default: [4, 7, 0, 9, 2] }, code: evenCode, codeFor: input => arrayCode(evenCode, input), trace: traceEven },
  withKey(searchCode, traceSearch, { id: 'array-search', topic: 'arrays', section: 'Finding values', label: 'ARRAY 03', title: 'Search for K and Its Index', level: 'Beginner', time: '6 min', statement: 'Input N integers and a target K. Find the first index where K occurs, or report that it is absent.', example: { input: '5 values: 7, 3, 9, 3, 4; K = 3', output: 'Found 3 at index 1' }, input: { ...inputConfig, key: 3, default: [7, 3, 9, 3, 4] } }),
  withKey(occurrenceCode, traceOccurrences, { id: 'array-occurrences', topic: 'arrays', section: 'Counting values', label: 'ARRAY 04', title: 'Count Occurrences of K', level: 'Beginner', time: '6 min', statement: 'Input N integers and a target K. Count every array element equal to K.', example: { input: '5 values: 2, 4, 2, 7, 2; K = 2', output: '3' }, input: { ...inputConfig, key: 2, default: [2, 4, 2, 7, 2] } }),
  { id: 'array-reverse', topic: 'arrays', section: 'Rearranging values', label: 'ARRAY 05', title: 'Reverse the Array', level: 'Beginner', time: '7 min', statement: 'Input N integers. Swap values at opposite indexes until the array is reversed.', example: { input: '5 values: 1, 2, 3, 4, 5', output: '5 4 3 2 1 ' }, input: { ...inputConfig, default: [1, 2, 3, 4, 5] }, code: reverseCode, codeFor: input => arrayCode(reverseCode, input), trace: traceReverse },
];
