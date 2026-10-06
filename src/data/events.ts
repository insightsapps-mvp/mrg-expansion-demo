import type { CalendarEvent, EventType } from '@/types';

type Row = [dayRef: number | string, hour: number, min: number, dur: number, type: EventType, title: [string, string], owner: string, link?: { leadId?: string; brandId?: string; projectId?: string }, location?: string];

/**
 * dayRef numérico = día del mes; string "+N" = N días desde hoy (para "Esta semana").
 * Todas las fechas quedan dentro del mes actual.
 */
const rows: Row[] = [
  ['+0', 10, 0, 60, 'reunion', ['Revisión de propuesta · Juliana Costa', 'Proposal review · Juliana Costa'], 'u-carlos', { leadId: 'L-001' }, 'Oficina MRG · Av. Paulista'],
  ['+0', 16, 30, 30, 'llamada', ['Seguimiento · Bruno Almeida', 'Follow-up · Bruno Almeida'], 'u-carlos', { leadId: 'L-005' }],
  ['+1', 11, 0, 90, 'visita', ['Visita a Morumbi Shopping · Pampa Burger', 'Morumbi Shopping visit · Pampa Burger'], 'u-marcelo', { projectId: 'pampa-morumbi', brandId: 'pampa' }, 'Morumbi Shopping'],
  ['+2', 15, 0, 45, 'llamada', ['Llamada · Larissa Ribeiro', 'Call · Larissa Ribeiro'], 'u-marcelo', { leadId: 'L-006' }],
  ['+3', 9, 30, 60, 'vencimiento', ['Vence firma de locación · Mate & Co', 'Lease signing due · Mate & Co'], 'u-marcelo', { projectId: 'mate-villalobos', brandId: 'mate' }],
  [2, 10, 0, 60, 'reunion', ['Kick-off Medialunas del Sur Villa-Lobos', 'Kick-off Medialunas del Sur Villa-Lobos'], 'u-paula', { brandId: 'medialunas', projectId: 'medialunas-villalobos' }],
  [3, 14, 0, 30, 'llamada', ['Primer contacto · Lucas Carvalho', 'First contact · Lucas Carvalho'], 'u-daniel', { leadId: 'L-009' }],
  [5, 9, 0, 30, 'vencimiento', ['Carga mensual de franquiciados', 'Franchisee monthly report due'], 'u-paula', {}],
  [7, 11, 0, 60, 'reunion', ['Negociación · Mariana Gomes', 'Negotiation · Mariana Gomes'], 'u-daniel', { leadId: 'L-010' }],
  [8, 15, 0, 90, 'visita', ['Visita de obra · Pampa Burger Eldorado', 'Site visit · Pampa Burger Eldorado'], 'u-paula', { projectId: 'pampa-eldorado', brandId: 'pampa' }, 'Shopping Eldorado'],
  [9, 10, 30, 45, 'llamada', ['Llamada · Thiago Oliveira', 'Call · Thiago Oliveira'], 'u-daniel', { leadId: 'L-003' }],
  [10, 16, 0, 60, 'reunion', ['Comité mensual con Lucía Benítez (Pampa Burger)', 'Monthly committee with Lucía Benítez (Pampa Burger)'], 'u-carlos', { brandId: 'pampa' }],
  [12, 11, 0, 90, 'visita', ['Recorrida Shopping Iguatemi · Heladería Nahuel', 'Iguatemi walkthrough · Heladería Nahuel'], 'u-marcelo', { brandId: 'nahuel', projectId: 'nahuel-iguatemi' }, 'Shopping Iguatemi'],
  [13, 14, 30, 30, 'llamada', ['Seguimiento · Camila Ferreira', 'Follow-up · Camila Ferreira'], 'u-daniel', { leadId: 'L-004' }],
  [14, 10, 0, 60, 'reunion', ['Presentación de propuesta · Matías Fernández', 'Proposal presentation · Matías Fernández'], 'u-carlos', { leadId: 'L-021' }],
  [15, 18, 0, 30, 'vencimiento', ['Vence registro de marca INPI · Nahuel', 'INPI trademark deadline · Nahuel'], 'u-diego', { brandId: 'nahuel', projectId: 'nahuel-iguatemi' }],
  [16, 11, 0, 60, 'reunion', ['Revisión de layout · Lino & Algodón', 'Layout review · Lino & Algodón'], 'u-paula', { brandId: 'lino', projectId: 'lino-ibirapuera' }],
  [18, 15, 0, 45, 'llamada', ['Llamada · Gabriela Teixeira', 'Call · Gabriela Teixeira'], 'u-marcelo', { leadId: 'L-018' }],
  [19, 10, 0, 120, 'visita', ['Visita Shopping Villa-Lobos · Mate & Co', 'Villa-Lobos visit · Mate & Co'], 'u-marcelo', { brandId: 'mate', projectId: 'mate-villalobos' }, 'Shopping Villa-Lobos'],
  [21, 9, 30, 60, 'reunion', ['Diagnóstico · nueva marca (Market Discovery)', 'Diagnosis · new brand (Market Discovery)'], 'u-daniel', {}],
  [22, 14, 0, 30, 'llamada', ['Seguimiento · Fernanda Lima', 'Follow-up · Fernanda Lima'], 'u-carlos', { leadId: 'L-008' }],
  [23, 17, 0, 30, 'vencimiento', ['Vence propuesta · Beatriz Rocha', 'Proposal expires · Beatriz Rocha'], 'u-marcelo', { leadId: 'L-012' }],
  [26, 11, 0, 60, 'reunion', ['Capacitación Pampa Burger · equipo Eldorado', 'Pampa Burger training · Eldorado team'], 'u-ana', { projectId: 'pampa-eldorado', brandId: 'pampa' }],
  [27, 15, 30, 45, 'llamada', ['Llamada · Débora Pinto', 'Call · Débora Pinto'], 'u-daniel', { leadId: 'L-026' }],
  [28, 10, 0, 90, 'visita', ['Visita Center Norte · revisión de ventas', 'Center Norte visit · sales review'], 'u-carlos', { brandId: 'pampa' }, 'Center Norte'],
];

function resolve(dayRef: number | string, hour: number, min: number) {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  let day: number;
  if (typeof dayRef === 'string') day = Math.min(last, now.getDate() + Number(dayRef.slice(1)));
  else day = Math.min(last, dayRef);
  return new Date(now.getFullYear(), now.getMonth(), day, hour, min).toISOString();
}

export const initialEvents: CalendarEvent[] = rows.map((r, i) => ({
  id: `E-${String(i + 1).padStart(2, '0')}`,
  date: resolve(r[0], r[1], r[2]),
  durationMin: r[3],
  type: r[4],
  title: r[5],
  ownerId: r[6],
  ...(r[7] ?? {}),
  location: r[8],
  reminder: i % 3 === 0,
}));
