import katex from 'katex';
import 'katex/dist/katex.min.css';

export function M({ children }) {
  const html = katex.renderToString(children, { throwOnError: false, displayMode: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function MBlock({ children }) {
  const html = katex.renderToString(children, { throwOnError: false, displayMode: true });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
