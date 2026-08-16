import {
  loadProgress,
  saveProgress,
  recordAttempt,
  toggleFlag,
  clearProgress,
  summarize,
  summarizeByType,
  applyStoredTheme,
  getTheme,
  setTheme,
} from './storage.js';
import { renderQuestionStem, renderOptionContent } from './renderers.js';
import {
  mountKeypad,
  mountLatinPicker,
  mountDualFs,
  gradeMeAnswer,
  gradeFsAnswer,
  gradeLsAnswer,
} from './widgets.js';
import { startExamMock } from './exam-mock.js';
import { openLearnView } from './learn.js';
import { openAboutView } from './about.js';

applyStoredTheme();

const hubView = document.getElementById('hubView');
const quizView = document.getElementById('quizView');
const resultView = document.getElementById('resultView');
const learnView = document.getElementById('learnView');
const aboutView = document.getElementById('aboutView');
const examRoot = document.getElementById('examRoot');

const els = {
  type: document.getElementById('typeSelect'),
  difficulty: document.getElementById('diffSelect'),
  mode: document.getElementById('modeSelect'),
  start: document.getElementById('startBtn'),
  examMock: document.getElementById('examMockBtn'),
  learn: document.getElementById('learnBtn'),
  about: document.getElementById('aboutBtn'),
  review: document.getElementById('reviewBtn'),
  reset: document.getElementById('resetBtn'),
  themeBtn: document.getElementById('themeBtn'),
  stats: document.getElementById('stats'),
  typeStats: document.getElementById('typeStats'),
  sessionList: document.getElementById('sessionList'),
  qMeta: document.getElementById('qMeta'),
  timer: document.getElementById('timer'),
  stem: document.getElementById('stem'),
  prompt: document.getElementById('prompt'),
  widgetMount: document.getElementById('widgetMount'),
  options: document.getElementById('options'),
  feedback: document.getElementById('feedback'),
  scratchWrap: document.getElementById('scratchWrap'),
  scratchPad: document.getElementById('scratchPad'),
  scratchClear: document.getElementById('scratchClear'),
  flagBtn: document.getElementById('flagBtn'),
  checkBtn: document.getElementById('checkBtn'),
  revealBtn: document.getElementById('revealBtn'),
  nextBtn: document.getElementById('nextBtn'),
  quitBtn: document.getElementById('quitBtn'),
  resultBody: document.getElementById('resultBody'),
  backHub: document.getElementById('backHub'),
};

let bank = [];
let progress = loadProgress();
let session = null;
let timerId = null;
/** @type {ReturnType<typeof setInterval> | null} */
let autoNextTimer = null;
let autoNextLeft = 0;

function syncThemeBtn() {
  const light = getTheme() === 'light';
  els.themeBtn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  els.themeBtn.title = light ? 'Dark mode' : 'Light mode';
}
syncThemeBtn();

async function loadBank() {
  const files = ['me', 'ls', 'fs', 'gam'];
  const all = [];
  for (const f of files) {
    const res = await fetch(`./data/${f}.json`);
    if (!res.ok) throw new Error(`Failed to load ${f}.json — serve over HTTP (see PREREQUISITES.md).`);
    all.push(...(await res.json()));
  }
  bank = all;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function filterBank({ type, difficulty, reviewOnly }) {
  let items = bank;
  if (type && type !== 'mixed') items = items.filter((q) => q.type === type);
  if (difficulty && difficulty !== 'all') items = items.filter((q) => q.difficulty === difficulty);
  if (reviewOnly) {
    items = items.filter(
      (q) => progress.flags[q.id] || (progress.attempts[q.id] && !progress.attempts[q.id].correct)
    );
  }
  return items;
}

function timedConfig(type) {
  if (type === 'gam') return { seconds: 90 * 60, limit: 20 };
  return { seconds: 25 * 60, limit: 20 };
}

function show(view) {
  hubView.classList.toggle('hidden', view !== 'hub');
  quizView.classList.toggle('hidden', view !== 'quiz');
  resultView.classList.toggle('hidden', view !== 'result');
  learnView.classList.toggle('hidden', view !== 'learn');
  aboutView.classList.toggle('hidden', view !== 'about');
}

function isNumericMe(q) {
  return q.type === 'me' && (q.entryMode === 'numeric' || q.answerValue != null);
}
function isDualFs(q) {
  return q.type === 'fs' && q.answerFrames && q.answerFrames.fifth;
}
function isWidgetLs(q) {
  return q.type === 'ls';
}

function gradeAnswer(q, ans) {
  if (isNumericMe(q)) return gradeMeAnswer(q, ans);
  if (isDualFs(q)) return gradeFsAnswer(q, ans);
  if (isWidgetLs(q)) return gradeLsAnswer(q, ans);
  return ans === q.answer;
}

function serializeAns(ans) {
  return typeof ans === 'object' && ans !== null ? JSON.stringify(ans) : String(ans ?? '');
}

function showSolution(q, correct, target = els.feedback) {
  target.classList.remove('hidden');
  target.className = `feedback ${correct ? 'ok' : 'bad'}`;
  let head = correct ? 'Correct. ' : 'Incorrect. ';
  if (!correct) {
    if (isNumericMe(q)) head += `Answer ${q.answerValue}. `;
    else if (isDualFs(q)) head += 'Correct frames marked below. ';
    else head += `Answer ${String(q.answer).toUpperCase()}. `;
  }
  target.textContent = head + (q.explanation || '');
}

function renderStats() {
  const s = summarize(progress);
  els.stats.innerHTML = `
    <div class="stat"><div class="n">${s.attempted}</div><div class="k">Attempted</div></div>
    <div class="stat"><div class="n">${s.accuracy}%</div><div class="k">Accuracy</div></div>
    <div class="stat"><div class="n">${s.correct}</div><div class="k">Correct</div></div>
    <div class="stat"><div class="n">${s.flagged}</div><div class="k">Flagged</div></div>
  `;
  const by = summarizeByType(progress, bank);
  const labels = { fs: 'FS', me: 'ME', ls: 'LS', gam: 'GAM' };
  els.typeStats.innerHTML = ['fs', 'me', 'ls', 'gam']
    .map((t) => {
      const x = by[t];
      return `<div class="type-row"><span class="type-name">${labels[t]}</span><span>${x.attempted} att · ${x.accuracy}% · ${x.flagged} flag</span></div>`;
    })
    .join('');
  const recent = (progress.lastScores || []).slice(0, 5);
  els.sessionList.innerHTML = recent.length
    ? recent
        .map((r) => {
          const when = new Date(r.at).toLocaleString();
          return `<div class="session-row">${r.mode}: <strong>${r.score}/${r.total}</strong> · ${when}</div>`;
        })
        .join('')
    : 'No sessions yet.';
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function clearAutoNext() {
  if (autoNextTimer) clearInterval(autoNextTimer);
  autoNextTimer = null;
  autoNextLeft = 0;
}

function goNextQuestion() {
  clearAutoNext();
  if (!session) return;
  if (session.index >= session.items.length - 1) {
    finishSession();
    return;
  }
  session.index += 1;
  renderQuestion();
}

function startAutoNext() {
  clearAutoNext();
  if (!session?.immediate) return;
  autoNextLeft = 3;
  const syncLabel = () => {
    if (!session) return;
    const n = session.index + 1;
    const total = session.items.length;
    const base = n === total ? 'Finish' : 'Next';
    els.nextBtn.textContent = `${base} (${autoNextLeft})`;
  };
  syncLabel();
  autoNextTimer = setInterval(() => {
    autoNextLeft -= 1;
    if (autoNextLeft <= 0) {
      goNextQuestion();
      return;
    }
    syncLabel();
  }, 1000);
}

function startTimer() {
  stopTimer();
  if (!session.timed) {
    els.timer.textContent = 'Untimed';
    return;
  }
  els.timer.textContent = formatTime(session.remaining);
  timerId = setInterval(() => {
    session.remaining -= 1;
    els.timer.textContent = formatTime(Math.max(0, session.remaining));
    if (session.remaining <= 0) {
      stopTimer();
      finishSession('Time is up.');
    }
  }, 1000);
}

function startSession({ reviewOnly = false } = {}) {
  const type = els.type.value;
  const difficulty = els.difficulty.value;
  const mode = els.mode.value;
  let items = filterBank({ type, difficulty, reviewOnly });
  if (!items.length) {
    alert(reviewOnly ? 'No flagged or wrong items yet.' : 'No items match these filters.');
    return;
  }
  items = shuffle(items);
  clearAutoNext();
  if (mode === 'timed') {
    const cfg = timedConfig(type === 'mixed' ? 'me' : type);
    items = items.slice(0, Math.min(cfg.limit, items.length));
    session = {
      items,
      index: 0,
      timed: true,
      remaining: cfg.seconds,
      answers: {},
      graded: {},
      revealed: {},
      immediate: false,
      modeLabel: 'timed',
    };
  } else {
    const limit = mode === 'quick' ? Math.min(10, items.length) : items.length;
    items = items.slice(0, limit);
    session = {
      items,
      index: 0,
      timed: false,
      remaining: 0,
      answers: {},
      graded: {},
      revealed: {},
      immediate: mode !== 'exam',
      modeLabel: mode === 'exam' ? 'exam' : 'practice',
    };
  }
  els.scratchWrap.classList.remove('hidden');
  show('quiz');
  startTimer();
  renderQuestion();
}

function currentQ() {
  return session.items[session.index];
}

function setPracticeAnswer(val) {
  const q = currentQ();
  session.answers[q.id] = val;
  renderQuestion();
}

function renderQuestion() {
  const q = currentQ();
  const n = session.index + 1;
  const total = session.items.length;
  const graded = session.graded[q.id];
  const revealed = session.revealed[q.id];
  const locked = !!(graded || revealed);
  const selected = session.answers[q.id];

  els.qMeta.innerHTML = `
    <span class="badge">${n} / ${total}</span>
    <span class="badge">${q.type.toUpperCase()}</span>
    <span class="badge">${q.difficulty}</span>
    <span class="badge">${q.id}</span>
  `;

  const useKeypad = isNumericMe(q);
  const useDual = isDualFs(q);
  const useLs = isWidgetLs(q);
  const gradeResult = locked ? (gradeAnswer(q, selected) ? 'ok' : 'bad') : null;

  els.stem.innerHTML = '';
  els.stem.appendChild(
    renderQuestionStem({ ...q, _widgetLs: useLs }, { hideFsQuestionMark: useDual })
  );
  els.prompt.textContent = useDual
    ? 'Select the 5th and 6th matrices that continue the series.'
    : q.prompt;

  els.feedback.className = 'feedback hidden';
  els.feedback.textContent = '';
  els.widgetMount.innerHTML = '';
  els.options.innerHTML = '';

  if (useKeypad) {
    mountKeypad(els.widgetMount, {
      value: selected,
      onChange: setPracticeAnswer,
      disabled: locked,
      result: gradeResult,
    });
  } else if (useLs) {
    mountLatinPicker(els.widgetMount, q, {
      value: selected,
      onChange: setPracticeAnswer,
      disabled: locked,
      result: gradeResult,
    });
  } else if (useDual) {
    mountDualFs(els.widgetMount, q, {
      fifth: selected?.fifth || null,
      sixth: selected?.sixth || null,
      onChange: setPracticeAnswer,
      disabled: locked,
      showResult: locked,
    });
  } else {
    for (const opt of q.options || []) {
      const label = document.createElement('label');
      label.className = 'option';
      if (selected === opt.id) label.classList.add('selected');
      if (locked) {
        if (opt.id === q.answer) label.classList.add('correct');
        else if (selected === opt.id && opt.id !== q.answer) label.classList.add('wrong');
      }
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'answer';
      input.value = opt.id;
      input.checked = selected === opt.id;
      input.disabled = locked;
      input.addEventListener('change', () => setPracticeAnswer(opt.id));
      label.appendChild(input);
      label.appendChild(renderOptionContent(q, opt));
      els.options.appendChild(label);
    }
  }

  if (locked) {
    if (useKeypad) {
      els.feedback.className = 'feedback hidden';
      els.feedback.textContent = '';
      const inline = els.widgetMount.querySelector('[data-inline-fb]');
      if (inline) showSolution(q, gradeResult === 'ok', inline);
    } else {
      showSolution(q, gradeResult === 'ok');
    }
  }

  els.flagBtn.textContent = progress.flags[q.id] ? 'Unflag' : 'Flag';
  if (session.immediate) {
    els.checkBtn.classList.remove('hidden');
    els.checkBtn.disabled = locked;
    els.revealBtn.classList.add('hidden');
  } else {
    els.checkBtn.classList.add('hidden');
    const canReveal = selected != null && !revealed;
    els.revealBtn.classList.toggle('hidden', !canReveal);
  }
  els.nextBtn.textContent = n === total ? 'Finish' : 'Next';
  if (autoNextTimer && autoNextLeft > 0) {
    const base = n === total ? 'Finish' : 'Next';
    els.nextBtn.textContent = `${base} (${autoNextLeft})`;
  }
}

function gradeCurrent(showFb) {
  const q = currentQ();
  const ans = session.answers[q.id];
  if (ans == null || ans === '') {
    alert('Enter or select an answer first.');
    return false;
  }
  if (isDualFs(q) && q.answerFrames?.sixth && (!ans.fifth || !ans.sixth)) {
    alert('Fill both the 5th and 6th matrix slots.');
    return false;
  }
  const correct = gradeAnswer(q, ans);
  session.graded[q.id] = { correct, ans };
  recordAttempt(progress, q.id, serializeAns(ans), correct, q.type);
  progress = loadProgress();
  if (showFb) {
    renderQuestion();
    if (correct) startAutoNext();
  }
  return true;
}

function revealSolution() {
  const q = currentQ();
  if (session.answers[q.id] == null) {
    alert('Answer first (or skip with Next).');
    return;
  }
  if (!session.graded[q.id]) {
    const ans = session.answers[q.id];
    const correct = gradeAnswer(q, ans);
    session.graded[q.id] = { correct, ans };
    recordAttempt(progress, q.id, serializeAns(ans), correct, q.type);
    progress = loadProgress();
  }
  session.revealed[q.id] = true;
  renderStats();
  renderQuestion();
}

function finishSession(note = '') {
  clearAutoNext();
  stopTimer();
  let correct = 0;
  for (const q of session.items) {
    const ans = session.answers[q.id];
    if (ans == null || ans === '') continue;
    const ok = gradeAnswer(q, ans);
    if (!session.graded[q.id]) {
      recordAttempt(progress, q.id, serializeAns(ans), ok, q.type);
    }
    if (ok) correct += 1;
  }
  progress = loadProgress();
  progress.lastScores.unshift({
    mode: session.modeLabel || 'practice',
    score: correct,
    total: session.items.length,
    at: Date.now(),
  });
  progress.lastScores = progress.lastScores.slice(0, 10);
  saveProgress(progress);
  renderStats();
  const missed = session.items.filter((q) => {
    const ans = session.answers[q.id];
    return ans != null && ans !== '' && !gradeAnswer(q, ans);
  });
  els.resultBody.innerHTML = `
    <p><strong>${correct}</strong> / ${session.items.length} correct${note ? ' — ' + note : ''}.</p>
    <p class="note">Log totals in progress/TRACKER.md if you want a durable sheet.</p>
    ${missed.length ? `<p>Missed: ${missed.map((q) => q.id).join(', ')}</p>` : '<p>No misses in answered items.</p>'}
  `;
  show('result');
}

els.themeBtn.addEventListener('click', () => {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  syncThemeBtn();
});

els.start.addEventListener('click', () => startSession({ reviewOnly: false }));
els.review.addEventListener('click', () => startSession({ reviewOnly: true }));
els.learn.addEventListener('click', () => {
  stopTimer();
  show('learn');
  openLearnView(learnView, {
    onBack: () => {
      learnView.innerHTML = '';
      show('hub');
      renderStats();
    },
  });
});
els.about.addEventListener('click', () => {
  stopTimer();
  show('about');
  openAboutView(aboutView, {
    onBack: () => {
      aboutView.innerHTML = '';
      show('hub');
      renderStats();
    },
  });
});
els.examMock.addEventListener('click', () => {
  stopTimer();
  hubView.classList.add('hidden');
  quizView.classList.add('hidden');
  resultView.classList.add('hidden');
  learnView.classList.add('hidden');
  aboutView.classList.add('hidden');
  startExamMock({
    bank,
    root: examRoot,
    onExit: () => {
      progress = loadProgress();
      renderStats();
      show('hub');
    },
  });
});

els.reset.addEventListener('click', () => {
  if (confirm('Clear all local progress and flags?')) {
    progress = clearProgress();
    renderStats();
  }
});

els.scratchClear.addEventListener('click', () => {
  els.scratchPad.value = '';
});

els.flagBtn.addEventListener('click', () => {
  toggleFlag(progress, currentQ().id);
  progress = loadProgress();
  renderStats();
  renderQuestion();
});
els.checkBtn.addEventListener('click', () => gradeCurrent(true));
els.revealBtn.addEventListener('click', () => revealSolution());
els.nextBtn.addEventListener('click', () => {
  if (autoNextTimer) {
    goNextQuestion();
    return;
  }
  const q = currentQ();
  const ans = session.answers[q.id];
  if (ans == null || ans === '') {
    if (!confirm('No answer. Continue anyway?')) return;
  } else if (session.immediate && !session.graded[q.id]) {
    gradeCurrent(true);
    return;
  } else if (!session.immediate && !session.graded[q.id]) {
    const ok = gradeAnswer(q, ans);
    session.graded[q.id] = { correct: ok, ans };
    recordAttempt(progress, q.id, serializeAns(ans), ok, q.type);
    progress = loadProgress();
  }
  goNextQuestion();
});
els.quitBtn.addEventListener('click', () => {
  if (confirm('End this session and score answered items?')) finishSession('Session ended early.');
});
els.backHub.addEventListener('click', () => {
  clearAutoNext();
  stopTimer();
  show('hub');
  renderStats();
});

loadBank()
  .then(() => {
    renderStats();
  })
  .catch((err) => {
    console.error(err);
    alert(`Failed to load question bank: ${err.message}`);
  });
