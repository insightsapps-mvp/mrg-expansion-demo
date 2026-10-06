import { useCallback, useMemo, useState } from 'react';
import { CalendarPlus, ChevronRight, Lock } from 'lucide-react';
import { useApp } from '@/store';
import { useT } from '@/i18n';
import { fmtBRL, fmtBRLShort } from '@/lib/format';
import { computeScore, scoreBreakdown } from '@/config/scoring';
import { Badge, Empty, PageHeader, PreviewBanner, ScoreBadge, Segmented, SidePanel } from '@/components/ui';
import type { Lead } from '@/types';
import { BRAND_ID } from './_components/pampa';

type Filter = 'activos' | 'cerrados' | 'todos';

export default function Candidates() {
  const { t, b, e } = useT();
  const leads = useApp((s) => s.leads);
  const rules = useApp((s) => s.rules);
  const [filter, setFilter] = useState<Filter>('activos');
  const [sel, setSel] = useState<Lead | null>(null);

  const brandLeads = useMemo(
    () =>
      leads
        .filter((l) => l.brandId === BRAND_ID)
        .map((l) => ({ lead: l, score: computeScore(l, rules) }))
        .sort((a, z) => z.score - a.score),
    [leads, rules],
  );
  const active = brandLeads.filter((x) => x.lead.stage !== 'cerrado');
  const closed = brandLeads.filter((x) => x.lead.stage === 'cerrado');
  const list = filter === 'activos' ? active : filter === 'cerrados' ? closed : brandLeads;

  const close = useCallback(() => setSel(null), []);
  const selScore =sel ? computeScore(sel, rules) : 0;
  const breakdown = sel ? scoreBreakdown(sel, rules) : [];

  const requestMeeting = () => {
    if (!sel) return;
    useApp.getState().toast(t('fte.cand.meetingToast', { name: sel.name }));
    setSel(null);
  };

  return (
    <div>
      <PageHeader kicker={t('kicker.franquiciante')} title={t('fte.cand.title')} subtitle={t('fte.cand.subtitle')} />
      <PreviewBanner bullets={[t('fte.cand.b1'), t('fte.cand.b2'), t('fte.cand.b3')]} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          scroll
          options={[
            { value: 'activos', label: t('fte.cand.fActive'), count: active.length },
            { value: 'cerrados', label: t('fte.cand.fClosed'), count: closed.length },
            { value: 'todos', label: t('common.all'), count: brandLeads.length },
          ]}
        />
        <div className="inline-flex items-center gap-2 text-[13px] text-muted">
          <Lock size={14} className="shrink-0" />
          {t('fte.cand.readOnly')}
        </div>
      </div>

      {list.length === 0 ? (
        <Empty text={t('common.noResults')} />
      ) : (
        <>
          {/* Desktop */}
          <div className="card hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.1em] text-muted">
                  <th className="px-4 py-3 font-semibold">{t('fte.cand.colName')}</th>
                  <th className="px-4 py-3 font-semibold">{t('fte.cand.colScore')}</th>
                  <th className="px-4 py-3 font-semibold">{t('fte.cand.colStage')}</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">{t('fte.cand.colCity')}</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">{t('fte.cand.colZone')}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t('fte.cand.colCapital')}</th>
                  <th className="w-10 px-2 py-3" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {list.map(({ lead: l, score }) => (
                  <tr key={l.id} onClick={() => setSel(l)} className="cursor-pointer border-b border-line last:border-0 hover:bg-subtle/60">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-ink">{l.name}</div>
                      <div className="text-xs text-muted">{e('origin', l.origin)}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <ScoreBadge score={score} />
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={l.stage === 'cerrado' ? 'ok' : 'neutral'}>{e('stage', l.stage)}</Badge>
                    </td>
                    <td className="hidden px-4 py-3.5 text-ink2 lg:table-cell">{l.city}</td>
                    <td className="hidden px-4 py-3.5 text-ink2 md:table-cell">{l.desiredZone}</td>
                    <td className="num px-4 py-3.5 text-right text-ink">{fmtBRLShort(l.capital)}</td>
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
            {list.map(({ lead: l, score }) => (
              <button key={l.id} type="button" onClick={() => setSel(l)} className="card flex w-full items-start gap-3 p-4 text-left">
                <ScoreBadge score={score} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink">{l.name}</div>
                  <div className="truncate text-xs text-muted">{l.city}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink2">
                    <Badge tone={l.stage === 'cerrado' ? 'ok' : 'neutral'}>{e('stage', l.stage)}</Badge>
                    <span className="truncate">{l.desiredZone}</span>
                  </div>
                </div>
                <span className="num shrink-0 text-sm text-ink">{fmtBRLShort(l.capital)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <SidePanel
        open={!!sel}
        onClose={close}
        title={sel?.name ?? ''}
        footer={
          <button type="button" onClick={requestMeeting} className="btn-primary w-full">
            <CalendarPlus size={16} />
            {t('fte.cand.requestMeeting')}
          </button>
        }
      >
        {sel && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <ScoreBadge score={selScore} size="lg" />
              <div className="min-w-0">
                <div className="kpi-label">{t('fte.cand.scoreLabel')}</div>
                <div className="mt-1">
                  <Badge tone={sel.stage === 'cerrado' ? 'ok' : 'accent'}>{e('stage', sel.stage)}</Badge>
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
              {(
                [
                  [t('fte.cand.colCity'), sel.city],
                  [t('fte.cand.colZone'), sel.desiredZone],
                  [t('fte.cand.colCapital'), fmtBRL(sel.capital)],
                  [t('fte.cand.experience'), `${e('experience', sel.experience)} · ${t('fte.cand.years', { n: sel.experienceYears })}`],
                  [t('fte.cand.sector'), e('sector', sel.sector)],
                  [t('fte.cand.origin'), e('origin', sel.origin)],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">{k}</dt>
                  <dd className="mt-0.5 break-words text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            <div>
              <div className="section-title mb-3 text-sm">{t('fte.cand.breakdown')}</div>
              <ul className="space-y-3">
                {breakdown.map((x) => (
                  <li key={x.id}>
                    <div className="flex items-baseline justify-between gap-3 text-[13px]">
                      <span className="min-w-0 truncate text-ink2">{b(x.label)}</span>
                      <span className="num shrink-0 text-ink">
                        {Math.round(x.points)}
                        <span className="text-muted">/{Math.round(x.max)}</span>
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-subtle">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${x.max ? (x.points / x.max) * 100 : 0}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 rounded-ctl border border-line bg-subtle px-3 py-2.5 text-[12px] text-ink2">
              <Lock size={14} className="mt-0.5 shrink-0 text-muted" />
              {t('fte.cand.readOnly')}
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
}
