import { useState, useEffect } from 'react';
import { MetaBar, SiteNav, Footer } from './components/Chrome.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { WhoPage } from './pages/WhoPage.jsx';
import { PartnersPage } from './pages/PartnersPage.jsx';
import { BlogPage } from './pages/BlogPage.jsx';
import { GalleryPage } from './pages/GalleryPage.jsx';
import { VolunteerPage } from './pages/volunteer/VolunteerPage.jsx';
import { OppModal } from './pages/volunteer/OppModal.jsx';
import { AdminPage } from './pages/AdminPage.jsx';
import { useContent } from './hooks/useContent.js';

export default function App() {
  const [page, setPage] = useState('home');
  const [oppId, setOppId] = useState(null);

  // Admin panel lives at #admin — not linked in the public nav, but
  // bookmarkable. We watch the hash so navigating to/from it works
  // without a full page reload.
  const [isAdmin, setIsAdmin] = useState(
    () => typeof window !== 'undefined' && window.location.hash === '#admin'
  );
  useEffect(() => {
    const onHash = () => setIsAdmin(window.location.hash === '#admin');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Load opportunities + partners from the database once, shared by all
  // pages. Falls back to bundled static data if the DB is unreachable.
  const { opportunities, partners, galleryPhotos, galleryCategories, loading } = useContent();

  // Reset scroll on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);

  // Close modal on Esc
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOppId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = oppId ? 'hidden' : '';
  }, [oppId]);

  const openOpp = (id) => setOppId(id);

  // Admin panel renders standalone — no public chrome, no content load.
  if (isAdmin) return <AdminPage />;

  return (
    <div>
      <MetaBar />
      <SiteNav page={page} setPage={setPage} />
      {page === 'home' && (
        <HomePage setPage={setPage} openOpp={openOpp} opportunities={opportunities} />
      )}
      {page === 'who' && <WhoPage setPage={setPage} />}
      {page === 'partners' && <PartnersPage partners={partners} loading={loading} />}
      {page === 'volunteer' && (
        <VolunteerPage openOpp={openOpp} opportunities={opportunities} loading={loading} />
      )}
      {page === 'blog' && <BlogPage />}
      {page === "gallery" && (
        <GalleryPage
          setPage={setPage}
          photos={galleryPhotos}
          categories={galleryCategories}
        />
      )}
      <Footer setPage={setPage} />
      {oppId && (
        <OppModal
          oppId={oppId}
          opportunities={opportunities}
          close={() => setOppId(null)}
        />
      )}
    </div>
  );
}
