import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  FileDown,
  FileText,
  History,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useApp } from '@/store';
import { tr, useT } from '@/i18n';
import { cn } from '@/lib/utils';
import { fmtBRL, fmtAgo } from '@/lib/format';
import { computeScore } from '@/config/scoring';
import { brandById, malls } from '@/data/brands';
import { buildDraft, defaultQuestionnaire, type DraftSection, type Questionnaire, type TemplateId } from '@/lib/proposalTemplate';
import { Badge, DevNotice, FixedBottomBar, PageHeader, PreviewBanner, ScoreBadge, Segmented } from '@/components/ui';
import { PdfPreview, Paragraphs } from './_generator/PdfPreview';
import type { Bi, Proposal, ProposalVersion } from '@/types';

type Phase = 'idle' | 'analyzing' | 'streaming' | 'done';
const CHARS_PER_TICK = 4;
const TICK_MS = 16;

/* ---------- Campos del cuestionario ---------- */
function QRow({ n, label, children, edited }: { n: number; label: string; children: ReactNode; edited?: boolean }) {
  const { t } = useT();
  return (
    <div className="border-b border-line py-4 last:border-0">
      <div className="mb-2 flex items-center gap-2">
        <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-subtle text-[11px] text-ink2">{n}</span>
        <span className="min-w-0 flex-1 text-[13.5px] font-medium text-ink">{label}</span>
        {edited && <Badge tone="accent">{t('gen.q.edited')}</Badge>}
      </div>
      <div className="pl-8">{children}</div>
    </div>
  );
}

function Stepper({ value, onChange, step, min, unit }: { value: number; onChange: (v: number) => void; step: number; min: number; unit: string }) {
  const { t } = useT();
  return (
    <div className="flex items-center gap-2">
      <button type="button" aria-label={t('gen.q.minus')} className="icon-btn border border-line" onClick={() => onChange(Math.max(min, value - step))}>
        <Minus size={16} />
      </button>
      <input type="number" className="input num w-24 text-center" value={value} min={min} onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))} />
      <button type="button" aria-label={t('gen.q.plus')} className="icon-btn border border-line" onClick={() => onChange(value + step)}>
        <Plus size={16} />
      </button>
      <span className="text-sm text-muted">{unit}</span>
    </div>
  );
}

function Choice<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return <Segmented value={value} onChange={onChange} options={options} className="w-fit max-w-full" scroll />;
}

/* ---------- Página ---------- */
export default function ProposalNew() {
  const { t, e, lang } = useT();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const leads = useApp((s) => s.leads);
  const rules = useApp((s) => s.rules);
  const proposals = useApp((s) => s.proposals);

  const initialId = leads.some((l) => l.id === params.get('lead')) ? params.get('lead')! : 'L-001';
  const [leadId, setLeadId] = useState(initialId);
  const lead = leads.find((l) => l.id === leadId)!;
  const brand = brandById(lead.brandId);
  const score = computeScore(lead, rules);

  const [q, setQ] = useState<Questionnaire>(() => defaultQuestionnaire(lead));
  const [template, setTemplate] = useState<TemplateId>('llave');
  const [phase, setPhase] = useState<Phase>('idle');
  const [step, setStep] = useState(0); // pasos del análisis completados
  const [typed, setTyped] = useState<Record<string, number>>({});
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [genSnapshot, setGenSnapshot] = useState<string>('');
  const [tab, setTab] = useState<'q' | 'draft'>('q');
  const [pdf, setPdf] = useState(false);
  const [sent, setSent] = useState(false);

  const timers = useRef<number[]>([]);
  const draftRef = useRef<HTMLDivElement>(null);
  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  // Cambio de lead → cuestionario precargado y borrador en cero
  const changeLead = (id: string) => {
    clearTimers();
    const l = leads.find((x) => x.id === id)!;
    setLeadId(id);
    setQ(defaultQuestionnaire(l));
    setPhase('idle');
    setTyped({});
    setEdits({});
    setSent(false);
    setStep(0);
  };

  const defaults = useMemo(() => defaultQuestionnaire(lead), [lead]);
  const editedKeys = (Object.keys(q) as (keyof Questionnaire)[]).filter((k) => q[k] !== defaults[k]);

  // El texto se deriva siempre de respuestas + plantilla + idioma
  const target: DraftSection[] = useMemo(() => buildDraft(lead, q, template, lang), [lead, q, template, lang]);
  const [frozen, setFrozen] = useState<{ q: Questionnaire; template: TemplateId } | null>(null);
  const sections: DraftSection[] = useMemo(
    () => (frozen ? buildDraft(lead, frozen.q, frozen.template, lang) : target),
    [frozen, lead, lang, target],
  );
  const body = (s: DraftSection) => edits[s.id] ?? s.body;
  const totalChars = sections.reduce((a, s) => a + s.body.length, 0);
  const typedChars = sections.reduce((a, s) => a + Math.min(typed[s.id] ?? 0, s.body.length), 0);
  const changedAfter = phase === 'done' && genSnapshot !== JSON.stringify({ q, template });

  const proposalId = `P-NEW-${lead.id}`;
  const existing: Proposal | undefined = proposals.find((p) => p.id === proposalId);
  const versionNum = (existing?.versions.length ?? 0) + 1;

  /* ---- Streaming ---- */
  const streamSections = useCallback(
    (list: DraftSection[], onEnd: () => void) => {
      let si = 0;
      let ci = 0;
      setStreamingId(list[0]?.id ?? null);
      const iv = window.setInterval(() => {
        const s = list[si];
        if (!s) {
          clearInterval(iv);
          setStreamingId(null);
          onEnd();
          return;
        }
        ci += CHARS_PER_TICK;
        const val = Math.min(ci, s.body.length);
        setTyped((p) => ({ ...p, [s.id]: val }));
        if (ci >= s.body.length) {
          si += 1;
          ci = 0;
          setStreamingId(list[si]?.id ?? null);
        }
      }, TICK_MS);
      timers.current.push(iv);
    },
    [],
  );

  const generate = useCallback(() => {
    clearTimers();
    const snap = { q: { ...q }, template };
    setFrozen(snap);
    setGenSnapshot(JSON.stringify(snap));
    setEdits({});
    setTyped({});
    setSent(false);
    setPhase('analyzing');
    setStep(0);
    setTab('draft');
    [800, 1650, 2450].forEach((ms, i) => timers.current.push(window.setTimeout(() => setStep(i + 1), ms)));
    timers.current.push(
      window.setTimeout(() => {
        setPhase('streaming');
        const list = buildDraft(lead, snap.q, snap.template, useApp.getState().lang);
        streamSections(list, () => {
          setPhase('done');
          const s = useApp.getState();
          s.toast(tr('gen.toast.generated', s.lang, { name: lead.name }));
        });
      }, 2700),
    );
  }, [clearTimers, q, template, lead, streamSections]);

  const skip = () => {
    clearTimers();
    setStreamingId(null);
    setStep(3);
    setTyped(Object.fromEntries(sections.map((s) => [s.id, s.body.length])));
    setPhase('done');
  };

  const regenSection = (s: DraftSection) => {
    if (phase !== 'done') return;
    clearTimers();
    setEdits((p) => {
      const n = { ...p };
      delete n[s.id];
      return n;
    });
    setTyped((p) => ({ ...p, [s.id]: 0 }));
    setPhase('streaming');
    streamSections([s], () => {
      setPhase('done');
      const st = useApp.getState();
      st.toast(tr('gen.toast.regen', st.lang));
    });
  };

  // Auto-scroll del panel del borrador mientras escribe
  useEffect(() => {
    if (phase !== 'streaming' || !streamingId) return;
    const el = document.getElementById(`sec-${streamingId}`);
    const box = draftRef.current;
    if (el && box && box.scrollHeight > box.clientHeight) {
      box.scrollTo({ top: el.offsetTop - 24 + Math.max(0, el.offsetHeight - box.clientHeight + 80), behavior: 'smooth' });
    }
  }, [phase, streamingId, typed]);

  /* ---- Versiones / envío ---- */
  const currentVersion = (): ProposalVersion => {
    const es = buildDraft(lead, frozen?.q ?? q, frozen?.template ?? template, 'es');
    const en = buildDraft(lead, frozen?.q ?? q, frozen?.template ?? template, 'en');
    return {
      version: versionNum,
      daysAgo: 0,
      authorId: 'u-daniel',
      summary: [tr(versionNum === 1 ? 'gen.ver.summaryFirst' : 'gen.ver.summaryNext', 'es'), tr(versionNum === 1 ? 'gen.ver.summaryFirst' : 'gen.ver.summaryNext', 'en')] as Bi,
      sections: es.map((s, i) => {
        const ed = edits[s.id];
        return { title: [s.title, en[i].title] as Bi, body: (ed ? [ed, ed] : [s.body, en[i].body]) as Bi };
      }),
    };
  };

  const saveVersion = (status: Proposal['status'] = existing?.status ?? 'borrador') => {
    const v = currentVersion();
    const p: Proposal = {
      id: proposalId,
      leadId: lead.id,
      brandId: lead.brandId,
      template: frozen?.template ?? template,
      status,
      daysAgo: 0,
      versions: [...(existing?.versions ?? []), v],
    };
    useApp.getState().upsertProposal(p);
    return v.version;
  };

  const onSave = () => {
    const v = saveVersion();
    useApp.getState().toast(t('gen.toast.saved', { v }));
  };

  const onSend = () => {
    saveVersion('enviada');
    const s = useApp.getState();
    if (lead.stage !== 'propuesta') s.moveLead(lead.id, 'propuesta', 'u-daniel');
    setSent(true);
    s.toast(t('gen.toast.sent', { name: lead.name }));
  };

  const restore = (v: ProposalVersion) => {
    const idx = lang === 'es' ? 0 : 1;
    setEdits(Object.fromEntries(sections.map((s, i) => [s.id, v.sections[i]?.body[idx] ?? s.body])));
    useApp.getState().toast(t('gen.toast.restored', { v: v.version }), 'info');
  };

  const busy = phase === 'analyzing' || phase === 'streaming';
  const words = sections.reduce((a, s) => a + body(s).split(/\s+/).filter(Boolean).length, 0);
  const templateLabel = t(template === 'llave' ? 'gen.tpl.llave' : 'gen.tpl.master');

  /* ---------- Columna izquierda ---------- */
  const left = (
    <div className="space-y-4">
      {/* Prospecto */}
      <div className="card p-4 sm:p-5">
        <label className="label" htmlFor="lead">
          {t('gen.lead.label')}
        </label>
        <select id="lead" className="input" value={leadId} onChange={(ev) => changeLead(ev.target.value)} disabled={busy}>
          {[...leads]
            .sort((a, b) => computeScore(b, rules) - computeScore(a, rules))
            .map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} · {computeScore(l, rules)} · {brandById(l.brandId).name}
              </option>
            ))}
        </select>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <div className="kpi-label">{t('gen.lead.score')}</div>
            <div className="mt-1.5">
              <ScoreBadge score={score} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="kpi-label">{t('gen.lead.brand')}</div>
            <div className="mt-1.5 flex items-center gap-1.5 truncate text-sm font-semibold text-ink">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: brand.color }} />
              {brand.name}
            </div>
          </div>
          <div className="min-w-0">
            <div className="kpi-label">{t('gen.lead.stage')}</div>
            <div className="mt-1.5 truncate text-sm text-ink">{e('stage', lead.stage)}</div>
          </div>
          <div className="min-w-0">
            <div className="kpi-label">{t('gen.lead.capital')}</div>
            <div className="num mt-1.5 truncate text-sm text-ink">{fmtBRL(lead.capital)}</div>
          </div>
        </div>
      </div>

      {/* Cuestionario */}
      <div className="card px-4 pt-4 sm:px-5 sm:pt-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="section-title text-base">{t('gen.q.title')}</div>
            <div className="text-xs text-muted">{t('gen.q.subtitle')}</div>
          </div>
          {editedKeys.length > 0 ? (
            <button className="btn-ghost btn-sm" onClick={() => setQ(defaults)}>
              <RotateCcw size={14} />
              {t('gen.q.reset')} · {t('gen.q.editedCount', { n: editedKeys.length })}
            </button>
          ) : (
            <Badge tone="ok">
              <Check size={11} />
              {t('gen.q.prefilled')}
            </Badge>
          )}
        </div>
        <div className="mt-2">
          <QRow n={1} label={t('gen.q.capital')} edited={editedKeys.includes('capital')}>
            <div className="flex flex-wrap items-center gap-3">
              <input type="number" step={50000} className="input num w-44" value={q.capital} onChange={(ev) => setQ({ ...q, capital: Math.max(0, Number(ev.target.value) || 0) })} />
              <span className="num text-sm text-ink2">{fmtBRL(q.capital)}</span>
            </div>
          </QRow>
          <QRow n={2} label={t('gen.q.timeline')} edited={editedKeys.includes('timeline')}>
            <Choice value={q.timeline} onChange={(v) => setQ({ ...q, timeline: v })} options={(['3', '6', '12'] as const).map((m) => ({ value: m, label: t('gen.q.months', { n: m }) }))} />
          </QRow>
          <QRow n={3} label={t('gen.q.zone')} edited={editedKeys.includes('zone')}>
            <select className="input" value={q.zone} onChange={(ev) => setQ({ ...q, zone: ev.target.value })}>
              {malls.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </QRow>
          <QRow n={4} label={t('gen.q.partners')} edited={editedKeys.includes('partners')}>
            <Choice value={q.partners} onChange={(v) => setQ({ ...q, partners: v })} options={[{ value: 'solo', label: t('gen.q.solo') }, { value: 'socios', label: t('gen.q.socios') }]} />
          </QRow>
          <QRow n={5} label={t('gen.q.foodYears')} edited={editedKeys.includes('foodYears')}>
            <Stepper value={q.foodYears} onChange={(v) => setQ({ ...q, foodYears: v })} step={1} min={0} unit={t('gen.q.years')} />
          </QRow>
          <QRow n={6} label={t('gen.q.sqm')} edited={editedKeys.includes('sqm')}>
            <Stepper value={q.sqm} onChange={(v) => setQ({ ...q, sqm: v })} step={10} min={20} unit="m²" />
          </QRow>
          <QRow n={7} label={t('gen.q.roi')} edited={editedKeys.includes('roiMonths')}>
            <Stepper value={q.roiMonths} onChange={(v) => setQ({ ...q, roiMonths: v })} step={2} min={6} unit={t('gen.q.monthsUnit')} />
          </QRow>
          <QRow n={8} label={t('gen.q.premises')} edited={editedKeys.includes('premises')}>
            <Choice value={q.premises} onChange={(v) => setQ({ ...q, premises: v })} options={[{ value: 'shopping', label: t('gen.q.shopping') }, { value: 'propio', label: t('gen.q.propio') }]} />
          </QRow>
        </div>
      </div>

      {/* Plantilla */}
      <div className="card p-4 sm:p-5">
        <div className="section-title mb-3 text-base">{t('gen.tpl.title')}</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {(['llave', 'master'] as const).map((id) => (
            <button
              key={id}
              onClick={() => setTemplate(id)}
              className={cn('rounded-card border p-3.5 text-left transition', template === id ? 'border-accent bg-accent-soft ring-2 ring-accent/20' : 'border-line hover:border-line-strong')}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn('text-[13.5px] font-semibold', template === id ? 'text-accent' : 'text-ink')}>{t(`gen.tpl.${id}`)}</span>
                <span className={cn('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border', template === id ? 'border-accent bg-accent text-white' : 'border-line-strong')}>
                  {template === id && <Check size={10} strokeWidth={3} />}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink2">{t(`gen.tpl.${id}Desc`)}</p>
              {id === 'llave' && <span className="pill mt-2 bg-ok/10 text-ok">{t('gen.tpl.recommended')}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* CTA grande (desktop) */}
      <div className="hidden lg:block">
        <button
          data-trailer="btn-generar"
          onClick={generate}
          disabled={busy}
          className="group relative flex min-h-[60px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-brand text-[15px] font-semibold text-brand-fg shadow-md transition hover:opacity-95 disabled:opacity-60"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {busy ? t('gen.btn.generating') : phase === 'done' ? t('gen.btn.regenerate') : t('gen.btn.generate')}
        </button>
        <div className="mt-2 text-center text-xs text-muted">{t('gen.hint.time')}</div>
      </div>
    </div>
  );

  /* ---------- Columna derecha ---------- */
  const steps = ['gen.step.read', 'gen.step.template', 'gen.step.write'];
  const right = (
    <div className="card flex flex-col overflow-hidden lg:sticky lg:top-24 lg:max-h-[calc(100dvh-120px)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FileText size={16} className="shrink-0 text-accent" />
          <span className="truncate text-sm font-semibold text-ink">{t('gen.tabs.draft')}</span>
          <span className="pill num border border-line bg-subtle text-ink2">
            v{phase === 'done' ? versionNum : '–'} {phase === 'done' && <span className="font-sans font-normal text-muted">· {t('gen.ver.unsaved')}</span>}
          </span>
          {sent && <Badge tone="ok">{e('proposalStatus', 'enviada')}</Badge>}
        </div>
        {phase === 'streaming' && (
          <button className="btn-ghost btn-sm" onClick={skip}>
            {t('gen.btn.skip')}
          </button>
        )}
        {phase === 'done' && (
          <div className="flex flex-wrap gap-1.5">
            <button className="btn-secondary btn-sm" onClick={onSave}>
              <Save size={14} />
              {t('gen.btn.save')}
            </button>
            <button className="btn-secondary btn-sm hidden sm:inline-flex" onClick={() => setPdf(true)}>
              <FileDown size={14} />
              {t('gen.btn.exportPdf')}
            </button>
            <button className="btn-primary btn-sm" onClick={onSend}>
              <Send size={14} />
              {sent ? t('gen.btn.resend') : t('gen.btn.send')}
            </button>
          </div>
        )}
      </div>

      {/* Progreso */}
      {(phase === 'streaming' || phase === 'done') && (
        <div className="h-1 w-full bg-subtle">
          <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${phase === 'done' ? 100 : (typedChars / totalChars) * 100}%` }} />
        </div>
      )}

      <div ref={draftRef} className="min-h-[420px] flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {phase === 'idle' && (
          <div className="flex h-full min-h-[380px] flex-col items-center justify-center text-center">
            <div className="relative">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Wand2 size={28} />
              </span>
              <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-card text-accent shadow-md">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="mt-5 text-lg font-semibold text-ink">{t('gen.empty.title')}</div>
            <p className="mt-1 max-w-sm text-sm text-ink2">{t('gen.empty.text')}</p>
            <div className="mt-6 w-full max-w-sm rounded-card border border-dashed border-line-strong p-4 text-left">
              <div className="kpi-label mb-2">{t('gen.empty.includes')}</div>
              <ol className="space-y-1.5 text-[13px] text-ink2">
                {target.map((s) => (
                  <li key={s.id} className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0 text-accent" />
                    {s.title.replace(/^\d+\.\s*/, '')}
                  </li>
                ))}
              </ol>
              <div className="mt-3 text-[11px] text-muted">{t('gen.empty.meta')}</div>
            </div>
          </div>
        )}

        {phase === 'analyzing' && (
          <div className="flex min-h-[380px] flex-col items-center justify-center">
            <span className="relative flex h-14 w-14 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white dark:text-[#071a2e]">
                <Sparkles size={24} />
              </span>
            </span>
            <div className="mt-5 text-lg font-semibold text-ink">{t('gen.analyzing.title')}</div>
            <div className="text-sm text-muted">{t('gen.analyzing.sub', { name: lead.name })}</div>
            <ul className="mt-6 w-full max-w-xs space-y-3">
              {steps.map((k, i) => {
                const done = step > i;
                const current = step === i;
                return (
                  <li key={k} className="flex items-center gap-3 text-sm">
                    <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors', done ? 'border-accent bg-accent text-white dark:text-[#071a2e]' : 'border-line-strong')}>
                      {done ? (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }}>
                          <Check size={13} strokeWidth={3} />
                        </motion.span>
                      ) : current ? (
                        <Loader2 size={13} className="animate-spin text-accent" />
                      ) : null}
                    </span>
                    <span className={done ? 'text-ink' : current ? 'font-medium text-ink' : 'text-muted'}>{t(k)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {(phase === 'streaming' || phase === 'done') && (
          <article className="mx-auto max-w-[680px]">
            {changedAfter && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-ctl border border-warn/30 bg-warn/[0.07] px-3 py-2 text-[13px] text-ink">
                {t('gen.changed')}
                <button className="btn-secondary btn-sm" onClick={generate}>
                  <RefreshCw size={13} />
                  {t('gen.changedCta')}
                </button>
              </div>
            )}
            <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">{t('gen.doc.kicker')} · {brand.name}</div>
                <div className="mt-1 text-xl font-bold tracking-tight text-ink">
                  {t('gen.doc.for')} {lead.name}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="accent">
                  <Sparkles size={11} />
                  {t('gen.doc.aiBadge')}
                </Badge>
                {phase === 'done' && <span className="num text-xs text-muted">{t('gen.doc.words', { n: words })}</span>}
              </div>
            </header>
            <div className="mb-4 text-xs font-medium text-muted" aria-live="polite">
              {phase === 'streaming'
                ? streamingId
                  ? t('gen.stream.writing', { n: sections.findIndex((s) => s.id === streamingId) + 1, total: sections.length })
                  : t('gen.stream.regen')
                : t('gen.stream.done')}
            </div>
            <div className="space-y-6">
              {sections.map((s) => {
                const n = typed[s.id] ?? 0;
                if (n <= 0 && streamingId !== s.id) return null;
                const isTyping = phase === 'streaming' && streamingId === s.id;
                const editable = phase === 'done';
                return (
                  <section key={s.id} id={`sec-${s.id}`} className="group fade-up">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <h3 className="text-[15px] font-semibold text-ink">{s.title}</h3>
                      {editable && (
                        <div className="flex items-center gap-1">
                          {edits[s.id] !== undefined && <Badge tone="neutral">{t('gen.doc.edited')}</Badge>}
                          <button className="inline-flex min-h-[36px] items-center gap-1 rounded-full px-2 text-xs font-medium text-accent hover:bg-accent-soft" onClick={() => regenSection(s)}>
                            <RefreshCw size={12} />
                            <span className="hidden sm:inline">{t('gen.btn.regenSection')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                    {editable ? (
                      <AutoTextarea value={body(s)} onChange={(v) => setEdits((p) => ({ ...p, [s.id]: v }))} />
                    ) : (
                      <div className="text-[14px] leading-relaxed text-ink2">
                        <Paragraphs text={s.body.slice(0, n)} />
                        {isTyping && <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-accent align-middle" />}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </article>
        )}
      </div>

      {/* Historial mínimo */}
      {phase === 'done' && (
        <div className="border-t border-line px-4 py-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink2">
            <History size={13} />
            {t('gen.ver.title')}
          </div>
          {existing?.versions.length ? (
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              {existing.versions.map((v) => (
                <button key={v.version} onClick={() => restore(v)} className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full border border-line px-3 text-xs text-ink hover:border-accent">
                  <span className="num font-semibold">v{v.version}</span>
                  <span className="text-muted">{fmtAgo(v.daysAgo, lang)}</span>
                </button>
              ))}
              <button onClick={() => navigate(`/admin/propuestas/${proposalId}`)} className="inline-flex min-h-[36px] shrink-0 items-center rounded-full px-3 text-xs font-medium text-accent hover:underline">
                {t('gen.btn.openProposal')} →
              </button>
            </div>
          ) : (
            <div className="text-xs text-muted">{t('gen.ver.none')}</div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        kicker={t('kicker.admin')}
        title={t('gen.title')}
        subtitle={t('gen.subtitle')}
        actions={
          <Link to="/admin/propuestas" className="btn-secondary btn-sm">
            <FileText size={14} />
            {t('nav.propuestas')}
          </Link>
        }
      />
      <PreviewBanner bullets={[t('gen.banner.1'), t('gen.banner.2'), t('gen.banner.3')]} />
      <DevNotice feature={t('gen.dev.feature')} now={t('gen.dev.now')} later={t('gen.dev.later')} />

      {/* Tabs mobile */}
      <div className="sticky top-14 z-30 -mx-4 mb-4 bg-bg/95 px-4 py-2 backdrop-blur lg:hidden">
        <Segmented
          value={tab}
          onChange={setTab}
          className="w-full [&>button]:flex-1 [&>button]:justify-center"
          options={[
            { value: 'q', label: t('gen.tabs.q') },
            { value: 'draft', label: <span className="inline-flex items-center gap-1.5">{t('gen.tabs.draft')}{busy && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />}</span> },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className={cn('lg:col-span-5', tab !== 'q' && 'hidden lg:block')}>{left}</div>
        <div className={cn('min-w-0 lg:col-span-7', tab !== 'draft' && 'hidden lg:block')}>{right}</div>
      </div>

      <FixedBottomBar>
        <button onClick={generate} disabled={busy} className="btn-primary flex-1">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {busy ? t('gen.btn.generating') : phase === 'done' ? t('gen.btn.regenShort') : t('gen.btn.genShort')}
        </button>
        <button onClick={() => setPdf(true)} disabled={phase !== 'done'} className="btn-secondary flex-1">
          <FileDown size={16} />
          {t('gen.btn.export')}
        </button>
      </FixedBottomBar>

      <PdfPreview
        open={pdf}
        onClose={() => setPdf(false)}
        sections={sections.map((s) => ({ ...s, body: body(s) }))}
        leadName={lead.name}
        brand={brand.name}
        templateLabel={templateLabel}
      />
    </div>
  );
}

function AutoTextarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 2 + 'px';
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(ev) => onChange(ev.target.value)}
      rows={3}
      className="w-full resize-none rounded-ctl border border-transparent bg-transparent px-2 py-1.5 -mx-2 text-[14px] leading-relaxed text-ink2 outline-none transition hover:border-line focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent/20"
    />
  );
}
