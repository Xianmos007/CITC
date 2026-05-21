// ============================================================
// "THE SATURDAYS" GALLERY
// ============================================================

export const galleryPage = {
  hero: {
    label: '06 · The Saturdays',
    headingLine1: 'Real hands. Real porches.',
    headingEm: 'Real Saturdays.',
    sub:
      'A small archive of the work, mostly taken on phones, by whoever wasn\u2019t holding a shovel. Documentary, not stock. No models, no staging.',
  },
  cta: {
    headingLine1: 'Were you',
    headingEm: 'there?',
    body:
      'If you took a frame at a Saturday — or any of the weekday shifts — send it our way. We file the good ones here, with credit, with a small caption written by someone who was there.',
  },
};

// Tile shapes: 'tall' (4:5), 'wide' (5:4), 'square', 'big' (2x2-ish)
// Category options need a matching chip in galleryCategories below.
export const photos = [
  { id: 1, cat: 'yard', shape: 'big', place: 'Garden St., Titusville', caption: 'Ms. Dorothy\u2019s yard, the morning we finished the mailbox post.', when: 'APR 13, 2026' },
  { id: 2, cat: 'pantry', shape: 'tall', place: 'North Brevard Charities', caption: 'Tuesday distribution, second shift.', when: 'APR 09, 2026' },
  { id: 3, cat: 'saturday', shape: 'wide', place: 'Sunrise Bread Co., Main St.', caption: 'Six pastors. The same back booth, five years running.', when: 'APR 06, 2026' },
  { id: 4, cat: 'tutoring', shape: 'square', place: 'Imperial Estates Elementary', caption: 'Reading hour, second graders.', when: 'APR 02, 2026' },
  { id: 5, cat: 'bridge', shape: 'tall', place: 'Under I-95, Garden St.', caption: 'A quiet Saturday breakfast with our friends.', when: 'MAR 30, 2026' },
  { id: 6, cat: 'pantry', shape: 'square', place: 'NBC Pantry, Park Ave.', caption: 'Bagging produce before the line opens.', when: 'MAR 26, 2026' },
  { id: 7, cat: 'yard', shape: 'wide', place: 'Garden St., Titusville', caption: 'Hauling the old shingles to the curb.', when: 'MAR 23, 2026' },
  { id: 8, cat: 'sunday', shape: 'tall', place: 'Riverside Fellowship', caption: 'The Sunday we read Jer. 29 together.', when: 'MAR 17, 2026' },
  { id: 9, cat: 'saturday', shape: 'square', place: 'Park Ave. parking lot', caption: 'Loading the truck before the drive over.', when: 'MAR 16, 2026' },
  { id: 10, cat: 'tutoring', shape: 'square', place: 'Imperial Estates Elementary', caption: 'Homework hour, Thursdays.', when: 'MAR 12, 2026' },
  { id: 11, cat: 'bridge', shape: 'wide', place: 'Under I-95, Garden St.', caption: 'Laundry intake. Names taken. Coffee passed.', when: 'MAR 09, 2026' },
  { id: 12, cat: 'yard', shape: 'tall', place: 'Hopkins Ave.', caption: 'A widow\u2019s side gate, finally back on its hinges.', when: 'MAR 02, 2026' },
  { id: 13, cat: 'pantry', shape: 'big', place: 'NBC, Park Ave.', caption: 'Thursday family-services intake. Thirty-eight families.', when: 'FEB 27, 2026' },
  { id: 14, cat: 'saturday', shape: 'square', place: 'Garden St., Titusville', caption: 'The team after the eight-thirty briefing.', when: 'FEB 23, 2026' },
  { id: 15, cat: 'sunday', shape: 'wide', place: 'Park Avenue Baptist', caption: 'Communion, Lent.', when: 'FEB 18, 2026' },
  { id: 16, cat: 'tutoring', shape: 'tall', place: 'Imperial Estates Elementary', caption: 'The bookshelf the dads built last fall.', when: 'FEB 12, 2026' },
];

export const galleryCategories = [
  { key: 'all', label: 'All' },
  { key: 'saturday', label: 'Saturdays' },
  { key: 'pantry', label: 'Pantry' },
  { key: 'yard', label: 'Yard work' },
  { key: 'tutoring', label: 'Reading hour' },
  { key: 'bridge', label: 'Under the bridge' },
  { key: 'sunday', label: 'Sundays' },
];
