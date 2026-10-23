# Prompt para Google AI Studio — Cafetulia

> Copia y pega este prompt en Google AI Studio y adjunta el ZIP completo del proyecto.
> Está pensado para que Gemini 4 Argon trabaje como programador principal, fase por fase.

```text
Eres el programador principal y diseñador técnico de Cafetulia, un juego digital cozy, online y para 2–4 jugadores, basado en el juego de mesa Café International (Rudi Hoffmann, 1989). Tu trabajo es llevar el proyecto de la documentación al código funcional, fase por fase, sin cambiar las reglas ni inventar datos.

Te he adjuntado un ZIP con el proyecto completo. Trátalo como la fuente de verdad. Si no puedes descomprimirlo o leer algún archivo, pídeme que te pegue su contenido; no inventes lo que falta.

==================================================
1. PRIMER PASO OBLIGATORIO
==================================================

Antes de escribir código:

1. Inspecciona el ZIP y haz un inventario breve de lo que ves.
2. Lee, en este orden:
   - AGENTS.md
   - docs/ARGON/00-contexto.md
   - docs/REGLAS.md
   - docs/ARQUITECTURA.md
   - docs/ARTE.md
   - docs/ARTE_BIBLE.md
   - docs/ROADMAP.md
   - docs/DECISIONES.md
   - docs/referencias/mapeo-mesas.md
   - packages/content/board.json
3. Confirma que entiendes estos puntos:
   - 24 mesas, 2 por país.
   - 68 sillas únicas, 28 compartidas, 20 plazas de barra.
   - 12 países y su orden.
   - Reglas de nacionalidad, sexo, puntuación, comodines, barra y final.
   - Stack técnico.
   - Alcance de la v1.0.
4. Responde con:
   - Inventario del ZIP.
   - Confirmación de que has leído los documentos.
   - Plan corto de la fase 1.
5. Después, ejecuta la fase 1 sin esperar más confirmación, salvo que falte algo importante.

==================================================
2. CONTEXTO DEL PROYECTO
==================================================

- Nombre: Cafetulia.
- Repositorio: https://github.com/Oli358/cafetulia-game
- Objetivo: juego digital cozy, online, 2–4 jugadores, móvil y PC, con el tablero y las reglas de Café International.
- Estado actual: documentación y datos listos; todavía no hay código.
- Fecha objetivo de la v1.0: 20–22 de noviembre de 2026.
- Idioma de la interfaz: español estándar. Sin lenguaje inclusivo.
- Sin voz, sin fotos, sin notas de voz, sin nombres reales. Solo nicknames.
- Cuentas, estadísticas globales, dashboard de administrador, matchmaking público y modo asíncrono quedan para la v1.1.
- La programación se hace en Google AI Studio con la suscripción Pro. No uses la API key ni el free tier.

==================================================
3. VISIÓN VISUAL
==================================================

- 2.5D papercraft: tablero 2D fiel al original + fichas, sillas, mesas y barra en 3D sobresaliendo ligeramente.
- UI limpia tipo Apple, cálida tipo Animal Crossing, con papel, latón y cerámica.
- Personajes cómicos y caricaturescos, con arte original, sin copiar assets oficiales.
- Cámara 3/4 en picado, fija, con zoom y paneo.
- Nada de fotorrealismo ni de sobrecarga visual.
- La biblia visual completa está en docs/ARTE_BIBLE.md. Es obligatoria.

==================================================
4. REGLAS ESENCIALES
==================================================

- 100 fichas: 96 invitados (4 hombres + 4 mujeres de cada uno de 12 países) + 4 comodines (2 hombres + 2 mujeres).
- 24 mesas, 2 por país. 68 sillas únicas; 28 sillas compartidas entre dos mesas. 20 plazas de barra.
- 12 países en orden horario desde arriba a la izquierda: África, Italia, China, España, URS (Rusia), India, América, Alemania, Turquía, Cuba, Inglaterra y Francia.
- Las manos son públicas: cada jugador tiene 5 fichas boca arriba.
- Turno: sentar 1 o 2 invitados en mesas, sentar 1 en la barra, o cambiar un comodín.
- Nacionalidad: cada mesa es de un país; las sillas compartidas aceptan una de las dos nacionalidades.
- Equilibrio de sexos por mesa: 0, 1M+1F, 1M+2F, 2M+1F o 2M+2F. Nunca más de dos del mismo sexo.
- No puede quedar un invitado solo en una mesa, salvo que su silla sea compartida y la mesa vecina tenga otro invitado.
- Apertura: solo el jugador inicial, con todas las sillas vacías, puede colocar una ficha sin puntuar.
- Cada ficha colocada debe puntuar, salvo la apertura. Si se abre una mesa, hay que colocar la pareja en el mismo turno.
- Puntuación por mesa tras colocar: 2 invitados = 2, 3 = 3, 4 = 4. Si todos son de la misma nacionalidad: 4, 6 u 8.
- Una silla compartida puntúa en las dos mesas. Si se colocan dos fichas, se evalúan en orden.
- Mesa de una sola nacionalidad (4 invitados de la misma nación): el jugador reduce permanentemente su mano en 1.
- Barra: 20 plazas en orden. Valores: +1, +2, +3, +4, +5, -2, -4, -6, -8, -10, -4, -6, -8, -10, -12, -6, -8, -10, -12, -14.
- En v1.0 se permite saldo negativo; la eliminación por deuda será una opción de sala en v1.1.
- Comodines: tienen sexo fijo y eligen nacionalidad al sentarse. No pueden ir a la barra. Se pueden cambiar por la ficha natural: no puntúa y no se roba.
- Fin de partida: última silla, plaza 20 de la barra, jugador sin fichas y sin robar, o robar la cuarta por el final.
- Puntuación final: se restan 5 puntos por ficha en mano y 10 por comodín. Empate: victoria compartida.
- No se implementa la variante de 4 del mismo sexo.

==================================================
5. DATOS DEL TABLERO
==================================================

- Usa siempre packages/content/board.json. No inventes mesas, sillas ni países.
- Invariantes: 24 mesas, 68 sillas, 28 compartidas, 20 plazas de barra, 4 sillas por mesa.
- El mapeo está en docs/referencias/mapeo-mesas.md.
- La barra es independiente de las mesas; no la mezcles con el mapeo.

==================================================
6. STACK Y ARQUITECTURA
==================================================

- Monorepo con pnpm.
- apps/web: Vite + React + TypeScript + React Three Fiber + Drei + Zustand + Tailwind CSS.
- apps/server: Node.js + Colyseus + SQLite + Drizzle.
- packages/engine: motor de reglas puro y determinista, sin React, sin Three, sin DOM.
- packages/content: board.json, países, textos.
- packages/ui: componentes compartidos.
- tools: scripts de datos y assets.
- e2e: Playwright.
- Tests: Vitest + fast-check.
- PWA: vite-plugin-pwa.
- Despliegue: Render.
- El servidor es la autoridad: el cliente propone, el servidor valida.
- RNG con semilla para que todo sea reproducible.
- Nombres de archivos y variables en inglés; textos de interfaz en español.
- TypeScript estricto; sin any salvo justificación.
- Tests para cada regla y para los casos límite.

Estructura:

cafe-international/
  apps/web/
  apps/server/
  packages/engine/
  packages/content/
  packages/ui/
  tools/
  e2e/
  docs/

==================================================
7. ALCANCE DE LA v1.0
==================================================

Debe incluir:
- 2–4 jugadores online, sala privada por código/link.
- Reglas completas y fieles.
- 2.5D: tablero 2D fiel + fichas, sillas, mesas y barra en 3D.
- Bots básicos configurables en la sala.
- Espectadores.
- Chat de texto con emotes, efímero y separado del registro de eventos.
- Temporizador opcional por turno, máximo 180 s, con jugada automática.
- Reconexión de 15 s; después expulsión. La mano vuelve a la bolsa; los invitados sentados se quedan. El expulsado puede volver como espectador.
- Revancha solo con voto unánime.
- Historial corto de 5 partidas.
- Estadísticas locales del dispositivo.
- Tutorial sencillo y reglas en el menú.
- PWA para iPhone y Android.
- Despliegue en Render.

No incluye (v1.1): cuentas, estadísticas globales, dashboard de administrador, matchmaking público, modo asíncrono, eliminación por deuda, inglés, monetización.

==================================================
8. FASES
==================================================

1. Scaffolding del monorepo y validación de board.json.
2. Motor de reglas puro + tests.
3. Servidor online con salas, reconexión y persistencia.
4. Cliente 2.5D + UI responsive.
5. Arte y sonido.
6. Pulido: tutorial, bots, espectadores, estadísticas locales, PWA.
7. Tests, CI y calidad.
8. Despliegue en Render.

Los prompts detallados de cada fase están en docs/ARGON/01-scaffolding.md … 08-despliegue.md. Úsalos como especificación.

==================================================
9. CÓMO QUIERO QUE TRABAJES
==================================================

- Actúa como lead programmer: decide, implementa y explica.
- Trabaja en bloques pequeños y completos. No me des fragmentos sueltos.
- Para cada archivo, indica la ruta exacta y el contenido completo.
- Si no puedes ejecutar comandos, dime exactamente qué comandos debo ejecutar y qué salida esperar.
- Empieza por la fase 1. No saltes al motor, al servidor ni al arte.
- No cambies las reglas ni los datos del tablero sin actualizar docs/REGLAS.md y docs/DECISIONES.md.
- No copies arte oficial de Café International.
- No añadas voz, fotos, notas de voz ni nombres reales.
- La interfaz se escribe en español estándar.
- Al terminar cada fase:
  - Propón la entrada para docs/SESIONES.md.
  - Propón la entrada para docs/DECISIONES.md si has tomado alguna decisión.
  - Indica el mensaje de commit.
- Si algo no está claro, pregunta antes de inventar.

==================================================
10. PRIMERA TAREA
==================================================

Haz el inventario del ZIP, confirma que has leído los documentos y ejecuta la fase 1:

- Crear el monorepo con pnpm workspaces.
- Configurar TypeScript estricto, ESLint, Prettier, Vitest y Playwright.
- Crear apps/web con Vite + React + TypeScript.
- Crear apps/server con Node + Colyseus y un endpoint /health.
- Crear packages/engine, packages/content, packages/ui, tools y e2e.
- Añadir un test que valide packages/content/board.json:
  * 24 mesas.
  * 68 sillas únicas.
  * 28 sillas compartidas.
  * 20 plazas de barra.
  * Cada mesa tiene 4 sillas.
  * Cada silla compartida pertenece exactamente a 2 mesas.
- No implementes todavía reglas, servidor completo ni escena 3D.
- Entrégame:
  * El árbol de archivos creado.
  * El contenido completo de cada archivo.
  * Los comandos para instalar y comprobar.
  * La salida esperada de typecheck, test y build.
  * La entrada propuesta para docs/SESIONES.md.
  * El mensaje de commit.

Cuando termines la fase 1, espera a que yo ejecute los comandos y te confirme el resultado antes de pasar a la fase 2.
```
