# Entrega Cafetulia v7 — Menú de café, sonidos de UI y música viva

Fecha: **2026-10-25**.
ZIP de entrega: `cafetulia-v7.zip`.
Prompt implementado: `docs/ARGON/10-menu-sonido-musica.md`.

## Resumen de cambios implementados (v7)

### P0 — Portada y lobby como una escena de café + Ajustes «Sonido del café» + Transiciones de vapor/papel
- **Portada (`TitleScreen` en `apps/web/src/components/Screens.tsx`)**:
  - Escena de rincón de café en SVG/CSS (`CafeCornerIllustration`, `data-testid="title-cafe-scene"`): ventana arqueada con luz cálida, planta colgante, gato dormido en el alféizar, tocadiscos con vinilo, mesa con mantel y taza humeante, y placa `O & A`.
  - Avatar protagonista sentado/apoyado en la barra (`data-testid="title-hero-avatar"`): al pulsarlo abre el selector de 16 avatares (`AnchoredPopover`).
  - Saludo personalizado según la hora local y el apodo (`getCafeGreeting`, `data-testid="title-greeting"`): «Buenos días / Buenas tardes / Buenas noches, [apodo]» o saludo genérico si está en blanco, sin nombres reales.
  - Frase rotatoria discreta de pizarra (`CAFE_DAILY_PHRASES`, `data-testid="title-daily-phrase"`): «Hoy el café está fuerte», «La casa invita», «Mesa para dos», etc.
  - Carta de menú integrada (`data-testid="title-menu-card"`):
    - **Jugar contra bot** (`quick-start-btn`, primario con icono de taza humeante y microcopy).
    - **Crear sala** (`create-room-btn`, icono de reserva y microcopy).
    - **Unirse** (`join-room-btn` y campo `#room-code-input` integrado con icono de llave).
    - **Tutorial** (`title-tutorial-btn`), **Reglas** (`title-rules-btn`) y **Ajustes** (`title-settings-btn`) como acciones secundarias con icono SVG, microcopy y área táctil `>= 44 px`.
  - Sin scroll de página en `1920×900`, `1280×800` y `390×844`.
- **Lobby (`LobbyScreen` en `apps/web/src/components/Screens.tsx`)**:
  - Mesa preparada con 4 sillas alrededor del mantel (`data-testid="lobby-table-scene"`, `lobby-seat-0` .. `lobby-seat-3`).
  - Los bots ocupan su silla con animación y sonido propio (`botJoin`).
  - Código de sala en servilleta de papel (`data-testid="lobby-napkin-code"`): al copiar (`lobby-copy-code-btn`) muestra sello visual (`✓ Sello copiado`) y campanita (`uiCopy`).
  - «Listo» (`lobby-ready-btn`) deja un sello visual en la silla (`data-testid="lobby-ready-stamp"`) con sonido `uiReady`; «Empezar partida» (`start-game-btn`) suena a campana de mostrador + taza (`uiStart`).
  - Opciones de sillas (`lobby-maxplayers-control`: 2, 3, 4) y reloj (`lobby-timer-control`: Sin reloj, 30 s, 60 s, 90 s, 120 s) como controles táctiles segmentados.
- **Ajustes (`SettingsContent` en `apps/web/src/components/Modals.tsx`)**:
  - Sección **«Sonido del café»** (`data-testid="settings-sound-section"`) con un único botón accesible de `Silenciar todo` (`settings-mute-btn`), botón `Probar sonido` (`test-sound-btn`), selector de ambiente musical (`Tertulia / Lluvia / Noche`), sliders de música/ambiente/SFX (`slider-music`, `slider-ambience`, `slider-sfx`) con vista previa de tick cerámico (`uiSlider`) y ajuste de vibración háptica (`settings-haptics-toggle`).
  - Cabe en `390×844` sin scroll de página (con scroll interno dentro del modal).
- **Transiciones (`apps/web/src/App.tsx`)**:
  - Transición de vapor de café / papel (`250 ms`) entre Portada → Lobby → Partida → Final con `motion/react` y `AnimatePresence`, respetando `reducedMotion`.

### P1 — SFX de interfaz diferenciados y música lo-fi de 24 compases con variación (`apps/web/src/audio/soundEngine.ts`)
- **20 SFX de UI diferenciados + 12 SFX de juego**, cortos, sutiles y sintetizados con Web Audio API:
  - `uiPlay` (vapor + tintineo + acorde cálido), `uiCreateRoom` (sello de papel), `uiJoinRoom` (llave/pestillo), `uiTutorial` (página de papel), `uiRules` (libro sobre madera), `uiSettings` (clic cerámico), `uiCopy` (campanita de dos notas), `uiReady` (campana pequeña), `uiStart` (campana + taza), `uiLeave` (silla que se retira), `uiOpen` / `uiClose` (soplo de papel/vapor), `uiConfirm` / `uiCancel` (clic cálido / madera seca), `uiToggle`, `uiAvatar`, `uiSlider` (tick cerámico con throttle), `uiError` (golpe sordo suave), `uiHover` (solo escritorio con puntero fino y tras desbloqueo), `botJoin`.
- **Música lo-fi evolutiva con scheduler lookahead**:
  - Progresión de **24 compases (~80 s por vuelta)** dividida en secciones A1, A2, B (puente con melodía de trompeta con sordina) y A3, alternando el orden de secciones en vueltas impares para no repetir el mismo bucle.
  - 5 capas sintetizadas: contrabajo cálido, piano eléctrico Rhodes, escobillas suaves, trompeta apagada y ambiente de salón (vinilo, lluvia suave y tintineo lejano de porcelana).
  - Variación de filtro, tempo y densidad por pantalla (`title`, `lobby`, `playing`, `finished`) con crossfade suave (`setScreenTheme`).
  - **Ducking automático (`duckMusic`)**: la música baja suavemente al sonar un SFX o subtítulo y vuelve gradualmente.
  - Desbloqueo en el primer gesto táctil/teclado (`pointerdown`/`keydown`), sin autoplay forzado en iOS/Android.
  - `window.__CAFETULIA_STORE__` limitado a desarrollo/test (`import.meta.env.DEV || navigator.webdriver`).

## Lista exacta de archivos nuevos y modificados

- `packages/ui/src/index.ts` — `MusicMoodId`, `MUSIC_MOODS`, `CAFE_DAILY_PHRASES` y `getCafeGreeting(nickname, hour)`.
- `apps/web/src/audio/soundEngine.ts` — sistema de 20 SFX de UI + 12 SFX de juego, scheduler Web Audio con lookahead, progresión lo-fi de 24 compases con 5 capas, crossfade entre pantallas, ducking y háptica opcional.
- `apps/web/src/store/gameStore.ts` — conexión de acciones de sala/menú/overlays con los nuevos SFX de UI y restricción de `window.__CAFETULIA_STORE__` a desarrollo/test.
- `apps/web/src/App.tsx` — desbloqueo de audio en primer gesto móvil, `setScreenTheme(screen)` y transición de vapor/papel entre pantallas.
- `apps/web/src/components/Screens.tsx` — `TitleScreen` como escena de café con `CafeCornerIllustration`, avatar en barra, saludo horario, frase rotatoria y carta de menú; `LobbyScreen` como mesa de 4 sillas con código en servilleta, sello de listo y controles táctiles.
- `apps/web/src/components/Modals.tsx` — sección «Sonido del café» en Ajustes (`settings-sound-section`, `test-sound-btn`, `settings-mute-btn`, `slider-music`, `slider-ambience`, `slider-sfx`, selector `Tertulia/Lluvia/Noche` y háptica).
- `apps/web/src/utils/moveHelper.test.ts` — tests unitarios de `getCafeGreeting`, `CAFE_DAILY_PHRASES` y `MUSIC_MOODS` (49 tests en total).
- `e2e/tests/smoke.spec.ts` — suite E2E actualizada para validar la escena de portada, mesa de lobby, ajustes de sonido, áreas táctiles `>= 44 px`, ausencia de scroll en `1920×900`, `1280×800` y `390×844` y generación de las 5 capturas `ui-v7-*.png`.
- `docs/referencias/ui-v7-portada-1920.png` — captura de portada en `1920×900`.
- `docs/referencias/ui-v7-portada-1280.png` — captura de portada en `1280×800`.
- `docs/referencias/ui-v7-portada-movil.png` — captura de portada en `390×844`.
- `docs/referencias/ui-v7-lobby.png` — captura de lobby con mesa de 4 sillas, bot sentado y sello de listo en `1280×800`.
- `docs/referencias/ui-v7-ajustes-sonido.png` — captura del modal Ajustes con la sección «Sonido del café» en `1280×800`.
- `docs/ARGON/10-menu-sonido-musica.md` y `docs/ARGON/README.md` — especificación del encargo v7.
- `docs/SESIONES.md`, `docs/DECISIONES.md`, `README.md` y `CAMBIOS.md` — documentación actualizada.

## Checklist manual para prueba en iPhone / Android real

1. Abrir la URL en Safari (iOS) o Chrome (Android): comprobar que no salta ningún error de autoplay y que el primer toque en cualquier botón desbloquea la música lo-fi y el SFX correspondiente.
2. En la portada, pulsar el avatar apoyado en la barra (`Editar`) y cambiar de avatar; comprobar el clic suave (`uiAvatar`) y que el saludo («Buenos días / tardes / noches, [apodo]») se actualiza al escribir apodo.
3. Abrir `Ajustes → Sonido del café`: mover los sliders de Música, Ambiente y Efectos (comprobar el tick cerámico), cambiar entre `Tertulia`, `Lluvia` y `Noche`, pulsar `Probar sonido` y verificar `Silenciar todo`.
4. Crear sala, pulsar `Copiar invitación` en la servilleta, añadir un bot (`+ Bot`), alternar `Sello: Listo` y pulsar `Empezar partida`: verificar los sonidos diferenciados de servilleta, silla de bot, sello y campana de cafetería.
5. Instalar en pantalla de inicio (PWA) y verificar safe areas en vertical (`390×844`) sin scroll de página.

## Ajustes de integración local (Sesión 021)

- `apps/web/src/components/Screens.tsx` — mano centrada respecto al dock completo con rejilla de tres columnas; fallback de copiado al portapapeles.
- `src/main.tsx` — registro del service worker en el entry real de producción (antes el build no lo registraba).
- `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png`, `public/apple-touch-icon.png` — iconos PWA.
- `public/manifest.webmanifest`, `index.html`, `public/sw.js` — manifest, enlaces de iconos y caché `cafetulia-shell-v4`.
- `docs/referencias/ui-v7-mano-centrada-1920.png`, `ui-v7-mano-centrada-1280.png` — evidencia del centrado.
- `docs/SESIONES.md`, `docs/DECISIONES.md` — Sesión 021 y D-081/D-082.

### Cómo se está sirviendo

- Producción local: `0.0.0.0:3000`.
- LAN: `http://172.20.10.6:3000`.
- PWA HTTPS temporal: `https://logging-pretty-flow-expression.trycloudflare.com`.

El túnel es temporal; el HTTP local no permite service worker/PWA en el teléfono. Para instalar, usar la URL HTTPS mientras el PC y `cloudflared` estén encendidos.
