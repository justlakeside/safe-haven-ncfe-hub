import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Download, Trash2, Eye, AlertTriangle, FileImage, FileSpreadsheet, File as FileIcon } from 'lucide-react';
import { supabase, audit } from '../lib/supabase.js';
import { palette, fontStack, formatBytes, formatDateTime } from '../lib/design.js';
import { Button, Spinner, Empty } from './UI.jsx';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB per file
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv',
];

const fileIcon = (mime) => {
  if (!mime) return FileIcon;
  if (mime.startsWith('image/')) return FileImage;
  if (mime.includes('sheet') || mime.includes('csv')) return FileSpreadsheet;
  return FileText;
};

export default function DocumentManager({ category, parentId, parentTextId, title = 'Documents', compact = false }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const loadDocs = async () => {
    setLoading(true);
    let query = supabase.from('documents').select('*').eq('category', category).order('created_at', { ascending: false });
    if (parentId) query = query.eq('parent_id', parentId);
    if (parentTextId) query = query.eq('parent_text_id', parentTextId);
    const { data, error } = await query;
    if (error) setError(error.message);
    else setDocs(data || []);
    setLoading(false);
  };

  useEffect(() => { loadDocs(); }, [category, parentId, parentTextId]);

  const handleFiles = async (files) => {
    setError('');
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" is too large (${formatBytes(file.size)}). Max ${formatBytes(MAX_FILE_SIZE)} per file.`);
        continue;
      }
      if (file.type && !ALLOWED_TYPES.includes(file.type)) {
        const ok = window.confirm(`"${file.name}" is type ${file.type}, which isn't in the standard allow-list. Upload anyway?`);
        if (!ok) continue;
      }
      await uploadOne(file);
    }
    await loadDocs();
  };

  const uploadOne = async (file) => {
    setUploading(true); setProgress(0);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const safeName = file.name.replace(/[^\w.\- ]/g, '_');
      const path = `${category}/${parentId || parentTextId || 'general'}/${Date.now()}_${safeName}`;
      const { error: uploadError } = await supabase.storage.from('documents').upload(path, file, {
        cacheControl: '3600', upsert: false, contentType: file.type || 'application/octet-stream',
      });
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('documents').insert({
        category, parent_id: parentId || null, parent_text_id: parentTextId || null,
        title: file.name, file_path: path, file_name: file.name,
        file_size: file.size, mime_type: file.type || null, uploaded_by: user?.id,
      });
      if (dbError) {
        // Roll back storage upload if DB insert failed
        await supabase.storage.from('documents').remove([path]);
        throw dbError;
      }
      await audit('upload', 'document', null, { file_name: file.name, category, size: file.size });
      setProgress(100);
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  };

  const downloadDoc = async (doc) => {
    try {
      const { data, error } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 60);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
      await audit('download', 'document', doc.id, { file_name: doc.file_name });
    } catch (err) {
      setError(`Download failed: ${err.message}`);
    }
  };

  const deleteDoc = async (doc) => {
    if (!window.confirm(`Delete "${doc.file_name}"? This cannot be undone.`)) return;
    try {
      await supabase.storage.from('documents').remove([doc.file_path]);
      await supabase.from('documents').delete().eq('id', doc.id);
      await audit('delete', 'document', doc.id, { file_name: doc.file_name });
      await loadDocs();
    } catch (err) {
      setError(`Delete failed: ${err.message}`);
    }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div>
      {!compact && (
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: palette.gold, fontFamily: fontStack.mono, marginBottom: 10 }}>{title}</div>
      )}

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? palette.gold : palette.ash}`,
          background: dragOver ? '#FFFCEC' : '#FFFDF7',
          padding: '20px', borderRadius: 2, textAlign: 'center', cursor: uploading ? 'wait' : 'pointer',
          marginBottom: 14, transition: 'all 0.15s',
        }}
      >
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <Spinner size={20} />
            <div style={{ fontSize: 11, color: palette.teal, fontFamily: fontStack.mono, letterSpacing: '0.1em' }}>Uploading…</div>
          </div>
        ) : (
          <>
            <Upload size={20} color={palette.teal} strokeWidth={1.5} style={{ marginBottom: 6 }} />
            <div style={{ fontSize: 12, color: palette.ink, fontFamily: fontStack.body, marginBottom: 4 }}>
              <strong style={{ color: palette.teal }}>Click to upload</strong> or drag files here
            </div>
            <div style={{ fontSize: 10, color: palette.ash, fontFamily: fontStack.mono, letterSpacing: '0.05em' }}>
              PDF, Word, Excel, Images · Max 25 MB per file
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={e => { handleFiles(Array.from(e.target.files)); e.target.value = ''; }}
        />
      </div>

      {error && (
        <div style={{ padding: '10px 12px', background: '#FBE9E4', borderLeft: `3px solid ${palette.rust}`, color: palette.rust, fontSize: 12, marginBottom: 12, fontFamily: fontStack.body }}>
          <AlertTriangle size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', color: palette.rust, cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 20, textAlign: 'center' }}><Spinner size={18} /></div>
      ) : docs.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', fontSize: 12, color: palette.ash, fontStyle: 'italic', fontFamily: fontStack.body }}>
          No documents uploaded yet.
        </div>
      ) : (
        <div style={{ background: palette.parchment, borderRadius: 2 }}>
          {docs.map((doc, i) => {
            const Icon = fileIcon(doc.mime_type);
            return (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                background: i % 2 === 0 ? palette.parchment : '#FFFDF7',
                borderBottom: i < docs.length - 1 ? `1px solid ${palette.parchmentDark}` : 'none',
              }}>
                <Icon size={18} color={palette.teal} strokeWidth={1.5} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: palette.ink, fontFamily: fontStack.body, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.file_name}</div>
                  <div style={{ fontSize: 10, color: palette.ash, fontFamily: fontStack.mono, letterSpacing: '0.05em', marginTop: 2 }}>
                    {formatBytes(doc.file_size)} · {formatDateTime(doc.created_at)}
                  </div>
                </div>
                <button onClick={() => downloadDoc(doc)} title="Download / view" style={{ background: 'none', border: 'none', color: palette.teal, cursor: 'pointer', padding: 6 }}><Download size={14} /></button>
                <button onClick={() => deleteDoc(doc)} title="Delete" style={{ background: 'none', border: 'none', color: palette.rust, cursor: 'pointer', padding: 6 }}><Trash2 size={14} /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
