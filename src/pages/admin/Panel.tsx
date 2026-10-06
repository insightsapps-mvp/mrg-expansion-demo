import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, isSameDay, startOfDay, subMonths } from 'date-fns';
import { AlertTriangle, ChevronRight, Clock, FilePlus2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '@/store';
import { tr, useT } from '@/i18n';
import { greetingKey } from '@/layout/useNavActions';
import { computeScore, RISK_DAYS, RISK_SCORE } from '@/config/scoring';
import { fmtDate } from '@/lib/format';
import { Avatar, Badge, ChartCard, Empty, KpiCard, PageHeader, PreviewBanner, ScoreBadge, axisProps, chartTooltipStyle } from '@/components/ui';
import { EVENT_COLOR } from '@/components/calendar/CalendarView';
import { STAGES } from '@/data/leads';
import { brands } from '@/data/brands';
import { units } from '@/data/units';
import { projects } from '@/data/projects';

export default function AdminPanel() {
  const { t, b, e, lang } = useT();
  const navigate = useNavigate();
  const leads = useApp((s) => s.leads);
  const rules = useApp((s) => s.rules);
  const proposals = useApp((s) => s.proposals);
  const events = useApp((s) => s.events);

  const scored = useMemo(() => leads.map((l) => ({ lead: l, score: computeScore(l, rules) })), [leads, rules]);

  const newThisWeek = leads.filter((l) => l.createdDaysAgo <= 7 && l.stage !== 'cerrado').length;
  const avgScore = scored.length ? Math.round(scored.reduce((s, x) => s + x.score, 0) / scored.length) : 0;
  const hotLeads = scored.filter((x) => x.score >= RISK_SCORE).length;
  const sentMonth = proposals.filter((p) => p.status !== 'borrador' && p.daysAgo <= 30).length;
  const draftCount = proposals.filter((p) => p.status === 'borrador').length;

  const stageData = STAGES.map((st) => ({ stage: e('stage', st), value: leads.filter((l) => l.stage === st).length }));

  const lineData = useMemo(() => {
    const sent = [5, 7, 6, 8, 7];
    const closed = [1, 2, 1, 2, 2];
    const closedNow = proposals.filter((p) => p.status === 'aceptada' && p.daysAgo <= 30).length || 1;
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      const label = fmtDate(d, 'MMM', lang).replace('.', '');
      return {
        month: label.charAt(0).toUpperCase() + label.slice(1),
        sent: i === 5 ? sentMonth : sent[i],
        closed: i === 5 ? closedNow : closed[i],
      };
    });
  }, [proposals, sentMonth, lang]);

  const week = useMemo(() => {
    const from = startOfDay(new Date());
    const to = addDays(from, 7);
    return events
      .filter((ev) => {
        const d = new Date(ev.date);
        return d >= from && d < to;
      })
      .sort((a, z) => +new Date(a.date) - +new Date(z.date))
      .slice(0, 5);
  }, [events]);

  const risk = scored
    .filter((x) => x.score >= RISK_SCORE && x.lead.lastContactDays > RISK_DAYS && x.lead.stage !== 'cerrado')
    .sort((a, z) => z.lead.lastContactDays - a.lead.lastContactDays);
  const late = projects.filter((p) => p.status === 'atrasado');

  const dayLabel = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (isSameDay(d, today)) return t('common.today');
    if (isSameDay(d, addDays(today, 1))) return t('panel.tomorrow');
    const s = fmtDate(d, 'EEE d', lang).replace('.', '');
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const clientOf = (leadId?: string, brandId?: string) => {
    if (leadId) {
      const l = leads.find((x) => x.id === leadId);
      if (l) return `${l.name} · ${brands.find((x) => x.id === l.brandId)?.name ?? ''}`;
    }
    if (brandId) return brands.find((x) => x.id === brandId)?.name ?? '';
    return 'MRG';
  };

  return (
    <div>
      <PageHeader
        kicker={t('kicker.admin')}
        title={t(greetingKey(), { name: 'Daniel' })}
        subtitle={t('panel.subtitle', { risk: risk.length, week: week.length })}
        actions={
          <>
            <button type="button" className="btn-secondary" onClick={() => navigate('/admin/calendario')}>
              {t('panel.openCalendar')}
            </button>
            <button type="button" className="btn-primary" onClick={() => navigate('/admin/propuestas/nueva')}>
              <FilePlus2 size={16} />
              {t('panel.newProposal')}
            </button>
          </>
        }
      />
      <PreviewBanner bullets={[t('panel.b1'), t('panel.b2'), t('panel.b3')]} />

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <KpiCard
          label={t('panel.kpiLeads')}
          value={leads.length}
          delta={t('panel.kpiLeadsDelta', { n: newThisWeek })}
          hint={t('panel.kpiLeadsHint')}
          onClick={() => navigate('/admin/crm')}
        />
        <KpiCard
          label={t('panel.kpiScore')}
          value={avgScore}
          hint={t('panel.kpiScoreHint', { n: hotLeads })}
          onClick={() => navigate('/admin/scoring')}
        />
        <KpiCard
          label={t('panel.kpiProposals')}
          value={sentMonth}
          hint={t('panel.kpiProposalsHint', { n: draftCount })}
          onClick={() => navigate('/admin/propuestas')}
        />
        <KpiCard
          label={t('panel.kpiClients')}
          value={
            <span className="flex flex-wrap items-baseline gap-x-1.5">
              {brands.length}
              <span className="text-sm font-medium text-muted">{t('panel.brands')}</span>
              <span className="text-muted">/</span>
              {units.length}
              <span className="text-sm font-medium text-muted">{t('panel.units')}</span>
            </span>
          }
          hint={t('panel.kpiClientsHint', { n: units.filter((u) => u.status === 'abierta').length })}
          onClick={() => navigate('/admin/clientes')}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-5 lg:grid-cols-3">
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-2">
          <ChartCard title={t('panel.chartStages')} subtitle={t('panel.chartStagesSub')} height={260}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} {...axisProps} />
                <YAxis type="category" dataKey="stage" width={118} {...axisProps} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => [v, t('panel.leads')]} />
                <Bar
                  dataKey="value"
                  fill="var(--accent)"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                  cursor="pointer"
                  onClick={() => navigate('/admin/crm')}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title={t('panel.chartProposals')}
            subtitle={t('panel.chartProposalsSub')}
            height={260}
            actions={
              <div className="flex shrink-0 flex-col gap-1 text-[11px] text-ink2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-3 rounded bg-accent" />
                  {t('panel.sent')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-3 rounded" style={{ background: 'var(--chart-2)' }} />
                  {t('panel.closed')}
                </span>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis allowDecimals={false} {...axisProps} />
                <Tooltip {...chartTooltipStyle} cursor={{ stroke: 'var(--border-strong)' }} />
                <Line type="monotone" dataKey="sent" name={t('panel.sent')} stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="closed" name={t('panel.closed')} stroke="var(--chart-2)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="card p-4 sm:p-5 md:col-span-2">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <div className="section-title flex items-center gap-2 text-base">
                  <AlertTriangle size={16} className="text-warn" />
                  {t('panel.attention')}
                </div>
                <div className="text-xs text-muted">{t('panel.attentionSub', { score: RISK_SCORE, days: RISK_DAYS })}</div>
              </div>
              <Badge tone="warn">{risk.length + late.length}</Badge>
            </div>
            <div className="divide-y divide-line">
              {risk.map(({ lead, score }) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => navigate(`/admin/crm/${lead.id}`)}
                  className="flex min-h-[56px] w-full items-center gap-3 py-2.5 text-left transition hover:bg-subtle/60"
                >
                  <ScoreBadge score={score} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">{lead.name}</div>
                    <div className="truncate text-xs text-muted">
                      {brands.find((x) => x.id === lead.brandId)?.name} · {e('stage', lead.stage)}
                    </div>
                  </div>
                  <span className="pill shrink-0 bg-danger/10 text-danger">
                    <Clock size={12} />
                    {t('panel.noContact', { n: lead.lastContactDays })}
                  </span>
                  <ChevronRight size={16} className="hidden shrink-0 text-muted xs:block" />
                </button>
              ))}
              {late.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => useApp.getState().toast(tr('panel.projectToast', lang, { name: p.name }), 'warn')}
                  className="flex min-h-[56px] w-full items-center gap-3 py-2.5 text-left transition hover:bg-subtle/60"
                >
                  <span className="inline-flex h-6 min-w-[34px] items-center justify-center rounded-full bg-danger/10 text-danger">
                    <AlertTriangle size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">{p.name}</div>
                    <div className="truncate text-xs text-muted">{p.alert ? b(p.alert) : p.mall}</div>
                  </div>
                  <span className="pill shrink-0 bg-danger/10 text-danger">{e('projectStatus', p.status)}</span>
                  <ChevronRight size={16} className="hidden shrink-0 text-muted xs:block" />
                </button>
              ))}
              {risk.length + late.length === 0 && <Empty text={t('panel.allGood')} />}
            </div>
          </div>
        </div>

        <div className="card min-w-0 self-start p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <div className="section-title text-base">{t('panel.thisWeek')}</div>
              <div className="text-xs text-muted">{t('panel.thisWeekSub')}</div>
            </div>
            <button type="button" className="btn-ghost btn-sm" onClick={() => navigate('/admin/calendario')}>
              {t('common.viewAll')}
            </button>
          </div>
          {week.length === 0 ? (
            <Empty text={t('panel.noEvents')} />
          ) : (
            <div className="space-y-2">
              {week.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => navigate('/admin/calendario')}
                  className="flex min-h-[60px] w-full items-center gap-3 rounded-ctl border border-line px-3 py-2.5 text-left transition hover:border-line-strong hover:bg-subtle/60"
                  style={{ borderLeft: `3px solid ${EVENT_COLOR[ev.type]}` }}
                >
                  <div className="w-14 shrink-0">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{dayLabel(ev.date)}</div>
                    <div className="num text-[14px] text-ink">{fmtDate(ev.date, 'HH:mm', lang)}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium text-ink">{b(ev.title)}</div>
                    <div className="truncate text-xs text-muted">
                      {e('eventType', ev.type)} · {clientOf(ev.leadId, ev.brandId)}
                    </div>
                  </div>
                  <Avatar userId={ev.ownerId} size={26} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
