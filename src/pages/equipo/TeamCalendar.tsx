import { useMemo } from 'react';
import { addDays, startOfDay } from 'date-fns';
import { useApp } from '@/store';
import { useT } from '@/i18n';
import { PageHeader, PreviewBanner } from '@/components/ui';
import CalendarView from '@/components/calendar/CalendarView';
import { eventsFor } from '@/components/calendar/SharedCalendar';
import { projects } from '@/data/projects';
import type { CalendarEvent } from '@/types';

export default function TeamCalendar() {
  const { t } = useT();
  const events = useApp((s) => s.events);
  const tasks = useApp((s) => s.tasks);

  const { list, taskCount } = useMemo(() => {
    const from = startOfDay(new Date());
    const to = addDays(from, 45);
    const fromTasks: CalendarEvent[] = tasks
      .filter((tk) => {
        const d = new Date(tk.due);
        return tk.status !== 'hecho' && d >= from && d <= to;
      })
      .map((tk) => ({
        id: `T-${tk.id}`,
        date: tk.due,
        durationMin: 30,
        type: 'vencimiento',
        title: tk.title,
        projectId: tk.projectId,
        brandId: projects.find((p) => p.id === tk.projectId)?.brandId,
        ownerId: tk.assigneeId,
      }));
    const base = eventsFor('equipo', events);
    return { list: [...base, ...fromTasks], taskCount: fromTasks.length };
  }, [events, tasks]);

  return (
    <div>
      <PageHeader kicker={t('kicker.equipo')} title={t('cal.team.title')} subtitle={t('cal.team.subtitle', { n: taskCount })} />
      <PreviewBanner bullets={[t('cal.team.b1'), t('cal.team.b2'), t('cal.team.b3')]} />
      <CalendarView events={list} mode="equipo" />
    </div>
  );
}
