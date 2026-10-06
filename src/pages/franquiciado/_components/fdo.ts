import { differenceInCalendarDays } from 'date-fns';
import { units } from '@/data/units';

/** Unidad del franquiciado demo (Rafael Souza · Pampa Burger Eldorado) */
export const FDO_UNIT_ID = 'U-04';
export const FDO_NAME = 'Rafael Souza';
export const FDO_FIRST = 'Rafael';
export const FDO_COLOR = '#0a7d4f';

export const fdoUnit = () => units.find((u) => u.id === FDO_UNIT_ID) ?? units[0];

export const openingDate = () => new Date(fdoUnit().openingDate);

export const daysToOpening = () => Math.max(0, differenceInCalendarDays(openingDate(), new Date()));

/** Hora actual HH:mm */
export const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** Días hasta el próximo día 5 (0 = vence hoy) */
export const daysToNextDue = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let due = new Date(now.getFullYear(), now.getMonth(), 5);
  if (today > due) due = new Date(now.getFullYear(), now.getMonth() + 1, 5);
  return { days: differenceInCalendarDays(due, today), due };
};
