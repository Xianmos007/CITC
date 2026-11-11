import { useState } from 'react';
import { volunteerPage } from '../../data/opportunities.js';
import { BrowseTab } from './BrowseTab.jsx';
import { postNeedHref } from '../../lib/mailto.js';
import { Seo } from '../../components/Seo.jsx';
import { PhotoCollage } from '../../components/PhotoCollage.jsx';
import { pagePhotos } from '../../data/pagePhotos.js';

export function VolunteerPage({ opportunities = [], loading = false }) {
  const [tab, setTab] = useState('browse');
  const { hero } = volunteerPage;
  const openCount = opportunities.filter((o) => o.filled < o.total).length;

  return (
    <div className="page">
      <Seo path="/volunteer" />
      <section className="page-hero has-photos">
        <div className="container">
          <div className="page-hero-text">
          <span className="label">{hero.label}</span>
          <h1>{hero.headingLine1} <em>{hero.headingEm}</em>{hero.headingLine2}</h1>
          <p className="sub">{hero.sub}</p>
          </div>
          <PhotoCollage photos={pagePhotos.volunteer} />
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
        <BrowseTab opportunities={opportunities} loading={loading} />
      )}
    </div>
  );
}
