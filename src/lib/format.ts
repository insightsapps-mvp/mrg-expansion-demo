import { format, formatDistanceToNowStrict, type Locale } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import type { Lang } from '@/types';

export const locale = (lang: Lang): Locale => (lang === 'es' ? es : enUS);

export const fmtBRL = (n: number) => 'R$ ' + Math.round(n).toLocaleString('pt-BR');

export const fmtBRLShort = (n: number) => {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`;
  if (n >= 1000) return `R$ ${Math.round(n / 1000)}k`;
  return fmtBRL(n);
};

export const fmtUSD = (n: number) => 'USD ' + n.toLocaleString('es-AR');

export const fmtNum = (n: number, lang: Lang) => n.toLocaleString(lang === 'es' ? 'es-AR' : 'en-US');

export const fmtDate = (d: Date | string, pattern: string, lang: Lang) =>
  format(typeof d === 'string' ? new Date(d) : d, pattern, { locale: locale(lang) });

export const fmtAgo = (daysAgo: number, lang: Lang) => {
  if (daysAgo <= 0) return lang === 'es' ? 'Hoy' : 'Today';
  if (daysAgo === 1) return lang === 'es' ? 'Ayer' : 'Yesterday';
  return lang === 'es' ? `Hace ${daysAgo} días` : `${daysAgo} days ago`;
};

export const fmtRelative = (d: Date, lang: Lang) =>
  formatDistanceToNowStrict(d, { locale: locale(lang), addSuffix: true });

export const daysAgoDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};
