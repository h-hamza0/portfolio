import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Header.css';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/highlights', label: 'Research' },
  { to: '/writing', label: 'Writing' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
];

export default function Header() {
  return (
    <header className="site-header">
      <div className="l-screen site-header__inner">
        <NavLink to="/" className="site-header__mark">
          <span className="site-header__mark-glyph">◐</span>
          <span>Hamza&nbsp;Habib</span>
        </NavLink>
        <nav className="site-header__nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className="site-header__link"
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="site-header__underline"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
