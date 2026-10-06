import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, ChevronRight, Info, Minus, Plus, RotateCcw, Save } from 'lucide-react';
import { useApp } from '@/store';
import { useT, tr } from '@/i18n';
import { cn } from '@/lib/utils';
import { computeScore, DEFAULT_RULES } from '@/config/scoring';
import { brandById } from '@/data/brands';
import { FixedBottomBar, PageHeader, PreviewBanner, ScoreBadge } from '@/components/ui';
import type { ScoreRule } from '@/types';

const MAX_WEIGHT = 40;
const MAX_POINTS = 50;

const sameRules = (a: ScoreRule[], b: ScoreRule[]) => JSON.stringify(a) === JSON.stringify(b);

/* ---------- Slider estilizado con el acento ---------- */
function WeightSlider({
  value,
  onChange,
  label,
  dataTrailer,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  dataTrailer?: string;
}) {
  const p = (value / MAX_WEIGHT) * 100;
  return (
    <div className="relative flex h-11 items-center" data-trailer={dataTrailer}>
      <div className="pointer-events-none absolute inset-x-0 h-2 rounded-full border border-line bg-subtle" />
      <div
        className="pointer-events-none absolute left-0 h-2 rounded-full bg-accent transition-[width] duration-75"
        style={{ width: `calc(${p}% + ${(0.5 - p / 100) * 24}px)` }}
      />
      <input
        type="range"
        min={0}
        max={MAX_WEIGHT}
        step={1}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          'relative h-11 w-full cursor-pointer appearance-none bg-transparent outline-none',
          '[&::-webkit-slider-runnable-track]:h-11 [&::-webkit-slider-runnable-track]:bg-transparent',
          '[&::-webkit-slider-thumb]:mt-[10px] [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-accent [&::-webkit-slider-thumb]:bg-card [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform active:[&::-webkit-slider-thumb]:scale-110',
          '[&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-accent [&::-moz-range-thumb]:bg-card [&::-moz-range-thumb]:shadow-md',
          'focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-accent/25',
        )}
      />
    </div>
  );
}

/* ---------- Stepper de puntos ---------- */
function PointsStepper({ value, onChange, tier }: { value: number; onChange: (v: number) => void; tier: string }) {
  const { t } = useT();
  const clamp = (v: number) => Math.max(0, Math.min(MAX_POINTS, Math.round(v)));
  return (
    <div className="flex shrink-0 items-center rounded-full border border-line-strong bg-card">
      <button
        type="button"
        aria-label={t('scoring.dec', { tier })}
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= 0}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink2 transition hover:bg-subtle hover:text-ink disabled:opacity-30"
      >
        <Minus size={15} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={MAX_POINTS}
        value={value}
        aria-label={t('scoring.pointsAria', { tier })}
        onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
        className="num h-11 w-10 bg-transparent text-center text-sm text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label={t('scoring.inc', { tier })}
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= MAX_POINTS}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink2 transition hover:bg-subtle hover:text-ink disabled:opacity-30"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

/* ---------- Card de variable ---------- */
function RuleCard({
  rule,
  index,
  totalWeight,
  onWeight,
  onPoints,
}: {
  rule: ScoreRule;
  index: number;
  totalWeight: number;
  onWeight: (w: number) => void;
  onPoints: (tierKey: string, pts: number) => void;
}) {
  const { t, b } = useT();
  const pct = totalWeight ? Math.round((rule.weight / totalWeight) * 100) : 0;
  const maxPts = Math.max(...rule.tiers.map((x) => x.points), 0);
  const name = b(rule.label);
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="num inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[13px] text-accent">
            {index + 1}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold text-ink">{name}</div>
            <div className="text-xs text-muted">{t('scoring.maxPts', { n: maxPts })}</div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="num text-[26px] leading-none text-ink">
            {pct}
            <span className="text-base text-muted">%</span>
          </div>
          <div className="mt-1 text-[11px] text-muted">{t('scoring.normalizedLabel')}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="kpi-label">{t('scoring.weight')}</span>
          <span className="num text-ink2">{t('scoring.normalized', { raw: rule.weight, pct })}</span>
        </div>
        <WeightSlider
          value={rule.weight}
          onChange={onWeight}
          label={t('scoring.weightAria', { name })}
          dataTrailer={rule.id === 'capital' ? 'slider-capital' : undefined}
        />
        {rule.weight === 0 && <div className="text-xs text-warn">{t('scoring.zeroWeight')}</div>}
      </div>

      <div className="mt-3 border-t border-line pt-3">
        <div className="kpi-label mb-2">{t('scoring.tiers')}</div>
        <ul className="divide-y divide-line">
          {rule.tiers.map((tier) => {
            const label = b(tier.label);
            return (
              <li key={tier.key} className="flex items-center gap-3 py-1.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-ink">{label}</div>
                  <div className="mt-1 h-1 w-full max-w-[160px] overflow-hidden rounded-full bg-subtle">
                    <div
                      className="h-full rounded-full bg-accent/60 transition-[width] duration-300"
                      style={{ width: `${maxPts ? (tier.points / maxPts) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <PointsStepper value={tier.points} tier={label} onChange={(v) => onPoints(tier.key, v)} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default function Scoring() {
  const { t, b, lang } = useT();
  const navigate = useNavigate();
  const leads = useApp((s) => s.leads);
  const rules = useApp((s) => s.rules);
  const setRules = useApp((s) => s.setRules);
  const [draft, setDraft] = useState<ScoreRule[]>(rules);

  const dirty = !sameRules(draft, rules);
  const totalWeight = draft.reduce((s, r) => s + r.weight, 0);

  const ranking = useMemo(
    () =>
      leads
        .filter((l) => l.stage !== 'cerrado')
        .map((l) => {
          const score = computeScore(l, draft);
          return { lead: l, score, delta: score - computeScore(l, DEFAULT_RULES) };
        })
        .sort((a, z) => z.score - a.score || a.lead.id.localeCompare(z.lead.id))
        .slice(0, 10),
    [leads, draft],
  );

  const setWeight = (id: ScoreRule['id'], weight: number) =>
    setDraft((d) => d.map((r) => (r.id === id ? { ...r, weight } : r)));
  const setPoints = (id: ScoreRule['id'], key: string, points: number) =>
    setDraft((d) =>
      d.map((r) => (r.id === id ? { ...r, tiers: r.tiers.map((x) => (x.key === key ? { ...x, points } : x)) } : r)),
    );

  const save = () => {
    setRules(draft);
    useApp.getState().toast(tr('scoring.toastSaved', lang, { n: leads.length }));
  };
  const restore = () => {
    setDraft(DEFAULT_RULES);
    useApp.getState().toast(tr('scoring.toastRestored', lang), 'info');
  };

  const actions = (
    <>
      <button type="button" onClick={restore} className="btn-secondary">
        <RotateCcw size={15} />
        {t('scoring.restore')}
      </button>
      <button type="button" onClick={save} className="btn-primary">
        <Save size={15} />
        {t('scoring.save')}
      </button>
    </>
  );

  return (
    <div>
      <PageHeader
        kicker={t('kicker.admin')}
        title={t('scoring.title')}
        subtitle={t('scoring.subtitle')}
        actions={<div className="hidden flex-wrap gap-2 lg:flex">{actions}</div>}
      />
      <PreviewBanner bullets={[t('scoring.bannerA'), t('scoring.bannerB'), t('scoring.bannerC')]} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 rounded-ctl border border-accent/20 bg-accent-soft/60 px-3 py-2 text-[13px] text-ink2">
          <Info size={15} className="mt-0.5 shrink-0 text-accent" />
          <span>{t('scoring.note')}</span>
        </div>
        <span
          className={cn(
            'pill self-start sm:self-auto',
            dirty ? 'bg-warn/10 text-warn' : 'border border-line bg-subtle text-ink2',
          )}
          aria-live="polite"
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', dirty ? 'bg-warn' : 'bg-ok')} />
          {dirty ? t('scoring.unsaved') : t('scoring.synced')}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Reglas */}
        <section className="min-w-0 lg:col-span-7">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="section-title">{t('scoring.variables')}</h2>
            <span className="num text-xs text-muted">
              {t('scoring.variablesSub', { n: draft.length, sum: totalWeight })}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {draft.map((r, i) => (
              <RuleCard
                key={r.id}
                rule={r}
                index={i}
                totalWeight={totalWeight}
                onWeight={(w) => setWeight(r.id, w)}
                onPoints={(k, p) => setPoints(r.id, k, p)}
              />
            ))}
          </div>
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-muted">{t('scoring.formula')}</p>
        </section>

        {/* Ranking */}
        <section className="min-w-0 lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <div className="lg:card lg:p-5">
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <div>
                  <h2 className="section-title">{t('scoring.ranking')}</h2>
                  <div className="text-xs text-muted">{t('scoring.rankingSub')}</div>
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted">{t('scoring.vsDefault')}</span>
              </div>
              {ranking.length === 0 ? (
                <div className="rounded-card border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
                  {t('scoring.emptyRank')}
                </div>
              ) : (
                <ol className="flex flex-col gap-2 lg:gap-1">
                  {ranking.map(({ lead, score, delta }, i) => (
                    <motion.li
                      key={lead.id}
                      layout
                      transition={{ type: 'spring', stiffness: 520, damping: 40, mass: 0.8 }}
                      className="list-none"
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/crm/${lead.id}`)}
                        aria-label={t('scoring.openLead', { name: lead.name })}
                        className={cn(
                          'group flex min-h-[56px] w-full items-center gap-3 px-3 py-2.5 text-left transition',
                          'card lg:rounded-ctl lg:border-transparent lg:bg-transparent lg:shadow-none lg:hover:bg-subtle',
                        )}
                      >
                        <span
                          className={cn(
                            'num inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px]',
                            i < 3 ? 'bg-brand text-brand-fg' : 'bg-subtle text-ink2',
                          )}
                        >
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink">{lead.name}</span>
                          <span className="block truncate text-xs text-muted">
                            {brandById(lead.brandId)?.name} · {lead.city}
                          </span>
                        </span>
                        <span
                          className={cn(
                            'num inline-flex w-12 shrink-0 items-center justify-end gap-0.5 text-[12px]',
                            delta > 0 ? 'text-ok' : delta < 0 ? 'text-danger' : 'text-muted',
                          )}
                        >
                          {delta > 0 ? <ArrowUp size={12} /> : delta < 0 ? <ArrowDown size={12} /> : null}
                          {delta === 0 ? t('scoring.same') : Math.abs(delta)}
                        </span>
                        <ScoreBadge score={score} />
                        <ChevronRight size={16} className="shrink-0 text-muted transition group-hover:text-ink" />
                      </button>
                    </motion.li>
                  ))}
                </ol>
              )}
              <div className="mt-3 hidden text-[11px] text-muted lg:block">
                {draft.map((r) => `${b(r.label).split(' (')[0]} ${totalWeight ? Math.round((r.weight / totalWeight) * 100) : 0}%`).join(' · ')}
              </div>
            </div>
          </div>
        </section>
      </div>

      <FixedBottomBar>
        <button type="button" onClick={restore} className="btn-secondary flex-1 px-3">
          <RotateCcw size={15} />
          {t('scoring.restore')}
        </button>
        <button type="button" onClick={save} className="btn-primary flex-1 px-3">
          <Save size={15} />
          {t('scoring.save')}
        </button>
      </FixedBottomBar>
    </div>
  );
}
