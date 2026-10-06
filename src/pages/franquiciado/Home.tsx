import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis } from 'recharts';
import {
  ArrowRight,
  CalendarClock,
  ChevronRight,
  FileText,
  FileUp,
  HardHat,
  Lock,
  MessagesSquare,
  Users,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { useApp, checklistProgress } from '@/store';
import { useT } from '@/i18n';
import { fmtAgo, fmtDate } from '@/lib/format';
import { documents } from '@/data/franchisee';
import { Badge, PageHeader, PreviewBanner, Progress, axisProps } from '@/components/ui';
import { FDO_COLOR, FDO_FIRST, daysToOpening, openingDate } from './_components/fdo';

interface Notice {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string;
  daysAgo: number;
  to: string;
}

export default function FranchiseeHome() {
  const { t, b, lang } = useT();
  const navigate = useNavigate();
  const checklist = useApp((s) => s.checklist);
  const messages = useApp((s) => s.messages);

  const pct = checklistProgress(checklist);
  const all = checklist.flatMap((s) => s.items);
  const done = all.filter((i) => i.done).length;
  const open = useMemo(openingDate, []);
  const days = daysToOpening();

  const next = useMemo(() => {
    for (const st of checklist) {
      const it = st.items.find((i) => !i.done);
      if (it) return { stage: st, item: it };
    }
    return null;
  }, [checklist]);

  // Gráfico de ejemplo (ilustrativo, sin valores): 6 meses desde la inauguración
  const sample = useMemo(() => {
    const shape = [52, 61, 66, 63, 72, 80];
    return shape.map((v, i) => {
      const d = new Date(open);
      d.setMonth(d.getMonth() + i, 1);
      return { m: fmtDate(d, 'MMM', lang), v };
    });
  }, [open, lang]);

  const notices: Notice[] = [
    { id: 'n1', icon: HardHat, title: t('fdo.notice.n1.title'), body: t('fdo.notice.n1.body'), daysAgo: 2, to: '/franquiciado/consultas' },
    { id: 'n2', icon: Users, title: t('fdo.notice.n2.title'), body: t('fdo.notice.n2.body'), daysAgo: 1, to: '/franquiciado/consultas' },
    { id: 'n3', icon: BookOpen, title: t('fdo.notice.n3.title'), body: t('fdo.notice.n3.body'), daysAgo: 4, to: '/franquiciado/documentos' },
  ];

  const unread = messages.filter((m) => m.from === 'them' && m.daysAgo <= 2).length;
  const quick = [
    { to: '/franquiciado/documentos', icon: FileText, label: t('nav.documentos'), desc: t('fdo.home.qDocs', { n: documents.length }) },
    { to: '/franquiciado/consultas', icon: MessagesSquare, label: t('nav.consultas'), desc: t('fdo.home.qMsgs', { n: unread }) },
    { to: '/franquiciado/carga', icon: FileUp, label: t('nav.carga'), desc: t('fdo.home.qReport') },
  ];

  return (
    <div>
      <PageHeader
        kicker={t('kicker.franquiciado')}
        title={t('greet.ola', { name: FDO_FIRST })}
        subtitle={t('fdo.home.subtitle')}
        actions={
          <Link to="/franquiciado/apertura" className="btn-secondary">
            {t('fdo.home.goOpening')}
            <ArrowRight size={16} />
          </Link>
        }
      />
      <PreviewBanner bullets={[t('fdo.home.b1'), t('fdo.home.b2'), t('fdo.home.b3')]} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Hero: progreso de apertura */}
        <button
          type="button"
          onClick={() => navigate('/franquiciado/apertura')}
          className="card relative overflow-hidden p-5 text-left transition hover:border-line-strong hover:shadow-md sm:p-6 lg:col-span-2"
        >
          <span className="absolute inset-y-0 left-0 w-1" style={{ background: FDO_COLOR }} aria-hidden />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="kpi-label">{t('fdo.home.progressTitle')}</div>
            <Badge tone="ok">{t('fdo.home.statusOpening')}</Badge>
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
            <div className="font-mono text-[56px] font-bold leading-none tracking-tight text-ink sm:text-[72px]">
              {pct}
              <span className="text-[0.5em] text-muted">%</span>
            </div>
            <div className="pb-2 text-sm text-ink2">{t('fdo.home.itemsDone', { done, total: all.length })}</div>
          </div>
          <Progress value={pct} tone="ok" className="mt-5 h-3" />
          <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5 text-sm text-ink">
              <CalendarClock size={18} className="shrink-0 text-ok" />
              <span>
                {t('fdo.home.opening')} <b className="font-semibold">{fmtDate(open, lang === 'es' ? "d 'de' MMMM yyyy" : 'MMMM d, yyyy', lang)}</b>
              </span>
            </div>
            <span className="pill self-start bg-subtle text-ink2 sm:self-auto">
              <span className="num text-ink">{days}</span> {t('fdo.home.daysLeft')}
            </span>
          </div>
        </button>

        {/* Próximo hito */}
        <div className="card flex flex-col p-5 sm:p-6">
          <div className="kpi-label">{t('fdo.home.nextMilestone')}</div>
          {next ? (
            <>
              <div className="mt-4 text-xs font-medium text-muted">{t('fdo.home.stage', { stage: b(next.stage.label) })}</div>
              <div className="mt-1 text-lg font-semibold leading-snug text-ink">{b(next.item.label)}</div>
              <div className="mt-3 text-sm text-ink2">
                {t('fdo.home.stageItems', {
                  done: next.stage.items.filter((i) => i.done).length,
                  total: next.stage.items.length,
                })}
              </div>
            </>
          ) : (
            <div className="mt-4 text-lg font-semibold text-ok">{t('fdo.home.allDone')}</div>
          )}
          <div className="mt-auto pt-5">
            <Link to="/franquiciado/apertura" className="btn-primary w-full">
              {t('fdo.home.goOpening')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Ventas del mes (bloqueado hasta la inauguración) */}
        <div className="card p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="section-title text-base">{t('fdo.home.salesTitle')}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                <Lock size={12} />
                {t('fdo.home.salesLocked')}
              </div>
            </div>
            <Link to="/franquiciado/carga" className="btn-secondary btn-sm min-h-[44px]">
              {t('fdo.home.goReport')}
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="relative mt-4 h-[200px] w-full min-w-0 sm:h-[220px]">
            <div className="absolute inset-0 opacity-40 grayscale-[30%]" aria-hidden>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sample} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fdoSample" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="m" {...axisProps} />
                  <Area type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={2} fill="url(#fdoSample)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <span className="pill absolute left-2 top-1 border border-line bg-card text-muted">{t('fdo.home.example')}</span>
            <div className="absolute inset-x-4 bottom-10 mx-auto max-w-md rounded-card border border-line bg-card/90 px-4 py-3 text-center text-[13px] text-ink2 shadow-sm backdrop-blur-sm">
              {t('fdo.home.salesLockedDesc')}
            </div>
          </div>
        </div>

        {/* Avisos de MRG */}
        <div className="card p-5 sm:p-6">
          <div className="section-title mb-3 text-base">{t('fdo.home.notices')}</div>
          <ul className="-mx-2 flex flex-col">
            {notices.map((n) => {
              const Icon = n.icon;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => navigate(n.to)}
                    className="flex min-h-[44px] w-full items-start gap-3 rounded-ctl px-2 py-2.5 text-left transition hover:bg-subtle"
                  >
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">{n.title}</span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-ink2">{n.body}</span>
                      <span className="mt-1 block text-[11px] text-muted">{fmtAgo(n.daysAgo, lang)}</span>
                    </span>
                    <ChevronRight size={16} className="mt-2 shrink-0 text-muted" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="mt-8">
        <div className="section-title mb-3">{t('fdo.home.quick')}</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quick.map((q) => {
            const Icon = q.icon;
            return (
              <Link key={q.to} to={q.to} className="card flex min-h-[72px] items-center gap-3 p-4 transition hover:border-line-strong hover:shadow-md">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-ctl bg-subtle text-ink">
                  <Icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">{q.label}</span>
                  <span className="block truncate text-xs text-muted">{q.desc}</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-muted" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
