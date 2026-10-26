# C Code Lab

A browser-only C problem visualizer. Open `dist/index.html` through a local static server, or deploy the `dist` directory. There is no backend and no student data is stored.

## Local preview

```sh
python -m http.server 4173 --directory dist
```

Visit `http://localhost:4173`.

## Add a lecturer-supplied problem

Edit `dist/assets/problems.js` for the original loop lessons, `dist/assets/nested-loops.js` for nested loops, or `dist/assets/array-problems.js` for array lessons. Each problem has a topic ID, statement, example, input bounds, C source lines, and a `trace(input)` function. The trace returns an array of execution snapshots:

```js
{
  line: 6,                       // 1-based highlighted source line
  title: 'Check the condition',
  detail: '3 <= 4 is true...',  // explanation shown to students
  variables: { n: 4, i: 3 },
  output: '1 2 ',
  phase: 'check'
}
```

The Loops section contains ten fundamental lessons and ten nested loop pattern lessons. The Arrays section currently contains Find the Smallest Number. Its input is a short editable array, and its trace records the current index, best index, and how many values have been read so the array visualizer can highlight the right boxes. Keep accepted inputs small enough that the number of steps stays comfortable for students.

The array lesson also supplies `codeFor(input)`, which renders the declaration as `a[N]` for the chosen array length. The displayed version is the one compiled for that input by the lesson tests.

The topic catalog has a subsection dropdown. A small Lessons tab on the right edge opens a navigation drawer: choose a topic, then a subsection, then a problem. Only problems in that selection appear. The playback bar offers Show/Hide explanation, Projector, and Fullscreen controls. The code panel has font-size buttons, a divider that changes its width, and a footer grip that changes its height. Fullscreen focuses on the workspace, while the lesson drawer remains available. The active code line remains in view for longer solutions. Normal text selection and copy actions are disabled within the solution panel.

For the supplied Sum of Digits solution, the final `printf` uses `sum` rather than the undefined `rev`. The multiplication table adds a newline after each row. Prime Check handles 1 separately because it is neither prime nor composite. Count Digits, Reverse a Number, and Sum of Digits accept positive integers in this version.

Run `node --test tests/lessons.test.mjs` to check the lesson traces. If GCC is installed, the test also compares each trace's output with the compiled C program.

The seven topic IDs are `conditionals`, `loops`, `arrays`, `strings`, `functions`, `recursion`, and `pointers`.
