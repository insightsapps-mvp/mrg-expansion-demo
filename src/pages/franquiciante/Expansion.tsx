import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronRight, Eye } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '@/store';
import { useT } from '@/i18n';
import { topProducts } from '@/data/units';
import { fmtBRL, fmtBRLShort, fmtDate } from '@/lib/format';
import { ChartCard, KpiCard, PageHeader, PreviewBanner, axisProps, chartTooltipStyle } from '@/components/ui';
import type { LeadStage } from '@/types';
import {
  BRAND_ID,
  UNIT_COLORS,
  fmtInt,
  fmtPct,
  monthDate,
  openUnits,
  openingUnits,
  pctChange,
  shortName,
  sum,
  useIsDesktop,
} from './_components/pampa';

const QUALIFIED: LeadStage[] = ['calificado', 'propuesta', 'negociacion', 'cerrado'];
const PROPOSAL: LeadStage[] = ['propuesta', 'negociacion', 'cerrado'];

export default function Expansion() {
  const { t, b, lang } = useT();
  const navigate = useNavigate();
  const leads = useApp((s) => s.leads);
  const desktop = useIsDesktop();
  const chartH = desktop ? 300 : 240;

  const brandLeads = useMemo(() => leads.filter((l) => l.brandId === BRAND_ID), [leads]);
  const activeLeads = brandLeads.filter((l) => l.stage !== 'cerrado').length;

  const revNow = sum(openUnits.map((u) => u.revenue[u.revenue.length - 1]));
  const revPrev = sum(openUnits.map((u) => u.revenue[u.revenue.length - 2]));
  const delta = pctChange(revNow, revPrev);

  const chartData = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const row: Record<string, string | number> = { month: fmtDate(monthDate(i), 'MMM', lang) };
        openUnits.forEach((u) => (row[u.id] = u.revenue[i]));
        return row;
      }),
    [lang],
  );

  const drops = openUnits
    .map((u) => ({ u, pct: pctChange(u.revenue[5], u.revenue[4]) }))
    .filter((x) => x.pct <= -5);

  const funnel = [
    { label: t('fte.exp.fLeads'), value: brandLeads.length },
    { label: t('fte.exp.fQualified'), value: brandLeads.filter((l) => QUALIFIED.includes(l.stage)).length },
    { label: t('fte.exp.fProposal'), value: brandLeads.filter((l) => PROPOSAL.includes(l.stage)).length },
    { label: t('fte.exp.fClosed'), value: brandLeads.filter((l) => l.stage === 'cerrado').length },
  ];
  const funnelMax = Math.max(1, funnel[0].value);
  const prodMax = Math.max(...topProducts.map((p) => p.units));

  return (
    <div>
      <PageHeader
        kicker={t('kicker.franquiciante')}
        title={t('greet.hola', { name: 'Lucía' })}
        subtitle={t('fte.exp.subtitle')}
        actions={
          <Link to="/franquiciante/reportes" className="btn-secondary btn-sm min-h-[44px]">
            {t('fte.exp.toReports')}
          </Link>
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-ctl border border-[#7c3aed]/20 bg-[#7c3aed]/[0.05] px-3 py-2 text-[13px] text-ink2">
        <Eye size={15} className="shrink-0 text-[#7c3aed]" />
        <span>{t('fte.exp.scope')}</span>
      </div>

      <PreviewBanner bullets={[t('fte.exp.b1'), t('fte.exp.b2'), t('fte.exp.b3')]} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t('fte.exp.kOpen')} value={openUnits.length} hint={t('fte.exp.kOpenHint')} onClick={() => navigate('/franquiciante/unidades')} />
        <KpiCard label={t('fte.exp.kOpening')} value={openingUnits.length} hint={t('fte.exp.kOpeningHint')} onClick={() => navigate('/franquiciante/unidades')} />
        <KpiCard label={t('fte.exp.kCandidates')} value={activeLeads} hint={t('fte.exp.kCandidatesHint')} onClick={() => navigate('/franquiciante/candidatos')} />
        <KpiCard
          label={t('fte.exp.kRevenue')}
          value={<span className="text-[clamp(22px,4vw,30px)]">{fmtBRL(revNow)}</span>}
          delta={fmtPct(delta, lang)}
          deltaDir={delta < 0 ? 'down' : 'up'}
          hint={t('fte.exp.kRevenueHint', { prev: fmtBRL(revPrev) })}
          onClick={() => navigate('/franquiciante/reportes')}
        />
      </div>

      {drops.map(({ u, pct }) => (
        <Link
          key={u.id}
          to={`/franquiciante/unidades/${u.id}`}
          className="mt-4 flex min-h-[44px] items-center gap-3 rounded-card border border-warn/30 bg-warn/[0.07] px-4 py-3 text-[13px] transition hover:border-warn/50"
        >
          <AlertTriangle size={17} className="shrink-0 text-warn" />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-ink">{t('fte.exp.alertDrop', { name: u.name, pct: Math.round(Math.abs(pct)) })}</div>
            <div className="text-ink2">
              {t('fte.exp.alertDetail', { now: fmtBRL(u.revenue[5]), prev: fmtBRL(u.revenue[4]) })}
            </div>
          </div>
          <span className="hidden shrink-0 font-medium text-warn sm:inline">{t('fte.exp.alertCta')}</span>
          <ChevronRight size={16} className="shrink-0 text-warn" />
        </Link>
      ))}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <ChartCard
          className="lg:col-span-3"
          title={t('fte.exp.chartRevenue')}
          subtitle={t('fte.exp.chartRevenueSub')}
          height={chartH}
          dataTrailer="chart-facturacion"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} barGap={2} barCategoryGap="22%">
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} width={56} tickFormatter={(v: number) => fmtBRLShort(v)} />
              <Tooltip {...chartTooltipStyle} formatter={(v: number) => fmtBRL(v)} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-2)' }} />
              {openUnits.map((u, i) => (
                <Bar key={u.id} dataKey={u.id} name={shortName(u)} fill={UNIT_COLORS[i % UNIT_COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="card p-4 sm:p-5 lg:col-span-2">
          <div className="section-title text-base">{t('fte.exp.products')}</div>
          <div className="text-xs text-muted">{t('fte.exp.productsSub')}</div>
          <ol className="mt-4 space-y-4">
            {topProducts.map((p, i) => (
              <li key={p.name[0]}>
                <button
                  type="button"
                  onClick={() => useApp.getState().toast(t('fte.exp.productToast', { name: b(p.name), units: fmtInt(p.units) }), 'info')}
                  className="block min-h-[44px] w-full text-left"
                >
                  <div className="flex items-baseline justify-between gap-3 text-[13px]">
                    <span className="min-w-0 truncate text-ink">
                      <span className="num mr-2 text-muted">{i + 1}</span>
                      {b(p.name)}
                    </span>
                    <span className="num shrink-0 text-ink2">{fmtInt(p.units)}</span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-subtle">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(p.units / prodMax) * 100}%`, background: i === 0 ? 'var(--accent)' : 'var(--chart-2)' }}
                    />
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="card mt-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="section-title text-base">{t('fte.exp.funnel')}</div>
            <div className="text-xs text-muted">{t('fte.exp.funnelSub')}</div>
          </div>
          <Link to="/franquiciante/candidatos" className="btn-ghost btn-sm min-h-[44px]">
            {t('fte.exp.funnelCta')}
            <ChevronRight size={15} />
          </Link>
        </div>
        <div className="mt-4 space-y-2.5">
          {funnel.map((f, i) => {
            const conv = i > 0 && funnel[i - 1].value ? Math.round((f.value / funnel[i - 1].value) * 100) : null;
            return (
              <div key={f.label} className="grid grid-cols-[minmax(0,7.5rem)_1fr] items-center gap-3 sm:grid-cols-[11rem_1fr]">
                <div className="min-w-0 text-[13px] text-ink2">
                  <div className="truncate">{f.label}</div>
                  {conv !== null && <div className="text-[11px] text-muted">{t('fte.exp.conv', { pct: conv })}</div>}
                </div>
                <div className="flex justify-center">
                  <div
                    className="flex h-10 min-w-[44px] items-center justify-center rounded-ctl text-white transition-[width] duration-700"
                    style={{
                      width: `${Math.max(8, (f.value / funnelMax) * 100)}%`,
                      background: 'var(--accent)',
                      opacity: 1 - i * 0.17,
                    }}
                  >
                    <span className="num text-sm text-white dark:text-[#071a2e]">{f.value}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
