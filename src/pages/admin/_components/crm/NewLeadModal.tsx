import { useState, type ReactNode } from 'react';
import { Modal, ScoreBadge } from '@/components/ui';
import { useT, tr } from '@/i18n';
import { ENUMS } from '@/i18n/enums';
import { useApp } from '@/store';
import { brands } from '@/data/brands';
import { computeScore } from '@/config/scoring';
import type { ExperienceLevel, Lead, LocationLevel, Sector } from '@/types';
import { nextLeadIds, ScoreBars } from './shared';

interface Form {
  name: string;
  email: string;
  phone: string;
  city: string;
  brandId: string;
  sector: Sector;
  capital: string;
  experience: ExperienceLevel;
  years: string;
  location: LocationLevel;
}

const EMPTY: Form = {
  name: '',
  email: '',
  phone: '',
  city: '',
  brandId: 'pampa',
  sector: 'hamburgueseria',
  capital: '',
  experience: 'none',
  years: '0',
  location: 'spcap',
};

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

export function NewLeadModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: () => void }) {
  const { t, e } = useT();
  const rules = useApp((s) => s.rules);
  const [f, setF] = useState<Form>(EMPTY);
  const [error, setError] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const capital = Math.max(0, Number(f.capital) || 0);
  const input = { capital, experience: f.experience, location: f.location, sector: f.sector, brandId: f.brandId };
  const score = computeScore(input, rules);

  const close = () => {
    setError(false);
    onClose();
  };

  const save = () => {
    if (!f.name.trim()) {
      setError(true);
      return;
    }
    const s = useApp.getState();
    const [id] = nextLeadIds(s.leads, 1);
    const lead: Lead = {
      id,
      name: f.name.trim(),
      email: f.email.trim(),
      phone: f.phone.trim(),
      city: f.city.trim(),
      nationality: 'BR',
      origin: 'web',
      brandId: f.brandId,
      sector: f.sector,
      capital,
      experience: f.experience,
      experienceYears: Math.max(0, Number(f.years) || 0),
      location: f.location,
      desiredZone: '',
      stage: 'nuevo',
      ownerId: 'u-daniel',
      lastContactDays: 0,
      createdDaysAgo: 0,
    };
    s.addLeads([lead]);
    s.toast(tr('crm.new.saved', s.lang, { name: lead.name, score }));
    setF(EMPTY);
    setError(false);
    onCreated?.();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      width={820}
      title={t('crm.new.title')}
      footer={
        <>
          <button className="btn-secondary" onClick={close}>
            {t('common.cancel')}
          </button>
          <button className="btn-primary" onClick={save}>
            {t('crm.new.save')}
          </button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
        {/* Score en vivo (arriba en mobile) */}
        <aside className="order-first rounded-card border border-line bg-subtle p-4 md:order-last md:self-start">
          <div className="kpi-label">{t('crm.new.scoreLive')}</div>
          <div className="mt-3 flex items-center gap-3">
            <ScoreBadge score={score} size="lg" />
            <p className="min-w-0 text-xs text-muted">{t('crm.new.scoreHint')}</p>
          </div>
          <div className="mt-4">
            <ScoreBars input={input} rules={rules} compact showTier={false} />
          </div>
        </aside>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t('crm.new.name')} className="sm:col-span-2">
            <input
              className="input"
              value={f.name}
              placeholder={t('crm.new.namePh')}
              onChange={(ev) => {
                set('name', ev.target.value);
                if (error) setError(false);
              }}
              aria-invalid={error}
            />
            {error && <span className="mt-1 block text-xs text-danger">{t('crm.new.required')}</span>}
          </Field>
          <Field label={t('crm.new.email')}>
            <input className="input" type="email" value={f.email} onChange={(ev) => set('email', ev.target.value)} />
          </Field>
          <Field label={t('crm.new.phone')}>
            <input className="input" type="tel" value={f.phone} placeholder="+55 11 9…" onChange={(ev) => set('phone', ev.target.value)} />
          </Field>
          <Field label={t('crm.new.city')} className="sm:col-span-2">
            <input className="input" value={f.city} placeholder={t('crm.new.cityPh')} onChange={(ev) => set('city', ev.target.value)} />
          </Field>
          <Field label={t('crm.new.brand')}>
            <select className="input" value={f.brandId} onChange={(ev) => set('brandId', ev.target.value)}>
              {brands.map((br) => (
                <option key={br.id} value={br.id}>
                  {br.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('crm.new.sector')}>
            <select className="input" value={f.sector} onChange={(ev) => set('sector', ev.target.value as Sector)}>
              {Object.keys(ENUMS.sector).map((k) => (
                <option key={k} value={k}>
                  {e('sector', k)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('crm.new.capital')} className="sm:col-span-2">
            <input
              className="input num"
              type="number"
              inputMode="numeric"
              min={0}
              step={10000}
              value={f.capital}
              placeholder="750000"
              onChange={(ev) => set('capital', ev.target.value)}
            />
          </Field>
          <Field label={t('crm.new.experience')}>
            <select className="input" value={f.experience} onChange={(ev) => set('experience', ev.target.value as ExperienceLevel)}>
              {Object.keys(ENUMS.experience).map((k) => (
                <option key={k} value={k}>
                  {e('experience', k)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('crm.new.years')}>
            <input className="input num" type="number" inputMode="numeric" min={0} value={f.years} onChange={(ev) => set('years', ev.target.value)} />
          </Field>
          <Field label={t('crm.new.location')} className="sm:col-span-2">
            <select className="input" value={f.location} onChange={(ev) => set('location', ev.target.value as LocationLevel)}>
              {Object.keys(ENUMS.location).map((k) => (
                <option key={k} value={k}>
                  {e('location', k)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>
    </Modal>
  );
}
