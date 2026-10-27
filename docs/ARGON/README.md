# Instrucciones para Gemini 4 Argon

Esta carpeta contiene el contexto y los prompts para que **Gemini 4 Argon** implemente Cafetulia.

## Cómo usarlo

1. Abre una sesión con Gemini 4 Argon.
2. Pega primero el contenido de [`00-contexto.md`](00-contexto.md). Es el contexto maestro.
3. Después pega el prompt de la fase que toque, por orden:
   - [`01-scaffolding.md`](01-scaffolding.md)
   - [`02-motor-reglas.md`](02-motor-reglas.md)
   - [`03-servidor-online.md`](03-servidor-online.md)
   - [`04-cliente-2.5d.md`](04-cliente-2.5d.md)
   - [`05-arte-sonido.md`](05-arte-sonido.md)
   - [`06-pulido-pwa.md`](06-pulido-pwa.md)
   - [`07-tests-calidad.md`](07-tests-calidad.md)
   - [`08-despliegue.md`](08-despliegue.md)
   - [`09-pulido-ui-v6.md`](09-pulido-ui-v6.md) — pulido de UI, cabecera, menús, final, cartas y movimiento
   - [`10-menu-sonido-musica.md`](10-menu-sonido-musica.md) — portada/lobby de café, SFX de UI y música con variación
   - [`11-pulido-visual-animaciones.md`](11-pulido-visual-animaciones.md) — dirección visual, materiales y sistema de animación
   - [`12-ajustes-movil-turno.md`](12-ajustes-movil-turno.md) — zoom, mano, marcador, avatar, turno y safe areas de iPhone\n   - [`13-pulido-visual-v10.md`](13-pulido-visual-v10.md) — pasada visual: tablero, fichas, HUD, lobby y postal
4. Al terminar cada fase, Argon debe:
   - Ejecutar `pnpm typecheck`, `pnpm test` y `pnpm build`.
   - Actualizar `docs/SESIONES.md` con la sesión.
   - Actualizar `docs/DECISIONES.md` si ha tomado alguna decisión.
   - Hacer commit y push con el mensaje indicado.

## Reglas para Argon

- **No cambiar las reglas** sin actualizar `docs/REGLAS.md` y `docs/DECISIONES.md`.
- **No inventar países, mesas ni sillas**: usar `packages/content/board.json`.
- **No copiar arte oficial** de *Café International*: el arte final será original.
- **No añadir voz, fotos, notas de voz ni nombres reales.**
- **No usar lenguaje inclusivo** en la interfaz: español estándar.
- La UI se escribe en **español**.
- El motor de reglas (`packages/engine`) es **puro**: sin React, sin Three, sin DOM.
- El servidor es la **autoridad**: el cliente propone, el servidor valida.
- Todo se prueba con **Vitest**; el flujo completo, con **Playwright**.

## Estado del proyecto

- Nombre: **Cafetulia**.
- Repositorio: <https://github.com/Oli358/cafetulia-game>.
- Documentación y datos listos. Código v1.2 integrado; v1.3 en preparación con el prompt 09 de pulido de UI, pendiente de Render y pruebas en móviles reales.
- Fecha objetivo de la v1.0: **20–22 de noviembre de 2026**.
