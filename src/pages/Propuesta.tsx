import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  FileText,
  Gauge,
  KanbanSquare,
  LayoutDashboard,
  MessageCircle,
  Printer,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
  UserPlus,
  Users,
  Wrench,
  ClipboardCheck,
  FolderKanban,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '@/store';
import { tr, useT } from '@/i18n';
import { cn, WHATSAPP_URL } from '@/lib/utils';
import { fmtUSD } from '@/lib/format';
import type { Bi, Role } from '@/types';

interface Mod {
  n: number;
  key: string;
  icon: LucideIcon;
  bullets: number;
  view?: string;
  role?: Role;
}

const MODS: Mod[] = [
  { n: 0, key: 'm0', icon: Wrench, bullets: 3 },
  { n: 1, key: 'm1', icon: KanbanSquare, bullets: 4, view: '/admin/crm', role: 'admin' },
  { n: 2, key: 'm2', icon: Sparkles, bullets: 4, view: '/admin/propuestas/nueva?lead=L-001', role: 'admin' },
  { n: 3, key: 'm3', icon: LayoutDashboard, bullets: 4, view: '/admin/panel', role: 'admin' },
  { n: 4, key: 'm4', icon: Store, bullets: 4, view: '/franquiciante/panel', role: 'franquiciante' },
  { n: 5, key: 'm5', icon: ClipboardCheck, bullets: 4, view: '/franquiciado/apertura', role: 'franquiciado' },
  { n: 6, key: 'm6', icon: FolderKanban, bullets: 4, view: '/equipo/proyectos/pampa-eldorado', role: 'equipo' },
];

const CIRCUIT: { key: string; icon: LucideIcon; hl?: boolean }[] = [
  { key: 'c1', icon: UserPlus },
  { key: 'c2', icon: Gauge },
  { key: 'c3', icon: Sparkles, hl: true },
  { key: 'c4', icon: Rocket },
  { key: 'c5', icon: Users },
];

const TOTAL = 7500;

function SectionHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-ink sm:text-[22px]">{title}</h2>
        {sub && <p className="mt-1 text-sm text-ink2">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn('flex items-baseline gap-3 py-2.5 text-sm', strong && 'font-semibold')}>
      <span className={cn('min-w-0', strong ? 'text-ink' : 'text-ink2')}>{label}</span>
      <span className="mb-1 min-w-4 flex-1 border-b border-dotted border-line-strong" />
      <span className={cn('num shrink-0', strong ? 'text-ink' : 'text-ok')}>{value}</span>
    </div>
  );
}

function Investment() {
  const { t } = useT();
  const [open, setOpen] = useState(false); // nunca se persiste: cada carga arranca oculto
  const disc = TOTAL * 0.85;
  return (
    <section className="card overflow-hidden" data-tour="investment">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="kpi-label">{t('prop.invTotal')}</div>
          {!open && <div className="num mt-2 text-[32px] font-bold tracking-[0.2em] text-ink">••••••</div>}
          {open && <div className="mt-1 text-sm text-ink2">{t('prop.invOnce')}</div>}
        </div>
        <button onClick={() => setOpen(!open)} className={cn('w-full sm:w-auto', open ? 'btn-secondary' : 'btn-primary')} data-no-print aria-expanded={open}>
          {open ? <EyeOff size={17} /> : <Eye size={17} />}
          {open ? t('prop.invHide') : t('prop.invShow')}
        </button>
      </div>
      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="overflow-hidden">
          <div className="border-t border-line p-5 sm:p-6">
            <div className="num font-bold leading-none text-ink" style={{ fontSize: 'clamp(40px, 8vw, 56px)' }}>
              {fmtUSD(TOTAL)}
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <div className="kpi-label mb-1">{t('prop.invOnce')}</div>
                <Row label={t('prop.invL1')} value={t('prop.included')} />
                <Row label={t('prop.invL2')} value={t('prop.included')} />
                <Row label={t('prop.invL3')} value={t('prop.included')} />
                <div className="mt-1 border-t border-line" />
                <Row label={t('prop.invL4')} value={fmtUSD(TOTAL)} strong />
                <div className="mt-4 flex items-center gap-2 text-sm text-ink2">
                  <span className="kpi-label">{t('prop.term')}</span>
                  <span className="font-medium text-ink">{t('prop.termVal')}</span>
                </div>
              </div>
              <div>
                <div className="kpi-label mb-1">{t('prop.payTitle')}</div>
                <Row label={t('prop.pay1')} value={fmtUSD(TOTAL / 2)} strong />
                <Row label={t('prop.pay2')} value={fmtUSD(TOTAL / 2)} strong />
                <div className="mt-4 rounded-card border-2 border-accent bg-accent-soft/60 p-4">
                  <div className="text-sm font-semibold text-ink">{t('prop.discTitle')}</div>
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="num text-base text-muted line-through">{fmtUSD(TOTAL)}</span>
                    <span className="num text-[26px] font-bold text-accent">{fmtUSD(disc)}</span>
                    <span className="pill bg-ok/10 text-ok">{t('prop.discSave', { amount: fmtUSD(TOTAL - disc) })}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-start gap-2.5 rounded-ctl bg-subtle px-4 py-3 text-sm text-ink">
              <ShieldCheck size={18} className="mt-px shrink-0 text-ok" />
              {t('prop.guarantee')}
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}

export default function Propuesta() {
  const { t } = useT();
  const navigate = useNavigate();
  const destacado = useApp((s) => s.moduloDestacado);
  const refs = useRef<Record<number, HTMLDivElement | null>>({});
  const [glow, setGlow] = useState<number | null>(null);

  // Retorno desde "Ver en el demo": centrar y resaltar la tarjeta de origen ~4s
  useEffect(() => {
    if (destacado === null) return;
    const n = destacado;
    const t1 = setTimeout(() => {
      refs.current[n]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setGlow(n);
    }, 120);
    const t2 = setTimeout(() => setGlow(null), 4000);
    const t3 = setTimeout(() => useApp.getState().limpiarDestacado(), 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [destacado]);

  const openPreview = useCallback(
    (m: Mod) => {
      if (!m.view || !m.role) return;
      const s = useApp.getState();
      const titulo: Bi = [tr(`prop.${m.key}t`, 'es'), tr(`prop.${m.key}t`, 'en')];
      const needsRole = s.role !== m.role;
      s.abrirPreview(m.n, m.view, m.role, titulo);
      setTimeout(() => navigate(m.view!), needsRole ? 90 : 0);
    },
    [navigate],
  );

  return (
    <div className="mx-auto max-w-[1180px]">
      {/* 7.1 Encabezado */}
      <header className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-trailer="prop-header">
        <div className="min-w-0">
          <span className="pill border border-accent/25 bg-accent-soft text-accent">
            <FileText size={12} />
            {t('prop.badge')}
          </span>
          <h1 className="mt-4 text-[30px] font-bold leading-[1.1] tracking-tight text-ink sm:text-[40px]">{t('prop.title')}</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink2 sm:text-base">{t('prop.sub')}</p>
          <p className="mt-2 text-xs text-muted">{t('prop.forLine')}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto" data-no-print>
          <button className="btn-secondary w-full sm:w-auto" onClick={() => window.print()}>
            <Printer size={16} />
            {t('prop.print')}
          </button>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="btn-primary w-full sm:w-auto">
            <MessageCircle size={16} />
            {t('prop.whatsapp')}
          </a>
        </div>
      </header>

      {/* 7.2 El circuito */}
      <section className="mb-12" data-trailer="circuito">
        <SectionHead title={t('prop.circuitTitle')} sub={t('prop.circuitSub')} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CIRCUIT.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={c.key} className={cn('relative rounded-card border p-4', c.hl ? 'border-accent bg-accent-soft shadow-md' : 'border-line bg-card shadow-sm', i === 4 && 'sm:col-span-2 lg:col-span-1')}>
                <div className="flex items-center justify-between">
                  <span className={cn('text-[10.5px] font-bold uppercase tracking-[0.14em]', c.hl ? 'text-accent' : 'text-muted')}>{t('prop.step', { n: i + 1 })}</span>
                  <span className={cn('flex h-8 w-8 items-center justify-center rounded-full', c.hl ? 'bg-accent text-white dark:text-[#071a2e]' : 'bg-subtle text-ink2')}>
                    <Icon size={16} />
                  </span>
                </div>
                <div className="mt-3 text-[15px] font-semibold leading-snug text-ink">{t(`prop.${c.key}t`)}</div>
                <div className="mt-1 text-[13px] leading-relaxed text-ink2">{t(`prop.${c.key}d`)}</div>
                {c.hl && <span className="pill mt-3 bg-accent text-white dark:text-[#071a2e]">{t('prop.c3tag')}</span>}
              </div>
            );
          })}
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm text-muted">
          <RefreshCw size={14} className="shrink-0" />
          {t('prop.loop')}
        </p>
      </section>

      {/* 7.3 Módulos */}
      <section className="mb-12" data-trailer="modulos">
        <SectionHead
          title={t('prop.modsTitle')}
          sub={t('prop.modsSub')}
          right={<span className="pill shrink-0 border border-line bg-subtle text-ink"><span className="num">{t('prop.modsCount')}</span></span>}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODS.map((m) => {
            const Icon = m.icon;
            const hl = glow === m.n;
            return (
              <div
                key={m.n}
                ref={(el) => {
                  refs.current[m.n] = el;
                }}
                className={cn(
                  'flex flex-col rounded-card border bg-card p-5 shadow-sm transition-all duration-500',
                  hl ? '-translate-y-1 border-accent shadow-md ring-4 ring-accent/20' : 'border-line',
                  m.n === 0 && 'bg-subtle',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="num text-[13px] text-muted">{String(m.n).padStart(2, '0')}</span>
                  {m.n === 0 ? (
                    <span className="pill bg-accent-soft text-accent">{t('prop.firstStep')}</span>
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Icon size={17} />
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink">{t(`prop.${m.key}t`)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink2">{t(`prop.${m.key}d`)}</p>
                <ul className="mt-4 space-y-2">
                  {Array.from({ length: m.bullets }, (_, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-ink">
                      <Check size={15} strokeWidth={2.6} className="mt-px shrink-0 text-accent" />
                      {t(`prop.${m.key}b${i + 1}`)}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-5">
                  {m.view && (
                    <button onClick={() => openPreview(m)} className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-accent hover:underline" data-no-print data-tour={`see-demo-${m.n}`}>
                      {t('prop.seeDemo')}
                      <ArrowUpRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7.4 Inversión */}
      <section className="mb-12">
        <SectionHead title={t('prop.invTitle')} />
        <Investment />
      </section>

      {/* Cierre */}
      <section className="rounded-panel bg-[var(--hero)] px-6 py-10 text-center text-white sm:px-10" data-no-print>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('prop.closeTitle')}</h2>
        <p className="mx-auto mt-2 max-w-md text-white/70">{t('prop.closeSub')}</p>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="btn mt-6 bg-white text-[#071a2e] hover:bg-white/90">
          <MessageCircle size={16} />
          {t('prop.whatsapp')}
        </a>
        <div className="mt-5 text-[10px] uppercase tracking-[0.14em] text-white/50">Powered by Insights</div>
      </section>
    </div>
  );
}
