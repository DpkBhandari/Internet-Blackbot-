function tokenize(s) { return (s || '').toLowerCase().match(/[a-z0-9]+/g) || []; }
function tf(tokens) { const m = new Map(); for (const t of tokens) m.set(t, (m.get(t) || 0) + 1); return m; }
function cosine(a, b) {
  const ma = tf(tokenize(a)); const mb = tf(tokenize(b));
  const keys = new Set([...ma.keys(), ...mb.keys()]);
  let dot = 0, na = 0, nb = 0;
  for (const k of keys) { const x = ma.get(k) || 0, y = mb.get(k) || 0; dot += x*y; na += x*x; nb += y*y; }
  if (!na || !nb) return 0;
  return dot / Math.sqrt(na * nb);
}
module.exports = { cosine };
