const STORE_KEY = 'dmat-prep-progress-v1';
const THEME_KEY = 'dmat-theme';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyProgress();
    return { ...emptyProgress(), ...JSON.parse(raw) };
  } catch {
    return emptyProgress();
  }
}

export function emptyProgress() {
  return {
    attempts: {},
    flags: {},
    lastScores: [],
  };
}

export function saveProgress(p) {
  localStorage.setItem(STORE_KEY, JSON.stringify(p));
}

export function recordAttempt(p, id, answer, correct, type) {
  p.attempts[id] = { answer, correct, at: Date.now(), type: type || null };
  saveProgress(p);
}

export function toggleFlag(p, id) {
  if (p.flags[id]) delete p.flags[id];
  else p.flags[id] = true;
  saveProgress(p);
  return !!p.flags[id];
}

export function clearProgress() {
  localStorage.removeItem(STORE_KEY);
  return emptyProgress();
}

export function summarize(p) {
  const attempts = Object.values(p.attempts);
  const attempted = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;
  const flagged = Object.keys(p.flags).length;
  const accuracy = attempted ? Math.round((100 * correct) / attempted) : 0;
  return { attempted, correct, flagged, accuracy };
}

export function summarizeByType(p, bank = []) {
  const byId = Object.fromEntries(bank.map((q) => [q.id, q]));
  const types = ['fs', 'me', 'ls', 'gam'];
  const out = {};
  for (const t of types) {
    out[t] = { attempted: 0, correct: 0, flagged: 0, accuracy: 0 };
  }
  for (const [id, att] of Object.entries(p.attempts)) {
    const t = att.type || byId[id]?.type;
    if (!t || !out[t]) continue;
    out[t].attempted += 1;
    if (att.correct) out[t].correct += 1;
  }
  for (const id of Object.keys(p.flags)) {
    const t = p.attempts[id]?.type || byId[id]?.type;
    if (t && out[t]) out[t].flagged += 1;
  }
  for (const t of types) {
    const s = out[t];
    s.accuracy = s.attempted ? Math.round((100 * s.correct) / s.attempted) : 0;
  }
  return out;
}

export function getTheme() {
  const t = localStorage.getItem(THEME_KEY);
  return t === 'light' ? 'light' : 'dark';
}

export function setTheme(theme) {
  const v = theme === 'light' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, v);
  document.documentElement.setAttribute('data-theme', v);
  return v;
}

export function applyStoredTheme() {
  return setTheme(getTheme());
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Unseen → wrong/flagged → correct; shuffle within each tier. */
export function pickByProgress(pool, progress, limit) {
  const p = progress || emptyProgress();
  const attempts = p.attempts || {};
  const flags = p.flags || {};
  const n = Math.max(0, Math.min(limit, pool.length));
  if (n === 0) return [];

  const unseen = [];
  const recycle = [];
  const correct = [];
  for (const q of pool) {
    const att = attempts[q.id];
    if (!att) unseen.push(q);
    else if (!att.correct || flags[q.id]) recycle.push(q);
    else correct.push(q);
  }

  const out = [];
  const take = (tier) => {
    for (const q of shuffle(tier)) {
      if (out.length >= n) break;
      out.push(q);
    }
  };
  take(unseen);
  take(recycle);
  take(correct);
  return out;
}

