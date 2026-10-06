import { differenceInCalendarDays } from 'date-fns';
import { CalendarClock } from 'lucide-react';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils';
import { fmtDate } from '@/lib/format';
import type { ProjectStatus, Task, TaskStatus, TaskTag } from '@/types';

export const STATUSES: TaskStatus[] = ['pendiente', 'curso', 'revision', 'hecho'];

/** Días calendario hasta la fecha (negativo = vencida). */
export const dueDays = (iso: string) => differenceInCalendarDays(new Date(iso), new Date());

export const isOverdue = (t: Task) => t.status !== 'hecho' && dueDays(t.due) < 0;

const TAG_CLS: Record<TaskTag, string> = {
  legal: 'bg-[#7c3aed]/10 text-[#7c3aed] dark:text-[#a78bfa]',
  shopping: 'bg-accent-soft text-accent',
  rrhh: 'bg-[#0d9488]/10 text-[#0d9488] dark:text-[#2dd4bf]',
  obra: 'bg-[#b45309]/10 text-[#b45309] dark:text-[#f59e0b]',
  marketing: 'bg-[#db2777]/10 text-[#db2777] dark:text-[#f472b6]',
};

export function TagBadge({ tag }: { tag: TaskTag }) {
  const { e } = useT();
  return <span className={cn('pill', TAG_CLS[tag])}>{e('taskTag', tag)}</span>;
}

export const projectTone = (s: ProjectStatus) => (s === 'tiempo' ? 'ok' : s === 'riesgo' ? 'warn' : 'danger') as 'ok' | 'warn' | 'danger';

export const STATUS_DOT: Record<TaskStatus, string> = {
  pendiente: 'bg-muted',
  curso: 'bg-accent',
  revision: 'bg-warn',
  hecho: 'bg-ok',
};

export function DueLabel({ task, className }: { task: Task; className?: string }) {
  const { t, lang } = useT();
  const n = dueDays(task.due);
  const done = task.status === 'hecho';
  let text = fmtDate(task.due, 'd MMM', lang);
  let cls = 'text-muted';
  if (!done) {
    if (n < 0) {
      text = n === -1 ? t('eq.due.overdue1') : t('eq.due.overdue', { n: -n });
      cls = 'text-danger font-semibold';
    } else if (n === 0) {
      text = t('eq.due.today');
      cls = 'text-warn font-semibold';
    } else if (n === 1) {
      text = t('eq.due.tomorrow');
      cls = 'text-ink2';
    }
  }
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs', cls, className)}>
      <CalendarClock size={13} className="shrink-0" />
      <span className="tabular-nums">{text}</span>
    </span>
  );
}
