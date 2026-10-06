import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Bell, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, MapPin, Plus } from 'lucide-react';
import { tr, useT } from '@/i18n';
import { useApp } from '@/store';
import { cn } from '@/lib/utils';
import { fmtDate } from '@/lib/format';
import { Avatar, SidePanel, Empty } from '@/components/ui';
import { roleColor, userById } from '@/data/users';
import { brands } from '@/data/brands';
import { projects } from '@/data/projects';
import type { CalendarEvent, EventType } from '@/types';

export const EVENT_TYPES: EventType[] = ['reunion', 'llamada', 'vencimiento', 'visita'];

export const EVENT_COLOR: Record<EventType, string> = {
  reunion: 'var(--accent)',
  llamada: 'var(--ok)',
  vencimiento: 'var(--danger)',
  visita: '#8b5cf6',
};

export const chipStyle = (type: EventType, pending = false): CSSProperties =>
  pending
    ? {
        background: `repeating-linear-gradient(135deg, color-mix(in srgb, ${EVENT_COLOR[type]} 10%, transparent) 0 6px, transparent 6px 10px)`,
        borderLeft: `3px dashed ${EVENT_COLOR[type]}`,
      }
    : {
        background: `color-mix(in srgb, ${EVENT_COLOR[type]} 12%, transparent)`,
        borderLeft: `3px solid ${EVENT_COLOR[type]}`,
      };

export type CalendarMode = 'admin' | 'equipo' | 'franquiciante' | 'franquiciado';

const HOUR_START = 8;
const HOUR_END = 20;
const ROW_H = 48;
const dayKey = (d: Date) => format(d, 'yyyy-MM-dd');

export default function CalendarView({
  events,
  mode,
  onAdd,
}: {
  events: CalendarEvent[];
  mode: CalendarMode;
  onAdd?: (date?: Date) => void;
}) {
  const { t, b, e, lang } = useT();
  const leads = useApp((s) => s.leads);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [miniOpen, setMiniOpen] = useState(false);
  const [hidden, setHidden] = useState<EventType[]>([]);

  const today = new Date();
  const weekOpts = { weekStartsOn: 1 as const };

  const visible = useMemo(
    () =>
      events
        .filter((ev) => !hidden.includes(ev.type) && ev.status !== 'rechazado')
        .slice()
        .sort((a, z) => +new Date(a.date) - +new Date(z.date)),
    [events, hidden],
  );

  const byDay = useMemo(() => {
    const m = new Map<string, CalendarEvent[]>();
    visible.forEach((ev) => {
      const k = dayKey(new Date(ev.date));
      m.set(k, [...(m.get(k) ?? []), ev]);
    });
    return m;
  }, [visible]);

  const monthDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(cursor), weekOpts),
        end: endOfWeek(endOfMonth(cursor), weekOpts),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cursor],
  );
  const weekDays = useMemo(
    () => eachDayOfInterval({ start: startOfWeek(cursor, weekOpts), end: endOfWeek(cursor, weekOpts) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cursor],
  );
  const weekdayLabels = weekDays.map((d) => fmtDate(d, 'EEE', lang).replace('.', ''));

  const shift = (dir: 1 | -1) => setCursor((c) => (view === 'month' ? addMonths(c, dir) : addWeeks(c, dir)));
  const shiftMonth = (dir: 1 | -1) => setCursor((c) => addMonths(c, dir));

  const title =
    view === 'month'
      ? fmtDate(cursor, 'MMMM yyyy', lang)
      : `${fmtDate(weekDays[0], 'd MMM', lang)} – ${fmtDate(weekDays[6], 'd MMM yyyy', lang)}`;

  const selected = events.find((ev) => ev.id === selectedId) ?? null;

  const toggleType = (tp: EventType) =>
    setHidden((h) => (h.includes(tp) ? h.filter((x) => x !== tp) : [...h, tp]));

  const timeRange = (ev: CalendarEvent) => {
    const s = new Date(ev.date);
    const end = new Date(s.getTime() + ev.durationMin * 60000);
    return `${fmtDate(s, 'HH:mm', lang)} – ${fmtDate(end, 'HH:mm', lang)}`;
  };

  const legend = (
    <div className="flex flex-wrap gap-1.5">
      {EVENT_TYPES.map((tp) => {
        const off = hidden.includes(tp);
        return (
          <button
            key={tp}
            type="button"
            onClick={() => toggleType(tp)}
            aria-pressed={!off}
            className={cn(
              'inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line px-3 text-[12.5px] font-medium transition sm:min-h-[36px]',
              off ? 'bg-transparent text-muted line-through' : 'bg-card text-ink2 hover:border-line-strong',
            )}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: EVENT_COLOR[tp], opacity: off ? 0.35 : 1 }} />
            {e('eventType', tp)}
          </button>
        );
      })}
    </div>
  );

  /* ---------- Vista mensual (desktop/tablet) ---------- */
  const monthGrid = (
    <div className="overflow-hidden rounded-card border border-line bg-card">
      <div className="grid grid-cols-7 border-b border-line bg-subtle">
        {weekdayLabels.map((w) => (
          <div key={w} className="px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthDays.map((d, i) => {
          const list = byDay.get(dayKey(d)) ?? [];
          const inMonth = isSameMonth(d, cursor);
          const isToday = isSameDay(d, today);
          const max = 3;
          return (
            <div
              key={dayKey(d)}
              className={cn(
                'group flex min-h-[96px] min-w-0 flex-col gap-1 border-line p-1.5 lg:min-h-[116px]',
                i % 7 !== 6 && 'border-r',
                i < monthDays.length - 7 && 'border-b',
                !inMonth && 'bg-subtle/60',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'num inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-[12px]',
                    isToday ? 'bg-accent text-white dark:text-[#071a2e]' : inMonth ? 'text-ink' : 'text-muted/70',
                  )}
                >
                  {format(d, 'd')}
                </span>
                {onAdd && inMonth && (
                  <button
                    type="button"
                    onClick={() => onAdd(d)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted opacity-40 transition hover:bg-subtle hover:text-ink hover:opacity-100 focus:opacity-100 group-hover:opacity-100"
                    aria-label={t('cal.addOn', { date: fmtDate(d, 'd MMM', lang) })}
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
              {list.slice(0, max).map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => setSelectedId(ev.id)}
                  className="flex min-w-0 items-center gap-1 rounded-[6px] px-1.5 py-1 text-left text-[11.5px] leading-tight text-ink transition hover:brightness-95"
                  style={chipStyle(ev.type, ev.status === 'propuesto')}
                  title={b(ev.title)}
                >
                  <span className="num shrink-0 text-[10.5px] font-medium text-ink2">{fmtDate(ev.date, 'HH:mm', lang)}</span>
                  <span className="truncate">{b(ev.title)}</span>
                </button>
              ))}
              {list.length > max && (
                <button
                  type="button"
                  onClick={() => {
                    setCursor(d);
                    setView('week');
                  }}
                  className="rounded-[6px] px-1.5 py-0.5 text-left text-[11px] font-semibold text-accent hover:bg-accent-soft"
                >
                  {t('cal.more', { n: list.length - max })}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ---------- Vista semanal ---------- */
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
  const weekGrid = (
    <div className="overflow-hidden rounded-card border border-line bg-card" data-trailer="cal-week">
      <div className="grid grid-cols-[48px_repeat(7,minmax(0,1fr))] border-b border-line bg-subtle">
        <div />
        {weekDays.map((d) => {
          const isToday = isSameDay(d, today);
          return (
            <div key={dayKey(d)} className="min-w-0 border-l border-line px-1 py-2 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{fmtDate(d, 'EEE', lang).replace('.', '')}</div>
              <div
                className={cn(
                  'num mx-auto mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-[13px]',
                  isToday ? 'bg-accent text-white dark:text-[#071a2e]' : 'text-ink',
                )}
              >
                {format(d, 'd')}
              </div>
            </div>
          );
        })}
      </div>
      <div className="max-h-[620px] overflow-y-auto">
        <div className="relative grid grid-cols-[48px_repeat(7,minmax(0,1fr))]">
          <div>
            {hours.map((h) => (
              <div key={h} className="num relative pr-1.5 text-right text-[10.5px] font-medium text-muted" style={{ height: ROW_H }}>
                <span className="relative -top-1.5">{String(h).padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>
          {weekDays.map((d) => {
            const list = byDay.get(dayKey(d)) ?? [];
            const isToday = isSameDay(d, today);
            return (
              <div key={dayKey(d)} className={cn('relative min-w-0 border-l border-line', isToday && 'bg-accent-soft/40')}>
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    disabled={!onAdd}
                    onClick={() => {
                      if (!onAdd) return;
                      const x = new Date(d);
                      x.setHours(h, 0, 0, 0);
                      onAdd(x);
                    }}
                    className="block w-full border-b border-dashed border-line enabled:hover:bg-subtle/70 disabled:cursor-default"
                    style={{ height: ROW_H }}
                    aria-label={onAdd ? t('cal.addOn', { date: `${fmtDate(d, 'd MMM', lang)} ${h}:00` }) : undefined}
                  />
                ))}
                {list.map((ev) => {
                  const s = new Date(ev.date);
                  const top = Math.max(0, (s.getHours() + s.getMinutes() / 60 - HOUR_START) * ROW_H);
                  const height = Math.max(26, (ev.durationMin / 60) * ROW_H - 3);
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => setSelectedId(ev.id)}
                      className="absolute inset-x-0.5 overflow-hidden rounded-[6px] px-1.5 py-1 text-left text-[11px] leading-tight text-ink shadow-sm transition hover:brightness-95"
                      style={{ ...chipStyle(ev.type, ev.status === 'propuesto'), top, height }}
                      title={b(ev.title)}
                    >
                      <div className="num text-[10px] font-medium text-ink2">{fmtDate(s, 'HH:mm', lang)}</div>
                      <div className="line-clamp-2 font-medium">{b(ev.title)}</div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ---------- Mobile: mini-mes + agenda ---------- */
  const agendaDays = monthDays.filter((d) => isSameMonth(d, cursor) && (byDay.get(dayKey(d))?.length ?? 0) > 0);
  const scrollToDay = (d: Date) => {
    const el = document.getElementById(`cal-agenda-${dayKey(d)}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMiniOpen(false);
  };

  const mobile = (
    <div className="sm:hidden">
      <div className="card mb-4 p-3">
        <div className="flex items-center gap-1">
          <button type="button" className="icon-btn" onClick={() => shiftMonth(-1)} aria-label={t('cal.prev')}>
            <ChevronLeft size={18} />
          </button>
          <div className="min-w-0 flex-1 text-center text-[15px] font-semibold capitalize text-ink">{fmtDate(cursor, 'MMMM yyyy', lang)}</div>
          <button type="button" className="icon-btn" onClick={() => shiftMonth(1)} aria-label={t('cal.next')}>
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="mt-1 flex gap-2">
          <button type="button" className="btn-secondary btn-sm min-h-[44px] flex-1" onClick={() => setCursor(new Date())}>
            {t('common.today')}
          </button>
          <button type="button" className="btn-secondary btn-sm min-h-[44px] flex-1" onClick={() => setMiniOpen((v) => !v)} aria-expanded={miniOpen}>
            <CalendarDays size={15} />
            {miniOpen ? t('cal.hideMonth') : t('cal.showMonth')}
            {miniOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
        {miniOpen && (
          <div className="mt-3">
            <div className="grid grid-cols-7 text-center text-[10.5px] font-semibold uppercase text-muted">
              {weekdayLabels.map((w) => (
                <div key={w} className="py-1">
                  {w.slice(0, 2)}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDays.map((d) => {
                const list = byDay.get(dayKey(d)) ?? [];
                const inMonth = isSameMonth(d, cursor);
                const isToday = isSameDay(d, today);
                return (
                  <button
                    key={dayKey(d)}
                    type="button"
                    disabled={!inMonth || !list.length}
                    onClick={() => scrollToDay(d)}
                    className="flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-ctl disabled:cursor-default"
                  >
                    <span
                      className={cn(
                        'num inline-flex h-7 w-7 items-center justify-center rounded-full text-[12.5px]',
                        isToday ? 'bg-accent text-white dark:text-[#071a2e]' : inMonth ? 'text-ink' : 'text-muted/50',
                      )}
                    >
                      {format(d, 'd')}
                    </span>
                    <span className="flex h-1.5 gap-0.5">
                      {inMonth &&
                        list.slice(0, 3).map((ev) => (
                          <span key={ev.id} className="h-1.5 w-1.5 rounded-full" style={{ background: EVENT_COLOR[ev.type] }} />
                        ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="mb-4">{legend}</div>
      {agendaDays.length === 0 ? (
        <Empty text={t('cal.empty')} />
      ) : (
        <div className="space-y-5">
          {agendaDays.map((d) => {
            const isToday = isSameDay(d, today);
            const past = d < startOfDay(today);
            return (
              <section key={dayKey(d)} id={`cal-agenda-${dayKey(d)}`} className="scroll-mt-20">
                <div className={cn('mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em]', isToday ? 'text-accent' : past ? 'text-muted' : 'text-ink2')}>
                  {isToday && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  {isToday ? `${t('common.today')} · ` : ''}
                  {fmtDate(d, 'EEEE d MMM', lang)}
                </div>
                <div className="space-y-2">
                  {(byDay.get(dayKey(d)) ?? []).map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => setSelectedId(ev.id)}
                      className={cn('card flex min-h-[56px] w-full items-center gap-3 px-3 py-2.5 text-left', past && 'opacity-70')}
                      style={{ borderLeft: `3px ${ev.status === 'propuesto' ? 'dashed' : 'solid'} ${EVENT_COLOR[ev.type]}` }}
                    >
                      <div className="w-12 shrink-0">
                        <div className="num text-[13px] text-ink">{fmtDate(ev.date, 'HH:mm', lang)}</div>
                        <div className="text-[11px] text-muted">{t('cal.min', { n: ev.durationMin })}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] font-medium text-ink">{b(ev.title)}</div>
                        <div className="truncate text-[12px] text-muted">
                          {ev.status === 'propuesto' && <span className="font-semibold text-warn">{t('shcal.pending')} · </span>}
                          {e('eventType', ev.type)}
                          {ev.location ? ` · ${ev.location}` : ''}
                        </div>
                      </div>
                      <Avatar userId={ev.ownerId} size={26} />
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ---------- Detalle ---------- */
  const lead = selected?.leadId ? leads.find((l) => l.id === selected.leadId) : undefined;
  const brand = selected?.brandId ? brands.find((x) => x.id === selected.brandId) : undefined;
  const project = selected?.projectId ? projects.find((x) => x.id === selected.projectId) : undefined;
  const owner = selected ? userById(selected.ownerId) : undefined;
  const creator = selected?.createdBy ? userById(selected.createdBy) : undefined;

  return (
    <div className="min-w-0">
      {mobile}

      <div className="hidden sm:block">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <button type="button" className="icon-btn" onClick={() => shift(-1)} aria-label={t('cal.prev')}>
              <ChevronLeft size={18} />
            </button>
            <button type="button" className="icon-btn" onClick={() => shift(1)} aria-label={t('cal.next')}>
              <ChevronRight size={18} />
            </button>
            <button type="button" className="btn-secondary btn-sm ml-1" onClick={() => setCursor(new Date())}>
              {t('common.today')}
            </button>
          </div>
          <div className="min-w-0 text-lg font-semibold capitalize tracking-tight text-ink">{title}</div>
          <div className="ml-auto flex gap-1 rounded-full border border-line bg-subtle p-1">
            {(['month', 'week'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                data-trailer={v === 'week' ? 'cal-week-btn' : undefined}
                className={cn(
                  'inline-flex min-h-[36px] items-center rounded-full px-3.5 text-[13px] font-medium transition',
                  view === v ? 'bg-card text-ink shadow-sm' : 'text-ink2 hover:text-ink',
                )}
              >
                {v === 'month' ? t('common.month') : t('common.week')}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">{legend}</div>
        {view === 'month' ? monthGrid : weekGrid}
      </div>

      <SidePanel
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected ? b(selected.title) : ''}
        footer={
          selected &&
          (selected.status === 'propuesto' && (mode === 'admin' || mode === 'equipo') ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary btn-sm min-h-[44px] flex-1"
                onClick={() => {
                  const s = useApp.getState();
                  s.updateEvent(selected.id, { status: 'confirmado' });
                  s.toast(tr('shcal.confirmedToast', s.lang, { name: creator?.name ?? '' }));
                }}
              >
                <Check size={15} />
                {t('shcal.confirm')}
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm min-h-[44px] flex-1"
                onClick={() => {
                  const s = useApp.getState();
                  s.updateEvent(selected.id, { status: 'rechazado' });
                  s.toast(tr('shcal.rejectedToast', s.lang), 'warn');
                  setSelectedId(null);
                }}
              >
                {t('shcal.propose_other')}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {mode === 'admin' && lead && (
                <Link to={`/admin/crm/${lead.id}`} className="btn-primary btn-sm min-h-[44px] flex-1">
                  {t('cal.openLead')}
                </Link>
              )}
              {mode === 'equipo' && project && (
                <Link to={`/equipo/proyectos/${project.id}`} className="btn-primary btn-sm min-h-[44px] flex-1">
                  {t('cal.openProject')}
                </Link>
              )}
              <button
                type="button"
                className="btn-secondary btn-sm min-h-[44px] flex-1"
                onClick={() => {
                  useApp.getState().toast(t('cal.doneToast'));
                  setSelectedId(null);
                }}
              >
                {t('cal.markDone')}
              </button>
            </div>
          ))
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="pill text-ink" style={{ background: `color-mix(in srgb, ${EVENT_COLOR[selected.type]} 14%, transparent)` }}>
                <span className="h-2 w-2 rounded-full" style={{ background: EVENT_COLOR[selected.type] }} />
                {e('eventType', selected.type)}
              </span>
              {selected.reminder && (
                <span className="pill bg-accent-soft text-accent">
                  <Bell size={12} />
                  {t('cal.reminderOn')}
                </span>
              )}
              {selected.status === 'propuesto' && <span className="pill bg-warn/10 text-warn">{t('shcal.pendingLong')}</span>}
              {selected.status === 'confirmado' && selected.participants && <span className="pill bg-ok/10 text-ok">{t('shcal.confirmed')}</span>}
              {selected.status === 'rechazado' && <span className="pill bg-danger/10 text-danger">{t('shcal.rejected')}</span>}
            </div>

            {(selected.participants || selected.note) && (
              <div className="rounded-card border border-line p-3">
                {creator && (
                  <div className="mb-2 flex items-center gap-2 text-sm">
                    <Avatar userId={creator.id} size={24} />
                    <span className="text-muted">{t('shcal.proposedBy')}</span>
                    <span className="font-semibold text-ink">{creator.name}</span>
                  </div>
                )}
                {selected.note && <p className="mb-2 rounded-ctl bg-subtle px-3 py-2 text-[13px] italic text-ink2">“{b(selected.note)}”</p>}
                {selected.participants && (
                  <>
                    <div className="kpi-label mb-1.5">{t('shcal.participants')}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.participants.map((r) => (
                        <span key={r} className="pill" style={{ background: `color-mix(in srgb, ${roleColor[r]} 12%, transparent)`, color: roleColor[r] }}>
                          {e('role', r)}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <dl className="space-y-3 text-sm">
              <div className="flex gap-3">
                <CalendarDays size={16} className="mt-0.5 shrink-0 text-muted" />
                <div>
                  <dt className="text-xs text-muted">{t('common.date')}</dt>
                  <dd className="font-medium capitalize text-ink">{fmtDate(selected.date, 'EEEE d MMMM yyyy', lang)}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock size={16} className="mt-0.5 shrink-0 text-muted" />
                <div>
                  <dt className="text-xs text-muted">{t('cal.time')}</dt>
                  <dd className="num text-ink">
                    {timeRange(selected)} <span className="font-sans font-normal text-muted">· {t('cal.min', { n: selected.durationMin })}</span>
                  </dd>
                </div>
              </div>
              {selected.location && (
                <div className="flex gap-3">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-muted" />
                  <div>
                    <dt className="text-xs text-muted">{t('cal.location')}</dt>
                    <dd className="font-medium text-ink">{selected.location}</dd>
                  </div>
                </div>
              )}
            </dl>

            {owner && (
              <div className="rounded-card border border-line p-3">
                <div className="kpi-label mb-2">{t('common.owner')}</div>
                <div className="flex items-center gap-3">
                  <Avatar userId={owner.id} size={36} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-ink">{owner.name}</div>
                    <div className="truncate text-xs text-muted">{b(owner.title)}</div>
                  </div>
                </div>
              </div>
            )}

            {(lead || brand || project) && (
              <div className="rounded-card border border-line p-3">
                <div className="kpi-label mb-2">{t('cal.linked')}</div>
                <div className="space-y-2 text-sm">
                  {lead && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted">{t('cal.lead')}</span>
                      {mode === 'admin' ? (
                        <Link to={`/admin/crm/${lead.id}`} className="inline-flex min-h-[44px] items-center font-semibold text-accent hover:underline">
                          {lead.name}
                        </Link>
                      ) : (
                        <span className="font-medium text-ink">{lead.name}</span>
                      )}
                    </div>
                  )}
                  {brand && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted">{t('common.brand')}</span>
                      <span className="inline-flex items-center gap-2 font-medium text-ink">
                        <span className="h-2 w-2 rounded-full" style={{ background: brand.color }} />
                        {brand.name}
                      </span>
                    </div>
                  )}
                  {project && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted">{t('cal.project')}</span>
                      {mode === 'equipo' ? (
                        <Link to={`/equipo/proyectos/${project.id}`} className="inline-flex min-h-[44px] items-center text-right font-semibold text-accent hover:underline">
                          {project.name}
                        </Link>
                      ) : (
                        <span className="text-right font-medium text-ink">{project.name}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </SidePanel>
    </div>
  );
}

export const startOfToday = () => startOfDay(new Date());
export const inNextDays = (iso: string, days: number) => {
  const d = new Date(iso);
  const s = startOfToday();
  return d >= s && d < addDays(s, days);
};
