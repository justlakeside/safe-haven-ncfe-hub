import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, AlertTriangle, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase, audit } from '../lib/supabase.js';
import { palette, fontStack } from '../lib/design.js';
import { content } from '../content.js';
import { Field, Input, Spinner } from '../components/UI.jsx';

const AuthShell = ({ subtitle, children }) => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: `linear-gradient(135deg, ${palette.tealDeep} 0%, ${palette.teal} 100%)`,
    fontFamily: fontStack.body, padding: 20, position: 'relative', overflow: 'hidden',
  }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; } body { margin: 0; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
    <div style={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, border: `1px solid ${palette.gold}`, opacity: 0.15, borderRadius: '50%' }} />
    <div style={{ position: 'absolute', bottom: -100, left: -100, width: 300, height: 300, border: `1px solid ${palette.gold}`, opacity: 0.2, borderRadius: '50%' }} />

    <div style={{
      background: palette.parchment, padding: '48px 44px', maxWidth: 440, width: '100%',
      borderTop: `4px solid ${palette.gold}`, borderRadius: 2,
      boxShadow: '0 30px 80px rgba(0,0,0,0.4)', position: 'relative', zIndex: 1,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: palette.tealDeep, borderRadius: '50%', marginBottom: 16, border: `2px solid ${palette.gold}` }}>
          <Lock size={22} color={palette.gold} strokeWidth={1.75} />
        </div>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: palette.gold, marginBottom: 8, fontFamily: fontStack.mono }}>{content.brand.org}</div>
        <h1 style={{ margin: 0, fontSize: 28, fontFamily: fontStack.display, fontWeight: 500, color: palette.ink, lineHeight: 1.15 }}>{content.brand.appName}</h1>
        <p style={{ margin: '10px 0 0', fontSize: 12, color: palette.ash, fontStyle: 'italic' }}>{subtitle}</p>
      </div>
      {children}
    </div>
  </div>
);

const submitBtn = (busy) => ({
  width: '100%', padding: '13px', background: palette.teal, color: palette.parchment,
  border: 'none', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
  textTransform: 'uppercase', cursor: busy ? 'wait' : 'pointer',
  fontFamily: fontStack.mono, borderRadius: 2,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  opacity: busy ? 0.6 : 1, transition: 'opacity 0.15s',
});

const linkBtn = {
  display: 'block', margin: '18px auto 0', background: 'none', border: 'none',
  color: palette.ash, fontSize: 11, fontStyle: 'italic', cursor: 'pointer',
  fontFamily: fontStack.body, textDecoration: 'underline',
};

// ----------------------------------------------------------------------------
// SIGN IN
// ----------------------------------------------------------------------------
export const SignIn = ({ onForgot }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message);
    else { audit('login', 'auth', null, { email }); }
  };

  return (
    <AuthShell subtitle={content.signIn.subtitle}>
      <form onSubmit={handleSubmit}>
        <Field label="Email"><Input type="email" value={email} onChange={e => setEmail(e.target.value)} autoFocus required autoComplete="email" /></Field>
        <Field label="Password"><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /></Field>
        {error && (
          <div style={{ padding: '10px 12px', background: '#FBE9E4', borderLeft: `3px solid ${palette.rust}`, color: palette.rust, fontSize: 12, marginBottom: 14 }}>
            <AlertTriangle size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />{error}
          </div>
        )}
        <button type="submit" disabled={busy} style={submitBtn(busy)}>
          {busy ? <Spinner size={13} color={palette.parchment} /> : <KeyRound size={13} />}
          {busy ? 'Signing in…' : 'Sign In'}
        </button>
        <button type="button" onClick={onForgot} style={linkBtn}>Forgotten password?</button>
      </form>
      <div style={{ marginTop: 28, paddingTop: 16, borderTop: `1px solid ${palette.parchmentDark}`, fontSize: 10, color: palette.ash, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.5 }}>
        {content.signIn.footer}
      </div>
    </AuthShell>
  );
};

// ----------------------------------------------------------------------------
// FORGOT PASSWORD — sends reset email
// ----------------------------------------------------------------------------
export const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/?reset=1`,
    });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <AuthShell subtitle="Reset your password">
      {sent ? (
        <div style={{ textAlign: 'center' }}>
          <CheckCircle2 size={36} color={palette.sage} strokeWidth={1.5} style={{ marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontFamily: fontStack.display, color: palette.ink, marginBottom: 8 }}>Check your email</div>
          <div style={{ fontSize: 12, color: palette.ash, fontFamily: fontStack.body, lineHeight: 1.5, marginBottom: 24 }}>
            We've sent a password reset link to <strong>{email}</strong>. The link expires in 1 hour.
          </div>
          <button type="button" onClick={onBack} style={{ ...submitBtn(false), background: 'transparent', color: palette.teal, border: `1px solid ${palette.teal}` }}>
            <ArrowLeft size={13} /> Back to sign in
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Field label="Email address" hint="We'll email you a link to set a new password">
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} autoFocus required />
          </Field>
          {error && (
            <div style={{ padding: '10px 12px', background: '#FBE9E4', borderLeft: `3px solid ${palette.rust}`, color: palette.rust, fontSize: 12, marginBottom: 14 }}>
              <AlertTriangle size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />{error}
            </div>
          )}
          <button type="submit" disabled={busy} style={submitBtn(busy)}>
            {busy ? <Spinner size={13} color={palette.parchment} /> : <Mail size={13} />}
            {busy ? 'Sending…' : 'Send Reset Link'}
          </button>
          <button type="button" onClick={onBack} style={linkBtn}>← Back to sign in</button>
        </form>
      )}
    </AuthShell>
  );
};

// ----------------------------------------------------------------------------
// SET NEW PASSWORD — used after clicking the reset link
// ----------------------------------------------------------------------------
export const SetNewPassword = ({ onDone }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (password.length < 10) { setError('Password must be at least 10 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(error.message);
    else { audit('password_reset', 'auth', null); onDone(); }
  };

  return (
    <AuthShell subtitle="Choose a new password">
      <form onSubmit={handleSubmit}>
        <Field label="New password" hint="At least 10 characters. Use a password manager.">
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} autoFocus required autoComplete="new-password" />
        </Field>
        <Field label="Confirm new password">
          <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
        </Field>
        {error && (
          <div style={{ padding: '10px 12px', background: '#FBE9E4', borderLeft: `3px solid ${palette.rust}`, color: palette.rust, fontSize: 12, marginBottom: 14 }}>
            <AlertTriangle size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />{error}
          </div>
        )}
        <button type="submit" disabled={busy} style={submitBtn(busy)}>
          {busy ? <Spinner size={13} color={palette.parchment} /> : <KeyRound size={13} />}
          {busy ? 'Saving…' : 'Set Password & Continue'}
        </button>
      </form>
    </AuthShell>
  );
};
