export const palette = {
  ink: '#0B1D24',
  teal: '#000000',
  tealDeep: '#000000',
  gold: '#B8893C',
  goldSoft: '#D4A95B',
  parchment: '#F5EFE4',
  parchmentDark: '#EBE3D3',
  rust: '#A54826',
  sage: '#5C6B4A',
  ash: '#8B8578',
  line: '#2A5862',
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
