import { useState, useEffect } from 'react';
import { MetaBar, SiteNav, Footer } from './components/Chrome.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { WhoPage } from './pages/WhoPage.jsx';
import { PartnersPage } from './pages/PartnersPage.jsx';
import { BlogPage } from './pages/BlogPage.jsx';
import { GalleryPage } from './pages/GalleryPage.jsx';
import { VolunteerPage } from './pages/volunteer/VolunteerPage.jsx';
import { OppModal } from './pages/volunteer/OppModal.jsx';

export default function App() {
  const [page, setPage] = useState('home');
  const [oppId, setOppId] = useState(null);

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

  return (
    <div>
      <MetaBar />
      <SiteNav page={page} setPage={setPage} />
      {page === 'home' && <HomePage setPage={setPage} openOpp={openOpp} />}
      {page === 'who' && <WhoPage setPage={setPage} />}
      {page === 'partners' && <PartnersPage />}
      {page === 'volunteer' && <VolunteerPage openOpp={openOpp} />}
      {page === 'blog' && <BlogPage />}
      {page === 'gallery' && <GalleryPage setPage={setPage} />}
      <Footer setPage={setPage} />
      {oppId && <OppModal oppId={oppId} close={() => setOppId(null)} />}
    </div>
  );
}
