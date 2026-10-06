import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import * as DM from '@radix-ui/react-dropdown-menu';
import { ArrowLeft, ChevronDown, Menu, MoreHorizontal } from 'lucide-react';
import { useApp } from '@/store';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils';
import { BOTTOM, NAV, ROLE_HOME, ROLE_PREFIX, type NavItem } from '@/config/nav';
import { roleColor } from '@/data/users';
import { LogoFull } from '@/components/Brand';
import { Sheet } from '@/components/ui';
import { CtaBlock, LangToggle, RoleGrid, RoleSwitcherDropdown, ThemeToggle, TourButton, UserMenu, WhatsAppButton } from './Controls';
import { useNavActions } from './useNavActions';
import { Toasts } from './Toasts';
import { WelcomeModal } from '@/features/WelcomeModal';
import { Tour } from '@/features/tour/Tour';
import { AIAssistant } from '@/features/ai/AIAssistant';

const isActive = (item: NavItem, path: string) =>
  item.id === 'propuesta' ? path === '/propuesta' : path === item.path || path.startsWith(item.path + '/');

/* ---------------- Barra superior desktop ---------------- */
function TopBar() {
  const role = useApp((s) => s.role);
  const { pathname } = useLocation();
  const { t } = useT();
  const { goMenu } = useNavActions();
  const items = NAV[role];
  // visibles por breakpoint: lg → 4 · xl → 6 · 2xl → todos
  const vis = (i: number) => (i < 4 ? 'flex' : i < 6 ? 'hidden xl:flex' : 'hidden 2xl:flex');
  const overflowLg = items.slice(4);
  return (
    <header data-tour="top-nav" className="sticky top-0 z-50 hidden h-16 border-b border-line bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] backdrop-blur-md lg:block">
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-3 px-5">
        <button onClick={() => goMenu('/propuesta')} className="flex shrink-0 items-center gap-3" aria-label="MRG">
          <LogoFull className="h-[30px]" />
        </button>
        <span className="h-6 w-px shrink-0 bg-line" />
        <span className="hidden shrink-0 text-[10.5px] font-bold uppercase tracking-[0.14em] xl:block" style={{ color: roleColor[role] }}>
          {t('kicker.' + role).split(' · ')[0]}
        </span>
        <nav className="mx-auto flex min-w-0 items-center gap-1">
          {items.map((it, i) => {
            const active = isActive(it, pathname);
            const Icon = it.icon;
            return (
              <button
                key={it.id}
                data-tour={`nav-${it.id}`}
                onClick={() => goMenu(it.path)}
                className={cn(
                  vis(i),
                  'relative min-h-[40px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[13px] font-medium transition',
                  active ? 'bg-accent-soft text-accent' : 'text-ink2 hover:bg-subtle hover:text-ink',
                  it.id === 'propuesta' && !active && 'border border-line-strong text-ink',
                )}
              >
                <Icon size={15} />
                {t(it.label)}
                {it.id === 'propuesta' && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
              </button>
            );
          })}
          {overflowLg.length > 0 && (
            <DM.Root>
              <DM.Trigger asChild>
                <button data-tour="nav-more" className={cn('min-h-[40px] items-center gap-1 rounded-full px-3 text-[13px] font-medium text-ink2 hover:bg-subtle', items.length > 6 ? 'flex 2xl:hidden' : 'flex xl:hidden')}>
                  {t('nav.more')} <ChevronDown size={14} />
                </button>
              </DM.Trigger>
              <DM.Portal>
                <DM.Content sideOffset={8} className="z-[90] w-56 rounded-card border border-line bg-card p-1.5 shadow-md">
                  {overflowLg.map((it, j) => {
                    const Icon = it.icon;
                    return (
                      <DM.Item
                        key={it.id}
                        onSelect={() => goMenu(it.path)}
                        className={cn('min-h-[44px] cursor-pointer items-center gap-2 rounded-[10px] px-2.5 text-sm text-ink outline-none hover:bg-subtle focus:bg-subtle', j + 4 < 6 ? 'flex xl:hidden' : 'flex')}
                      >
                        <Icon size={16} className="text-muted" />
                        {t(it.label)}
                      </DM.Item>
                    );
                  })}
                </DM.Content>
              </DM.Portal>
            </DM.Root>
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-1">
          <TourButton />
          <LangToggle />
          <ThemeToggle />
          <RoleSwitcherDropdown />
          <WhatsAppButton className="ml-1 hidden px-4 xl:inline-flex" />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

/* ---------------- Topbar mobile ---------------- */
function MobileTopBar({ onMenu }: { onMenu: () => void }) {
  const { t } = useT();
  const { goMenu } = useNavActions();
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-1 border-b border-line bg-[color-mix(in_srgb,var(--bg)_90%,transparent)] px-2 backdrop-blur-md lg:hidden">
      <button className="icon-btn" onClick={onMenu} data-tour="mobile-menu" aria-label={t('nav.menu')}>
        <Menu size={20} />
      </button>
      <button onClick={() => goMenu('/propuesta')} className="flex min-w-0 items-center" aria-label="MRG">
        <LogoFull className="h-[24px]" />
      </button>
      <div className="ml-auto flex items-center">
        <TourButton compact />
        <LangToggle className="hidden xs:flex" />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}

/* ---------------- Bottom nav mobile ---------------- */
function BottomNav({ onMore }: { onMore: () => void }) {
  const role = useApp((s) => s.role);
  const { pathname } = useLocation();
  const { t } = useT();
  const { goMenu } = useNavActions();
  const ref = useRef<HTMLElement>(null);
  const items = BOTTOM[role].map((id) => NAV[role].find((n) => n.id === id)!);
  const inMore = !items.some((it) => isActive(it, pathname));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const visible = getComputedStyle(el).display !== 'none';
      document.documentElement.style.setProperty('--bottom-nav-h', visible ? `${el.offsetHeight}px` : '0px');
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <nav ref={ref} data-tour="bottom-nav" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <div className="grid grid-cols-5">
        {items.map((it) => {
          const active = isActive(it, pathname);
          const Icon = it.icon;
          return (
            <button key={it.id} data-tour={`tab-${it.id}`} onClick={() => goMenu(it.path)} className={cn('relative flex min-h-[58px] flex-col items-center justify-center gap-0.5 px-1 text-[10.5px] font-medium', active ? 'text-accent' : 'text-muted')}>
              {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-accent" />}
              <Icon size={20} />
              <span className="max-w-full truncate">{t(it.id === 'carga' ? 'nav.cargaShort' : it.label)}</span>
              {it.id === 'propuesta' && <span className="absolute right-[calc(50%-16px)] top-2.5 h-1.5 w-1.5 rounded-full bg-accent" />}
            </button>
          );
        })}
        <button data-tour="tab-mas" onClick={onMore} className={cn('flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium', inMore ? 'text-accent' : 'text-muted')}>
          <MoreHorizontal size={20} />
          {t('nav.more')}
        </button>
      </div>
    </nav>
  );
}

/* ---------------- Sheet "Más" ---------------- */
export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const role = useApp((s) => s.role);
  const { pathname } = useLocation();
  const { t } = useT();
  const { goMenu } = useNavActions();
  const items = NAV[role];
  const groups: { key: 'comercial' | 'operacion'; label: string }[] = [
    { key: 'comercial', label: t('nav.groupComercial') },
    { key: 'operacion', label: t('nav.groupOperacion') },
  ];
  return (
    <Sheet open={open} onClose={onClose} title={t('nav.menu')}>
      <div data-tour="more-sheet" className="space-y-5">
        {groups.map((g) => (
          <div key={g.key}>
            <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">{g.label}</div>
            <div className="grid gap-1">
              {items
                .filter((i) => i.group === g.key)
                .map((it) => {
                  const Icon = it.icon;
                  const active = isActive(it, pathname);
                  return (
                    <button
                      key={it.id}
                      data-tour={`sheet-${it.id}`}
                      onClick={() => {
                        goMenu(it.path);
                        onClose();
                      }}
                      className={cn('flex min-h-[48px] items-center gap-3 rounded-ctl px-3 text-left text-[15px] font-medium', active ? 'bg-accent-soft text-accent' : 'text-ink hover:bg-subtle')}
                    >
                      <Icon size={18} className={active ? 'text-accent' : 'text-muted'} />
                      {t(it.label)}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
        <div>
          <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">{t('top.changeView')}</div>
          <RoleGrid onDone={onClose} />
        </div>
        <div className="flex items-center justify-between rounded-ctl border border-line px-3 py-2 xs:hidden">
          <span className="text-sm text-ink2">{t('top.lang')}</span>
          <LangToggle />
        </div>
        <CtaBlock compact dataTour="whatsapp-cta-mobile" />
      </div>
    </Sheet>
  );
}

/* ---------------- Botón de retorno de previsualización ---------------- */
function PreviewReturn() {
  const preview = useApp((s) => s.preview);
  const trailer = useApp((s) => s.trailer);
  const navigate = useNavigate();
  const { t, b } = useT();
  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('[role="dialog"]')) {
        useApp.getState().cerrarPreview();
        navigate('/propuesta');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview, navigate]);
  if (!preview || trailer) return null;
  return (
    <div className="no-print fixed left-3 top-[64px] z-[60] flex max-w-[calc(100vw-24px)] flex-wrap items-center gap-2 lg:left-5 lg:top-[76px]">
      <button
        onClick={() => {
          useApp.getState().cerrarPreview();
          navigate('/propuesta');
        }}
        className="halo relative isolate inline-flex min-h-[44px] items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-white shadow-md dark:text-[#071a2e]"
      >
        <ArrowLeft size={16} />
        {t('preview.back')}
      </button>
      <span className="inline-flex min-h-[32px] items-center rounded-full border border-white/40 bg-[color-mix(in_srgb,var(--card)_70%,transparent)] px-3 text-xs text-ink2 shadow-sm backdrop-blur-md">
        {t('preview.viewing')}&nbsp;<b className="font-semibold text-ink">{b(preview.titulo)}</b>
      </span>
    </div>
  );
}

/* ---------------- Shell ---------------- */
export function AppShell() {
  const authed = useApp((s) => s.authed);
  const role = useApp((s) => s.role);
  const preview = useApp((s) => s.preview);
  const trailer = useApp((s) => s.trailer);
  const { pathname } = useLocation();
  const [more, setMore] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMore(false);
  }, [pathname]);

  if (!authed && !trailer) return <Navigate to="/login" replace />;

  const allowed = pathname === '/propuesta' || pathname.startsWith(ROLE_PREFIX[role] + '/');
  if (!allowed && !preview && !trailer) return <Navigate to={ROLE_HOME[role]} replace />;

  return (
    <div className="min-h-[100dvh] bg-bg">
      <TopBar />
      <MobileTopBar onMenu={() => setMore(true)} />
      <PreviewReturn />
      <main className={cn('mx-auto w-full max-w-[1400px] px-4 pb-[calc(var(--fixed-bottom-stack)+32px)] pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8', preview && !trailer && 'pt-[76px] sm:pt-[76px] lg:pt-[84px]')}>
        <Outlet />
      </main>
      <footer className="mx-auto hidden max-w-[1400px] px-8 pb-10 lg:block">
        <CtaBlock />
      </footer>
      <BottomNav onMore={() => setMore(true)} />
      <MoreSheet open={more} onClose={() => setMore(false)} />
      <Toasts />
      <WelcomeModal />
      <Tour openMore={setMore} />
      {!trailer && <AIAssistant />}
    </div>
  );
}
