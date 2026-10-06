import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, FileText, Search } from 'lucide-react';
import { useApp } from '@/store';
import { useT } from '@/i18n';
import { fmtAgo } from '@/lib/format';
import { brandById } from '@/data/brands';
import { Badge, PageHeader, PreviewBanner, Segmented } from '@/components/ui';
import type { ProposalStatus } from '@/types';
import { statusTone } from './_components/proposalUi';

type Filter = 'all' | ProposalStatus;
const STATUSES: ProposalStatus[] = ['borrador', 'enviada', 'aceptada', 'rechazada'];

function MiniKpi({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="card flex min-w-0 flex-col justify-between px-3 py-3 sm:px-4">
      <div className="kpi-label truncate">{label}</div>
      <div className="num mt-2 text-[22px] leading-none text-ink sm:text-[26px]">{value}</div>
      <div className="mt-1 truncate text-[11px] text-muted">{hint}</div>
    </div>
  );
}

export default function Proposals() {
  const { t, e, lang } = useT();
  const navigate = useNavigate();
  const proposals = useApp((s) => s.proposals);
  const leads = useApp((s) => s.leads);
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');

  const rows = useMemo(
    () =>
      proposals
        .map((p) => ({
          p,
          lead: leads.find((l) => l.id === p.leadId),
          brand: brandById(p.brandId),
        }))
        .sort((a, z) => a.p.daysAgo - z.p.daysAgo),
    [proposals, leads],
  );

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: proposals.length, borrador: 0, enviada: 0, aceptada: 0, rechazada: 0 };
    proposals.forEach((p) => (c[p.status] += 1));
    return c;
  }, [proposals]);

  const sentTotal = counts.enviada + counts.aceptada + counts.rechazada;
  const rate = sentTotal ? Math.round((counts.aceptada / sentTotal) * 100) : 0;

  const visible = rows.filter(({ p, lead, brand }) => {
    if (filter !== 'all' && p.status !== filter) return false;
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return [p.id, lead?.name ?? '', brand?.name ?? ''].some((x) => x.toLowerCase().includes(s));
  });

  const open = (id: string) => navigate(`/admin/propuestas/${id}`);
  const tpl = (x: 'llave' | 'master') => t(`props.tpl.${x}`);

  return (
    <div>
      <PageHeader
        kicker={t('kicker.admin')}
        title={t('props.title')}
        subtitle={t('props.subtitle')}
        actions={
          <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => navigate('/admin/propuestas/nueva?lead=L-001')}>
            {t('props.new')}
          </button>
        }
      />
      <PreviewBanner bullets={[t('props.bannerA'), t('props.bannerB'), t('props.bannerC')]} />

      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4 lg:max-w-3xl">
        <MiniKpi label={t('props.kpiSent')} value={counts.enviada} hint={t('props.kpiSentHint')} />
        <MiniKpi label={t('props.kpiAccepted')} value={counts.aceptada} hint={t('props.kpiAcceptedHint', { n: proposals.length })} />
        <MiniKpi label={t('props.kpiRate')} value={`${rate}%`} hint={t('props.kpiRateHint')} />
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Segmented<Filter>
          scroll
          value={filter}
          onChange={setFilter}
          className="max-w-full self-start"
          options={[
            { value: 'all', label: t('props.all'), count: counts.all },
            ...STATUSES.map((s) => ({ value: s, label: e('proposalStatus', s), count: counts[s] })),
          ]}
        />
        <label className="relative block w-full lg:w-80">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9"
            value={q}
            onChange={(ev) => setQ(ev.target.value)}
            placeholder={t('props.searchPh')}
            aria-label={t('props.searchPh')}
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-card border border-dashed border-line px-4 py-10 text-center text-sm text-muted">{t('props.empty')}</div>
      ) : (
        <>
          {/* Desktop: tabla */}
          <div className="card hidden overflow-hidden lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-subtle/60 text-left">
                  {['props.colId', 'props.colLead', 'props.colBrand', 'props.colTemplate', 'props.colVersion', 'props.colStatus', 'props.colDate'].map((k) => (
                    <th key={k} className="kpi-label px-4 py-3 font-semibold">
                      {t(k)}
                    </th>
                  ))}
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {visible.map(({ p, lead, brand }) => (
                  <tr
                    key={p.id}
                    onClick={() => open(p.id)}
                    tabIndex={0}
                    onKeyDown={(ev) => ev.key === 'Enter' && open(p.id)}
                    className="group cursor-pointer border-b border-line transition last:border-0 hover:bg-subtle/60 focus:bg-subtle/60 focus:outline-none"
                  >
                    <td className="num px-4 py-3 text-[12px] text-muted">{p.id}</td>
                    <td className="px-4 py-3 font-semibold text-ink">{lead?.name ?? p.leadId}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 text-ink2">
                        <span className="h-2 w-2 rounded-full" style={{ background: brand?.color }} />
                        {brand?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink2">{tpl(p.template)}</td>
                    <td className="num px-4 py-3 text-ink">v{p.versions.length}</td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone[p.status]}>{e('proposalStatus', p.status)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-ink2">{fmtAgo(p.daysAgo, lang)}</td>
                    <td className="pr-3">
                      <ChevronRight size={16} className="text-muted transition group-hover:text-ink" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: tarjetas */}
          <ul className="flex flex-col gap-3 lg:hidden">
            {visible.map(({ p, lead, brand }) => (
              <li key={p.id}>
                <button type="button" onClick={() => open(p.id)} className="card flex w-full min-w-0 items-start gap-3 p-4 text-left active:bg-subtle">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-ctl bg-accent-soft text-accent">
                    <FileText size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0 truncate font-semibold text-ink">{lead?.name ?? p.leadId}</span>
                      <Badge tone={statusTone[p.status]} className="shrink-0">
                        {e('proposalStatus', p.status)}
                      </Badge>
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-ink2">
                      {brand?.name} · {tpl(p.template)}
                    </span>
                    <span className="mt-2 flex items-center gap-2 text-xs text-muted">
                      <span className="num">{p.id}</span>
                      <span>·</span>
                      <span className="num text-ink2">v{p.versions.length}</span>
                      <span>·</span>
                      <span className="truncate">{fmtAgo(p.daysAgo, lang)}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
