import { useParams, Link } from 'react-router-dom';
import articles from '../data/articles';
import WassersteinGANs from './articles/WassersteinGANs';
import DraftArticle from './articles/DraftArticle';

const fullArticles = {
  'wasserstein-gans': WassersteinGANs,
};

export default function ArticlePage() {
  const { slug } = useParams();
  const meta = articles.find((a) => a.slug === slug);

  if (!meta) {
    return (
      <div className="l-body" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <h1>Not found</h1>
        <p><Link to="/writing">← back to writing</Link></p>
      </div>
    );
  }

  const FullComponent = fullArticles[slug];
  if (FullComponent) return <FullComponent />;
  return <DraftArticle meta={meta} />;
}
