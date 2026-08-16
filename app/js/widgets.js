import { renderMatrix, renderLatinGrid } from './renderers.js';

function framesEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** ME on-screen keypad 1–20 */
export function mountKeypad(container, { value, onChange, disabled, result }) {
  container.innerHTML = '';
  const top = document.createElement('div');
  top.className = 'keypad-top';

  const display = document.createElement('div');
  display.className = 'keypad-display';
  if (result === 'ok') display.classList.add('ok');
  if (result === 'bad') display.classList.add('bad');
  display.textContent = value == null || value === '' ? '—' : String(value);
  top.appendChild(display);

  const inlineFb = document.createElement('div');
  inlineFb.className = 'feedback hidden';
  inlineFb.setAttribute('data-inline-fb', '');
  top.appendChild(inlineFb);
  container.appendChild(top);

  const pad = document.createElement('div');
  pad.className = 'keypad';
  for (let n = 1; n <= 20; n++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = String(n);
    btn.disabled = !!disabled;
    btn.addEventListener('click', () => onChange(n));
    pad.appendChild(btn);
  }
  const clear = document.createElement('button');
  clear.type = 'button';
  clear.textContent = 'Clear';
  clear.disabled = !!disabled;
  clear.style.gridColumn = '1 / -1';
  clear.addEventListener('click', () => onChange(null));
  pad.appendChild(clear);
  container.appendChild(pad);
}

/** LS: clickable ? cell + A–E picker */
export function mountLatinPicker(container, q, { value, onChange, disabled, result }) {
  container.innerHTML = '';
  const gridCopy = q.grid.map((row) => row.slice());
  // show chosen letter in ? if set
  if (value) {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (q.grid[r][c] === '?') gridCopy[r][c] = value.toUpperCase();
      }
    }
  }
  const gridEl = renderLatinGrid(gridCopy);
  // mark ? / answer cell clickable
  gridEl.querySelectorAll('.latin-cell').forEach((cell, i) => {
    const r = Math.floor(i / 5);
    const c = i % 5;
    if (q.grid[r][c] === '?' || (value && gridCopy[r][c] === value.toUpperCase() && q.grid[r][c] === '?')) {
      cell.classList.add('q', 'clickable');
      if (result === 'ok') cell.classList.add('ok');
      if (result === 'bad') cell.classList.add('bad');
    }
  });
  container.appendChild(gridEl);

  const picker = document.createElement('div');
  picker.className = 'letter-picker';
  const correct = String(q.answer || '').toLowerCase();
  for (const L of ['A', 'B', 'C', 'D', 'E']) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = L;
    btn.disabled = !!disabled;
    const isSel = value && value.toLowerCase() === L.toLowerCase();
    if (isSel) btn.classList.add('primary');
    if (result && isSel) btn.classList.add(result === 'ok' ? 'ok' : 'bad');
    if (result === 'bad' && L.toLowerCase() === correct) btn.classList.add('ok');
    btn.addEventListener('click', () => onChange(L.toLowerCase()));
    picker.appendChild(btn);
  }
  container.appendChild(picker);
}

/** FS dual: pick 5th and optionally 6th from pool */
export function mountDualFs(container, q, { fifth, sixth, onChange, disabled, showResult }) {
  container.innerHTML = '';
  const hasSixth = !!(q.answerFrames && q.answerFrames.sixth);
  const pool = q.optionFrames || (q.options || []).map((o) => o.frame).filter(Boolean);
  const ans = q.answerFrames || {};

  const slots = document.createElement('div');
  slots.className = 'dual-slots';

  function slot(label, frame, mark) {
    const d = document.createElement('div');
    let cls = 'dual-slot' + (frame ? ' filled' : '');
    if (mark === 'ok') cls += ' ok';
    if (mark === 'bad') cls += ' bad';
    d.className = cls;
    const lab = document.createElement('div');
    lab.className = 'fs-label';
    lab.textContent = label;
    d.appendChild(lab);
    if (frame) d.appendChild(renderMatrix(frame, 96));
    else {
      const ph = document.createElement('div');
      ph.style.cssText = 'width:96px;height:96px;display:grid;place-items:center;color:#888';
      ph.textContent = '?';
      d.appendChild(ph);
    }
    return d;
  }

  const fifthMark =
    showResult && fifth ? (framesEqual(fifth, ans.fifth) ? 'ok' : 'bad') : null;
  const sixthMark =
    showResult && hasSixth && sixth
      ? framesEqual(sixth, ans.sixth)
        ? 'ok'
        : 'bad'
      : null;

  slots.appendChild(slot('5th matrix', fifth, fifthMark));
  if (hasSixth) slots.appendChild(slot('6th matrix', sixth, sixthMark));
  container.appendChild(slots);

  const hint = document.createElement('p');
  hint.className = 'note';
  hint.textContent = showResult
    ? 'Green = correct answer. Red = your wrong pick.'
    : hasSixth
      ? 'Click a frame below to fill the next empty slot (5th then 6th).'
      : 'Click a frame below for the 5th matrix.';
  container.appendChild(hint);

  const poolEl = document.createElement('div');
  poolEl.className = 'frame-pool';
  pool.forEach((frame, idx) => {
    const box = document.createElement('div');
    box.className = 'fs-matrix';
    const isFifthAns = !!(ans.fifth && framesEqual(frame, ans.fifth));
    const isSixthAns = !!(ans.sixth && framesEqual(frame, ans.sixth));
    const isPickedFifth = !!(fifth && framesEqual(fifth, frame));
    const isPickedSixth = !!(sixth && framesEqual(sixth, frame));
    if (isPickedFifth || isPickedSixth) box.classList.add('picked');

    let tag = String.fromCharCode(65 + idx);
    if (showResult) {
      if (isFifthAns) {
        box.classList.add('ok');
        tag = hasSixth ? 'Correct 5th' : 'Correct';
      } else if (isSixthAns) {
        box.classList.add('ok');
        tag = 'Correct 6th';
      } else if (
        (isPickedFifth && !isFifthAns) ||
        (isPickedSixth && !isSixthAns)
      ) {
        box.classList.add('bad');
        tag = 'Your pick';
      }
    }
    box.appendChild(renderMatrix(frame, 88));
    const lab = document.createElement('div');
    lab.className = 'fs-label';
    lab.textContent = tag;
    box.appendChild(lab);
    if (!disabled) {
      box.addEventListener('click', () => {
        if (!fifth) onChange({ fifth: frame, sixth });
        else if (hasSixth && !sixth) onChange({ fifth, sixth: frame });
        else onChange({ fifth: frame, sixth: hasSixth ? null : undefined });
      });
    }
    poolEl.appendChild(box);
  });
  container.appendChild(poolEl);

  if (!disabled) {
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.textContent = 'Clear slots';
    clear.addEventListener('click', () => onChange({ fifth: null, sixth: hasSixth ? null : undefined }));
    container.appendChild(clear);
  }
}

export function gradeMeAnswer(q, raw) {
  if (q.entryMode === 'numeric' || q.answerValue != null) {
    const n = Number(raw);
    return n === Number(q.answerValue);
  }
  return raw === q.answer;
}

export function gradeFsAnswer(q, ans) {
  if (q.answerFrames && q.answerFrames.fifth) {
    const fifthOk = ans?.fifth && framesEqual(ans.fifth, q.answerFrames.fifth);
    if (!q.answerFrames.sixth) return !!fifthOk;
    const sixthOk = ans?.sixth && framesEqual(ans.sixth, q.answerFrames.sixth);
    return !!(fifthOk && sixthOk);
  }
  return ans === q.answer;
}

export function gradeLsAnswer(q, raw) {
  return String(raw || '').toLowerCase() === String(q.answer).toLowerCase();
}

export { framesEqual };
