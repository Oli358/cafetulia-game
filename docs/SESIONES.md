# Registro de sesiones

> Documento vivo. Se añade una entrada por cada sesión de trabajo, **la más reciente arriba**.
> Formato: fecha, objetivo, hecho, decisiones, problemas y siguiente paso.

---

## Sesión 023 — 2026-10-26 — Diagnóstico de “Jugada inválida” con movimientos válidos

**Objetivo:** localizar el fallo que dejaba a un jugador sin poder colocar cartas aunque fuera su turno y las jugadas parecieran válidas.

**Diagnóstico:**
- El mensaje genérico **“Jugada inválida.”** solo aparece cuando la respuesta del servidor no trae un `message` de regla. Las reglas sí devuelven mensajes concretos (“No es tu turno”, “La silla ya está ocupada”, etc.).
- El caso que encaja es un **404 `ROOM_NOT_FOUND`**: la sala había desaparecido del servidor (reinicio de AI Studio/local, recarga del proceso o pérdida de la sala). El cliente seguía mostrando el tablero antiguo y cada intento recibía un 404 que se mostraba como “Jugada inválida.”.
- `pollRoom` ignoraba silenciosamente los 404, así que la UI se quedaba congelada en una partida que ya no existía.
- También había dos riesgos menores: se podía enviar dos veces la misma jugada (doble clic) y un borrador viejo podía sobrevivir a un cambio de turno/rechazo.

**Hecho:**
- `submitMove` y `pollRoom` detectan `404`/`ROOM_NOT_FOUND` y vuelven a la portada con el aviso:
  “La sala ya no existe. Puede que el servidor se haya reiniciado; vuelve a crear una sala.”
- Los errores usan ahora `data.message` o `data.error.message`; ya no se muestra “Jugada inválida.” si el servidor explica el motivo.
- Al rechazar una jugada se limpian selección/borrador y se refresca la sala.
- Al cambiar de turno se limpian selección/borrador para no reutilizar un estado viejo.
- Añadido bloqueo de una sola petición de jugada en vuelo para evitar dobles envíos.
- Añadido E2E: simula un 404 al enviar una jugada y comprueba que aparece el aviso y se vuelve a la portada.

**Verificación:**
- `typecheck` ✅
- **49 tests** ✅
- `build` ✅
- `lint` ✅
- E2E: **2 tests** ✅ (suite completa + sala desaparecida).

**Problemas:**
- Las salas viven en memoria; si el servidor se reinicia, la partida no se puede recuperar. Ahora al menos se avisa y no se queda bloqueada.
- Si vuelve a pasar, el mensaje ya dirá si es sala perdida, turno, silla ocupada u otra regla.

**Siguiente:**
1. Repetir la partida con dos jugadores y confirmar que no vuelve a quedarse bloqueada.
2. Si aparece otro rechazo, anotar el mensaje exacto y la acción.

---

## Sesión 022 — 2026-10-25 — Cierre del puerto LAN y túnel HTTPS activo

**Objetivo:** dejar de exponer el puerto local en la Wi-Fi y mantener la web accesible por HTTPS para la prueba en teléfono.

**Hecho:**
- `server.ts` acepta `HOST` (por defecto `0.0.0.0` para Render).
- Servidor de producción reiniciado con `HOST=127.0.0.1`: el puerto `3000` ya no escucha en la LAN.
- `http://172.20.10.6:3000` queda cerrado; `http://127.0.0.1:3000` sigue funcionando para el túnel.
- Cloudflare Tunnel sigue activo: `https://logging-pretty-flow-expression.trycloudflare.com`.
- Verificado `/health` por localhost y por el túnel; la LAN devuelve conexión rechazada.

**Decisiones:**
- El túnel HTTPS se mantiene mientras el PC y `cloudflared` estén encendidos; el acceso directo por LAN queda cerrado.

**Problemas:**
- Si se apaga el PC o se reinicia `cloudflared`, la URL temporal deja de estar disponible.

**Siguiente:**
1. Probar la v7 en el teléfono con la URL HTTPS.
2. Continuar mañana con los ajustes que salgan de la prueba.

---

## Sesión 021 — 2026-10-25 — Integración v7, mano centrada y montaje PWA local

**Objetivo:** integrar la entrega v7, corregir el descentrado de la mano que se ve en la captura del usuario y dejar una versión de producción montada en local para instalar la PWA desde el teléfono.

**Hecho:**
- Extraído e integrado `cafetulia (6).zip`: `apps/web/src`, `packages/ui/src` y E2E. No se copiaron `.aistudio`, `metadata.json` ni ZIPs antiguos.
- Verificado: `typecheck`, **49 tests**, `build`, `lint` y E2E completos en verde.
- Corregido el **mazo/mano descentrado**: el dock usa una rejilla `minmax(0,1fr) auto minmax(0,1fr)` en escritorio; la fila de fichas queda exactamente en el centro del dock, tanto con 3 como con 5 cartas.
  - Medido: dock centro `960` / mano centro `960` a 1920×900; dock centro `640` / mano centro `640` a 1280×800.
  - Capturas: `docs/referencias/ui-v7-mano-centrada-1920.png` y `ui-v7-mano-centrada-1280.png`.
- Corregido el **service worker de producción**: el entry real del build es `src/main.tsx` (raíz), que no registraba `/sw.js`; ahora sí lo hace solo en `PROD`.
- Añadidos iconos PWA reales: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` y `apple-touch-icon.png`; actualizado `manifest.webmanifest`, `index.html`, `sw.js` (`cafetulia-shell-v4`) y cabeceras de iconos.
- Añadido fallback de copiado al portapapeles para HTTP/móvil, evitando el `NotAllowedError` de `navigator.clipboard`.
- Montado build de producción en `0.0.0.0:3000` y túnel HTTPS de Cloudflare:
  - LAN: `http://172.20.10.6:3000` (Wi-Fi; puerto 3000).
  - PWA HTTPS: `https://logging-pretty-flow-expression.trycloudflare.com`.
  - Comprobado con CDP: `Page.getInstallabilityErrors` devuelve `[]`; manifest e iconos sirven 200; service worker activo.
- La PWA se puede instalar desde el túnel HTTPS; el HTTP local sirve para jugar en la misma Wi-Fi, pero no para service worker/PWA en móvil.

**Decisiones:**
- La mano se centra siempre respecto al dock completo, no respecto al espacio que deja el panel de detalle (D-081).
- Para probar la PWA en teléfono se usa un túnel HTTPS temporal y iconos PNG 192/512/maskable; el túnel no es permanente (D-082).

**Problemas:**
- El túnel de Cloudflare es temporal y cambia si se reinicia; depende de que el PC y el proceso sigan encendidos.
- Queda la prueba real en iPhone/Android: audio tras el primer toque, safe areas, táctil y rendimiento.
- El aviso de chunk `three-vendor` de 683 kB sigue ahí, aunque el 3D es lazy.

**Siguiente:**
1. Que el usuario pruebe la v7 en el teléfono con la URL HTTPS.
2. Corregir lo que salga de la prueba real.
3. Desplegar en Render.

---

## Sesión 020 — 2026-10-25 — Implementación y verificación completa de Cafetulia v7 (`10-menu-sonido-musica.md`)

**Objetivo:** aplicar al completo el encargo `docs/ARGON/10-menu-sonido-musica.md` sobre la base v6 verificada: convertir la portada y el lobby en una escena viva de café, añadir SFX de UI diferenciados por acción, evolucionar la música lo-fi a una progresión de 24 compases con capas y crossfades, y dejar lista la entrega para probar en iPhone/Android.

**Hecho:**
- **P0 — Portada, Lobby, Ajustes «Sonido del café» y transiciones (`Screens.tsx`, `Modals.tsx`, `App.tsx`, `packages/ui`):**
  - Portada rediseñada con escena ilustrada en SVG (`CafeCornerIllustration`: ventana arqueada, planta colgante, gato dormido, tocadiscos con vinilo, mesa con taza humeante y placa `O & A`), avatar protagonista en la barra (`title-hero-avatar`) que abre el selector de avatares, saludo horario personalizado (`getCafeGreeting`), frase rotatoria de pizarra (`CAFE_DAILY_PHRASES`) y carta de menú (`title-menu-card`) con iconos SVG, microcopy y áreas táctiles `>= 44 px`.
  - Lobby rediseñado como mesa preparada con 4 sillas (`lobby-table-scene`, `lobby-seat-0..3`), código de sala en servilleta con sello de copiado (`lobby-napkin-code`), sello visual de «Listo en mesa» (`lobby-ready-stamp`), entrada animada de bots y controles táctiles segmentados para sillas y reloj (`lobby-maxplayers-control`, `lobby-timer-control`).
  - Modal de Ajustes ampliado con la sección «Sonido del café» (`settings-sound-section`): botón único de `Silenciar todo`, `Probar sonido`, selector de atmósfera (`Tertulia / Lluvia / Noche`), sliders con tick cerámico de vista previa y ajuste de vibración háptica.
  - Transición de vapor de café / papel (`250 ms`) entre pantallas con `motion/react` y `AnimatePresence`, respetando `reducedMotion`.
- **P1 — SFX de UI diferenciados y música lo-fi de 24 compases (`soundEngine.ts`, `gameStore.ts`):**
  - Añadidos 20 SFX de UI diferenciados (`uiPlay`, `uiCreateRoom`, `uiJoinRoom`, `uiTutorial`, `uiRules`, `uiSettings`, `uiCopy`, `uiReady`, `uiStart`, `uiLeave`, `uiOpen`, `uiClose`, `uiConfirm`, `uiCancel`, `uiToggle`, `uiAvatar`, `uiSlider`, `uiError`, `uiHover`, `botJoin`) junto a los 12 SFX de partida.
  - Motor musical con scheduler Web Audio (lookahead de `0.25 s` cada `85 ms`), progresión de 24 compases (~80 s por vuelta) con secciones A1/A2/B/A3 y orden alterno en vueltas impares, 5 capas sintetizadas (contrabajo, Rhodes, escobillas, trompeta con sordina en sección B y ambiente de vinilo/lluvia/tazas), crossfade entre pantallas (`setScreenTheme`) y ducking automático (`duckMusic`).
  - Limitada la exposición de `window.__CAFETULIA_STORE__` a desarrollo/test (`import.meta.env.DEV || navigator.webdriver`).
- **Verificación y capturas:**
  - `npx pnpm typecheck`, `npx pnpm test` (**49 tests** + 1.000 partidas simuladas), `npx pnpm lint`, `npx pnpm build` y `npx pnpm test:e2e` en verde.
  - Generadas y verificadas visualmente las 5 capturas requeridas en `docs/referencias/ui-v7-portada-1920.png`, `ui-v7-portada-1280.png`, `ui-v7-portada-movil.png`, `ui-v7-lobby.png` y `ui-v7-ajustes-sonido.png`.

**Decisiones:**
- Se cierran e implementan en código D-075 (portada y lobby como escena de café), D-076 (20 SFX de UI diferenciados con ducking y háptica opcional), D-077 (música lo-fi de 24 compases con scheduler Web Audio y 3 atmósferas) y D-080 (`window.__CAFETULIA_STORE__` restringido a desarrollo/test).

**Problemas:**
- Queda pendiente la validación física en un iPhone/Android real y el despliegue final en Render (el entorno de CI/Playwright ejecuta Chromium sin hardware de audio físico, por lo que se incluye checklist manual en `CAMBIOS.md`).

**Siguiente:**
1. Probar `cafetulia-v7.zip` en iPhone/Android real con la checklist manual de `CAMBIOS.md`.
2. Desplegar en Render.

---

## Sesión 019 — 2026-10-25 — Preparación del encargo v7: menú, sonido y música

**Objetivo:** cerrar el alcance del siguiente pase de Argon y preparar un ZIP limpio y un prompt corto para copiar y pegar, sin hacerle leer documentación larga.

**Hecho:**
- Alcance cerrado: portada/lobby como escena de café personalizada, SFX de UI por acción y música lo-fi con capas, variación y transiciones.
- Se mantiene todo lo bueno de la v6 y no se tocan reglas, tablero, servidor ni arte oficial.
- La v7 se prepara para que el usuario la pruebe directamente en iPhone/Android; el audio, las safe areas, el táctil y la PWA entran en el alcance.
- Creado el prompt `docs/ARGON/10-menu-sonido-musica.md` y el ZIP `cafetulia-v7.zip`.
- No se han integrado los ZIPs antiguos que venían en `public/assets/aistudio/`; el ZIP de entrega va limpio.

**Decisiones:**
- Se implementan D-075 (portada escena), D-076 (SFX de UI) y D-077 (música con variación). D-078 y D-079 se mantienen como salvaguardas.

**Problemas:**
- La prueba real en teléfono queda para cuando vuelva la v7.
- El E2E no puede validar audio ni fluidez real; se añade checklist manual.

**Siguiente:**
1. Enviar `cafetulia-v7.zip` y el prompt 10 a Argon.
2. Integrar la v7, ejecutar tests y preparar la prueba en móvil.
3. Corregir lo que falle en el teléfono y desplegar en Render.

---

## Sesión 018 — 2026-10-25 — Integración v6, verificación y auditoría de menú, sonido y música

**Objetivo:** integrar la entrega v6 de Argon, comprobar que los P0/P1 del prompt 09 están realmente resueltos y detectar lo que falta para el siguiente pase centrado en menú, sonido y música.

**Hecho:**
- Extraído y analizado `cafetulia (5).zip`.
- Integrados `apps/web/src`, `packages/ui/src`, `apps/web/package.json`, `e2e/tests/smoke.spec.ts` y `.gitignore`, conservando las salvaguardas del proyecto.
- **No** se han integrado los artefactos accidentales del ZIP: `.aistudio/`, `metadata.json` ni `public/assets/aistudio/*.zip` (5,9 MB de ZIPs antiguos). Se ha añadido su exclusión a `.gitignore`.
- Verificado:
  - `typecheck` ✅
  - **48 tests** + simulación de 1.000 partidas ✅
  - `build` ✅ (aviso de chunk `three-vendor` de 683 kB, pero carga diferida)
  - `lint` ✅
  - E2E ✅ en 1920×900, 1280×800 y 390×844, sin scroll.
- Comprobado visualmente:
  - La cabecera ya es estable en dos filas con 1.234/987/9.999 puntos.
  - Los overlays son mutuamente excluyentes y los popovers quedan dentro del viewport.
  - La pantalla final ya tiene «¡FINAL!», ganador grande, confeti, ranking, créditos y O & A.
  - El tablero tiene mejor jerarquía: banderas de mesa pequeñas y fichas sentadas cuadradas más grandes.
  - El dock es más translúcido y no pisa el tablero.
  - El cambio de comodín está contextualizado y explicado.
- Auditoría de lo nuevo que pide el usuario:
  - La portada sigue siendo un formulario central estático sobre un fondo crema vacío; no hay escena de café, saludo personalizado, avatar protagonista ni botones con personalidad.
  - El lobby es una tarjeta estática; añadir bots, copiar código y empezar no tienen sonido propio ni animación específica.
  - Los botones de menú no reproducen SFX; solo algunos botones de juego y el desbloqueo de audio.
  - La música sigue siendo el mismo bucle de 4 acordes cada 1,58 s, sin melodía, capas, variación ni transición entre pantallas.
  - El confeti final es escaso (24 piezas, muchas fuera del primer plano) y los créditos aparecen de golpe; se puede escenificar mejor.
  - `window.__CAFETULIA_STORE__` queda expuesto también en producción; conviene limitarlo a desarrollo/test.
- Capturas nuevas en `docs/referencias/ui-v6-desktop.png`, `ui-v6-mobile.png`, `ui-v6-high-scores.png`, `ui-v6-menus.png`, `ui-v6-joker-swap.png` y `ui-v6-finished.png`.

**Decisiones:**
- El menú dejará de ser un formulario estático y pasará a ser una escena de café personalizada (D-075).
- Cada acción de UI tendrá un SFX corto y diferenciado, con volumen bajo y mute global (D-076).
- La música mantendrá el estilo lo-fi de café, pero con capas, melodía, variación y transiciones; no un bucle de cuatro acordes (D-077).
- Los ZIPs de entregas anteriores no deben viajar dentro de `public/assets/aistudio` ni acabar en el build (D-078).
- Antes del siguiente encargo se probará la v6 en teléfono real (D-079).

**Problemas:**
- El menú, el lobby y los ajustes se perciben estáticos y poco personalizados.
- No hay sonido de UI por acción; la experiencia táctil queda muda.
- La música es repetitiva y no cambia entre portada, lobby, partida y final.
- Falta probar en iPhone/Android reales y desplegar en Render.
- El ZIP de Argon incluyó artefactos antiguos que habría que borrar si se copiara entero.

**Siguiente:**
1. Decidir el alcance del pase v7 (menú, sonido, música y pruebas en teléfono).
2. Preparar el prompt y el ZIP con solo los archivos necesarios.
3. Integrar la v7 y probar en móvil real antes de Render.

---

## Sesión 017 — 2026-10-25 — Implementación y verificación completa del pulido UI v6 (`09-pulido-ui-v6.md`)

**Objetivo:** aplicar al completo el encargo `docs/ARGON/09-pulido-ui-v6.md` (P0 bugs de cabecera, menús, pantalla final, placa `O & A` y `Cambiar comodín`; P1 jerarquía del tablero, caricaturas 3/4, dock translúcido, transiciones `motion/react`, sonido arcade de monedas y drag opcional; P2 salvaguardas y verificación E2E).

**Hecho:**
- **P0.1 — Cabecera estable en dos filas (`Screens.tsx`, `CoinTray.tsx`, `packages/ui`):**
  - Separada la fila 1 de acciones (`flex-nowrap`, altura fija) de la fila 2 del marcador compacto (`avatar + apodo + 1 icono de moneda + saldo formateado con formatScoreEs + cartas` y `Bolsa: N`).
  - Probado con puntuaciones de `1234`, `987` y `9999`: la cabecera no cambia de altura ni empuja los botones a una segunda línea.
- **P0.2 — Menús mutuamente excluyentes y popovers siempre dentro del viewport (`gameStore.ts`, `Modals.tsx`, `Screens.tsx`):**
  - Añadido `activeOverlay` global en Zustand; abrir cualquier menú/popover/modal cierra el anterior automáticamente y cambiar de pantalla limpia todos los overlays.
  - Creado `<AnchoredPopover>` con `createPortal` y cálculo dinámico de coordenadas con clamp estricto dentro de `[8, innerWidth - 8]` y `[8, innerHeight - 8]`, soporte de `Escape`, clic fuera y hoja inferior en móvil.
- **P0.3 — Pantalla final escenificada a pantalla completa (`Screens.tsx`):**
  - `FinishedScreen` rediseñada con sello `¡FINAL!`, hero del ganador (`Gana [nombre]` / `¡Victoria compartida!`), lluvia de confeti de papel, clasificación escalonada con bots, bloque de créditos con `Dedicatoria: O & A` y botones `Generar postal`, `Volver a la portada`, `Votar revancha` y `Saltar`.
- **P0.4 — Placa `O & A`:**
  - Verificada en la barra 2D (`bar-plaque-oa`), en el Café Vivo 3D y en los créditos finales (`final-credits-oa`), sin rastro de `O & C`.
- **P0.5 — `Cambiar comodín` explicado y contextual (`Screens.tsx`, `Modals.tsx`):**
  - Unificado el término `Cambiar comodín` en toda la interfaz; botón secundario contextual (`Cambiar comodín por [nombre]`) que abre un popover explicativo con confirmación antes de enviar la jugada.
- **P1.1 a P1.5 — Jerarquía del tablero, caricaturas 3/4, dock translúcido, `motion/react`, sonido arcade de dos notas y drag opcional:**
  - Mesas con bandera central de `14px` y fichas sentadas cuadradas al `6.5%` del tablero.
  - `CharacterPortrait.tsx` con caricaturas originales en 3/4 expresivo para los 24 personajes y los 4 comodines (`tileId`), sin texto impreso.
  - Dock de mano con `bg-[#FFF9F0]/45 backdrop-blur-lg` y fichas 100% opacas.
  - Transiciones con `motion/react` en pantallas, modales y popovers, respetando `reducedMotion`.
  - Sonido de moneda arcade de dos notas ascendentes (`B5 → E6`) en `soundEngine.ts`.
  - Soporte opcional de arrastrar y soltar fichas hacia sillas legales y barra central.
- **Verificación y capturas:**
  - `npx pnpm typecheck`, `npx pnpm test` (**48 tests** + 1.000 partidas simuladas), `npx pnpm lint`, `npx pnpm build` y `npx pnpm test:e2e` en verde.
  - Generadas y revisadas las 6 capturas en `docs/referencias/ui-v6-desktop.png`, `ui-v6-mobile.png`, `ui-v6-high-scores.png`, `ui-v6-menus.png`, `ui-v6-joker-swap.png` y `ui-v6-finished.png`.

**Decisiones:**
- Se consolidan e implementan en código D-070 (`O & A`), D-071 (clic/tap principal + drag opcional), D-072 (sonido arcade de dos notas), D-073 (cabecera en dos filas + `activeOverlay` exclusivo + `<AnchoredPopover>` con clamp de viewport) y D-074 (`FinishedScreen` escenificada por fases).

**Problemas:**
- Ninguno en local: todos los tests unitarios, de servidor, de simulación y E2E están en verde.

**Siguiente:**
1. Desplegar en Render y verificar en iPhone/Android reales.

---

## Sesión 016 — 2026-10-25 — Integración v5, auditoría de UI y preparación del pulido v6

**Objetivo:** integrar la entrega v5 de Argon (claridad de tablero, fichas cuadradas, dock translúcido, desplegables y 3D cercano), comprobar sus afirmaciones y preparar el siguiente encargo con los nuevos errores detectados.

**Hecho:**
- Extraído y analizado `cafetulia (4).zip`.
- Integrados `apps/web/src`, `packages/ui/src`, `e2e/tests/smoke.spec.ts` y `apps/web/src/main.tsx`, conservando las salvaguardas del proyecto (Node 24.20.0, `pathToFileURL`, `DATABASE_URL`/`SQLITE_DB_PATH`, timeout de Vitest, Playwright local, `lib: ["ES2022", "DOM"]` en e2e, `React.lazy` del 3D y service worker solo en producción).
- Corregidos:
  - Etiquetas de fin de partida (`player_empty_hand`, `bag_threshold_reached`, `last_player_standing`).
  - Placa conmemorativa **O & A** en tablero 2D y 3D (antes `O & C`).
- Verificado: `typecheck`, **46 tests**, `build`, `lint` y E2E completos en verde.
- Auditoría específica con puntuaciones altas y menús abiertos:
  - La cabecera pasa de una fila a **86 px** y los botones de acción bajan a una segunda fila (medido a 1920×900 y 1280×800); en 390×844 llega a **112 px** y las acciones bajan a `y=77`.
  - La leyenda y «Manos» pueden quedar abiertos a la vez; el popover de «Manos» se ancla con `right-0` al botón desplazado a la izquierda y se recorta fuera de la pantalla.
  - La pantalla final sigue siendo un modal genérico: no hay «¡FINAL!», ganador a gran escala, confeti, créditos ni revelación escalonada del ranking.
  - Las cartas de la mano son cuadradas y sin texto, pero en el tablero las mesas-redondas con bandera dominan visualmente y las fichas sentadas quedan diminutas; la jerarquía aún no es inequívoca.
  - El dock tiene `bg-[#FFF9F0]/65`, pero se percibe casi opaco; conviene aumentar la transparencia y el blur.
  - El botón de cambiar comodín aparece sin explicación suficiente y compite con la acción principal.
- Capturas de la auditoría en `docs/referencias/ui-v5-partida-1920.png`, `ui-v5-partida-1280.png`, `ui-v5-partida-movil.png`, `ui-v5-menus.png` y `ui-v5-final.png`.
- Preparado el prompt `docs/ARGON/09-pulido-ui-v6.md` y el ZIP `cafetulia-ui-v6.zip` para la siguiente iteración de Argon.

**Decisiones:**
- La placa conmemorativa usa **O & A** (D-070).
- La interacción principal será clic/tap; arrastrar será una mejora opcional, nunca la única forma (D-071).
- El sonido de moneda será sintetizado e inspirado en el arcade clásico, sin samples de Nintendo (D-072).
- Cabecera en dos filas, menús mutuamente excluyentes y popovers siempre dentro del viewport (D-073).
- Final escenificado por fases: FINAL → ganador → confeti → ranking → créditos (D-074).

**Problemas:**
- Los bugs de cabecera, menús y final siguen abiertos; el siguiente ZIP debe corregirlos.
- La UI todavía se percibe genérica y con pocas transiciones; falta un pase de movimiento global.
- El cambio de comodín necesita explicación contextual y menos protagonismo.
- Render y las pruebas en iPhone/Android reales siguen pendientes.

**Siguiente:**
1. Enviar `cafetulia-ui-v6.zip` y el prompt 09 a Argon.
2. Integrar y verificar la v6 con puntuaciones altas, menús y final forzado.
3. Desplegar en Render y probar en móviles reales.

---

## Sesión 012 — 2026-10-25 — v1.2: bugs P0 y mejoras P1/P2

**Objetivo:** integrar la cuarta versión de Argon con los bugs P0 corregidos y las mejoras de cartas, monedas, avatares, subtítulos, 3D y PWA.

**Hecho:**
- Extraído y analizado `cafetulia (3).zip`.
- Integrados:
  - Colores de monedas 1 negra / 5 roja / 10 azul, pilas exactas y coin flip con arco, giro 3D y sombra.
  - `AnimatedScore` corregido con ref y dependencias estables.
  - Cartas con cinta de país, badge MUJER/HOMBRE, retrato grande, nombre y frase.
  - Tablero limpio: banderas solo en mesas y sillas compartidas.
  - 16 avatares prehechos con `avatarId` en cliente, servidor, API y tipos del motor.
  - Subtítulos de eventos tipo Rocket League, activables en Ajustes.
  - Café Vivo 3D con invitados sentados, tazas, sorbo idle y 20 posavasos.
  - Service worker, carga diferida del 3D, code-splitting y `render.yaml` para plan free.
- Conservadas nuestras correcciones: Node 24, `pathToFileURL`, `DATABASE_URL`, build script, timeout de tests y Playwright local.
- Corregidos:
  - Tipos de `e2e` con `lib: ["ES2022", "DOM"]`.
  - Etiquetas de fin de partida.
  - Cámara del modal 3D para que no se corte el tablero.
  - Limpieza de monedas voladoras a 1600 ms para no cortar la animación.
  - `PapercraftBoard` ahora se carga con `lazy` + `Suspense` (chunk propio).
  - Service worker solo en producción.
- Verificado:
  - `typecheck`, `build`, `lint` → OK.
  - **46 tests en verde**.
  - E2E completo: portada, lobby y partida sin scroll en 1280×800 y 390×844; avatares; cartas; sillas; modal 3D.
  - Jugada real con monedas y cartas nuevas.
- Capturas nuevas en `docs/referencias/ui-portada.png`, `ui-portada-movil.png`, `ui-partida.png`, `ui-partida-movil.png` y `ui-cafe-3d.png`.

**Decisiones:**
- v1.2 integrada y verificada (D-065).
- 16 avatares prehechos y `avatarId` compartido (D-066).
- Subtítulos de eventos activables (D-067).
- Monedas 1/5/10 con coin flip (D-068).
- Café Vivo 3D con carga diferida (D-069).

**Problemas:**
- En el modal 3D las personas se ven pequeñas con el zoom por defecto; conviene acercar la cámara o añadir enfoque de mesa.
- Las frases de las cartas pequeñas se recortan; habría que acortarlas o moverlas a un panel de detalle.
- Render free usa SQLite en `/tmp` (efímero); para persistencia real haría falta un plan con disco o Postgres.
- Falta probar en iPhone/Android reales y desplegar.

**Siguiente:**
1. Desplegar en Render y probar en móviles reales.
2. Ajustar zoom 3D por defecto y legibilidad de cartas.
3. QA final con la novia.

---

## Sesión 011 — 2026-10-25 — Rediseño de UI v3

**Objetivo:** integrar la nueva versión de Argon con el rediseño visual: pantalla única, tablero ilustrado, cartas con personalidad y monedas animadas.

**Hecho:**
- Extraído y analizado `cafetulia (2).zip`.
- Integrados los nuevos componentes:
  - `IllustratedBoard.tsx`: tablero ilustrado con mesas, sillas, fichas, barra central y nombres.
  - `CoinTray.tsx`: bandeja de monedas 1/5/10, contador animado y capa de monedas voladoras.
  - `CHARACTER_ROSTER` en `packages/ui`: 24 personajes + 2 comodines con nombre, país, frase y pedido.
- Nuevo layout de partida en `100dvh`, sin scroll de página, con:
  - Header compacto con sala, turno, temporizador y marcador de monedas.
  - Manos rivales en desplegable.
  - “Ver café” como modal 3D.
  - Registro y chat en cajón lateral.
  - Mano fija abajo con cartas 2:3 en abanico.
  - “¿Por qué no puedo?” como toast junto a la silla.
- Conservadas nuestras correcciones de servidor/engine/Playwright/Node.
- Corregidos:
  - La bandeja mostraba una moneda de 1 con 0 puntos.
  - La cámara del modal 3D recortaba la parte inferior del tablero.
  - Las etiquetas de motivos de fin de partida.
- Verificado:
  - `npx pnpm typecheck` → OK.
  - `npx pnpm test` → **44 tests en verde**.
  - `npx pnpm build` → OK.
  - `npx pnpm lint` → sin errores.
  - `npx playwright test` → **1 E2E en verde**.
  - **Sin scroll** en 1280×800 y 390×844.
  - Capturas nuevas en `docs/referencias/ui-partida.png`, `ui-partida-movil.png` y `ui-cafe-3d.png`.

**Decisiones:**
- Rediseño de UI v1.1 integrado y verificado (D-062).
- 24 personajes con nombre y frase + 2 comodines (D-063).
- Monedas 1/5/10 con animación de ida y vuelta (D-064).

**Problemas:**
- El tablero ilustrado sigue siendo muy denso: 24 mesas + 68 sillas con banderas compiten entre sí. Habría que reducir el ruido visual de las sillas vacías.
- El bundle principal pesa ~830 KB (Three.js incluido).
- La PWA no tiene service worker/offline.
- Falta probar en iPhone/Android reales y desplegar en Render.

**Siguiente:**
1. Desplegar en Render.
2. Probar en móviles reales.
3. Simplificar el tablero: sillas vacías con color/forma, no bandera; bandera solo en mesas y sillas compartidas.
4. Añadir service worker y code-splitting.

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
