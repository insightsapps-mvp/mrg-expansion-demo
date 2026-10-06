import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, CheckCircle2, Send, Store, UserRound } from 'lucide-react';
import { useApp } from '@/store';
import { tr, useT } from '@/i18n';
import { cn } from '@/lib/utils';
import { fmtBRL } from '@/lib/format';
import { brands } from '@/data/brands';
import { ENUMS } from '@/i18n/enums';
import { LogoFull } from '@/components/Brand';
import { LangToggle, ThemeToggle } from '@/layout/Controls';
import { Toasts } from '@/layout/Toasts';
import type { AccessKind, AccessRequest, ExperienceLevel, LocationLevel, Sector } from '@/types';

function Field({ id, label, children, error }: { id: string; label: string; children: ReactNode; error?: string }) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && <div className="mt-1 text-xs text-danger">{error}</div>}
    </div>
  );
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { t, e } = useT();
  const [kind, setKind] = useState<AccessKind>('franquiciado');
  const [sent, setSent] = useState<AccessRequest | null>(null);
  const [f, setF] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    company: '',
    sector: 'hamburgueseria' as Sector,
    units: 3,
    brandId: 'pampa',
    capital: 600000,
    experience: 'retail' as ExperienceLevel,
    location: 'spcap' as LocationLevel,
    message: '',
    terms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    const s = useApp.getState();
    const er: Record<string, string> = {};
    const req = tr('reg.err.required', s.lang);
    if (!f.name.trim()) er.name = req;
    if (!EMAIL.test(f.email.trim())) er.email = tr('reg.err.email', s.lang);
    if (!f.phone.trim()) er.phone = req;
    if (!f.city.trim()) er.city = req;
    if (kind === 'franquiciante' && !f.company.trim()) er.company = req;
    if (!f.terms) er.terms = tr('reg.err.terms', s.lang);
    setErrors(er);
    if (Object.keys(er).length) return;
    const r: AccessRequest = {
      id: `R-${Date.now()}`,
      kind,
      name: f.name.trim(),
      email: f.email.trim(),
      phone: f.phone.trim(),
      city: f.city.trim(),
      daysAgo: 0,
      status: 'pendiente',
      message: f.message.trim() || undefined,
      ...(kind === 'franquiciante'
        ? { company: f.company.trim(), sector: f.sector, origin: f.city.trim(), units: f.units }
        : {
            brandId: f.brandId,
            sector: brands.find((b) => b.id === f.brandId)?.sector,
            capital: f.capital,
            experience: f.experience,
            location: f.location,
          }),
    };
    s.addRequest(r);
    setSent(r);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-[100dvh] bg-subtle">
      <header className="flex items-center justify-between gap-2 px-4 py-4 sm:px-8">
        <Link to="/login" aria-label="MRG">
          <LogoFull className="h-[30px]" />
        </Link>
        <div className="flex items-center gap-1">
          <LangToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[640px] px-4 pb-16 pt-2 sm:px-6">
        <Link to="/login" className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-ink2 hover:text-ink">
          <ArrowLeft size={16} />
          {t('reg.back')}
        </Link>

        {sent ? (
          <div className="card fade-up p-6 text-center sm:p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ok/10 text-ok">
              <CheckCircle2 size={28} />
            </span>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">{t('reg.sentTitle')}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink2">{t('reg.sentBody', { email: sent.email })}</p>
            <div className="mx-auto mt-6 max-w-sm rounded-card border border-line bg-subtle p-4 text-left text-sm">
              <div className="kpi-label mb-2">{t('reg.summary')}</div>
              <div className="font-semibold text-ink">{sent.kind === 'franquiciante' ? sent.company : sent.name}</div>
              <div className="text-muted">
                {e('role', sent.kind)} · {sent.city}
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-warn/10 px-2.5 py-0.5 text-[11px] font-semibold text-warn">{t('reg.status')}</div>
            </div>
            <p className="mx-auto mt-5 max-w-sm rounded-ctl border border-dashed border-accent/40 bg-accent-soft/50 px-3 py-2 text-xs text-accent">{t('reg.demoTip')}</p>
            <Link to="/login" className="btn-primary mt-6">
              {t('reg.toLogin')}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-[26px] font-bold tracking-tight text-ink sm:text-[30px]">{t('reg.title')}</h1>
            <p className="mt-1.5 text-sm text-ink2">{t('reg.sub')}</p>

            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(
                [
                  { k: 'franquiciado', icon: UserRound },
                  { k: 'franquiciante', icon: Building2 },
                ] as const
              ).map(({ k, icon: Icon }) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={cn('flex items-start gap-3 rounded-card border p-4 text-left transition', kind === k ? 'border-accent bg-accent-soft ring-2 ring-accent/20' : 'border-line bg-card hover:border-line-strong')}
                  aria-pressed={kind === k}
                >
                  <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', kind === k ? 'bg-accent text-white dark:text-[#071a2e]' : 'bg-subtle text-ink2')}>
                    <Icon size={17} />
                  </span>
                  <span>
                    <span className={cn('block text-sm font-semibold', kind === k ? 'text-accent' : 'text-ink')}>{t(`reg.kind.${k}`)}</span>
                    <span className="block text-xs text-ink2">{t(`reg.kind.${k}.desc`)}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="card mt-4 space-y-4 p-5 sm:p-6">
              <div className="kpi-label">{t('reg.contact')}</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="r-name" label={t('reg.name')} error={errors.name}>
                  <input id="r-name" className="input" value={f.name} onChange={(ev) => set('name', ev.target.value)} autoComplete="name" />
                </Field>
                <Field id="r-email" label={t('reg.email')} error={errors.email}>
                  <input id="r-email" type="email" className="input" value={f.email} onChange={(ev) => set('email', ev.target.value)} autoComplete="email" />
                </Field>
                <Field id="r-phone" label={t('reg.phone')} error={errors.phone}>
                  <input id="r-phone" type="tel" className="input" value={f.phone} onChange={(ev) => set('phone', ev.target.value)} placeholder="+55 11 9…" autoComplete="tel" />
                </Field>
                <Field id="r-city" label={t(kind === 'franquiciante' ? 'reg.origin' : 'reg.city')} error={errors.city}>
                  <input id="r-city" className="input" value={f.city} onChange={(ev) => set('city', ev.target.value)} />
                </Field>
              </div>

              <div className="kpi-label pt-2">{t(kind === 'franquiciante' ? 'reg.brandData' : 'reg.profile')}</div>
              {kind === 'franquiciante' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="r-company" label={t('reg.company')} error={errors.company}>
                    <input id="r-company" className="input" value={f.company} onChange={(ev) => set('company', ev.target.value)} />
                  </Field>
                  <Field id="r-sector" label={t('reg.sector')}>
                    <select id="r-sector" className="input" value={f.sector} onChange={(ev) => set('sector', ev.target.value as Sector)}>
                      {Object.keys(ENUMS.sector).map((k) => (
                        <option key={k} value={k}>
                          {e('sector', k)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id="r-units" label={t('reg.units')}>
                    <input id="r-units" type="number" min={0} className="input num" value={f.units} onChange={(ev) => set('units', Math.max(0, Number(ev.target.value) || 0))} />
                  </Field>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="r-brand" label={t('reg.brandInterest')}>
                    <select id="r-brand" className="input" value={f.brandId} onChange={(ev) => set('brandId', ev.target.value)}>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id="r-capital" label={t('reg.capital')}>
                    <input id="r-capital" type="number" step={50000} min={0} className="input num" value={f.capital} onChange={(ev) => set('capital', Math.max(0, Number(ev.target.value) || 0))} />
                    <div className="num mt-1 text-xs text-muted">{fmtBRL(f.capital)}</div>
                  </Field>
                  <Field id="r-exp" label={t('reg.experience')}>
                    <select id="r-exp" className="input" value={f.experience} onChange={(ev) => set('experience', ev.target.value as ExperienceLevel)}>
                      {Object.keys(ENUMS.experience).map((k) => (
                        <option key={k} value={k}>
                          {e('experience', k)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id="r-loc" label={t('reg.location')}>
                    <select id="r-loc" className="input" value={f.location} onChange={(ev) => set('location', ev.target.value as LocationLevel)}>
                      {Object.keys(ENUMS.location).map((k) => (
                        <option key={k} value={k}>
                          {e('location', k)}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              )}

              <Field id="r-msg" label={t(kind === 'franquiciante' ? 'reg.msgFte' : 'reg.msgFdo')}>
                <textarea id="r-msg" rows={3} className="input py-2" value={f.message} onChange={(ev) => set('message', ev.target.value)} />
              </Field>

              <label className="flex min-h-[44px] cursor-pointer items-start gap-2.5 text-[13px] text-ink2">
                <input type="checkbox" checked={f.terms} onChange={() => set('terms', !f.terms)} className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
                <span>{t('reg.terms')}</span>
              </label>
              {errors.terms && <div className="-mt-2 text-xs text-danger">{errors.terms}</div>}

              <button onClick={submit} className="btn-primary w-full">
                <Send size={16} />
                {t('reg.submit')}
              </button>
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
                <Store size={13} />
                {t('reg.review')}
              </p>
            </div>
          </>
        )}
      </main>
      <Toasts />
    </div>
  );
}
