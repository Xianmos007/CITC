// ============================================================
// PAGE TITLES & SHARE PREVIEWS
// Used by each page's <Seo> tag in the browser, and by
// scripts/prerender.mjs at build time so links shared on social
// media and in texts show the right title and description.
// ============================================================

export const siteUrl = 'https://thechurchinthecity.org';
export const defaultImage = `${siteUrl}/og-default.jpg?v=2`;
export const siteName = 'Church in the City';

const defaultDescription =
  'A collaborative initiative of churches working together to love and serve our city.';

export const pageMeta = {
  '/': {
    title: 'Church in the City',
    description: defaultDescription,
  },
  '/who': {
    title: 'Who we are · Church in the City',
    description:
      'A network of local churches in Titusville, Florida, seeking the welfare of the city together.',
  },
  '/partners': {
    title: 'Partners · Church in the City',
    description:
      'The Titusville ministries we serve alongside: food pantries, family services, and youth programs.',
  },
  '/volunteer': {
    title: 'Find a need · Church in the City',
    description:
      'Small, specific ways to serve in Titusville this week. Pick one, sign up, and show up Saturday.',
  },
  '/gallery': {
    title: 'The Saturdays · Church in the City',
    description: 'Photos from Saturdays serving across Titusville with our partner ministries.',
  },
  '/blog': {
    title: 'Field notes · Church in the City',
    description: 'Stories, reflections, and updates from churches working together across our city.',
  },
};
