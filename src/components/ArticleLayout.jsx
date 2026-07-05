import './ArticleLayout.css';

export default function ArticleLayout({ title, dek, date, readTime, tags, children }) {
  return (
    <article className="article">
      <header className="article__hero l-body">
        <div className="article__tags">
          {tags?.map((t) => (
            <span key={t} className="tag tag--ghost">{t}</span>
          ))}
        </div>
        <h1 className="article__title">{title}</h1>
        {dek && <p className="article__dek">{dek}</p>}
        <div className="article__byline mono">
          <span>Hamza Habib</span>
          {date && <><span> · </span><span>{date}</span></>}
          {readTime && <><span> · </span><span>{readTime}</span></>}
        </div>
      </header>
      <hr className="l-body" />
      <div className="article__body l-body">{children}</div>
    </article>
  );
}
