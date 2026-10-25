# Encargo Cafetulia v6 — Pulido de UI, cabecera, menús, final, cartas y movimiento

Eres **Gemini 4 Argon**. Trabajas sobre el ZIP `cafetulia-ui-v6.zip`, que contiene la integración de tu entrega anterior (v5) y dos correcciones ya aplicadas por nosotros. **No vuelvas a introducir los errores corregidos.**

## 0. Correcciones que ya están en la base y debes preservar

- La placa conmemorativa dice **`O & A`** (antes `O & C`). Aparece en el tablero 2D y en el Café Vivo 3D. Mi novia es Abril; no vuelvas a poner `O & C`.
- Las etiquetas de fin de partida usan las claves reales del motor: `player_empty_hand`, `bag_threshold_reached` y `last_player_standing`. No vuelvas a las claves antiguas.
- El resto de la integración v5 (dock, fichas 1:1, desplegables, enfoque de mesa, cámara 3D, subtítulos, avatares y monedas) se conserva.

## 1. Contexto y objetivo

Cafetulia es un juego cozy online de 2–4 jugadores basado en *Café International*. La UI debe ser cálida, clara, táctil y con movimiento; ahora mismo se percibe demasiado genérica (“AI”) y algunos elementos se rompen con puntuaciones altas. El objetivo de esta entrega es un **pase de pulido real**, no una capa de maquillaje:

1. Arreglar los bugs de layout y de menús.
2. Convertir el final en una secuencia memorable.
3. Unificar la dirección visual y el movimiento en todas las pantallas.
4. Mejorar las cartas y la jerarquía del tablero.
5. Explicar y despriorizar el cambio de comodín.
6. Mantener intactas las reglas, el tablero y la autoridad del servidor.

## 2. Lo que ya funciona y NO debes romper

- **Reglas y datos**: `packages/content/board.json` tiene 24 mesas, 68 sillas, 28 compartidas y 20 plazas de barra. No inventes ni cambies países, mesas, sillas ni reglas.
- **Motor puro**: `packages/engine` no importa React, Three ni DOM. El servidor es la autoridad; el cliente solo propone.
- **Interfaz en español estándar**, sin lenguaje inclusivo, sin voz, sin fotos, sin nombres reales y sin notas de voz.
- **Arte original**: nada de copiar assets, cartas o ilustraciones oficiales de *Café International*. Las fotos de `references/cards/` son solo referencia de composición; no deben acabar en `apps/web/public` ni en el build.
- **Stack**: pnpm, React/Vite, TypeScript estricto, Tailwind, Zustand, Motion (`motion` ya está instalado), Vitest, Playwright.
- **Salvaguardas técnicas**:
  - Node 24.20.0 y `pathToFileURL` en el servidor.
  - `DATABASE_URL`/`SQLITE_DB_PATH`.
  - `vitest.config.ts` con timeout de 300 s.
  - `playwright.config.ts` con `npx pnpm dev`.
  - `e2e/tsconfig.json` con `lib: ["ES2022", "DOM"]`.
  - `PapercraftBoard` con `React.lazy` + `Suspense`.
  - Service Worker solo en producción.
  - Limpieza de monedas voladoras a 1600 ms.
- **Layout actual**: portada, lobby y partida sin scroll de página en 1280×800 y 390×844; el tablero y el dock de la mano ocupan filas separadas y no se solapan.
- **Ya implementado**: 16 avatares, desplegables de avatar/subtítulos, 3 estilos de subtítulos (Cómic/Café/Arcade), enfoque de mesa, leyenda `?`, cámara 3D con vistas, monedas 1/5/10 con coin flip, fichas 1:1 sin texto y `aria-label`.
- **Verificación actual**: `typecheck`, 46 tests (incluida simulación de 1000 partidas), `build`, `lint` y E2E en verde. No entregues si algo de esto falla.

## 3. Bugs y mejoras, por prioridad

### P0.1 — Cabecera que se rompe con puntuaciones altas

**Problema reproducido:** con puntuaciones de 1234/987, la cabecera mide 86 px y el grupo de acciones cae a una segunda fila. En 1920×900 y 1280×800 ocurre lo mismo. Los botones de la izquierda quedan en una fila distinta y los popovers se recortan.

**Solución obligatoria:**

- Reestructura la cabecera en **dos filas estables**, sin `flex-wrap` global:
  - **Fila 1:** logo, código de sala, turno y temporizador a la izquierda; acciones a la derecha en **una sola fila**. En pantallas estrechas, las acciones secundarias se guardan en un botón «Menú»/«Más», pero **nunca se apilan debajo** de la marca.
  - **Fila 2:** marcador de jugadores a ancho completo, con scroll horizontal interno si hace falta. La página no debe hacer scroll.
- El marcador no debe empujar las acciones ni cambiar la altura de la cabecera al subir la puntuación. Fija alturas y usa `min-w-0`, `shrink-0`, `overflow-x-auto` y truncado de apodos.
- Para puntuaciones altas, no muestres todas las pilas de monedas en la cabecera. Muestra un resumen compacto: avatar + apodo + total (`1.234 pts`) + icono de moneda. El desglose exacto (10×123, 5×4, 1×4) puede ir en un tooltip o en el panel de detalle. Nunca dejes que una puntuación de 4 cifras ensanche la cabecera.
- `Bolsa: N` puede ir al final de la fila del marcador; no compite con las acciones.
- Prueba con 2, 3 y 4 jugadores y puntuaciones de 9999. A 1920×900, 1280×800 y 390×844: `scrollHeight <= innerHeight`, altura de cabecera estable y acciones siempre visibles.

**Criterio de aceptación:** una puntuación alta no mueve ningún botón de sitio; los botones de la izquierda y la derecha siguen legibles; no hay scroll de página.

### P0.2 — Menús que se solapan y popovers recortados

**Problema reproducido:** se puede abrir la leyenda `?` y «Manos» a la vez. El popover de «Manos» se ancla con `right-0` al botón; cuando el botón cae a la izquierda, el panel se sale por la izquierda y queda ilegible. La captura `docs/referencias/ui-v5-menus.png` lo muestra.

**Solución obligatoria:**

- Un solo overlay abierto a la vez: leyenda, manos, subtítulos, avatar, café 3D, Tertulia/registro y ajustes. Abrir uno cierra el anterior; abrir el mismo lo cierra.
- Implementa un estado único (`activeOverlay`) en la pantalla de partida y un hook compartido para los desplegables de portada/lobby/ajustes. No dejes estados independientes que puedan convivir.
- Cierra con `Escape`, clic/tap fuera y cambio de pantalla. Devuelve el foco al botón que abrió el panel. Mantén `aria-expanded`, `aria-controls`, `role="dialog"` y `aria-modal` cuando corresponda.
- **Nada de popovers recortados:** renderiza en un portal y calcula la posición con el rectángulo del disparador; limita al viewport, abre hacia arriba si no cabe abajo y limita la altura con scroll interno. No uses `right-0` a ciegas.
- En móvil, los paneles pueden ser una hoja inferior (`bottom sheet`) con animación, pero siempre dentro del viewport y con cierre claro.
- Añade pruebas: abrir leyenda → abrir manos → solo queda manos; clic fuera cierra; Escape cierra; el panel está dentro de `0..innerWidth` y `0..innerHeight` a 1280 y 390.

### P0.3 — Pantalla final escenificada

**Problema:** al terminar sigue apareciendo un modal genérico con «¡VICTORIA!» y una lista. No hay «¡FINAL!», ganador a gran escala, confeti, créditos ni revelación gradual del ranking.

**Solución obligatoria:** sustituye el modal por una **toma de pantalla completa** con esta secuencia (6–9 s, omitible):

1. **«¡FINAL!»** grande, tipo sello de tinta/cartulina, con entrada contundente y sonido.
2. **Ganador**: avatar y nombre enormes, puntuación y «Gana [nombre]» o «Victoria compartida» si hay empate. Si gana un bot, se indica con naturalidad.
3. **Confeti** de papel en colores café/crema/rojo/azul, durante 2–3 s. No uses solo la lluvia de monedas; el confeti debe ser visible y alegre.
4. **Ranking** completo en filas que entran escalonadas: posición, avatar, nombre, puntos, desglose y penalización. Los bots también aparecen.
5. **Créditos/postal** al final, con aparición suave: «Cafetulia — una tertulia de café», «Arte original», «Gracias por jugar» y una dedicatoria discreta **O & A** (sin nombres completos ni datos personales).
6. **Acciones** al terminar la secuencia: «Revancha» (con estado de voto), «Compartir/Generar postal» y «Volver a la portada». Deben ser accesibles antes de que acabe la animación con un botón «Saltar».

- Respeta `prefers-reduced-motion`: muestra el estado final sin animaciones largas.
- No bloquees la interacción más de lo necesario; el botón de omitir debe estar siempre visible.
- La pantalla debe caber en 390×844 sin scroll de página; si el ranking es largo, que haga scroll solo el bloque de ranking/créditos.
- Añade una prueba E2E que fuerce `phase = 'finished'` (interceptando la respuesta de la sala o con un fixture de test) y compruebe `¡FINAL!`, ganador, confeti/ranking y botones.

### P0.4 — Placa O & A

Ya está corregida en la base. Revisa que no quede ningún `O&C`, `O & C` ni `OxC` visible en la UI, el 3D o los créditos. Las menciones históricas de `docs/SESIONES.md` y `docs/DECISIONES.md` son solo registro. La placa debe decir **O & A**.

### P0.5 — Cambio de comodín: explicarlo y quitarle protagonismo

La regla se queda (es parte del juego), pero ahora el botón aparece cuando hay un cambio legal y no se entiende. El usuario no lo usa y no le ve utilidad.

- Muestra la acción **solo cuando `availableSwapMoves.length > 0`**, y con un texto contextual: «Cambiar comodín por [nombre]» o «Recuperar comodín».
- Añade un icono `?`/tooltip con esta explicación breve: «Entregas una ficha natural que podría ocupar esa silla y recuperas el comodín. No puntúas y no robas. Úsalo solo si te conviene.»
- Si hay varios cambios posibles, muestra **una sola acción** que abra un pequeño selector de silla/mesa; no llenes el dock de botones dorados.
- Pide confirmación o muestra un aviso claro; no lo ejecutes por accidente. Si no hay cambio legal, no muestres nada.
- Añade una línea a la leyenda del tablero y una prueba de que el botón no aparece sin cambio legal y sí con él.

### P1.1 — Jerarquía del tablero y cartas con carácter

**Problema:** las mesas redondas con bandera grande dominan y parecen fichas; las fichas sentadas son pequeñas. La mano ya tiene fichas cuadradas sin texto, pero el tablero no se lee con la misma claridad.

- Mantén la estructura fiel: **mesa** (redonda, mantel crema, bandera pequeña), **ficha sentada** (cuadrada 1:1, bandera de fondo + caricatura, sin texto), **silla compartida** (cojín bicolor + 2 banderitas), **silla vacía** (madera/crema neutra) y **barra central**.
- Reduce el protagonismo de la bandera de la mesa (12–16 px) y aumenta la ficha sentada (6–6.8 %). La ficha debe verse como una carta cuadrada apoyada en la silla, con sombra y borde de tinta.
- Las sillas legales deben brillar con claridad; la vista previa fantasma debe ser legible; el modo enfoque debe atenuar el resto sin perder el contexto.
- No añadas texto impreso dentro de las fichas. El nombre, país y sexo van en `aria-label` y en el panel de detalle al seleccionar.
- **Cartas**: mejora el dibujo para que sea caricatura original de tinta, con rasgos exagerados, expresiones irónicas y props de país; nada de vectores planos genéricos. Debe distinguirse el sexo y el país de un vistazo, sin caer en estereotipos ofensivos. Usa las fotos de `references/cards/` solo como inspiración de composición; no copies ninguna carta oficial.
- Comprueba los 24 personajes + 4 comodines (2M/2F). Nada de texto dentro de la ficha.

### P1.2 — Dock de la mano translúcido de verdad

- El dock actual (`bg-[#FFF9F0]/65`) se percibe casi opaco. Usa un papel translúcido real: `bg-[#FFF9F0]/40`–`/50` + `backdrop-blur-lg`, borde de tinta suave y sombra. Las fichas de la mano siguen **100 % opacas**.
- No solapes el tablero: tablero y dock en filas separadas. A 1280×800 y 390×844, `boardRect.bottom <= dockRect.top` y `scrollHeight <= innerHeight`.
- Cuida el contraste del texto sobre el fondo translúcido; si hace falta, usa una pastilla opaca para el texto.
- En móvil, las 5 fichas deben caber con áreas táctiles de al menos 44 px y sin scroll horizontal.

### P1.3 — Movimiento y fluidez en todas partes

La UI debe dejar de sentirse estática y genérica. Usa `motion` (ya instalado) con `AnimatePresence`, `LayoutGroup`, `MotionConfig reducedMotion="user"` y CSS para lo que sea más barato.

- **Pantallas**: portada → lobby → partida → final con transición (fade/scale/desplazamiento de papel o vapor de café), sin destellos blancos ni saltos.
- **Overlays**: menús, desplegables, drawers, modales y hojas móviles con entrada/salida animada y sin layout shift.
- **Juego**: selección de ficha (elevación), silla legal (pulso), colocación (asentado), monedas (vuelo), cambio de turno (pill), subtítulos (pop), enfoque de mesa (dim), barra (puntos), errores (toast).
- **Final**: la secuencia del P0.3.
- Duraciones 160–320 ms, springs suaves, sin animaciones eternas; 60 fps; nada de bloquear la interacción. Respeta reducción de movimiento.
- Botones con estados hover/press/focus visibles; no solo hover.
- No conviertas todo en `rounded-2xl` blanco con borde fino. Crea una dirección coherente de **papel/cartulina/imprenta**: textura sutil, bordes de tinta, sellos, cinta washi, tipografía serif para títulos y sans legible para UI. Nada de glassmorphism genérico.
- Revisa portada, lobby, ajustes, leyenda, manos, Tertulia, 3D y final para que parezcan el mismo juego.

### P1.4 — Sonido de monedas estilo arcade

- Sustituye `coinClink` por un sonido sintetizado **inspirado en el clásico “coin” de arcade**, pero original: dos notas rápidas ascendentes (por ejemplo, ~880→1174 Hz o ~988→1318 Hz), timbre brillante (square/triangle), 60–120 ms, un pequeño destello final. Sin samples, sin melodías copiadas de Nintendo y sin assets externos.
- `coinPenalty`: descendente, más seco; `barPositive`/`barNegative`: diferenciados; `victoryFanfare`: arpegio cálido.
- Respeta el volumen de SFX y el mute; no sature en móvil. El botón de desbloqueo de audio ya existe.
- Añade una prueba manual documentada (no hace falta test de audio automatizado).

### P1.5 — Arrastrar cartas: sí, pero opcional (decisión D-071)

La interacción principal sigue siendo **clic/tap**: es más accesible, funciona con teclado y lectores de pantalla y es más fiable en móvil. El drag es una mejora de sensación, no un requisito.

- Si lo implementas, que sea **opcional y adicional**: arrastrar una ficha a una silla legal, con fantasma, resaltado y snap; en móvil, long-press de ~180 ms para iniciar el arrastre sin romper el scroll.
- Mantén el flujo clic → silla → confirmar y todas las pruebas actuales. No añadas una dependencia pesada si puedes hacerlo con Pointer Events.
- Si el tiempo aprieta, **no lo hagas** y dilo; es P2. No sacrifiques P0/P1 por el drag.

### P1.6 — Otros detalles de pulido

- Revisa que «Cambiar comodín» y «Canjear comodín» usen el mismo término en toda la UI.
- Formatea puntuaciones grandes en español (`1.234`), sin romper el layout.
- Revisa los textos de la leyenda, el panel de detalle y los subtítulos; español estándar y tono cafetero, sin lenguaje inclusivo.
- En el 3D, mantén la cámara cercana y los invitados bebiendo; no vuelvas a alejarlos. Si el modal se ve pequeño en 1280, ajusta el `frameloop`/cámara, no el layout de la partida.

## 4. Archivos que probablemente tocarás

- `apps/web/src/components/Screens.tsx` — cabecera, menús, dock, final, textos.
- `apps/web/src/components/Modals.tsx` — desplegables y modales.
- `apps/web/src/components/IllustratedBoard.tsx` — jerarquía de mesas/sillas/fichas y enfoque.
- `apps/web/src/art/CharacterPortrait.tsx` — cartas y caricaturas.
- `apps/web/src/components/PapercraftBoard.tsx` — placa O & A y cámara 3D.
- `apps/web/src/components/CoinTray.tsx` — resumen compacto de monedas si hace falta.
- `apps/web/src/audio/soundEngine.ts` — sonido de moneda.
- `apps/web/src/store/gameStore.ts` — estado de overlay si lo centralizas.
- `packages/ui/src/index.ts` — roster, colores y utilidades.
- `e2e/tests/smoke.spec.ts` — pruebas de regresión.
- `docs/SESIONES.md`, `docs/DECISIONES.md`, `README.md`.

No toques `packages/content/board.json` ni las reglas salvo que encuentres un bug real y lo documentes. `packages/engine` debe seguir puro.

## 5. Pruebas y criterios de aceptación

Antes de entregar:

1. `npx pnpm typecheck`
2. `npx pnpm test` (46 tests + simulación de 1000 partidas; añade los nuevos)
3. `npx pnpm lint`
4. `npx pnpm build`
5. `npx pnpm test:e2e`

Añade como mínimo:

- **Cabecera con puntuaciones altas**: intercepta `GET /rooms/:code` en Playwright y pon 1234/987/9999; comprueba que la altura de la cabecera no cambia, que las acciones están en la misma fila y que no hay scroll.
- **Menús exclusivos**: abre leyenda y luego manos; solo uno visible; clic fuera y Escape; bounds dentro del viewport a 1280 y 390.
- **Final forzado**: `phase='finished'` con ganador y empate; comprueba «¡FINAL!», ganador grande, confeti/ranking y botones; prueba reducción de movimiento.
- **O & A**: la placa del tablero y el 3D contienen `O & A`; no existe `O & C`.
- **Comodín**: sin cambio legal no hay botón; con cambio legal aparece y el texto explica que no puntúa y no roba.
- **Sin scroll**: 1920×900, 1280×800 y 390×844; `scrollHeight <= innerHeight`; `boardRect.bottom <= dockRect.top`.

Capturas obligatorias:

- `docs/referencias/ui-v6-partida-1920.png`
- `docs/referencias/ui-v6-partida-1280.png`
- `docs/referencias/ui-v6-partida-movil.png`
- `docs/referencias/ui-v6-menus.png` (solo un menú abierto, sin recortes)
- `docs/referencias/ui-v6-final.png` (secuencia final)
- `docs/referencias/ui-v6-cartas.png` (detalle de cartas)

## 6. Entrega

- Incluye **todos los archivos nuevos y modificados** en el ZIP. No incluyas `node_modules`, `dist`, `.git`, `test-results` ni `playwright-report`.
- Añade un `CAMBIOS.md` con la lista exacta de archivos nuevos/modificados y una nota de qué se ha tocado.
- No incluyas las fotos de referencia en `apps/web/public` ni en el build; si las necesitas, déjalas en `references/` y dilo.
- En tu respuesta final, resume:
  - Qué has corregido.
  - Qué archivos has cambiado.
  - Resultado de typecheck/tests/lint/build/E2E.
  - Capturas y problemas conocidos.
- **No escribas “Ninguno” en problemas si queda algo abierto.** Si algo no está terminado, dilo con claridad.

## 7. Recordatorio de dirección de arte

El objetivo no es “más bonito” en abstracto: es que parezca un **juego de café de autor**, con papel, tinta, manteles, sellos y caricaturas. La calidez tiene que notarse en las transiciones, en los sonidos y en los detalles, no en añadir más tarjetas blancas redondeadas. Menos ruido, más jerarquía; menos “dashboard”, más tertulia.
