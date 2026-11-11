// ============================================================
// SITE-WIDE CONTENT
// Edit anything here to update headers, nav, and footer.
// ============================================================

import { postNeedHref, becomePartnerHref, contactHref } from '../lib/mailto.js';

export const site = {
  // The brand block (logo + name) used in the nav and footer
  brand: {
    name: 'Church in the City',
    location: 'Titusville, Florida',
    locationLong: 'Est. 2019 · Titusville, FL',
  },

  // The navigation menu. `to` is the page's address (see routes in App.jsx).
  // The logo goes home, and the "Find a need" button is the volunteer link,
  // so neither appears here.
  navLinks: [
    { to: '/who', label: 'Who we are' },
    { to: '/partners', label: 'Partners' },
    { to: '/blog', label: 'Field notes' },
    { to: '/gallery', label: 'The Saturdays' },
  ],

  // The footer
  footer: {
    benediction:
      '"May the church in our city become a people who seek its welfare — until its welfare is ours."',
    benedictionAttribution: '— A benediction · Jer. 29:7',

    // Each link has either `to` (a page on this site) or `href`
    // (a mailto: link, from src/lib/mailto.js).
    columns: [
      {
        heading: 'The church',
        links: [
          { label: 'Who we are', to: '/who' },
          { label: 'Ministry partners', to: '/partners' },
        ],
      },
      {
        heading: 'The city',
        links: [
          { label: 'Find a need', to: '/volunteer' },
          { label: 'Post a need', href: postNeedHref },
          { label: 'Become a partner', href: becomePartnerHref },
        ],
      },
      {
        heading: 'Read & see',
        links: [
          { label: 'Field notes', to: '/blog' },
          { label: 'The Saturdays', to: '/gallery' },
          { label: 'Contact', href: contactHref },
        ],
      },
    ],

    copyright: '© 2026 Church in the City',
    tagline: 'Titusville · Florida · A network of local churches.',
  },
};
