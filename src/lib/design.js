// ============================================================================
//  COLOURS  — change the app's look here
// ============================================================================
//  Each colour is a hex code (the # value in quotes). To change a colour,
//  replace only the part inside the 'quotes', e.g. change '#14464F' to '#1A5276'.
//  Pick new hex codes from a colour picker like https://htmlcolorcodes.com
//  Save / commit, wait a minute, then hard-refresh the site (Cmd + Shift + R).
//
//  The comment after each line tells you where that colour shows up.
// ============================================================================
export const palette = {
  ink:           '#0B1D24',  // main dark text colour (almost-black)
  teal:          '#14464F',  // primary buttons, the highlighted menu item, "Sign In" button
  tealDeep:      '#0E3239',  // darkest colour — the sidebar background, table header rows, sign-in background
  gold:          '#B8893C',  // gold accents — the small UPPERCASE labels, borders, the lock icon
  goldSoft:      '#D4A95B',  // lighter gold — text in the sidebar footer, the big readiness % number
  parchment:     '#F5EFE4',  // the main cream page background
  parchmentDark: '#EBE3D3',  // slightly darker cream — lines, dividers, alternating table rows
  rust:          '#A54826',  // red — error messages, delete buttons, "Not Met" status
  sage:          '#5C6B4A',  // green — success messages, "Met" status, ticks
  ash:           '#8B8578',  // grey — faded/secondary text, placeholder text in boxes
  line:          '#2A5862',  // the thin divider lines inside the dark sidebar
};

export const fontStack = {
  body: "'Lora', Georgia, serif",
  display: "'Cormorant Garamond', Georgia, serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
};

export const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const formatDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

export const formatDateTime = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return d; }
};
