import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Paperclip, PenTool, Send } from 'lucide-react';
import { Avatar, DevNotice, MoveMenu, SidePanel } from '@/components/ui';
import { useT } from '@/i18n';
import { useApp } from '@/store';
import { userById } from '@/data/users';
import { projects } from '@/data/projects';
import { fmtAgo, fmtDate } from '@/lib/format';
import type { TaskStatus } from '@/types';
import { DueLabel, STATUSES, STATUS_DOT, TagBadge } from './taskUi';

const ATTACHMENTS = [
  { name: 'contrato_locacion_v2.pdf', size: '1,8 MB', by: 'u-diego', daysAgo: 3, icon: FileText },
  { name: 'plano_local.dwg', size: '4,2 MB', by: 'u-paula', daysAgo: 6, icon: PenTool },
];

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[40px] items-center justify-between gap-3 border-b border-line py-2 last:border-0">
      <span className="shrink-0 text-xs font-medium text-muted">{label}</span>
      <div className="min-w-0 text-right text-sm text-ink">{children}</div>
    </div>
  );
}

export function TaskPanel({
  taskId,
  onClose,
  onMove,
  showProjectLink,
}: {
  taskId: string | null;
  onClose: () => void;
  onMove: (taskId: string, status: TaskStatus) => void;
  showProjectLink?: boolean;
}) {
  const { t, b, e, lang } = useT();
  const task = useApp((s) => s.tasks.find((x) => x.id === taskId));
  const [draft, setDraft] = useState('');

  if (!task) return null;
  const project = projects.find((p) => p.id === task.projectId);
  const assignee = userById(task.assigneeId);

  const submit = () => {
    const txt = draft.trim();
    if (!txt) return;
    useApp.getState().addTaskComment(task.id, 'u-paula', txt);
    useApp.getState().toast(t('eq.task.commentToast'));
    setDraft('');
  };

  return (
    <SidePanel open={!!taskId} onClose={onClose} title={<span className="block leading-snug">{b(task.title)}</span>}>
      <div className="space-y-6">
        {/* Detalles */}
        <section>
          <div className="kpi-label mb-2">{t('eq.task.details')}</div>
          <div className="rounded-card border border-line px-3">
            {project && (
              <Row label={t('eq.task.project')}>
                <span className="block truncate">{project.name}</span>
              </Row>
            )}
            <Row label={t('eq.task.assignee')}>
              <span className="inline-flex min-w-0 items-center gap-2">
                <Avatar userId={assignee.id} size={24} />
                <span className="truncate">{assignee.name}</span>
              </span>
            </Row>
            <Row label={t('eq.task.due')}>
              <span className="inline-flex flex-col items-end">
                <span className="num text-[13px]">{fmtDate(task.due, 'd MMM yyyy', lang)}</span>
                <DueLabel task={task} />
              </span>
            </Row>
            <Row label={t('eq.task.tag')}>
              <TagBadge tag={task.tag} />
            </Row>
            <Row label={t('eq.task.status')}>
              <span className="inline-flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[task.status]}`} />
                {e('taskStatus', task.status)}
              </span>
            </Row>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">{t('eq.task.changeStatus')}</span>
            <MoveMenu
              label={t('common.moveTo')}
              current={task.status}
              options={STATUSES.map((s) => ({ value: s, label: e('taskStatus', s) }))}
              onSelect={(s) => onMove(task.id, s)}
            />
            {showProjectLink && project && (
              <Link to={`/equipo/proyectos/${project.id}`} className="btn-ghost btn-sm min-h-[44px]">
                {t('eq.task.openBoard')}
              </Link>
            )}
          </div>
        </section>

        {/* Comentarios */}
        <section>
          <div className="kpi-label mb-2">
            {t('eq.task.comments')} <span className="num">· {task.comments.length}</span>
          </div>
          {task.comments.length === 0 ? (
            <p className="text-sm text-muted">{t('eq.task.noComments')}</p>
          ) : (
            <ul className="space-y-3">
              {task.comments.map((c) => {
                const u = userById(c.authorId);
                return (
                  <li key={c.id} className="flex gap-3">
                    <Avatar userId={c.authorId} size={30} />
                    <div className="min-w-0 flex-1 rounded-ctl bg-subtle px-3 py-2">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span className="text-[13px] font-semibold text-ink">{u?.name}</span>
                        <span className="text-[11px] text-muted">{fmtAgo(c.daysAgo, lang)}</span>
                      </div>
                      <p className="mt-0.5 break-words text-sm text-ink2">{b(c.text)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <form
            className="mt-3 flex gap-2"
            onSubmit={(ev) => {
              ev.preventDefault();
              submit();
            }}
          >
            <input className="input min-w-0 flex-1" value={draft} onChange={(ev) => setDraft(ev.target.value)} placeholder={t('eq.task.commentPh')} />
            <button type="submit" className="btn-primary min-h-[44px] shrink-0 px-3" disabled={!draft.trim()} aria-label={t('eq.task.commentSend')}>
              <Send size={16} />
              <span className="hidden sm:inline">{t('eq.task.commentSend')}</span>
            </button>
          </form>
        </section>

        {/* Adjuntos */}
        <section>
          <div className="kpi-label mb-2">{t('eq.task.attachments')}</div>
          <DevNotice feature={t('eq.task.devFeature')} now={t('eq.task.devNow')} later={t('eq.task.devLater')} />
          <ul className="space-y-2">
            {ATTACHMENTS.map((a) => (
              <li key={a.name}>
                <button
                  type="button"
                  onClick={() => useApp.getState().toast(t('eq.task.fileToast', { name: a.name }), 'info')}
                  className="flex min-h-[52px] w-full items-center gap-3 rounded-ctl border border-line px-3 py-2 text-left transition hover:bg-subtle"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-ctl bg-accent-soft text-accent">
                    <a.icon size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{a.name}</span>
                    <span className="block truncate text-xs text-muted">
                      <span className="num">{a.size}</span> · {t('eq.task.uploadedBy', { name: userById(a.by).name })} · {fmtAgo(a.daysAgo, lang)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn-secondary mt-3 min-h-[44px] w-full" onClick={() => useApp.getState().toast(t('eq.task.attachToast'), 'info')}>
            <Paperclip size={16} />
            {t('eq.task.attach')}
          </button>
        </section>
      </div>
    </SidePanel>
  );
}
