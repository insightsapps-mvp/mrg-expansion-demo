import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRightLeft,
  CalendarCheck,
  CalendarPlus,
  ChevronRight,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
  StickyNote,
  Users as UsersIcon,
} from 'lucide-react';
import { PageHeader, PreviewBanner, ScoreBadge, Avatar, Badge, MoveMenu, Modal, Segmented, FixedBottomBar, Empty } from '@/components/ui';
import { useT, tr, en } from '@/i18n';
import { useApp } from '@/store';
import { STAGES } from '@/data/leads';
import { brandById } from '@/data/brands';
import { userById } from '@/data/users';
import { computeScore, RISK_DAYS, RISK_SCORE } from '@/config/scoring';
import { fmtAgo, fmtBRL, fmtDate } from '@/lib/format';
import type { InteractionType, LeadStage, ProposalStatus } from '@/types';
import { isAtRisk, ScoreBars } from './_components/crm/shared';

const ICONS: Record<InteractionType, typeof Phone> = {
  llamada: Phone,
  mail: Mail,
  reunion: UsersIcon,
  nota: StickyNote,
  whatsapp: MessageCircle,
  etapa: ArrowRightLeft,
};

const STATUS_TONE: Record<ProposalStatus, 'neutral' | 'accent' | 'ok' | 'danger'> = {
  borrador: 'neutral',
  enviada: 'accent',
  aceptada: 'ok',
  rechazada: 'danger',
};

const pad = (n: number) => String(n).padStart(2, '0');
const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function DataRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 border-b border-line py-2.5 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-xs text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-ink sm:text-right">{children}</dd>
    </div>
  );
}

export default function LeadDetail() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { t, b, e, lang } = useT();
  const lead = useApp((s) => s.leads.find((l) => l.id === leadId));
  const rules = useApp((s) => s.rules);
  const allInteractions = useApp((s) => s.interactions);
  const allProposals = useApp((s) => s.proposals);

  const [note, setNote] = useState('');
  const [schedOpen, setSchedOpen] = useState(false);
  const [schedDate, setSchedDate] = useState(tomorrowISO);
  const [schedTime, setSchedTime] = useState('10:00');
  const [schedType, setSchedType] = useState<'llamada' | 'reunion'>('llamada');
  const [scheduled, setScheduled] = useState<string | null>(null);

  const interactions = useMemo(
    () => allInteractions.filter((i) => i.leadId === leadId).sort((a, c) => a.daysAgo - c.daysAgo),
    [allInteractions, leadId],
  );
  const proposals = useMemo(() => allProposals.filter((p) => p.leadId === leadId), [allProposals, leadId]);

  if (!lead) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <Empty text={t('lead.notFound')} />
        <Link to="/admin/crm" className="btn-secondary mt-4">
          {t('lead.backCrm')}
        </Link>
      </div>
    );
  }

  const score = computeScore(lead, rules);
  const risk = isAtRisk(score, lead);
  const brand = brandById(lead.brandId);
  const owner = userById(lead.ownerId);

  const goProposal = () => navigate(`/admin/propuestas/nueva?lead=${lead.id}`);
  const moveOptions = STAGES.map((s) => ({ value: s, label: e('stage', s) }));
  const move = (stage: LeadStage) => {
    const s = useApp.getState();
    if (stage === lead.stage) return;
    s.moveLead(lead.id, stage, 'u-daniel');
    s.toast(tr('crm.moved', s.lang, { name: lead.name, stage: en('stage', stage, s.lang) }));
  };

  const addNote = () => {
    const txt = note.trim();
    if (!txt) return;
    const s = useApp.getState();
    s.addInteraction({ id: `i-${Date.now()}`, leadId: lead.id, type: 'nota', authorId: 'u-daniel', daysAgo: 0, text: [txt, txt] });
    s.toast(tr('lead.noteSaved', s.lang));
    setNote('');
  };

  const saveSchedule = () => {
    const s = useApp.getState();
    const [y, m, d] = schedDate.split('-').map(Number);
    const [hh, mm] = schedTime.split(':').map(Number);
    const date = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);
    const iso = date.toISOString();
    s.addEvent({
      id: `ev-${Date.now()}`,
      date: iso,
      durationMin: schedType === 'reunion' ? 60 : 30,
      type: schedType,
      title: [tr('lead.sched.eventTitle', 'es', { name: lead.name }), tr('lead.sched.eventTitle', 'en', { name: lead.name })],
      leadId: lead.id,
      brandId: lead.brandId,
      ownerId: 'u-daniel',
      reminder: true,
    });
    s.toast(tr('lead.sched.done', s.lang));
    setScheduled(iso);
    setSchedOpen(false);
  };

  return (
    <div className="min-w-0">
      {/* Breadcrumb */}
      <nav className="mb-3 flex min-w-0 items-center gap-1 text-[13px] text-muted">
        <Link to="/admin/crm" className="inline-flex min-h-[44px] items-center hover:text-ink">
          {t('lead.crumb')}
        </Link>
        <ChevronRight size={14} className="shrink-0" />
        <span className="truncate font-medium text-ink">{lead.name}</span>
      </nav>

      <PageHeader
        kicker={t('kicker.admin')}
        title={lead.name}
        subtitle={`${lead.city} · ${brand?.name ?? ''}`}
        actions={
          <div className="hidden gap-2 lg:flex">
            <button className="btn-primary" onClick={goProposal}>
              <Sparkles size={16} />
              {t('lead.genProposal')}
            </button>
            <button className="btn-secondary" onClick={() => setSchedOpen(true)}>
              <CalendarPlus size={16} />
              {t('lead.schedule')}
            </button>
            <MoveMenu label={t('lead.move')} options={moveOptions} current={lead.stage} onSelect={move} />
          </div>
        }
      />

      {/* Meta */}
      <div className="-mt-2 mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-ink2">
        <span className="flex items-center gap-1.5">
          <span className="text-muted">{t('lead.stage')}:</span>
          <Badge tone="accent">{e('stage', lead.stage)}</Badge>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-muted">{t('lead.origin')}:</span>
          {e('origin', lead.origin)}
        </span>
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="text-muted">{t('lead.owner')}:</span>
          <Avatar userId={lead.ownerId} size={22} />
          <span className="truncate">{owner?.name}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-muted">{t('lead.created')}:</span>
          {fmtAgo(lead.createdDaysAgo, lang)}
        </span>
      </div>

      <PreviewBanner bullets={[t('lead.banner1'), t('lead.banner2'), t('lead.banner3')]} />

      {risk && (
        <div className="mb-5 flex gap-3 rounded-card border border-warn/30 bg-warn/[0.08] px-4 py-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warn" />
          <div className="min-w-0 text-[13px]">
            <div className="font-semibold text-warn">{t('lead.riskTitle', { n: lead.lastContactDays })}</div>
            <div className="mt-0.5 text-ink2">{t('lead.riskBody', { score: RISK_SCORE, days: RISK_DAYS })}</div>
          </div>
        </div>
      )}

      {scheduled && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-card border border-accent/30 bg-accent-soft px-4 py-2">
          <CalendarCheck size={18} className="shrink-0 text-accent" />
          <span className="min-w-0 flex-1 text-[13px] font-medium text-ink">
            {t('lead.sched.confirm', { date: fmtDate(scheduled, 'd MMM · HH:mm', lang) })}
          </span>
          <Link to="/admin/calendario" className="btn-ghost btn-sm min-h-[44px] text-accent">
            {t('lead.sched.view')}
            <ChevronRight size={14} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Columna izquierda */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* Score */}
          <section className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="section-title text-base">{t('lead.scoreTitle')}</div>
                <div className="text-xs text-muted">{t('lead.scoreHint')}</div>
              </div>
              <Link to="/admin/scoring" className="btn-ghost btn-sm min-h-[44px] shrink-0">
                {t('lead.editRules')}
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="num text-[64px] font-bold leading-none tracking-tight text-ink">{score}</div>
              <div className="flex flex-col gap-1.5">
                <ScoreBadge score={score} />
                <span className="text-xs text-muted">{t('lead.of100')}</span>
              </div>
            </div>
            <div className="mt-6">
              <ScoreBars input={lead} rules={rules} />
            </div>
          </section>

          {/* Datos */}
          <section className="card p-5">
            <div className="section-title mb-2 text-base">{t('lead.data')}</div>
            <dl>
              <DataRow label={t('lead.email')}>
                <a href={`mailto:${lead.email}`} className="text-accent hover:underline">
                  {lead.email}
                </a>
              </DataRow>
              <DataRow label={t('lead.phone')}>
                <a href={`tel:${lead.phone.replace(/\s/g, '')}`} className="num text-accent hover:underline">
                  {lead.phone}
                </a>
              </DataRow>
              <DataRow label={t('lead.capital')}>
                <span className="num font-semibold">{fmtBRL(lead.capital)}</span>
              </DataRow>
              <DataRow label={t('lead.sector')}>{e('sector', lead.sector)}</DataRow>
              <DataRow label={t('lead.experience')}>
                {e('experience', lead.experience)}
                {lead.experienceYears > 0 && <span className="text-muted"> · {t('lead.years', { n: lead.experienceYears })}</span>}
              </DataRow>
              <DataRow label={t('lead.location')}>{e('location', lead.location)}</DataRow>
              <DataRow label={t('lead.zone')}>{lead.desiredZone || '—'}</DataRow>
            </dl>
          </section>

          {/* Propuestas */}
          <section className="card p-5">
            <div className="section-title mb-3 text-base">{t('lead.proposals')}</div>
            {proposals.length === 0 ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-muted">{t('lead.noProposals')}</p>
                <button className="btn-secondary btn-sm min-h-[44px]" onClick={goProposal}>
                  <Sparkles size={14} />
                  {t('lead.genProposal')}
                </button>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {proposals.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/admin/propuestas/${p.id}`}
                      className="flex min-h-[56px] items-center gap-3 rounded-ctl border border-line px-3 py-2.5 transition hover:border-line-strong hover:bg-subtle"
                    >
                      <FileText size={18} className="shrink-0 text-muted" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="num text-[13px] font-semibold text-ink">{p.id}</span>
                          <span className="truncate text-xs text-muted">{t(`lead.template.${p.template}`)}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.versions.map((v) => (
                            <span key={v.version} className="num rounded-full border border-line px-1.5 text-[10.5px] text-ink2">
                              v{v.version}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge tone={STATUS_TONE[p.status]}>{e('proposalStatus', p.status)}</Badge>
                        <span className="text-[11px] text-muted">{fmtAgo(p.daysAgo, lang)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Columna derecha: timeline */}
        <section className="card min-w-0 self-start p-5">
          <div className="section-title mb-3 text-base">{t('lead.timeline')}</div>
          <div className="mb-5">
            <textarea
              className="input min-h-[88px] py-2.5"
              value={note}
              onChange={(ev) => setNote(ev.target.value)}
              placeholder={t('lead.notePh')}
              aria-label={t('lead.addNote')}
            />
            <div className="mt-2 flex justify-end">
              <button className="btn-primary btn-sm min-h-[44px]" disabled={!note.trim()} onClick={addNote}>
                <StickyNote size={14} />
                {t('lead.addNote')}
              </button>
            </div>
          </div>
          {interactions.length === 0 ? (
            <Empty text={t('lead.noInteractions')} />
          ) : (
            <ol className="relative flex flex-col">
              {interactions.map((it, idx) => {
                const Icon = ICONS[it.type];
                const author = userById(it.authorId);
                return (
                  <li key={it.id} className="relative flex gap-3 pb-5 last:pb-0">
                    {idx < interactions.length - 1 && <span className="absolute bottom-0 left-[17px] top-9 w-px bg-line" aria-hidden />}
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-subtle text-ink2">
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span className="font-semibold text-ink">{e('interaction', it.type)}</span>
                        <span className="text-muted">·</span>
                        <span className="text-muted">{fmtAgo(it.daysAgo, lang)}</span>
                      </div>
                      <p className="mt-1 break-words text-[13px] text-ink2">{b(it.text)}</p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                        <Avatar userId={it.authorId} size={18} />
                        <span className="truncate">{author?.name}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>

      {/* Acciones mobile */}
      <FixedBottomBar>
        <button className="btn-primary min-w-0 flex-1" onClick={goProposal}>
          <Sparkles size={16} className="shrink-0" />
          <span className="truncate">{t('lead.genProposalShort')}</span>
        </button>
        <button className="btn-secondary w-11 shrink-0 px-0" onClick={() => setSchedOpen(true)} aria-label={t('lead.schedule')} title={t('lead.schedule')}>
          <CalendarPlus size={18} />
        </button>
        <MoveMenu label={t('lead.moveShort')} options={moveOptions} current={lead.stage} onSelect={move} />
      </FixedBottomBar>

      {/* Modal agendar */}
      <Modal
        open={schedOpen}
        onClose={() => setSchedOpen(false)}
        title={t('lead.sched.title', { name: lead.name })}
        width={440}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setSchedOpen(false)}>
              {t('common.cancel')}
            </button>
            <button className="btn-primary" disabled={!schedDate || !schedTime} onClick={saveSchedule}>
              <CalendarPlus size={16} />
              {t('lead.sched.save')}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <span className="label">{t('lead.sched.type')}</span>
            <Segmented
              value={schedType}
              onChange={setSchedType}
              options={[
                { value: 'llamada', label: e('eventType', 'llamada') },
                { value: 'reunion', label: e('eventType', 'reunion') },
              ]}
              className="w-fit"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="min-w-0">
              <span className="label">{t('lead.sched.date')}</span>
              <input type="date" className="input" value={schedDate} onChange={(ev) => setSchedDate(ev.target.value)} />
            </label>
            <label className="min-w-0">
              <span className="label">{t('lead.sched.time')}</span>
              <input type="time" className="input" value={schedTime} onChange={(ev) => setSchedTime(ev.target.value)} />
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
