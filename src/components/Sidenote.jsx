import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './Sidenote.css';

export default function Sidenote({ number, children }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="sidenote-ref"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        {number}
      </button>
      <span className="sidenote-mobile-wrap">
        <AnimatePresence initial={false}>
          {open && (
            <motion.span
              id={id}
              className="sidenote-mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'block', overflow: 'hidden' }}
            >
              <span style={{ display: 'block', padding: '8px 14px' }}>{children}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className="sidenote-desktop">
        <sup className="sidenote-desktop__num">{number}</sup> {children}
      </span>
    </>
  );
}
