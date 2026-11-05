// ============================================================
// SITE-WIDE CONTENT
// Edit anything here to update headers, nav, and footer.
// ============================================================

import { postNeedHref, becomePartnerHref, contactHref } from '../lib/mailto.js';

export const site = {
  // The top dark bar that runs above the navigation
  metaBar: {
    label: 'Church in the City · Titusville, FL · Est. 2019',
    scripture: 'Jer. 29:7',
  },

  // The brand block (logo + name) used in the nav and footer
  brand: {
    name: 'Church in the City',
    location: 'Titusville, Florida',
    locationLong: 'Est. 2019 · Titusville, FL',
  },

  // The navigation menu. The 'key' must match a page key in App.jsx.
  // The logo goes home, and the "Find a need" button is the volunteer link,
  // so neither appears here.
  navLinks: [
    { key: 'who', label: 'Who we are' },
    { key: 'partners', label: 'Partners' },
    { key: 'blog', label: 'Field notes' },
    { key: 'gallery', label: 'The Saturdays' },
  ],

  // The footer
  footer: {
    benediction:
      '"May the church in our city become a people who seek its welfare — until its welfare is ours."',
    benedictionAttribution: '— A benediction · Jer. 29:7',

    // Each link has either `page` (a page key in App.jsx) or `href`
    // (a mailto: link, from src/lib/mailto.js).
    columns: [
      {
        heading: 'The church',
        links: [
          { label: 'Who we are', page: 'who' },
          { label: 'Ministry partners', page: 'partners' },
        ],
      },
      {
        heading: 'The city',
        links: [
          { label: 'Find a need', page: 'volunteer' },
          { label: 'Post a need', href: postNeedHref },
          { label: 'Become a partner', href: becomePartnerHref },
        ],
      },
      {
        heading: 'Read & see',
        links: [
          { label: 'Field notes', page: 'blog' },
          { label: 'The Saturdays', page: 'gallery' },
          { label: 'Contact', href: contactHref },
        ],
      },
    ],

    copyright: '© 2026 Church in the City',
    tagline: 'Titusville · Florida · A network of local churches.',
  },
};
