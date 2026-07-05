import highlights from '../data/highlights';
import { HighlightCard } from '../components/Card';

export default function Highlights() {
  return (
    <div className="l-page" style={{ paddingTop: '56px', paddingBottom: '80px' }}>
      <p className="eyebrow">Research</p>
      <h1 style={{ fontSize: '2.4rem', marginBottom: '10px' }}>Highlights</h1>
      <p style={{ fontFamily: 'var(--f-sans)', color: 'var(--ink-soft)', maxWidth: '640px' }}>
        Papers, tools, and other writings...
      </p>
      <div style={{ marginTop: '32px' }}>
        {highlights.map((h) => (
          <HighlightCard key={h.id} item={h} />
        ))}
      </div>
    </div>
  );
}
