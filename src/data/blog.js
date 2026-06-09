// ============================================================
// FIELD NOTES (BLOG) POSTS
//
// To add a new post, copy a block and edit. Categories must
// match one of the keys in `categories` below.
// ============================================================

export const blogPage = {
  hero: {
    label: '05 · Field Notes',
    headingLine1: 'Letters from the',
    headingEm: 'Saturdays.',
    sub:
      'Short pieces from pastors, partners, and the people who keep showing up. Mostly written on Sunday afternoons, mostly about something that happened on Saturday.',
  },
  letter: {
    headingLine1: 'The',
    headingEm: 'Saturday Letter.',
    body:
      "One short letter, every other Saturday morning, from one of the pastors. The current week's needs, one piece worth reading, and a benediction. No threads. No campaigns.",
    note: 'Sent every other Saturday \u00b7 Unsubscribe any week',
  },
};

// Filter chips. The 'key' is internal, the 'label' is what visitors see.
export const blogCategories = [
  { key: 'all', label: 'All' },
  { key: 'saturdays', label: 'Saturdays' },
  { key: 'partners', label: 'From the partners' },
  { key: 'pastoral', label: 'Pastoral notes' },
  { key: 'letters', label: 'Letters' },
];

// The big featured post at the top
export const featuredPost = {
  id: 'let-justice-roll-down',
  date: 'MAY 28, 2026',
  read: '5 MIN',
  cat: 'pastoral',
  category: 'Pastoral notes',
  title: 'Let justice roll down.',
  dek:
    'Amos 5:24 has become a politicized verse. But biblical justice is the fruit of transformed worship \u2014 and the local church, working together, is uniquely positioned to live it out.',
  author: 'Pastor Cristian Moscoso',
  church: 'Trinity Church',
  cover: '/blog-covers/let-justice-roll-down.jpg',
};

// The rest of the post list
export const blogPosts = [];