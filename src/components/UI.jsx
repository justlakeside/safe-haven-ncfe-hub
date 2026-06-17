import React, { useState, useEffect } from 'react';
import { palette, fontStack } from '../lib/design.js';

// Detects a phone-sized screen so layouts can adapt.
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

export const Pill = ({ children, tone = 'neutral' }) => {
  const tones = {
    neutral: { bg: palette.parchmentDark, fg: palette.ink },
    teal: { bg: palette.teal, fg: palette.parchment },
    gold: { bg: palette.gold, fg: '#fff' },
    rust: { bg: palette.rust, fg: '#fff' },
    sage: { bg: palette.sage, fg: '#fff' },
    ash: { bg: '#E8E3D6', fg: palette.ash },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', fontSize: 10, fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap',
      background: t.bg, color: t.fg, borderRadius: 2, fontFamily: fontStack.mono,
    }}>{children}</span>
  );
};

export const Button = ({ children, onClick, variant = 'primary', size = 'md', icon: Icon, type = 'button', disabled, ...rest }) => {
  const variants = {
    primary: { bg: palette.teal, fg: palette.parchment, border: palette.teal },
    gold: { bg: palette.gold, fg: '#fff', border: palette.gold },
    ghost: { bg: 'transparent', fg: palette.teal, border: palette.teal },
    danger: { bg: 'transparent', fg: palette.rust, border: palette.rust },
  };
  const v = variants[variant];
  const sz = size === 'sm' ? { padding: '6px 12px', fontSize: 11 } : { padding: '10px 18px', fontSize: 12 };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...sz, background: v.bg, color: v.fg, border: `1px solid ${v.border}`,
      fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
      cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: fontStack.mono,
      display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 2,
      transition: 'all 0.15s ease', opacity: disabled ? 0.5 : 1,
    }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 3px 0 rgba(11,29,36,0.15)'; } }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    {...rest}>
      {Icon && <Icon size={size === 'sm' ? 12 : 14} strokeWidth={2} />}
      {children}
    </button>
  );
};

export const Field = ({ label, children, hint }) => (
  <label style={{ display: 'block', marginBottom: 14 }}>
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: palette.teal, marginBottom: 6, fontFamily: fontStack.mono }}>{label}</div>
    {children}
    {hint && <div style={{ fontSize: 11, color: palette.ash, marginTop: 4, fontStyle: 'italic' }}>{hint}</div>}
  </label>
);

export const Input = (props) => (
  <input {...props} style={{
    width: '100%', padding: '9px 12px', border: `1px solid ${palette.ash}`,
    background: '#FFFDF7', fontSize: 13, fontFamily: fontStack.body,
    color: palette.ink, borderRadius: 2, outline: 'none', ...(props.style || {}),
  }}
  onFocus={e => { e.target.style.borderColor = palette.teal; e.target.style.background = '#fff'; }}
  onBlur={e => { e.target.style.borderColor = palette.ash; e.target.style.background = '#FFFDF7'; }} />
);

export const Textarea = (props) => (
  <textarea {...props} style={{
    width: '100%', padding: '9px 12px', border: `1px solid ${palette.ash}`,
    background: '#FFFDF7', fontSize: 13, fontFamily: fontStack.body,
    color: palette.ink, borderRadius: 2, outline: 'none', resize: 'vertical',
    minHeight: 70, ...(props.style || {}),
  }} />
);

export const Select = (props) => (
  <select {...props} style={{
    width: '100%', padding: '9px 12px', border: `1px solid ${palette.ash}`,
    background: '#FFFDF7', fontSize: 13, fontFamily: fontStack.body,
    color: palette.ink, borderRadius: 2, outline: 'none', ...(props.style || {}),
  }} />
);

export const Modal = ({ open, onClose, title, children, width = 640 }) => {
  if (!open) return null;
  return (
    <div className="sh-modal-overlay" style={{
      position: 'fixed', inset: 0, background: 'rgba(11,29,36,0.55)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '60px 20px', zIndex: 100, overflowY: 'auto',
    }} onClick={onClose}>
      <div style={{
        background: palette.parchment, width: '100%', maxWidth: width,
        borderRadius: 2, boxShadow: '0 20px 60px rgba(11,29,36,0.4)',
        borderTop: `4px solid ${palette.gold}`,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 28px', borderBottom: `1px solid ${palette.parchmentDark}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontFamily: fontStack.display, fontWeight: 600, color: palette.ink, letterSpacing: '0.02em' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: palette.ash, lineHeight: 1, padding: 4 }}>×</button>
        </div>
        <div style={{ padding: 28 }}>{children}</div>
      </div>
    </div>
  );
};

export const SectionHeader = ({ eyebrow, title, description, actions }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: 28, paddingBottom: 16, borderBottom: `1px solid ${palette.parchmentDark}`,
    gap: 20, flexWrap: 'wrap',
  }}>
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: palette.gold, marginBottom: 8, fontFamily: fontStack.mono }}>{eyebrow}</div>
      <h2 className="sh-page-title" style={{ margin: 0, fontSize: 32, fontFamily: fontStack.display, fontWeight: 500, color: palette.ink, letterSpacing: '-0.01em', lineHeight: 1.1 }}>{title}</h2>
      {description && <p style={{ margin: '10px 0 0', fontSize: 14, color: palette.ink, opacity: 0.75, fontFamily: fontStack.body, maxWidth: 720 }}>{description}</p>}
    </div>
    {actions && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>}
  </div>
);

export const Empty = ({ icon: Icon, title, hint }) => (
  <div style={{ padding: '60px 20px', textAlign: 'center', background: '#FFFDF7', border: `1px dashed ${palette.ash}`, borderRadius: 2 }}>
    {Icon && <Icon size={32} color={palette.ash} strokeWidth={1.25} style={{ marginBottom: 12 }} />}
    <div style={{ fontSize: 14, fontFamily: fontStack.display, color: palette.ink, fontWeight: 500, marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 12, color: palette.ash, fontStyle: 'italic' }}>{hint}</div>
  </div>
);

export const Spinner = ({ size = 24, color }) => (
  <div style={{
    width: size, height: size, border: `2px solid ${palette.parchmentDark}`,
    borderTopColor: color || palette.teal, borderRadius: '50%',
    animation: 'spin 0.8s linear infinite', display: 'inline-block',
  }} />
);

export const LoadingFull = ({ label = 'Loading…' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '80px 20px', gap: 16,
  }}>
    <Spinner size={28} />
    <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: palette.ash, fontFamily: fontStack.mono }}>{label}</div>
  </div>
);

export const Toast = ({ message, tone = 'sage', onClose }) => {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, background: palette[tone] || palette.teal,
      color: '#fff', padding: '12px 18px', fontSize: 12, fontFamily: fontStack.mono,
      letterSpacing: '0.06em', boxShadow: '0 6px 20px rgba(0,0,0,0.2)', zIndex: 200,
      borderRadius: 2, display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
    </div>
  );
};
