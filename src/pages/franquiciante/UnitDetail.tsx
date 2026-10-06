import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarClock, CheckCircle2, ChevronLeft, Circle } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '@/store';
import { useT } from '@/i18n';
import { fmtBRL, fmtBRLShort, fmtDate } from '@/lib/format';
import { projectProgress, projects } from '@/data/projects';
import { Badge, ChartCard, Empty, KpiCard, PageHeader, PreviewBanner, Progress, Segmented, axisProps, chartTooltipStyle } from '@/components/ui';
import { BRAND_ID, fmtInt, fmtPct, fmtTicket, monthDate, pctChange, sumLast, sumPrev, unitTone, useIsDesktop } from './_components/pampa';
import { units } from '@/data/units';

type Period = '1' | '3' | '6';

export default function UnitDetail() {
  const { id } = useParams();
  const { t, b, e, lang } = useT();
  const allTasks = useApp((s) => s.tasks);
  const desktop = useIsDesktop();
  const [period, setPeriod] = useState<Period>('3');

  const unit = units.find((u) => u.id === id && u.brandId === BRAND_ID);
  const project = unit?.projectId ? projects.find((p) => p.id === unit.projectId) : undefined;
  const tasks = useMemo(
    () => (unit?.projectId ? allTasks.filter((x) => x.projectId === unit.projectId).sort((a, z) => a.due.localeCompare(z.due)) : []),
    [allTasks, unit?.projectId],
  );

  const back = (
    <Link to="/franquiciante/unidades" className="mb-3 inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-ink2 hover:text-ink">
      <ChevronLeft size={16} />
      {t('fte.detail.back')}
    </Link>
  );

  if (!unit) {
    return (
      <div>
        {back}
        <PageHeader kicker={t('kicker.franquiciante')} title={t('fte.detail.notFoundTitle')} />
        <Empty text={t('fte.detail.notFound')} />
      </div>
    );
  }

  const n = Number(period);
  const open = unit.status === 'abierta';
  const rev = sumLast(unit.revenue, n);
  const tk = sumLast(unit.tickets, n);
  // Variación: vs. período anterior equivalente; en 6M, mes actual vs. hace 6 meses
  const variation =
    n === 6 ? pctChange(unit.revenue[5], unit.revenue[0]) : pctChange(rev, sumPrev(unit.revenue, n));
  const varHint = n === 1 ? t('fte.detail.varHint1') : n === 3 ? t('fte.detail.varHint3') : t('fte.detail.varHint6');

  const chartData = unit.revenue.slice(-Math.max(n, 2)).map((v, i, arr) => ({
    month: fmtDate(monthDate(unit.revenue.length - arr.length + i), 'MMM yy', lang),
    value: v,
  }));

  const progress = unit.projectId ? projectProgress(allTasks, unit.projectId) : unit.progress;
  const done = tasks.filter((x) => x.status === 'hecho');
  const pending = tasks.filter((x) => x.status !== 'hecho');

  return (
    <div>
      {back}
      <PageHeader
        kicker={t('kicker.franquiciante')}
        title={unit.name}
        subtitle={t('fte.detail.subtitle', { mall: unit.mall, name: unit.franchisee })}
        actions={<Badge tone={unitTone(unit)} className="min-h-[28px] px-3 text-xs">{e('unitStatus', unit.status)}</Badge>}
      />
      <PreviewBanner bullets={[t('fte.detail.b1'), t('fte.detail.b2'), t('fte.detail.b3')]} />

      {open ? (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="section-title text-base">{t('fte.detail.indicators')}</div>
            <Segmented<Period>
              value={period}
              onChange={setPeriod}
              options={[
                { value: '1', label: '1M' },
                { value: '3', label: '3M' },
                { value: '6', label: '6M' },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label={t('fte.detail.kRevenue')} value={<span className="text-[clamp(22px,4vw,30px)]">{fmtBRL(rev)}</span>} />
            <KpiCard label={t('fte.detail.kTickets')} value={fmtInt(tk)} />
            <KpiCard label={t('fte.detail.kAvg')} value={<span className="text-[clamp(22px,4vw,30px)]">{fmtTicket(rev, tk)}</span>} />
            <KpiCard
              label={t('fte.detail.kVar')}
              value={fmtPct(variation, lang)}
              deltaDir={variation < 0 ? 'down' : 'up'}
              hint={varHint}
            />
          </div>
          <ChartCard className="mt-4" title={t('fte.detail.chart')} subtitle={t('fte.detail.chartSub')} height={desktop ? 300 : 240}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} width={56} tickFormatter={(v: number) => fmtBRLShort(v)} domain={['auto', 'auto']} />
                <Tooltip {...chartTooltipStyle} cursor={{ stroke: 'var(--chart-grid)' }} formatter={(v: number) => [fmtBRL(v), t('fte.detail.kRevenue')]} />
                <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--accent)' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="card p-5 lg:col-span-2">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="kpi-label">{t('fte.detail.progress')}</div>
                  <div className="kpi-value mt-2">{progress}%</div>
                </div>
                <div className="text-right text-xs text-muted">
                  {t('fte.detail.tasksDone', { done: done.length, total: tasks.length })}
                </div>
              </div>
              <Progress value={progress} className="mt-4 h-2.5" tone={unit.status === 'atrasada' ? 'danger' : 'accent'} />
              {project?.alert && (
                <div className="mt-4 rounded-ctl border border-danger/25 bg-danger/[0.06] px-3 py-2 text-[13px] text-danger">{b(project.alert)}</div>
              )}
            </div>
            <div className="card flex flex-col justify-between p-5">
              <div className="kpi-label">{t('fte.detail.eta')}</div>
              <div className="mt-2 flex items-center gap-2">
                <CalendarClock size={20} className="shrink-0 text-accent" />
                <span className="num text-xl text-ink">{fmtDate(unit.openingDate, "d MMM yyyy", lang)}</span>
              </div>
              <div className="mt-2 text-xs text-muted">{t('fte.detail.noRevenue')}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {milestoneList(t('fte.detail.pending', { n: pending.length }), pending, false)}
            {milestoneList(t('fte.detail.done', { n: done.length }), done, true)}
          </div>
        </>
      )}
    </div>
  );

  function milestoneList(title: string, items: typeof tasks, doneList: boolean) {
    return (
      <div className="card p-4 sm:p-5">
        <div className="section-title mb-3 text-base">{title}</div>
        {items.length === 0 ? (
          <Empty text={t('fte.detail.noItems')} />
        ) : (
          <ul className="divide-y divide-line">
            {items.map((x) => (
              <li key={x.id}>
                <button
                  type="button"
                  onClick={() =>
                    useApp.getState().toast(t('fte.detail.taskToast', { name: b(x.title), status: e('taskStatus', x.status) }), 'info')
                  }
                  className="flex min-h-[48px] w-full items-start gap-3 py-2.5 text-left"
                >
                  {doneList ? (
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-ok" />
                  ) : (
                    <Circle size={18} className="mt-0.5 shrink-0 text-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className={doneList ? 'text-[13px] text-ink2' : 'text-[13px] font-medium text-ink'}>{b(x.title)}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                      <span>{e('taskTag', x.tag)}</span>
                      <span>·</span>
                      <span className="num font-medium">{fmtDate(x.due, 'd MMM', lang)}</span>
                      {!doneList && <Badge tone={x.status === 'pendiente' ? 'neutral' : 'accent'}>{e('taskStatus', x.status)}</Badge>}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}
