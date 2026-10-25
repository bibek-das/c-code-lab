const program = (...body) => ['#include <stdio.h>', '', 'int main(void) {', ...body, '    return 0;', '}'];

const lessons = [
  { id: 'nested-square', title: 'Square of Stars', statement: 'Input N and print an N × N square of stars. Both loops run N times.', shape: 'square', style: 'for', token: 'star', example: '* * * * *\n* * * * *\n* * * * *\n* * * * *\n* * * * *' },
  { id: 'nested-rectangle', title: 'Wide Rectangle of Stars', statement: 'Input N and print N rows with N + 2 stars in each row.', shape: 'wide', style: 'for', token: 'star', example: '* * * * * * *\n* * * * * * *\n* * * * * * *\n* * * * * * *\n* * * * * * *' },
  { id: 'nested-growing', title: 'Growing Star Triangle', statement: 'Input N and print a triangle whose row number gives its number of stars.', shape: 'grow', style: 'for', token: 'star', example: '*\n* *\n* * *\n* * * *\n* * * * *' },
  { id: 'nested-shrinking', title: 'Shrinking Star Triangle', statement: 'Input N and start with N stars, printing one fewer star on each new row.', shape: 'shrink', style: 'for', token: 'star', example: '* * * * *\n* * * *\n* * *\n* *\n*' },
  { id: 'nested-growing-while', title: 'Growing Triangle with While', statement: 'Print the growing star triangle using a while loop inside another while loop.', shape: 'grow', style: 'while', token: 'star', example: '*\n* *\n* * *\n* * * *\n* * * * *' },
  { id: 'nested-growing-countdown', title: 'Growing Triangle by Counting Down', statement: 'Print the growing star triangle while the inner loop counts down from the row number.', shape: 'grow', style: 'countdown', token: 'star', example: '*\n* *\n* * *\n* * * *\n* * * * *' },
  { id: 'nested-shrinking-while', title: 'Shrinking Triangle with While', statement: 'Print the shrinking star triangle using two while loops.', shape: 'shrink', style: 'while', token: 'star', example: '* * * * *\n* * * *\n* * *\n* *\n*' },
  { id: 'nested-number-growing', title: 'Growing Number Triangle', statement: 'Input N and print 1 through the row number on each row.', shape: 'grow', style: 'for', token: 'number', example: '1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5' },
  { id: 'nested-number-shrinking', title: 'Shrinking Number Triangle', statement: 'Input N and print 1 through the current row length, starting with N numbers.', shape: 'shrink', style: 'for', token: 'number', example: '1 2 3 4 5\n1 2 3 4\n1 2 3\n1 2\n1' },
  { id: 'nested-binary', title: 'Alternating 1 and 0 Triangle', statement: 'Input N and print a triangle where odd row and column sums give 0, and even sums give 1.', shape: 'grow', style: 'for', token: 'binary', example: '1\n0 1\n1 0 1\n0 1 0 1\n1 0 1 0 1' },
];

function width(shape, n, row) {
  return shape === 'square' ? n : shape === 'wide' ? n + 2 : row;
}

function tokenValue(token, row, col) {
  if (token === 'number') return String(col);
  if (token === 'binary') return String(Number((row + col) % 2 === 0));
  return '*';
}

function source(lesson) {
  const { shape, style, token } = lesson;
  const start = shape === 'shrink' ? 'n' : '1';
  const outerCondition = shape === 'shrink' ? 'row >= 1' : 'row <= n';
  const outerUpdate = shape === 'shrink' ? 'row--' : 'row++';
  const limit = shape === 'square' ? 'n' : shape === 'wide' ? 'n + 2' : 'row';
  const print = token === 'number' ? 'printf("%d ", col);' : token === 'binary' ? 'printf("%d ", (row + col) % 2 == 0);' : 'printf("* ");';
  const body = ['    int n;', '    scanf("%d", &n);'];
  if (style === 'while') {
    body.push(`    int row = ${start};`, `    while (${outerCondition}) {`, '        int col = 1;', `        while (col <= ${limit}) {`, `            ${print}`, '            col++;', '        }', '        printf("\\n");', `        ${outerUpdate};`, '    }');
  } else {
    const inner = style === 'countdown' ? 'int col = row; col >= 1; col--' : `int col = 1; col <= ${limit}; col++`;
    body.push(`    for (int row = ${start}; ${outerCondition}; ${outerUpdate}) {`, `        for (${inner}) {`, `            ${print}`, '        }', '        printf("\\n");', '    }');
  }
  return program(...body);
}

function makeTrace(lesson, code, n) {
  const steps = [];
  const variables = { n: null, row: null, col: null };
  let output = '';
  const line = text => code.findIndex(value => value.includes(text)) + 1;
  const outerLine = line(lesson.style === 'while' ? 'while (row' : 'for (int row');
  const innerLine = line(lesson.style === 'while' ? 'while (col' : 'for (int col');
  const printLine = line('printf("* ') || line('printf("%d ');
  const newlineLine = line('printf("\\n")');
  const rowInitLine = lesson.style === 'while' ? line('int row =') : outerLine;
  const colInitLine = lesson.style === 'while' ? line('int col =') : innerLine;
  const rowUpdateLine = lesson.style === 'while' ? line('row++;') || line('row--;') : outerLine;
  const colUpdateLine = lesson.style === 'while' ? line('col++;') : innerLine;
  const add = (activeLine, title, detail, changes = {}, printed = '', phase = '', cell = null) => {
    Object.assign(variables, changes);
    output += printed;
    steps.push({ line: activeLine, title, detail, variables: { ...variables }, output, phase, cell });
  };
  add(3, 'Enter main', 'Execution starts in main.');
  add(4, 'Declare n', 'Reserve an integer for the input.');
  add(5, 'Read N', `scanf stores ${n} in n.`, { n });
  const firstRow = lesson.shape === 'shrink' ? n : 1;
  const rowStep = lesson.shape === 'shrink' ? -1 : 1;
  add(rowInitLine, 'Start the outer loop', `Set row to ${firstRow}. The outer loop controls how many lines are printed.`, { row: firstRow }, '', 'outer');
  for (let row = firstRow; lesson.shape === 'shrink' ? row >= 1 : row <= n; row += rowStep) {
    const limit = width(lesson.shape, n, row);
    add(outerLine, 'Check the outer loop', `Row ${row} is inside the range. This pass will build one complete output line.`, {}, '', 'outer');
    const countdown = lesson.style === 'countdown';
    const firstCol = countdown ? row : 1;
    add(colInitLine, 'Start the inner loop', `Set col to ${firstCol}. This loop prints ${limit} values on row ${row}.`, { col: firstCol }, '', 'inner');
    for (let col = firstCol; countdown ? col >= 1 : col <= limit; col += countdown ? -1 : 1) {
      const position = countdown ? row - col + 1 : col;
      add(innerLine, 'Check the inner loop', `Column pass ${position} of ${limit}: the condition is true.`, {}, '', 'inner');
      const value = tokenValue(lesson.token, row, position);
      add(printLine, 'Print one value', `Row ${row}, position ${position}: print ${value}. The inner loop adds one item to this line.`, {}, `${value} `, 'print', { row: lesson.shape === 'shrink' ? n - row + 1 : row, col: position });
      const nextCol = col + (countdown ? -1 : 1);
      add(colUpdateLine, countdown ? 'Decrease col' : 'Increase col', `Update col from ${col} to ${nextCol}.`, { col: nextCol }, '', 'inner');
    }
    add(innerLine, 'Inner loop ends', `All ${limit} values for row ${row} have been printed.`, {}, '', 'inner-exit');
    add(newlineLine, 'Move to the next line', 'The newline ends this row in the console output.', {}, '\n', 'newline');
    add(rowUpdateLine, lesson.shape === 'shrink' ? 'Decrease row' : 'Increase row', `Update row from ${row} to ${row + rowStep}.`, { row: row + rowStep, col: null }, '', 'outer');
  }
  add(outerLine, 'Outer loop ends', 'Every row is complete, so the outer condition is false.', {}, '', 'exit');
  add(line('return 0;'), 'Finish', 'main returns 0.', {}, '', 'done');
  return steps;
}

export const nestedLoopProblems = lessons.map((lesson, index) => {
  const code = source(lesson);
  return {
    id: lesson.id,
    topic: 'loops',
    section: 'Nested loops',
    label: `NESTED ${String(index + 1).padStart(2, '0')}`,
    title: lesson.title,
    level: index < 4 ? 'Beginner' : 'Intermediate',
    time: '5 min',
    statement: lesson.statement,
    example: { input: '5', output: lesson.example },
    input: { label: 'Choose size', min: 1, max: 6, default: 5 },
    pattern: { shape: lesson.shape, token: lesson.token },
    code,
    trace: n => makeTrace(lesson, code, n),
  };
});
