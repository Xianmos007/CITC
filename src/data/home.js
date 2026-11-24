// ============================================================
// HOME PAGE CONTENT
// Edit the words, scripture, stats, partners, etc. below.
// ============================================================

export const home = {
  hero: {
    eyebrow: 'Local churches serving Titusville, Florida',
    // The headline animates word by word. One word is highlighted in gold.
    headlineWords: ['Seek', 'the', 'welfare', 'of', 'the', 'city.'],
    goldWord: 'welfare',
    scripture:
      '"Seek the welfare of the city where I have sent you, and pray to the Lord on its behalf, for in its welfare you will find your welfare."',
    scriptureAttribution: '— Jeremiah 29:7',
    photoLabel: 'Photo · Saturday on Garden St.',
    // The numbers are counted live from the partners list (active ministry
    // partners; church partners). Only the labels are set here.
    statLabels: {
      ministries: 'Ministry partners',
      congregations: 'Local congregations',
    },
  },

  howItWorks: {
    headingLine1: 'How a Saturday',
    headingLine2Em: 'comes together.',
    sub:
      "Local ministries post what they need on this site, and people from our partner churches sign up to help. You don't need an account or an app.",
    steps: [
      {
        num: '01',
        label: 'Partners',
        tag: 'POST',
        heading: 'A ministry posts a need',
        body:
          'A ministry posts something it needs help with, like a yard cleanup, a Saturday meal or a tutoring shift.',
      },
      {
        num: '02',
        label: 'Neighbors',
        tag: 'BROWSE',
        heading: 'Neighbors sign up',
        body: 'You look through the open needs and sign up for one that fits your week.',
      },
      {
        num: '03',
        label: 'Saturday',
        tag: 'SERVE',
        heading: 'We show up on Saturday',
        body:
          'You show up and serve. We hope you come back, so the same people keep serving in the same places.',
      },
    ],
  },

  featuredPartners: {
    headingLine1: 'Where the church',
    headingLine2: 'is',
    headingLine2Em: 'already',
    headingLine2End: 'at work.',
    sub:
      "We don't run programs of our own. We send volunteers to the ministries that already serve Titusville and try to be help they can count on.",
    // The cards themselves are the first three Active ministry partners,
    // in display order — edit partners in the admin panel.
  },


  vision: {
    headingLine1: 'From an',
    headingLine1Em: 'event',
    headingLine1End: 'to a',
    headingLine2Em: 'culture.',
    body:
      "For years, mission was something the church did on a Saturday morning. We want it to shape our whole week, so that caring for Titusville becomes part of how we live.",
    fromLabel: 'From',
    fromText: 'Event-based outreach',
    toLabel: 'To',
    toText: 'Mission as culture',
  },
};
