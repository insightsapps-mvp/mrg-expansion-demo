import { useEffect, useRef, useState, type ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown, ChevronUp, Info, Wrench, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n';
import { useApp } from '@/store';
import { userById } from '@/data/users';
import { roleColor } from '@/data/users';
import type { Role } from '@/types';

export { Modal, Sheet, SidePanel } from './Modal';

/* ---------- Encabezado de página con kicker de rol ---------- */
export function PageHeader({
  kicker,
  title,
  subtitle,
  actions,
  role,
}: {
  kicker?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  role?: Role;
}) {
  const current = useApp((s) => s.role);
  const color = roleColor[role ?? current];
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {kicker && (
          <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            {kicker}
          </div>
        )}
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-ink sm:text-[30px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-ink2">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- KPI ---------- */
export function KpiCard({ label, value, delta, deltaDir, hint, onClick, dataTour }: { label: string; value: ReactNode; delta?: string; deltaDir?: 'up' | 'down'; hint?: string; onClick?: () => void; dataTour?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-tour={dataTour}
      className={cn('card flex min-h-[112px] flex-col justify-between p-4 text-left transition', onClick && 'hover:border-line-strong hover:shadow-md')}
    >
      <div className="kpi-label">{label}</div>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div className="kpi-value">{value}</div>
        {delta && (
          <span
            className={cn(
              'pill mb-1',
              deltaDir === 'down' ? 'bg-danger/10 text-danger' : 'bg-ok/10 text-ok',
            )}
          >
            {deltaDir === 'down' ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
            {delta}
          </span>
        )}
      </div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </button>
  );
}

/* ---------- Score badge ---------- */
export function ScoreBadge({ score, size = 'sm' }: { score: number; size?: 'sm' | 'lg' }) {
  const cls =
    score >= 90
      ? 'bg-accent-strong text-white ring-2 ring-accent/40 ring-offset-1 ring-offset-card dark:text-[#071a2e]'
      : score >= 75
        ? 'bg-accent text-white dark:text-[#071a2e]'
        : score >= 50
          ? 'bg-warn/15 text-warn'
          : 'bg-subtle text-muted border border-line';
  return (
    <span
      className={cn(
        'num inline-flex items-center justify-center rounded-full',
        size === 'lg' ? 'h-16 min-w-16 px-3 text-[28px] font-bold' : 'h-6 min-w-[34px] px-2 text-[12px]',
        cls,
      )}
    >
      {score}
    </span>
  );
}

/* ---------- Avatar ---------- */
export function Avatar({ userId, name, size = 28, color }: { userId?: string; name?: string; size?: number; color?: string }) {
  const u = userId ? userById(userId) : undefined;
  const label = u?.initials ?? (name ?? '?').split(' ').map((p) => p[0]).slice(0, 2).join('');
  const bg = color ?? (u ? roleColor[u.role] : '#64748b');
  return (
    <span
      title={u?.name ?? name}
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
    >
      {label}
    </span>
  );
}

/* ---------- Badge genérico ---------- */
export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'ok' | 'warn' | 'danger' | 'violet'; className?: string }) {
  const tones = {
    neutral: 'bg-subtle text-ink2 border border-line',
    accent: 'bg-accent-soft text-accent',
    ok: 'bg-ok/10 text-ok',
    warn: 'bg-warn/10 text-warn',
    danger: 'bg-danger/10 text-danger',
    violet: 'bg-[#7c3aed]/10 text-[#7c3aed]',
  };
  return <span className={cn('pill', tones[tone], className)}>{children}</span>;
}

/* ---------- Progress ---------- */
export function Progress({ value, className, tone = 'accent' }: { value: number; className?: string; tone?: 'accent' | 'ok' | 'warn' | 'danger' }) {
  const bg = { accent: 'bg-accent', ok: 'bg-ok', warn: 'bg-warn', danger: 'bg-danger' }[tone];
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-subtle', className)}>
      <div className={cn('h-full rounded-full transition-[width] duration-700 ease-out', bg)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

/* ---------- Segmentado / tabs ---------- */
export function Segmented<T extends string>({ value, onChange, options, className, scroll }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode; count?: number }[]; className?: string; scroll?: boolean }) {
  return (
    <div className={cn('flex gap-1 rounded-full border border-line bg-subtle p-1', scroll && 'no-scrollbar overflow-x-auto', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex min-h-[36px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium transition',
            value === o.value ? 'bg-card text-ink shadow-sm' : 'text-ink2 hover:text-ink',
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="num text-[11px] text-muted">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- Preview banner ---------- */
export function PreviewBanner({ bullets }: { bullets: [string, string, string] }) {
  const { t } = useT();
  const key = 'mrg_banner_collapsed_' + location.pathname.split('/').slice(0, 3).join('_');
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return sessionStorage.getItem(key) === '1';
    } catch {
      return false;
    }
  });
  const toggle = () => {
    const v = !collapsed;
    setCollapsed(v);
    try {
      sessionStorage.setItem(key, v ? '1' : '0');
    } catch {
      /* noop */
    }
  };
  return (
    <div className="no-print mb-6 rounded-card border border-dashed border-line-strong bg-subtle/70 px-4 py-3" data-tour="preview-banner">
      <div className="flex flex-wrap items-center gap-2">
        <span className="pill bg-accent-soft text-accent">{t('banner.preview')}</span>
        <span className="pill border border-line bg-card text-ink2">{t('banner.mock')}</span>
        <span className="text-[13px] font-semibold text-ink">{t('banner.title')}</span>
        <button onClick={toggle} className="ml-auto inline-flex min-h-[36px] items-center gap-1 rounded-full px-2 text-xs font-medium text-muted hover:text-ink" aria-expanded={!collapsed}>
          {collapsed ? t('banner.show') : t('banner.hide')}
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
      {!collapsed && (
        <ul className="mt-2.5 grid gap-x-6 gap-y-1.5 text-[13px] text-ink2 md:grid-cols-3">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- DevNotice ---------- */
export function DevNotice({ feature, now, later, className }: { feature: string; now: string; later: string; className?: string }) {
  const { t } = useT();
  return (
    <div className={cn('no-print mb-4 flex gap-3 rounded-card border border-warn/30 bg-warn/[0.07] px-4 py-3 text-[13px]', className)}>
      <Wrench size={16} className="mt-0.5 shrink-0 text-warn" />
      <div className="min-w-0">
        <div className="font-semibold text-warn">
          {feature} · {t('dev.inDev')}
        </div>
        <div className="mt-0.5 text-ink2">
          <b className="font-medium text-ink">{t('dev.now')}</b> {now} <b className="ml-1 font-medium text-ink">{t('dev.later')}</b> {later}
        </div>
      </div>
    </div>
  );
}

/* ---------- ⓘ En desarrollo ---------- */
export function InfoDev({ text, label }: { text: string; label?: string }) {
  const { t } = useT();
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-full px-2 text-xs font-medium text-muted hover:bg-subtle hover:text-ink">
          <Info size={15} />
          {label ?? t('dev.badge')}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={6} className="z-[90] max-w-[min(280px,calc(100vw-32px))] rounded-ctl border border-line bg-card px-3 py-2 text-[13px] text-ink2 shadow-md">
          {text}
          <Popover.Arrow className="fill-[var(--card)]" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/* ---------- Contenedor de gráfico con alto explícito ---------- */
export function ChartCard({ title, subtitle, children, height = 260, actions, className, dataTrailer }: { title: string; subtitle?: string; children: ReactNode; height?: number; actions?: ReactNode; className?: string; dataTrailer?: string }) {
  return (
    <div className={cn('card p-4 sm:p-5', className)} data-trailer={dataTrailer}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="section-title text-base">{title}</div>
          {subtitle && <div className="text-xs text-muted">{subtitle}</div>}
        </div>
        {actions}
      </div>
      <div style={{ height }} className="w-full min-w-0">
        {children}
      </div>
    </div>
  );
}

/* ---------- Estado vacío ---------- */
export function Empty({ text }: { text: string }) {
  return <div className="rounded-card border border-dashed border-line px-4 py-8 text-center text-sm text-muted">{text}</div>;
}

/* ---------- Barra fija inferior (mobile) que registra su alto en --fixed-bottom-stack ---------- */
export function FixedBottomBar({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const visible = getComputedStyle(el).display !== 'none';
      document.documentElement.style.setProperty('--view-bar-h', visible ? `${el.offsetHeight}px` : '0px');
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
      document.documentElement.style.setProperty('--view-bar-h', '0px');
    };
  }, []);
  return (
    <>
      <div className="h-20 lg:hidden" aria-hidden />
      <div
        ref={ref}
        data-no-print
        className={cn(
          'fixed inset-x-0 z-40 flex gap-2 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur lg:hidden',
          className,
        )}
        style={{ bottom: 'var(--bottom-nav-h, 0px)' }}
      >
        {children}
      </div>
    </>
  );
}

/* ---------- Menú "Mover a…" (sin hover) ---------- */
export function MoveMenu<T extends string>({ options, onSelect, label, current }: { options: { value: T; label: string }[]; onSelect: (v: T) => void; label: string; current?: T }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" onClick={(e) => e.stopPropagation()} className="btn-secondary btn-sm min-h-[44px]">
          {label}
          <ChevronDown size={14} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={6} align="end" className="z-[90] w-56 rounded-ctl border border-line bg-card p-1 shadow-md" onClick={(e) => e.stopPropagation()}>
          {options.map((o) => (
            <button
              key={o.value}
              disabled={o.value === current}
              onClick={() => {
                onSelect(o.value);
                setOpen(false);
              }}
              className="flex min-h-[44px] w-full items-center rounded-[8px] px-3 text-left text-sm text-ink hover:bg-subtle disabled:opacity-40"
            >
              {o.label}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/* ---------- Tooltip Recharts limpio ---------- */
export const chartTooltipStyle = {
  contentStyle: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    boxShadow: 'var(--shadow-md)',
    fontSize: 12,
    color: 'var(--text)',
  },
  labelStyle: { color: 'var(--text-2)', fontWeight: 600 },
  itemStyle: { color: 'var(--text)' },
  cursor: { fill: 'var(--bg-subtle)' },
};
export const axisProps = {
  tick: { fill: 'var(--muted)', fontSize: 11 },
  axisLine: false,
  tickLine: false,
};
