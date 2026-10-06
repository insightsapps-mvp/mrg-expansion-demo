import { useEffect, useMemo } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Check, CalendarClock, CircleCheck, Clock, Circle } from 'lucide-react';
import { useApp, checklistProgress } from '@/store';
import { tr, useT } from '@/i18n';
import { fmtDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Badge, PageHeader, PreviewBanner, Progress } from '@/components/ui';
import type { ChecklistStage } from '@/types';
import { FDO_COLOR, daysToOpening, openingDate } from './_components/fdo';

function AnimatedPct({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 90, damping: 20 });
  const rounded = useTransform(spring, (v) => Math.round(v));
  useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  return <motion.span>{rounded}</motion.span>;
}

const stagePct = (s: ChecklistStage) => Math.round((s.items.filter((i) => i.done).length / s.items.length) * 100);

export default function FranchiseeOpening() {
  const { t, b, lang } = useT();
  const checklist = useApp((s) => s.checklist);
  const toggle = useApp((s) => s.toggleChecklist);

  const pct = checklistProgress(checklist);
  const all = checklist.flatMap((s) => s.items);
  const done = all.filter((i) => i.done).length;
  const stagesDone = checklist.filter((s) => s.items.every((i) => i.done)).length;
  const open = useMemo(openingDate, []);
  const days = daysToOpening();

  const onToggle = (stageId: string, itemId: string, wasDone: boolean) => {
    toggle(stageId, itemId);
    const s = useApp.getState();
    const next = checklistProgress(s.checklist);
    s.toast(
      wasDone ? tr('fdo.op.toastUndone', s.lang, { pct: next }) : tr('fdo.op.toastDone', s.lang, { pct: next }),
      wasDone ? 'info' : 'ok',
    );
  };

  return (
    <div>
      <PageHeader
        kicker={t('kicker.franquiciado')}
        title={t('fdo.op.title')}
        subtitle={t('fdo.op.subtitle')}
      />
      <PreviewBanner bullets={[t('fdo.op.b1'), t('fdo.op.b2'), t('fdo.op.b3')]} />

      {/* Progreso general: sticky compacto en mobile, card resumen en desktop */}
      <div
        data-trailer="apertura-progress"
        className="sticky top-14 z-30 -mx-4 mb-5 border-b border-line bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mb-6 lg:rounded-card lg:border lg:bg-card lg:p-6 lg:shadow-sm lg:backdrop-blur-none"
      >
        <div className="flex items-center gap-4 lg:items-end">
          <div className="min-w-0 flex-1">
            <div className="kpi-label">{t('fdo.op.overall')}</div>
            <div className="mt-0.5 text-xs text-ink2 lg:hidden">{t('fdo.op.itemsDone', { done, total: all.length })}</div>
            <div className="mt-2 hidden text-sm text-ink2 lg:block">
              {t('fdo.op.itemsDone', { done, total: all.length })} · {t('fdo.op.stagesDone', { n: stagesDone, total: checklist.length })}
            </div>
          </div>
          <div className="font-mono text-[28px] font-bold leading-none text-ink lg:text-[56px]" aria-live="polite">
            <AnimatedPct value={pct} />
            <span className="text-[0.55em] text-muted">%</span>
          </div>
        </div>
        <Progress value={pct} tone="ok" className="mt-2.5 h-2 lg:mt-4 lg:h-3" />
        <div className="mt-4 hidden flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4 text-sm text-ink lg:flex">
          <span className="inline-flex items-center gap-2">
            <CalendarClock size={16} className="text-ok" />
            {t('fdo.op.opening')}{' '}
            <b className="font-semibold">{fmtDate(open, lang === 'es' ? "d 'de' MMMM yyyy" : 'MMMM d, yyyy', lang)}</b>
          </span>
          <span className="text-ink2">
            <span className="num text-ink">{days}</span> {t('fdo.op.daysLeft')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        {checklist.map((st, idx) => {
          const sp = stagePct(st);
          const status = sp === 100 ? 'done' : sp > 0 ? 'curso' : 'pend';
          const sdone = st.items.filter((i) => i.done).length;
          return (
            <section key={st.id} className="card p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'num inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm',
                    status === 'done' ? 'text-white' : 'bg-subtle text-ink2',
                  )}
                  style={status === 'done' ? { background: FDO_COLOR } : undefined}
                >
                  {status === 'done' ? <Check size={16} strokeWidth={3} /> : idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-[15px] font-semibold text-ink">{b(st.label)}</h2>
                    {status === 'done' ? (
                      <Badge tone="ok">
                        <CircleCheck size={12} />
                        {t('fdo.op.stDone')}
                      </Badge>
                    ) : status === 'curso' ? (
                      <Badge tone="warn">
                        <Clock size={12} />
                        {t('fdo.op.stCurso')}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">
                        <Circle size={12} />
                        {t('fdo.op.stPend')}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={sp} tone={status === 'done' ? 'ok' : status === 'curso' ? 'warn' : 'accent'} className="h-1.5" />
                    <span className="num w-10 shrink-0 text-right text-xs text-ink2">{sp}%</span>
                  </div>
                  <div className="mt-1 text-xs text-muted">{t('fdo.op.stageItems', { done: sdone, total: st.items.length })}</div>
                </div>
              </div>

              <ul className="mt-3 flex flex-col border-t border-line pt-2">
                {st.items.map((it) => (
                  <li key={it.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={it.done}
                      onClick={() => onToggle(st.id, it.id, it.done)}
                      className="group flex min-h-[48px] w-full items-center gap-3 rounded-ctl px-1.5 py-2 text-left transition hover:bg-subtle"
                    >
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center">
                        <span
                          className={cn(
                            'inline-flex h-6 w-6 items-center justify-center rounded-[7px] border-2 transition-colors',
                            it.done ? 'border-transparent text-white' : 'border-line-strong bg-card',
                          )}
                          style={it.done ? { background: FDO_COLOR } : undefined}
                        >
                          {it.done && (
                            <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.18 }}>
                              <Check size={15} strokeWidth={3} />
                            </motion.span>
                          )}
                        </span>
                      </span>
                      <span className={cn('min-w-0 flex-1 text-sm leading-snug', it.done ? 'text-muted line-through decoration-line-strong' : 'text-ink')}>
                        {b(it.label)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
