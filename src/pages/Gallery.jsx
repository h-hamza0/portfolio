import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import gallery from '../data/gallery';
import Figure from '../components/Figure';

const OPEN_MS = 380;
const CLOSE_MS = 280;
const NAV_MS = 340;

export default function Gallery() {
  const [activeId, setActiveId] = useState(null);
  const [phase, setPhase] = useState('closed'); // 'opening' | 'open' | 'closing' | 'closed'
  const [mode, setMode] = useState('morph'); // 'morph' (open/close) | 'nav' (arrow browsing)
  const [navDir, setNavDir] = useState(0);
  const [originRect, setOriginRect] = useState(null);
  const tileRefs = useRef(new Map());

  const active = gallery.find((g) => g.id === activeId) || null;
  const activeIndex = active ? gallery.findIndex((g) => g.id === activeId) : -1;

  const openFromTile = useCallback((id, el) => {
    const rect = el.getBoundingClientRect();
    setOriginRect(rect);
    setMode('morph');
    setActiveId(id);
    setPhase('opening');
  }, []);

  const close = useCallback(() => {
    const el = tileRefs.current.get(activeId);
    if (el) setOriginRect(el.getBoundingClientRect());
    setMode('morph');
    setPhase('closing');
  }, [activeId]);

  const go = useCallback(
    (delta) => {
      if (activeIndex === -1) return;
      const next = (activeIndex + delta + gallery.length) % gallery.length;
      setMode('nav');
      setNavDir(delta);
      setActiveId(gallery[next].id);
      // phase stays 'open' — no backdrop/morph animation, just the image crossfades
    },
    [activeIndex]
  );

  // Drive the opening transition: mount at origin geometry, then flip to final on next frame.
  useLayoutEffect(() => {
    if (phase !== 'opening') return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase('open'));
    });
    return () => cancelAnimationFrame(id);
  }, [phase, activeId]);

  // After a close animation finishes, actually unmount.
  useEffect(() => {
    if (phase !== 'closing') return;
    const t = setTimeout(() => {
      setActiveId(null);
      setPhase('closed');
    }, CLOSE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 'closed') return;
    function onKey(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [phase, close, go]);

  // Prefetch the neighboring images as soon as one is open, so by the time
  // someone hits the arrow key the image is already in the browser cache
  // and there's no visible load delay for the crossfade to hide.
  useEffect(() => {
    if (phase === 'closed' || activeIndex === -1) return;
    const nextIdx = (activeIndex + 1) % gallery.length;
    const prevIdx = (activeIndex - 1 + gallery.length) % gallery.length;
    [nextIdx, prevIdx].forEach((idx) => {
      const img = new Image();
      img.src = gallery[idx].src;
    });
  }, [phase, activeIndex]);

  const showOverlay = phase !== 'closed';
  const morphing = mode === 'morph' && (phase === 'opening' || phase === 'closing');

  return (
    <div className="l-page" style={{ paddingTop: '56px', paddingBottom: '80px' }}>
      <p className="eyebrow">Gallery</p>
      <h1 style={{ fontSize: '2.4rem', marginBottom: '10px' }}>Scientific artwork</h1>
      <p style={{ fontFamily: 'var(--f-sans)', color: 'var(--ink-soft)', maxWidth: '640px' }}>
        Renders and figures made for talks, papers &mdash; made in Blender.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '28px',
          marginTop: '40px',
        }}
      >
        {gallery.map((g) => (
          <button
            key={g.id}
            ref={(el) => {
              if (el) tileRefs.current.set(g.id, el);
              else tileRefs.current.delete(g.id);
            }}
            onClick={(e) => openFromTile(g.id, e.currentTarget)}
            aria-label={`Expand ${g.title}`}
            className="gallery-tile"
            style={{
              position: 'relative',
              display: 'block',
              width: '100%',
              padding: 0,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderRadius: '4px',
              overflow: 'hidden',
              aspectRatio: '4 / 3',
              visibility: g.id === activeId && morphing ? 'hidden' : 'visible',
            }}
          >
            <div className="gallery-tile-media">
              <Figure src={g.src} alt={g.title} />
            </div>
            <div className="gallery-tile-overlay">
              <span className="gallery-tile-label">{g.title}</span>
            </div>
          </button>
        ))}
      </div>

      {showOverlay && active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 18, 16, 0.92)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            opacity: phase === 'open' ? 1 : 0,
            transition: `opacity ${phase === 'closing' ? CLOSE_MS : OPEN_MS}ms ease`,
          }}
        >
          <button
            onClick={close}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '1.6rem',
              lineHeight: 1,
              cursor: 'pointer',
              opacity: phase === 'open' ? 0.7 : 0,
              transition: 'opacity 200ms ease',
            }}
          >
            &times;
          </button>

          {gallery.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label="Previous"
                style={navArrowStyle('left', phase === 'open')}
              >
                &#8249;
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label="Next"
                style={navArrowStyle('right', phase === 'open')}
              >
                &#8250;
              </button>
            </>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '32px',
              maxWidth: '1100px',
              width: '100%',
              maxHeight: '90vh',
            }}
          >
            <LightboxStage
              src={active.src}
              alt={active.title}
              mode={mode}
              phase={phase}
              originRect={originRect}
              navDir={navDir}
            />

            <div
              key={`panel-${activeId}`}
              className="gallery-panel"
              style={{ flex: '1 1 280px', maxWidth: '360px', color: '#fff' }}
            >
              <h2 style={{ fontSize: '1.3rem', margin: '0 0 6px' , color: '#fff'}}>{active.title}</h2>
              <p className="mono" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 18px' }}>
                {active.medium} &middot; {active.year}
              </p>

              {active.note && (
                <p
                  style={{
                    fontFamily: 'var(--f-sans)',
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.6,
                    margin: '0 0 18px',
                  }}
                >
                  {active.note}
                </p>
              )}

              {active.publication ? (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '14px', marginTop: '4px' }}>
                  <p className="mono" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>
                    Associated publication
                  </p>
                  {active.publication.url ? (
                    <a
                      href={active.publication.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#fff', fontSize: '0.92rem', textDecoration: 'underline' }}
                    >
                      {active.publication.title}
                    </a>
                  ) : (
                    <span style={{ color: '#fff', fontSize: '0.92rem' }}>{active.publication.title}</span>
                  )}
                  {active.authors && (
                    <p
                      style={{
                        fontFamily: 'var(--f-sans)',
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.6)',
                        margin: '6px 0 0',
                      }}
                    >
                      {active.authors}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '14px', marginTop: '4px' }}>
                  <span className="mono" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                    Made for fun &mdash; no associated publication
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Force whatever Figure renders internally to fill and cover the tile,
           regardless of Figure's own markup/props. */
        .gallery-tile-media {
          position: absolute;
          inset: 0;
          overflow: hidden;
          transform: scale(1);
          transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1), filter 600ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
          backface-visibility: hidden;
        }
        .gallery-tile-media,
        .gallery-tile-media > *,
        .gallery-tile-media img {
          width: 100%;
          height: 100%;
        }
        .gallery-tile-media img {
          object-fit: cover;
          object-position: center;
          display: block;
        }
        .gallery-tile-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          padding: 16px;
          background: linear-gradient(to top, rgba(0,0,0,0.55), transparent 55%);
          opacity: 0;
          transition: opacity 400ms ease;
          pointer-events: none;
        }
        .gallery-tile-label {
          font-family: var(--f-sans);
          color: #fff;
          font-size: 0.95rem;
          text-align: left;
          transform: translateY(6px);
          opacity: 0;
          transition: transform 450ms cubic-bezier(0.22, 1, 0.36, 1), opacity 450ms ease;
        }
        .gallery-tile:hover .gallery-tile-media,
        .gallery-tile:focus-visible .gallery-tile-media {
          transform: scale(1.045);
          filter: brightness(0.94);
        }
        .gallery-tile:hover .gallery-tile-overlay,
        .gallery-tile:focus-visible .gallery-tile-overlay {
          opacity: 1;
        }
        .gallery-tile:hover .gallery-tile-label,
        .gallery-tile:focus-visible .gallery-tile-label {
          opacity: 1;
          transform: translateY(0);
        }
        .gallery-panel {
          animation: gallery-panel-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes gallery-panel-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .gallery-tile-media,
          .gallery-tile-overlay,
          .gallery-tile-label,
          .gallery-panel {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Handles the two ways the lightbox image changes:
//  - 'morph': opening from / closing back to the clicked thumbnail's exact
//    position and size (a single element animating transform, no crossfade).
//  - 'nav': browsing between images with the arrow keys/buttons, which
//    crossfades + slightly slides the incoming image over the outgoing one.
function LightboxStage({ src, alt, mode, phase, originRect, navDir }) {
  const wrapRef = useRef(null);
  const [morphStyle, setMorphStyle] = useState({ opacity: 0 });

  useLayoutEffect(() => {
    if (mode !== 'morph') return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    if (phase === 'opening' && originRect) {
      const finalRect = wrap.getBoundingClientRect();
      const dx = originRect.left + originRect.width / 2 - (finalRect.left + finalRect.width / 2);
      const dy = originRect.top + originRect.height / 2 - (finalRect.top + finalRect.height / 2);
      const sx = originRect.width / finalRect.width;
      const sy = originRect.height / finalRect.height;
      setMorphStyle({
        transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        opacity: 1,
        transition: 'none',
      });
    } else if (phase === 'open') {
      requestAnimationFrame(() => {
        setMorphStyle({
          transform: 'translate(0, 0) scale(1, 1)',
          opacity: 1,
          transition: `transform ${OPEN_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        });
      });
    } else if (phase === 'closing' && originRect) {
      const finalRect = wrap.getBoundingClientRect();
      const dx = originRect.left + originRect.width / 2 - (finalRect.left + finalRect.width / 2);
      const dy = originRect.top + originRect.height / 2 - (finalRect.top + finalRect.height / 2);
      const sx = originRect.width / finalRect.width;
      const sy = originRect.height / finalRect.height;
      setMorphStyle({
        transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        opacity: 1,
        transition: `transform ${CLOSE_MS}ms cubic-bezier(0.4, 0, 0.6, 1)`,
      });
    }
  }, [mode, phase, originRect]);

  return (
    <div style={{ flex: '1 1 560px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div ref={wrapRef} style={{ ...morphStyle, transformOrigin: 'center center' }}>
        <Crossfade src={src} alt={alt} navDir={navDir} enabled={mode === 'nav'} />
      </div>
    </div>
  );
}

// Keeps the outgoing image mounted underneath while the incoming one fades
// and slides in on top, then drops the outgoing layer once settled.
// Fixed-size stage so images of different intrinsic dimensions all center
// in exactly the same box — nothing shifts or peeks around the edges when
// the aspect ratio changes between images.
const STAGE_STYLE = {
  position: 'relative',
  width: 'min(680px, 86vw)',
  height: 'min(78vh, 620px)',
};

const STAGE_IMG_STYLE = {
  position: 'absolute',
  inset: 0,
  margin: 'auto',
  maxWidth: '100%',
  maxHeight: '100%',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain',
  borderRadius: '2px',
  display: 'block',
};

function Crossfade({ src, alt, navDir, enabled }) {
  const [current, setCurrent] = useState(src);
  const [incoming, setIncoming] = useState(null);
  const [entering, setEntering] = useState(false);
  const [loading, setLoading] = useState(false);

  // Preload the incoming image and only start animating once it has
  // actually finished loading. While it's still loading (e.g. it wasn't
  // caught by the neighbor-prefetch), dim the old image and show a
  // spinner so the wait reads as "loading" rather than a frozen image.
  useEffect(() => {
    if (src === current) return;
    if (!enabled) {
      setCurrent(src);
      setIncoming(null);
      setEntering(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setIncoming(src);
    setEntering(false);
    setLoading(true);

    const loader = new Image();
    loader.src = src;

    const startEntering = () => {
      if (cancelled) return;
      setLoading(false);
      requestAnimationFrame(() => {
        if (!cancelled) requestAnimationFrame(() => setEntering(true));
      });
    };

    if (loader.complete) startEntering();
    else loader.onload = startEntering;

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, enabled]);

  // Once the enter transition has actually started, schedule the final
  // swap (drop the old layer) to match the transition duration.
  useEffect(() => {
    if (!entering) return;
    const t = setTimeout(() => {
      setCurrent(src);
      setIncoming(null);
      setEntering(false);
    }, NAV_MS);
    return () => clearTimeout(t);
  }, [entering, src]);

  return (
    <div style={STAGE_STYLE}>
      <img
        src={current}
        alt={alt}
        style={{
          ...STAGE_IMG_STYLE,
          opacity: loading ? 0.35 : 1,
          filter: loading ? 'blur(1px)' : 'none',
          transition: 'opacity 200ms ease, filter 200ms ease',
        }}
      />
      {loading && (
        <div style={SPINNER_WRAP_STYLE}>
          <div style={SPINNER_STYLE} />
        </div>
      )}
      {incoming && (
        <img
          src={incoming}
          alt={alt}
          style={{
            ...STAGE_IMG_STYLE,
            opacity: entering ? 1 : 0,
            transform: entering ? 'translateX(0)' : `translateX(${navDir * 32}px)`,
            transition: `opacity ${NAV_MS}ms ease, transform ${NAV_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        />
      )}
      <style>{`
        @keyframes gallery-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const SPINNER_WRAP_STYLE = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
};

const SPINNER_STYLE = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  border: '2px solid rgba(255,255,255,0.25)',
  borderTopColor: 'rgba(255,255,255,0.9)',
  animation: 'gallery-spin 700ms linear infinite',
};

function navArrowStyle(side, visible) {
  return {
    position: 'absolute',
    [side]: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '2.4rem',
    lineHeight: 1,
    cursor: 'pointer',
    opacity: visible ? 0.6 : 0,
    transition: 'opacity 250ms ease',
    padding: '8px',
  };
}