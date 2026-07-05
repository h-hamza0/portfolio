import './Figure.css';

export default function Figure({ src, alt, caption, wide = false }) {
  return (
    <figure className={'figure' + (wide ? ' figure--wide' : '')}>
      {src ? (
        <img src={src} alt={alt || ''} loading="lazy" />
      ) : (
        <div className="figure__placeholder">
          <span className="mono">figure placeholder</span>
        </div>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
