import { useState } from 'react';
import { Building2, Check, ChevronDown, ChevronUp, Inbox, Mail, Phone, UserRound, X } from 'lucide-react';
import { useApp } from '@/store';
import { tr, useT } from '@/i18n';
import { cn } from '@/lib/utils';
import { fmtAgo, fmtBRL } from '@/lib/format';
import { computeScore } from '@/config/scoring';
import { brandById } from '@/data/brands';
import { roleColor } from '@/data/users';
import { Badge, ScoreBadge } from '@/components/ui';
import type { AccessRequest } from '@/types';

/** Solicitudes de acceso desde el login: el Admin MRG las aprueba o rechaza */
export function AccessRequests({ onApproved }: { onApproved: (r: AccessRequest) => void }) {
  const { t, e, lang } = useT();
  const requests = useApp((s) => s.requests);
  const rules = useApp((s) => s.rules);
  const [open, setOpen] = useState<string | null>(null);
  const pending = requests.filter((r) => r.status === 'pendiente');
  const resolved = requests.filter((r) => r.status !== 'pendiente').slice(0, 4);

  const score = (r: AccessRequest) =>
    r.kind === 'franquiciado'
      ? computeScore({ capital: r.capital ?? 0, experience: r.experience ?? 'none', location: r.location ?? 'spcap', sector: r.sector ?? 'retail', brandId: r.brandId ?? 'pampa' }, rules)
      : null;

  const approve = (r: AccessRequest) => {
    const s = useApp.getState();
    s.setRequestStatus(r.id, 'aprobada');
    onApproved(r);
    s.toast(
      r.kind === 'franquiciado'
        ? tr('req.approvedFdo', s.lang, { name: r.name, score: score(r) ?? 0 })
        : tr('req.approvedFte', s.lang, { name: r.company ?? r.name }),
    );
  };
  const reject = (r: AccessRequest) => {
    const s = useApp.getState();
    s.setRequestStatus(r.id, 'rechazada');
    s.toast(tr('req.rejectedToast', s.lang, { name: r.company ?? r.name }), 'warn');
  };

  return (
    <section className="mb-6" data-tour="access-requests">
      <div className="mb-3 flex items-center gap-2">
        <Inbox size={17} className={pending.length ? 'text-warn' : 'text-muted'} />
        <h2 className="section-title text-base">{t('req.title')}</h2>
        {pending.length > 0 && <span className="num rounded-full bg-warn px-2 py-0.5 text-[11px] font-bold text-white">{pending.length}</span>}
      </div>
      {pending.length === 0 ? (
        <div className="rounded-card border border-dashed border-line px-4 py-5 text-sm text-muted">{t('req.empty')}</div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {pending.map((r) => {
            const sc = score(r);
            const expanded = open === r.id;
            const Icon = r.kind === 'franquiciante' ? Building2 : UserRound;
            return (
              <article key={r.id} className="card flex min-w-0 flex-col p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${roleColor[r.kind]} 14%, transparent)`, color: roleColor[r.kind] }}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-[15px] font-semibold text-ink">{r.kind === 'franquiciante' ? r.company : r.name}</span>
                      <span className="pill" style={{ background: `color-mix(in srgb, ${roleColor[r.kind]} 12%, transparent)`, color: roleColor[r.kind] }}>
                        {e('role', r.kind)}
                      </span>
                    </div>
                    <div className="truncate text-xs text-muted">
                      {r.kind === 'franquiciante' ? `${r.name} · ` : ''}
                      {r.city} · {fmtAgo(r.daysAgo, lang)}
                    </div>
                  </div>
                  {sc !== null && (
                    <div className="text-center">
                      <ScoreBadge score={sc} />
                      <div className="mt-0.5 text-[10px] text-muted">{t('req.score')}</div>
                    </div>
                  )}
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
                  {r.kind === 'franquiciante' ? (
                    <>
                      <div>
                        <dt className="text-xs text-muted">{t('reg.sector')}</dt>
                        <dd className="text-ink">{r.sector ? e('sector', r.sector) : '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">{t('reg.units')}</dt>
                        <dd className="num text-ink">{r.units ?? '—'}</dd>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <dt className="text-xs text-muted">{t('reg.brandInterest')}</dt>
                        <dd className="text-ink">{r.brandId ? brandById(r.brandId).name : '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">{t('reg.capital')}</dt>
                        <dd className="num text-ink">{fmtBRL(r.capital ?? 0)}</dd>
                      </div>
                    </>
                  )}
                </dl>

                {expanded && (
                  <div className="fade-up mt-3 space-y-2 rounded-ctl bg-subtle p-3 text-[13px]">
                    <div className="flex items-center gap-2 text-ink2">
                      <Mail size={14} /> {r.email}
                    </div>
                    <div className="flex items-center gap-2 text-ink2">
                      <Phone size={14} /> {r.phone}
                    </div>
                    {r.kind === 'franquiciado' && (
                      <div className="flex flex-wrap gap-1.5">
                        {r.experience && <Badge>{e('experience', r.experience)}</Badge>}
                        {r.location && <Badge>{e('location', r.location)}</Badge>}
                      </div>
                    )}
                    {r.message && <p className="italic text-ink2">“{r.message}”</p>}
                  </div>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                  <button className="btn-primary btn-sm min-h-[44px] flex-1" onClick={() => approve(r)}>
                    <Check size={15} />
                    {t('req.approve')}
                  </button>
                  <button className="btn-secondary btn-sm min-h-[44px] flex-1" onClick={() => reject(r)}>
                    <X size={15} />
                    {t('req.reject')}
                  </button>
                  <button className="icon-btn" onClick={() => setOpen(expanded ? null : r.id)} aria-expanded={expanded} aria-label={t('common.details')}>
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {resolved.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {resolved.map((r) => (
            <span key={r.id} className={cn('pill border', r.status === 'aprobada' ? 'border-ok/30 bg-ok/10 text-ok' : 'border-danger/30 bg-danger/10 text-danger')}>
              {r.status === 'aprobada' ? <Check size={11} /> : <X size={11} />}
              {r.kind === 'franquiciante' ? r.company : r.name} · {t(r.status === 'aprobada' ? 'req.statusOk' : 'req.statusNo')}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
