import type { Interaction } from '@/types';
import { initialLeads } from './leads';

const specific: Interaction[] = [
  { id: 'i-1', leadId: 'L-001', daysAgo: 2, authorId: 'u-carlos', type: 'reunion', text: ['Reunión en la oficina de MRG (Av. Paulista). Confirmó capital de R$ 1,2M y preferencia por Shopping Eldorado. Pide la propuesta esta semana.', 'Meeting at MRG office (Av. Paulista). Confirmed R$ 1.2M capital and preference for Shopping Eldorado. Wants the proposal this week.'] },
  { id: 'i-2', leadId: 'L-001', daysAgo: 6, authorId: 'u-carlos', type: 'etapa', text: ['Movida a "Calificado" — score 92.', 'Moved to "Qualified" — score 92.'] },
  { id: 'i-3', leadId: 'L-001', daysAgo: 9, authorId: 'u-daniel', type: 'llamada', text: ['Llamada de 25 min. Tiene 8 años con un restaurante propio en Pinheiros. Le interesa el modelo llave en mano.', '25-min call. 8 years running her own restaurant in Pinheiros. Interested in the turnkey model.'] },
  { id: 'i-4', leadId: 'L-001', daysAgo: 14, authorId: 'u-daniel', type: 'mail', text: ['Envió el cuestionario de relevamiento completo.', 'Sent the completed discovery questionnaire.'] },
  { id: 'i-5', leadId: 'L-001', daysAgo: 34, authorId: 'u-carlos', type: 'nota', text: ['Lead captado en la Feria ABF Franchising Expo São Paulo, stand de Pampa Burger.', 'Lead captured at ABF Franchising Expo São Paulo, Pampa Burger booth.'] },
  { id: 'i-6', leadId: 'L-005', daysAgo: 9, authorId: 'u-carlos', type: 'mail', text: ['Se envió propuesta v1 para Shopping Ibirapuera. Sin respuesta desde entonces.', 'Proposal v1 sent for Shopping Ibirapuera. No reply since then.'] },
  { id: 'i-7', leadId: 'L-005', daysAgo: 15, authorId: 'u-carlos', type: 'reunion', text: ['Visita guiada al local de Pampa Burger Ibirapuera.', 'Guided visit to Pampa Burger Ibirapuera.'] },
  { id: 'i-8', leadId: 'L-003', daysAgo: 11, authorId: 'u-daniel', type: 'llamada', text: ['Pidió información de la unidad de Mooca Plaza. Quedamos en volver a llamar.', 'Asked about the Mooca Plaza unit. We agreed to call back.'] },
  { id: 'i-9', leadId: 'L-006', daysAgo: 8, authorId: 'u-marcelo', type: 'whatsapp', text: ['Primer contacto por WhatsApp. Interesada en helados artesanales para el ABC paulista.', 'First WhatsApp contact. Interested in artisan ice cream for the ABC region.'] },
  { id: 'i-10', leadId: 'L-002', daysAgo: 1, authorId: 'u-paula', type: 'nota', text: ['Obra del local en Eldorado al 60%. Contratación de personal en curso.', 'Eldorado store build-out at 60%. Staff hiring in progress.'] },
];

const generic: [Interaction['type'], [string, string]][] = [
  ['llamada', ['Llamada de calificación: revisamos capital y zona de interés.', 'Qualification call: reviewed capital and preferred area.']],
  ['mail', ['Se envió el dossier de la marca y el cuestionario de relevamiento.', 'Sent the brand dossier and the discovery questionnaire.']],
  ['nota', ['Ingresó por formulario / feria. Pendiente primer contacto.', 'Came in via form / trade show. First contact pending.']],
];

export const initialInteractions: Interaction[] = [
  ...specific,
  ...initialLeads
    .filter((l) => !specific.some((s) => s.leadId === l.id))
    .flatMap((l, i) =>
      generic.slice(0, 2 + (i % 2)).map((g, j) => ({
        id: `ig-${l.id}-${j}`,
        leadId: l.id,
        daysAgo: j === 0 ? l.lastContactDays : l.lastContactDays + j * 5,
        authorId: l.ownerId,
        type: g[0],
        text: g[1],
      })),
    ),
];
