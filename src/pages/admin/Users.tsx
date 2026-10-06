import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Check, MoreHorizontal, UserPlus } from 'lucide-react';
import { useApp } from '@/store';
import { en, tr, useT } from '@/i18n';
import { cn } from '@/lib/utils';
import { Avatar, DevNotice, Empty, Modal, PageHeader, PreviewBanner, Segmented } from '@/components/ui';
import { roleColor, users as seedUsers } from '@/data/users';
import { brands } from '@/data/brands';
import type { Role, User } from '@/types';

type Row = User & { pending?: boolean; inactive?: boolean };
type Filter = 'all' | Role;

const ROLES: Role[] = ['admin', 'franquiciante', 'franquiciado', 'equipo'];
const MODULES = ['crm', 'scoring', 'proposals', 'calendar', 'clients', 'users', 'franchisor', 'franchisee', 'projects'] as const;
type Module = (typeof MODULES)[number];

const DEFAULT_PERMS: Record<Role, Module[]> = {
  admin: [...MODULES],
  franquiciante: ['franchisor'],
  franquiciado: ['franchisee'],
  equipo: ['calendar', 'projects'],
};

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

function RoleBadge({ role }: { role: Role }) {
  const { e } = useT();
  const c = roleColor[role];
  return (
    <span className="pill whitespace-nowrap" style={{ background: `color-mix(in srgb, ${c} 12%, transparent)`, color: c }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {e('role', role)}
    </span>
  );
}

export default function UsersPage() {
  const { t, b, e } = useT();
  const [list, setList] = useState<Row[]>(() => seedUsers.map((u) => ({ ...u })));
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('equipo');
  const [brandId, setBrandId] = useState(brands[0].id);
  const [perms, setPerms] = useState<Module[]>(DEFAULT_PERMS.equipo);
  const [error, setError] = useState('');

  const shown = filter === 'all' ? list : list.filter((u) => u.role === filter);
  const needsBrand = role === 'franquiciante' || role === 'franquiciado';

  const openInvite = () => {
    setName('');
    setEmail('');
    setRole('equipo');
    setPerms(DEFAULT_PERMS.equipo);
    setError('');
    setOpen(true);
  };

  const pickRole = (r: Role) => {
    setRole(r);
    setPerms(DEFAULT_PERMS[r]);
  };

  const togglePerm = (m: Module) => setPerms((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]));

  const invite = () => {
    const s = useApp.getState();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(tr('users.form.error', s.lang));
      return;
    }
    const brand = needsBrand ? brands.find((x) => x.id === brandId) : undefined;
    const row: Row = {
      id: `u-new-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      brandId: brand?.id,
      title: [en('role', role, 'es'), en('role', role, 'en')],
      lastAccess: [tr('users.never', 'es'), tr('users.never', 'en')],
      initials: initials(name),
      pending: true,
    };
    setList((l) => [row, ...l]);
    setFilter('all');
    setOpen(false);
    s.toast(tr('users.invitedToast', s.lang, { name: row.name, email: row.email }));
  };

  const changeRole = (u: Row, r: Role) => {
    setList((l) => l.map((x) => (x.id === u.id ? { ...x, role: r } : x)));
    const s = useApp.getState();
    s.toast(tr('users.roleToast', s.lang, { name: u.name, role: en('role', r, s.lang) }));
  };
  const toggleActive = (u: Row) => {
    setList((l) => l.map((x) => (x.id === u.id ? { ...x, inactive: !x.inactive } : x)));
    const s = useApp.getState();
    s.toast(tr(u.inactive ? 'users.activatedToast' : 'users.deactivatedToast', s.lang, { name: u.name }), u.inactive ? 'ok' : 'warn');
  };
  const resend = (u: Row) => {
    const s = useApp.getState();
    s.toast(tr('users.resendToast', s.lang, { email: u.email }), 'info');
  };

  const brandName = (id?: string) => (id ? brands.find((x) => x.id === id)?.name ?? '—' : 'MRG');

  const statusBadges = (u: Row) => (
    <>
      {u.pending && <span className="pill bg-warn/10 text-warn">{t('users.pending')}</span>}
      {u.inactive && <span className="pill border border-line bg-subtle text-muted">{t('users.inactive')}</span>}
    </>
  );

  const rowMenu = (u: Row) => (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button type="button" className="icon-btn" aria-label={t('common.actions')} onClick={(ev) => ev.stopPropagation()}>
          <MoreHorizontal size={18} />
        </button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content sideOffset={6} align="end" className="z-[90] w-60 rounded-ctl border border-line bg-card p-1 shadow-md">
          <Dropdown.Label className="px-3 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">{t('users.editRole')}</Dropdown.Label>
          {ROLES.map((r) => (
            <Dropdown.Item
              key={r}
              disabled={r === u.role}
              onSelect={() => changeRole(u, r)}
              className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[8px] px-3 text-sm text-ink outline-none data-[disabled]:cursor-default data-[highlighted]:bg-subtle"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: roleColor[r] }} />
              <span className="flex-1">{e('role', r)}</span>
              {r === u.role && <Check size={14} className="text-accent" />}
            </Dropdown.Item>
          ))}
          <Dropdown.Separator className="my-1 h-px bg-line" />
          {u.pending && (
            <Dropdown.Item
              onSelect={() => resend(u)}
              className="flex min-h-[44px] cursor-pointer items-center rounded-[8px] px-3 text-sm text-ink outline-none data-[highlighted]:bg-subtle"
            >
              {t('users.resend')}
            </Dropdown.Item>
          )}
          <Dropdown.Item
            onSelect={() => toggleActive(u)}
            className={cn(
              'flex min-h-[44px] cursor-pointer items-center rounded-[8px] px-3 text-sm outline-none data-[highlighted]:bg-subtle',
              u.inactive ? 'text-ok' : 'text-danger',
            )}
          >
            {u.inactive ? t('users.activate') : t('users.deactivate')}
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );

  return (
    <div>
      <PageHeader
        kicker={t('kicker.admin')}
        title={t('users.title')}
        subtitle={t('users.subtitle', { n: list.length })}
        actions={
          <button type="button" className="btn-primary" onClick={openInvite}>
            <UserPlus size={16} />
            {t('users.invite')}
          </button>
        }
      />
      <PreviewBanner bullets={[t('users.b1'), t('users.b2'), t('users.b3')]} />

      <div className="mb-4 min-w-0">
        <Segmented<Filter>
          scroll
          className="w-fit max-w-full"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: t('common.all'), count: list.length },
            ...ROLES.map((r) => ({ value: r, label: e('role', r), count: list.filter((u) => u.role === r).length })),
          ]}
        />
      </div>

      {shown.length === 0 ? (
        <Empty text={t('common.noResults')} />
      ) : (
        <>
          {/* Desktop */}
          <div className="card hidden overflow-hidden lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-subtle text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                <tr>
                  <th className="px-4 py-3">{t('users.colUser')}</th>
                  <th className="px-4 py-3">{t('users.colEmail')}</th>
                  <th className="px-4 py-3">{t('users.colRole')}</th>
                  <th className="px-4 py-3">{t('common.brand')}</th>
                  <th className="px-4 py-3">{t('users.colAccess')}</th>
                  <th className="w-14 px-2 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((u) => (
                  <tr key={u.id} className={cn('transition hover:bg-subtle/60', u.inactive && 'opacity-60')}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} color={roleColor[u.role]} size={34} />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-ink">{u.name}</span>
                            {statusBadges(u)}
                          </div>
                          <div className="truncate text-xs text-muted">{b(u.title)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink2">{u.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink2">{brandName(u.brandId)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink2">{b(u.lastAccess)}</td>
                    <td className="px-2 py-1.5 text-right">{rowMenu(u)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
            {shown.map((u) => (
              <div key={u.id} className={cn('card p-4', u.inactive && 'opacity-60')}>
                <div className="flex items-start gap-3">
                  <Avatar name={u.name} color={roleColor[u.role]} size={38} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink">{u.name}</div>
                    <div className="truncate text-xs text-muted">{u.email}</div>
                  </div>
                  <div className="-mr-2 -mt-2 shrink-0">{rowMenu(u)}</div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <RoleBadge role={u.role} />
                  {statusBadges(u)}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3 text-xs text-muted">
                  <span className="truncate">{brandName(u.brandId)}</span>
                  <span className="shrink-0">
                    {t('users.colAccess')}: <span className="text-ink2">{b(u.lastAccess)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('users.form.title')}
        width={600}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </button>
            <button type="button" className="btn-primary" onClick={invite}>
              <UserPlus size={16} />
              {t('users.form.submit')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="inv-name">
                {t('users.form.name')}
              </label>
              <input id="inv-name" className="input" value={name} onChange={(x) => setName(x.target.value)} placeholder={t('users.form.namePh')} />
            </div>
            <div>
              <label className="label" htmlFor="inv-email">
                {t('users.colEmail')}
              </label>
              <input id="inv-email" type="email" className="input" value={email} onChange={(x) => setEmail(x.target.value)} placeholder={t('users.form.emailPh')} />
            </div>
          </div>

          <div>
            <span className="label">{t('users.colRole')}</span>
            <div className="grid grid-cols-1 gap-2 xs:grid-cols-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => pickRole(r)}
                  className={cn(
                    'flex min-h-[44px] items-center gap-2 rounded-ctl border px-3 text-left text-[13px] font-medium transition',
                    role === r ? 'border-accent bg-accent-soft text-ink' : 'border-line-strong bg-card text-ink2 hover:bg-subtle',
                  )}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: roleColor[r] }} />
                  {e('role', r)}
                </button>
              ))}
            </div>
          </div>

          {needsBrand && (
            <div>
              <label className="label" htmlFor="inv-brand">
                {t('common.brand')}
              </label>
              <select id="inv-brand" className="input" value={brandId} onChange={(x) => setBrandId(x.target.value)}>
                {brands.map((br) => (
                  <option key={br.id} value={br.id}>
                    {br.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <span className="label">{t('users.form.perms')}</span>
            <div className="grid grid-cols-1 gap-1.5 xs:grid-cols-2">
              {MODULES.map((m) => (
                <label key={m} className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-ctl border border-line px-3 text-[13px] text-ink hover:bg-subtle">
                  <input type="checkbox" className="h-4 w-4 shrink-0 accent-[var(--accent)]" checked={perms.includes(m)} onChange={() => togglePerm(m)} />
                  {t(`users.mod.${m}`)}
                </label>
              ))}
            </div>
          </div>

          {error && <div className="rounded-ctl bg-danger/10 px-3 py-2 text-[13px] text-danger">{error}</div>}

          <DevNotice className="mb-0" feature={t('users.dev.feature')} now={t('users.dev.now')} later={t('users.dev.later')} />
        </div>
      </Modal>
    </div>
  );
}
