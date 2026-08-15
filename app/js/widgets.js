import { renderMatrix, renderLatinGrid } from './renderers.js';

function framesEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** ME on-screen keypad 1–20 */
export function mountKeypad(container, { value, onChange, disabled }) {
  container.innerHTML = '';
  const display = document.createElement('div');
  display.className = 'keypad-display';
  display.textContent = value == null || value === '' ? '—' : String(value);
  container.appendChild(display);

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
export function mountLatinPicker(container, q, { value, onChange, disabled }) {
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
    }
  });
  container.appendChild(gridEl);

  const picker = document.createElement('div');
  picker.className = 'letter-picker';
  for (const L of ['A', 'B', 'C', 'D', 'E']) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = L;
    btn.disabled = !!disabled;
    if (value && value.toLowerCase() === L.toLowerCase()) btn.classList.add('primary');
    btn.addEventListener('click', () => onChange(L.toLowerCase()));
    picker.appendChild(btn);
  }
  container.appendChild(picker);
}

/** FS dual: pick 5th and optionally 6th from pool */
export function mountDualFs(container, q, { fifth, sixth, onChange, disabled }) {
  container.innerHTML = '';
  const hasSixth = !!(q.answerFrames && q.answerFrames.sixth);
  const pool = q.optionFrames || (q.options || []).map((o) => o.frame).filter(Boolean);

  const slots = document.createElement('div');
  slots.className = 'dual-slots';

  function slot(label, frame) {
    const d = document.createElement('div');
    d.className = 'dual-slot' + (frame ? ' filled' : '');
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

  slots.appendChild(slot('5th matrix', fifth));
  if (hasSixth) slots.appendChild(slot('6th matrix', sixth));
  container.appendChild(slots);

  const hint = document.createElement('p');
  hint.className = 'note';
  hint.textContent = hasSixth
    ? 'Click a frame below to fill the next empty slot (5th then 6th).'
    : 'Click a frame below for the 5th matrix.';
  container.appendChild(hint);

  const poolEl = document.createElement('div');
  poolEl.className = 'frame-pool';
  pool.forEach((frame, idx) => {
    const box = document.createElement('div');
    box.className = 'fs-matrix';
    if (
      (fifth && framesEqual(fifth, frame)) ||
      (sixth && framesEqual(sixth, frame))
    ) {
      box.classList.add('picked');
    }
    box.appendChild(renderMatrix(frame, 88));
    const lab = document.createElement('div');
    lab.className = 'fs-label';
    lab.textContent = String.fromCharCode(65 + idx);
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
