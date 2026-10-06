import type { Bi } from '@/types';

/** Mapas {valor interno → [es, en]}. El valor interno nunca cambia. */
export const ENUMS = {
  stage: {
    nuevo: ['Nuevo', 'New'],
    contactado: ['Contactado', 'Contacted'],
    calificado: ['Calificado', 'Qualified'],
    propuesta: ['Propuesta enviada', 'Proposal sent'],
    negociacion: ['Negociación', 'Negotiation'],
    cerrado: ['Cerrado', 'Closed'],
  },
  proposalStatus: {
    borrador: ['Borrador', 'Draft'],
    enviada: ['Enviada', 'Sent'],
    aceptada: ['Aceptada', 'Accepted'],
    rechazada: ['Rechazada', 'Rejected'],
  },
  eventType: {
    reunion: ['Reunión', 'Meeting'],
    llamada: ['Llamada', 'Call'],
    vencimiento: ['Vencimiento', 'Deadline'],
    visita: ['Visita a shopping', 'Mall visit'],
  },
  taskStatus: {
    pendiente: ['Pendiente', 'To do'],
    curso: ['En curso', 'In progress'],
    revision: ['En revisión', 'In review'],
    hecho: ['Hecho', 'Done'],
  },
  taskTag: {
    legal: ['Legal', 'Legal'],
    shopping: ['Shopping', 'Mall'],
    rrhh: ['RRHH', 'HR'],
    obra: ['Obra', 'Build-out'],
    marketing: ['Marketing', 'Marketing'],
  },
  projectStatus: {
    tiempo: ['En tiempo', 'On track'],
    riesgo: ['En riesgo', 'At risk'],
    atrasado: ['Atrasado', 'Delayed'],
  },
  unitStatus: {
    abierta: ['Abierta', 'Open'],
    apertura: ['En apertura', 'Opening'],
    atrasada: ['Apertura atrasada', 'Opening delayed'],
  },
  brandStatus: {
    operando: ['Operando', 'Operating'],
    expansion: ['En expansión', 'Expanding'],
    softlanding: ['Softlanding', 'Softlanding'],
  },
  interaction: {
    llamada: ['Llamada', 'Call'],
    mail: ['Mail', 'Email'],
    reunion: ['Reunión', 'Meeting'],
    nota: ['Nota', 'Note'],
    whatsapp: ['WhatsApp', 'WhatsApp'],
    etapa: ['Cambio de etapa', 'Stage change'],
  },
  origin: {
    feria: ['Feria de franquicias', 'Franchise fair'],
    web: ['Formulario web', 'Web form'],
    csv: ['Importación CSV', 'CSV import'],
    referido: ['Referido', 'Referral'],
    linkedin: ['LinkedIn', 'LinkedIn'],
  },
  sector: {
    hamburgueseria: ['Hamburguesería', 'Burgers'],
    panaderia: ['Panadería', 'Bakery'],
    indumentaria: ['Indumentaria', 'Apparel'],
    helados: ['Heladería', 'Ice cream'],
    cafeteria: ['Cafetería', 'Coffee shop'],
    retail: ['Retail general', 'General retail'],
  },
  experience: {
    none: ['Sin experiencia', 'No experience'],
    retail: ['Comercio (< 5 años)', 'Retail (< 5 yrs)'],
    retail5: ['Comercio (5+ años)', 'Retail (5+ yrs)'],
    food: ['Gastronomía propia', 'Own food business'],
    franchise: ['Franquicia', 'Franchise'],
  },
  location: {
    outside: ['Fuera de SP', 'Outside SP'],
    gsp: ['Gran São Paulo', 'Greater São Paulo'],
    spcap: ['São Paulo capital', 'São Paulo city'],
    prime: ['SP capital · zona prime', 'SP city · prime area'],
  },
  role: {
    admin: ['Admin MRG', 'MRG Admin'],
    franquiciante: ['Franquiciante', 'Franchisor'],
    franquiciado: ['Franquiciado', 'Franchisee'],
    equipo: ['Equipo de proyecto', 'Project team'],
  },
} satisfies Record<string, Record<string, Bi>>;

export type EnumName = keyof typeof ENUMS;
