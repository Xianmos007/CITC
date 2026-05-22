// =====================================================================
// useContent — loads opportunities + partners from the database once,
// with the bundled static data as a fallback so the site is never blank.
//
// Returns: { opportunities, partners, loading, error, source }
//   source is 'db' when live data loaded, 'static' when we fell back.
// =====================================================================
import { useEffect, useState } from 'react';
import { fetchOpportunities, fetchPartners } from '../lib/content.js';
import { opportunities as staticOpps } from '../data/opportunities.js';
import { partners as staticPartners } from '../data/partners.js';

export function useContent() {
  const [opportunities, setOpportunities] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [opps, prts] = await Promise.all([
          fetchOpportunities(),
          fetchPartners(),
        ]);
        if (cancelled) return;

        // Decide DB-vs-fallback based on PARTNERS, which are always seeded.
        // An empty opportunities list is a valid, expected state (real
        // opportunities are added via the admin panel), so we must NOT
        // treat "zero opportunities" as a reason to fall back to static.
        if (prts.length > 0) {
          setPartners(prts);
          setOpportunities(opps); // may legitimately be []
          setSource('db');
        } else {
          // Partners empty too → DB is unreachable/unconfigured. Fall back
          // to bundled static content so the site is never blank.
          setPartners(staticPartners);
          setOpportunities(staticOpps);
          setSource('static');
        }
      } catch (e) {
        if (cancelled) return;
        console.error('[CITC] useContent failed, using static fallback:', e);
        setOpportunities(staticOpps);
        setPartners(staticPartners);
        setError(e);
        setSource('static');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { opportunities, partners, loading, error, source };
}
