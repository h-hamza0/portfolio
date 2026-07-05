import { Link } from 'react-router-dom';
import './Card.css';

export function HighlightCard({ item }) {
  return (
    <article className="hcard">
      <div className="hcard__meta">
        <span className="eyebrow">{item.status}</span>
        <span className="mono hcard__year">{item.year}</span>
      </div>
      <h3 className="hcard__title">{item.title}</h3>
      <p className="hcard__abstract">{item.abstract}</p>
      <div className="hcard__tags">
        {item.tags.map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
      {item.link && (
        <a className="hcard__link mono" href={item.link} target="_blank" rel="noreferrer">
          {item.linkLabel || 'read more →'}
        </a>
      )}
    </article>
  );
}

export function ArticleCard({ article }) {
  return (
    <Link to={`/writing/${article.slug}`} className="acard">
      <div className="acard__meta mono">
        <span>{article.date}</span>
        <span>·</span>
        <span>{article.readTime}</span>
      </div>
      <h3 className="acard__title">{article.title}</h3>
      <p className="acard__dek">{article.dek}</p>
      <div className="acard__tags">
        {article.tags.map((t) => (
          <span key={t} className="tag tag--ghost">{t}</span>
        ))}
      </div>
    </Link>
  );
}
