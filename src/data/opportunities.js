// ============================================================
// VOLUNTEER OPPORTUNITIES
//
// IMPORTANT: In Phase 2 (when we add accounts), these will move
// to a database so you can add/edit them from an admin panel
// without touching code. For now, edit them here.
//
// Each opportunity needs:
//   id          — short unique string (used internally)
//   date        — e.g. 'SAT · APR 27'
//   time        — e.g. '8:00AM'
//   dur         — e.g. '4 hours'
//   title       — what people see in the list
//   partner     — which ministry this is for
//   filled      — how many spots are taken
//   total       — total spots needed
//   urgency     — 'urgent', 'open', or 'full'
//   type        — 'Hands-on', 'Indoor', or 'Mentorship'
//   desc        — paragraph shown in the popup
//   bring       — list of items to bring
//   notes       — coordinator's note (shown in italics in the popup)
//   skills      — tags for filtering
// ============================================================

export const opportunities = [
  {
    id: 'yard-dorothy',
    date: 'SAT · APR 27',
    time: '8:00AM',
    dur: '4 hours',
    title: 'Yard cleanup for Ms. Dorothy on Garden St.',
    partner: 'North Brevard Charities',
    filled: 4,
    total: 6,
    urgency: 'urgent',
    type: 'Hands-on',
    desc:
      "Ms. Dorothy is 84, lives alone on Garden St., and her hedges have outgrown her. We'll mow, prune, haul brush to the curb, and stay for sweet tea.",
    bring: ['Work gloves', 'Closed-toe shoes', 'A water bottle', 'A neighbor if you have one'],
    notes:
      "Walter from the pantry will be on site. He's done this run with us four years in a row — he knows everyone on the block.",
    skills: ['No skill needed', 'Outdoor work', 'Bring kids'],
  },
  {
    id: 'pantry-tue',
    date: 'TUE · APR 30',
    time: '4:30PM',
    dur: '2.5 hours',
    title: 'Pantry distribution, second shift',
    partner: 'North Brevard Charities',
    filled: 8,
    total: 8,
    urgency: 'full',
    type: 'Indoor',
    desc:
      'Stocking pantry shelves, packing weekly grocery boxes, and walking families to their cars. Indoor, structured, kid-friendly with a 12+ minimum.',
    bring: ['Closed-toe shoes', 'A friend (12+)'],
    notes: 'Sign up for the waitlist — they almost always have a no-show.',
    skills: ['Indoor', '12+ welcome'],
  },
  {
    id: 'tutoring',
    date: 'WED · MAY 01',
    time: '3:15PM',
    dur: '1.5 hours',
    title: 'Reading hour with 2nd graders',
    partner: 'Imperial Estates Elementary',
    filled: 3,
    total: 5,
    urgency: 'open',
    type: 'Mentorship',
    desc:
      'A short, sweet reading hour with second graders right after school. Mrs. Andre runs the room. You read a picture book, listen as they read one back, and high-five your way out.',
    bring: ['A favorite kids book if you have one', 'Patience'],
    notes: "Background check required (we'll start it for you).",
    skills: ['Background check', 'Indoor', 'One-on-one'],
  },
  {
    id: 'breakfast-bridge',
    date: 'SAT · MAY 04',
    time: '6:30AM',
    dur: '3 hours',
    title: 'Saturday breakfast under the bridge',
    partner: 'Under the Bridge Ministries',
    filled: 2,
    total: 8,
    urgency: 'urgent',
    type: 'Hands-on',
    desc:
      "Set up tables, serve hot breakfast, run the laundry intake. Quiet presence with the men and women who come — we don't preach, we serve coffee.",
    bring: ['Closed-toe shoes', "A warm jacket if it's cold", 'No agenda'],
    notes: 'Carpool meets at North Brevard Charities at 6:00am.',
    skills: ['Early morning', 'Outdoor', 'Conversation'],
  },
  {
    id: 'kids-closet',
    date: 'SAT · MAY 11',
    time: '9:00AM',
    dur: '5 hours',
    title: 'Spring kids closet refresh',
    partner: 'North Brevard Charities',
    filled: 6,
    total: 12,
    urgency: 'open',
    type: 'Hands-on',
    desc:
      'Sort, fold, and shelve donated kids clothing for the May distribution. Big team day — a good first volunteering with someone new.',
    bring: ['A friend', 'Sorting energy', 'Lunch is provided'],
    notes: 'Newcomers especially welcome. Pastor Ana will be there to meet folks.',
    skills: ['Indoor', 'Bring kids', 'First-time friendly'],
  },
  {
    id: 'homework',
    date: 'THU · MAY 16',
    time: '3:15PM',
    dur: '1.5 hours',
    title: 'Homework helpers, middle-school',
    partner: 'The CHAMP Program',
    filled: 1,
    total: 4,
    urgency: 'open',
    type: 'Mentorship',
    desc:
      "Snack, then 45 minutes of homework support for 5th and 6th graders. Math and reading mostly. You don't need to be good at math — you need to be patient.",
    bring: ['A snack to share', 'Patience'],
    notes: 'Background check required.',
    skills: ['Background check', 'Indoor', 'One-on-one'],
  },
];

// Filter options shown in the sidebar (auto-derive when possible, but
// these let you reorder them or add ones not yet in any opportunity).
export const filterOptions = {
  partners: [
    'North Brevard Charities',
    'Under the Bridge Ministries',
    'Imperial Estates Elementary',
    'The CHAMP Program',
  ],
  types: ['Hands-on', 'Indoor', 'Mentorship'],
  skills: [
    'No skill needed',
    'Background check',
    'Bring kids',
    'Early morning',
    'First-time friendly',
  ],
};

// The synthetic "My sign-ups" preview content. Once accounts ship in
// Phase 2, this will come from the logged-in user's database records.
// For now, it shows a plausible preview so visitors can see the feature.
export const mineDemo = {
  user: { initial: 'D', name: 'Dorothy Lin · Cypress Community' },
  confirmed: [
    { id: 'yard-dorothy', when: 'SAT · APR 27 · 8:00AM', title: 'Yard cleanup for Ms. Dorothy on Garden St.', partner: 'North Brevard Charities', stat: 'Confirmed' },
    { id: 'kids-closet', when: 'SAT · MAY 11 · 9:00AM', title: 'Spring kids closet refresh', partner: 'North Brevard Charities', stat: 'Confirmed' },
  ],
  pending: [
    { id: 'tutoring', when: 'WED · MAY 01 · 3:15PM', title: 'Reading hour with 2nd graders', partner: 'Imperial Estates Elementary', stat: 'Awaiting background check' },
  ],
  completed: [
    { id: 'past-1', when: 'SAT · APR 13', title: 'Pantry distribution — Saturday rush', partner: 'North Brevard Charities', stat: 'Completed · 3 hrs' },
    { id: 'past-2', when: 'TUE · APR 02', title: 'Reading hour with 2nd graders', partner: 'Imperial Estates Elementary', stat: 'Completed · 1.5 hrs' },
    { id: 'past-3', when: 'SAT · MAR 23', title: 'Yard help for the Hernandez family', partner: 'North Brevard Charities', stat: 'Completed · 4 hrs' },
  ],
  completedHoursLabel: '8.5 hours',
};

export const volunteerPage = {
  hero: {
    label: '04 · Volunteer Now',
    headingLine1: 'Find a',
    headingEm: 'need',
    headingLine2: '. Show up Saturday.',
    sub:
      "A small portal connecting the ministries already serving Titusville with the people of our churches. Pick something specific, sign up, and we'll see you there.",
  },
};
