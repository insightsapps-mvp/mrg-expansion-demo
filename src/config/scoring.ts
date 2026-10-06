/**
 * REGLAS DE SCORING — archivo único para reemplazar las variables definitivas de MRG.
 * Cada variable tiene un peso (0–40) y tramos con puntos. El score final se normaliza a 100:
 *   score = Σ (puntosTramo / maxPuntosVariable) × peso  ×  100 / Σ pesos
 * Con los pesos default (30/25/25/20 = 100) el score es la suma directa de puntos.
 */
import type { Lead, ScoreRule, Sector } from '@/types';
import { brands } from '@/data/brands';

export const DEFAULT_RULES: ScoreRule[] = [
  {
    id: 'capital',
    label: ['Capital disponible (R$)', 'Available capital (R$)'],
    weight: 30,
    tiers: [
      { key: 'lt300', label: ['Menos de R$ 300k', 'Under R$ 300k'], points: 5 },
      { key: '300to600', label: ['R$ 300k – 600k', 'R$ 300k – 600k'], points: 15 },
      { key: '600to1m', label: ['R$ 600k – 1M', 'R$ 600k – 1M'], points: 25 },
      { key: 'gt1m', label: ['Más de R$ 1M', 'Over R$ 1M'], points: 30 },
    ],
  },
  {
    id: 'experience',
    label: ['Experiencia previa', 'Previous experience'],
    weight: 25,
    tiers: [
      { key: 'none', label: ['Sin experiencia', 'No experience'], points: 5 },
      { key: 'retail', label: ['Comercio (< 5 años)', 'Retail (< 5 years)'], points: 15 },
      { key: 'retail5', label: ['Comercio (5+ años)', 'Retail (5+ years)'], points: 21 },
      { key: 'food', label: ['Gastronomía propia', 'Own food business'], points: 22 },
      { key: 'franchise', label: ['Franquicia', 'Franchise'], points: 25 },
    ],
  },
  {
    id: 'location',
    label: ['Ubicación', 'Location'],
    weight: 25,
    tiers: [
      { key: 'outside', label: ['Fuera de SP', 'Outside SP'], points: 5 },
      { key: 'gsp', label: ['Gran São Paulo', 'Greater São Paulo'], points: 15 },
      { key: 'spcap', label: ['São Paulo capital', 'São Paulo city'], points: 20 },
      { key: 'prime', label: ['SP capital · zona prime', 'SP city · prime area'], points: 25 },
    ],
  },
  {
    id: 'sector',
    label: ['Rubro de interés', 'Industry of interest'],
    weight: 20,
    tiers: [
      { key: 'none', label: ['No coincide', 'No match'], points: 0 },
      { key: 'afin', label: ['Afín', 'Related'], points: 10 },
      { key: 'match', label: ['Coincide con la marca', 'Matches the brand'], points: 20 },
    ],
  },
];

const FOOD: Sector[] = ['hamburgueseria', 'panaderia', 'helados', 'cafeteria'];

export function capitalTier(capital: number) {
  if (capital > 1_000_000) return 'gt1m';
  if (capital >= 600_000) return '600to1m';
  if (capital >= 300_000) return '300to600';
  return 'lt300';
}

export function sectorTier(lead: Pick<Lead, 'sector' | 'brandId'>) {
  const brand = brands.find((b) => b.id === lead.brandId);
  if (!brand) return 'none';
  if (brand.sector === lead.sector) return 'match';
  if (FOOD.includes(brand.sector) && FOOD.includes(lead.sector)) return 'afin';
  if (brand.sector === 'indumentaria' && lead.sector === 'retail') return 'afin';
  return 'none';
}

export type ScoreInput = Pick<Lead, 'capital' | 'experience' | 'location' | 'sector' | 'brandId'>;

export interface ScoreBreakdownItem {
  id: ScoreRule['id'];
  label: ScoreRule['label'];
  tierKey: string;
  points: number; // aporte normalizado
  max: number; // máximo normalizado
}

export function scoreBreakdown(lead: ScoreInput, rules: ScoreRule[] = DEFAULT_RULES): ScoreBreakdownItem[] {
  const totalWeight = rules.reduce((s, r) => s + r.weight, 0) || 1;
  return rules.map((r) => {
    const tierKey =
      r.id === 'capital'
        ? capitalTier(lead.capital)
        : r.id === 'experience'
          ? lead.experience
          : r.id === 'location'
            ? lead.location
            : sectorTier(lead);
    const tier = r.tiers.find((t) => t.key === tierKey) ?? r.tiers[0];
    const maxPts = Math.max(...r.tiers.map((t) => t.points)) || 1;
    const max = (r.weight * 100) / totalWeight;
    return { id: r.id, label: r.label, tierKey, points: (tier.points / maxPts) * max, max };
  });
}

export function computeScore(lead: ScoreInput, rules: ScoreRule[] = DEFAULT_RULES): number {
  return Math.round(scoreBreakdown(lead, rules).reduce((s, b) => s + b.points, 0));
}

/** Score alto sin contacto por más de 7 días → lead en riesgo */
export const RISK_SCORE = 75;
export const RISK_DAYS = 7;
