import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Check, Eye, EyeOff, LogIn, MessageCircle, PlayCircle } from 'lucide-react';
import { useApp } from '@/store';
import { useT } from '@/i18n';
import { demoAccounts, roleColor, userById } from '@/data/users';
import { WHATSAPP_URL, cn } from '@/lib/utils';
import { LogoFull, LogoMark } from '@/components/Brand';
import { LangToggle, ThemeToggle } from '@/layout/Controls';
import { Toasts } from '@/layout/Toasts';
import type { Role } from '@/types';

function DemoPill() {
  const { t } = useT();
  return (
    <span className="pill border border-[#2d9cdb]/40 bg-[#2d9cdb]/10 text-[#2d9cdb]">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2d9cdb] opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2d9cdb]" />
      </span>
      {t('login.demo')}
    </span>
  );
}

function Hero() {
  const { t } = useT();
  const feats = ['login.f1', 'login.f2', 'login.f3', 'login.f4'];
  return (
    <section className="relative hidden w-[55%] overflow-hidden bg-[var(--hero)] text-white lg:flex lg:flex-col">
      {/* blobs azul niebla */}
      <div className="pointer-events-none absolute -left-24 top-24 h-[420px] w-[420px] rounded-full bg-[#2d9cdb]/20 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-[460px] w-[460px] rounded-full bg-[#5b7fa6]/25 blur-[120px]" />
      <div className="relative z-10 flex h-full flex-col px-12 py-10 xl:px-16">
        <div className="flex items-center justify-between">
          <LogoFull white className="h-10" />
          <DemoPill />
        </div>
        <div className="my-auto max-w-xl py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
            <LogoMark size={16} />
            {t('login.brandBadge')}
          </span>
          <h1 className="mt-6 text-[44px] font-bold leading-[1.08] tracking-tight xl:text-[52px]">
            {t('login.h1a')}
            <br />
            <span className="text-[#2d9cdb]">{t('login.h1b')}</span>
          </h1>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-white/70">{t('login.sub')}</p>
          <ul className="mt-8 space-y-3.5">
            {feats.map((k, i) => (
              <li key={k} className="flex items-center gap-3 text-[15px] text-white/90" style={{ animation: `stagger .5s ease both`, animationDelay: `${200 + i * 80}ms` }}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2d9cdb]/20 text-[#2d9cdb]">
                  <Check size={14} strokeWidth={3} />
                </span>
                {t(k)}
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-white/10 pt-5 text-[12px] text-white/50">
          <div className="text-white/70">{t('login.services')}</div>
          <div className="mt-1.5 flex items-center justify-between">
            <span>{t('login.place')}</span>
            <span className="text-[10px] uppercase tracking-[0.14em]">Powered by Insights</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Login() {
  const authed = useApp((s) => s.authed);
  const login = useApp((s) => s.login);
  const { t, e } = useT();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(false);
  const [active, setActive] = useState<Role | null>(null);

  if (authed) return <Navigate to="/propuesta" replace />;

  const fill = (role: Role) => {
    const acc = demoAccounts.find((a) => a.role === role)!;
    setEmail(acc.email);
    setPass('demo123');
    setActive(role);
    setError(false);
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const acc = demoAccounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!acc || pass !== 'demo123') {
      setError(true);
      return;
    }
    login(acc.role);
    navigate('/propuesta', { replace: true });
  };

  const startTrailer = () => {
    const s = useApp.getState();
    s.setRole('admin');
    s.setTrailer(true);
    navigate('/propuesta');
  };

  return (
    <div className="flex min-h-[100dvh] bg-bg">
      <Hero />
      <section className="flex w-full flex-col lg:w-[45%]">
        <div className="flex items-center justify-between gap-2 px-4 pt-4 sm:px-8 lg:justify-end lg:pt-6">
          <div className="flex items-center gap-2 lg:hidden">
            <LogoFull className="h-[30px]" />
          </div>
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline-flex lg:inline-flex">
              <DemoPill />
            </span>
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
          <div className="w-full max-w-[420px]">
            <div className="mb-3 sm:hidden">
              <DemoPill />
            </div>
            <h2 className="text-[26px] font-bold tracking-tight text-ink">{t('login.welcome')}</h2>
            <p className="mt-1 text-sm text-ink2">{t('login.welcomeSub')}</p>

            <form onSubmit={submit} className="card mt-6 space-y-4 p-5 sm:p-6">
              <div>
                <label className="label" htmlFor="email">
                  {t('login.user')}
                </label>
                <input id="email" className="input" type="email" autoComplete="username" placeholder={t('login.userPh')} value={email} onChange={(ev) => setEmail(ev.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="pass">
                  {t('login.pass')}
                </label>
                <div className="relative">
                  <input id="pass" className="input pr-12" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••" value={pass} onChange={(ev) => setPass(ev.target.value)} />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted hover:text-ink" aria-label="toggle">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-ink2">
                  <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} className="h-4 w-4 accent-[var(--accent)]" />
                  {t('login.remember')}
                </label>
                <button type="button" className="min-h-[44px] font-medium text-accent hover:underline" onClick={() => useApp.getState().toast(t('login.forgotToast'), 'info')}>
                  {t('login.forgot')}
                </button>
              </div>
              {error && <div className="rounded-ctl border border-danger/30 bg-danger/[0.07] px-3 py-2 text-[13px] text-danger">{t('login.error')}</div>}
              <button type="submit" className="btn-primary w-full">
                <LogIn size={16} />
                {t('login.submit')}
              </button>

              <div className="pt-1">
                <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">{t('login.quick')}</div>
                <div className="grid grid-cols-2 gap-2">
                  {demoAccounts.map((a) => {
                    const u = userById(a.userId);
                    return (
                      <button
                        type="button"
                        key={a.role}
                        onClick={() => fill(a.role)}
                        className={cn(
                          'flex min-h-[48px] items-center gap-2 rounded-ctl border px-3 text-left transition',
                          active === a.role ? 'border-accent bg-accent-soft' : 'border-line bg-card hover:border-line-strong',
                        )}
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: roleColor[a.role] }} />
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold text-ink">{e('role', a.role)}</span>
                          <span className="block truncate text-[11px] text-muted">{u.name}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>

            <div className="mt-5 flex flex-col items-center gap-1 text-[13px]">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center gap-2 font-medium text-ink2 hover:text-accent">
                <MessageCircle size={15} />
                {t('login.noAccess')}
              </a>
              <button onClick={startTrailer} className="hidden min-h-[44px] items-center gap-2 font-semibold text-accent hover:underline lg:inline-flex">
                <PlayCircle size={16} />
                {t('login.trailer')}
              </button>
            </div>
            <p className="mt-4 text-center text-[11px] text-muted">{t('login.legal')}</p>
          </div>
        </div>
      </section>
      <Toasts />
    </div>
  );
}
