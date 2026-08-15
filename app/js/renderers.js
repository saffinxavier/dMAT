const COLOURS = {
  blue: '#2f6fed',
  green: '#1d9a5a',
  red: '#d64545',
  yellow: '#e0b12d',
  orange: '#e07a2f',
  navy: '#243b6b',
  teal: '#1a8f8a',
  purple: '#7a4bb8',
  gray: '#7a756c',
};

function drawFigure(svgNS, fig, cell, pad) {
  const x = pad + fig.c * cell + cell / 2;
  const y = pad + fig.r * cell + cell / 2;
  const size = cell * 0.32;
  const colour = COLOURS[fig.colour] || '#333';
  const g = document.createElementNS(svgNS, 'g');
  g.setAttribute('transform', `translate(${x} ${y}) rotate(${fig.rot || 0})`);

  let el;
  if (fig.shape === 'circle') {
    el = document.createElementNS(svgNS, 'circle');
    el.setAttribute('r', size);
  } else if (fig.shape === 'triangle') {
    el = document.createElementNS(svgNS, 'polygon');
    const s = size * 1.2;
    el.setAttribute('points', `0,${-s} ${s * 0.9},${s * 0.7} ${-s * 0.9},${s * 0.7}`);
  } else {
    el = document.createElementNS(svgNS, 'rect');
    el.setAttribute('x', -size);
    el.setAttribute('y', -size);
    el.setAttribute('width', size * 2);
    el.setAttribute('height', size * 2);
    el.setAttribute('rx', 3);
  }
  el.setAttribute('fill', colour);
  g.appendChild(el);
  return g;
}

function matrixColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    cell: styles.getPropertyValue('--matrix-cell').trim() || '#1a1f2c',
    stroke: styles.getPropertyValue('--matrix-stroke').trim() || '#3a4258',
  };
}

export function renderMatrix(frame, size = 108) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  const pad = 6;
  const cell = (size - pad * 2) / 3;
  const { cell: fill, stroke } = matrixColors();

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', pad + c * cell);
      rect.setAttribute('y', pad + r * cell);
      rect.setAttribute('width', cell);
      rect.setAttribute('height', cell);
      rect.setAttribute('fill', fill);
      rect.setAttribute('stroke', stroke);
      svg.appendChild(rect);
    }
  }

  for (const fig of frame.figures || []) {
    svg.appendChild(drawFigure(svgNS, fig, cell, pad));
  }
  return svg;
}

export function renderLatinGrid(grid) {
  const wrap = document.createElement('div');
  wrap.className = 'latin-grid';
  for (const row of grid) {
    for (const cell of row) {
      const d = document.createElement('div');
      d.className = 'latin-cell';
      if (cell === '?') {
        d.classList.add('q');
        d.textContent = '?';
      } else if (!cell) {
        d.classList.add('empty');
        d.textContent = '·';
      } else {
        d.textContent = cell;
      }
      wrap.appendChild(d);
    }
  }
  return wrap;
}

export function renderQuestionStem(q, { hideFsQuestionMark = false } = {}) {
  const frag = document.createDocumentFragment();

  if (q.type === 'gam' && q.scenario) {
    const sc = document.createElement('div');
    sc.className = 'scenario';
    sc.textContent = (q.scenarioTitle ? q.scenarioTitle + '\n\n' : '') + q.scenario;
    frag.appendChild(sc);
  }

  if (q.type === 'me' && q.equations) {
    const eq = document.createElement('pre');
    eq.className = 'equations';
    eq.textContent = q.equations;
    frag.appendChild(eq);
  }

  if (q.type === 'ls' && q.grid && !q._widgetLs) {
    frag.appendChild(renderLatinGrid(q.grid));
  }

  if (q.type === 'fs' && q.series) {
    const row = document.createElement('div');
    row.className = 'fs-row';
    q.series.forEach((frame, i) => {
      const box = document.createElement('div');
      box.className = 'fs-matrix';
      box.appendChild(renderMatrix(frame));
      const lab = document.createElement('div');
      lab.className = 'fs-label';
      lab.textContent = String(i + 1);
      box.appendChild(lab);
      row.appendChild(box);
      if (i < q.series.length - 1) {
        const arrow = document.createElement('span');
        arrow.textContent = '→';
        arrow.style.color = 'var(--muted)';
        row.appendChild(arrow);
      }
    });
    if (!hideFsQuestionMark) {
      const qbox = document.createElement('div');
      qbox.className = 'fs-matrix';
      qbox.innerHTML =
        '<div style="width:108px;height:108px;display:grid;place-items:center;font-size:1.6rem;color:var(--muted)">?</div><div class="fs-label">5+</div>';
      row.appendChild(document.createTextNode(' → '));
      row.appendChild(qbox);
    }
    frag.appendChild(row);
  }

  return frag;
}

export function renderOptionContent(q, opt) {
  if (q.type === 'fs' && opt.frame) {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.gap = '0.6rem';
    wrap.style.alignItems = 'center';
    const letter = document.createElement('strong');
    letter.textContent = opt.id.toUpperCase() + '.';
    wrap.appendChild(letter);
    const box = document.createElement('div');
    box.className = 'fs-matrix';
    box.appendChild(renderMatrix(opt.frame, 96));
    wrap.appendChild(box);
    return wrap;
  }
  const span = document.createElement('span');
  span.textContent = `${opt.id.toUpperCase()}. ${opt.text}`;
  return span;
}
