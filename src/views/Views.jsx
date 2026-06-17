import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck, GraduationCap, ClipboardCheck, FileLock2, Home, Plus, Search, AlertTriangle,
  CheckCircle2, Circle, FileText, UserCog, Calendar, Eye, ChevronRight, ChevronDown,
  Mail, Phone, Building2, MinusCircle, Folder, KeyRound, Trash2, User
} from 'lucide-react';
import { supabase, audit } from '../lib/supabase.js';
import { palette, fontStack, formatDate, formatDateTime } from '../lib/design.js';
import { content } from '../content.js';
import {
  Pill, Button, Field, Input, Textarea, Select, Modal, SectionHeader, Empty, Spinner, LoadingFull
} from '../components/UI.jsx';
import DocumentManager from '../components/DocumentManager.jsx';

// ============================================================================
// DASHBOARD
// ============================================================================
export const Dashboard = ({ setView }) => {
  const [stats, setStats] = useState(null);
  const [outstanding, setOutstanding] = useState([]);

  useEffect(() => {
    (async () => {
      const [criteria, learners, staff, policies, exams, iqa, contacts, docs] = await Promise.all([
        supabase.from('eqa_criteria').select('id, number, title, applicable, status').order('sort_order'),
        supabase.from('learners').select('id', { count: 'exact', head: true }),
        supabase.from('staff').select('id', { count: 'exact', head: true }),
        supabase.from('policies').select('id', { count: 'exact', head: true }),
        supabase.from('exam_sessions').select('id', { count: 'exact', head: true }),
        supabase.from('iqa_samples').select('id', { count: 'exact', head: true }),
        supabase.from('centre_contacts').select('id', { count: 'exact', head: true }),
        supabase.from('documents').select('id', { count: 'exact', head: true }),
      ]);
      const all = criteria.data || [];
      const applicable = all.filter(c => c.applicable);
      const met = applicable.filter(c => c.status === 'met').length;
      const pending = applicable.filter(c => c.status === 'pending').length;
      const notMet = applicable.filter(c => c.status === 'not_met').length;
      const na = all.filter(c => !c.applicable).length;
      setStats({
        readiness: Math.round((met / Math.max(applicable.length, 1)) * 100),
        met, pending, notMet, na, applicableTotal: applicable.length,
        learners: learners.count || 0, staff: staff.count || 0, policies: policies.count || 0,
        exams: exams.count || 0, iqa: iqa.count || 0, contacts: contacts.count || 0,
        docs: docs.count || 0,
      });
      setOutstanding(applicable.filter(c => c.status !== 'met').slice(0, 6));
    })();
  }, []);

  if (!stats) return <LoadingFull label="Loading dashboard…" />;

  const quickStats = [
    { label: 'Centre Contacts', value: stats.contacts, icon: User, view: 'centre' },
    { label: 'Learners', value: stats.learners, icon: GraduationCap, view: 'learners' },
    { label: 'Staff', value: stats.staff, icon: UserCog, view: 'staff' },
    { label: 'Policies', value: stats.policies, icon: FileLock2, view: 'policies' },
    { label: 'Exam Sessions', value: stats.exams, icon: Calendar, view: 'exams' },
    { label: 'IQA Samples', value: stats.iqa, icon: ClipboardCheck, view: 'iqa' },
    { label: 'Documents', value: stats.docs, icon: Folder, view: 'docs' },
  ];

  return (
    <div>
      <SectionHeader
        eyebrow={content.pages.dashboard.eyebrow}
        title={content.pages.dashboard.title}
        description={content.pages.dashboard.description}
      />

      <div style={{ background: `linear-gradient(135deg, ${palette.tealDeep} 0%, ${palette.teal} 100%)`, padding: '36px 40px', borderRadius: 2, marginBottom: 28, color: palette.parchment, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, border: `1px solid ${palette.gold}`, opacity: 0.2, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, border: `1px solid ${palette.gold}`, opacity: 0.3, borderRadius: '50%' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap', position: 'relative' }}>
          <div style={{ flex: '0 0 auto' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: palette.goldSoft, marginBottom: 10, fontFamily: fontStack.mono }}>Applicable Criteria Met</div>
            <div style={{ fontSize: 84, fontFamily: fontStack.display, fontWeight: 300, lineHeight: 1, color: palette.gold }}>
              {stats.readiness}<span style={{ fontSize: 32, color: palette.parchment, opacity: 0.6 }}>%</span>
            </div>
            <div style={{ fontSize: 11, color: palette.parchment, opacity: 0.7, marginTop: 6, fontFamily: fontStack.mono, letterSpacing: '0.08em' }}>
              {stats.met} of {stats.applicableTotal} applicable
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { label: 'Met', value: stats.met, color: palette.sage },
                { label: 'Pending', value: stats.pending, color: palette.goldSoft },
                { label: 'Not Met', value: stats.notMet, color: palette.rust },
                { label: 'N/A', value: stats.na, color: palette.parchment },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: palette.parchment, opacity: 0.7, marginBottom: 4, fontFamily: fontStack.mono }}>{s.label}</div>
                  <div style={{ fontSize: 30, fontFamily: fontStack.display, color: s.color, fontWeight: 500 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
        {quickStats.map(s => (
          <button key={s.label} onClick={() => setView(s.view)} style={{
            background: palette.parchment, border: `1px solid ${palette.parchmentDark}`,
            padding: '18px 20px', textAlign: 'left', cursor: 'pointer',
            borderRadius: 2, transition: 'all 0.15s ease', borderLeft: `3px solid ${palette.gold}`,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderLeftColor = palette.teal; }}
          onMouseLeave={e => { e.currentTarget.style.background = palette.parchment; e.currentTarget.style.borderLeftColor = palette.gold; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: palette.ash, fontFamily: fontStack.mono, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 30, fontFamily: fontStack.display, color: palette.ink, fontWeight: 500, lineHeight: 1 }}>{s.value}</div>
              </div>
              <s.icon size={17} color={palette.teal} strokeWidth={1.5} />
            </div>
          </button>
        ))}
      </div>

      <div>
        <h3 style={{ fontSize: 18, fontFamily: fontStack.display, color: palette.ink, fontWeight: 500, marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${palette.parchmentDark}` }}>Outstanding Applicable Criteria</h3>
        {outstanding.length === 0 ? (
          <Empty icon={CheckCircle2} title="All applicable criteria met" hint="Every applicable criterion is marked as met" />
        ) : outstanding.map(c => (
          <div key={c.id} onClick={() => setView('eqa')} style={{
            padding: '14px 18px', background: palette.parchment, marginBottom: 8,
            borderLeft: `3px solid ${c.status === 'not_met' ? palette.rust : palette.goldSoft}`,
            cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', transition: 'transform 0.1s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: palette.gold, fontFamily: fontStack.mono, letterSpacing: '0.1em', fontWeight: 700 }}>{c.number}</span>
                <Pill tone={c.status === 'not_met' ? 'rust' : 'gold'}>{c.status === 'not_met' ? 'Not met' : 'Pending'}</Pill>
              </div>
              <div style={{ fontSize: 13, fontFamily: fontStack.body, color: palette.ink, lineHeight: 1.4 }}>{c.title}</div>
            </div>
            <ChevronRight size={16} color={palette.ash} style={{ flexShrink: 0, marginLeft: 12 }} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// CENTRE DETAILS
// ============================================================================
export const CentreDetails = () => {
  const [centre, setCentre] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editingMeta, setEditingMeta] = useState(false);
  const [draftMeta, setDraftMeta] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [c, cn] = await Promise.all([
      supabase.from('centre_details').select('*').eq('id', 1).single(),
      supabase.from('centre_contacts').select('*').order('sort_order'),
    ]);
    setCentre(c.data); setContacts(cn.data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading || !centre) return <LoadingFull />;

  const saveMeta = async () => {
    const { error } = await supabase.from('centre_details').update({
      centre_name: draftMeta.centre_name, centre_email: draftMeta.centre_email,
      centre_phone: draftMeta.centre_phone, previous_action_plan: draftMeta.previous_action_plan,
      updated_at: new Date().toISOString(),
    }).eq('id', 1);
    if (!error) { await audit('update', 'centre_details', 1); setEditingMeta(false); load(); }
    else alert(error.message);
  };

  const saveContact = async () => {
    const payload = { role: editing.role, name: editing.name, email: editing.email, phone: editing.phone };
    if (editing.id && contacts.find(c => c.id === editing.id)) {
      await supabase.from('centre_contacts').update(payload).eq('id', editing.id);
      await audit('update', 'centre_contact', editing.id);
    } else {
      const { data } = await supabase.from('centre_contacts').insert(payload).select().single();
      await audit('create', 'centre_contact', data?.id);
    }
    setEditing(null); load();
  };

  const removeContact = async (id) => {
    if (!window.confirm('Remove this contact?')) return;
    await supabase.from('centre_contacts').delete().eq('id', id);
    await audit('delete', 'centre_contact', id);
    load();
  };

  return (
    <div>
      <SectionHeader
        eyebrow={content.pages.centre.eyebrow}
        title={content.pages.centre.title}
        description={content.pages.centre.description}
      />

      <div style={{ background: palette.parchment, padding: '24px 28px', marginBottom: 24, borderLeft: `3px solid ${palette.gold}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontFamily: fontStack.display, color: palette.ink, fontWeight: 500 }}>Centre Information</h3>
          {!editingMeta && <Button variant="ghost" size="sm" onClick={() => { setDraftMeta(centre); setEditingMeta(true); }}>Edit</Button>}
        </div>
        {editingMeta ? (
          <div>
            <Field label="Centre Name"><Input value={draftMeta.centre_name || ''} onChange={e => setDraftMeta({ ...draftMeta, centre_name: e.target.value })} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Centre Email"><Input value={draftMeta.centre_email || ''} onChange={e => setDraftMeta({ ...draftMeta, centre_email: e.target.value })} /></Field>
              <Field label="Centre Phone"><Input value={draftMeta.centre_phone || ''} onChange={e => setDraftMeta({ ...draftMeta, centre_phone: e.target.value })} /></Field>
            </div>
            <Field label="Previous Action Plan (Section 2)"><Textarea value={draftMeta.previous_action_plan || ''} onChange={e => setDraftMeta({ ...draftMeta, previous_action_plan: e.target.value })} /></Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="ghost" size="sm" onClick={() => setEditingMeta(false)}>Cancel</Button>
              <Button size="sm" onClick={saveMeta}>Save</Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: palette.ash, fontFamily: fontStack.mono, marginBottom: 4 }}>Centre Name</div>
              <div style={{ fontSize: 15, fontFamily: fontStack.body, color: palette.ink, lineHeight: 1.3 }}>{centre.centre_name}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: palette.ash, fontFamily: fontStack.mono, marginBottom: 4 }}>Email</div>
              <div style={{ fontSize: 13, fontFamily: fontStack.body, color: palette.ink, display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={12} color={palette.teal} /> {centre.centre_email}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: palette.ash, fontFamily: fontStack.mono, marginBottom: 4 }}>Phone</div>
              <div style={{ fontSize: 13, fontFamily: fontStack.body, color: palette.ink, display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={12} color={palette.teal} /> {centre.centre_phone}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: palette.ash, fontFamily: fontStack.mono, marginBottom: 4 }}>Previous Action Plan (Section 2)</div>
              <div style={{ fontSize: 13, fontFamily: fontStack.body, color: palette.ink, fontStyle: 'italic' }}>{centre.previous_action_plan}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontFamily: fontStack.display, color: palette.ink, fontWeight: 500 }}>Key Contacts</h3>
        <Button size="sm" icon={Plus} onClick={() => setEditing({ role: '', name: '', email: '', phone: '' })}>{content.buttons.addContact}</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {contacts.map(c => (
          <div key={c.id} style={{ background: palette.parchment, padding: '18px 20px', borderLeft: `3px solid ${palette.teal}`, borderRadius: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: palette.gold, fontFamily: fontStack.mono, fontWeight: 700 }}>{c.role}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setEditing(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.teal, padding: 2 }}><Eye size={13} /></button>
                <button onClick={() => removeContact(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.rust, padding: 2 }}><Trash2 size={13} /></button>
              </div>
            </div>
            <div style={{ fontSize: 16, fontFamily: fontStack.display, color: palette.ink, fontWeight: 500, marginBottom: 8 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: palette.ink, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={11} color={palette.ash} /> {c.email}</div>
            <div style={{ fontSize: 12, color: palette.ink, display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={11} color={palette.ash} /> {c.phone}</div>
          </div>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit contact' : 'New contact'}>
        {editing && (
          <div>
            <Field label="Role / position"><Input value={editing.role || ''} onChange={e => setEditing({ ...editing, role: e.target.value })} placeholder="e.g. Quality Assurance Manager" /></Field>
            <Field label="Full name"><Input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Email"><Input type="email" value={editing.email || ''} onChange={e => setEditing({ ...editing, email: e.target.value })} /></Field>
              <Field label="Phone"><Input value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} /></Field>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={saveContact}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ============================================================================
// EQA CRITERIA
// ============================================================================
const statusIcon = (status) => {
  if (status === 'met') return <CheckCircle2 size={16} color={palette.sage} strokeWidth={2} />;
  if (status === 'not_met') return <AlertTriangle size={16} color={palette.rust} strokeWidth={2} />;
  if (status === 'na') return <MinusCircle size={16} color={palette.ash} strokeWidth={2} />;
  return <Circle size={16} color={palette.goldSoft} strokeWidth={1.75} />;
};
const statusTone = (status) => ({ met: 'sage', not_met: 'rust', pending: 'gold', na: 'ash' }[status] || 'neutral');
const statusLabel = (status) => ({ met: 'Met', not_met: 'Not Met', pending: 'Pending', na: 'N/A' }[status] || status);

export const EqaCriteria = () => {
  const [criteria, setCriteria] = useState([]);
  const [evidence, setEvidence] = useState({});
  const [filter, setFilter] = useState('applicable');
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [c, e] = await Promise.all([
      supabase.from('eqa_criteria').select('*').order('sort_order'),
      supabase.from('eqa_evidence').select('*').order('sort_order'),
    ]);
    setCriteria(c.data || []);
    const grouped = {};
    (e.data || []).forEach(ev => { (grouped[ev.criterion_id] ||= []).push(ev); });
    setEvidence(grouped); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <LoadingFull />;

  const filtered = (() => {
    if (filter === 'all') return criteria;
    if (filter === 'applicable') return criteria.filter(c => c.applicable);
    if (filter === 'na') return criteria.filter(c => !c.applicable);
    return criteria.filter(c => c.applicable && c.status === filter);
  })();

  const updateCriterion = async (id, patch) => {
    await supabase.from('eqa_criteria').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
    await audit('update', 'eqa_criterion', id, patch);
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  };

  const updateEvidence = async (eid, patch) => {
    await supabase.from('eqa_evidence').update(patch).eq('id', eid);
    await audit('update', 'eqa_evidence', eid, patch);
    setEvidence(prev => {
      const next = { ...prev };
      for (const cid of Object.keys(next)) {
        next[cid] = next[cid].map(e => e.id === eid ? { ...e, ...patch } : e);
      }
      return next;
    });
  };

  return (
    <div>
      <SectionHeader
        eyebrow={content.pages.eqa.eyebrow}
        title={content.pages.eqa.title}
        description={content.pages.eqa.description}
        actions={
          <Select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 200 }}>
            <option value="applicable">Applicable only</option>
            <option value="all">All (incl. N/A)</option>
            <option value="pending">Pending</option>
            <option value="met">Met</option>
            <option value="not_met">Not Met</option>
            <option value="na">Not Applicable only</option>
          </Select>
        }
      />

      <div>
        {filtered.map(c => {
          const isOpen = !!expanded[c.id];
          const items = evidence[c.id] || [];
          return (
            <div key={c.id} style={{
              background: palette.parchment, marginBottom: 10, borderRadius: 2,
              borderLeft: `3px solid ${c.applicable ? (c.status === 'met' ? palette.sage : c.status === 'not_met' ? palette.rust : palette.gold) : palette.ash}`,
              overflow: 'hidden',
            }}>
              <button onClick={() => setExpanded({ ...expanded, [c.id]: !isOpen })} style={{
                width: '100%', padding: '14px 20px', background: 'transparent', border: 'none',
                cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
              }}>
                {statusIcon(c.status)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: palette.gold, fontFamily: fontStack.mono, letterSpacing: '0.08em' }}>{c.number}</span>
                    <Pill tone={statusTone(c.status)}>{statusLabel(c.status)}</Pill>
                    {!c.applicable && <Pill tone="ash">Not applicable</Pill>}
                    {c.applicable && items.length > 0 && (
                      <span style={{ fontSize: 10, color: palette.ash, fontFamily: fontStack.mono, letterSpacing: '0.08em' }}>
                        {items.filter(e => e.status === 'met').length}/{items.length} evidence items
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontFamily: fontStack.body, color: palette.ink, fontWeight: 500, lineHeight: 1.35 }}>{c.title}</div>
                </div>
                {isOpen ? <ChevronDown size={16} color={palette.ash} /> : <ChevronRight size={16} color={palette.ash} />}
              </button>

              {isOpen && (
                <div style={{ padding: '4px 20px 20px 50px', borderTop: `1px solid ${palette.parchmentDark}`, background: '#FFFDF7' }}>
                  <div style={{ fontSize: 12, color: palette.ink, fontFamily: fontStack.body, opacity: 0.85, marginTop: 14, marginBottom: 18, lineHeight: 1.55, fontStyle: 'italic' }}>
                    {c.summary}
                  </div>

                  {!c.applicable && c.evidence_statement && (
                    <div style={{ padding: '14px 16px', background: palette.parchment, borderLeft: `3px solid ${palette.ash}`, marginBottom: 18, fontSize: 12, fontFamily: fontStack.body, color: palette.ink, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: palette.ash, fontFamily: fontStack.mono, marginBottom: 8, fontWeight: 700 }}>Evidence Statement</div>
                      {c.evidence_statement}
                    </div>
                  )}

                  {c.applicable && (
                    <>
                      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
                        <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: palette.teal, fontFamily: fontStack.mono, fontWeight: 700 }}>Overall status</div>
                        <Select value={c.status} onChange={e => updateCriterion(c.id, { status: e.target.value })} style={{ width: 160 }}>
                          <option value="pending">Pending</option><option value="met">Met</option><option value="not_met">Not Met</option>
                        </Select>
                      </div>

                      {items.length > 0 && (
                        <>
                          <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: palette.gold, fontFamily: fontStack.mono, fontWeight: 700, marginBottom: 10 }}>Evidence Required</div>
                          {items.map((e, idx) => (
                            <div key={e.id} style={{ padding: '12px 14px', background: palette.parchment, marginBottom: 6, borderLeft: `2px solid ${e.status === 'met' ? palette.sage : palette.parchmentDark}` }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                                <span style={{ fontSize: 10, color: palette.ash, fontFamily: fontStack.mono, fontWeight: 700, marginTop: 3 }}>{idx + 1}.</span>
                                <div style={{ flex: 1, fontSize: 12, fontFamily: fontStack.body, color: palette.ink, lineHeight: 1.4 }}>{e.text}</div>
                                <Select value={e.status} onChange={ev => updateEvidence(e.id, { status: ev.target.value })} style={{ width: 110, padding: '5px 8px', fontSize: 11 }}>
                                  <option value="pending">Pending</option><option value="met">Met</option><option value="not_met">Not Met</option>
                                </Select>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginLeft: 24 }}>
                                <Input defaultValue={e.link} onBlur={ev => updateEvidence(e.id, { link: ev.target.value })} placeholder="Evidence file / location" style={{ padding: '5px 8px', fontSize: 11 }} />
                                <Input defaultValue={e.notes} onBlur={ev => updateEvidence(e.id, { notes: ev.target.value })} placeholder="Notes" style={{ padding: '5px 8px', fontSize: 11 }} />
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {c.required_policies && Array.isArray(c.required_policies) && c.required_policies.length > 0 && (
                        <div style={{ marginTop: 18 }}>
                          <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: palette.gold, fontFamily: fontStack.mono, fontWeight: 700, marginBottom: 10 }}>Documented Policies Required</div>
                          <div style={{ background: palette.parchment, padding: '12px 16px', fontSize: 12, fontFamily: fontStack.body, color: palette.ink, lineHeight: 1.7 }}>
                            {c.required_policies.map((p, i) => (
                              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <span style={{ color: palette.gold, marginTop: 1 }}>•</span><span>{p}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ marginTop: 22 }}>
                        <Field label="Notes for this criterion">
                          <Textarea defaultValue={c.notes} onBlur={e => updateCriterion(c.id, { notes: e.target.value })} placeholder="Outstanding actions, responsible officer, target date..." />
                        </Field>
                      </div>

                      <div style={{ marginTop: 22 }}>
                        <DocumentManager category="eqa_evidence" parentTextId={c.id} title={`Supporting Documents — ${c.number}`} />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// POLICIES
// ============================================================================
export const Policies = () => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('policies').select('*').order('title');
    setItems(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = {
      title: editing.title, version: editing.version, owner: editing.owner,
      review_date: editing.review_date || null, next_review: editing.next_review || null,
      location: editing.location, linked_clause: editing.linked_clause, status: editing.status,
      updated_at: new Date().toISOString(),
    };
    if (items.find(p => p.id === editing.id)) {
      await supabase.from('policies').update(payload).eq('id', editing.id);
      await audit('update', 'policy', editing.id);
    } else {
      const { data } = await supabase.from('policies').insert(payload).select().single();
      await audit('create', 'policy', data?.id);
    }
    setEditing(null); load();
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this policy record?')) return;
    await supabase.from('policies').delete().eq('id', id);
    await audit('delete', 'policy', id);
    load();
  };

  if (loading) return <LoadingFull />;

  return (
    <div>
      <SectionHeader
        eyebrow={content.pages.policies.eyebrow}
        title={content.pages.policies.title}
        description={content.pages.policies.description}
        actions={<Button icon={Plus} onClick={() => setEditing({ title: '', version: '1.0', owner: '', status: 'draft', linked_clause: '' })}>{content.buttons.addPolicy}</Button>}
      />

      {items.length === 0 ? (
        <Empty icon={FileLock2} title="No policies registered" hint="Add your first policy to begin building the register" />
      ) : (
        <div style={{ background: palette.parchment, borderTop: `2px solid ${palette.teal}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 1.2fr 1fr 100px 80px', padding: '12px 18px', background: palette.tealDeep, color: palette.parchment, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: fontStack.mono }}>
            <div>Policy</div><div>Version</div><div>Owner</div><div>Next Review</div><div>Status</div><div></div>
          </div>
          {items.map((p, i) => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 1.2fr 1fr 100px 80px', padding: '12px 18px', gap: 10, alignItems: 'center', background: i % 2 === 0 ? palette.parchment : '#FFFDF7', borderBottom: `1px solid ${palette.parchmentDark}`, fontSize: 13, fontFamily: fontStack.body }}>
              <div style={{ fontWeight: 500, color: palette.ink }}>{p.title}</div>
              <div style={{ fontFamily: fontStack.mono, fontSize: 12 }}>{p.version}</div>
              <div>{p.owner || '—'}</div>
              <div style={{ fontSize: 12 }}>{formatDate(p.next_review)}</div>
              <div><Pill tone={p.status === 'approved' ? 'sage' : p.status === 'review' ? 'gold' : 'neutral'}>{p.status}</Pill></div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setEditing(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.teal, padding: 4 }}><Eye size={14} /></button>
                <button onClick={() => remove(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.rust, padding: 4 }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit policy' : 'New policy'} width={720}>
        {editing && (
          <div>
            <Field label="Policy title"><Input value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="e.g. Safeguarding Policy" /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Version"><Input value={editing.version || ''} onChange={e => setEditing({ ...editing, version: e.target.value })} /></Field>
              <Field label="Status">
                <Select value={editing.status || 'draft'} onChange={e => setEditing({ ...editing, status: e.target.value })}>
                  <option value="draft">Draft</option><option value="review">Under Review</option><option value="approved">Approved</option><option value="archived">Archived</option>
                </Select>
              </Field>
            </div>
            <Field label="Owner / responsible officer"><Input value={editing.owner || ''} onChange={e => setEditing({ ...editing, owner: e.target.value })} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Last reviewed"><Input type="date" value={editing.review_date || ''} onChange={e => setEditing({ ...editing, review_date: e.target.value })} /></Field>
              <Field label="Next review due"><Input type="date" value={editing.next_review || ''} onChange={e => setEditing({ ...editing, next_review: e.target.value })} /></Field>
            </div>
            <Field label="Document location (free text)"><Input value={editing.location || ''} onChange={e => setEditing({ ...editing, location: e.target.value })} placeholder="Optional cross-reference" /></Field>
            <Field label="Linked EQA clause"><Input value={editing.linked_clause || ''} onChange={e => setEditing({ ...editing, linked_clause: e.target.value })} placeholder="e.g. 3.1, 3.13" /></Field>

            {editing.id && (
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${palette.parchmentDark}` }}>
                <DocumentManager category="policy" parentId={editing.id} title="Policy Documents" />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <Button variant="ghost" onClick={() => setEditing(null)}>Close</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ============================================================================
// LEARNERS — with document uploads per learner
// ============================================================================
export const Learners = () => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('learners').select('*').order('created_at', { ascending: false });
    setItems(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter(l =>
    !search || (l.name?.toLowerCase().includes(search.toLowerCase()) || l.learner_ref?.toLowerCase().includes(search.toLowerCase()))
  );

  const save = async () => {
    const payload = {
      learner_ref: editing.learner_ref, name: editing.name, dob: editing.dob || null,
      qualification: editing.qualification, enrolment_date: editing.enrolment_date || null,
      status: editing.status, id_verified: editing.id_verified, rpl_considered: editing.rpl_considered,
      assigned_tutor: editing.assigned_tutor, progress: editing.progress || 0, notes: editing.notes,
      updated_at: new Date().toISOString(),
    };
    if (items.find(l => l.id === editing.id)) {
      await supabase.from('learners').update(payload).eq('id', editing.id);
      await audit('update', 'learner', editing.id);
      setEditing({ ...editing, ...payload });
    } else {
      const { data } = await supabase.from('learners').insert(payload).select().single();
      await audit('create', 'learner', data?.id);
      setEditing(data);
    }
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this learner record? Any uploaded documents will also be deleted.')) return;
    const { data: docs } = await supabase.from('documents').select('file_path').eq('parent_id', id);
    if (docs?.length) await supabase.storage.from('documents').remove(docs.map(d => d.file_path));
    await supabase.from('documents').delete().eq('parent_id', id);
    await supabase.from('learners').delete().eq('id', id);
    await audit('delete', 'learner', id);
    load();
  };

  if (loading) return <LoadingFull />;

  return (
    <div>
      <SectionHeader
        eyebrow={content.pages.learners.eyebrow}
        title={content.pages.learners.title}
        description={content.pages.learners.description}
        actions={
          <>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: palette.ash }} />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or ref..." style={{ width: 220, paddingLeft: 30 }} />
            </div>
            <Button icon={Plus} onClick={() => setEditing({ learner_ref: '', name: '', status: 'enquiry', progress: 0, id_verified: false, rpl_considered: false })}>{content.buttons.addLearner}</Button>
          </>
        }
      />

      {filtered.length === 0 ? (
        <Empty icon={GraduationCap} title="No learners registered" hint={items.length === 0 ? 'Add your first learner to begin' : 'No learners match your search'} />
      ) : (
        <div style={{ background: palette.parchment, borderTop: `2px solid ${palette.teal}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1.5fr 1.5fr 1fr 80px 100px 90px 60px', padding: '12px 18px', background: palette.tealDeep, color: palette.parchment, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: fontStack.mono }}>
            <div>Ref</div><div>Name</div><div>Qualification</div><div>Tutor</div><div>ID</div><div>Progress</div><div>Status</div><div></div>
          </div>
          {filtered.map((l, i) => (
            <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '100px 1.5fr 1.5fr 1fr 80px 100px 90px 60px', padding: '12px 18px', gap: 10, alignItems: 'center', background: i % 2 === 0 ? palette.parchment : '#FFFDF7', borderBottom: `1px solid ${palette.parchmentDark}`, fontSize: 13, fontFamily: fontStack.body }}>
              <div style={{ fontFamily: fontStack.mono, fontSize: 12, color: palette.teal, fontWeight: 600 }}>{l.learner_ref}</div>
              <div style={{ fontWeight: 500 }}>{l.name}</div>
              <div style={{ fontSize: 12 }}>{l.qualification}</div>
              <div style={{ fontSize: 12 }}>{l.assigned_tutor}</div>
              <div>{l.id_verified ? <CheckCircle2 size={14} color={palette.sage} /> : <Circle size={14} color={palette.ash} />}</div>
              <div>
                <div style={{ background: palette.parchmentDark, height: 6, borderRadius: 1, overflow: 'hidden' }}>
                  <div style={{ background: palette.gold, width: `${l.progress}%`, height: '100%' }} />
                </div>
                <div style={{ fontSize: 10, color: palette.ash, fontFamily: fontStack.mono, marginTop: 2 }}>{l.progress}%</div>
              </div>
              <div><Pill tone={l.status === 'active' ? 'sage' : l.status === 'completed' ? 'teal' : l.status === 'withdrawn' ? 'rust' : 'neutral'}>{l.status}</Pill></div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setEditing(l)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.teal, padding: 4 }}><Eye size={14} /></button>
                <button onClick={() => remove(l.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.rust, padding: 4 }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? `Learner: ${editing.name || editing.learner_ref}` : 'New learner'} width={780}>
        {editing && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
              <Field label="Learner Ref"><Input value={editing.learner_ref || ''} onChange={e => setEditing({ ...editing, learner_ref: e.target.value })} placeholder="SH-2026-001" /></Field>
              <Field label="Full name"><Input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
              <Field label="Date of birth"><Input type="date" value={editing.dob || ''} onChange={e => setEditing({ ...editing, dob: e.target.value })} /></Field>
              <Field label="Qualification"><Input value={editing.qualification || ''} onChange={e => setEditing({ ...editing, qualification: e.target.value })} placeholder="e.g. NCFE Functional Skills Maths L2" /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Enrolment date"><Input type="date" value={editing.enrolment_date || ''} onChange={e => setEditing({ ...editing, enrolment_date: e.target.value })} /></Field>
              <Field label="Assigned tutor/assessor"><Input value={editing.assigned_tutor || ''} onChange={e => setEditing({ ...editing, assigned_tutor: e.target.value })} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Status">
                <Select value={editing.status || 'enquiry'} onChange={e => setEditing({ ...editing, status: e.target.value })}>
                  <option value="enquiry">Enquiry</option><option value="enrolled">Enrolled</option><option value="active">Active</option><option value="completed">Completed</option><option value="withdrawn">Withdrawn</option>
                </Select>
              </Field>
              <Field label="Progress (%)"><Input type="number" min="0" max="100" value={editing.progress || 0} onChange={e => setEditing({ ...editing, progress: parseInt(e.target.value) || 0 })} /></Field>
            </div>
            <div style={{ display: 'flex', gap: 18, margin: '10px 0 14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: fontStack.mono, letterSpacing: '0.05em', textTransform: 'uppercase', color: palette.teal, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!editing.id_verified} onChange={e => setEditing({ ...editing, id_verified: e.target.checked })} /> ID verified
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: fontStack.mono, letterSpacing: '0.05em', textTransform: 'uppercase', color: palette.teal, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!editing.rpl_considered} onChange={e => setEditing({ ...editing, rpl_considered: e.target.checked })} /> RPL considered
              </label>
            </div>
            <Field label="Notes"><Textarea value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} /></Field>

            {editing.id && (
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${palette.parchmentDark}` }}>
                <DocumentManager category="learner" parentId={editing.id} title="Learner Documents" />
                <div style={{ fontSize: 11, color: palette.ash, marginTop: 8, fontStyle: 'italic' }}>
                  Suggested: ID scan, enrolment form, learning plan, assessment evidence, RPL claim, withdrawal form
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <Button variant="ghost" onClick={() => setEditing(null)}>Close</Button>
              <Button onClick={save}>{editing.id ? 'Save Changes' : 'Create Learner'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ============================================================================
// STAFF — with document uploads per staff member
// ============================================================================
export const Staff = () => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('staff').select('*').order('name');
    setItems(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = {
      name: editing.name, role: editing.role, start_date: editing.start_date || null,
      dbs: editing.dbs, dbs_date: editing.dbs_date || null, qualifications: editing.qualifications,
      cpd_hours: editing.cpd_hours || 0, assigned_learners: editing.assigned_learners,
      right_to_work: editing.right_to_work, conflict_check: editing.conflict_check, notes: editing.notes,
      updated_at: new Date().toISOString(),
    };
    if (items.find(s => s.id === editing.id)) {
      await supabase.from('staff').update(payload).eq('id', editing.id);
      await audit('update', 'staff', editing.id);
      setEditing({ ...editing, ...payload });
    } else {
      const { data } = await supabase.from('staff').insert(payload).select().single();
      await audit('create', 'staff', data?.id);
      setEditing(data);
    }
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this staff record? Any uploaded documents will also be deleted.')) return;
    const { data: docs } = await supabase.from('documents').select('file_path').eq('parent_id', id);
    if (docs?.length) await supabase.storage.from('documents').remove(docs.map(d => d.file_path));
    await supabase.from('documents').delete().eq('parent_id', id);
    await supabase.from('staff').delete().eq('id', id);
    await audit('delete', 'staff', id);
    load();
  };

  const conflicts = items.filter(s => {
    const role = (s.role || '').toLowerCase();
    return (role.includes('tutor') || role.includes('assessor')) && role.includes('iqa');
  }).map(s => s.name);

  if (loading) return <LoadingFull />;

  return (
    <div>
      <SectionHeader
        eyebrow={content.pages.staff.eyebrow}
        title={content.pages.staff.title}
        description={content.pages.staff.description}
        actions={<Button icon={Plus} onClick={() => setEditing({ name: '', role: '', cpd_hours: 0, right_to_work: false, conflict_check: false })}>{content.buttons.addStaff}</Button>}
      />

      {conflicts.length > 0 && (
        <div style={{ padding: '14px 18px', background: '#FBE9E4', borderLeft: `3px solid ${palette.rust}`, marginBottom: 20, fontSize: 13, fontFamily: fontStack.body, color: palette.rust }}>
          <AlertTriangle size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
          <strong>Conflict of interest detected:</strong> {conflicts.join(', ')} hold both tutor/assessor and IQA roles.
        </div>
      )}

      {items.length === 0 ? (
        <Empty icon={UserCog} title="No staff registered" hint="Add staff records to track competency, DBS, and CPD" />
      ) : (
        <div style={{ background: palette.parchment, borderTop: `2px solid ${palette.teal}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 100px 80px 80px 60px', padding: '12px 18px', background: palette.tealDeep, color: palette.parchment, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: fontStack.mono }}>
            <div>Name</div><div>Role</div><div>DBS</div><div>CPD Hrs</div><div>RTW</div><div>COI</div><div></div>
          </div>
          {items.map((s, i) => (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 100px 80px 80px 60px', padding: '12px 18px', gap: 10, alignItems: 'center', background: i % 2 === 0 ? palette.parchment : '#FFFDF7', borderBottom: `1px solid ${palette.parchmentDark}`, fontSize: 13, fontFamily: fontStack.body }}>
              <div style={{ fontWeight: 500 }}>{s.name}</div>
              <div style={{ fontSize: 12 }}>{s.role}</div>
              <div style={{ fontSize: 12, fontFamily: fontStack.mono }}>{s.dbs || '—'}</div>
              <div style={{ fontFamily: fontStack.mono, fontSize: 12 }}>{s.cpd_hours}h</div>
              <div>{s.right_to_work ? <CheckCircle2 size={14} color={palette.sage} /> : <Circle size={14} color={palette.ash} />}</div>
              <div>{s.conflict_check ? <CheckCircle2 size={14} color={palette.sage} /> : <Circle size={14} color={palette.ash} />}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setEditing(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.teal, padding: 4 }}><Eye size={14} /></button>
                <button onClick={() => remove(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.rust, padding: 4 }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? `Staff: ${editing.name}` : 'New staff member'} width={780}>
        {editing && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Full name"><Input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="Role"><Input value={editing.role || ''} onChange={e => setEditing({ ...editing, role: e.target.value })} placeholder="e.g. Tutor/Assessor, IQA, Exams Officer" /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <Field label="Start date"><Input type="date" value={editing.start_date || ''} onChange={e => setEditing({ ...editing, start_date: e.target.value })} /></Field>
              <Field label="DBS number"><Input value={editing.dbs || ''} onChange={e => setEditing({ ...editing, dbs: e.target.value })} /></Field>
              <Field label="DBS issue date"><Input type="date" value={editing.dbs_date || ''} onChange={e => setEditing({ ...editing, dbs_date: e.target.value })} /></Field>
            </div>
            <Field label="Qualifications"><Input value={editing.qualifications || ''} onChange={e => setEditing({ ...editing, qualifications: e.target.value })} placeholder="e.g. Level 5 DET, Maths L3, TAQA" /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
              <Field label="CPD hours (YTD)"><Input type="number" value={editing.cpd_hours || 0} onChange={e => setEditing({ ...editing, cpd_hours: parseInt(e.target.value) || 0 })} /></Field>
              <Field label="Assigned learners / cohort"><Input value={editing.assigned_learners || ''} onChange={e => setEditing({ ...editing, assigned_learners: e.target.value })} placeholder="e.g. Cohort A (SH-2026-001 to 015)" /></Field>
            </div>
            <div style={{ display: 'flex', gap: 18, margin: '10px 0 14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: fontStack.mono, letterSpacing: '0.05em', textTransform: 'uppercase', color: palette.teal, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!editing.right_to_work} onChange={e => setEditing({ ...editing, right_to_work: e.target.checked })} /> Right to work verified
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: fontStack.mono, letterSpacing: '0.05em', textTransform: 'uppercase', color: palette.teal, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!editing.conflict_check} onChange={e => setEditing({ ...editing, conflict_check: e.target.checked })} /> Conflict-of-interest declared
              </label>
            </div>
            <Field label="Notes"><Textarea value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} /></Field>

            {editing.id && (
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${palette.parchmentDark}` }}>
                <DocumentManager category="staff" parentId={editing.id} title="Staff Documents" />
                <div style={{ fontSize: 11, color: palette.ash, marginTop: 8, fontStyle: 'italic' }}>
                  Suggested: CV, DBS certificate, qualifications, employment contract, induction sign-off, CPD log
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <Button variant="ghost" onClick={() => setEditing(null)}>Close</Button>
              <Button onClick={save}>{editing.id ? 'Save Changes' : 'Create Staff'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ============================================================================
// EXAM SESSIONS
// ============================================================================
export const ExamSessions = () => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showRegister, setShowRegister] = useState(null);
  const [registerEntries, setRegisterEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('exam_sessions').select('*, exam_register_entries(count)').order('date', { ascending: false });
    setItems(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = {
      session_ref: editing.session_ref, date: editing.date || null,
      start_time: editing.start_time || null, qualification: editing.qualification,
      room: editing.room, invigilator: editing.invigilator, exams_officer: editing.exams_officer,
      desk_spacing: editing.desk_spacing, notes: editing.notes,
      updated_at: new Date().toISOString(),
    };
    if (items.find(s => s.id === editing.id)) {
      await supabase.from('exam_sessions').update(payload).eq('id', editing.id);
      await audit('update', 'exam_session', editing.id);
    } else {
      const { data } = await supabase.from('exam_sessions').insert(payload).select().single();
      await audit('create', 'exam_session', data?.id);
    }
    setEditing(null); load();
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this exam session?')) return;
    await supabase.from('exam_sessions').delete().eq('id', id);
    await audit('delete', 'exam_session', id);
    load();
  };

  const openRegister = async (s) => {
    setShowRegister(s);
    const { data } = await supabase.from('exam_register_entries').select('*').eq('session_id', s.id).order('sort_order');
    setRegisterEntries(data || []);
  };

  const addCandidate = async () => {
    const { data } = await supabase.from('exam_register_entries').insert({
      session_id: showRegister.id, learner_id: '', learner_name: '', id_type: '', id_checked: false,
      sort_order: registerEntries.length,
    }).select().single();
    setRegisterEntries([...registerEntries, data]);
  };

  const updateCandidate = async (id, patch) => {
    await supabase.from('exam_register_entries').update(patch).eq('id', id);
    setRegisterEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  };

  const removeCandidate = async (id) => {
    await supabase.from('exam_register_entries').delete().eq('id', id);
    setRegisterEntries(prev => prev.filter(e => e.id !== id));
  };

  if (loading) return <LoadingFull />;

  return (
    <div>
      <SectionHeader
        eyebrow={content.pages.exams.eyebrow}
        title={content.pages.exams.title}
        description={content.pages.exams.description}
        actions={<Button icon={Plus} onClick={() => setEditing({})}>{content.buttons.newSession}</Button>}
      />

      {items.length === 0 ? (
        <Empty icon={Calendar} title="No exam sessions logged" hint="Create your first session record" />
      ) : (
        <div style={{ background: palette.parchment, borderTop: `2px solid ${palette.teal}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 100px 2fr 1fr 1fr 80px 100px', padding: '12px 18px', background: palette.tealDeep, color: palette.parchment, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: fontStack.mono }}>
            <div>Ref</div><div>Date</div><div>Qualification</div><div>Room</div><div>Invigilator</div><div>Cands.</div><div></div>
          </div>
          {items.map((s, i) => (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '120px 100px 2fr 1fr 1fr 80px 100px', padding: '12px 18px', gap: 10, alignItems: 'center', background: i % 2 === 0 ? palette.parchment : '#FFFDF7', borderBottom: `1px solid ${palette.parchmentDark}`, fontSize: 13, fontFamily: fontStack.body }}>
              <div style={{ fontFamily: fontStack.mono, fontSize: 12, color: palette.teal, fontWeight: 600 }}>{s.session_ref}</div>
              <div style={{ fontSize: 12 }}>{formatDate(s.date)}</div>
              <div style={{ fontWeight: 500 }}>{s.qualification}</div>
              <div style={{ fontSize: 12 }}>{s.room}</div>
              <div style={{ fontSize: 12 }}>{s.invigilator}</div>
              <div style={{ fontFamily: fontStack.mono, fontSize: 12 }}>{s.exam_register_entries?.[0]?.count || 0}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => openRegister(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.gold, padding: 4 }} title="Register"><ClipboardCheck size={14} /></button>
                <button onClick={() => setEditing(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.teal, padding: 4 }}><Eye size={14} /></button>
                <button onClick={() => remove(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.rust, padding: 4 }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit session' : 'New exam session'} width={720}>
        {editing && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <Field label="Session ref"><Input value={editing.session_ref || ''} onChange={e => setEditing({ ...editing, session_ref: e.target.value })} placeholder="EX-2026-001" /></Field>
              <Field label="Date"><Input type="date" value={editing.date || ''} onChange={e => setEditing({ ...editing, date: e.target.value })} /></Field>
              <Field label="Start time"><Input type="time" value={editing.start_time || ''} onChange={e => setEditing({ ...editing, start_time: e.target.value })} /></Field>
            </div>
            <Field label="Qualification / assessment"><Input value={editing.qualification || ''} onChange={e => setEditing({ ...editing, qualification: e.target.value })} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Room"><Input value={editing.room || ''} onChange={e => setEditing({ ...editing, room: e.target.value })} /></Field>
              <Field label="Desk spacing (m)" hint="JCQ requires minimum 1.25m"><Input value={editing.desk_spacing || ''} onChange={e => setEditing({ ...editing, desk_spacing: e.target.value })} placeholder="1.25" /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Invigilator"><Input value={editing.invigilator || ''} onChange={e => setEditing({ ...editing, invigilator: e.target.value })} /></Field>
              <Field label="Exams Officer"><Input value={editing.exams_officer || ''} onChange={e => setEditing({ ...editing, exams_officer: e.target.value })} /></Field>
            </div>
            <Field label="Session notes / incidents"><Textarea value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} /></Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!showRegister} onClose={() => setShowRegister(null)} title={`Attendance Register — ${showRegister?.session_ref || ''}`} width={860}>
        {showRegister && (
          <div>
            <div style={{ padding: '10px 14px', background: '#FFFDF7', marginBottom: 16, borderLeft: `3px solid ${palette.gold}`, fontSize: 12, fontFamily: fontStack.body }}>
              <strong>{showRegister.qualification}</strong> · {formatDate(showRegister.date)} {showRegister.start_time} · Room {showRegister.room}<br />
              Invigilator: {showRegister.invigilator} · Exams Officer: {showRegister.exams_officer}
            </div>
            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: fontStack.body }}>
                <thead>
                  <tr style={{ background: palette.tealDeep, color: palette.parchment }}>
                    {['Learner ID', 'Name', 'ID Type', 'Checked', 'Signed In', 'Signed Out', ''].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: fontStack.mono }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registerEntries.map((c, idx) => (
                    <tr key={c.id} style={{ background: idx % 2 === 0 ? palette.parchment : '#FFFDF7' }}>
                      <td style={{ padding: 6 }}><Input defaultValue={c.learner_id} onBlur={e => updateCandidate(c.id, { learner_id: e.target.value })} style={{ padding: '5px 8px', fontSize: 11 }} /></td>
                      <td style={{ padding: 6 }}><Input defaultValue={c.learner_name} onBlur={e => updateCandidate(c.id, { learner_name: e.target.value })} style={{ padding: '5px 8px', fontSize: 11 }} /></td>
                      <td style={{ padding: 6 }}>
                        <Select value={c.id_type || ''} onChange={e => updateCandidate(c.id, { id_type: e.target.value })} style={{ padding: '5px 8px', fontSize: 11 }}>
                          <option value="">—</option><option>Passport</option><option>Driving Licence</option><option>BRP</option><option>Staff Attestation (u18)</option>
                        </Select>
                      </td>
                      <td style={{ padding: 6, textAlign: 'center' }}><input type="checkbox" checked={!!c.id_checked} onChange={e => updateCandidate(c.id, { id_checked: e.target.checked })} /></td>
                      <td style={{ padding: 6 }}><Input type="time" defaultValue={c.signed_in || ''} onBlur={e => updateCandidate(c.id, { signed_in: e.target.value })} style={{ padding: '5px 8px', fontSize: 11 }} /></td>
                      <td style={{ padding: 6 }}><Input type="time" defaultValue={c.signed_out || ''} onBlur={e => updateCandidate(c.id, { signed_out: e.target.value })} style={{ padding: '5px 8px', fontSize: 11 }} /></td>
                      <td style={{ padding: 6 }}><button onClick={() => removeCandidate(c.id)} style={{ background: 'none', border: 'none', color: palette.rust, cursor: 'pointer' }}><Trash2 size={12} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button icon={Plus} size="sm" onClick={addCandidate}>Add candidate</Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ============================================================================
// IQA SAMPLING
// ============================================================================
export const IQA = () => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('iqa_samples').select('*').order('date', { ascending: false });
    setItems(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = {
      sample_ref: editing.sample_ref, date: editing.date || null,
      learner_ref: editing.learner_ref, assessor: editing.assessor, iqa: editing.iqa,
      qualification: editing.qualification, unit: editing.unit, decision: editing.decision,
      feedback: editing.feedback, action_required: editing.action_required,
      action_due: editing.action_due || null, closed: editing.closed,
      updated_at: new Date().toISOString(),
    };
    if (items.find(s => s.id === editing.id)) {
      await supabase.from('iqa_samples').update(payload).eq('id', editing.id);
      await audit('update', 'iqa_sample', editing.id);
    } else {
      const { data } = await supabase.from('iqa_samples').insert(payload).select().single();
      await audit('create', 'iqa_sample', data?.id);
    }
    setEditing(null); load();
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this IQA sample?')) return;
    await supabase.from('iqa_samples').delete().eq('id', id);
    await audit('delete', 'iqa_sample', id);
    load();
  };

  if (loading) return <LoadingFull />;

  return (
    <div>
      <SectionHeader
        eyebrow={content.pages.iqa.eyebrow}
        title={content.pages.iqa.title}
        description={content.pages.iqa.description}
        actions={<Button icon={Plus} onClick={() => setEditing({ decision: 'agreed', closed: false })}>{content.buttons.newSample}</Button>}
      />

      {items.length === 0 ? (
        <Empty icon={ClipboardCheck} title="No IQA samples logged" hint="Record your first sampling decision" />
      ) : (
        <div style={{ background: palette.parchment, borderTop: `2px solid ${palette.teal}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 100px 1fr 1fr 1fr 100px 80px 60px', padding: '12px 18px', background: palette.tealDeep, color: palette.parchment, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: fontStack.mono }}>
            <div>Ref</div><div>Date</div><div>Learner</div><div>Assessor</div><div>IQA</div><div>Decision</div><div>Closed</div><div></div>
          </div>
          {items.map((s, i) => (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '100px 100px 1fr 1fr 1fr 100px 80px 60px', padding: '12px 18px', gap: 10, alignItems: 'center', background: i % 2 === 0 ? palette.parchment : '#FFFDF7', borderBottom: `1px solid ${palette.parchmentDark}`, fontSize: 13, fontFamily: fontStack.body }}>
              <div style={{ fontFamily: fontStack.mono, fontSize: 12, color: palette.teal, fontWeight: 600 }}>{s.sample_ref}</div>
              <div style={{ fontSize: 12 }}>{formatDate(s.date)}</div>
              <div style={{ fontSize: 12 }}>{s.learner_ref}</div>
              <div style={{ fontSize: 12 }}>{s.assessor}</div>
              <div style={{ fontSize: 12 }}>{s.iqa}</div>
              <div><Pill tone={s.decision === 'agreed' ? 'sage' : s.decision === 'amended' ? 'gold' : 'rust'}>{s.decision}</Pill></div>
              <div>{s.closed ? <CheckCircle2 size={14} color={palette.sage} /> : <Circle size={14} color={palette.ash} />}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setEditing(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.teal, padding: 4 }}><Eye size={14} /></button>
                <button onClick={() => remove(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.rust, padding: 4 }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit IQA sample' : 'New IQA sample'} width={720}>
        {editing && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <Field label="Sample ref"><Input value={editing.sample_ref || ''} onChange={e => setEditing({ ...editing, sample_ref: e.target.value })} placeholder="IQA-2026-001" /></Field>
              <Field label="Date"><Input type="date" value={editing.date || ''} onChange={e => setEditing({ ...editing, date: e.target.value })} /></Field>
              <Field label="Learner ref"><Input value={editing.learner_ref || ''} onChange={e => setEditing({ ...editing, learner_ref: e.target.value })} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Assessor"><Input value={editing.assessor || ''} onChange={e => setEditing({ ...editing, assessor: e.target.value })} /></Field>
              <Field label="IQA" hint="Must differ from assessor"><Input value={editing.iqa || ''} onChange={e => setEditing({ ...editing, iqa: e.target.value })} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
              <Field label="Qualification"><Input value={editing.qualification || ''} onChange={e => setEditing({ ...editing, qualification: e.target.value })} /></Field>
              <Field label="Unit / AC"><Input value={editing.unit || ''} onChange={e => setEditing({ ...editing, unit: e.target.value })} /></Field>
            </div>
            {editing.assessor && editing.iqa && editing.assessor.toLowerCase() === editing.iqa.toLowerCase() && (
              <div style={{ padding: '10px 14px', background: '#FBE9E4', borderLeft: `3px solid ${palette.rust}`, marginBottom: 14, fontSize: 12, fontFamily: fontStack.body, color: palette.rust }}>
                <AlertTriangle size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                Assessor and IQA must be different people.
              </div>
            )}
            <Field label="Sampling decision">
              <Select value={editing.decision || 'agreed'} onChange={e => setEditing({ ...editing, decision: e.target.value })}>
                <option value="agreed">Agreed</option><option value="amended">Amended</option><option value="disagreed">Disagreed</option>
              </Select>
            </Field>
            <Field label="Feedback to assessor"><Textarea value={editing.feedback || ''} onChange={e => setEditing({ ...editing, feedback: e.target.value })} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
              <Field label="Action required"><Input value={editing.action_required || ''} onChange={e => setEditing({ ...editing, action_required: e.target.value })} /></Field>
              <Field label="Action due"><Input type="date" value={editing.action_due || ''} onChange={e => setEditing({ ...editing, action_due: e.target.value })} /></Field>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: fontStack.mono, letterSpacing: '0.05em', textTransform: 'uppercase', color: palette.teal, cursor: 'pointer', marginBottom: 14 }}>
              <input type="checkbox" checked={!!editing.closed} onChange={e => setEditing({ ...editing, closed: e.target.checked })} /> Action closed
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ============================================================================
// GENERAL DOCUMENTS — for anything not tied to a learner/staff/criterion
// ============================================================================
export const GeneralDocs = () => (
  <div>
    <SectionHeader
      eyebrow={content.pages.docs.eyebrow}
      title={content.pages.docs.title}
      description={content.pages.docs.description}
    />
    <DocumentManager category="general" title="" />
  </div>
);

// ============================================================================
// ACCOUNT — change password while logged in
// ============================================================================
export const Account = () => {
  const [user, setUser] = useState(null);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const changePassword = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (newPwd.length < 10) { setError('New password must be at least 10 characters.'); return; }
    if (newPwd !== confirmPwd) { setError('New passwords do not match.'); return; }
    setBusy(true);
    // Verify old password by attempting sign-in
    const { error: verifyErr } = await supabase.auth.signInWithPassword({ email: user.email, password: oldPwd });
    if (verifyErr) { setError('Current password is incorrect.'); setBusy(false); return; }
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPwd });
    setBusy(false);
    if (updateErr) setError(updateErr.message);
    else {
      setSuccess('Password updated successfully.');
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
      await audit('password_change', 'auth', null);
    }
  };

  if (!user) return <LoadingFull />;

  return (
    <div>
      <SectionHeader eyebrow={content.pages.account.eyebrow} title={content.pages.account.title} description={content.pages.account.description} />

      <div style={{ background: palette.parchment, padding: '24px 28px', marginBottom: 24, borderLeft: `3px solid ${palette.gold}` }}>
        <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: palette.ash, fontFamily: fontStack.mono, marginBottom: 4 }}>Signed in as</div>
        <div style={{ fontSize: 18, fontFamily: fontStack.display, color: palette.ink, fontWeight: 500 }}>{user.email}</div>
        <div style={{ fontSize: 11, color: palette.ash, marginTop: 8, fontFamily: fontStack.mono, letterSpacing: '0.05em' }}>
          Account created: {formatDateTime(user.created_at)}
        </div>
      </div>

      <div style={{ background: palette.parchment, padding: '24px 28px', borderLeft: `3px solid ${palette.teal}`, maxWidth: 560 }}>
        <h3 style={{ margin: '0 0 18px', fontSize: 18, fontFamily: fontStack.display, color: palette.ink, fontWeight: 500 }}>Change Password</h3>
        <form onSubmit={changePassword}>
          <Field label="Current password"><Input type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} required autoComplete="current-password" /></Field>
          <Field label="New password" hint="Minimum 10 characters"><Input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required autoComplete="new-password" /></Field>
          <Field label="Confirm new password"><Input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required autoComplete="new-password" /></Field>
          {error && (
            <div style={{ padding: '10px 12px', background: '#FBE9E4', borderLeft: `3px solid ${palette.rust}`, color: palette.rust, fontSize: 12, marginBottom: 14 }}>
              <AlertTriangle size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />{error}
            </div>
          )}
          {success && (
            <div style={{ padding: '10px 12px', background: '#E5EADB', borderLeft: `3px solid ${palette.sage}`, color: palette.sage, fontSize: 12, marginBottom: 14 }}>
              <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />{success}
            </div>
          )}
          <Button type="submit" icon={KeyRound} disabled={busy}>{busy ? 'Saving…' : 'Update Password'}</Button>
        </form>
      </div>
    </div>
  );
};
