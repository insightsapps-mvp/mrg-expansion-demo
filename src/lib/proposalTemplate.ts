/**
 * Motor de plantillas de propuestas MRG. En la demo, el "borrador IA" se arma interpolando las
 * respuestas del cuestionario sobre la plantilla. Al desarrollar se reemplaza por un LLM.
 */
import type { Lang, Lead } from '@/types';
import { brandById } from '@/data/brands';
import { fmtBRL } from './format';

export interface Questionnaire {
  capital: number;
  timeline: '3' | '6' | '12';
  zone: string;
  partners: 'solo' | 'socios';
  foodYears: number;
  sqm: number;
  roiMonths: number;
  premises: 'shopping' | 'propio';
}

export type TemplateId = 'llave' | 'master';

export const defaultQuestionnaire = (lead: Lead): Questionnaire => ({
  capital: lead.capital,
  timeline: lead.capital > 1_000_000 ? '6' : '12',
  zone: lead.desiredZone,
  partners: lead.id === 'L-001' ? 'socios' : 'solo',
  foodYears: lead.experienceYears,
  sqm: lead.capital > 1_000_000 ? 120 : 80,
  roiMonths: lead.capital > 1_000_000 ? 30 : 36,
  premises: 'shopping',
});

export interface DraftSection {
  id: string;
  title: string;
  body: string;
}

const L = (lang: Lang, es: string, en: string) => (lang === 'es' ? es : en);

export function buildDraft(lead: Lead, q: Questionnaire, template: TemplateId, lang: Lang): DraftSection[] {
  const brand = brandById(lead.brandId);
  const first = lead.name.split(' ')[0];
  const premium = q.capital >= 1_000_000;
  const mall = q.zone || (premium ? 'Shopping Eldorado' : 'Shopping Villa-Lobos');
  const alt = mall === 'Shopping Eldorado' ? 'Shopping Villa-Lobos' : 'Shopping Eldorado';
  const invest = Math.round((premium ? 0.78 : 0.85) * q.capital / 10_000) * 10_000;
  const fee = Math.round(invest * 0.12 / 1000) * 1000;
  const works = Math.round(invest * 0.46 / 1000) * 1000;
  const equip = Math.round(invest * 0.24 / 1000) * 1000;
  const capitalWork = invest - fee - works - equip;
  const months = Number(q.timeline);
  const partnersTxt =
    q.partners === 'socios'
      ? L(lang, 'junto con sus socios', 'together with partners')
      : L(lang, 'como operador único', 'as sole operator');

  const sections: DraftSection[] = [
    {
      id: 'resumen',
      title: L(lang, '1. Resumen del candidato', '1. Candidate summary'),
      body: L(
        lang,
        `${lead.name} (${lead.city}) se presenta ${partnersTxt} con un capital disponible de ${fmtBRL(q.capital)} y ${q.foodYears} años de experiencia en gastronomía y comercio. Busca abrir en un plazo de ${months} meses, en un local de ~${q.sqm} m² ${q.premises === 'shopping' ? 'dentro de un shopping' : 'en un local propio a la calle'}, con una expectativa de recupero de la inversión de ${q.roiMonths} meses. Su perfil obtiene un score MRG de calificación alto, lo que lo ubica entre los candidatos prioritarios de ${brand.name}.`,
        `${lead.name} (${lead.city}) applies ${partnersTxt} with available capital of ${fmtBRL(q.capital)} and ${q.foodYears} years of food & retail experience. The goal is to open within ${months} months, in a ~${q.sqm} m² space ${q.premises === 'shopping' ? 'inside a shopping mall' : 'in a street-level location'}, expecting payback in ${q.roiMonths} months. The profile earns a high MRG qualification score, placing ${first} among ${brand.name}'s priority candidates.`,
      ),
    },
    {
      id: 'marca',
      title: L(lang, `2. Por qué ${brand.name} en São Paulo`, `2. Why ${brand.name} in São Paulo`),
      body: L(
        lang,
        `${brand.name} llega desde ${brand.origin} con un formato probado y ${brand.id === 'pampa' ? '3 unidades ya operando en São Paulo (Ibirapuera, Center Norte y Villa-Lobos), con una facturación promedio de R$ 162.000 por mes' : 'un concepto con alta afinidad con el consumidor paulista'}. El público de shopping en la capital valora las marcas argentinas por calidad y experiencia, y el segmento de ${brand.sectorLabel[0].toLowerCase()} mantiene crecimiento sostenido. MRG ya conoce la operación de la marca en Brasil, lo que reduce el riesgo de la apertura.`,
        `${brand.name} comes from ${brand.origin} with a proven format and ${brand.id === 'pampa' ? '3 units already operating in São Paulo (Ibirapuera, Center Norte and Villa-Lobos), averaging R$ 162,000 in monthly revenue' : 'a concept with strong affinity with São Paulo consumers'}. Mall shoppers in the city value Argentine brands for quality and experience, and the ${brand.sectorLabel[1].toLowerCase()} segment keeps growing. MRG already knows the brand's operation in Brazil, which lowers opening risk.`,
      ),
    },
    {
      id: 'ubicacion',
      title: L(lang, '3. Ubicación sugerida', '3. Suggested location'),
      body: L(
        lang,
        `Recomendamos ${mall} como primera opción: flujo de público ${premium ? 'de ticket alto' : 'familiar y constante'}, buena visibilidad en el patio de comidas y disponibilidad de un local de ${q.sqm} m² compatible con el layout de ${brand.name}. Como alternativa evaluamos ${alt}. MRG lleva adelante la negociación con la administración del shopping (canon, fondo de promoción y plazo de obra).`,
        `We recommend ${mall} as first choice: ${premium ? 'high-ticket' : 'steady family'} foot traffic, strong food-court visibility and an available ${q.sqm} m² space that fits ${brand.name}'s layout. As an alternative we evaluated ${alt}. MRG handles the negotiation with mall management (rent, promotion fund and build-out period).`,
      ),
    },
    {
      id: 'servicio',
      title: L(
        lang,
        template === 'llave' ? '4. Servicio llave en mano MRG' : '4. Servicio MRG · Master franquicia',
        template === 'llave' ? '4. MRG turnkey service' : '4. MRG service · Master franchise',
      ),
      body:
        template === 'llave'
          ? L(
              lang,
              `Softlanding: constitución legal de la sociedad en Brasil, registro de marca y asesoramiento contable y fiscal.\nNegociación con el shopping: búsqueda del punto, condiciones del contrato y aprobación del proyecto.\nRecursos humanos: reclutamiento, contratación y capacitación del personal según el manual de ${brand.name}.\nApertura: supervisión de obra y equipamiento, abastecimiento y acompañamiento in situ durante los primeros 30 días. Sin costos inesperados.`,
              `Softlanding: incorporation of the Brazilian company, trademark registration and accounting & tax advice.\nMall negotiation: site search, lease terms and project approval.\nHuman resources: recruiting, hiring and training staff per ${brand.name}'s manual.\nOpening: build-out and equipment supervision, supply chain and on-site support during the first 30 days. No unexpected costs.`,
            )
          : L(
              lang,
              `Cesión de la master franquicia de ${brand.name} para la zona ${mall.replace('Shopping ', '')}, con derecho a sub-franquiciar. MRG acompaña el Softlanding (sociedad, marca, fiscal) y el Market Discovery de la zona; la operación y aperturas posteriores quedan a cargo del master franquiciado.`,
              `Grant of ${brand.name}'s master franchise for the ${mall.replace('Shopping ', '')} area, with sub-franchising rights. MRG supports Softlanding (company, trademark, tax) and the area's Market Discovery; operations and later openings are run by the master franchisee.`,
            ),
    },
    {
      id: 'inversion',
      title: L(lang, '5. Inversión estimada y cronograma', '5. Estimated investment & timeline'),
      body: L(
        lang,
        `Inversión total estimada: ${fmtBRL(invest)} (dentro del capital disponible de ${fmtBRL(q.capital)}).\n· Fee de franquicia y servicio MRG: ${fmtBRL(fee)}\n· Obra e instalaciones: ${fmtBRL(works)}\n· Equipamiento: ${fmtBRL(equip)}\n· Capital de trabajo inicial: ${fmtBRL(capitalWork)}\nCronograma: mes 1 sociedad y contrato · mes ${Math.max(2, Math.round(months / 3))} cierre con el shopping · mes ${Math.max(3, months - 2)} obra y contratación · mes ${months} inauguración. Recupero estimado: ${q.roiMonths} meses.`,
        `Estimated total investment: ${fmtBRL(invest)} (within available capital of ${fmtBRL(q.capital)}).\n· Franchise fee & MRG service: ${fmtBRL(fee)}\n· Build-out: ${fmtBRL(works)}\n· Equipment: ${fmtBRL(equip)}\n· Initial working capital: ${fmtBRL(capitalWork)}\nTimeline: month 1 company & contract · month ${Math.max(2, Math.round(months / 3))} mall agreement · month ${Math.max(3, months - 2)} build-out & hiring · month ${months} grand opening. Estimated payback: ${q.roiMonths} months.`,
      ),
    },
    {
      id: 'pasos',
      title: L(lang, '6. Próximos pasos', '6. Next steps'),
      body: L(
        lang,
        `1) Reunión de revisión de esta propuesta con ${first} y el equipo de MRG.\n2) Firma de la carta de intención y visita a ${mall}.\n3) Inicio del Softlanding y de la negociación con el shopping.\nEsta propuesta tiene una validez de 15 días.`,
        `1) Review meeting of this proposal with ${first} and the MRG team.\n2) Letter of intent signing and visit to ${mall}.\n3) Kick-off of Softlanding and mall negotiation.\nThis proposal is valid for 15 days.`,
      ),
    },
  ];
  return sections;
}
