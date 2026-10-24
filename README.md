# C Code Lab

A browser-only C problem visualizer. Open `dist/index.html` through a local static server, or deploy the `dist` directory. There is no backend and no student data is stored.

## Local preview

```sh
python -m http.server 4173 --directory dist
```

Visit `http://localhost:4173`.

## Add a lecturer-supplied problem

Edit `dist/assets/problems.js`. Each problem has a topic ID, statement, example, input bounds, C source lines, and a `trace(input)` function. The trace returns an array of execution snapshots:

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

The Loops section contains ten lessons. Their traces are based on the displayed C solutions. Keep accepted inputs small enough that the number of steps stays comfortable for students.

While using the visualizer, the lesson switcher stays at the top of the screen. Students can choose another problem from its dropdown or use the previous/next buttons. Playback controls stay visible at the bottom of the workspace, and the active code line remains in view for longer solutions.

For the supplied Sum of Digits solution, the final `printf` uses `sum` rather than the undefined `rev`. The multiplication table adds a newline after each row. Prime Check handles 1 separately because it is neither prime nor composite. Count Digits, Reverse a Number, and Sum of Digits accept positive integers in this version.

Run `node --test tests/lessons.test.mjs` to check the lesson traces. If GCC is installed, the test also compares each trace's output with the compiled C program.

The seven topic IDs are `conditionals`, `loops`, `arrays`, `strings`, `functions`, `recursion`, and `pointers`.
