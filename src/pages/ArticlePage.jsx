import { useParams, Link } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import articles from '../data/articles';
import ArticleLayout from '../components/ArticleLayout';
import mdxComponents from '../mdxComponents';
import DraftArticle from './articles/DraftArticle';

const mdxModules = import.meta.glob('./articles/*.mdx', { eager: true });

function findMdxModule(slug) {
  const entry = Object.entries(mdxModules).find(([path]) => path.endsWith(`/${slug}.mdx`));
  return entry?.[1];
}

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

  const mod = findMdxModule(slug);
  if (mod) {
    const Content = mod.default;
    return (
      <ArticleLayout title={meta.title} dek={meta.dek} date={meta.date} readTime={meta.readTime} tags={meta.tags}>
        <MDXProvider components={mdxComponents}>
          <Content />
        </MDXProvider>
      </ArticleLayout>
    );
  }
  return <DraftArticle meta={meta} />;
}
