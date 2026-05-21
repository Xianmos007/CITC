// ============================================================
// SITE-WIDE CONTENT
// Edit anything here to update headers, nav, and footer.
// ============================================================

export const site = {
  // The top dark bar that runs above the navigation
  metaBar: {
    label: 'Church in the City · Titusville, FL · Est. 2019',
    nextEvent: 'Pastors Breakfast · Jun 9 · 9am',
    scripture: 'Jer. 29:7',
  },

  // The brand block (logo + name) used in the nav and footer
  brand: {
    name: 'Church in the City',
    location: 'Titusville, Florida',
    locationLong: 'Est. 2019 · Titusville, FL',
  },

  // The navigation menu. The 'key' must match a page key in App.jsx.
  navLinks: [
    { key: 'home', label: 'Home' },
    { key: 'who', label: 'Who We Are' },
    { key: 'partners', label: 'Ministry Partners' },
    { key: 'blog', label: 'Field Notes' },
    { key: 'gallery', label: 'The Saturdays' },
    { key: 'volunteer', label: 'Volunteer Now' },
  ],

  // The footer
  footer: {
    benediction:
      '"May the church in our city become a people who seek its welfare — until its welfare is ours."',
    benedictionAttribution: '— A benediction · Jer. 29:7',

    columns: [
      {
        heading: 'The Church',
        links: [
          { label: 'Who we are', page: 'who' },
          { label: 'Ministry partners', page: 'partners' },
          { label: 'Sunday gatherings', page: null },
          { label: 'Leadership', page: null },
        ],
      },
      {
        heading: 'The City',
        links: [
          { label: 'Find a need', page: 'volunteer' },
          { label: 'Post a need', page: 'volunteer' },
          { label: 'Become a partner', page: null },
          { label: 'Pray for Titusville', page: null },
        ],
      },
      {
        heading: 'Read & See',
        links: [
          { label: 'Field notes', page: 'blog' },
          { label: 'The Saturdays', page: 'gallery' },
          { label: 'Saturday letter', page: 'blog' },
          { label: 'Contact', page: null },
        ],
      },
    ],

    copyright: '© 2026 Church in the City',
    tagline: 'Titusville · Florida · A network of local churches.',
  },
};
