import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { CalendarPlus, Check, Clock, Users } from 'lucide-react';
import { useApp } from '@/store';
import { bi, tr, useT } from '@/i18n';
import { cn } from '@/lib/utils';
import { fmtDate } from '@/lib/format';
import { Modal, PageHeader, PreviewBanner } from '@/components/ui';
import { roleColor, roleUser } from '@/data/users';
import CalendarView, { EVENT_COLOR, type CalendarMode } from './CalendarView';
import type { CalendarEvent, EventType, Role } from '@/types';

/** Quién ve qué: cada rol ve las actividades de su marca / su apertura y las que lo incluyen. */
export function eventsFor(role: Role, events: CalendarEvent[]) {
  return events.filter((ev) => {
    if (ev.status === 'rechazado') return false;
    if (role === 'admin') return true;
    if (ev.participants?.includes(role)) return true;
    if (role === 'franquiciante') return ev.brandId === 'pampa' && !ev.leadId;
    if (role === 'franquiciado') return ev.projectId === 'pampa-eldorado';
    if (role === 'equipo') return ev.type === 'visita' || ev.type === 'vencimiento';
    return false;
  });
}

const OTHERS: Record<'franquiciante' | 'franquiciado', Role[]> = {
  franquiciante: ['franquiciado', 'equipo'],
  franquiciado: ['franquiciante', 'equipo'],
};

function ProposeModal({ open, onClose, role, initialDate }: { open: boolean; onClose: () => void; role: 'franquiciante' | 'franquiciado'; initialDate?: Date }) {
  const { t, e } = useT();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('reunion');
  const [date, setDate] = useState(() => format(initialDate ?? new Date(Date.now() + 2 * 864e5), 'yyyy-MM-dd'));
  const [time, setTime] = useState('11:00');
  const [dur, setDur] = useState(45);
  const [who, setWho] = useState<Role[]>([]);
  const [note, setNote] = useState('');
  const [err, setErr] = useState(false);

  const submit = () => {
    const s = useApp.getState();
    if (!title.trim()) return setErr(true);
    const [h, m] = time.split(':').map(Number);
    const d = new Date(date + 'T00:00:00');
    d.setHours(h || 10, m || 0, 0, 0);
    const ev: CalendarEvent = {
      id: `E-P${Date.now()}`,
      date: d.toISOString(),
      durationMin: dur,
      type,
      title: [title.trim(), title.trim()],
      ownerId: roleUser[role],
      createdBy: roleUser[role],
      brandId: 'pampa',
      projectId: role === 'franquiciado' ? 'pampa-eldorado' : undefined,
      participants: ['admin', role, ...who],
      status: 'propuesto',
      note: note.trim() ? [note.trim(), note.trim()] : undefined,
    };
    s.addEvent(ev);
    s.toast(tr('shcal.sentToast', s.lang));
    setTitle('');
    setNote('');
    setWho([]);
    setErr(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('shcal.proposeTitle')}
      width={520}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn-primary" onClick={submit}>
            <CalendarPlus size={16} />
            {t('shcal.send')}
          </button>
        </>
      }
    >
      <p className="mb-4 text-sm text-ink2">{t('shcal.proposeHint')}</p>
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="pt">
            {t('shcal.what')}
          </label>
          <input id="pt" className={cn('input', err && 'border-danger')} value={title} onChange={(ev) => setTitle(ev.target.value)} placeholder={t(role === 'franquiciado' ? 'shcal.phFdo' : 'shcal.phFte')} />
          {err && <div className="mt-1 text-xs text-danger">{t('shcal.required')}</div>}
        </div>
        <div>
          <div className="label">{t('shcal.type')}</div>
          <div className="flex flex-wrap gap-1.5">
            {(['reunion', 'llamada', 'visita'] as EventType[]).map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setType(tp)}
                className={cn('inline-flex min-h-[40px] items-center gap-2 rounded-full border px-3 text-[13px] font-medium', type === tp ? 'border-accent bg-accent-soft text-accent' : 'border-line text-ink2')}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: EVENT_COLOR[tp] }} />
                {e('eventType', tp)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="label" htmlFor="pd">
              {t('common.date')}
            </label>
            <input id="pd" type="date" className="input" value={date} onChange={(ev) => setDate(ev.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="ph">
              {t('cal.time')}
            </label>
            <input id="ph" type="time" className="input" value={time} onChange={(ev) => setTime(ev.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="pm">
              {t('shcal.duration')}
            </label>
            <select id="pm" className="input" value={dur} onChange={(ev) => setDur(Number(ev.target.value))}>
              {[30, 45, 60, 90].map((n) => (
                <option key={n} value={n}>
                  {t('cal.min', { n })}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <div className="label">{t('shcal.with')}</div>
          <div className="flex flex-wrap gap-1.5">
            <span className="pill min-h-[36px] px-3" style={{ background: `color-mix(in srgb, ${roleColor.admin} 12%, transparent)`, color: roleColor.admin }}>
              <Check size={12} /> {t('shcal.mrgAlways')}
            </span>
            {OTHERS[role].map((r) => {
              const on = who.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setWho((w) => (on ? w.filter((x) => x !== r) : [...w, r]))}
                  className={cn('inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium', on ? 'border-transparent' : 'border-line text-ink2')}
                  style={on ? { background: `color-mix(in srgb, ${roleColor[r]} 14%, transparent)`, color: roleColor[r] } : undefined}
                  aria-pressed={on}
                >
                  {on && <Check size={12} />}
                  {t(`shcal.who.${r}`)}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="pn">
            {t('shcal.note')}
          </label>
          <textarea id="pn" rows={3} className="input py-2" value={note} onChange={(ev) => setNote(ev.target.value)} placeholder={t('shcal.notePh')} />
        </div>
      </div>
    </Modal>
  );
}

export default function SharedCalendarPage({ role }: { role: 'franquiciante' | 'franquiciado' }) {
  const { t, lang } = useT();
  const events = useApp((s) => s.events);
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState<Date | undefined>();
  const list = useMemo(() => eventsFor(role, events), [role, events]);
  const mine = list.filter((ev) => ev.createdBy === roleUser[role] && ev.status === 'propuesto');
  const upcoming = list.filter((ev) => new Date(ev.date) >= new Date() && ev.status !== 'propuesto').slice().sort((a, z) => +new Date(a.date) - +new Date(z.date)).slice(0, 3);

  return (
    <div>
      <PageHeader
        kicker={t(`kicker.${role}`)}
        title={t('shcal.title')}
        subtitle={t(`shcal.sub.${role}`)}
        actions={
          <button
            className="btn-primary"
            onClick={() => {
              setDay(undefined);
              setOpen(true);
            }}
          >
            <CalendarPlus size={16} />
            {t('shcal.propose')}
          </button>
        }
      />
      <PreviewBanner bullets={[t('shcal.b1'), t('shcal.b2'), t('shcal.b3')]} />

      <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="card min-w-0 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
            <Clock size={15} className="text-warn" />
            {t('shcal.myPending', { n: mine.length })}
          </div>
          {mine.length === 0 ? (
            <div className="text-sm text-muted">{t('shcal.noPending')}</div>
          ) : (
            <ul className="space-y-1.5">
              {mine.map((ev) => (
                <li key={ev.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-ink">{bi(ev.title, lang)}</span>
                  <span className="num shrink-0 text-xs text-muted">{fmtDate(ev.date, 'd MMM HH:mm', lang)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card min-w-0 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
            <Users size={15} className="text-accent" />
            {t('shcal.next')}
          </div>
          {upcoming.length === 0 ? (
            <div className="text-sm text-muted">{t('cal.empty')}</div>
          ) : (
            <ul className="space-y-1.5">
              {upcoming.map((ev) => (
                <li key={ev.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: EVENT_COLOR[ev.type] }} />
                    <span className="truncate text-ink">{bi(ev.title, lang)}</span>
                  </span>
                  <span className="num shrink-0 text-xs text-muted">{fmtDate(ev.date, 'd MMM HH:mm', lang)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <CalendarView
        events={list}
        mode={role as CalendarMode}
        onAdd={(d) => {
          setDay(d);
          setOpen(true);
        }}
      />
      <ProposeModal key={day?.toISOString() ?? 'new'} open={open} onClose={() => setOpen(false)} role={role} initialDate={day} />
    </div>
  );
}
