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
    note: 'Sent every other Saturday · Unsubscribe any week',
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
  id: 'dorothy-two-years',
  date: 'APR 18, 2026',
  readtime: '7 MIN',
  category: 'Saturdays',
  cat: 'saturdays',
  title: 'What we learned in two years at Ms. Dorothy\u2019s.',
  dek:
    'Twenty-three Saturdays. A new mailbox post, a re-shingled shed, and the slow, plain discovery that showing up is most of the work.',
  cover: '',
  author: 'Pastor James Holcomb',
  church: 'Park Avenue Baptist',
  photoLabel: 'Photo · Garden St., Saturday morning',
};

// The rest of the post list
export const blogPosts = [
  {
    id: 'pantry-thursday',
    date: 'APR 11, 2026',
    read: '4 MIN',
    cat: 'partners',
    category: 'From the partners',
    title: 'A note from the pantry, on the Thursday no one came.',
    dek:
      'On the slow weeks, the chairs are still set out. The bread is still bagged. Someone is still glad you came.',
    cover: '',
    author: 'Anita Reyes',
    church: 'North Brevard Charities',
  },
  {
    id: 'teenagers',
    date: 'APR 04, 2026',
    read: '5 MIN',
    cat: 'saturdays',
    category: 'Saturdays',
    title: 'On bringing teenagers along, badly.',
    dek:
      'Three Saturdays of phones-out, hood-up, mostly-unhelpful presence. And then, somewhere in the fourth, a quiet shift.',
    cover: '',
    author: 'Drew Castillo',
    church: 'Cypress Community Church',
  },
  {
    id: 'six-pastors',
    date: 'MAR 28, 2026',
    read: '9 MIN',
    cat: 'pastoral',
    category: 'Pastoral notes',
    title: 'Six pastors at Sunrise Bread, five years on.',
    dek:
      'What began with a back-room Wednesday and weak coffee has become a small, slow, durable habit. A note for the anniversary.',
    cover: '',
    author: 'Pastor Eli Vance',
    church: 'Riverside Fellowship',
  },
  {
    id: 'bridge-not-yet',
    date: 'MAR 21, 2026',
    read: '6 MIN',
    cat: 'pastoral',
    category: 'Pastoral notes',
    title: 'Why we haven\u2019t started \u201csomething\u201d under the bridge yet.',
    dek:
      'The temptation is to launch. The discipline is to listen — to the men already there, and to the ministries already doing the work.',
    cover: '',
    author: 'Pastor James Holcomb',
    church: 'Park Avenue Baptist',
  },
  {
    id: 'reading-hour',
    date: 'MAR 14, 2026',
    read: '3 MIN',
    cat: 'saturdays',
    category: 'Saturdays',
    title: 'The reading hour, in numbers we trust.',
    dek:
      'Twelve weeks. Four tutors. Eleven second-graders. The metric we keep is the one we can\u2019t graph: the question they ask when you sit down.',
    cover: '',
    author: 'Maya Iwu',
    church: 'First Presbyterian, Titusville',
  },
  {
    id: 'what-partner-means',
    date: 'MAR 07, 2026',
    read: '5 MIN',
    cat: 'letters',
    category: 'Letters',
    title: 'What \u201cpartner\u201d means to us (and what it doesn\u2019t).',
    dek:
      'A short letter to a new church asking how to plug in. Mostly about what we\u2019ve learned not to do.',
    cover: '',
    author: 'Pastor Eli Vance',
    church: 'Riverside Fellowship',
  },
  {
    id: 'benediction',
    date: 'FEB 28, 2026',
    read: '2 MIN',
    cat: 'pastoral',
    category: 'Pastoral notes',
    title: 'A benediction for the Saturday volunteer.',
    dek:
      "For the one who showed up tired. For the one who didn\u2019t know what to do. For the one who came back the next week.",
    cover: '',
    author: 'Pastor James Holcomb',
    church: 'Park Avenue Baptist',
  },
  {
    id: 'foster-listening',
    date: 'FEB 21, 2026',
    read: '8 MIN',
    cat: 'partners',
    category: 'From the partners',
    title: 'Better Together: what a year of listening sounds like.',
    dek:
      'We haven\u2019t hosted yet. We haven\u2019t trained yet. We have sat in a circle, every month, with the people who do. Here\u2019s what we\u2019re hearing.',
    cover: '',
    author: 'Sarah Whitcombe',
    church: 'Better Together · Brevard',
  },
];
