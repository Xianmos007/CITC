// ============================================================
// MINISTRY PARTNERS
// ============================================================

export const partnersPage = {
  hero: {
    label: '03 · Ministry Partners',
    headingLine1: "The people we're",
    headingEm: 'actually',
    headingLine2: 'with.',
    sub:
      'A handful of partnerships, in different seasons — some four years deep, some still in the listening stage.',
  },
  cta: {
    headingLine1: 'Are you a ministry in',
    headingEm: 'Titusville?',
    body:
      "If your team serves the city and you'd consider letting a few church folks come alongside, we'd love a coffee. No paperwork. No commitments. Just listening, first.",
  },
};

// To add a new partner, copy a block and edit it.
// Status options: 'Active', 'In conversation', 'On the horizon'
export const partners = [
  {
    id: 'nbc',
    status: 'Active',
    name: 'North Brevard Charities',
    type: 'Food pantry · Wraparound services',
    since: 'Partner since 2023',
    vols: '18 regulars / mo',
    mission:
      'A small pantry and family-services organization that has served Park Avenue families for more than thirty years. We come alongside their Tuesday and Thursday distributions, and a handful of one-off projects each season.',
    needs: [
      { title: 'Pantry distribution', cadence: 'Tue/Thu 4:30pm' },
      { title: 'Saturday yard team', cadence: 'Monthly' },
      { title: 'Spring kids closet refresh', cadence: 'Apr 27' },
    ],
  },
  {
    id: 'bt',
    status: 'In conversation',
    name: 'Better Together',
    type: 'Family preservation · Foster support',
    since: 'In conversation',
    vols: 'Exploring',
    mission:
      'A statewide organization helping vulnerable families keep their kids at home through volunteer host families and church-based wraparound care. We are listening to their team monthly — quietly, without rushing — about how Titusville churches could come alongside them.',
    needs: [
      { title: 'Monthly listening session', cadence: 'Ongoing' },
      { title: 'Possible host family training', cadence: 'TBD' },
    ],
  },
  {
    id: 'utb',
    status: 'On the horizon',
    name: 'Under the Bridge Ministries',
    type: 'Street outreach · Hot meals',
    since: 'On the horizon',
    vols: '—',
    mission:
      'A Saturday-morning outreach under the I-95 overpass on Garden Street. Breakfast, laundry, and a quiet presence with men and women living without homes. We have been praying about how to step in.',
    needs: [
      { title: 'Saturday breakfast crew', cadence: 'Weekly' },
      { title: 'Laundry intake', cadence: 'Weekly' },
    ],
  },
  {
    id: 'champ',
    status: 'On the horizon',
    name: 'The CHAMP Program',
    type: 'Youth mentorship · After-school',
    since: 'On the horizon',
    vols: '—',
    mission:
      'A small after-school mentorship for middle-school students at Imperial Estates Elementary. Reading hour Tuesdays, snack and homework Thursdays. We are in the early conversations about a tutoring rotation.',
    needs: [
      { title: 'Reading hour tutors', cadence: 'Tue 3:15pm' },
      { title: 'Homework helpers', cadence: 'Thu 3:15pm' },
    ],
  },
  {
    id: 'mh',
    status: 'On the horizon',
    name: "Matthew's Hope",
    type: 'Homeless transition · Job placement',
    since: 'On the horizon',
    vols: '—',
    mission:
      'A long-running residential program in central Brevard helping men and women transition out of homelessness through housing, jobs, and discipleship. We are talking with them about a small Titusville chapter of weekly meal support.',
    needs: [
      { title: 'Weekly meal share', cadence: 'Mondays' },
      { title: 'Job-readiness mock interviews', cadence: 'Quarterly' },
    ],
  },
];
