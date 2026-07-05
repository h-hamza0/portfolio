import { useEffect, useRef, useState } from 'react';
import './SurrogateField.css';

// A handful of fixed "observed experiments" in [0,1]x[0,1] with a yield value.
// Purely illustrative — evokes a spray-drying process response surface / BO surrogate,
// not a real dataset.
const ANCHORS = [
  { x: 0.18, y: 0.24, v: 0.32 },
  { x: 0.62, y: 0.15, v: 0.71 },
  { x: 0.83, y: 0.52, v: 0.44 },
  { x: 0.35, y: 0.68, v: 0.86 },
  { x: 0.7, y: 0.78, v: 0.28 },
  { x: 0.1, y: 0.85, v: 0.5 },
];

function rbf(d, ls = 0.28) {
  return Math.exp(-(d * d) / (2 * ls * ls));
}

// simple Nadaraya–Watson style kernel mean + a distance-based "uncertainty" proxy
function predict(x, y) {
  let wsum = 0, vsum = 0, mind = Infinity;
  for (const a of ANCHORS) {
    const d = Math.hypot(x - a.x, y - a.y);
    mind = Math.min(mind, d);
    const w = rbf(d);
    wsum += w;
    vsum += w * a.v;
  }
  const mean = wsum > 1e-6 ? vsum / wsum : 0.5;
  const uncertainty = Math.min(1, mind * 1.6);
  return { mean, uncertainty };
}

export default function SurrogateField() {
  const canvasRef = useRef(null);
  const [probe, setProbe] = useState(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function draw() {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      const step = 6;
      for (let py = 0; py < h; py += step) {
        for (let px = 0; px < w; px += step) {
          const x = px / w, y = py / h;
          const { mean, uncertainty } = predict(x, y);
          // teal -> amber across the mean, faded by uncertainty
          const t = mean;
          const r = Math.round(43 + t * (184 - 43));
          const g = Math.round(110 + t * (134 - 110));
          const b = Math.round(119 + t * (46 - 119));
          const alpha = 0.85 - uncertainty * 0.55;
          ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0.06, alpha)})`;
          ctx.fillRect(px, py, step, step);
        }
      }

      // anchors
      ctx.font = '10px monospace';
      for (const a of ANCHORS) {
        const px = a.x * w, py = a.y * h;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#16181b';
        ctx.fill();
      }
    }

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMove(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    const { mean, uncertainty } = predict(x, y);
    setProbe({ x, y, mean, uncertainty, px: e.clientX - rect.left, py: e.clientY - rect.top });
  }

  return (
    <div className="surrogate-field" onMouseMove={handleMove} onMouseLeave={() => setProbe(null)}>
      <canvas ref={canvasRef} />
      {probe && (
        <div
          className="surrogate-field__probe"
          style={{ left: probe.px, top: probe.py }}
        />
      )}
      <div className="surrogate-field__readout mono">
        {probe ? (
          <>
            μ&nbsp;={probe.mean.toFixed(2)}&nbsp;&nbsp;σ&nbsp;≈{probe.uncertainty.toFixed(2)}
          </>
        ) : (
          <>hover to query the surrogate</>
        )}
      </div>
    </div>
  );
}
