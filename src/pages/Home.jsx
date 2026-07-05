import { Link } from 'react-router-dom';
import SurrogateField from '../components/SurrogateField';
import highlights from '../data/highlights';
import articles from '../data/articles';
import { HighlightCard, ArticleCard } from '../components/Card';
import MoleculeExplorer from '../components/MoleculeExplorer';

export default function Home() {
  return (
    <div>
      <section className="l-page" style={{ paddingTop: '56px' }}>
        {/* <p className="eyebrow" style={{ marginBottom: '14px' }}>Computational pharmaceutical sciences</p> */}
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', maxWidth: '820px' }}>
          Computational Chemistry
        </h1>
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: '1.15rem', color: 'var(--ink-soft)', maxWidth: '640px', marginTop: '10px' }}>
          My work utilizes molecular dynamics simulation and machine learning to advance pharmaceutical development.
        </p>

        <div style={{ marginTop: '36px' }}>
          <MoleculeExplorer />
          <p className="mono" style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: '10px' }}>
            Each point is a real molecule, positioned by PCA over its 512-bit Morgan fingerprint (radius = 2).
            Point size scales with molecular weight. Hover or click to inspect a structure.
          </p>
        </div>
      </section>

      <section className="l-page" style={{ marginTop: '72px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Research highlights</h2>
          <Link to="/highlights" className="mono" style={{ fontSize: '0.85rem', textDecoration: 'none' }}>
            all highlights →
          </Link>
        </div>
        <div>
          {highlights.slice(0, 3).map((h) => (
            <HighlightCard key={h.id} item={h} />
          ))}
        </div>
      </section>

      <section className="l-page" style={{ marginTop: '56px', marginBottom: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Recent writing</h2>
          <Link to="/writing" className="mono" style={{ fontSize: '0.85rem', textDecoration: 'none' }}>
            all writing →
          </Link>
        </div>
        <div>
          {articles.slice(0, 3).map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
