export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--rule)', marginTop: '80px', padding: '32px 0 56px' }}>
      <div className="l-screen" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span className="mono" style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} Hamza Habib · built with React
        </span>
        <span className="mono" style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>
          KU Pharmaceutical Chemistry · Hageman Lab
        </span>
      </div>
    </footer>
  );
}
