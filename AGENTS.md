# Cafetulia — instrucciones para agentes

Este proyecto se llama **Cafetulia**: un juego digital cozy, online y para 2–4 jugadores, basado en *Café International*.

## Antes de programar

Lee, en este orden:

1. `docs/ARGON/00-contexto.md` — contexto maestro del proyecto.
2. `docs/REGLAS.md` — reglamento operativo y casos límite.
3. `docs/ARQUITECTURA.md` — stack, estructura y despliegue.
4. `docs/ARTE.md` — dirección de arte.
5. `docs/ARTE_BIBLE.md` — biblia visual completa: paleta, cámara, materiales, personajes, UI y animaciones.
6. `docs/ROADMAP.md` — alcance de la v1.0 y fases.
7. `docs/DECISIONES.md` — decisiones cerradas y pendientes.
8. `packages/content/board.json` — datos validados del tablero.

Las fases de implementación están en `docs/ARGON/01-scaffolding.md` … `docs/ARGON/08-despliegue.md`.

## Entorno

- **Node 22.5+ obligatorio** (el servidor usa `node:sqlite`). Recomendado Node 24 LTS.
- Si `pnpm` no está instalado globalmente, usa `npx pnpm ...`.
- `npx pnpm dev` arranca el servidor full-stack (API + Vite) en <http://localhost:3000>.
- `npx pnpm test:e2e` ejecuta Playwright; el `webServer` ya arranca la app.

## Reglas que no se negocian

- **No cambiar las reglas** sin actualizar `docs/REGLAS.md` y `docs/DECISIONES.md`.
- **No inventar** países, mesas ni sillas: usar `packages/content/board.json`.
- **No copiar arte oficial** de *Café International*: el arte final será original.
- **No añadir** voz, fotos, notas de voz ni nombres reales.
- La interfaz se escribe en **español estándar**.
- `packages/engine` es **puro**: sin React, sin Three, sin DOM.
- El servidor es la **autoridad**: el cliente propone, el servidor valida.
- Todo se prueba con **Vitest**; el flujo completo, con **Playwright**.
- Commits convencionales: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `art:`.

## Al terminar cada sesión

1. `pnpm typecheck`, `pnpm test` y `pnpm build` en verde.
2. Actualizar `docs/SESIONES.md` con lo hecho, las decisiones y lo siguiente.
3. Actualizar `docs/DECISIONES.md` si se ha tomado alguna decisión.
4. `git add .`, `git commit` y `git push`.
