export default function References({ items }) {
  return (
    <section style={{ marginTop: '3em' }}>
      <hr />
      <h3 style={{ fontSize: '1.05rem' }}>References</h3>
      <ol style={{ fontFamily: 'var(--f-sans)', fontSize: '0.88rem', color: 'var(--ink-soft)', paddingLeft: '1.2em' }}>
        {items.map((r) => (
          <li key={r.id} style={{ marginBottom: '0.6em' }}>{r.text}</li>
        ))}
      </ol>
    </section>
  );
}
