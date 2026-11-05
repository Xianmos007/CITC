import { useEffect } from 'react';
import { useDialog } from '../../../hooks/useDialog.js';

// Right-hand admin drawer: scrim, Esc to close, focus kept inside.
// `wide` gives the editor's two-column width.
export function Drawer({ title, onClose, wide = false, children, footer }) {
  const ref = useDialog();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="admin-drawer-scrim" onClick={onClose}>
      <div
        className={`admin-drawer admin-drawer-framed ${wide ? 'admin-drawer-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-drawer-top">
          <h3>{title}</h3>
          <button type="button" className="admin-drawer-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="admin-drawer-body">{children}</div>
        {footer && <div className="admin-drawer-foot">{footer}</div>}
      </div>
    </div>
  );
}
