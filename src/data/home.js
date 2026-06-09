// ============================================================
// HOME PAGE CONTENT
// Edit the words, scripture, stats, partners, etc. below.
// ============================================================

export const home = {
  hero: {
    eyebrow: 'A network of local churches · Titusville, FL',
    // The headline animates word by word. One word is highlighted in gold.
    headlineWords: ['Seek', 'the', 'welfare', 'of', 'the', 'city.'],
    goldWord: 'welfare',
    scripture:
      '"Seek the welfare of the city where I have sent you, and pray to the Lord on its behalf, for in its welfare you will find your welfare."',
    scriptureAttribution: '— Jeremiah 29:7',
    photoLabel: 'Photo · Saturday on Garden St.',
    stats: [
      { num: '5', label: 'Ministry partners' },
      { num: '12', label: 'Local congregations' },
    ],
  },

  // The scrolling marquee bar. These words repeat twice across the page.
  marqueeWords: ['Welcome', 'Serve', 'Listen', 'Repair', 'Pray', 'Stay'],

  howItWorks: {
    headingLine1: 'A posture,',
    headingLine2Em: 'not a program.',
    sub:
      'One portal bridges the ministries already doing the work with the people who can lend a hand. No app to download. No movement to join.',
    steps: [
      {
        num: '01',
        label: 'Partners',
        tag: 'POST',
        heading: 'A ministry posts a need',
        body:
          'A ministry posts a real need — a yard cleanup, a Saturday meal, a tutoring shift.',
      },
      {
        num: '02',
        label: 'Neighbors',
        tag: 'BROWSE',
        heading: 'Neighbors sign up',
        body: 'You browse open opportunities, pick one that fits, and sign up.',
      },
      {
        num: '03',
        label: 'Saturday',
        tag: 'SERVE',
        heading: 'We show up on Saturday',
        body:
          'You show up. Quietly, faithfully, often. The same people, the same place.',
      },
    ],
  },

  featuredPartners: {
    headingLine1: 'Where the church',
    headingLine2: 'is',
    headingLine2Em: 'already',
    headingLine2End: 'at work.',
    sub:
      "We don't run our own programs. We come alongside the ministries already serving Titusville — slowly, faithfully, often invisibly.",
    cards: [
      {
        status: 'Active',
        name: 'North Brevard Charities',
        type: 'Community services · Titusville',
        body:
          'Providing hope and help \u2014 empowering individuals to overcome hardships and rebuild stable, healthy lives.',
      },
      {
        status: 'Active',
        name: 'Better Together',
        type: 'Family preservation · Volunteer training',
        body:
          'Host families for short-term care, job fairs, and mentors who guide and encourage \u2014 so families stay together.',
      },
      {
        status: 'Active',
        name: 'Hope for North Brevard',
        type: 'Youth services · Food program',
        body:
          'A catalyst for restoring hope and unity to youth and families through counseling, community programs, and food delivery.',
      },
    ],
  },

  // These previews are shown on the home page — drawn from the full opportunities
  // list in src/data/opportunities.js. Edit by id there.
  homeOppPreviewIds: ['yard-dorothy', 'pantry-tue', 'tutoring'],

  vision: {
    headingLine1: 'From an',
    headingLine1Em: 'event',
    headingLine1End: 'to a',
    headingLine2Em: 'culture.',
    body:
      "For years, mission was the thing the church did on a Saturday morning. We're trying to be something different — a people whose week is shaped by the welfare of the place we live.",
    fromLabel: 'From',
    fromText: 'Event-based outreach',
    toLabel: 'To',
    toText: 'Mission as culture',
  },
};
