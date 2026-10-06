import { useEffect, useState } from 'react';
import { units } from '@/data/units';
import type { Lang, Unit } from '@/types';

export const BRAND_ID = 'pampa';

/** Unidades de la marca del franquiciante (solo Pampa Burger) */
export const brandUnits: Unit[] = units.filter((u) => u.brandId === BRAND_ID);
export const openUnits: Unit[] = brandUnits.filter((u) => u.status === 'abierta');
export const openingUnits: Unit[] = brandUnits.filter((u) => u.status !== 'abierta');

export const UNIT_COLORS = ['var(--accent)', 'var(--accent-strong)', 'var(--chart-2)'];

/** Nombre corto de la unidad (sin el nombre de la marca) */
export const shortName = (u: Unit) => u.name.replace(/^Pampa Burger\s+/, '');

/** Fecha (día 1) del mes correspondiente al índice 0..5 del array de revenue (5 = mes actual) */
export const monthDate = (idx: number, len = 6) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - (len - 1 - idx));
  return d;
};

export const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);
export const sumLast = (a: number[], n: number) => sum(a.slice(-n));
/** Suma del bloque de n meses inmediatamente anterior a los últimos n */
export const sumPrev = (a: number[], n: number) => sum(a.slice(Math.max(0, a.length - 2 * n), a.length - n));

export const pctChange = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : 0);

export const fmtPct = (n: number, lang: Lang, sign = true) =>
  (sign && n > 0 ? '+' : '') +
  n.toLocaleString(lang === 'es' ? 'es-AR' : 'en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) +
  '%';

export const avgTicket = (rev: number, tickets: number) => (tickets ? rev / tickets : 0);
export const fmtTicket = (rev: number, tickets: number) =>
  tickets ? 'R$ ' + avgTicket(rev, tickets).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

export const fmtInt = (n: number) => Math.round(n).toLocaleString('pt-BR');

/** true en ≥ lg (1024px) */
export function useIsDesktop() {
  const q = '(min-width: 1024px)';
  const [v, setV] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(q).matches : true));
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setV(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return v;
}

export const unitTone = (u: Unit): 'ok' | 'warn' | 'danger' => (u.status === 'abierta' ? 'ok' : u.status === 'atrasada' ? 'danger' : 'warn');
