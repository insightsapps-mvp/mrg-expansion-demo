import * as DM from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown, LogOut, Moon, Sparkles, Sun, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/store';
import { useT } from '@/i18n';
import { cn, WHATSAPP_URL } from '@/lib/utils';
import { ROLES } from '@/config/nav';
import { roleColor, roleUser, userById } from '@/data/users';
import { Avatar } from '@/components/ui';
import { useNavActions } from './useNavActions';

export function LangToggle({ className }: { className?: string }) {
  const lang = useApp((s) => s.lang);
  const setLang = useApp((s) => s.setLang);
  return (
    <div className={cn('flex items-center rounded-full border border-line bg-subtle p-0.5 text-[11px] font-semibold', className)} role="group" aria-label="Idioma / Language">
      {(['es', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn('min-h-[32px] min-w-[34px] rounded-full px-2 uppercase transition', lang === l ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink')}
          aria-pressed={lang === l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle() {
  const theme = useApp((s) => s.theme);
  const toggle = useApp((s) => s.toggleTheme);
  const { t } = useT();
  return (
    <button className="icon-btn" onClick={toggle} aria-label={t('top.theme')} title={t('top.theme')}>
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export function TourButton({ compact }: { compact?: boolean }) {
  const start = useApp((s) => s.startTour);
  const trailer = useApp((s) => s.trailer);
  const { t } = useT();
  return (
    <button
      data-tour="tour-btn"
      onClick={() => !trailer && start()}
      className={cn(
        'inline-flex min-h-[44px] items-center gap-1.5 rounded-full text-[13px] font-semibold text-accent transition hover:bg-accent-soft',
        compact ? 'min-w-[44px] justify-center px-2' : 'px-3',
      )}
    >
      <Sparkles size={16} />
      <span className={compact ? 'sr-only sm:not-sr-only' : ''}>{t('top.tour')}</span>
    </button>
  );
}

export function WhatsAppButton({ className, label }: { className?: string; label?: string }) {
  const { t } = useT();
  return (
    <a href={WHATSAPP_URL} target="_blank" rel="noopener" data-tour="whatsapp-cta" className={cn('btn-primary', className)}>
      <MessageCircle size={16} />
      {label ?? t('top.cta')}
    </a>
  );
}

export function RoleSwitcherDropdown() {
  const role = useApp((s) => s.role);
  const { t, e } = useT();
  const { switchRole } = useNavActions();
  return (
    <DM.Root>
      <DM.Trigger asChild>
        <button data-tour="switch-user" className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-card px-3 text-[13px] text-ink2 transition hover:border-line-strong">
          <span className="hidden 2xl:inline">{t('top.viewAs')}:</span>
          <span className="h-2 w-2 rounded-full" style={{ background: roleColor[role] }} />
          <span className="font-semibold text-ink">{e('role', role)}</span>
          <ChevronDown size={14} />
        </button>
      </DM.Trigger>
      <DM.Portal>
        <DM.Content sideOffset={8} align="end" className="z-[90] w-64 rounded-card border border-line bg-card p-1.5 shadow-md">
          <div className="px-2.5 pb-1.5 pt-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">{t('top.changeView')}</div>
          {ROLES.map((r) => {
            const u = userById(roleUser[r]);
            return (
              <DM.Item
                key={r}
                onSelect={() => r !== role && switchRole(r)}
                className={cn('flex min-h-[48px] cursor-pointer items-center gap-3 rounded-[10px] px-2.5 outline-none hover:bg-subtle focus:bg-subtle', r === role && 'bg-accent-soft')}
              >
                <Avatar userId={u.id} size={30} />
                <div className="min-w-0 flex-1">
                  <div className={cn('text-sm font-semibold', r === role ? 'text-accent' : 'text-ink')}>{e('role', r)}</div>
                  <div className="truncate text-xs text-muted">{u.name}</div>
                </div>
                {r === role && <Check size={16} className="text-accent" />}
              </DM.Item>
            );
          })}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

export function RoleGrid({ onDone }: { onDone?: () => void }) {
  const role = useApp((s) => s.role);
  const { e } = useT();
  const { switchRole } = useNavActions();
  return (
    <div className="grid grid-cols-2 gap-2" data-tour="switch-user-mobile">
      {ROLES.map((r) => {
        const u = userById(roleUser[r]);
        return (
          <button
            key={r}
            onClick={() => {
              if (r !== role) switchRole(r);
              onDone?.();
            }}
            className={cn('flex min-h-[64px] items-center gap-2.5 rounded-card border px-3 text-left transition', r === role ? 'border-accent bg-accent-soft' : 'border-line bg-card hover:border-line-strong')}
          >
            <Avatar userId={u.id} size={30} />
            <div className="min-w-0">
              <div className={cn('text-[13px] font-semibold leading-tight', r === role ? 'text-accent' : 'text-ink')}>{e('role', r)}</div>
              <div className="truncate text-[11px] text-muted">{u.name.split(' ')[0]}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function UserMenu() {
  const role = useApp((s) => s.role);
  const logout = useApp((s) => s.logout);
  const navigate = useNavigate();
  const { t, b, e } = useT();
  const u = userById(roleUser[role]);
  return (
    <DM.Root>
      <DM.Trigger asChild>
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-subtle" aria-label={u.name}>
          <Avatar userId={u.id} size={32} />
        </button>
      </DM.Trigger>
      <DM.Portal>
        <DM.Content sideOffset={8} align="end" className="z-[90] w-64 rounded-card border border-line bg-card p-1.5 shadow-md">
          <div className="flex items-center gap-3 px-2.5 py-2">
            <Avatar userId={u.id} size={36} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-ink">{u.name}</div>
              <div className="truncate text-xs text-muted">{e('role', role)} · {b(u.title)}</div>
            </div>
          </div>
          <DM.Separator className="my-1 h-px bg-line" />
          <DM.Item
            onSelect={() => {
              logout();
              navigate('/login');
            }}
            className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[10px] px-2.5 text-sm text-ink outline-none hover:bg-subtle focus:bg-subtle"
          >
            <LogOut size={16} /> {t('top.logout')}
          </DM.Item>
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

export function CtaBlock({ compact, dataTour }: { compact?: boolean; dataTour?: string }) {
  const { t } = useT();
  return (
    <div className={cn('rounded-panel border border-line bg-subtle text-center', compact ? 'p-4' : 'p-6 sm:p-8')} data-no-print data-tour={dataTour}>
      <span className="pill border border-accent/30 bg-accent-soft text-accent">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        {t('cta.demo')}
      </span>
      <p className={cn('mx-auto mt-3 max-w-md font-semibold text-ink', compact ? 'text-[15px]' : 'text-lg')}>{t('cta.title')}</p>
      <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="btn-primary mt-4">
        <MessageCircle size={16} />
        {t('cta.button')}
      </a>
      <div className="mt-4 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">{t('cta.powered')}</div>
    </div>
  );
}
