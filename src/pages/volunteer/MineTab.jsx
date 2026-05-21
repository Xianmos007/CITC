import { mineDemo } from '../../data/opportunities.js';

export function MineTab({ openOpp }) {
  const Card = ({ c, kind }) => (
    <div className={`signup-card ${kind}`} onClick={() => openOpp(c.id)}>
      <div>
        <div className="when-tag">{c.when}</div>
        <h4>{c.title}</h4>
        <span className="partner">{c.partner}</span>
      </div>
      <div className="stat">
        <span className="dot"></span>
        {c.stat}
      </div>
      <div className="actions">
        <a onClick={(e) => { e.stopPropagation(); openOpp(c.id); }}>Details</a>
        {kind !== 'completed' && <a className="danger" onClick={(e) => e.stopPropagation()}>Cancel</a>}
        {kind === 'completed' && <a onClick={(e) => e.stopPropagation()}>Sign up again</a>}
      </div>
    </div>
  );

  return (
    <div className="container">
      <section className="signup-section">
        <h3>Confirmed <span className="count">{String(mineDemo.confirmed.length).padStart(2, '0')}</span></h3>
        <div className="sec-sub">You said yes. Show up, bring water, we'll see you there.</div>
        <div className="signup-grid">
          {mineDemo.confirmed.map((c) => <Card key={c.id} c={c} kind="confirmed" />)}
        </div>
      </section>
      <section className="signup-section">
        <h3>Pending <span className="count">{String(mineDemo.pending.length).padStart(2, '0')}</span></h3>
        <div className="sec-sub">One small thing left before we lock it in.</div>
        <div className="signup-grid">
          {mineDemo.pending.map((c) => <Card key={c.id} c={c} kind="pending" />)}
        </div>
      </section>
      <section className="signup-section">
        <h3>Completed <span className="count">{String(mineDemo.completed.length).padStart(2, '0')} · {mineDemo.completedHoursLabel}</span></h3>
        <div className="sec-sub">Quiet hours, mostly invisible. They counted.</div>
        <div className="signup-grid">
          {mineDemo.completed.map((c) => <Card key={c.id} c={c} kind="completed" />)}
        </div>
      </section>
    </div>
  );
}
