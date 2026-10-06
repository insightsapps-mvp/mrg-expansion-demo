import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { useApp } from '@/store';
import { tr, useT } from '@/i18n';
import { cn } from '@/lib/utils';
import { DevNotice, Modal, PageHeader, PreviewBanner } from '@/components/ui';
import CalendarView, { EVENT_COLOR, EVENT_TYPES } from '@/components/calendar/CalendarView';
import type { CalendarEvent, EventType } from '@/types';

interface Form {
  title: string;
  type: EventType;
  date: string;
  time: string;
  duration: number;
  leadId: string;
  reminder: boolean;
}

const emptyForm = (d?: Date, leadId = ''): Form => {
  const base = d ?? new Date();
  const hasTime = !!d && (d.getHours() !== 0 || d.getMinutes() !== 0);
  return {
    title: '',
    type: 'reunion',
    date: format(base, 'yyyy-MM-dd'),
    time: hasTime ? format(base, 'HH:mm') : '10:00',
    duration: 60,
    leadId,
    reminder: true,
  };
};

export default function AdminCalendar() {
  const { t, e } = useT();
  const events = useApp((s) => s.events);
  const leads = useApp((s) => s.leads);
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(() => emptyForm());

  const monthCount = useMemo(() => {
    const n = new Date();
    return events.filter((ev) => {
      const d = new Date(ev.date);
      return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    }).length;
  }, [events]);

  // ?lead=L-001&new=1 → abre el modal precargado (desde la ficha del lead)
  useEffect(() => {
    if (params.get('new') === '1') {
      const leadId = params.get('lead') ?? '';
      setForm(emptyForm(undefined, leadId));
      setOpen(true);
    }
  }, [params]);

  const close = useCallback(() => {
    setOpen(false);
    if (params.get('new')) setParams({}, { replace: true });
  }, [params, setParams]);

  const onAdd = useCallback((d?: Date) => {
    setForm(emptyForm(d));
    setOpen(true);
  }, []);

  const lead = leads.find((l) => l.id === form.leadId);
  const autoTitle = lead ? `${e('eventType', form.type)} · ${lead.name}` : '';

  const save = () => {
    const s = useApp.getState();
    const title = form.title.trim() || autoTitle;
    if (!title) {
      s.toast(tr('cal.form.needTitle', s.lang), 'warn');
      return;
    }
    const ev: CalendarEvent = {
      id: `E-${Date.now()}`,
      date: new Date(`${form.date}T${form.time || '10:00'}`).toISOString(),
      durationMin: form.duration,
      type: form.type,
      title: [title, title],
      ownerId: 'u-daniel',
      leadId: lead?.id,
      brandId: lead?.brandId,
      reminder: form.reminder,
    };
    s.addEvent(ev);
    s.toast(tr(form.reminder ? 'cal.form.savedReminder' : 'cal.form.saved', s.lang, { title }));
    close();
  };

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader
        kicker={t('kicker.admin')}
        title={t('cal.title')}
        subtitle={t('cal.subtitle', { n: monthCount })}
        actions={
          <button type="button" className="btn-primary" onClick={() => onAdd()}>
            <Plus size={16} />
            {t('cal.addEvent')}
          </button>
        }
      />
      <PreviewBanner bullets={[t('cal.b1'), t('cal.b2'), t('cal.b3')]} />

      <CalendarView events={events} mode="admin" onAdd={onAdd} />

      <Modal
        open={open}
        onClose={close}
        title={t('cal.form.title')}
        width={560}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={close}>
              {t('common.cancel')}
            </button>
            <button type="button" className="btn-primary" onClick={save}>
              {t('common.save')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="ev-title">
              {t('cal.form.name')}
            </label>
            <input
              id="ev-title"
              className="input"
              value={form.title}
              onChange={(x) => set('title', x.target.value)}
              placeholder={autoTitle || t('cal.form.namePh')}
            />
          </div>

          <div>
            <span className="label">{t('cal.form.type')}</span>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_TYPES.map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => set('type', tp)}
                  className={cn(
                    'flex min-h-[44px] items-center gap-2 rounded-ctl border px-3 text-left text-[13px] font-medium transition',
                    form.type === tp ? 'border-accent bg-accent-soft text-ink' : 'border-line-strong bg-card text-ink2 hover:bg-subtle',
                  )}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: EVENT_COLOR[tp] }} />
                  <span className="truncate">{e('eventType', tp)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 xs:grid-cols-3">
            <div>
              <label className="label" htmlFor="ev-date">
                {t('common.date')}
              </label>
              <input id="ev-date" type="date" className="input" value={form.date} onChange={(x) => set('date', x.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="ev-time">
                {t('cal.time')}
              </label>
              <input id="ev-time" type="time" className="input" value={form.time} onChange={(x) => set('time', x.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="ev-dur">
                {t('cal.form.duration')}
              </label>
              <select id="ev-dur" className="input" value={form.duration} onChange={(x) => set('duration', Number(x.target.value))}>
                {[30, 45, 60, 90, 120].map((m) => (
                  <option key={m} value={m}>
                    {t('cal.min', { n: m })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="ev-lead">
              {t('cal.form.lead')}
            </label>
            <select id="ev-lead" className="input" value={form.leadId} onChange={(x) => set('leadId', x.target.value)}>
              <option value="">{t('cal.form.noLead')}</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} · {l.id}
                </option>
              ))}
            </select>
          </div>

          <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-ctl border border-line px-3 py-2">
            <span className="text-sm text-ink">{t('cal.form.reminder')}</span>
            <span className="relative inline-flex shrink-0 items-center">
              <input type="checkbox" className="peer sr-only" checked={form.reminder} onChange={(x) => set('reminder', x.target.checked)} />
              <span className="h-6 w-11 rounded-full bg-line-strong transition peer-checked:bg-accent" />
              <span className="absolute left-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-[left] peer-checked:left-[22px]" />
            </span>
          </label>

          <DevNotice className="mb-0" feature={t('cal.dev.feature')} now={t('cal.dev.now')} later={t('cal.dev.later')} />
        </div>
      </Modal>
    </div>
  );
}
