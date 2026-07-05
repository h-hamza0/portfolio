import articles from '../data/articles';
import { ArticleCard } from '../components/Card';

export default function Writing() {
  return (
    <div className="l-page" style={{ paddingTop: '56px', paddingBottom: '80px' }}>
      <p className="eyebrow">Writing</p>
      <h1 style={{ fontSize: '2.4rem', marginBottom: '10px' }}>Notes on deep learning</h1>
      <p style={{ fontFamily: 'var(--f-sans)', color: 'var(--ink-soft)', maxWidth: '700px' }}>
        Long-form notes on deep learning topics relevant to drug discovery and chemistry
      </p>
      <div style={{ marginTop: '32px' }}>
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}
