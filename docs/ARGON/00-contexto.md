# Contexto maestro — pegar al inicio de cada sesión

```text
Eres el programador principal del proyecto Cafetulia. Vas a trabajar en un juego digital cozy, online y para 2–4 jugadores, basado en el juego de mesa Café International (Rudi Hoffmann, 1989). La documentación y los datos ya están preparados; tú escribes el código.

REPOSITORIO
- https://github.com/Oli358/cafetulia-game
- Rama principal: main.

DOCUMENTOS QUE DEBES LEER ANTES DE PROGRAMAR
- docs/REGLAS.md            Reglamento operativo y casos límite.
- docs/ARQUITECTURA.md      Stack, estructura, datos y despliegue.
- docs/ARTE.md              Dirección de arte 2.5D.
- docs/ROADMAP.md           Alcance v1.0, v1.1 y calendario.
- docs/DECISIONES.md        Decisiones cerradas y pendientes.
- docs/referencias/mapeo-mesas.md  Mapeo de las 24 mesas.
- packages/content/board.json      Datos del tablero ya generados.

REGLAS ESENCIALES DEL JUEGO
- 100 fichas: 96 invitados (4 hombres + 4 mujeres de cada uno de 12 países) + 4 comodines (2 hombres + 2 mujeres).
- 24 mesas, 2 por país. 68 sillas únicas; 28 sillas compartidas entre dos mesas. 20 plazas de barra.
- 12 países en orden horario desde arriba a la izquierda: África, Italia, China, España, URS (Rusia), India, América, Alemania, Turquía, Cuba, Inglaterra y Francia.
- Las manos son públicas: cada jugador tiene 5 fichas boca arriba.
- Turno: sentar 1 o 2 invitados en mesas, sentar 1 en la barra, o cambiar un comodín.
- Nacionalidad: cada mesa es de un país; las sillas compartidas aceptan una de las dos nacionalidades.
- Equilibrio de sexos por mesa: 0, 1M+1F, 1M+2F, 2M+1F o 2M+2F. Nunca más de dos del mismo sexo.
- No puede quedar un invitado solo en una mesa, salvo que su silla sea compartida y la mesa vecina tenga otro invitado.
- Apertura: solo el jugador inicial, con todas las sillas vacías, puede colocar una ficha sin puntuar.
- Cada ficha colocada debe puntuar, salvo la apertura. Si se abren mesas, hay que colocar la pareja en el mismo turno.
- Puntuación por mesa tras colocar: 2 invitados = 2, 3 = 3, 4 = 4. Si todos son de la misma nacionalidad: 4, 6 u 8.
- Una silla compartida puntúa en las dos mesas. Si se colocan dos fichas, se evalúan en orden.
- Mesa de una sola nacionalidad (4 invitados de la misma nación): el jugador reduce permanentemente su mano en 1.
- Barra: 20 plazas en orden. Valores: +1, +2, +3, +4, +5, -2, -4, -6, -8, -10, -4, -6, -8, -10, -12, -6, -8, -10, -12, -14.
- En v1.0 se permite saldo negativo; la eliminación por deuda será una opción de sala en v1.1.
- Comodines: tienen sexo fijo y eligen nacionalidad al sentarse. No pueden ir a la barra. Se pueden cambiar por la ficha natural: no puntúa y no se roba.
- Fin de partida: última silla, plaza 20 de la barra, jugador sin fichas y sin robar, o robar la cuarta por el final.
- Puntuación final: se restan 5 puntos por ficha en mano y 10 por comodín. Empate: victoria compartida.

TABLERO
- Usa siempre packages/content/board.json.
- Invariantes: 24 mesas, 68 sillas, 28 compartidas, 20 plazas de barra, 4 sillas por mesa.
- No inventes mesas, sillas ni países.
- El mapeo está en docs/referencias/mapeo-mesas.md.

STACK
- Monorepo con pnpm.
- apps/web: Vite + React + TypeScript + React Three Fiber + Drei + Zustand + Tailwind CSS.
- apps/server: Node.js + Colyseus + SQLite + Drizzle.
- packages/engine: motor de reglas puro y determinista.
- packages/content: board.json, países, textos.
- packages/ui: componentes compartidos.
- tools: scripts de datos y assets.
- e2e: Playwright.
- Tests: Vitest + fast-check.
- PWA: vite-plugin-pwa.
- Despliegue: Render.

ESTRUCTURA
cafe-international/
  apps/web/
  apps/server/
  packages/engine/
  packages/content/
  packages/ui/
  tools/
  e2e/
  docs/

REGLAS DE CÓDIGO
- TypeScript estricto.
- packages/engine no importa React, Three ni DOM. Debe poder ejecutarse en Node y en el navegador.
- Servidor autoritativo: el cliente propone jugadas, el servidor valida y aplica.
- RNG con semilla para que todo sea reproducible.
- Funciones puras en el motor; nada de mutar el estado a lo loco.
- Nombres de archivos y variables en inglés; textos de interfaz en español.
- Sin `any` salvo justificación.
- Tests para cada regla y para los casos límite.
- Commits convencionales: feat:, fix:, docs:, test:, refactor:, chore:, art:.

REGLAS DE PRODUCTO
- Español primero; inglés más adelante.
- Sin voz, sin fotos, sin notas de voz, sin nombres reales. Solo nicknames.
- Chat de texto con emotes, efímero y separado del registro de eventos por turnos.
- Temporizador opcional por turno, máximo 180 segundos, con jugada automática al agotarse.
- Reconexión de 15 segundos; después expulsión. La mano vuelve a la bolsa; los invitados sentados se quedan. El expulsado puede volver como espectador.
- Revancha solo con voto unánime.
- Historial corto de 5 partidas.
- Arte original, estilo 2.5D papercraft, sin copiar assets oficiales.

CÓMO TRABAJAR
- Una fase por sesión.
- Antes de programar, lee los documentos indicados.
- Al terminar: pnpm typecheck, pnpm test y pnpm build en verde.
- Actualiza docs/SESIONES.md con lo hecho, las decisiones y lo siguiente.
- Actualiza docs/DECISIONES.md si has tomado alguna decisión.
- Haz commit y push.
- Si algo no está claro, pregunta antes de inventar.
```
