import { renderQuestionStem } from './renderers.js';
import {
  mountKeypad,
  mountLatinPicker,
  mountDualFs,
  gradeMeAnswer,
  gradeFsAnswer,
  gradeLsAnswer,
} from './widgets.js';
import { loadProgress, saveProgress, recordAttempt } from './storage.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(sec) {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = Math.max(0, sec) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const PHASES = [
  { id: 'fs', title: 'Figure Sequences', type: 'fs', seconds: 25 * 60, limit: 20 },
  { id: 'me', title: 'Mathematical Equations', type: 'me', seconds: 25 * 60, limit: 20 },
  { id: 'ls', title: 'Latin Squares', type: 'ls', seconds: 25 * 60, limit: 20 },
  { id: 'break', title: 'Break', type: null, seconds: 30 * 60 },
  { id: 'gam', title: 'General Academic Module', type: 'gam', seconds: 90 * 60, limit: 20 },
];

export function startExamMock({ bank, root, onExit }) {
  document.body.classList.add('exam-shell');
  root.classList.remove('hidden');
  root.innerHTML = '';

  const state = {
    phaseIndex: -1, // -1 = intro
    items: [],
    index: 0,
    answers: {},
    flags: {},
    remaining: 0,
    timerId: null,
    scores: {},
    ended: {},
  };

  function stopTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
  }

  function pickItems(type, limit) {
    let pool = bank.filter((q) => q.type === type);
    pool = shuffle(pool);
    return pool.slice(0, Math.min(limit, pool.length));
  }

  function beginPhase(i) {
    stopTimer();
    state.phaseIndex = i;
    const phase = PHASES[i];
    if (phase.id === 'break') {
      state.remaining = phase.seconds;
      renderBreak();
      state.timerId = setInterval(() => {
        state.remaining -= 1;
        const el = root.querySelector('[data-break-timer]');
        if (el) el.textContent = formatTime(state.remaining);
        if (state.remaining <= 0) nextPhase();
      }, 1000);
      return;
    }
    state.items = pickItems(phase.type, phase.limit);
    state.index = 0;
    state.answers = {};
    state.flags = {};
    state.remaining = phase.seconds;
    renderExam();
    state.timerId = setInterval(() => {
      state.remaining -= 1;
      const el = root.querySelector('[data-exam-timer]');
      if (el) el.textContent = formatTime(state.remaining);
      if (state.remaining <= 0) endSubtest(true);
    }, 1000);
  }

  function nextPhase() {
    const next = state.phaseIndex + 1;
    if (next >= PHASES.length) {
      finishExam();
      return;
    }
    beginPhase(next);
  }

  function endSubtest(fromTimer) {
    const phase = PHASES[state.phaseIndex];
    if (phase.id === 'break') {
      nextPhase();
      return;
    }
    if (!fromTimer) {
      if (!confirm('End this subtest? You cannot return to it (same rule as the real exam).')) return;
    }
    // score
    let correct = 0;
    for (const q of state.items) {
      const ans = state.answers[q.id];
      if (ans == null) continue;
      let ok = false;
      if (q.type === 'me') ok = gradeMeAnswer(q, ans);
      else if (q.type === 'fs') ok = gradeFsAnswer(q, ans);
      else if (q.type === 'ls') ok = gradeLsAnswer(q, ans);
      else ok = ans === q.answer;
      if (ok) correct += 1;
      recordAttempt(loadProgress(), q.id, typeof ans === 'object' ? JSON.stringify(ans) : String(ans), ok, q.type);
    }
    state.scores[phase.id] = { correct, total: state.items.length };
    state.ended[phase.id] = true;
    nextPhase();
  }

  function finishExam() {
    stopTimer();
    let progress = loadProgress();
    const parts = Object.entries(state.scores);
    const totalC = parts.reduce((s, [, v]) => s + v.correct, 0);
    const totalT = parts.reduce((s, [, v]) => s + v.total, 0);
    progress.lastScores.unshift({
      mode: 'exam-mock',
      score: totalC,
      total: totalT,
      at: Date.now(),
    });
    progress.lastScores = progress.lastScores.slice(0, 10);
    saveProgress(progress);

    root.innerHTML = `
      <div class="exam-score">
        <h2>Exam Mock results</h2>
        <p>This approximates g.a.s.t. digital flow — still watch the official videos before test day.</p>
        <ul>
          ${parts.map(([k, v]) => `<li><strong>${k.toUpperCase()}</strong>: ${v.correct}/${v.total}</li>`).join('')}
        </ul>
        <p><strong>Total:</strong> ${totalC}/${totalT}</p>
        <div class="exam-nav">
          <button type="button" class="primary" data-exit>Back to hub</button>
        </div>
      </div>`;
    root.querySelector('[data-exit]').addEventListener('click', () => {
      document.body.classList.remove('exam-shell');
      root.classList.add('hidden');
      root.innerHTML = '';
      onExit();
    });
  }

  function renderIntro() {
    const narrow = typeof matchMedia === 'function' && matchMedia('(max-width: 640px)').matches;
    const mobileWarn = narrow
      ? `<p class="exam-mobile-warn"><strong>Desktop recommended</strong> — layout matches the test centre; OK on phone but cramped.</p>`
      : '';
    root.innerHTML = `
      <div class="exam-intro">
        <h2>Exam Mock</h2>
        <p><strong>Approximate</strong> test-centre flow (not an official g.a.s.t. clone).</p>
        ${mobileWarn}
        <ul>
          <li>Figure Sequences → Mathematical Equations → Latin Squares (25 min each)</li>
          <li>30 min break (skippable here)</li>
          <li>General Academic Module (90 min)</li>
          <li><strong>End subtest is irreversible</strong></li>
          <li>No notes / cheats (matches real dMAT rule)</li>
          <li>ME uses on-screen keypad; FS asks for 5th+6th; LS uses clickable grid</li>
        </ul>
        <p>Before the real exam, watch the official UI videos:<br>
          <a href="https://www.d-mat.de/en/preparation-for-the-exam/" target="_blank" rel="noopener">d-mat.de preparation</a>
        </p>
        <div class="exam-nav">
          <button type="button" class="primary" data-start>Start Exam Mock</button>
          <button type="button" data-cancel>Cancel</button>
        </div>
      </div>`;
    root.querySelector('[data-start]').addEventListener('click', () => beginPhase(0));
    root.querySelector('[data-cancel]').addEventListener('click', () => {
      document.body.classList.remove('exam-shell');
      root.classList.add('hidden');
      root.innerHTML = '';
      onExit();
    });
  }

  function renderBreak() {
    root.innerHTML = `
      <div class="exam-break">
        <h2>Break</h2>
        <p class="timer" data-break-timer>${formatTime(state.remaining)}</p>
        <p>Real exam: ~30 minutes between Core and Subject module. Leave the room only as instructed at the centre.</p>
        <div class="exam-nav">
          <button type="button" class="primary" data-skip>Skip break (practice only)</button>
        </div>
      </div>`;
    root.querySelector('[data-skip]').addEventListener('click', () => nextPhase());
  }

  function currentQ() {
    return state.items[state.index];
  }

  function setAnswer(val) {
    const q = currentQ();
    state.answers[q.id] = val;
    renderExam();
  }

  function renderExam() {
    const phase = PHASES[state.phaseIndex];
    const q = currentQ();
    const n = state.index + 1;
    const total = state.items.length;

    root.innerHTML = `
      <div class="exam-view">
        <div class="exam-topbar">
          <div><strong>${phase.title}</strong> · Item ${n} / ${total}</div>
          <div class="timer" data-exam-timer>${formatTime(state.remaining)}</div>
          <div class="controls">
            <button type="button" data-flag>${state.flags[q.id] ? 'Unflag' : 'Flag'}</button>
            <button type="button" data-end class="danger">End subtest</button>
          </div>
        </div>
        <div class="exam-main">
          <div class="exam-strip" data-strip></div>
          <div class="exam-work">
            <div data-stem></div>
            <p class="prompt" data-prompt></p>
            <div data-widget></div>
            <div class="exam-nav">
              <button type="button" data-prev ${state.index === 0 ? 'disabled' : ''}>Previous</button>
              <button type="button" class="primary" data-next>${state.index >= total - 1 ? 'Review / stay' : 'Next'}</button>
            </div>
          </div>
        </div>
      </div>`;

    const strip = root.querySelector('[data-strip]');
    state.items.forEach((item, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = String(i + 1);
      if (i === state.index) b.classList.add('current');
      if (state.answers[item.id] != null) b.classList.add('answered');
      if (state.flags[item.id]) b.classList.add('flagged');
      b.addEventListener('click', () => {
        state.index = i;
        renderExam();
      });
      strip.appendChild(b);
    });

    const stem = root.querySelector('[data-stem]');
    const useDual = q.type === 'fs' && q.answerFrames;
    const useLsWidget = q.type === 'ls';
    const useKeypad = q.type === 'me' && (q.entryMode === 'numeric' || q.answerValue != null);
    stem.appendChild(
      renderQuestionStem(
        { ...q, _widgetLs: useLsWidget },
        { hideFsQuestionMark: useDual }
      )
    );
    root.querySelector('[data-prompt]').textContent = useDual
      ? 'Select the 5th and 6th matrices that continue the series.'
      : q.prompt;

    const widget = root.querySelector('[data-widget]');
    const ans = state.answers[q.id];

    if (useKeypad) {
      mountKeypad(widget, {
        value: ans,
        onChange: setAnswer,
        disabled: false,
      });
    } else if (useLsWidget) {
      mountLatinPicker(widget, q, {
        value: ans,
        onChange: setAnswer,
        disabled: false,
      });
    } else if (useDual) {
      mountDualFs(widget, q, {
        fifth: ans?.fifth || null,
        sixth: ans?.sixth || null,
        onChange: setAnswer,
        disabled: false,
      });
    } else {
      // GAM / MCQ fallback
      q.options.forEach((opt) => {
        const label = document.createElement('label');
        label.className = 'option' + (ans === opt.id ? ' selected' : '');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'examAns';
        input.checked = ans === opt.id;
        input.addEventListener('change', () => setAnswer(opt.id));
        label.appendChild(input);
        const span = document.createElement('span');
        span.textContent = `${opt.id.toUpperCase()}. ${opt.text || ''}`;
        label.appendChild(span);
        widget.appendChild(label);
      });
    }

    root.querySelector('[data-flag]').addEventListener('click', () => {
      if (state.flags[q.id]) delete state.flags[q.id];
      else state.flags[q.id] = true;
      renderExam();
    });
    root.querySelector('[data-end]').addEventListener('click', () => endSubtest(false));
    root.querySelector('[data-prev]').addEventListener('click', () => {
      if (state.index > 0) {
        state.index -= 1;
        renderExam();
      }
    });
    root.querySelector('[data-next]').addEventListener('click', () => {
      if (state.index < state.items.length - 1) {
        state.index += 1;
        renderExam();
      }
    });
  }

  renderIntro();
}
