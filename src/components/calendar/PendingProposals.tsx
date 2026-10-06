import { Check, Inbox, X } from 'lucide-react';
import { useApp } from '@/store';
import { tr, useT } from '@/i18n';
import { fmtDate } from '@/lib/format';
import { Avatar } from '@/components/ui';
import { roleColor, userById } from '@/data/users';

/** Actividades propuestas por marcas y franquiciados, a confirmar por MRG */
export function PendingProposals() {
  const { t, b, e, lang } = useT();
  const events = useApp((s) => s.events);
  const pending = events.filter((ev) => ev.status === 'propuesto').sort((a, z) => +new Date(a.date) - +new Date(z.date));
  if (!pending.length) return null;

  const act = (id: string, ok: boolean, name: string) => {
    const s = useApp.getState();
    s.updateEvent(id, { status: ok ? 'confirmado' : 'rechazado' });
    s.toast(ok ? tr('shcal.confirmedToast', s.lang, { name }) : tr('shcal.rejectedToast', s.lang), ok ? 'ok' : 'warn');
  };

  return (
    <div className="mb-5 rounded-card border border-warn/30 bg-warn/[0.06] p-4" data-tour="pending-proposals">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        <Inbox size={16} className="text-warn" />
        {t('shcal.adminPending', { n: pending.length })}
      </div>
      <ul className="space-y-2">
        {pending.map((ev) => {
          const u = ev.createdBy ? userById(ev.createdBy) : undefined;
          return (
            <li key={ev.id} className="flex flex-col gap-3 rounded-ctl border border-line bg-card p-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {u && <Avatar userId={u.id} size={32} />}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-ink">{b(ev.title)}</div>
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                    {u && (
                      <span style={{ color: roleColor[u.role] }} className="font-medium">
                        {u.name} · {e('role', u.role)}
                      </span>
                    )}
                    <span className="num">{fmtDate(ev.date, 'EEE d MMM · HH:mm', lang)}</span>
                  </div>
                  {ev.note && <div className="mt-1 truncate text-xs italic text-ink2">“{b(ev.note)}”</div>}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button className="btn-primary btn-sm min-h-[40px] flex-1 sm:flex-none" onClick={() => act(ev.id, true, u?.name ?? '')}>
                  <Check size={14} />
                  {t('shcal.confirm')}
                </button>
                <button className="btn-secondary btn-sm min-h-[40px] flex-1 sm:flex-none" onClick={() => act(ev.id, false, '')}>
                  <X size={14} />
                  {t('shcal.propose_other')}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
