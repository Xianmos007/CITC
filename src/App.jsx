import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { MetaBar, SiteNav, Footer } from './components/Chrome.jsx';
import { Seo } from './components/Seo.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { WhoPage } from './pages/WhoPage.jsx';
import { PartnersPage } from './pages/PartnersPage.jsx';
import { BlogIndex } from './pages/BlogIndex.jsx';
import { BlogPost } from './pages/BlogPost.jsx';
import { GalleryPage } from './pages/GalleryPage.jsx';
import { VolunteerPage } from './pages/volunteer/VolunteerPage.jsx';
import { OppModal } from './pages/volunteer/OppModal.jsx';
import { useContent } from './hooks/useContent.js';

// The admin panel is its own bundle, loaded only at #admin.
const AdminPage = lazy(() =>
  import('./pages/admin/AdminPage.jsx').then((m) => ({ default: m.AdminPage }))
);

// /volunteer and /volunteer/<id> are the same page (the id just opens the
// modal), so they count as one place for scroll-to-top.
const scrollKey = (pathname) => pathname.replace(/^\/volunteer\/.+$/, '/volunteer');

export default function App() {
  const location = useLocation();

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
  const content = useContent();

  // Scroll to top when the page changes — but not when a need's modal
  // opens or closes on top of the volunteer page.
  const lastScrollKey = useRef(scrollKey(location.pathname));
  useEffect(() => {
    const key = scrollKey(location.pathname);
    if (key !== lastScrollKey.current) {
      lastScrollKey.current = key;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  // Admin panel renders standalone — no public chrome.
  if (isAdmin) {
    return (
      <Suspense fallback={null}>
        <AdminPage />
      </Suspense>
    );
  }

  const { opportunities, partners, galleryPhotos, galleryCategories, loading } = content;

  return (
    <Routes>
      <Route element={<PublicFrame />}>
        <Route
          index
          element={<HomePage opportunities={opportunities} partners={partners} loading={loading} />}
        />
        <Route path="who" element={<WhoPage partners={partners} />} />
        <Route path="partners" element={<PartnersPage partners={partners} loading={loading} />} />
        {/* One route with an optional id, so the list stays mounted (and
            keeps its filters) while a need's modal opens and closes. */}
        <Route
          path="volunteer/:oppId?"
          element={<VolunteerRoute opportunities={opportunities} loading={loading} />}
        />
        <Route
          path="gallery"
          element={<GalleryPage photos={galleryPhotos} categories={galleryCategories} />}
        />
        <Route path="blog" element={<BlogIndex />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/admin" element={<Navigate to="/#admin" replace />} />
    </Routes>
  );
}

function PublicFrame() {
  return (
    <>
      <MetaBar />
      <SiteNav />
      <Outlet />
      <Footer />
    </>
  );
}

function VolunteerRoute({ opportunities, loading }) {
  const { oppId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Opened from a card on this site: closing goes back to where the
  // visitor was. Arrived from a shared link: closing lands on the list.
  const close = () => {
    if (location.state?.fromSite) navigate(-1);
    else navigate('/volunteer', { replace: true });
  };

  useEffect(() => {
    if (!oppId) return undefined;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
    // close() only reads location state, which changes with oppId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oppId]);

  return (
    <>
      <VolunteerPage opportunities={opportunities} loading={loading} />
      {oppId && (
        <OppModal
          key={oppId}
          oppId={oppId}
          opportunities={opportunities}
          loading={loading}
          close={close}
        />
      )}
    </>
  );
}

function NotFound() {
  return (
    <div className="page">
      <Seo title="Page not found · Church in the City" />
      <section className="page-hero">
        <div className="container">
          <span className="label">Not found</span>
          <h1>
            This page <em>isn&rsquo;t here.</em>
          </h1>
          <p className="sub">The link may be old, or the address mistyped.</p>
          <div className="hero-ctas" style={{ marginTop: 32 }}>
            <Link className="btn btn-primary" to="/">
              Go home <span className="arrow">→</span>
            </Link>
            <Link className="btn btn-ghost" to="/volunteer">
              Find a need
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
