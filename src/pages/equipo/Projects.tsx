import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, MapPin } from 'lucide-react';
import { Avatar, Badge, KpiCard, PageHeader, PreviewBanner, Progress, Segmented } from '@/components/ui';
import { useT } from '@/i18n';
import { useApp } from '@/store';
import { projectProgress, projects } from '@/data/projects';
import { brandById } from '@/data/brands';
import { userById } from '@/data/users';
import { fmtDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { isOverdue, projectTone } from './_components/taskUi';

type Filter = 'all' | 'mine' | 'alert';

export default function Projects() {
  const { t, b, e, lang } = useT();
  const navigate = useNavigate();
  const tasks = useApp((s) => s.tasks);
  const [filter, setFilter] = useState<Filter>('all');

  const overdue = useMemo(() => tasks.filter(isOverdue).length, [tasks]);
  const late = projects.filter((p) => p.status === 'atrasado').length;
  const risk = projects.filter((p) => p.status === 'riesgo').length;
  const mine = projects.filter((p) => p.ownerId === 'u-paula').length;

  const list = projects.filter((p) => (filter === 'mine' ? p.ownerId === 'u-paula' : filter === 'alert' ? !!p.alert : true));

  return (
    <div>
      <PageHeader kicker={t('kicker.equipo')} title={t('greet.hola', { name: 'Paula' })} subtitle={t('eq.proj.sub')} />
      <PreviewBanner bullets={[t('eq.proj.b1'), t('eq.proj.b2'), t('eq.proj.b3')]} />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard label={t('eq.proj.kActive')} value={projects.length} hint={t('eq.proj.kActiveHint', { n: mine })} onClick={() => setFilter('all')} />
        <KpiCard
          label={t('eq.proj.kOverdue')}
          value={<span className={overdue > 0 ? 'text-danger' : undefined}>{overdue}</span>}
          hint={t('eq.proj.kOverdueHint')}
          onClick={() => {
            setFilter('alert');
            useApp.getState().toast(t('eq.proj.overdueToast'), 'info');
          }}
        />
        <KpiCard
          label={t('eq.proj.kRisk')}
          value={<span className="text-warn">{late + risk}</span>}
          hint={t('eq.proj.kRiskHint', { late, risk })}
          onClick={() => setFilter('alert')}
        />
      </div>

      <div className="mb-4 flex">
        <Segmented<Filter>
          scroll
          value={filter}
          onChange={setFilter}
          className="max-w-full"
          options={[
            { value: 'all', label: t('eq.proj.fAll'), count: projects.length },
            { value: 'mine', label: t('eq.proj.fMine'), count: mine },
            { value: 'alert', label: t('eq.proj.fAlert'), count: projects.filter((p) => p.alert).length },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => {
          const brand = brandById(p.brandId);
          const owner = userById(p.ownerId);
          const pts = tasks.filter((x) => x.projectId === p.id);
          const done = pts.filter((x) => x.status === 'hecho').length;
          const pct = projectProgress(tasks, p.id);
          const tone = projectTone(p.status);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => navigate(`/equipo/proyectos/${p.id}`)}
              className={cn(
                'card group flex min-w-0 flex-col p-5 text-left transition hover:border-line-strong hover:shadow-md',
                p.status === 'atrasado' && 'border-danger/40 ring-1 ring-danger/20',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: brand.color }} />
                    <span className="truncate">{brand.name}</span>
                  </div>
                  <div className="text-base font-semibold leading-snug text-ink">{p.name}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{p.mall}</span>
                  </div>
                </div>
                <Badge tone={tone} className="shrink-0">
                  {e('projectStatus', p.status)}
                </Badge>
              </div>

              <div className="mt-5">
                <div className="mb-1.5 flex items-end justify-between">
                  <span className="kpi-label">{t('eq.proj.progress')}</span>
                  <span className="num text-2xl font-semibold leading-none text-ink">{pct}%</span>
                </div>
                <Progress value={pct} tone={p.status === 'tiempo' ? 'accent' : tone} />
                <div className="mt-2 flex items-center gap-1 text-xs text-ink2">
                  <CheckCircle2 size={13} className="text-ok" />
                  <span className="num">{t('eq.proj.tasks', { done, total: pts.length })}</span>
                </div>
              </div>

              {p.alert && (
                <div
                  className={cn(
                    'mt-4 flex items-start gap-2 rounded-ctl px-3 py-2 text-[13px] font-medium',
                    p.status === 'atrasado' ? 'bg-danger/10 text-danger' : 'bg-warn/10 text-warn',
                  )}
                >
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span>{b(p.alert)}</span>
                </div>
              )}

              <div className="min-h-[16px] flex-1" />
              <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar userId={owner.id} size={28} />
                  <span className="truncate text-[13px] text-ink2">{owner.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-xs text-muted" title={t('eq.proj.target')}>
                  <CalendarDays size={13} />
                  <span className="num">{fmtDate(p.targetDate, 'd MMM yyyy', lang)}</span>
                </div>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-accent">
                {t('eq.proj.openBoard')}
                <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
