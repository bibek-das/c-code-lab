export const topics = [
  { id: 'conditionals', label: 'Conditional statements', short: 'Decisions', icon: '◇', color: '#ad72e6', description: 'Follow the branches that make a program decide.' },
  { id: 'loops', label: 'Loops', short: 'Loops', icon: '↻', color: '#ff9b66', description: 'Watch repetition build a result, one pass at a time.' },
  { id: 'arrays', label: 'Arrays', short: 'Arrays', icon: '▦', color: '#f0c15e', description: 'See values and indexes move through memory.' },
  { id: 'strings', label: 'Strings', short: 'Strings', icon: '“', color: '#65c9aa', description: 'Explore characters, terminators, and text processing.' },
  { id: 'functions', label: 'Functions', short: 'Functions', icon: 'ƒ', color: '#78a5ee', description: 'Step into calls, parameters, and return values.' },
  { id: 'recursion', label: 'Recursion', short: 'Recursion', icon: '⤶', color: '#eb88a8', description: 'Trace calls as they grow and unwind.' },
  { id: 'pointers', label: 'Pointers', short: 'Pointers', icon: '↗', color: '#a1b8d7', description: 'Make addresses and references visible.' },
];

const program = (...body) => ['#include <stdio.h>', '', 'int main(void) {', ...body, '    return 0;', '}'];
function recorder(input, extra = {}) {
  const steps = [], values = { n: null, ...extra };
  let output = '';
  const add = (line, title, detail, changes = {}, printed = '', phase = '') => {
    Object.assign(values, changes); output += printed;
    steps.push({ line, title, detail, variables: { ...values }, output, phase });
  };
  add(3, 'Enter main', 'Execution begins in the main function.');
  add(4, 'Declare n', 'Reserve an integer named n. Its value is not set yet.');
  add(5, 'Read the input', `scanf stores ${input} in n.`, { n: input });
  return { steps, add };
}
function counting(n, descending) {
  const { steps, add } = recorder(n, { i: null });
  const first = descending ? n : 1, limit = descending ? 1 : n, sign = descending ? '>=' : '<=';
  add(6, 'Initialize i', `Start the for loop with i = ${first}.`, { i: first }, '', 'initialize');
  for (let i = first; descending ? i >= limit : i <= limit; descending ? i-- : i++) {
    add(6, 'Check the condition', `${i} ${sign} ${limit} is true.`, {}, '', 'check');
    add(7, 'Print i', `printf writes ${i} followed by a newline.`, {}, `${i}\n`, 'print');
    add(6, descending ? 'Decrement i' : 'Increment i', `The update changes i from ${i} to ${descending ? i - 1 : i + 1}.`, { i: descending ? i - 1 : i + 1 }, '', 'increment');
  }
  add(6, 'Exit the loop', `${descending ? 0 : n + 1} ${sign} ${limit} is false.`, {}, '', 'exit');
  add(9, 'Finish', 'main returns 0.', {}, '', 'done');
  return steps;
}
function summing(n, evenOnly) {
  const { steps, add } = recorder(n, { sum: null, i: null });
  const loop = 7, print = evenOnly ? 12 : 10, end = evenOnly ? 13 : 11;
  add(6, 'Start the sum', 'Set sum to 0.', { sum: 0 });
  add(loop, 'Initialize i', 'Start the loop at i = 1.', { i: 1 }, '', 'initialize');
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    add(loop, 'Check the loop', `${i} <= ${n} is true.`, {}, '', 'check');
    if (evenOnly) add(8, 'Test for evenness', `${i} % 2 is ${i % 2}, so the if condition is ${i % 2 === 0}.`, {}, '', 'branch');
    if (!evenOnly || i % 2 === 0) {
      const before = sum; sum += i;
      add(evenOnly ? 9 : 8, 'Add i to sum', `sum becomes ${before} + ${i} = ${sum}.`, { sum }, '', 'update');
    }
    add(loop, 'Increment i', `i++ changes i to ${i + 1}.`, { i: i + 1 }, '', 'increment');
  }
  add(loop, 'Exit the loop', `${n + 1} <= ${n} is false.`, {}, '', 'exit');
  add(print, 'Print the result', `printf writes ${sum}.`, {}, String(sum), 'print');
  add(end, 'Finish', 'main returns 0.', {}, '', 'done');
  return steps;
}
function table(n) {
  const { steps, add } = recorder(n, { i: null });
  add(6, 'Initialize i', 'Begin the table at i = 1.', { i: 1 }, '', 'initialize');
  for (let i = 1; i <= 10; i++) {
    add(6, 'Check the loop', `${i} <= 10 is true.`, {}, '', 'check');
    add(7, 'Print a row', `${i} × ${n} = ${i * n}.`, {}, `${i} x ${n} = ${i * n}\n`, 'print');
    add(6, 'Increment i', `i++ changes i to ${i + 1}.`, { i: i + 1 }, '', 'increment');
  }
  add(6, 'Exit the loop', '11 <= 10 is false.', {}, '', 'exit');
  add(9, 'Finish', 'main returns 0.', {}, '', 'done');
  return steps;
}
function countDigits(input) {
  const { steps, add } = recorder(input, { cnt: null });
  add(6, 'Start the counter', 'Set cnt to 0.', { cnt: 0 });
  let n = input, cnt = 0;
  while (n > 0) {
    add(7, 'Check the while condition', `${n} > 0 is true.`, {}, '', 'check');
    add(8, 'Count a digit', `cnt increases to ${++cnt}.`, { cnt }, '', 'update');
    const before = n; n = Math.trunc(n / 10);
    add(9, 'Remove the last digit', `Integer division changes n from ${before} to ${n}.`, { n }, '', 'divide');
  }
  add(7, 'Exit the loop', 'n is 0. No digits remain.', {}, '', 'exit');
  add(11, 'Print the count', `printf writes ${cnt}.`, {}, String(cnt), 'print');
  add(12, 'Finish', 'main returns 0.', {}, '', 'done');
  return steps;
}
function digitOperation(input, reverse) {
  const initial = reverse ? { rev: null, d: null } : { sum: null, d: null };
  const { steps, add } = recorder(input, initial);
  let n = input, result = 0;
  const name = reverse ? 'rev' : 'sum';
  add(6, `Start ${name}`, `Set ${name} to 0.`, { [name]: 0 });
  while (n > 0) {
    add(7, 'Check the while condition', `${n} > 0 is true.`, {}, '', 'check');
    const d = n % 10;
    add(8, 'Take the last digit', `${n} % 10 gives ${d}.`, { d }, '', 'digit');
    if (reverse) {
      const before = result; result *= 10;
      add(9, 'Shift rev left', `${before} × 10 gives ${result}, making room for the digit.`, { rev: result }, '', 'update');
      result += d;
      add(10, 'Append the digit', `Add ${d}; rev is now ${result}.`, { rev: result }, '', 'update');
    } else {
      const before = result; result += d;
      add(9, 'Add the digit', `sum becomes ${before} + ${d} = ${result}.`, { sum: result }, '', 'update');
    }
    const before = n; n = Math.trunc(n / 10);
    add(reverse ? 11 : 10, 'Remove the last digit', `${before} / 10 becomes ${n} with integer division.`, { n }, '', 'divide');
  }
  add(7, 'Exit the loop', 'n is 0. Every digit has been processed.', {}, '', 'exit');
  add(reverse ? 13 : 12, reverse ? 'Print the reverse' : 'Print the sum', `printf writes ${result}.${reverse ? ' Leading zeros disappear because rev is an integer.' : ''}`, {}, String(result), 'print');
  add(reverse ? 14 : 13, 'Finish', 'main returns 0.', {}, '', 'done');
  return steps;
}
function factorial(n) {
  const { steps, add } = recorder(n, { fact: null, i: null });
  add(6, 'Start the product', 'Set fact to 1. This makes 0! equal to 1.', { fact: 1 });
  add(7, 'Initialize i', 'Start the loop at i = 1.', { i: 1 }, '', 'initialize');
  let fact = 1;
  for (let i = 1; i <= n; i++) {
    add(7, 'Check the loop', `${i} <= ${n} is true.`, {}, '', 'check');
    const before = fact; fact *= i;
    add(8, 'Multiply', `fact becomes ${before} × ${i} = ${fact}.`, { fact }, '', 'update');
    add(7, 'Increment i', `i++ changes i to ${i + 1}.`, { i: i + 1 }, '', 'increment');
  }
  add(7, 'Exit the loop', `${n + 1} <= ${n} is false.`, {}, '', 'exit');
  add(10, 'Print the factorial', `printf writes ${fact}.`, {}, String(fact), 'print');
  add(11, 'Finish', 'main returns 0.', {}, '', 'done');
  return steps;
}
function prime(n) {
  const { steps, add } = recorder(n, { isPrime: null, i: null });
  if (n < 2) {
    add(6, 'Handle the special case', '1 < 2 is true. One is neither prime nor composite.', {}, '', 'branch');
    add(7, 'Print the result', 'printf reports that 1 is neither prime nor composite.', {}, '1 is neither prime nor composite', 'print');
    add(8, 'Finish early', 'return 0 ends main before the divisor loop.', {}, '', 'done');
    return steps;
  }
  add(6, 'Check the special case', `${n} < 2 is false.`, {}, '', 'branch');
  add(10, 'Assume prime', 'Set isPrime to 1 until a divisor is found.', { isPrime: 1 });
  add(11, 'Initialize i', 'Start testing possible divisors at 2.', { i: 2 }, '', 'initialize');
  let isPrime = true;
  for (let i = 2; i < n; i++) {
    add(11, 'Check the loop', `${i} < ${n} is true.`, {}, '', 'check');
    const divides = n % i === 0;
    add(12, 'Test divisibility', `${n} % ${i} is ${n % i}. ${divides ? 'A divisor was found.' : 'Keep looking.'}`, {}, '', 'branch');
    if (divides) {
      isPrime = false;
      add(13, 'Mark as composite', 'Set isPrime to 0.', { isPrime: 0 }, '', 'update');
      add(14, 'Break the loop', 'Stop checking because a divisor was found.', {}, '', 'break');
      break;
    }
    add(11, 'Increment i', `i++ changes i to ${i + 1}.`, { i: i + 1 }, '', 'increment');
  }
  if (isPrime) add(11, 'Exit the loop', `${n} < ${n} is false. No divisor was found.`, {}, '', 'exit');
  add(17, 'Choose the message', `isPrime == 1 is ${isPrime}.`, {}, '', 'branch');
  add(isPrime ? 18 : 20, 'Print the result', `${n} is ${isPrime ? 'prime' : 'composite'}.`, {}, `${n} is ${isPrime ? 'prime' : 'composite'}`, 'print');
  add(22, 'Finish', 'main returns 0.', {}, '', 'done');
  return steps;
}

export const problems = [
  { id: 'print-1-to-n', topic: 'loops', label: 'PROBLEM 01', title: 'Print 1 to N', level: 'Beginner', time: '3 min', statement: 'Input N and print each number from 1 to N on its own line.', example: { input: '4', output: '1 2 3 4 (one per line)' }, input: { label: 'Choose N', min: 1, max: 8, default: 4 }, code: program('    int n;', '    scanf("%d", &n);', '    for (int i = 1; i <= n; i++) {', '        printf("%d\\n", i);', '    }'), trace: n => counting(n, false) },
  { id: 'print-n-to-1', topic: 'loops', label: 'PROBLEM 02', title: 'Print N to 1', level: 'Beginner', time: '3 min', statement: 'Input N and print each number from N down to 1 on its own line.', example: { input: '4', output: '4 3 2 1 (one per line)' }, input: { label: 'Choose N', min: 1, max: 8, default: 4 }, code: program('    int n;', '    scanf("%d", &n);', '    for (int i = n; i >= 1; i--) {', '        printf("%d\\n", i);', '    }'), trace: n => counting(n, true) },
  { id: 'sum-first-n', topic: 'loops', label: 'PROBLEM 03', title: 'Sum of First N Numbers', level: 'Beginner', time: '4 min', statement: 'Input N and calculate 1 + 2 + ... + N.', example: { input: '4', output: '10' }, input: { label: 'Choose N', min: 1, max: 10, default: 4 }, code: program('    int n;', '    scanf("%d", &n);', '    int sum = 0;', '    for (int i = 1; i <= n; i++) {', '        sum += i;', '    }', '    printf("%d", sum);'), trace: n => summing(n, false) },
  { id: 'sum-even', topic: 'loops', label: 'PROBLEM 04', title: 'Sum of Even Numbers', level: 'Beginner', time: '4 min', statement: 'Input N and add all even numbers from 1 through N.', example: { input: '6', output: '12' }, input: { label: 'Choose N', min: 1, max: 12, default: 6 }, code: program('    int n;', '    scanf("%d", &n);', '    int sum = 0;', '    for (int i = 1; i <= n; i++) {', '        if (i % 2 == 0) {', '            sum += i;', '        }', '    }', '    printf("%d", sum);'), trace: n => summing(n, true) },
  { id: 'multiplication-table', topic: 'loops', label: 'PROBLEM 05', title: 'Multiplication Table', level: 'Beginner', time: '4 min', statement: 'Input a number and print its multiplication table from 1 through 10.', example: { input: '3', output: '1 x 3 = 3 ... 10 x 3 = 30' }, input: { label: 'Choose N', min: 1, max: 12, default: 3 }, code: program('    int n;', '    scanf("%d", &n);', '    for (int i = 1; i <= 10; i++) {', '        printf("%d x %d = %d\\n", i, n, i * n);', '    }'), trace: table },
  { id: 'count-digits', topic: 'loops', label: 'PROBLEM 06', title: 'Count Digits', level: 'Beginner', time: '4 min', statement: 'Input a positive integer and count its digits. Dividing by 10 removes one digit at a time.', example: { input: '482', output: '3' }, input: { label: 'Choose N', min: 1, max: 9999, default: 482 }, code: program('    int n;', '    scanf("%d", &n);', '    int cnt = 0;', '    while (n > 0) {', '        cnt++;', '        n /= 10;', '    }', '    printf("%d", cnt);'), trace: countDigits },
  { id: 'reverse-number', topic: 'loops', label: 'PROBLEM 07', title: 'Reverse a Number', level: 'Intermediate', time: '5 min', statement: 'Input a positive integer and reverse its digits. Trailing zeros disappear from the reversed integer.', example: { input: '482', output: '284' }, input: { label: 'Choose N', min: 1, max: 9999, default: 482 }, code: program('    int n;', '    scanf("%d", &n);', '    int rev = 0;', '    while (n > 0) {', '        int d = n % 10;', '        rev *= 10;', '        rev += d;', '        n /= 10;', '    }', '    printf("%d", rev);'), trace: n => digitOperation(n, true) },
  { id: 'sum-digits', topic: 'loops', label: 'PROBLEM 08', title: 'Sum of Digits', level: 'Intermediate', time: '5 min', statement: 'Input a positive integer and add its digits.', example: { input: '482', output: '14' }, input: { label: 'Choose N', min: 1, max: 9999, default: 482 }, code: program('    int n;', '    scanf("%d", &n);', '    int sum = 0;', '    while (n > 0) {', '        int d = n % 10;', '        sum += d;', '        n /= 10;', '    }', '    printf("%d", sum);'), trace: n => digitOperation(n, false) },
  { id: 'factorial', topic: 'loops', label: 'PROBLEM 09', title: 'Factorial', level: 'Intermediate', time: '4 min', statement: 'Input N and calculate N! = 1 × 2 × ... × N. By definition, 0! is 1.', example: { input: '5', output: '120' }, input: { label: 'Choose N', min: 0, max: 8, default: 5 }, code: program('    int n;', '    scanf("%d", &n);', '    int fact = 1;', '    for (int i = 1; i <= n; i++) {', '        fact *= i;', '    }', '    printf("%d", fact);'), trace: factorial },
  { id: 'prime-check', topic: 'loops', label: 'PROBLEM 10', title: 'Prime Check', level: 'Intermediate', time: '6 min', statement: 'Input N and check for divisors from 2 to N − 1. One is neither prime nor composite.', example: { input: '7', output: '7 is prime' }, input: { label: 'Choose N', min: 1, max: 25, default: 7 }, code: program('    int n;', '    scanf("%d", &n);', '    if (n < 2) {', '        printf("%d is neither prime nor composite", n);', '        return 0;', '    }', '    int isPrime = 1;', '    for (int i = 2; i < n; i++) {', '        if (n % i == 0) {', '            isPrime = 0;', '            break;', '        }', '    }', '    if (isPrime == 1) {', '        printf("%d is prime", n);', '    } else {', '        printf("%d is composite", n);', '    }'), trace: prime },
];
