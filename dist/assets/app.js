import { topics, problems } from './problems.js?v=5';

const app = document.querySelector('#app');
const state = { topic: 'loops', section: 'Loop fundamentals', problem: problems[0], input: problems[0].input.default, step: 0, playing: false, speed: 850, timer: null, projector: false, drawerOpen: false, drawerTopic: 'loops', drawerSection: 'Loop fundamentals', drawerProblem: problems[0].id };
const icons = {
  play: '<path d="m8 5 11 7-11 7V5Z"/>', pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  back: '<path d="m17 5-10 7 10 7V5Z"/>', next: '<path d="m7 5 10 7-10 7V5Z"/>', reset: '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>', book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  spark: '<path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z"/>',
};
function svg(name, size = 18) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`; }
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function highlightC(line) {
  if (line.trimStart().startsWith('#')) return `<span class="syntax-preprocessor">${escapeHTML(line)}</span>`;
  const tokens = /("(?:\\.|[^"\\])*"|\/\/.*|[A-Za-z_]\w*|\d+|==|<=|>=|!=|&&|\|\||[+*\/%=&<>!-])/g;
  let html = '', last = 0;
  for (const match of line.matchAll(tokens)) {
    const value = match[0];
    html += escapeHTML(line.slice(last, match.index));
    let type = '';
    if (value.startsWith('"')) type = 'string';
    else if (value.startsWith('//')) type = 'comment';
    else if (/^\d+$/.test(value)) type = 'number';
    else if (/^(int|char|float|double|void|long|short)$/.test(value)) type = 'type';
    else if (/^(for|while|if|else|return|break|continue)$/.test(value)) type = 'keyword';
    else if (/^(printf|scanf|main)$/.test(value)) type = 'function';
    else if (/^(==|<=|>=|!=|&&|\|\||[+*\/%=&<>!-])$/.test(value)) type = 'operator';
    html += type ? `<span class="syntax-${type}">${escapeHTML(value)}</span>` : escapeHTML(value);
    last = match.index + value.length;
  }
  return html + escapeHTML(line.slice(last));
}
function trace() { return state.problem.trace(state.input); }
function stop() { clearInterval(state.timer); state.timer = null; state.playing = false; }
function sectionName(problem) { return problem.section || (problem.topic === 'loops' ? 'Loop fundamentals' : 'Lessons'); }
function drawerSections(topic) { return [...new Set(problems.filter(problem => problem.topic === topic).map(sectionName))]; }
function drawerProblems() { return problems.filter(problem => problem.topic === state.drawerTopic && sectionName(problem) === state.drawerSection); }
function inputPanel(lesson) {
  if (lesson.input.type === 'array') {
    const { minLength, maxLength, minValue, maxValue } = lesson.input;
    return `<div class="array-input-panel"><div class="array-input-head"><div><strong>Edit the array</strong><small>Choose 1–8 values, each from ${minValue} to ${maxValue}. Changes restart the animation.</small></div><div class="array-size-controls"><span>SIZE <b>n = ${state.input.length}</b></span><button id="array-remove" type="button" aria-label="Remove last array value" ${state.input.length <= minLength ? 'disabled' : ''}>−</button><button id="array-add" type="button" aria-label="Add array value" ${state.input.length >= maxLength ? 'disabled' : ''}>+</button></div></div><div class="array-value-inputs">${state.input.map((value, index) => `<label><span>INDEX ${index}</span><input class="array-value-input" data-array-index="${index}" type="number" inputmode="numeric" min="${minValue}" max="${maxValue}" value="${value}" aria-label="Value at index ${index}"></label>`).join('')}</div><button id="array-mix" class="array-mix" type="button">↻ Mix values</button></div>`;
  }
  return `<div class="input-panel"><div class="input-label"><label for="number-input">${escapeHTML(lesson.input.label)} <span>n</span></label><small>Small inputs keep the steps clear · ${lesson.input.min}–${lesson.input.max}</small></div><div class="input-controls"><button type="button" id="decrease" aria-label="Decrease N" ${state.input <= lesson.input.min ? 'disabled' : ''}>−</button><input id="number-input" type="number" min="${lesson.input.min}" max="${lesson.input.max}" value="${state.input}" inputmode="numeric" aria-describedby="input-help"/><button type="button" id="increase" aria-label="Increase N" ${state.input >= lesson.input.max ? 'disabled' : ''}>+</button><span id="input-help" class="input-hint">Press Enter to update</span></div></div>`;
}
function arrayBoard(lesson, current, values) {
  if (lesson.input.type !== 'array') return '';
  const boxes = values.map((value, index) => {
    const isCurrent = current.currentIndex === index;
    const isBest = current.bestIndex === index;
    const isRead = index < current.readCount;
    return `<div class="array-cell ${isCurrent ? 'array-current' : ''} ${isBest ? 'array-best' : ''} ${current.phase === 'update' && isCurrent ? 'array-updated' : ''}"><span class="array-index">INDEX ${index}</span><strong class="array-value">${isRead ? value : '·'}</strong><span class="array-cell-tag">${isCurrent && isBest ? 'CHECK + BEST' : isCurrent ? 'CHECKING' : isBest ? 'BEST' : '&nbsp;'}</span></div>`;
  }).join('');
  const candidate = current.currentIndex === null || current.currentIndex >= current.readCount ? '—' : values[current.currentIndex];
  const best = current.variables.ans ?? '—';
  return `<div class="array-panel"><div class="panel-header"><span><i class="panel-dot orange"></i> ARRAY VISUALIZER</span><span>a[${values.length}]</span></div><div class="array-board">${boxes}</div><div class="array-comparison"><div><small>CURRENT a[i]</small><strong>${candidate}</strong></div><span class="comparison-symbol">${current.phase === 'compare' ? '&lt;' : '→'}</span><div><small>SMALLEST SO FAR</small><strong>${best}</strong></div><span class="comparison-result">${current.phase === 'compare' ? (candidate < best ? 'YES · UPDATE' : 'NO · KEEP') : current.phase === 'update' ? 'NEW BEST!' : ''}</span></div><div class="array-legend"><span><i class="legend-current"></i> Checking</span><span><i class="legend-best"></i> Smallest so far</span></div></div>`;
}
function lessonCards(items) {
  return `<div class="lesson-grid">${items.map(problem => `<div class="lesson-card"><div class="lesson-card-main"><div class="lesson-kicker"><span class="sample-pill">${escapeHTML(problem.label || 'LESSON')}</span><span class="lesson-dot">•</span>${escapeHTML(problem.level)}<span class="lesson-dot">•</span>${escapeHTML(problem.time)}</div><h4>${escapeHTML(problem.title)}</h4><p>${escapeHTML(problem.statement)}</p></div><button type="button" data-problem="${escapeHTML(problem.id)}" class="lesson-open">Visualize ${svg('arrow', 18)}</button></div>`).join('')}</div>`;
}
function patternBoard(lesson, current, n) {
  if (!lesson.pattern) return '';
  const { shape, token } = lesson.pattern;
  const printed = current.output.split('\n').map(row => row.trim().split(/\s+/).filter(Boolean));
  const rowValue = current.variables.row;
  const activeRow = rowValue === null ? -1 : shape === 'shrink' ? n - rowValue : rowValue - 1;
  const rows = Array.from({ length: n }, (_, index) => {
    const count = shape === 'square' ? n : shape === 'wide' ? n + 2 : shape === 'shrink' ? n - index : index + 1;
    const cells = Array.from({ length: count }, (_, col) => {
      const value = printed[index]?.[col];
      const active = current.cell?.row === index + 1 && current.cell?.col === col + 1;
      return `<span class="pattern-cell ${value ? 'filled' : ''} ${active ? 'just-printed' : ''}" aria-label="${value ? `Printed ${escapeHTML(value)}` : 'Waiting'}">${value ? escapeHTML(value) : '·'}</span>`;
    }).join('');
    return `<div class="pattern-row ${index === activeRow ? 'active-row' : ''}"><span class="pattern-row-number">${String(index + 1).padStart(2, '0')}</span><div class="pattern-cells">${cells}</div></div>`;
  }).join('');
  const outer = rowValue === null ? '—' : rowValue;
  const inner = current.variables.col === null ? '—' : current.variables.col;
  return `<div class="pattern-panel"><div class="panel-header"><span><i class="panel-dot orange"></i> PATTERN BUILDER</span><span>${token === 'star' ? 'STARS' : 'NUMBERS'}</span></div><div class="loop-flow"><div class="loop-flow-item ${current.phase?.startsWith('outer') ? 'flow-active' : ''}"><small>OUTER LOOP</small><strong>row = ${outer}</strong><span>chooses the line</span></div><span class="flow-arrow">→</span><div class="loop-flow-item ${['inner','inner-exit','print'].includes(current.phase) ? 'flow-active' : ''}"><small>INNER LOOP</small><strong>col = ${inner}</strong><span>prints across</span></div></div><div class="pattern-board" aria-label="Pattern built so far">${rows}</div></div>`;
}

function render() {
  const lesson = state.problem;
  const activeTopic = topics.find(t => t.id === state.topic);
  const steps = trace();
  state.step = Math.min(state.step, steps.length - 1);
  const current = steps[state.step];
  const sourceCode = lesson.codeFor ? lesson.codeFor(state.input) : lesson.code;
  const topicProblems = problems.filter(problem => problem.topic === state.topic);
  const sections = [...new Set(topicProblems.map(sectionName))];
  if (!sections.includes(state.section)) state.section = sections[0];
  const shownProblems = topicProblems.filter(problem => sectionName(problem) === state.section);
  const filteredDrawerProblems = drawerProblems();
  const drawerIndex = Math.max(0, filteredDrawerProblems.findIndex(problem => problem.id === state.drawerProblem));
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#home" aria-label="C Code Lab home"><span class="brand-mark">{<span>c</span>}</span><span>C Code <strong>Lab</strong></span></a>
      <nav class="topnav" aria-label="Main navigation"><a href="#topics">Explore topics</a><a href="#workspace">Visualizer</a></nav>
      <span class="header-tag"><span class="online-dot"></span> LEARN BY SEEING</span>
    </header>
    <main id="home">
      <section class="hero">
        <div class="hero-grid"></div><div class="hero-orb"></div>
        <div class="hero-content">
          <div class="eyebrow"><span class="eyebrow-line"></span> THE INTERACTIVE C CLASSROOM</div>
          <h1>Don't just read code.<br><em>Watch it think.</em></h1>
          <p>Turn C programs into something you can see, control, and understand. Change an input, step through each line, and discover what happens inside.</p>
          <div class="hero-actions"><a class="primary-action" href="#workspace">Try the visualizer ${svg('arrow', 18)}</a><a class="secondary-action" href="#topics">Browse topics <span>↗</span></a></div>
        </div>
        <div class="hero-preview" aria-hidden="true"><div class="preview-bar"><span class="window-dots"><i></i><i></i><i></i></span><span>main.c</span><span class="preview-run">● LIVE TRACE</span></div><div class="preview-code"><div><span>03</span><code>int main() {</code></div><div><span>04</span><code>  int n;</code></div><div><span>05</span><code>  scanf("%d", &amp;n);</code></div><div class="preview-active"><span>06</span><code>  for (int i = 1; i &lt;= n; i++) {</code></div><div><span>07</span><code>    printf("%d\\n", i);</code></div><div><span>08</span><code>  }</code></div></div><div class="preview-bottom"><span class="preview-arrow">↳</span><div><small>CURRENT STEP</small><strong>Check: 3 ≤ 4 <span>✓ true</span></strong></div></div></div>
        <div class="hero-side-label">SCROLL TO EXPLORE <span>↓</span></div>
      </section>

      <section class="learning-section" id="topics">
        <div class="section-heading"><div><span class="section-kicker">C PROGRAMMING</span><h2>Explore the topics<span class="period">.</span></h2></div><div class="topic-count"><strong>07</strong><span>CORE TOPICS</span></div></div>
        <div class="learning-layout">
          <aside class="topic-sidebar" aria-label="C topics"><div class="sidebar-title">TOPICS <span>01 — 07</span></div><div class="topic-list">${topics.map((t,i) => `<button class="topic-item ${state.topic === t.id ? 'selected' : ''}" data-topic="${t.id}" type="button" aria-pressed="${state.topic === t.id}"><span class="topic-icon" style="--topic-color:${t.color}">${t.icon}</span><span class="topic-name">${t.label}</span><span class="topic-index">0${i+1}</span></button>`).join('')}</div></aside>
          <div class="topic-main"><div class="topic-intro"><div><div class="topic-overline"><span style="background:${activeTopic.color}"></span> EXPLORE THE CONCEPT</div><h3>${activeTopic.label}</h3><p>${activeTopic.description}</p></div><span class="topic-big-icon" style="--topic-color:${activeTopic.color}">${activeTopic.icon}</span></div>
            ${topicProblems.length ? `<div class="catalog-control"><label for="section-picker">SUBSECTION<select id="section-picker" aria-label="Choose subsection">${sections.map(section => `<option value="${escapeHTML(section)}" ${section === state.section ? 'selected' : ''}>${escapeHTML(section)} · ${topicProblems.filter(problem => sectionName(problem) === section).length} ${section === 'Nested loops' ? 'patterns' : 'problems'}</option>`).join('')}</select></label><span>${shownProblems.length} ${shownProblems.length === 1 ? 'problem' : 'problems'} in this section</span></div><div class="lesson-section"><div class="lesson-section-head"><span>${String(sections.indexOf(state.section) + 1).padStart(2, '0')}</span><div><h4>${escapeHTML(state.section)}</h4><p>${state.section === 'Nested loops' ? 'Watch an outer loop choose each row while an inner loop builds it.' : state.topic === 'arrays' ? 'See values and indexes move through each comparison.' : 'Choose a problem and follow it one step at a time.'}</p></div></div>${lessonCards(shownProblems)}</div>` : `<div class="empty-lessons"><span class="empty-symbol">${activeTopic.icon}</span><span class="empty-eyebrow">COMING SOON</span><h4>${activeTopic.label}</h4></div>`}
          </div>
        </div>
      </section>

      <section class="workspace-section" id="workspace"><div class="workspace-heading"><div><span class="section-kicker">THE WORKSPACE</span><h2>Inside the program<span class="period">.</span></h2></div><span class="workspace-label">INTERACTIVE VISUALIZER <span>↘</span></span></div>
        <div class="lab-shell"><div class="lab-topline"><div class="lab-title"><span class="lab-icon">{ }</span><div><small>NOW VISUALIZING</small><strong>${escapeHTML(lesson.title)}</strong></div></div><span class="sample-pill">${escapeHTML(lesson.label)}</span></div>
          <div class="problem-statement"><div class="statement-icon">${svg('book', 20)}</div><div><h3>Problem statement</h3><p>${escapeHTML(lesson.statement)}</p><div class="example-row"><span>EXAMPLE</span><code>input: ${escapeHTML(lesson.example.input)}</code><span class="example-arrow">→</span><code class="example-output">${escapeHTML(lesson.example.output)}</code></div></div></div>
          ${inputPanel(lesson)}
          <div class="visual-grid"><div class="code-panel"><div class="panel-header"><span><i class="panel-dot"></i> SOLUTION.C</span><span>C</span></div><div class="code-list" role="list" aria-label="C source code">${sourceCode.map((line,i) => `<div class="code-line ${current.line === i+1 ? 'active-line' : ''}" role="listitem" ${current.line === i+1 ? 'aria-current="step"' : ''}><span class="line-number">${String(i+1).padStart(2,'0')}</span><code>${highlightC(line) || ' '}</code>${current.line === i+1 ? '<span class="line-cursor">●</span>' : ''}</div>`).join('')}</div><div class="code-footer"><span>● Current line</span><span>View only · copying disabled</span></div></div>
            <div class="state-column"><div class="explain-panel"><div class="panel-header"><span><i class="panel-dot orange"></i> WHAT'S HAPPENING</span><span>STEP ${String(state.step+1).padStart(2,'0')}</span></div><div class="explain-body"><div class="step-label">${current.phase === 'done' ? 'FINISHED' : 'CURRENT STEP'}</div><h3>${escapeHTML(current.title)}</h3><p>${escapeHTML(current.detail)}</p><div class="line-reference">${svg('arrow', 15)} Line ${current.line} is active</div></div></div>${patternBoard(lesson, current, state.input)}${arrayBoard(lesson, current, state.input)}<div class="variables-panel"><div class="panel-header"><span><i class="panel-dot purple"></i> VARIABLE WATCH</span><span>LIVE VALUES</span></div><div class="variable-rows">${Object.entries(current.variables).map(([name,value]) => `<div class="variable-row"><span class="variable-name">${name}</span><span class="variable-type">int</span><strong class="variable-value ${value === null ? 'unset' : ''}">${value === null ? 'unset' : value}</strong></div>`).join('')}</div></div><div class="output-panel"><div class="panel-header"><span><i class="panel-dot green"></i> CONSOLE OUTPUT</span><span>STDOUT</span></div><div class="console-output"><span class="console-prompt">&gt;</span><code>${current.output ? escapeHTML(current.output) : '<span class="console-placeholder">Waiting for output...</span>'}</code><span class="console-cursor"></span></div></div></div></div>
          <div class="playback"><div class="playback-controls"><button class="icon-button" id="reset" type="button" title="Reset" aria-label="Reset">${svg('reset')}</button><button class="icon-button" id="previous" type="button" title="Previous step" aria-label="Previous step" ${state.step === 0 ? 'disabled' : ''}>${svg('back')}</button><button class="play-button" id="play" type="button" aria-label="${state.playing ? 'Pause' : 'Play'}">${svg(state.playing ? 'pause' : 'play', 20)}<span>${state.playing ? 'Pause' : 'Play'}</span></button><button class="icon-button" id="next" type="button" title="Next step" aria-label="Next step" ${state.step === steps.length-1 ? 'disabled' : ''}>${svg('next')}</button></div><div class="progress-wrap"><div class="progress-top"><span>STEP ${String(state.step+1).padStart(2,'0')} <b>/ ${String(steps.length).padStart(2,'0')}</b></span><span>${Math.round((state.step/(steps.length-1))*100)}%</span></div><input id="scrubber" type="range" min="0" max="${steps.length-1}" value="${state.step}" aria-label="Jump to step" style="--progress:${(state.step/(steps.length-1))*100}%"/></div><div class="speed-control"><label for="speed">SPEED</label><select id="speed" aria-label="Playback speed"><option value="1400" ${state.speed === 1400 ? 'selected' : ''}>0.5×</option><option value="850" ${state.speed === 850 ? 'selected' : ''}>1×</option><option value="430" ${state.speed === 430 ? 'selected' : ''}>2×</option></select></div><div class="view-actions"><button class="view-button" id="projector-mode" type="button" aria-pressed="${state.projector}" title="Larger text for a projector">${state.projector ? '◉' : '◯'} Projector</button><button class="view-button" id="fullscreen-mode" type="button" aria-pressed="${Boolean(document.fullscreenElement)}" title="Toggle fullscreen">⛶ <span>${document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen'}</span></button></div></div>
        </div>
      </section>
    </main>
    <button class="lesson-launcher" id="lesson-launcher" type="button" aria-label="Open lesson navigation" aria-controls="lesson-drawer" aria-expanded="${state.drawerOpen}" ${state.drawerOpen ? 'hidden' : ''}><span>☰</span><small>LESSONS</small></button>
    <div class="lesson-drawer-backdrop" id="lesson-drawer-backdrop" ${state.drawerOpen ? '' : 'hidden'}><aside class="lesson-drawer" id="lesson-drawer" role="dialog" aria-modal="true" aria-label="Lesson navigation"><div class="drawer-head"><div><small>LESSON NAVIGATION</small><h2>Choose a problem</h2></div><button id="drawer-close" type="button" aria-label="Close lesson navigation">×</button></div><div class="drawer-body"><p class="drawer-current">Currently viewing <strong>${escapeHTML(lesson.title)}</strong></p><label for="drawer-topic-picker">TOPIC</label><select id="drawer-topic-picker" aria-label="Filter by topic">${topics.filter(topic => problems.some(problem => problem.topic === topic.id)).map(topic => { const count = problems.filter(problem => problem.topic === topic.id).length; return `<option value="${escapeHTML(topic.id)}" ${state.drawerTopic === topic.id ? 'selected' : ''}>${escapeHTML(topic.label)} · ${count} ${count === 1 ? 'problem' : 'problems'}</option>`; }).join('')}</select><label for="drawer-section-picker">SUBSECTION</label><select id="drawer-section-picker" aria-label="Filter by subsection">${drawerSections(state.drawerTopic).map(section => `<option value="${escapeHTML(section)}" ${state.drawerSection === section ? 'selected' : ''}>${escapeHTML(section)}</option>`).join('')}</select><label for="problem-picker">PROBLEM</label><select id="problem-picker" aria-label="Choose problem">${filteredDrawerProblems.map(problem => `<option value="${escapeHTML(problem.id)}" ${state.drawerProblem === problem.id ? 'selected' : ''}>${escapeHTML(problem.label)} · ${escapeHTML(problem.title)}</option>`).join('')}</select><button class="drawer-open-problem" id="open-problem" type="button">Visualize selected problem ${svg('arrow', 17)}</button><div class="drawer-steps"><button id="previous-problem" type="button" ${drawerIndex === 0 ? 'disabled' : ''}>← Previous</button><span>${drawerIndex + 1} / ${filteredDrawerProblems.length}</span><button id="next-problem" type="button" ${drawerIndex === filteredDrawerProblems.length - 1 ? 'disabled' : ''}>Next →</button></div><a href="#topics" id="browse-topics">Browse all topics ${svg('arrow', 16)}</a></div></aside></div>
    <footer><div class="footer-brand"><span class="brand-mark">{<span>c</span>}</span><span>C Code <strong>Lab</strong></span></div><p>Make the invisible parts of C visible.</p><span>Made for learning, one line at a time. © ${new Date().getFullYear()}</span></footer>
  `;
  document.body.classList.toggle('projector-mode', state.projector);
  bind();
  const codeList = document.querySelector('.code-list');
  const activeLine = codeList.querySelector('.active-line');
  if (activeLine) codeList.scrollTop += activeLine.getBoundingClientRect().top - codeList.getBoundingClientRect().top - codeList.clientHeight / 2;
  const consoleOutput = document.querySelector('.console-output');
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function moveTo(step) { stop(); state.step = Math.max(0, Math.min(trace().length - 1, step)); render(); }
function play() {
  if (state.playing) { stop(); render(); return; }
  if (state.step >= trace().length - 1) state.step = 0;
  state.playing = true;
  render();
  state.timer = setInterval(() => {
    if (state.step >= trace().length - 1) { stop(); render(); return; }
    state.step++;
    render();
  }, state.speed);
}
function setInput(raw) {
  const value = Number(raw);
  if (!Number.isInteger(value)) { render(); return; }
  stop(); state.input = Math.max(state.problem.input.min, Math.min(state.problem.input.max, value)); state.step = 0; render();
}
function setArrayValue(index, raw) {
  const value = Number(raw);
  if (!Number.isInteger(value)) { render(); return; }
  const { minValue, maxValue } = state.problem.input;
  stop(); state.input[index] = Math.max(minValue, Math.min(maxValue, value)); state.step = 0; render();
}
function setArraySize(size) {
  const { minLength, maxLength } = state.problem.input;
  const length = Math.max(minLength, Math.min(maxLength, size));
  stop(); state.input = Array.from({ length }, (_, index) => state.input[index] ?? 0); state.step = 0; render();
}
function setDrawer(open) {
  if (open) { state.drawerTopic = state.problem.topic; state.drawerSection = sectionName(state.problem); state.drawerProblem = state.problem.id; }
  if (open && state.playing) { stop(); state.drawerOpen = true; render(); }
  state.drawerOpen = open;
  const launcher = document.querySelector('#lesson-launcher');
  const backdrop = document.querySelector('#lesson-drawer-backdrop');
  launcher.hidden = open;
  launcher.setAttribute('aria-expanded', String(open));
  backdrop.hidden = !open;
  (open ? document.querySelector('#drawer-close') : launcher).focus();
}
async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { /* The browser may deny fullscreen; the normal workspace remains usable. */ }
}
function selectProblem(id, scrollToWorkspace = false) {
  const selected = problems.find(problem => problem.id === id);
  if (!selected || selected.id === state.problem.id) {
    if (state.drawerOpen) setDrawer(false);
    if (scrollToWorkspace) { location.hash = 'workspace'; document.querySelector('#workspace').scrollIntoView({ behavior: 'smooth' }); }
    return;
  }
  stop(); state.problem = selected; state.topic = selected.topic; state.section = sectionName(selected); state.input = Array.isArray(selected.input.default) ? [...selected.input.default] : selected.input.default; state.step = 0; state.drawerOpen = false; state.drawerTopic = selected.topic; state.drawerSection = sectionName(selected); state.drawerProblem = selected.id;
  render();
  if (scrollToWorkspace) {
    location.hash = 'workspace';
    document.querySelector('#workspace').scrollIntoView({ behavior: 'smooth' });
  }
}
function bind() {
  document.querySelectorAll('[data-topic]').forEach(button => button.addEventListener('click', () => {
    state.topic = button.dataset.topic; state.section = sectionName(problems.find(problem => problem.topic === state.topic) || { topic: state.topic }); stop(); render(); document.querySelector('#topics').scrollIntoView({ behavior: 'smooth' });
  }));
  document.querySelectorAll('[data-problem]').forEach(button => button.addEventListener('click', () => {
    selectProblem(button.dataset.problem, true);
  }));
  document.querySelector('#drawer-topic-picker').addEventListener('change', e => {
    state.drawerTopic = e.target.value;
    state.drawerSection = drawerSections(state.drawerTopic)[0];
    state.drawerProblem = drawerProblems()[0].id;
    render(); document.querySelector('#drawer-topic-picker').focus();
  });
  document.querySelector('#drawer-section-picker').addEventListener('change', e => {
    state.drawerSection = e.target.value;
    state.drawerProblem = drawerProblems()[0].id;
    render(); document.querySelector('#drawer-section-picker').focus();
  });
  document.querySelector('#problem-picker').addEventListener('change', e => {
    state.drawerProblem = e.target.value;
    render(); document.querySelector('#problem-picker').focus();
  });
  document.querySelector('#open-problem').addEventListener('click', () => selectProblem(state.drawerProblem));
  document.querySelector('#lesson-launcher').addEventListener('click', () => setDrawer(true));
  document.querySelector('#drawer-close').addEventListener('click', () => setDrawer(false));
  document.querySelector('#lesson-drawer-backdrop').addEventListener('click', e => { if (e.target.id === 'lesson-drawer-backdrop') setDrawer(false); });
  document.querySelector('#browse-topics').addEventListener('click', () => setDrawer(false));
  document.querySelector('#section-picker')?.addEventListener('change', e => { state.section = e.target.value; render(); document.querySelector('.catalog-control').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  document.querySelector('#previous-problem').addEventListener('click', () => { const matches = drawerProblems(); selectProblem(matches[matches.findIndex(problem => problem.id === state.drawerProblem) - 1]?.id); });
  document.querySelector('#next-problem').addEventListener('click', () => { const matches = drawerProblems(); selectProblem(matches[matches.findIndex(problem => problem.id === state.drawerProblem) + 1]?.id); });
  document.querySelector('#projector-mode').addEventListener('click', () => { state.projector = !state.projector; render(); });
  document.querySelector('#fullscreen-mode').addEventListener('click', toggleFullscreen);
  if (state.problem.input.type === 'array') {
    document.querySelector('#array-remove').addEventListener('click', () => setArraySize(state.input.length - 1));
    document.querySelector('#array-add').addEventListener('click', () => setArraySize(state.input.length + 1));
    document.querySelector('#array-mix').addEventListener('click', () => { stop(); state.input = state.input.map(() => Math.floor(Math.random() * 29) - 9); state.step = 0; render(); });
    document.querySelectorAll('.array-value-input').forEach(input => {
      input.addEventListener('change', () => setArrayValue(Number(input.dataset.arrayIndex), input.value));
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); setArrayValue(Number(input.dataset.arrayIndex), input.value); } });
    });
  } else {
    document.querySelector('#decrease').addEventListener('click', () => setInput(state.input - 1));
    document.querySelector('#increase').addEventListener('click', () => setInput(state.input + 1));
    const input = document.querySelector('#number-input');
    input.addEventListener('change', () => setInput(input.value));
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); setInput(input.value); input.blur(); } });
  }
  const codePanel = document.querySelector('.code-panel');
  for (const event of ['copy', 'cut', 'contextmenu', 'dragstart', 'selectstart']) codePanel.addEventListener(event, e => e.preventDefault());
  document.querySelector('#reset').addEventListener('click', () => moveTo(0));
  document.querySelector('#previous').addEventListener('click', () => moveTo(state.step - 1));
  document.querySelector('#next').addEventListener('click', () => moveTo(state.step + 1));
  document.querySelector('#play').addEventListener('click', play);
  document.querySelector('#scrubber').addEventListener('input', e => { e.target.style.setProperty('--progress', `${Number(e.target.value) / (trace().length - 1) * 100}%`); });
  document.querySelector('#scrubber').addEventListener('change', e => moveTo(Number(e.target.value)));
  document.querySelector('#speed').addEventListener('change', e => { state.speed = Number(e.target.value); if (state.playing) { stop(); play(); } });
}
document.addEventListener('fullscreenchange', () => {
  const full = Boolean(document.fullscreenElement);
  document.body.classList.toggle('focus-fullscreen', full);
  const button = document.querySelector('#fullscreen-mode');
  if (button) { button.setAttribute('aria-pressed', String(full)); button.querySelector('span').textContent = full ? 'Exit fullscreen' : 'Fullscreen'; }
  if (full) document.querySelector('#workspace')?.scrollIntoView({ behavior: 'instant' });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && state.drawerOpen) { e.preventDefault(); setDrawer(false); return; }
  if (!location.hash.includes('workspace') || ['INPUT','SELECT','BUTTON'].includes(document.activeElement?.tagName)) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); moveTo(state.step + 1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); moveTo(state.step - 1); }
});
render();
