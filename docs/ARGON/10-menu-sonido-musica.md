# Encargo Cafetulia v7 — Menú de café, sonidos de UI y música viva

Trabajas sobre el ZIP `cafetulia-v7.zip`, que contiene la **v6 ya integrada y verificada**. Aplica solo este alcance: **portada/lobby, SFX de interfaz y música**. No rehagas el juego ni cambies reglas.

## Estado actual y límites

- **48 tests**, `typecheck`, `build`, `lint` y E2E en verde. No los rompas.
- La v6 ya tiene: cabecera estable en dos filas, `activeOverlay` + `AnchoredPopover`, final escenificado, placa `O & A`, cambio de comodín contextual, jerarquía de tablero, dock translúcido y drag opcional.
- **No toques** `packages/content/board.json`, `packages/engine` ni las reglas. El servidor sigue siendo la autoridad.
- Conserva Node 24.20.0, `pathToFileURL`, `DATABASE_URL`/`SQLITE_DB_PATH`, timeout de Vitest, Playwright local, `lib` DOM en e2e, `React.lazy` del 3D y service worker solo en producción.
- Español estándar, sin lenguaje inclusivo, sin voz, sin fotos, sin nombres reales y sin arte oficial.
- Cero presupuesto: usa Web Audio, CSS, SVG y `motion` (ya instalado). No añadas dependencias pesadas.
- **No incluyas** `.aistudio/`, `metadata.json`, `public/assets/aistudio/` ni ZIPs antiguos. El ZIP anterior venía con 5,9 MB de basura; no la repitas.

## Problema

La portada y el lobby siguen siendo un formulario estático sobre un fondo crema vacío. A 1280 sobra mucho espacio y no hay escena, avatar protagonista ni saludo. Los botones de menú no suenan: solo hay SFX de juego. La música es el mismo bucle de 4 acordes cada 1,58 s, sin melodía, capas ni transición entre pantallas. El E2E corre con `reducedMotion`, así que valida layout, no fluidez ni audio.

## P0 — Portada y lobby como una escena de café

### Portada

Convierte la portada en una pequeña escena de café, manteniendo toda la funcionalidad actual:

- Ilustración de fondo o lateral: mesa, taza con vapor, ventana, planta, gato, tocadiscos. Nada de imágenes externas; CSS/SVG.
- El **avatar** del jugador aparece sentado o apoyado en la barra. Al pulsarlo, abre el selector de avatar existente.
- Saludo personalizado: «Buenas tardes, [apodo]» según la hora local. Si no hay apodo, un saludo genérico. Sin nombres reales.
- El formulario actual se convierte en una **carta de menú** integrada en la escena:
  - **Jugar contra bot** (primario, con vapor/brillo).
  - **Crear sala**.
  - **Unirse** (campo de código integrado, sin perder el formulario).
  - **Tutorial**, **Reglas**, **Ajustes** como acciones secundarias.
- Cada botón con icono, microcopy corta y estados hover/press/focus. Nada de botones gigantes genéricos.
- Frase rotatoria discreta: «Hoy el café está fuerte», «La casa invita», «Mesa para dos».
- En 1920×900, 1280×800 y 390×844: sin scroll de página, sin solapes, texto legible y áreas táctiles de 44 px.
- Mantén los `data-testid` actuales (`title-screen`, `quick-start-btn`, `create-room-btn`, `join-room-btn`, `avatar-dropdown-btn`, `subtitles-dropdown-btn`, etc.).

### Lobby

Haz que el lobby se sienta como una mesa preparada, sin cambiar su lógica:

- Cuatro sillas alrededor de una mesa; los avatares de los jugadores se sientan en ellas.
- Los bots ocupan sillas con una animación y sonido propios.
- El código de sala aparece en una servilleta/tarjeta; al copiar, sello y sonido.
- «Listo» deja un sello visual; «Empezar» suena a campana de cafetería.
- Opciones de jugadores y reloj como controles táctiles, no selects enormes.
- Sigue siendo el mismo lobby funcional, con los mismos testids (`lobby-screen`, `add-bot-btn`, `start-game-btn`).

### Ajustes

- Añade una sección «Sonido del café» con sliders de música/ambiente/SFX, botón de **probar sonido** y **silenciar todo**.
- Vista previa de cada sonido al mover el slider o pulsar el test.
- No dupliques el mute: si ya existe, hazlo visible y accesible.
- Todo debe caber en 390×844 sin scroll de página; el modal puede hacer scroll interno.

### Transiciones

- Portada → lobby → partida con una transición de **vapor de café / papel** (200–350 ms), no un fundido plano.
- Usa `motion/react` y `AnimatePresence`; respeta `reducedMotion`.
- Los menús y popovers mantienen su animación actual; no los rompas.

## P1 — SFX de interfaz diferenciados

Amplía `apps/web/src/audio/soundEngine.ts` con un pequeño sistema de sonidos de UI. Deben ser cortos, sutiles y satisfactorios; no una feria.

Añade tipos nuevos, por ejemplo: `uiOpen`, `uiClose`, `uiConfirm`, `uiCancel`, `uiToggle`, `uiReady`, `uiCopy`, `uiStart`, `uiError`, `uiHover` (opcional). Mapea:

- **Jugar**: vapor + tintineo de taza + acorde cálido.
- **Crear sala**: sello de papel.
- **Unirse**: llave/pestillo.
- **Tutorial**: página que se pasa.
- **Reglas**: libro que se apoya.
- **Ajustes**: clic cerámico.
- **Copiar código**: campanita de dos notas.
- **Listo**: campana pequeña.
- **Empezar**: campana + taza.
- **Salir**: silla que se retira.
- **Abrir/cerrar menú**: soplo de papel/steam.
- **Confirmar/cancelar**: clic cálido / madera seca.
- **Error**: golpe sordo, sin agresión.
- **Avatar/subtítulo**: click suave distinto.
- **Slider**: tick de cerámica al cambiar de valor.

Reglas de sonido:

- Un sonido por acción; no dispares en cada render.
- En móvil, solo tap/click; el hover con sonido es opcional y solo en escritorio, a volumen muy bajo.
- Desbloquea AudioContext en el primer gesto; nada de autoplay.
- Respeta el mute y los volúmenes; si suena música, bájala ligeramente (ducking) durante SFX/subtítulos.
- Haptics opcionales: `navigator.vibrate` en confirmar/error, con ajuste para desactivar. Si no está disponible, ignóralo.
- No uses samples de Nintendo ni melodías copiadas.

## P1 — Música lo-fi con variación

Mantén el estilo de café que gusta, pero deja de ser un bucle de cuatro acordes:

- Progresión más larga (16–32 compases) con melodía sencilla y capas: bajo, Rhodes, percusión suave, trompeta apagada, vinilo.
- Secciones A/B y pequeñas variaciones humanizadas; no siempre el mismo orden.
- Temas o variaciones para portada, lobby, partida y final, con **crossfade** al cambiar de pantalla.
- La música baja al sonar SFX/subtítulos y vuelve suavemente.
- Usa un scheduler de Web Audio con lookahead; evita `setInterval` para el timing musical.
- Volumen por defecto bajo; no sature en móvil.
- Si añades un selector, que sea simple: **Tertulia / Lluvia / Noche**. No es obligatorio.
- Todo original y sintetizado; sin samples con copyright.

## P1 — Móvil y calidad (la v7 se probará en teléfono)

El usuario probará esta v7 directamente en iPhone/Android. No necesitas un dispositivo físico, pero la entrega debe estar lista para ello: audio, safe areas, táctil y PWA no pueden quedar “para luego”.

- Audio: el primer toque debe desbloquear; comprueba que no hay autoplay fallido en iOS.
- Safe areas, notch y teclado en 390×844; sin scroll de página.
- Mantén el 3D con carga diferida y el rendimiento.
- Limita `window.__CAFETULIA_STORE__` a desarrollo/test si es posible.
- No incluyas ZIPs viejos en `public/`.
- Añade pruebas E2E para: portada/lobby con nuevos testids, sin scroll en 1920/1280/390, ajustes de sonido visibles, y que los menús sigan siendo exclusivos.
- No intentes automatizar audio; deja una checklist manual.

## Archivos probablemente afectados

`apps/web/src/components/Screens.tsx`, `apps/web/src/components/Modals.tsx`, `apps/web/src/audio/soundEngine.ts`, `apps/web/src/App.tsx`, `apps/web/src/index.css` (si hace falta), `packages/ui/src/index.ts` (helpers), `e2e/tests/smoke.spec.ts`, `docs/SESIONES.md`, `docs/DECISIONES.md`, `README.md`, `CAMBIOS.md`.

## Entrega

- ZIP con **todos** los archivos nuevos y modificados; sin `node_modules`, `dist`, `.git`, `test-results`, `playwright-report` ni ZIPs antiguos.
- `CAMBIOS.md` con la lista exacta de archivos.
- Capturas: `docs/referencias/ui-v7-portada-1920.png`, `ui-v7-portada-1280.png`, `ui-v7-portada-movil.png`, `ui-v7-lobby.png`, `ui-v7-ajustes-sonido.png`.
- Resumen final: qué has hecho, archivos, tests, capturas y problemas pendientes.
- No escribas “Ninguno” si queda algo abierto.

## Criterios de aceptación

- La portada y el lobby se sienten como una escena de café personalizada, no como un formulario.
- Cada acción importante tiene un SFX distinto, corto y agradable; el mute funciona.
- La música mantiene el estilo lo-fi, pero evoluciona y no repite el mismo bucle en menos de un minuto.
- Todo sigue sin scroll en 1920×900, 1280×800 y 390×844.
- La v7 queda lista para abrir en iPhone/Android: audio tras el primer toque, safe areas, táctil y PWA.
- Los 48 tests actuales siguen verdes y el E2E cubre los cambios de layout.
- No se han tocado reglas, tablero, servidor ni arte oficial.
