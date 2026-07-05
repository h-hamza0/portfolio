import { useState, useMemo } from 'react';
import { molecules } from './moleculeData';

const CATEGORY_COLORS = {
  'bile acid': '#c46a4d',
  excipient: '#5b8a72',
  API: '#4a6fa5',
  lipid: '#9a7bb0',
  'amino acid': '#c9a13b',
};

const W = 620;
const H = 420;
const PAD = 40;

function project(x, y) {
  // x,y are in [-1, 1] -> map to SVG canvas
  const px = PAD + ((x + 1) / 2) * (W - 2 * PAD);
  const py = PAD + ((1 - y) / 2) * (H - 2 * PAD); // flip y for screen coords
  return [px, py];
}

export default function MoleculeExplorer() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [activeCategories, setActiveCategories] = useState(
    () => new Set(Object.keys(CATEGORY_COLORS))
  );

  const active = hovered || selected;

  const mwRange = useMemo(() => {
    const mws = molecules.map((m) => m.mw);
    return [Math.min(...mws), Math.max(...mws)];
  }, []);

  function radiusFor(mw) {
    const [lo, hi] = mwRange;
    const t = (mw - lo) / (hi - lo || 1);
    return 5 + t * 9; // 5px to 14px
  }

  function toggleCategory(cat) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <div
      style={{
        fontFamily: 'var(--f-sans)',
        color: 'var(--ink)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '28px',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ flex: '1 1 480px', minWidth: '320px' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ background: 'var(--bg-panel, #faf8f5)', borderRadius: '10px', border: '1px solid var(--line, #e4ddd3)' }}
        >
          {/* axes */}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--line, #ccc)" strokeWidth="1" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--line, #ccc)" strokeWidth="1" />
          <text x={W / 2} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--ink-soft)">
            PC1 (fingerprint variance)
          </text>
          <text
            x={14}
            y={H / 2}
            textAnchor="middle"
            fontSize="11"
            fill="var(--ink-soft)"
            transform={`rotate(-90, 14, ${H / 2})`}
          >
            PC2
          </text>

          {molecules
            .filter((m) => activeCategories.has(m.category))
            .map((m) => {
              const [px, py] = project(m.x, m.y);
              const isActive = active && active.name === m.name;
              return (
                <g key={m.name}>
                  <circle
                    cx={px}
                    cy={py}
                    r={radiusFor(m.mw)}
                    fill={CATEGORY_COLORS[m.category]}
                    opacity={isActive ? 1 : 0.72}
                    stroke={isActive ? 'var(--ink)' : 'transparent'}
                    strokeWidth={isActive ? 2 : 0}
                    style={{ cursor: 'pointer', transition: 'opacity 120ms, r 120ms' }}
                    onMouseEnter={() => setHovered(m)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelected(m)}
                  />
                </g>
              );
            })}
        </svg>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
            const on = activeCategories.has(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontFamily: 'var(--f-sans)',
                  color: on ? 'var(--ink)' : 'var(--ink-soft)',
                  background: 'none',
                  border: '1px solid var(--line, #ddd)',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  opacity: on ? 1 : 0.5,
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: color,
                    display: 'inline-block',
                  }}
                />
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          flex: '1 1 220px',
          minWidth: '220px',
          minHeight: '320px',
          border: '1px solid var(--line, #e4ddd3)',
          borderRadius: '10px',
          padding: '16px',
          background: 'var(--bg-panel, #faf8f5)',
        }}
      >
        {active ? (
          <div>
            <div
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              dangerouslySetInnerHTML={{ __html: active.svg }}
            />
            <h3 style={{ fontSize: '1rem', margin: '10px 0 2px' }}>{active.name}</h3>
            <p style={{ fontSize: '11px', color: 'var(--ink-soft)', wordBreak: 'break-all', marginBottom: '10px' }}>
              {active.smiles}
            </p>
            <table style={{ fontSize: '12px', width: '100%', color: 'var(--ink-soft)' }}>
              <tbody>
                <tr>
                  <td>Category</td>
                  <td style={{ textAlign: 'right', color: 'var(--ink)' }}>{active.category}</td>
                </tr>
                <tr>
                  <td>MW</td>
                  <td style={{ textAlign: 'right', color: 'var(--ink)' }}>{active.mw} g/mol</td>
                </tr>
                <tr>
                  <td>LogP</td>
                  <td style={{ textAlign: 'right', color: 'var(--ink)' }}>{active.logp}</td>
                </tr>
                <tr>
                  <td>TPSA</td>
                  <td style={{ textAlign: 'right', color: 'var(--ink)' }}>{active.tpsa} Å²</td>
                </tr>
                <tr>
                  <td>H-bond donors / acceptors</td>
                  <td style={{ textAlign: 'right', color: 'var(--ink)' }}>
                    {active.hbd} / {active.hba}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
            Hover or click a point to inspect its structure and descriptors.
          </p>
        )}
      </div>
    </div>
  );
}