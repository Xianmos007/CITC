import { useState, useEffect } from 'react';
import '../../styles/admin.css';
import {
  getSession,
  onAuthChange,
  signIn,
  signOut,
} from '../../lib/admin.js';
import { isSupabaseReady } from '../../lib/supabase.js';
import { OpportunitiesView } from './OpportunitiesView.jsx';
import { PartnersView } from './PartnersView.jsx';
import { SignupsView } from './SignupsView.jsx';
import { GalleryAdminView } from './GalleryView.jsx';

// =====================================================================
// AdminPage — reachable at #admin. Not linked in the public nav.
// =====================================================================
export function AdminPage() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let unsub = () => {};
    getSession().then((s) => {
      setSession(s);
      setChecking(false);
    });
    unsub = onAuthChange((s) => setSession(s));
    return () => unsub();
  }, []);

  if (!isSupabaseReady) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <span className="eyebrow">Admin</span>
          <h1>Not configured</h1>
          <p className="lede">
            Supabase isn't connected in this build. Check the environment
            variables and reload.
          </p>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <span className="eyebrow">Admin</span>
          <h1>One moment…</h1>
        </div>
      </div>
    );
  }

  if (!session) return <LoginScreen />;
  return <Dashboard />;
}

// ---------------------------------------------------------------------
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await signIn(email, password);
      // onAuthChange in AdminPage will pick up the session.
    } catch (e) {
      setError(e.message || 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <span className="eyebrow">Church in the City</span>
        <h1>Admin sign-in</h1>
        <p className="lede">Manage opportunities, partners, and signups.</p>
        {error && <div className="admin-error">{error}</div>}
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            autoComplete="username"
            placeholder="you@thechurchinthecity.org"
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={busy}
          style={{ width: '100%', marginTop: 8 }}
        >
          {busy ? 'Signing in…' : 'Sign in'} <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
function Dashboard() {
  const [tab, setTab] = useState('opportunities');

  return (
    <div className="admin-shell">
      <div className="admin-bar">
        <div className="brand">
          Church in the <span>City</span> · Admin
        </div>
        <div className="admin-tabs">
          {[
            ['opportunities', 'Opportunities'],
            ['partners', 'Partners'],
            ['gallery', 'Gallery'],
            ['signups', 'Signups'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`admin-tab ${tab === key ? 'active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => signOut()}>
          Sign out
        </button>
      </div>

      <div className="admin-main">
        {tab === 'opportunities' && <OpportunitiesView />}
        {tab === 'partners' && <PartnersView />}
        {tab === 'gallery' && <GalleryAdminView />}
        {tab === 'signups' && <SignupsView />}
      </div>
    </div>
  );
}
