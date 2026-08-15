/** Interactive Learn view — cheat codes as flip chips + visual examples + how-to + self-check */

import { renderMatrix } from './renderers.js';

export const CHEAT_CODES = [
  {
    id: 'fs-move',
    type: 'FS',
    code: 'MOVE-SPIN-HUE-STEP',
    meaning: 'Track movement → rotation → colour → growing step size. Edges: bounce or border-slide.',
    say: 'Move, spin, hue, step — then the edge.',
    caption: 'Square moves right one cell each step.',
  },
  {
    id: 'fs-ghost',
    type: 'FS',
    code: 'NO-GHOST',
    meaning: 'Figures never vanish and never overlap.',
    say: 'No ghosts.',
    caption: 'OK = separate cells. BAD = overlap or vanish.',
  },
  {
    id: 'me-pin',
    type: 'ME',
    code: 'PIN → CHAIN',
    meaning: 'Start from a pinned / simplest equation, then substitute into the next.',
    say: 'Pin it, chain it.',
    caption: 'Pin A = 4, then chain to find B = 7.',
  },
  {
    id: 'me-unique',
    type: 'ME',
    code: '1–20 UNIQUE',
    meaning: 'Letters are distinct integers from 1 to 20. Stuck? Test options against every equation.',
    say: 'Keep them unique.',
    caption: 'Same number twice is illegal.',
  },
  {
    id: 'ls-fat',
    type: 'LS',
    code: 'FAT FIRST',
    meaning: 'Work the row or column with the most clues first.',
    say: 'Fat first.',
    caption: 'Start on the densest row (highlighted).',
  },
  {
    id: 'ls-cross',
    type: 'LS',
    code: 'CROSS OUT',
    meaning: 'Ban letters already used in that row and that column.',
    say: 'Then cross out.',
    caption: 'Letters already in the ? row/col are banned.',
  },
  {
    id: 'gam-given',
    type: 'GAM',
    code: 'GIVEN vs GUESS',
    meaning: 'Separate stated facts from inferences. Reject anything that contradicts a given.',
    say: 'Given first.',
    caption: 'Green = given. Red strike = guess, not fact.',
  },
  {
    id: 'gam-kill',
    type: 'GAM',
    code: 'KILL CONTRADICTIONS',
    meaning: 'Eliminate broken options first, then pick what remains.',
    say: 'Kill contradictions.',
    caption: 'Cross out what breaks a given; keep the survivor.',
  },
];

const SOLVE_STEPS = {
  FS: {
    goal: 'Continue the series (often 5th + 6th matrices).',
    steps: [
      'Count figures in frame 1.',
      'For each figure: MOVE → SPIN → HUE → STEP across frames 1–4.',
      'Apply the same rule(s) to get frame 5 (and 6).',
      'Reject options that break NO-GHOST or edge rules.',
    ],
    miss: 'Ignoring x+1 step growth or bounce-at-edge.',
  },
  ME: {
    goal: 'Find the asked letter’s value (1–20, unique).',
    steps: [
      'PIN the simplest equation (often Letter = number).',
      'CHAIN substitutions until the target is known.',
      'Confirm all letters are distinct and in 1–20.',
      'If two options remain, plug both into every equation.',
    ],
    miss: 'Forgetting uniqueness or a multi-letter sum.',
  },
  LS: {
    goal: 'Letter for ? (A–E, once per row and column).',
    steps: [
      'Find the FATTEST row/col touching ?.',
      'CROSS OUT letters already in that row and column.',
      'If still ambiguous, resolve a neighbour cell, then return.',
    ],
    miss: 'Starting on a nearly empty row.',
  },
  GAM: {
    goal: 'Answer from the scenario using only givens.',
    steps: [
      'Skim once for structure.',
      'Mark GIVENs (numbers, limits, must / must not).',
      'Answer only from givens.',
      'KILL CONTRADICTIONS among options; pick the survivor.',
    ],
    miss: 'Treating a plausible inference as a given.',
  },
};

const QUIZ = [
  {
    q: 'A figure disappears between matrices. Which code did you break?',
    answerId: 'fs-ghost',
  },
  {
    q: 'You see A = 4 and A + B = 11. What do you do first?',
    answerId: 'me-pin',
  },
  {
    q: 'The ? cell’s row is almost full. Where do you start?',
    answerId: 'ls-fat',
  },
  {
    q: 'An option sounds smart but contradicts a number in the text. What now?',
    answerId: 'gam-kill',
  },
  {
    q: 'Step size goes 1, then 2, then 3… Which FS code covers that?',
    answerId: 'fs-move',
  },
  {
    q: 'Two letters might share the same number. Which rule stops that?',
    answerId: 'me-unique',
  },
];

const KNOWN_KEY = 'dmat-learn-known';

function loadKnown() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KNOWN_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveKnown(set) {
  localStorage.setItem(KNOWN_KEY, JSON.stringify([...set]));
}

function frame(r, c, colour = 'blue', shape = 'square', rot = 0) {
  return { figures: [{ shape, r, c, colour, rot }] };
}

function miniMatrixHtml(fr, size = 56) {
  const wrap = document.createElement('div');
  wrap.className = 'ex-matrix';
  wrap.appendChild(renderMatrix(fr, size));
  return wrap.outerHTML;
}

function latinMini(grid, { fatRow = -1, ban = [] } = {}) {
  let html = '<div class="ex-latin">';
  grid.forEach((row, r) => {
    html += `<div class="ex-latin-row ${r === fatRow ? 'fat' : ''}">`;
    row.forEach((cell) => {
      const banned = ban.includes(cell);
      const cls = [
        'ex-latin-cell',
        cell === '?' ? 'q' : '',
        !cell ? 'empty' : '',
        banned ? 'banned' : '',
      ]
        .filter(Boolean)
        .join(' ');
      html += `<span class="${cls}">${cell === '?' ? '?' : cell || '·'}</span>`;
    });
    html += '</div>';
  });
  html += '</div>';
  return html;
}

/** Build static example HTML for a cheat code id */
export function buildExampleHtml(id) {
  switch (id) {
    case 'fs-move':
      return `
        <div class="ex-row">
          ${miniMatrixHtml(frame(1, 0))}
          <span class="ex-arrow">→</span>
          ${miniMatrixHtml(frame(1, 1))}
          <span class="ex-arrow">→</span>
          ${miniMatrixHtml(frame(1, 2))}
        </div>`;
    case 'fs-ghost':
      return `
        <div class="ex-row ex-compare">
          <div class="ex-side">
            <span class="ex-badge ok">OK</span>
            ${miniMatrixHtml({
              figures: [
                { shape: 'square', r: 0, c: 0, colour: 'blue', rot: 0 },
                { shape: 'circle', r: 2, c: 2, colour: 'red', rot: 0 },
              ],
            })}
          </div>
          <div class="ex-side">
            <span class="ex-badge bad">BAD</span>
            ${miniMatrixHtml({
              figures: [
                { shape: 'square', r: 1, c: 1, colour: 'blue', rot: 0 },
                { shape: 'circle', r: 1, c: 1, colour: 'red', rot: 0 },
              ],
            })}
          </div>
        </div>`;
    case 'me-pin':
      return `
        <div class="ex-eq">
          <div class="ex-eq-line pin">A = 4</div>
          <div class="ex-eq-line">A + B = 11</div>
          <div class="ex-result">→ B = 7</div>
        </div>`;
    case 'me-unique':
      return `
        <div class="ex-row ex-compare">
          <div class="ex-side">
            <span class="ex-badge bad">BAD</span>
            <div class="ex-pair">A=5 · B=5</div>
          </div>
          <div class="ex-side">
            <span class="ex-badge ok">OK</span>
            <div class="ex-pair">A=5 · B=7</div>
          </div>
        </div>`;
    case 'ls-fat':
      return latinMini(
        [
          ['A', 'B', 'C', 'D', 'E'],
          ['', '', '?', '', ''],
          ['C', '', '', '', ''],
          ['', '', '', '', ''],
          ['E', '', '', '', ''],
        ],
        { fatRow: 0 }
      );
    case 'ls-cross':
      return `
        ${latinMini(
          [
            ['A', 'B', 'C', 'D', 'E'],
            ['B', '', '?', '', ''],
            ['C', '', 'A', '', ''],
            ['D', '', '', '', ''],
            ['E', '', '', '', ''],
          ],
          { ban: ['A', 'B', 'C'] }
        )}
        <div class="ex-ban-line"><s>A</s> <s>B</s> <s>C</s> → left: D / E</div>`;
    case 'gam-given':
      return `
        <p class="ex-sentence">
          The pump needs <span class="ex-given">at least 2.5 L/s</span>
          and <span class="ex-guess">probably works outdoors</span>.
        </p>`;
    case 'gam-kill':
      return `
        <div class="ex-opts">
          <span class="ex-opt dead">A · flow 2.0 ✕</span>
          <span class="ex-opt dead">B · ignores limit ✕</span>
          <span class="ex-opt live">C · flow 2.8 ✓</span>
        </div>`;
    default:
      return '<p class="note">No example</p>';
  }
}

function mountExamples(root) {
  root.querySelectorAll('[data-example-host]').forEach((host) => {
    const id = host.getAttribute('data-example-host');
    host.innerHTML = buildExampleHtml(id);
  });
}

export function openLearnView(root, { onBack }) {
  let known = loadKnown();
  let filter = 'ALL';
  let solveType = 'FS';
  let quizIndex = 0;
  let quizFeedback = '';
  /** @type {Record<string, number>} face 0=code 1=meaning 2=example */
  const faces = {};

  function render() {
    const codes = filter === 'ALL' ? CHEAT_CODES : CHEAT_CODES.filter((c) => c.type === filter);
    const solve = SOLVE_STEPS[solveType];
    const quiz = QUIZ[quizIndex % QUIZ.length];
    const correctCode = CHEAT_CODES.find((c) => c.id === quiz.answerId);

    root.innerHTML = `
      <div class="learn-view">
        <div class="learn-top">
          <button type="button" data-back>← Hub</button>
          <h2>Learn · Cheat codes</h2>
          <p class="note">Tap a card: code → meaning → <strong>example</strong>. Study only — not in Exam Mock.</p>
        </div>

        <div class="panel say-panel">
          <div class="say-label">Say it once (30 sec)</div>
          <p class="say-line">MOVE-SPIN-HUE-STEP · NO-GHOST · PIN→CHAIN · 1–20 UNIQUE · FAT FIRST · CROSS OUT · GIVEN vs GUESS · KILL CONTRADICTIONS</p>
        </div>

        <div class="learn-filters controls">
          ${['ALL', 'FS', 'ME', 'LS', 'GAM']
            .map(
              (t) =>
                `<button type="button" data-filter="${t}" class="${filter === t ? 'primary' : ''}">${t}</button>`
            )
            .join('')}
        </div>

        <div class="code-grid">
          ${codes
            .map((c) => {
              const isKnown = known.has(c.id);
              const face = faces[c.id] || 0;
              return `
              <button type="button" class="code-card type-${c.type.toLowerCase()} ${isKnown ? 'known' : ''}" data-flip="${c.id}" data-face="${face}">
                <div class="code-card-inner">
                  <div class="code-face code-front">
                    <span class="type-pill">${c.type}</span>
                    <span class="code-text">${c.code}</span>
                    <span class="tap-hint">tap · meaning</span>
                  </div>
                  <div class="code-face code-back">
                    <span class="type-pill">${c.type}</span>
                    <p class="code-meaning">${c.meaning}</p>
                    <p class="code-say">“${c.say}”</p>
                    <span class="tap-hint">tap · example</span>
                  </div>
                  <div class="code-face code-example">
                    <span class="type-pill">${c.type}</span>
                    <div class="ex-host" data-example-host="${c.id}"></div>
                    <p class="ex-caption">${c.caption}</p>
                    <span class="tap-hint">tap · back to code</span>
                  </div>
                </div>
              </button>`;
            })
            .join('')}
        </div>

        <div class="controls" style="margin:0.75rem 0">
          <button type="button" data-mark-visible>Mark visible as known</button>
          <button type="button" data-clear-known>Clear known</button>
          <span class="note">${known.size} / ${CHEAT_CODES.length} known</span>
        </div>

        <div class="panel">
          <h3 class="panel-sub" style="margin-top:0">How to solve</h3>
          <div class="controls" style="margin-bottom:0.75rem">
            ${['FS', 'ME', 'LS', 'GAM']
              .map(
                (t) =>
                  `<button type="button" data-solve="${t}" class="${solveType === t ? 'primary' : ''}">${t}</button>`
              )
              .join('')}
          </div>
          <p class="note"><strong>Goal:</strong> ${solve.goal}</p>
          <ol class="solve-steps">
            ${solve.steps.map((s, i) => `<li><span class="step-n">${i + 1}</span> ${s}</li>`).join('')}
          </ol>
          <p class="note"><strong>Common miss:</strong> ${solve.miss}</p>
        </div>

        <div class="panel">
          <h3 class="panel-sub" style="margin-top:0">Self-check</h3>
          <p class="prompt" style="margin-top:0">${quiz.q}</p>
          <div class="code-pick controls">
            ${CHEAT_CODES.map(
              (c) =>
                `<button type="button" class="code-chip type-${c.type.toLowerCase()}" data-quiz-pick="${c.id}">${c.code}</button>`
            ).join('')}
          </div>
          <p class="note" data-quiz-fb>${quizFeedback}</p>
          <button type="button" data-quiz-next>Next question</button>
        </div>
      </div>`;

    mountExamples(root);

    root.querySelector('[data-back]').addEventListener('click', onBack);

    root.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        filter = btn.getAttribute('data-filter');
        render();
      });
    });

    root.querySelectorAll('[data-flip]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-flip');
        faces[id] = ((faces[id] || 0) + 1) % 3;
        btn.setAttribute('data-face', String(faces[id]));
      });
    });

    root.querySelector('[data-mark-visible]').addEventListener('click', () => {
      codes.forEach((c) => known.add(c.id));
      saveKnown(known);
      render();
    });

    root.querySelector('[data-clear-known]').addEventListener('click', () => {
      known = new Set();
      saveKnown(known);
      render();
    });

    root.querySelectorAll('[data-solve]').forEach((btn) => {
      btn.addEventListener('click', () => {
        solveType = btn.getAttribute('data-solve');
        render();
      });
    });

    root.querySelectorAll('[data-quiz-pick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-quiz-pick');
        if (id === quiz.answerId) {
          quizFeedback = `Yes — ${correctCode.code}. “${correctCode.say}”`;
          known.add(id);
          saveKnown(known);
        } else {
          const wrong = CHEAT_CODES.find((c) => c.id === id);
          quizFeedback = `Not ${wrong.code}. Hint: think ${correctCode.type}.`;
        }
        render();
      });
    });

    root.querySelector('[data-quiz-next]').addEventListener('click', () => {
      quizIndex += 1;
      quizFeedback = '';
      render();
    });
  }

  root.classList.remove('hidden');
  render();
}
