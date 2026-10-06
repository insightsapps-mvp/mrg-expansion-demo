import type { Lang, Role } from '@/types';
import { tr } from '@/i18n';
import { BOTTOM, NAV } from '@/config/nav';

export interface TourStep {
  id: string;
  target?: string; // valor de data-tour
  fallback?: string; // si el target no es visible (ej. ítem dentro de "Más ▾")
  route?: string;
  title: string;
  body: string;
  roles?: Role[];
}

export interface TourData {
  active: number;
  avg: number;
  risk: number;
  top: string;
  topScore: number;
  events: number;
  pct: number;
}

const ALL: Role[] = ['admin', 'franquiciante', 'franquiciado', 'equipo'];

/** Pasos en ORDEN VISUAL EXACTO del menú del rol. */
export function getTourSteps(role: Role, lang: Lang, esMobile: boolean, data: TourData): TourStep[] {
  const L = (k: string, v?: Record<string, string | number>) => tr(k, lang, v);
  const steps: TourStep[] = [];

  // (1) Welcome centrado — uno por rol
  for (const r of ALL) {
    steps.push({ id: `welcome-${r}`, roles: [r], title: L(`tour.w.${r}.t`), body: L(`tour.w.${r}.b`) });
  }

  // (2) Overview de la navegación
  steps.push(
    esMobile
      ? { id: 'nav', target: 'bottom-nav', title: L('tour.navm.t'), body: L('tour.navm.b') }
      : { id: 'nav', target: 'top-nav', title: L('tour.nav.t'), body: L('tour.nav.b') },
  );

  // (3) Un paso por ítem del nav, de izquierda a derecha
  const vars = { active: data.active, avg: data.avg, risk: data.risk, top: data.top, score: data.topScore, events: data.events, pct: data.pct };
  NAV[role].forEach((it, i) => {
    const inBottom = BOTTOM[role].includes(it.id);
    const target = esMobile ? (inBottom ? `tab-${it.id}` : 'mobile-menu') : `nav-${it.id}`;
    const body = L(`tour.i.${it.id}`, vars) + (esMobile && !inBottom ? ' ' + L('tour.more') : '');
    steps.push({
      id: `item-${it.id}`,
      roles: [role],
      target,
      fallback: esMobile ? undefined : 'nav-more',
      route: it.path,
      title: `${i + 1}. ${L(it.label)}`,
      body,
    });
  });

  // (4) Role switcher
  steps.push(
    esMobile
      ? { id: 'switch', target: 'tab-mas', title: L('tour.switch.t'), body: L('tour.switchm.b') }
      : { id: 'switch', target: 'switch-user', title: L('tour.switch.t'), body: L('tour.switch.b') },
  );

  // (5) CTA comercial
  steps.push(
    esMobile
      ? { id: 'cta', target: 'tab-mas', title: L('tour.cta.t'), body: L('tour.ctam.b') }
      : { id: 'cta', target: 'whatsapp-cta', title: L('tour.cta.t'), body: L('tour.cta.b') },
  );

  // Filtrar por rol SOLO removiendo pasos cuyo roles no incluye al actual
  return steps.filter((s) => !s.roles || s.roles.includes(role));
}
