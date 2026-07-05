export default function About() {
  return (
    <div className="l-body" style={{ paddingTop: '56px', paddingBottom: '80px' }}>
      <p className="eyebrow">About</p>
      <h1 style={{ fontSize: '2.4rem', marginBottom: '18px' }}>Hamza Habib</h1>
      <p>
        I'm an undergraduate computational chemistry researcher. My work sits between molecular simulation and machine learning &mdash; using
        molecular dynamics to understand how pharmaceutical excipients and APIs behave at the molecular scale, and
        using machine learning to make process development experiments more efficient.
      </p>
      <p>
        Here you can find more information about my work. I also maintain a collection of articles talking about
        the mechanistics behind deep learning / probabilistic modeling especially in the realm of drug discovery.
      </p>
      <hr />
      <h2 style={{ fontSize: '1.3rem' }}>Get in touch</h2>
      <p style={{ fontFamily: 'var(--f-sans)', color: 'var(--ink-soft)' }}>
        <a href="https://scholar.google.com/citations?user=DNgDJMQAAAAJ" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-soft)', textDecoration: 'underline' }}>
          Google Scholar
        </a>
        {' · '}
        <a href="https://www.linkedin.com/in/hamza-h-985a71255/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-soft)', textDecoration: 'underline' }}>
          LinkedIn
        </a>
      </p>
    </div>
  );
}