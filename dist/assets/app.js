import { topics, problems } from './problems.js';

const app = document.querySelector('#app');
const state = { topic: 'loops', problem: problems[0], input: problems[0].input.default, step: 0, playing: false, speed: 850, timer: null, showHelp: false };
const icons = {
  play: '<path d="m8 5 11 7-11 7V5Z"/>', pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  back: '<path d="m17 5-10 7 10 7V5Z"/>', next: '<path d="m7 5 10 7-10 7V5Z"/>', reset: '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>', book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  spark: '<path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z"/>',
};
function svg(name, size = 18) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`; }
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function trace() { return state.problem.trace(state.input); }
function stop() { clearInterval(state.timer); state.timer = null; state.playing = false; }

function render() {
  const lesson = state.problem;
  const activeTopic = topics.find(t => t.id === state.topic);
  const steps = trace();
  state.step = Math.min(state.step, steps.length - 1);
  const current = steps[state.step];
  const topicProblems = problems.filter(problem => problem.topic === state.topic);
  const problemIndex = problems.findIndex(problem => problem.id === lesson.id);
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#home" aria-label="C Code Lab home"><span class="brand-mark">{<span>c</span>}</span><span>C Code <strong>Lab</strong></span></a>
      <nav class="topnav" aria-label="Main navigation"><a href="#topics">Explore topics</a><a href="#workspace">Visualizer</a><button class="guide-link" id="guide-button" type="button">How it works ${svg('arrow', 15)}</button></nav>
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
          <div class="hero-foot"><span class="tiny-avatars"><b>01</b><b>02</b><b>03</b></span><span>Built for curious C learners</span></div>
        </div>
        <div class="hero-preview" aria-hidden="true"><div class="preview-bar"><span class="window-dots"><i></i><i></i><i></i></span><span>main.c</span><span class="preview-run">● LIVE TRACE</span></div><div class="preview-code"><div><span>03</span><code>int main(void) {</code></div><div><span>04</span><code>  int n;</code></div><div><span>05</span><code>  scanf("%d", &amp;n);</code></div><div class="preview-active"><span>06</span><code>  for (int i = 1; i &lt;= n; i++) {</code></div><div><span>07</span><code>    printf("%d\\n", i);</code></div><div><span>08</span><code>  }</code></div></div><div class="preview-bottom"><span class="preview-arrow">↳</span><div><small>CURRENT STEP</small><strong>Check: 3 ≤ 4 <span>✓ true</span></strong></div></div></div>
        <div class="hero-side-label">SCROLL TO EXPLORE <span>↓</span></div>
      </section>

      <section class="learning-section" id="topics">
        <div class="section-heading"><div><span class="section-kicker">YOUR LEARNING MAP</span><h2>One topic at a time<span class="period">.</span></h2><p>Pick a concept and build an intuition for how it runs.</p></div><div class="topic-count"><strong>07</strong><span>CORE TOPICS</span></div></div>
        <div class="learning-layout">
          <aside class="topic-sidebar" aria-label="C topics"><div class="sidebar-title">TOPICS <span>01 — 07</span></div><div class="topic-list">${topics.map((t,i) => `<button class="topic-item ${state.topic === t.id ? 'selected' : ''}" data-topic="${t.id}" type="button" aria-pressed="${state.topic === t.id}"><span class="topic-icon" style="--topic-color:${t.color}">${t.icon}</span><span class="topic-name">${t.label}</span><span class="topic-index">0${i+1}</span></button>`).join('')}</div><div class="sidebar-note">${svg('spark', 20)}<span>More problems arrive as your lecturer adds them.</span></div></aside>
          <div class="topic-main"><div class="topic-intro"><div><div class="topic-overline"><span style="background:${activeTopic.color}"></span> EXPLORE THE CONCEPT</div><h3>${activeTopic.label}</h3><p>${activeTopic.description}</p></div><span class="topic-big-icon" style="--topic-color:${activeTopic.color}">${activeTopic.icon}</span></div>
            ${topicProblems.length ? `<div class="lesson-grid">${topicProblems.map(problem => `<div class="lesson-card"><div class="lesson-card-main"><div class="lesson-kicker"><span class="sample-pill">${escapeHTML(problem.label || 'LESSON')}</span><span class="lesson-dot">•</span>${escapeHTML(problem.level)}<span class="lesson-dot">•</span>${escapeHTML(problem.time)}</div><h4>${escapeHTML(problem.title)}</h4><p>${escapeHTML(problem.statement)}</p></div><button type="button" data-problem="${escapeHTML(problem.id)}" class="lesson-open">Visualize ${svg('arrow', 18)}</button></div>`).join('')}</div>` : `<div class="empty-lessons"><span class="empty-symbol">${activeTopic.icon}</span><span class="empty-eyebrow">LESSONS COMING NEXT</span><h4>Your ${activeTopic.short.toLowerCase()} problems go here.</h4><p>This topic is ready for the problem statements and C solutions you provide. Each lesson will use the same interactive step by step workspace.</p><button type="button" data-topic="loops">Explore a loop lesson ${svg('arrow', 17)}</button></div>`}
            <div class="feature-strip"><div><span>01 /</span><strong>Choose an input</strong><small>Keep examples small and focused.</small></div><div><span>02 /</span><strong>Step through code</strong><small>See the exact line being run.</small></div><div><span>03 /</span><strong>See what changes</strong><small>Track variables and output live.</small></div></div>
          </div>
        </div>
      </section>

      <section class="workspace-section" id="workspace"><div class="workspace-heading"><div><span class="section-kicker">THE WORKSPACE</span><h2>Inside the program<span class="period">.</span></h2><p>A small input makes every change easier to follow.</p></div><span class="workspace-label">INTERACTIVE DEMO <span>↘</span></span></div>
        <div class="workspace-switcher" aria-label="Problem navigation"><div class="switcher-heading"><span class="switcher-icon">↻</span><div><small>YOU'RE EXPLORING</small><strong>${escapeHTML(topics.find(t => t.id === lesson.topic)?.label || 'Problems')} <span>· ${String(problemIndex + 1).padStart(2, '0')} / ${String(problems.length).padStart(2, '0')}</span></strong></div></div><div class="switcher-actions"><label class="switcher-select" for="problem-picker"><span>SWITCH PROBLEM</span><select id="problem-picker" aria-label="Switch problem">${topics.map(topic => { const matches = problems.filter(problem => problem.topic === topic.id); return matches.length ? `<optgroup label="${escapeHTML(topic.label)}">${matches.map(problem => `<option value="${escapeHTML(problem.id)}" ${problem.id === lesson.id ? 'selected' : ''}>${escapeHTML(problem.label)} · ${escapeHTML(problem.title)}</option>`).join('')}</optgroup>` : ''; }).join('')}</select></label><button class="switcher-arrow" id="previous-problem" type="button" aria-label="Previous problem" title="Previous problem" ${problemIndex === 0 ? 'disabled' : ''}>←</button><button class="switcher-arrow" id="next-problem" type="button" aria-label="Next problem" title="Next problem" ${problemIndex === problems.length - 1 ? 'disabled' : ''}>→</button></div></div>
        <div class="lab-shell"><div class="lab-topline"><div class="lab-title"><span class="lab-icon">{ }</span><div><small>NOW VISUALIZING</small><strong>${escapeHTML(lesson.title)}</strong></div></div><span class="sample-pill">${escapeHTML(lesson.label)}</span></div>
          <div class="problem-statement"><div class="statement-icon">${svg('book', 20)}</div><div><h3>Problem statement</h3><p>${lesson.statement}</p><div class="example-row"><span>EXAMPLE</span><code>input: ${lesson.example.input}</code><span class="example-arrow">→</span><code>output: ${lesson.example.output}</code></div></div></div>
          <div class="input-panel"><div class="input-label"><label for="number-input">${escapeHTML(lesson.input.label)} <span>n</span></label><small>Small inputs keep the steps clear · ${lesson.input.min}–${lesson.input.max}</small></div><div class="input-controls"><button type="button" id="decrease" aria-label="Decrease N" ${state.input <= lesson.input.min ? 'disabled' : ''}>−</button><input id="number-input" type="number" min="${lesson.input.min}" max="${lesson.input.max}" value="${state.input}" inputmode="numeric" aria-describedby="input-help"/><button type="button" id="increase" aria-label="Increase N" ${state.input >= lesson.input.max ? 'disabled' : ''}>+</button><span id="input-help" class="input-hint">Press Enter to update</span></div></div>
          <div class="visual-grid"><div class="code-panel"><div class="panel-header"><span><i class="panel-dot"></i> SOLUTION.C</span><span>C</span></div><div class="code-list" role="list" aria-label="C source code">${lesson.code.map((line,i) => `<div class="code-line ${current.line === i+1 ? 'active-line' : ''}" role="listitem" ${current.line === i+1 ? 'aria-current="step"' : ''}><span class="line-number">${String(i+1).padStart(2,'0')}</span><code>${escapeHTML(line) || ' '}</code>${current.line === i+1 ? '<span class="line-cursor">●</span>' : ''}</div>`).join('')}</div><div class="code-footer"><span>● Current line</span><span>Read only · lecturer solution</span></div></div>
            <div class="state-column"><div class="explain-panel"><div class="panel-header"><span><i class="panel-dot orange"></i> WHAT'S HAPPENING</span><span>STEP ${String(state.step+1).padStart(2,'0')}</span></div><div class="explain-body"><div class="step-label">${current.phase === 'done' ? 'FINISHED' : 'CURRENT STEP'}</div><h3>${escapeHTML(current.title)}</h3><p>${escapeHTML(current.detail)}</p><div class="line-reference">${svg('arrow', 15)} Line ${current.line} is active</div></div></div><div class="variables-panel"><div class="panel-header"><span><i class="panel-dot purple"></i> VARIABLE WATCH</span><span>LIVE VALUES</span></div><div class="variable-rows">${Object.entries(current.variables).map(([name,value]) => `<div class="variable-row"><span class="variable-name">${name}</span><span class="variable-type">int</span><strong class="variable-value ${value === null ? 'unset' : ''}">${value === null ? 'unset' : value}</strong></div>`).join('')}</div></div><div class="output-panel"><div class="panel-header"><span><i class="panel-dot green"></i> CONSOLE OUTPUT</span><span>STDOUT</span></div><div class="console-output"><span class="console-prompt">&gt;</span><code>${current.output ? escapeHTML(current.output) : '<span class="console-placeholder">Waiting for output...</span>'}</code><span class="console-cursor"></span></div></div></div></div>
          <div class="playback"><div class="playback-controls"><button class="icon-button" id="reset" type="button" title="Reset" aria-label="Reset">${svg('reset')}</button><button class="icon-button" id="previous" type="button" title="Previous step" aria-label="Previous step" ${state.step === 0 ? 'disabled' : ''}>${svg('back')}</button><button class="play-button" id="play" type="button" aria-label="${state.playing ? 'Pause' : 'Play'}">${svg(state.playing ? 'pause' : 'play', 20)}<span>${state.playing ? 'Pause' : 'Play'}</span></button><button class="icon-button" id="next" type="button" title="Next step" aria-label="Next step" ${state.step === steps.length-1 ? 'disabled' : ''}>${svg('next')}</button></div><div class="progress-wrap"><div class="progress-top"><span>STEP ${String(state.step+1).padStart(2,'0')} <b>/ ${String(steps.length).padStart(2,'0')}</b></span><span>${Math.round((state.step/(steps.length-1))*100)}%</span></div><input id="scrubber" type="range" min="0" max="${steps.length-1}" value="${state.step}" aria-label="Jump to step" style="--progress:${(state.step/(steps.length-1))*100}%"/></div><div class="speed-control"><label for="speed">SPEED</label><select id="speed" aria-label="Playback speed"><option value="1400" ${state.speed === 1400 ? 'selected' : ''}>0.5×</option><option value="850" ${state.speed === 850 ? 'selected' : ''}>1×</option><option value="430" ${state.speed === 430 ? 'selected' : ''}>2×</option></select></div></div>
        </div><div class="workspace-tip">✦ <span>Tip: use the arrow keys to move between steps when you're in the visualizer.</span></div>
      </section>
    </main>
    <footer><div class="footer-brand"><span class="brand-mark">{<span>c</span>}</span><span>C Code <strong>Lab</strong></span></div><p>Make the invisible parts of C visible.</p><span>Made for learning, one line at a time. © ${new Date().getFullYear()}</span></footer>
    ${state.showHelp ? `<div class="modal-backdrop" id="modal-backdrop"><div class="guide-modal" role="dialog" aria-modal="true" aria-labelledby="guide-title"><button id="close-guide" class="close-guide" aria-label="Close guide">×</button><span class="section-kicker">QUICK GUIDE</span><h2 id="guide-title">Learn by stepping through.</h2><ol><li><strong>Choose a problem.</strong> The Loops topic now has ten lessons.</li><li><strong>Set a small input.</strong> Each problem shows its accepted range.</li><li><strong>Play or step.</strong> Follow the highlighted C line, variable values, and output.</li><li><strong>Read the explanation.</strong> Each step says why the state changed.</li></ol><button class="primary-action" id="start-guide">Try a lesson ${svg('arrow', 17)}</button></div></div>` : ''}
  `;
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
function selectProblem(id, scrollToWorkspace = false) {
  const selected = problems.find(problem => problem.id === id);
  if (!selected || selected.id === state.problem.id) {
    if (scrollToWorkspace) { location.hash = 'workspace'; document.querySelector('#workspace').scrollIntoView({ behavior: 'smooth' }); }
    return;
  }
  stop(); state.problem = selected; state.topic = selected.topic; state.input = selected.input.default; state.step = 0;
  render();
  if (scrollToWorkspace) {
    location.hash = 'workspace';
    document.querySelector('#workspace').scrollIntoView({ behavior: 'smooth' });
  }
}
function bind() {
  document.querySelectorAll('[data-topic]').forEach(button => button.addEventListener('click', () => {
    state.topic = button.dataset.topic; stop(); render(); document.querySelector('#topics').scrollIntoView({ behavior: 'smooth' });
  }));
  document.querySelectorAll('[data-problem]').forEach(button => button.addEventListener('click', () => {
    selectProblem(button.dataset.problem, true);
  }));
  document.querySelector('#problem-picker').addEventListener('change', e => selectProblem(e.target.value));
  document.querySelector('#previous-problem').addEventListener('click', () => selectProblem(problems[problems.findIndex(problem => problem.id === state.problem.id) - 1]?.id));
  document.querySelector('#next-problem').addEventListener('click', () => selectProblem(problems[problems.findIndex(problem => problem.id === state.problem.id) + 1]?.id));
  document.querySelector('#guide-button').addEventListener('click', () => { state.showHelp = true; render(); });
  document.querySelector('#close-guide')?.addEventListener('click', () => { state.showHelp = false; render(); });
  document.querySelector('#modal-backdrop')?.addEventListener('click', e => { if (e.target.id === 'modal-backdrop') { state.showHelp = false; render(); } });
  document.querySelector('#start-guide')?.addEventListener('click', () => { state.showHelp = false; render(); document.querySelector('#workspace').scrollIntoView({ behavior: 'smooth' }); });
  document.querySelector('#decrease').addEventListener('click', () => setInput(state.input - 1));
  document.querySelector('#increase').addEventListener('click', () => setInput(state.input + 1));
  const input = document.querySelector('#number-input');
  input.addEventListener('change', () => setInput(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); setInput(input.value); input.blur(); } });
  document.querySelector('#reset').addEventListener('click', () => moveTo(0));
  document.querySelector('#previous').addEventListener('click', () => moveTo(state.step - 1));
  document.querySelector('#next').addEventListener('click', () => moveTo(state.step + 1));
  document.querySelector('#play').addEventListener('click', play);
  document.querySelector('#scrubber').addEventListener('input', e => { e.target.style.setProperty('--progress', `${Number(e.target.value) / (trace().length - 1) * 100}%`); });
  document.querySelector('#scrubber').addEventListener('change', e => moveTo(Number(e.target.value)));
  document.querySelector('#speed').addEventListener('change', e => { state.speed = Number(e.target.value); if (state.playing) { stop(); play(); } });
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && state.showHelp) { state.showHelp = false; render(); }
  if (state.showHelp || !location.hash.includes('workspace') || ['INPUT','SELECT','BUTTON'].includes(document.activeElement?.tagName)) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); moveTo(state.step + 1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); moveTo(state.step - 1); }
});
render();
