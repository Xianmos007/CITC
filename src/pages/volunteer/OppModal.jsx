import { useState } from 'react';
import { opportunities } from '../../data/opportunities.js';

export function OppModal({ oppId, close }) {
  const [state, setState] = useState('idle'); // idle | done
  const o = opportunities.find((x) => x.id === oppId);
  if (!o) return null;
  const full = o.filled >= o.total;

  return (
    <div className="modal-scrim" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={close} aria-label="Close">✕</button>
        <div className="modal-head">
          <span className="eyebrow" style={{ color: full ? 'var(--citc-sage)' : 'var(--accent)' }}>
            — {o.partner}
          </span>
          <h2>{o.title}</h2>
          <div className="meta-row">
            <span>{o.date}</span>
            <span>{o.time}</span>
            <span>{o.dur}</span>
            <span>Titusville, FL</span>
            <span>{o.type}</span>
          </div>
        </div>
        <div className="modal-body">
          {state === 'done' ? (
            <>
              <div className="success-banner" style={{ marginBottom: 24 }}>
                <h4>You're in.</h4>
                <p>We'll send a text the morning of with the meeting spot. Bring what's on the list. Bring a friend if you can.</p>
              </div>
              <h4>What to bring</h4>
              <ul>{o.bring.map((b, i) => <li key={i}>{b}</li>)}</ul>
            </>
          ) : (
            <>
              <p className="lede">{o.desc}</p>
              <h4>What to bring</h4>
              <ul>{o.bring.map((b, i) => <li key={i}>{b}</li>)}</ul>
              <h4>A note from the coordinator</h4>
              <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, lineHeight: 1.5, color: 'var(--citc-ink)', maxWidth: 580 }}>
                "{o.notes}"
              </p>
            </>
          )}
        </div>
        <div className="modal-foot">
          <span className="spots">
            <strong>{o.filled}</strong> of {o.total} {full ? 'spots filled · waitlist open' : 'signed up'}
          </span>
          <div className="modal-actions">
            {state === 'done' ? (
              <>
                <button className="btn btn-ghost" onClick={close}>Close</button>
                <button className="btn btn-gold">Add to calendar <span className="arrow">→</span></button>
              </>
            ) : full ? (
              <>
                <button className="btn btn-ghost" onClick={close}>Back to list</button>
                <button className="btn btn-primary" onClick={() => setState('done')}>
                  Join waitlist <span className="arrow">→</span>
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={close}>Not this one</button>
                <button className="btn btn-primary" onClick={() => setState('done')}>
                  I'll be there <span className="arrow">→</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
