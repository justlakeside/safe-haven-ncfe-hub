import React, { useState, useEffect } from 'react';
import {
  Home, Building2, ShieldCheck, FileLock2, GraduationCap, UserCog,
  Calendar, ClipboardCheck, Folder, User, LogOut
} from 'lucide-react';
import { supabase, audit } from './lib/supabase.js';
import { palette, fontStack } from './lib/design.js';
import { content } from './content.js';
import { LoadingFull } from './components/UI.jsx';
import { SignIn, ForgotPassword, SetNewPassword } from './views/Auth.jsx';
import {
  Dashboard, CentreDetails, EqaCriteria, Policies, Learners, Staff,
  ExamSessions, IQA, GeneralDocs, Account
} from './views/Views.jsx';

const NAV = [
  { id: 'dashboard', label: content.nav.dashboard, icon: Home },
  { id: 'centre', label: content.nav.centre, icon: Building2 },
  { id: 'eqa', label: content.nav.eqa, icon: ShieldCheck },
  { id: 'policies', label: content.nav.policies, icon: FileLock2 },
  { id: 'learners', label: content.nav.learners, icon: GraduationCap },
  { id: 'staff', label: content.nav.staff, icon: UserCog },
  { id: 'exams', label: content.nav.exams, icon: Calendar },
  { id: 'iqa', label: content.nav.iqa, icon: ClipboardCheck },
  { id: 'docs', label: content.nav.docs, icon: Folder },
  { id: 'account', label: content.nav.account, icon: User },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authView, setAuthView] = useState('signin'); // signin | forgot | reset
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    // Detect ?reset=1 in URL → user just clicked the reset email link
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === '1') {
      setAuthView('reset');
    }

    // Get current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });

    // Listen for auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (event === 'PASSWORD_RECOVERY') {
        setAuthView('reset');
      }
      if (event === 'SIGNED_OUT') {
        setAuthView('signin');
      }
    });

    return () => subscription?.subscription?.unsubscribe();
  }, []);

  const signOut = async () => {
    await audit('logout', 'auth', null);
    await supabase.auth.signOut();
    setView('dashboard');
  };

  if (!authReady) return <BootScreen />;

  // Password recovery flow (from email link)
  if (authView === 'reset') {
    return (
      <SetNewPassword
        onDone={() => {
          // Clean URL and return to app
          window.history.replaceState({}, '', window.location.pathname);
          setAuthView('signin');
        }}
      />
    );
  }

  // Not signed in
  if (!session) {
    if (authView === 'forgot') {
      return <ForgotPassword onBack={() => setAuthView('signin')} />;
    }
    return <SignIn onForgot={() => setAuthView('forgot')} />;
  }

  // Signed in — render shell
  return (
    <div style={{
      minHeight: '100vh',
      background: palette.parchment,
      fontFamily: fontStack.body,
      color: palette.ink,
      display: 'flex',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: ${palette.parchment}; }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: ${palette.parchmentDark}; }
        ::-webkit-scrollbar-thumb { background: ${palette.ash}; border-radius: 0; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{
        width: 240,
        background: palette.tealDeep,
        color: palette.parchment,
        padding: '32px 0',
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${palette.line}`,
      }}>
        <div style={{ padding: '0 24px 24px', borderBottom: `1px solid ${palette.line}` }}>
          <div style={{
            fontSize: 9,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: palette.gold,
            marginBottom: 6,
            fontFamily: fontStack.mono,
          }}>
            {content.brand.org}
          </div>
          <div style={{
            fontSize: 19,
            fontFamily: fontStack.display,
            fontWeight: 500,
            lineHeight: 1.15,
            color: palette.parchment,
          }}>
            {content.brand.appName}
          </div>
          <div style={{
            fontSize: 10,
            color: palette.goldSoft,
            marginTop: 8,
            fontStyle: 'italic',
            fontFamily: fontStack.body,
          }}>
            {content.brand.tagline}
          </div>
        </div>

        <nav style={{ padding: '20px 0', flex: 1, overflowY: 'auto' }}>
          {NAV.map(item => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                style={{
                  width: '100%',
                  background: active ? palette.teal : 'transparent',
                  border: 'none',
                  borderLeft: active ? `3px solid ${palette.gold}` : '3px solid transparent',
                  color: active ? palette.parchment : '#A8B7BD',
                  padding: '12px 24px',
                  fontSize: 11,
                  fontFamily: fontStack.mono,
                  fontWeight: active ? 700 : 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = palette.parchment; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#A8B7BD'; }}
              >
                <item.icon size={14} strokeWidth={1.75} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid ${palette.line}`,
          fontSize: 10,
          fontFamily: fontStack.mono,
        }}>
          <div style={{
            color: palette.goldSoft,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 6,
            fontSize: 9,
          }}>
            Signed in
          </div>
          <div style={{
            color: palette.parchment,
            fontSize: 11,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: 10,
          }}>
            {session.user.email}
          </div>
          <button
            onClick={signOut}
            style={{
              background: 'transparent',
              border: `1px solid ${palette.line}`,
              color: palette.goldSoft,
              padding: '7px 12px',
              fontSize: 10,
              fontFamily: fontStack.mono,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              borderRadius: 2,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = palette.gold;
              e.currentTarget.style.color = palette.gold;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = palette.line;
              e.currentTarget.style.color = palette.goldSoft;
            }}
          >
            <LogOut size={11} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: '48px 56px', maxWidth: '100%', overflow: 'hidden' }}>
        {view === 'dashboard' && <Dashboard setView={setView} />}
        {view === 'centre' && <CentreDetails />}
        {view === 'eqa' && <EqaCriteria />}
        {view === 'policies' && <Policies />}
        {view === 'learners' && <Learners />}
        {view === 'staff' && <Staff />}
        {view === 'exams' && <ExamSessions />}
        {view === 'iqa' && <IQA />}
        {view === 'docs' && <GeneralDocs />}
        {view === 'account' && <Account />}
      </main>
    </div>
  );
}

function BootScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${palette.tealDeep} 0%, ${palette.teal} 100%)`,
      fontFamily: fontStack.body,
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign: 'center', color: palette.parchment }}>
        <div style={{
          width: 36, height: 36,
          border: `2px solid rgba(245,239,228,0.2)`,
          borderTopColor: palette.gold,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 18px',
        }} />
        <div style={{
          fontSize: 10,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: palette.goldSoft,
          fontFamily: fontStack.mono,
        }}>
          {content.brand.org} {content.brand.appName}
        </div>
      </div>
    </div>
  );
}
