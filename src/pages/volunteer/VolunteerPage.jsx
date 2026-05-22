import { useState } from 'react';
import { volunteerPage, mineDemo } from '../../data/opportunities.js';
import { BrowseTab } from './BrowseTab.jsx';
import { PostTab } from './PostTab.jsx';
import { MineTab } from './MineTab.jsx';

export function VolunteerPage({ openOpp, opportunities = [], loading = false }) {
  const [tab, setTab] = useState('browse');
  const { hero } = volunteerPage;
  const openCount = opportunities.filter((o) => o.filled < o.total).length;
  const mineCount = mineDemo.confirmed.length + mineDemo.pending.length;

  return (
    <div className="page">
      <section className="page-hero">
        <div className="container">
          <span className="label">{hero.label}</span>
          <h1>{hero.headingLine1} <em>{hero.headingEm}</em>{hero.headingLine2}</h1>
          <p className="sub">{hero.sub}</p>
        </div>
      </section>

      <div className="portal-tabs-wrap">
        <div className="portal-tabs">
          <button
            className={`portal-tab ${tab === 'browse' ? 'active' : ''}`}
            onClick={() => setTab('browse')}
          >
            Browse needs <span className="badge">{openCount}</span>
          </button>
          <button
            className={`portal-tab ${tab === 'post' ? 'active' : ''}`}
            onClick={() => setTab('post')}
          >
            Post a need
          </button>
          <button
            className={`portal-tab ${tab === 'mine' ? 'active' : ''}`}
            onClick={() => setTab('mine')}
          >
            My sign-ups <span className="badge">{mineCount}</span>
          </button>
          <div className="spacer"></div>
          <div className="user">
            <span className="avatar">{mineDemo.user.initial}</span>
            {mineDemo.user.name}
          </div>
        </div>
      </div>

      {tab === 'browse' && (
        <BrowseTab openOpp={openOpp} opportunities={opportunities} loading={loading} />
      )}
      {tab === 'post' && <PostTab />}
      {tab === 'mine' && <MineTab openOpp={openOpp} />}
    </div>
  );
}
