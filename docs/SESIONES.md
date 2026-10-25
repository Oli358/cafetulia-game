# Registro de sesiones

> Documento vivo. Se añade una entrada por cada sesión de trabajo, **la más reciente arriba**.
> Formato: fecha, objetivo, hecho, decisiones, problemas y siguiente paso.

---

## Sesión 010 — 2026-10-25 — Integración de la v2 completa

**Objetivo:** analizar `cafetulia (1).zip`, integrar la nueva versión y comprobar si realmente funciona.

**Hecho:**
- Extraído y analizado el ZIP nuevo: incluye servidor Colyseus con salas, SQLite, bots, temporizador, reconexión, chat, revancha, UI 2.5D + 2D, audio, tutorial, PWA y CI.
- Detectado que el `package.json` raíz venía vacío y que el servidor usa `node:sqlite` (Node 22.5+).
- Instalado **Node 24.20.0 LTS** con `winget` (el sistema tenía Node 20.20.2).
- Reconstruido el `package.json` raíz y actualizado el entorno.
- Integrado el código de `apps/server`, `apps/web`, `packages/engine`, `packages/ui`, `e2e`, `server.ts`, `render.yaml` y `.github/workflows/ci.yml`.
- Corregidos:
  - Detección de módulo principal del servidor en Windows (`pathToFileURL`).
  - Persistencia: lectura de `DATABASE_URL` además de `SQLITE_DB_PATH`.
  - Rejilla 2D: filas/columnas de 0 a 12 (antes 1 a 13).
  - Timeout del test de simulación (300 s).
  - `playwright.config.ts`: `npx pnpm dev` en lugar de `pnpm dev`.
  - Etiquetas de motivos de fin de partida.
  - Aviso de `__dirname` en Vite.
- Verificado:
  - `npx pnpm typecheck` → OK.
  - `npx pnpm test` → **42 tests en verde** (motor, servidor y helpers).
  - `npx pnpm build` → OK.
  - `npx pnpm lint` → sin errores.
  - `npx playwright test` → **1 E2E en verde**.
  - `npx pnpm dev` → UI completa en <http://localhost:3000>.
  - `/health` → 200; `POST /rooms` → 201; partida rápida contra bot funcional.
- Revisada la UI con captura real: portada y partida 2.5D + 2D se ven correctamente.

**Decisiones:**
- La v2 se considera integrada y la **v1.0 implementada** (D-058).
- Node 24 LTS es el entorno local; Node 22.5+ mínimo (D-059).
- `npx pnpm dev` arranca el servidor full-stack (D-060).
- La rejilla 2D usa coordenadas 0–12 (D-061).

**Problemas:**
- El viewport 3D superior es pequeño y recorta parte del diorama; funciona como vista decorativa, pero hay que pulirlo.
- El bundle principal pesa ~811 KB (Three.js incluido); conviene code-splitting.
- Falta probar en iPhone/Android reales y desplegar en Render.
- `node:sqlite` obliga a Node 22.5+; hay que documentarlo y fijarlo en Render.

**Siguiente:**
1. Desplegar en Render con `DATABASE_URL` y volumen persistente.
2. Probar en móviles reales y ajustar la UI táctil.
3. Pulir el diorama 3D y el code-splitting.
4. Revisar el E2E con dos jugadores reales.

---

## Sesión 009 — 2026-10-23 — Integración del trabajo de Argon

**Objetivo:** revisar el ZIP de Cafetulia generado por Gemini 4 Argon, evaluar su calidad e integrarlo en el repositorio.

**Hecho:**
- Extraído `cafetulia.zip` de Descargas y revisado su contenido.
- Confirmado que Argon completó:
  - Scaffolding del monorepo con pnpm workspaces.
  - Motor de reglas puro en `packages/engine`.
  - Tests unitarios, de tablero y de simulación con `fast-check`.
  - Servidor base con `/health` y esqueletos de salas/persistencia.
  - Cliente mínimo con React + Vite.
- Integrado el código en el repositorio actual, conservando la documentación y el `board.json` más recientes.
- Corregido el script de build del monorepo.
- Corregido el test de 1.000 partidas: ahora es asíncrono y cede el event loop cada 20 partidas; `testTimeout` subido a 300 s.
- Permitidas las aserciones non-null en tests desde ESLint.
- Corregido el aviso de `__dirname` en `vite.config.ts`.
- Corregido el arranque del servidor: `Server` se obtiene del export por defecto de Colyseus y la detección de módulo principal usa `pathToFileURL`.
- Instaladas las dependencias con `npx pnpm install`.
- Verificado:
  - `npx pnpm typecheck` → todos los paquetes OK.
  - `npx pnpm test` → **32 tests en verde**.
  - `npx pnpm build` → cliente, servidor, paquetes y preview OK.
  - `npx pnpm lint` → sin errores.
  - `GET http://localhost:2567/health` → **200 `{"status":"ok"}`**.

**Decisiones:**
- El trabajo de Argon se considera **Fase 2 completada** (D-055).
- El test de simulación se mantiene en 1.000 partidas, con timeout ampliado y yields (D-056).
- ESLint permite non-null assertions en tests (D-057).

**Problemas:**
- El cliente es solo un esqueleto: muestra el título, sin tablero ni UI de juego.
- El servidor solo tiene `/health`; las salas, la reconexión y la persistencia son placeholders.
- `packages/ui`, `tools` y `e2e` son placeholders.

**Siguiente:**
1. Empezar la Fase 3: servidor online con Colyseus, salas, reconexión y persistencia.
2. Después, Fase 4: cliente 2.5D y UI completa.
3. Mantener el motor congelado salvo bugs.

---

## Sesión 008 — 2026-10-23 — Biblia visual

**Objetivo:** dejar el tipo visual del juego completamente descrito para que Argon no improvise.

**Hecho:**
- Creada `docs/ARTE_BIBLE.md` con:
  - Concepto y referencias.
  - Paleta base y acentos por país.
  - Tipografía, espaciado, radios y sombras.
  - Cámara, composición y tablero 2D.
  - Piezas 3D, personajes y UI.
  - Animación, sonido, iluminación y accesibilidad.
  - Lista de assets, pipeline, criterios de aceptación y prompt de style test.
- Actualizados `ARTE.md`, `README.md`, `AGENTS.md`, `ARGON/00-contexto.md` y `ARGON/04-cliente-2.5d.md` para enlazarla.

**Decisiones:**
- La biblia visual queda como referencia obligatoria para arte, UI y 3D (D-054).

**Problemas:**
- Quedan abiertas decisiones menores: proporción final de personajes, paleta definitiva por país, logo y modo noche.

**Siguiente:**
1. Arrancar la fase 1 con Argon.
2. Hacer el style test de la fase 5 antes de producir los 28 personajes.
3. Elegir logo y proporciones definitivas.

---

## Sesión 007 — 2026-10-22 — board.json validado y prompts para Argon

**Objetivo:** generar los datos definitivos del tablero y preparar las instrucciones de programación para Gemini 4 Argon.

**Hecho:**
- Confirmado el mapeo de las 24 mesas con el usuario.
- Ajustadas las filas del centro y de la parte inferior para cuadrar con las cuentas oficiales.
- Generado `packages/content/board.json`:
  - 24 mesas.
  - 68 sillas únicas.
  - 28 sillas compartidas.
  - 20 plazas de barra con sus valores.
- Documento final del mapeo: `docs/referencias/mapeo-mesas.md`.
- Creada la carpeta `docs/ARGON/` con el contexto maestro y 8 fases de prompts:
  1. Scaffolding.
  2. Motor de reglas.
  3. Servidor online.
  4. Cliente 2.5D.
  5. Arte y sonido.
  6. Pulido y PWA.
  7. Tests y calidad.
  8. Despliegue.

**Decisiones:**
- El mapeo de mesas queda cerrado (D-051).
- `board.json` queda validado (D-052).
- La programación se reserva a Gemini 4 Argon, con los prompts de `docs/ARGON/` (D-053).

**Problemas:**
- Ninguno bloqueante. Queda elegir cuándo se arranca la programación.

**Siguiente:**
1. Arrancar con Gemini 4 Argon por la fase 1 (scaffolding).
2. Revisar el resultado de cada fase y actualizar el registro.
3. Preparar la prueba de estilo con Gemini 4 Argon cuando toque la fase de arte.

---

## Sesión 006 — 2026-10-22 — Borrador de mapeo de mesas y modelo de IA

**Objetivo:** preparar el borrador de las 24 mesas a partir de las fotos y dejar claro el uso de Gemini 4 Argon.

**Hecho:**
- Creado `docs/referencias/mapeo-mesas-borrador.md` con:
  - Rejilla 13×13 con los códigos de país propuestos.
  - Detalle de las 24 mesas: posición, etiqueta impresa (no fiable) y país propuesto.
  - Lista de puntos a revisar por el usuario.
- Actualizados `REGLAS.md` y `DECISIONES.md` (D-051).
- Anotado que **Gemini 4 Argon** se reserva para la programación y los modelos que se usen.

**Decisiones:**
- La programación se reserva para Gemini 4 Argon; este agente no escribirá código.
- El mapeo de mesas queda pendiente de revisión del usuario.

**Problemas:**
- El mapeo es un borrador; hay que confirmar las 24 mesas.

**Siguiente:**
1. Revisar el borrador de mapeo y corregir lo que haga falta.
2. Preparar la especificación y los datos para que Gemini 4 Argon programe.
3. Definir la prueba de estilo con Gemini 4 Argon.

---

## Sesión 005 — 2026-10-22 — Confirmación de los 12 países

**Objetivo:** cerrar la lista completa de países y su orden.

**Hecho:**
- Confirmados los dos que faltaban: **Inglaterra** y **Francia**.
- Orden completo en sentido horario desde arriba a la izquierda: **África, Italia, China, España, URS (Rusia), India, América, Alemania, Turquía, Cuba, Inglaterra y Francia**.
- Actualizados `REGLAS.md` y `DECISIONES.md` (D-002 y D-050).

**Decisiones:**
- La lista de 12 países y su orden cíclico quedan cerrados.

**Problemas:**
- Falta traducir ese orden a las 24 mesas concretas del tablero (2 por país).

**Siguiente:**
1. Preparar el mapeo de las 24 mesas por posición.
2. Probar Gemini 4 Argon en la prueba de estilo.
3. Preparar el scaffolding del monorepo (cuando el usuario dé el visto bueno).

---

## Sesión 004 — 2026-10-22 — Nombre Cafetulia, repositorio remoto y países

**Objetivo:** cerrar el nombre, conectar el repositorio remoto, registrar el orden de países y anotar el modelo de IA a probar.

**Hecho:**
- Nombre decidido: **Cafetulia**.
- Repositorio remoto configurado: <https://github.com/Oli358/cafetulia-game.git>.
- Rama `main` subida a GitHub.
- Documentación actualizada con el nombre y el repositorio (`README.md`, `PLAN.md`, `NOMBRES.md`, `GIT.md`, `DECISIONES.md`, `REGLAS.md`).
- Registrado el orden cíclico de países indicado por el usuario: África, Italia, China, España, URS (Rusia), India, América, Alemania, Turquía y Cuba (sentido horario desde arriba a la izquierda).
- Anotado **Gemini 4 Argon** como modelo de IA a probar.

**Decisiones:**
- Nombre comercial: **Cafetulia** (D-041).
- Repositorio remoto: `cafetulia-game` (D-048).
- Modelo de IA a probar: Gemini 4 Argon (D-049).
- Orden de países: 10 confirmados; faltan 2 (D-050).

**Problemas:**
- La lista de países tiene 10; el juego original tiene 12. Probablemente faltan Francia e Inglaterra.
- Falta confirmar el mapeo definitivo de las 24 mesas.

**Siguiente:**
1. Confirmar los 2 países que faltan y el orden completo.
2. Probar Gemini 4 Argon en la prueba de estilo.
3. Preparar el scaffolding del monorepo (cuando el usuario dé el visto bueno).

---

## Sesión 003 — 2026-10-22 — Corrección, Git y ronda 3 de nombres

**Objetivo:** corregir la interpretación de las fotos, preparar el repositorio local y generar nombres más originales.

**Hecho:**
- Confirmado que las fotos son reales; el tablero tiene 24 mesas y 12 países, 2 por país.
- Corregidos `REGLAS.md`, `DECISIONES.md` y `SESIONES.md`: se ignoran las etiquetas impresas erróneas (por ejemplo, “CANADÁ” donde debe ser Inglaterra).
- Movidas las fotos a `docs/referencias/` con nombres claros: `tablero-real-sin-fichas.png` y `tablero-real-con-fichas.jpg`.
- Creados `.gitattributes`, `.editorconfig`, `LICENSE.md` y `docs/GIT.md`.
- Inicializado el repositorio Git local, rama `main`, con el primer commit: `docs: plan inicial, reglas y estructura del proyecto`.
- Generada la ronda 3 de nombres, con comprobación de dominios; actualizado `docs/NOMBRES.md`.

**Decisiones:**
- Las fotos son la referencia real del tablero.
- Los nombres y banderas impresas no son fiables; se mapean los 12 países oficiales por posición.
- Repositorio local listo; el remoto de GitHub se crea cuando haya nombre.
- La ronda 3 de nombres queda pendiente de elección.

**Problemas:**
- Falta confirmar el mapeo definitivo de los 12 países en las 24 mesas.
- El nombre sigue sin decidirse.

**Siguiente:**
1. Elegir nombre de la ronda 3.
2. Confirmar el mapeo de países por posición.
3. Crear el repositorio remoto y subir.
4. Preparar el scaffolding del monorepo.

---

## Sesión 002 — 2026-10-22 — Revisión de las imágenes del tablero

**Objetivo:** revisar las imágenes añadidas al directorio para usarlas como referencia del tablero real.

**Hecho:**
- Analizadas `Tablero Café International sin fichas.png` e `Imagen de ChatGPT 22 oct 2026, 13_02_20.jpg`.
- Confirmado: **son fotos reales del tablero físico**, no imágenes generadas.
- El tablero tiene **24 mesas y 12 países, 2 mesas por país**.
- Las etiquetas y banderas impresas en el tablero no son fiables (por ejemplo, pone “CANADÁ” donde debe ser Inglaterra). Se ignorarán los nombres impresos.
- Las fotos sirven como **referencia real de topología y de estilo 2.5D**: tablero plano, sillas y mesas con volumen suave, barra central en rombo.

**Decisiones:**
- Usar estas fotos como referencia real del tablero.
- Ignorar los nombres y banderas impresas cuando no coincidan.
- Mantener los 12 países oficiales: África, Alemania, China, Cuba, España, Estados Unidos, Francia, India, Inglaterra, Italia, Rusia y Turquía, mapeados por posición.
- Pendiente: confirmar el mapeo definitivo de cada mesa con el tablero delante.

**Problemas:**
- Hay que fijar qué país corresponde a cada una de las 24 mesas ignorando las etiquetas erróneas.

**Siguiente:**
1. Confirmar el mapeo de los 12 países por posición.
2. Elegir nombre entre las nuevas opciones.
3. Crear el `board.json` definitivo y validarlo.

---

## Sesión 001 — 2026-10-22 — Definición y estructura

**Objetivo:** cerrar las decisiones de producto y dejar preparada la documentación y la estructura del proyecto, sin programar todavía.

**Hecho:**
- Investigación del juego: reglamento AMIGO 2009, Rio Grande 2015, Spiel des Jahres, BoardGameGeek y fotos del tablero.
- Resumen operativo de reglas y del tablero (13×13, 24 mesas, 68 sillas, 28 sillas compartidas, 20 plazas de barra).
- Definición de la visión: 2.5D papercraft, tablero 2D fiel + fichas y mobiliario 3D.
- Cierre de decisiones de producto (ver `DECISIONES.md`).
- Creación de la estructura de carpetas y de la documentación inicial.

**Decisiones destacadas:**
- 2–4 jugadores desde la v1.0.
- Sin variante de 4 del mismo sexo por ahora.
- Comodines no van a la barra.
- Empate: victoria compartida.
- Fin de partida: las 4 condiciones clásicas.
- v1.0 permite saldo negativo; la eliminación por deuda será opción en v1.1.
- Chat y registro de eventos separados.
- Temporizador opcional con jugada automática.
- Reconexión de 15 s; mano a la bolsa; invitados sentados se quedan.
- Espectadores sí; replay no; compartir resultado sí; revancha con voto unánime.
- v1.0 con bots y espectadores; cuentas, admin y asíncrono en v1.1.
- Fecha objetivo: 20–22 de noviembre de 2026.
- Presupuesto 0 €; Render; PWA; español primero.
- Arte original, cómico y papercraft.

**Problemas:**
- Falta la foto del tablero vacío para transcribir con seguridad las 68 sillas.
- Nombre comercial aún pendiente.
- El modo asíncrono depende de que el servidor gratuito esté siempre levantado.

**Siguiente:**
1. Recibir la foto del tablero y crear el primer `board.json`.
2. Elegir nombre y crear el repositorio definitivo.
3. Montar el scaffolding del monorepo.
4. Empezar por el motor de reglas y sus tests.

---

## Plantilla para nuevas sesiones

```md
## Sesión NNN — AAAA-MM-DD — Título corto

**Objetivo:**

**Hecho:**

**Decisiones:**

**Problemas:**

**Siguiente:**
```
