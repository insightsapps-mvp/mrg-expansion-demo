# MRG Expansión — demo navegable

Previsualización de la plataforma de expansión a Brasil de **Mercosur Retail Group** (datos mock). Powered by Insights.

## Correr local

```bash
npm install
npm run dev
```

Cuentas de demo (contraseña `demo123`): `daniel@mrg.com.br` (Admin MRG), `lucia@pampaburger.com.ar` (Franquiciante), `rafael.souza@gmail.com` (Franquiciado), `paula@mrg.com.br` (Equipo de proyecto).

## Deploy en Render

Static site con `render.yaml`: build `npm install && npm run build`, publish `./dist`, rewrite `/* → /index.html`.

## Scripts

- `npm run build` — build de producción.
- `npm run check:i18n` — verifica que todas las claves de traducción usadas existan (ES/EN).

Las reglas de scoring se editan en `src/config/scoring.ts`.
