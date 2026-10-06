import type { Proposal, ProposalStatus, ProposalVersion } from '@/types';
import { initialLeads } from './leads';
import { buildDraft, defaultQuestionnaire, type TemplateId } from '@/lib/proposalTemplate';

type Row = [id: string, leadId: string, status: ProposalStatus, versions: number, daysAgo: number, template: TemplateId];

const rows: Row[] = [
  ['P-014', 'L-005', 'enviada', 1, 9, 'llave'],
  ['P-013', 'L-021', 'enviada', 2, 4, 'llave'],
  ['P-012', 'L-004', 'enviada', 1, 3, 'llave'],
  ['P-011', 'L-012', 'enviada', 1, 5, 'llave'],
  ['P-010', 'L-008', 'borrador', 1, 1, 'llave'],
  ['P-009', 'L-003', 'borrador', 1, 12, 'llave'],
  ['P-008', 'L-010', 'enviada', 3, 2, 'llave'],
  ['P-007', 'L-018', 'enviada', 2, 6, 'master'],
  ['P-006', 'L-026', 'enviada', 2, 8, 'llave'],
  ['P-005', 'L-019', 'rechazada', 1, 21, 'llave'],
  ['P-004', 'L-002', 'aceptada', 3, 96, 'llave'],
  ['P-003', 'L-013', 'aceptada', 2, 88, 'llave'],
  ['P-002', 'L-020', 'aceptada', 2, 130, 'llave'],
  ['P-001', 'L-028', 'aceptada', 1, 122, 'master'],
];

const changes: [string, string][] = [
  ['Primera versión generada desde el cuestionario.', 'First version generated from the questionnaire.'],
  ['Ajuste de la inversión estimada y del cronograma.', 'Adjusted estimated investment and timeline.'],
  ['Cambio de ubicación sugerida tras visita al shopping.', 'Changed suggested location after mall visit.'],
];

export const initialProposals: Proposal[] = rows.map(([id, leadId, status, nv, daysAgo, template]) => {
  const lead = initialLeads.find((l) => l.id === leadId)!;
  const versions: ProposalVersion[] = Array.from({ length: nv }, (_, i) => {
    const q = defaultQuestionnaire(lead);
    if (i === 1) q.roiMonths = q.roiMonths - 4;
    if (i === 2) q.zone = q.zone === 'Shopping Eldorado' ? 'Shopping Villa-Lobos' : 'Shopping Eldorado';
    const es = buildDraft(lead, q, template, 'es');
    const en = buildDraft(lead, q, template, 'en');
    return {
      version: i + 1,
      daysAgo: daysAgo + (nv - 1 - i) * 3,
      authorId: lead.ownerId,
      summary: changes[i],
      sections: es.map((s, j) => ({ title: [s.title, en[j].title], body: [s.body, en[j].body] })),
    };
  });
  return { id, leadId, brandId: lead.brandId, template, status, daysAgo, versions };
});
