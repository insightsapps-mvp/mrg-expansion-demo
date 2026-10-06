# PROGRESO — MRG Expansión (demo)

## Completado
- Setup Vite + React + TS + Tailwind, tokens con la paleta de mercosurretailgroup.com, fuentes, anti-flash, manifest, render.yaml, íconos y logo oficial de MRG (navy / blanco / isotipo).
- Tipos, datos mock (28 leads, 9 unidades, 14 propuestas, 6 proyectos / 60 tareas, 25 eventos), mapas de enums, i18n (tr / useT), store zustand.
- Shell: barra superior con pills (cantidad visible medida en vivo + "Más ▾"), topbar mobile, bottom-nav, sheet "Más", role switcher, CTA WhatsApp, footer, PreviewBanner, DevNotice, toasts, guardas de ruta.
- Login dos columnas + auto-fill por rol + link al Modo Trailer (≥1024px).
- Sección Propuesta (circuito, 6 módulos + onboarding, inversión oculta por defecto, "Ver en el demo" con retorno y resaltado).
- Welcome Modal (una vez por sesión), Tour guiado manual por rol (desktop y mobile), Modo Trailer, Asistente MRG pre-programado.
- Admin: Panel, CRM Kanban/lista/importación CSV/nuevo lead, Ficha del lead, Scoring en vivo, Generador de propuestas IA (streaming, editor, versiones, PDF, envío), Listado y detalle de propuestas con diff, Calendario, Clientes, Usuarios.
- Portal Franquiciante, Portal Franquiciado, Equipo de proyecto.
- i18n completo: `npm run check:i18n` → 0 faltantes.
- QA: sin scroll horizontal a 390px en todas las rutas; modales centrados.

## Pendiente
- Screenshots en /screenshots.

## Decisiones
- Branding: logo y colores reales de MRG (navy #071A2E / #13294B, azul #1769AA / #2D9CDB) en lugar del azul genérico del brief.
- Servicios reales de MRG (Softlanding, Market Discovery, negociación con shoppings, RRHH, apertura) usados en copy, tareas y plantillas de propuesta.
- Socio: Carlos Rua (Director de Ventas y Retail), según el sitio.
- Scoring: tramos extra "Comercio 5+ años = 21" y "SP capital · zona prime = 25" para que los scores del brief (Juliana 92, Bruno 81) cierren exactos. Reglas en `src/config/scoring.ts`.

## Bloqueos
- Ninguno.
