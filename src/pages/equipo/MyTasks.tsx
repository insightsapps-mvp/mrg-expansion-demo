import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, FolderKanban, Undo2 } from 'lucide-react';
import { PageHeader, PreviewBanner, Empty } from '@/components/ui';
import { en, tr, useT } from '@/i18n';
import { useApp } from '@/store';
import { projectProgress, projects } from '@/data/projects';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types';
import { DueLabel, STATUS_DOT, TagBadge, dueDays } from './_components/taskUi';
import { TaskPanel } from './_components/TaskPanel';

type Group = 'overdue' | 'today' | 'week' | 'later';
const GROUPS: { id: Group; key: string; cls: string; dot: string }[] = [
  { id: 'overdue', key: 'eq.my.gOverdue', cls: 'text-danger', dot: 'bg-danger' },
  { id: 'today', key: 'eq.my.gToday', cls: 'text-warn', dot: 'bg-warn' },
  { id: 'week', key: 'eq.my.gWeek', cls: 'text-ink', dot: 'bg-accent' },
  { id: 'later', key: 'eq.my.gLater', cls: 'text-ink2', dot: 'bg-muted' },
];

const groupOf = (task: Task): Group => {
  const n = dueDays(task.due);
  if (n < 0) return 'overdue';
  if (n === 0) return 'today';
  if (n <= 7) return 'week';
  return 'later';
};

const ME = 'u-paula';

export default function MyTasks() {
  const { t, b, e } = useT();
  const tasks = useApp((s) => s.tasks);
  const [projectId, setProjectId] = useState<string>('all');
  const [justDone, setJustDone] = useState<Record<string, TaskStatus>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const mine = useMemo(
    () =>
      tasks
        .filter((x) => x.assigneeId === ME && (x.status !== 'hecho' || justDone[x.id]))
        .sort((a, z) => a.due.localeCompare(z.due)),
    [tasks, justDone],
  );
  const openCount = mine.filter((x) => x.status !== 'hecho').length;
  const visible = mine.filter((x) => projectId === 'all' || x.projectId === projectId);
  const overdueCount = visible.filter((x) => x.status !== 'hecho' && groupOf(x) === 'overdue').length;

  const markDone = (task: Task) => {
    const st = useApp.getState();
    setJustDone((m) => ({ ...m, [task.id]: task.status }));
    st.moveTask(task.id, 'hecho');
    st.toast(t('eq.my.doneToast', { pct: projectProgress(useApp.getState().tasks, task.projectId) }));
  };
  const undo = (task: Task) => {
    const prev = justDone[task.id] ?? 'pendiente';
    useApp.getState().moveTask(task.id, prev);
    setJustDone((m) => {
      const n = { ...m };
      delete n[task.id];
      return n;
    });
    useApp.getState().toast(t('eq.my.undoneToast'), 'info');
  };

  const move = useCallback((taskId: string, status: TaskStatus) => {
    const st = useApp.getState();
    const task = st.tasks.find((x) => x.id === taskId);
    if (!task || task.status === status) return;
    st.moveTask(taskId, status);
    const l = st.lang;
    st.toast(tr('eq.board.moved', l, { status: en('taskStatus', status, l), pct: projectProgress(useApp.getState().tasks, task.projectId) }));
  }, []);
  const onClose = useCallback(() => setOpenId(null), []);

  const myProjects = projects.filter((p) => tasks.some((x) => x.projectId === p.id && x.assigneeId === ME));

  return (
    <div>
      <PageHeader kicker={t('kicker.equipo')} title={t('eq.my.title')} subtitle={t('eq.my.sub', { n: openCount })} />
      <PreviewBanner bullets={[t('eq.my.b1'), t('eq.my.b2'), t('eq.my.b3')]} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <label className="label" htmlFor="eq-my-project">
            {t('eq.my.filter')}
          </label>
          <select id="eq-my-project" className="input" value={projectId} onChange={(ev) => setProjectId(ev.target.value)}>
            <option value="all">{t('eq.my.allProjects')}</option>
            {myProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {GROUPS.map((g) => {
            const n = visible.filter((x) => x.status !== 'hecho' && groupOf(x) === g.id).length;
            return (
              <a key={g.id} href={`#eq-group-${g.id}`} className="pill min-h-[32px] border border-line bg-card text-ink2">
                <span className={cn('h-1.5 w-1.5 rounded-full', g.dot)} />
                {t(g.key)}
                <span className={cn('num', g.id === 'overdue' && n > 0 && 'text-danger')}>{n}</span>
              </a>
            );
          })}
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="mb-5 flex items-start gap-2 rounded-card border border-danger/25 bg-danger/[0.06] px-4 py-3 text-sm font-medium text-danger">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          {t('eq.my.overdueBanner', { n: overdueCount })}
        </div>
      )}

      {visible.length === 0 ? (
        <Empty text={t('eq.my.empty')} />
      ) : (
        <div className="space-y-6">
          {GROUPS.map((g) => {
            const list = visible.filter((x) => groupOf(x) === g.id);
            const pending = list.filter((x) => x.status !== 'hecho').length;
            return (
              <section key={g.id} id={`eq-group-${g.id}`} className="scroll-mt-24">
                <div className="mb-2 flex items-center gap-2 px-1">
                  <span className={cn('h-2 w-2 rounded-full', g.dot)} />
                  <h2 className={cn('text-sm font-semibold uppercase tracking-[0.08em]', g.cls)}>{t(g.key)}</h2>
                  <span className={cn('num rounded-full px-2 py-0.5 text-[11px]', g.id === 'overdue' && pending ? 'bg-danger/10 text-danger' : 'bg-subtle text-muted')}>{pending}</span>
                </div>
                {list.length === 0 ? (
                  <div className="rounded-card border border-dashed border-line px-4 py-3 text-[13px] text-muted">{t('eq.my.groupEmpty')}</div>
                ) : (
                  <ul className={cn('card divide-y divide-line overflow-hidden', g.id === 'overdue' && pending > 0 && 'border-danger/30')}>
                    {list.map((task) => {
                      const done = task.status === 'hecho';
                      const project = projects.find((p) => p.id === task.projectId);
                      return (
                        <li key={task.id} className={cn('flex items-start gap-2 px-2 py-2 sm:items-center sm:px-3', done && 'bg-subtle/60')}>
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={done}
                            aria-label={t('eq.my.markDone')}
                            onClick={() => (done ? undo(task) : markDone(task))}
                            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                          >
                            <span
                              className={cn(
                                'inline-flex h-[22px] w-[22px] items-center justify-center rounded-[7px] border-2 transition',
                                done ? 'border-ok bg-ok text-white' : g.id === 'overdue' ? 'border-danger/60' : 'border-line-strong',
                              )}
                            >
                              {done && <Check size={14} strokeWidth={3} />}
                            </span>
                          </button>
                          <div className="min-w-0 flex-1 py-1.5">
                            <button type="button" onClick={() => setOpenId(task.id)} className="block min-h-[28px] w-full text-left">
                              <span className={cn('text-sm font-medium leading-snug text-ink', done && 'text-muted line-through')}>{b(task.title)}</span>
                            </button>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                              {project && (
                                <Link
                                  to={`/equipo/proyectos/${project.id}`}
                                  className="inline-flex min-h-[28px] max-w-full items-center gap-1 text-xs font-medium text-accent hover:underline"
                                >
                                  <FolderKanban size={13} className="shrink-0" />
                                  <span className="truncate">{project.name}</span>
                                </Link>
                              )}
                              <TagBadge tag={task.tag} />
                              <DueLabel task={task} />
                              {!done && (
                                <span className="hidden items-center gap-1 text-xs text-muted sm:inline-flex">
                                  <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[task.status])} />
                                  {e('taskStatus', task.status)}
                                </span>
                              )}
                            </div>
                          </div>
                          {done && (
                            <button type="button" onClick={() => undo(task)} aria-label={t('eq.my.undo')} className="btn-ghost btn-sm min-h-[44px] shrink-0 self-center">
                              <Undo2 size={14} />
                              <span className="hidden sm:inline">{t('eq.my.undo')}</span>
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      <TaskPanel key={openId ?? 'none'} taskId={openId} onClose={onClose} onMove={move} showProjectLink />
    </div>
  );
}
