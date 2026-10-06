import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useApp } from '@/store';
import { useT } from '@/i18n';
import { fmtBRL, fmtDate } from '@/lib/format';
import { projectProgress } from '@/data/projects';
import { Badge, PageHeader, PreviewBanner, Progress } from '@/components/ui';
import type { Unit } from '@/types';
import { brandUnits, fmtTicket, unitTone } from './_components/pampa';

export default function Units() {
  const { t, e, lang } = useT();
  const navigate = useNavigate();
  const tasks = useApp((s) => s.tasks);

  const progressOf = (u: Unit) => (u.projectId ? projectProgress(tasks, u.projectId) : u.progress);
  const go = (u: Unit) => navigate(`/franquiciante/unidades/${u.id}`);
  const rev = (u: Unit) => u.revenue[u.revenue.length - 1];
  const tk = (u: Unit) => u.tickets[u.tickets.length - 1];

  const opening = (u: Unit) =>
    u.status === 'abierta' ? (
      <span className="text-ink2">{t('fte.units.since', { date: fmtDate(u.openingDate, 'MMM yyyy', lang) })}</span>
    ) : (
      <div className="min-w-[120px]">
        <div className="mb-1 flex items-center justify-between gap-2 text-xs">
          <span className="num text-ink">{progressOf(u)}%</span>
          <span className="text-muted">{fmtDate(u.openingDate, 'd MMM', lang)}</span>
        </div>
        <Progress value={progressOf(u)} tone={u.status === 'atrasada' ? 'danger' : 'accent'} />
      </div>
    );

  return (
    <div>
      <PageHeader kicker={t('kicker.franquiciante')} title={t('fte.units.title')} subtitle={t('fte.units.subtitle', { n: brandUnits.length })} />
      <PreviewBanner bullets={[t('fte.units.b1'), t('fte.units.b2'), t('fte.units.b3')]} />

      {/* Desktop / tablet */}
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.1em] text-muted">
              <th className="px-4 py-3 font-semibold">{t('fte.units.colMall')}</th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">{t('fte.units.colFranchisee')}</th>
              <th className="px-4 py-3 font-semibold">{t('common.status')}</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">{t('fte.units.colOpening')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('fte.units.colRevenue')}</th>
              <th className="hidden px-4 py-3 text-right font-semibold md:table-cell">{t('fte.units.colTicket')}</th>
              <th className="w-10 px-2 py-3" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {brandUnits.map((u) => (
              <tr key={u.id} onClick={() => go(u)} className="cursor-pointer border-b border-line last:border-0 hover:bg-subtle/60">
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-ink">{u.mall}</div>
                  <div className="text-xs text-muted">{u.name}</div>
                </td>
                <td className="hidden px-4 py-3.5 text-ink2 lg:table-cell">{u.franchisee}</td>
                <td className="px-4 py-3.5">
                  <Badge tone={unitTone(u)}>{e('unitStatus', u.status)}</Badge>
                </td>
                <td className="hidden px-4 py-3.5 md:table-cell">
                  {opening(u)}
                </td>
                <td className="num px-4 py-3.5 text-right text-ink">{rev(u) ? fmtBRL(rev(u)) : '—'}</td>
                <td className="num hidden px-4 py-3.5 text-right text-ink2 md:table-cell">{fmtTicket(rev(u), tk(u))}</td>
                <td className="px-2 py-3.5 text-muted">
                  <ChevronRight size={16} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {brandUnits.map((u) => (
          <button key={u.id} type="button" onClick={() => go(u)} className="card block w-full p-4 text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold text-ink">{u.mall}</div>
                <div className="truncate text-xs text-muted">{u.franchisee}</div>
              </div>
              <Badge tone={unitTone(u)} className="shrink-0">
                {e('unitStatus', u.status)}
              </Badge>
            </div>
            <div className="mt-3 text-[13px]">
              {opening(u)}
            </div>
            {u.status === 'abierta' && (
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3">
                <div>
                  <div className="kpi-label">{t('fte.units.colRevenue')}</div>
                  <div className="num mt-1 text-ink">{fmtBRL(rev(u))}</div>
                </div>
                <div>
                  <div className="kpi-label">{t('fte.units.colTicket')}</div>
                  <div className="num mt-1 text-ink">{fmtTicket(rev(u), tk(u))}</div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
