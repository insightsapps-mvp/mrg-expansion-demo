import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { motion, useSpring, useTransform } from 'framer-motion';
import { AlertTriangle, CalendarDays, ChevronRight, ListChecks, MapPin, MessageSquare, Share2 } from 'lucide-react';
import { Avatar, Badge, Empty, MoveMenu, PageHeader, PreviewBanner, Progress, Segmented } from '@/components/ui';
import { en, tr, useT } from '@/i18n';
import { useApp } from '@/store';
import { projectProgress, projects } from '@/data/projects';
import { brandById } from '@/data/brands';
import { userById } from '@/data/users';
import { fmtDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types';
import { DueLabel, STATUSES, STATUS_DOT, TagBadge, projectTone } from './_components/taskUi';
import { TaskPanel } from './_components/TaskPanel';

/* ---------- % animado ---------- */
function AnimatedPct({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 90, damping: 18 });
  const rounded = useTransform(spring, (v) => `${Math.round(v)}%`);
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);
  return <motion.span>{rounded}</motion.span>;
}

/* ---------- Contenido de tarjeta ---------- */
function CardBody({ task }: { task: Task }) {
  const { b } = useT();
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <TagBadge tag={task.tag} />
        <Avatar userId={task.assigneeId} size={26} />
      </div>
      <div className={cn('mt-2 text-sm font-medium leading-snug text-ink', task.status === 'hecho' && 'text-ink2 line-through decoration-line-strong')}>{b(task.title)}</div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <DueLabel task={task} />
        <span className={cn('inline-flex items-center gap-1 text-xs', task.comments.length ? 'text-ink2' : 'text-muted')}>
          <MessageSquare size={13} />
          <span className="num">{task.comments.length}</span>
        </span>
      </div>
    </>
  );
}

function DraggableCard({ task, onOpen }: { task: Task; onOpen: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task.id)}
      className={cn(
        'card cursor-grab touch-none select-none p-3 transition-shadow hover:border-line-strong hover:shadow-md active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
    >
      <CardBody task={task} />
    </div>
  );
}

function Column({ status, tasks, onOpen, dragging }: { status: TaskStatus; tasks: Task[]; onOpen: (id: string) => void; dragging: boolean }) {
  const { t, e } = useT();
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-[420px] min-w-0 flex-col rounded-panel border border-line bg-subtle/60 p-3 transition-colors',
        isOver && 'border-accent bg-accent-soft/60',
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
          <span className={cn('h-2 w-2 rounded-full', STATUS_DOT[status])} />
          {e('taskStatus', status)}
        </div>
        <span className="num rounded-full bg-card px-2 py-0.5 text-[11px] text-muted">{tasks.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5">
        {tasks.map((task) => (
          <DraggableCard key={task.id} task={task} onOpen={onOpen} />
        ))}
        {tasks.length === 0 && (
          <div className={cn('flex flex-1 items-center justify-center rounded-card border border-dashed border-line px-3 py-8 text-center text-xs text-muted', dragging && 'border-accent/50 text-accent')}>
            {dragging ? t('eq.board.drop') : t('eq.board.emptyCol')}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Board() {
  const { id } = useParams();
  const { t, b, e, lang } = useT();
  const allTasks = useApp((s) => s.tasks);
  const project = projects.find((p) => p.id === id);
  const tasks = useMemo(() => allTasks.filter((x) => x.projectId === id), [allTasks, id]);
  const pct = projectProgress(allTasks, id ?? '');

  const [activeId, setActiveId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<TaskStatus>('curso');
  const justDragged = useRef(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const move = useCallback((taskId: string, status: TaskStatus) => {
    const st = useApp.getState();
    const task = st.tasks.find((x) => x.id === taskId);
    if (!task || task.status === status) return;
    st.moveTask(taskId, status);
    const next = projectProgress(useApp.getState().tasks, task.projectId);
    const l = st.lang;
    st.toast(tr('eq.board.moved', l, { status: en('taskStatus', status, l), pct: next }));
  }, []);

  const onOpen = useCallback((tid: string) => {
    if (justDragged.current) return;
    setOpenId(tid);
  }, []);
  const onClose = useCallback(() => setOpenId(null), []);

  const onDragStart = (ev: DragStartEvent) => setActiveId(String(ev.active.id));
  const onDragEnd = (ev: DragEndEvent) => {
    setActiveId(null);
    justDragged.current = true;
    setTimeout(() => (justDragged.current = false), 120);
    if (ev.over) move(String(ev.active.id), ev.over.id as TaskStatus);
  };

  if (!project) {
    return (
      <div>
        <Crumb label={t('eq.board.crumb')} />
        <PageHeader kicker={t('kicker.equipo')} title={t('eq.board.notFound')} />
        <Empty text={t('eq.board.notFound')} />
        <div className="mt-4">
          <Link to="/equipo/proyectos" className="btn-secondary min-h-[44px]">
            {t('eq.board.backToProjects')}
          </Link>
        </div>
      </div>
    );
  }

  const brand = brandById(project.brandId);
  const owner = userById(project.ownerId);
  const tone = projectTone(project.status);
  const done = tasks.filter((x) => x.status === 'hecho').length;
  const byStatus = (s: TaskStatus) => tasks.filter((x) => x.status === s);
  const active = tasks.find((x) => x.id === activeId);

  return (
    <div>
      <Crumb label={t('eq.board.crumb')} current={project.name} />
      <PageHeader
        kicker={t('kicker.equipo')}
        title={project.name}
        subtitle={t('eq.board.subtitle', { mall: project.mall, owner: owner.name })}
        actions={
          <>
            <Link to="/equipo/mis-tareas" className="btn-ghost min-h-[44px]">
              <ListChecks size={16} />
              {t('eq.board.myTasks')}
            </Link>
            <button type="button" className="btn-secondary min-h-[44px]" onClick={() => useApp.getState().toast(t('eq.board.shareToast'))}>
              <Share2 size={16} />
              {t('eq.board.share')}
            </button>
          </>
        }
      />
      <PreviewBanner bullets={[t('eq.board.b1'), t('eq.board.b2'), t('eq.board.b3')]} />

      {/* Resumen del proyecto */}
      <div className="card mb-6 p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <div className="kpi-label">{t('eq.board.progress')}</div>
            <div className="mt-2 flex items-end gap-3">
              <span className="num text-[44px] font-bold leading-none tracking-tight text-ink sm:text-[52px]">
                <AnimatedPct value={pct} />
              </span>
              <span className="mb-1.5 text-sm text-ink2">{t('eq.board.tasksDone', { done, total: tasks.length })}</span>
            </div>
            <Progress value={pct} className="mt-3 h-2.5" tone={project.status === 'tiempo' ? 'accent' : tone} />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:w-[460px] lg:shrink-0">
            <div className="min-w-0">
              <div className="kpi-label mb-1.5">{t('common.status')}</div>
              <Badge tone={tone}>{e('projectStatus', project.status)}</Badge>
            </div>
            <div className="min-w-0">
              <div className="kpi-label mb-1.5">{t('eq.proj.target')}</div>
              <div className="flex items-center gap-1 text-sm text-ink">
                <CalendarDays size={14} className="shrink-0 text-muted" />
                <span className="num truncate">{fmtDate(project.targetDate, 'd MMM yy', lang)}</span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="kpi-label mb-1.5">{t('common.brand')}</div>
              <div className="flex items-center gap-1.5 text-sm text-ink">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: brand.color }} />
                <span className="truncate">{brand.name}</span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="kpi-label mb-1.5">{t('common.owner')}</div>
              <div className="flex items-center gap-1.5 text-sm text-ink">
                <Avatar userId={owner.id} size={22} />
                <span className="truncate">{owner.name.split(' ')[0]}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs text-muted">
          <MapPin size={12} />
          {project.mall}
        </div>
        {project.alert && (
          <div
            className={cn(
              'mt-4 flex items-start gap-2 rounded-ctl px-3 py-2.5 text-sm font-medium',
              project.status === 'atrasado' ? 'bg-danger/10 text-danger' : 'bg-warn/10 text-warn',
            )}
          >
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{b(project.alert)}</span>
          </div>
        )}
      </div>

      <div data-trailer="board">
        <p className="mb-3 text-xs text-muted">{t('eq.board.dragHint')}</p>

        {/* Desktop: Kanban con drag & drop */}
        <div className="hidden lg:block">
          <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
            <div className="grid grid-cols-4 gap-4">
              {STATUSES.map((s) => (
                <Column key={s} status={s} tasks={byStatus(s)} onOpen={onOpen} dragging={!!activeId} />
              ))}
            </div>
            <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
              {active ? (
                <div className="card rotate-[1.5deg] cursor-grabbing p-3 shadow-md ring-1 ring-accent/30">
                  <CardBody task={active} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Mobile / tablet: tabs por estado + lista */}
        <div className="lg:hidden">
          <Segmented<TaskStatus>
            scroll
            value={tab}
            onChange={setTab}
            className="mb-4 max-w-full"
            options={STATUSES.map((s) => ({ value: s, label: e('taskStatus', s), count: byStatus(s).length }))}
          />
          <div className="space-y-3">
            {byStatus(tab).length === 0 && <Empty text={t('eq.board.emptyCol')} />}
            {byStatus(tab).map((task) => (
              <div key={task.id} className="card p-3">
                <button type="button" onClick={() => setOpenId(task.id)} className="block w-full text-left">
                  <CardBody task={task} />
                </button>
                <div className="mt-3 flex justify-end border-t border-line pt-3">
                  <MoveMenu
                    label={t('common.moveTo')}
                    current={task.status}
                    options={STATUSES.map((s) => ({ value: s, label: e('taskStatus', s) }))}
                    onSelect={(s) => move(task.id, s)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TaskPanel key={openId ?? 'none'} taskId={openId} onClose={onClose} onMove={move} />
    </div>
  );
}

function Crumb({ label, current }: { label: string; current?: string }) {
  return (
    <nav className="mb-3 flex min-w-0 items-center gap-1 text-[13px] text-muted">
      <Link to="/equipo/proyectos" className="inline-flex min-h-[44px] items-center font-medium text-ink2 hover:text-accent">
        {label}
      </Link>
      {current && (
        <>
          <ChevronRight size={14} className="shrink-0" />
          <span className="truncate">{current}</span>
        </>
      )}
    </nav>
  );
}
