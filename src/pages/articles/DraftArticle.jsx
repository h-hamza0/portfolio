import ArticleLayout from '../../components/ArticleLayout';

export default function DraftArticle({ meta }) {
  return (
    <ArticleLayout
      title={meta.title}
      dek={meta.dek}
      tags={meta.tags}
    >
      <div
        style={{
          padding: '28px 24px',
          background: 'var(--paper-alt)',
          border: '1px solid var(--rule)',
          borderRadius: '4px',
          fontFamily: 'var(--f-sans)',
          color: 'var(--ink-soft)',
        }}
      >
        <p className="eyebrow" style={{ marginBottom: '10px' }}>Draft in progress</p>
        <p style={{ margin: 0 }}>
          This piece is still being written. It'll follow the same treatment as{' '}
          <a href="/writing/wasserstein-gans">the WGAN article</a>: worked-through math, sidenotes for the
          asides, figures for the intuition, and a short reference list at the end.
        </p>
      </div>
    </ArticleLayout>
  );
}
