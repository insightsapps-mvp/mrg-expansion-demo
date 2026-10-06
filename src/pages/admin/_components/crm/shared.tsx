import { useEffect, useState } from 'react';
import type { Lead, ScoreRule } from '@/types';
import { RISK_DAYS, RISK_SCORE, scoreBreakdown, type ScoreInput } from '@/config/scoring';
import { useT } from '@/i18n';
import { Progress } from '@/components/ui';
import { cn } from '@/lib/utils';

/** true si el viewport es ≥ 1024px */
export function useIsDesktop() {
  const query = '(min-width: 1024px)';
  const [match, setMatch] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : true));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return match;
}

export const isAtRisk = (score: number, lead: Pick<Lead, 'lastContactDays'>) =>
  score >= RISK_SCORE && lead.lastContactDays > RISK_DAYS;

/** Texto "N días sin contacto" */
export function useDaysLabel() {
  const { t } = useT();
  return (n: number) =>
    n <= 0 ? t('crm.contactToday') : n === 1 ? t('crm.dayNoContact') : t('crm.daysNoContact', { n });
}

/** Próximos N ids correlativos L-0XX */
export function nextLeadIds(leads: Lead[], n: number) {
  const max = leads.reduce((m, l) => {
    const num = parseInt(l.id.replace(/\D/g, ''), 10);
    return Number.isFinite(num) && num > m ? num : m;
  }, 0);
  return Array.from({ length: n }, (_, i) => `L-${String(max + 1 + i).padStart(3, '0')}`);
}

/** Barras horizontales del desglose de score */
export function ScoreBars({ input, rules, showTier = true, compact }: { input: ScoreInput; rules: ScoreRule[]; showTier?: boolean; compact?: boolean }) {
  const { b } = useT();
  const items = scoreBreakdown(input, rules);
  return (
    <ul className={cn('flex flex-col', compact ? 'gap-2.5' : 'gap-4')}>
      {items.map((it) => {
        const rule = rules.find((r) => r.id === it.id);
        const tier = rule?.tiers.find((x) => x.key === it.tierKey);
        const pct = it.max ? (it.points / it.max) * 100 : 0;
        return (
          <li key={it.id} className="min-w-0">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className={cn('min-w-0 truncate font-medium text-ink', compact ? 'text-xs' : 'text-[13px]')}>{b(it.label)}</span>
              <span className={cn('num shrink-0 text-ink', compact ? 'text-xs' : 'text-[13px] font-semibold')}>
                {Math.round(it.points)}/{Math.round(it.max)}
              </span>
            </div>
            <Progress value={pct} tone={pct >= 75 ? 'accent' : pct >= 40 ? 'warn' : 'danger'} className={compact ? 'h-1.5' : undefined} />
            {showTier && tier && <div className="mt-1 truncate text-xs text-muted">{b(tier.label)}</div>}
          </li>
        );
      })}
    </ul>
  );
}
