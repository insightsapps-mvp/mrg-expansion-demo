import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Mail, Store, Users } from 'lucide-react';
import { useApp } from '@/store';
import { tr, useT } from '@/i18n';
import { fmtBRL } from '@/lib/format';
import { Avatar, Badge, PageHeader, PreviewBanner, Progress, SidePanel } from '@/components/ui';
import { brands } from '@/data/brands';
import { units } from '@/data/units';
import { userById } from '@/data/users';
import { STAGES } from '@/data/leads';
import type { Brand, UnitStatus } from '@/types';

const statusTone: Record<Brand['status'], 'ok' | 'accent' | 'violet'> = {
  operando: 'ok',
  expansion: 'accent',
  softlanding: 'violet',
};
const unitTone: Record<UnitStatus, 'ok' | 'accent' | 'danger'> = {
  abierta: 'ok',
  apertura: 'accent',
  atrasada: 'danger',
};

export default function Clients() {
  const { t, b, e, lang } = useT();
  const navigate = useNavigate();
  const leads = useApp((s) => s.leads);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      brands.map((br) => {
        const us = units.filter((u) => u.brandId === br.id);
        return {
          brand: br,
          units: us,
          open: us.filter((u) => u.status === 'abierta').length,
          opening: us.filter((u) => u.status !== 'abierta').length,
          leads: leads.filter((l) => l.brandId === br.id),
        };
      }),
    [leads],
  );

  const selected = rows.find((r) => r.brand.id === selectedId) ?? null;
  const totalOpen = rows.reduce((s, r) => s + r.open, 0);
  const totalOpening = rows.reduce((s, r) => s + r.opening, 0);

  const unitsLabel = (open: number, opening: number) => (
    <span className="text-[13px] text-ink2">
      <span className="num text-ink">{open}</span> {t('clients.openShort')}
      <span className="mx-1.5 text-muted">·</span>
      <span className="num text-ink">{opening}</span> {t('clients.openingShort')}
    </span>
  );

  const contactToast = (br: Brand) => useApp.getState().toast(tr('clients.contactToast', lang, { name: br.contact }), 'info');

  return (
    <div>
      <PageHeader
        kicker={t('kicker.admin')}
        title={t('clients.title')}
        subtitle={t('clients.subtitle', { brands: brands.length, open: totalOpen, opening: totalOpening })}
        actions={
          <button type="button" className="btn-primary" onClick={() => useApp.getState().toast(tr('clients.newToast', lang), 'info')}>
            {t('clients.newBrand')}
          </button>
        }
      />
      <PreviewBanner bullets={[t('clients.b1'), t('clients.b2'), t('clients.b3')]} />

      {/* Desktop: tabla */}
      <div className="card hidden overflow-hidden lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-subtle text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
            <tr>
              <th className="px-4 py-3">{t('common.brand')}</th>
              <th className="px-4 py-3">{t('common.status')}</th>
              <th className="px-4 py-3">{t('common.owner')}</th>
              <th className="px-4 py-3">{t('clients.units')}</th>
              <th className="px-4 py-3">{t('clients.nextAction')}</th>
              <th className="hidden px-4 py-3 xl:table-cell">{t('clients.contact')}</th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(({ brand: br, open, opening }) => {
              const owner = userById(br.ownerId);
              return (
                <tr key={br.id} onClick={() => setSelectedId(br.id)} className="cursor-pointer transition hover:bg-subtle/60">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-ctl text-[13px] font-bold text-white" style={{ background: br.color }}>
                        {br.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-ink">{br.name}</div>
                        <div className="truncate text-xs text-muted">
                          {b(br.sectorLabel)} · {br.origin}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone={statusTone[br.status]}>{e('brandStatus', br.status)}</Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Avatar userId={owner.id} size={26} />
                      <span className="whitespace-nowrap text-ink2">{owner.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">{unitsLabel(open, opening)}</td>
                  <td className="max-w-[260px] px-4 py-3.5 text-ink2">{b(br.nextAction)}</td>
                  <td className="hidden px-4 py-3.5 xl:table-cell">
                    <div className="text-ink">{br.contact}</div>
                    <div className="text-xs text-muted">{br.contactEmail}</div>
                  </td>
                  <td className="px-2 py-3.5 text-muted">
                    <ChevronRight size={16} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/tablet: tarjetas */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
        {rows.map(({ brand: br, open, opening }) => {
          const owner = userById(br.ownerId);
          return (
            <button key={br.id} type="button" onClick={() => setSelectedId(br.id)} className="card flex flex-col gap-3 p-4 text-left">
              <div className="flex w-full items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-ctl text-[14px] font-bold text-white" style={{ background: br.color }}>
                  {br.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink">{br.name}</div>
                  <div className="truncate text-xs text-muted">
                    {b(br.sectorLabel)} · {br.origin}
                  </div>
                </div>
                <Badge tone={statusTone[br.status]} className="shrink-0">
                  {e('brandStatus', br.status)}
                </Badge>
              </div>
              <div className="w-full rounded-ctl bg-subtle px-3 py-2 text-[13px] text-ink2">
                <span className="kpi-label mr-1.5">{t('clients.nextAction')}</span>
                <span className="block text-ink">{b(br.nextAction)}</span>
              </div>
              <div className="flex w-full flex-wrap items-center justify-between gap-2">
                {unitsLabel(open, opening)}
                <span className="flex min-w-0 items-center gap-2 text-[13px] text-ink2">
                  <Avatar userId={owner.id} size={24} />
                  <span className="truncate">{owner.name}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <SidePanel
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={
          selected && (
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: selected.brand.color }} />
              {selected.brand.name}
            </span>
          )
        }
        footer={
          selected && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary btn-sm min-h-[44px] flex-1"
                onClick={() => {
                  setSelectedId(null);
                  navigate('/admin/crm');
                }}
              >
                <Users size={15} />
                {t('clients.viewLeads')}
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm min-h-[44px] flex-1"
                onClick={() => {
                  const s = useApp.getState();
                  if (selected.brand.id === 'pampa') {
                    setSelectedId(null);
                    s.setRole('franquiciante');
                    navigate('/franquiciante/unidades');
                    s.toast(tr('clients.portalToast', s.lang, { name: selected.brand.name }), 'info');
                  } else {
                    s.toast(tr('clients.unitsToast', s.lang, { name: selected.brand.name }), 'info');
                  }
                }}
              >
                <Store size={15} />
                {t('clients.viewUnits')}
              </button>
            </div>
          )
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone[selected.brand.status]}>{e('brandStatus', selected.brand.status)}</Badge>
              <span className="text-xs text-muted">
                {b(selected.brand.sectorLabel)} · {selected.brand.origin}
              </span>
            </div>

            <div className="rounded-card border border-line p-3">
              <div className="kpi-label mb-2">{t('clients.nextAction')}</div>
              <div className="text-sm font-medium text-ink">{b(selected.brand.nextAction)}</div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <Avatar userId={selected.brand.ownerId} size={22} />
                {userById(selected.brand.ownerId).name}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-card border border-line p-3">
              <div className="min-w-0 flex-1">
                <div className="kpi-label mb-1">{t('clients.contact')}</div>
                <div className="truncate text-sm font-semibold text-ink">{selected.brand.contact}</div>
                <div className="truncate text-xs text-muted">{selected.brand.contactEmail}</div>
              </div>
              <button type="button" className="btn-secondary btn-sm min-h-[44px] shrink-0" onClick={() => contactToast(selected.brand)}>
                <Mail size={14} />
                {t('clients.write')}
              </button>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="section-title text-base">{t('clients.unitsTitle')}</div>
                <span className="text-xs text-muted">{t('clients.revenueMonth')}</span>
              </div>
              {selected.units.length === 0 ? (
                <div className="rounded-card border border-dashed border-line px-4 py-5 text-center text-sm text-muted">{t('clients.noUnits')}</div>
              ) : (
                <div className="space-y-2">
                  {selected.units.map((u) => {
                    const rev = u.revenue[u.revenue.length - 1];
                    return (
                      <div key={u.id} className="rounded-ctl border border-line px-3 py-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-ink">{u.mall}</div>
                            <div className="truncate text-xs text-muted">{u.franchisee}</div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="num text-sm text-ink">{rev > 0 ? fmtBRL(rev) : '—'}</div>
                            <Badge tone={unitTone[u.status]} className="mt-1">
                              {e('unitStatus', u.status)}
                            </Badge>
                          </div>
                        </div>
                        {u.status !== 'abierta' && (
                          <div className="mt-2 flex items-center gap-2">
                            <Progress value={u.progress} tone={u.status === 'atrasada' ? 'danger' : 'accent'} />
                            <span className="num shrink-0 text-xs text-ink2">{u.progress}%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="section-title text-base">{t('clients.leadsTitle')}</div>
                <span className="num text-sm text-ink2">{selected.leads.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {STAGES.map((st) => {
                  const n = selected.leads.filter((l) => l.stage === st).length;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setSelectedId(null);
                        navigate('/admin/crm');
                      }}
                      className="flex min-h-[44px] items-center justify-between gap-2 rounded-ctl border border-line px-3 text-left transition hover:bg-subtle"
                    >
                      <span className="truncate text-[12.5px] text-ink2">{e('stage', st)}</span>
                      <span className={n ? 'num text-sm text-ink' : 'num text-sm text-muted'}>{n}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="mt-3 inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-accent"
                onClick={() => {
                  setSelectedId(null);
                  navigate('/admin/crm');
                }}
              >
                {t('clients.goCrm')}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
}
