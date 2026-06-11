import { useState } from 'react';
import { volunteerPage } from '../../data/opportunities.js';
import { BrowseTab } from './BrowseTab.jsx';

const encodeMailto = (value) => encodeURIComponent(value).replace(/'/g, '%27');
const postNeedHref = `mailto:cristian.m@trinityfla.org?subject=${encodeMailto('New need for the CITC portal')}&body=${encodeMailto("Ministry:\nWhat's the need:\nDate and time:\nVolunteers needed:\nAnything else:")}`;

export function VolunteerPage({ openOpp, opportunities = [], loading = false }) {
  const [tab, setTab] = useState('browse');
  const { hero } = volunteerPage;
  const openCount = opportunities.filter((o) => o.filled < o.total).length;

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
          <a
            className="portal-tab"
            href={postNeedHref}
          >
            Post a need
          </a>
          <div className="spacer"></div>
        </div>
      </div>

      {tab === 'browse' && (
        <BrowseTab openOpp={openOpp} opportunities={opportunities} loading={loading} />
      )}
    </div>
  );
}
