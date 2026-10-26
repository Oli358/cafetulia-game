# Entrega Cafetulia v8 — Dirección visual, materiales táctiles y animaciones

Fecha: **2026-10-26**.
Prompt implementado: `docs/ARGON/11-pulido-visual-animaciones.md`.

## Resumen de cambios implementados (v8)

### 1. Tipografía autoalojada y materiales de imprenta (`packages/web`, `apps/web/src/index.css`)
- **Tipografía autoalojada (`@fontsource/fraunces` y `@fontsource/nunito-sans`)**:
  - `Fraunces` (700) para títulos, saludos, cabeceras de carta, marcadores y números (`tabular-nums`).
  - `Nunito Sans` (400, 600, 700, 800) para interfaz, microcopy, etiquetas y controles.
- **Materiales táctiles y superficies (`docs/ARTE_BIBLE.md`)**:
  - Grano sutil de papel de algodón (`.cafe-paper-sheet`, `.cafe-paper-subpanel`), doble filete editorial de imprenta (`.cafe-double-rule`, `.cafe-double-frame`) y fichas de cartón troquelado con canto 3D, bisel interior y sombra de contacto (`.cafe-cardboard-tile`, `.cafe-cardboard-tile-selected`).
  - Sistema de botones con personalidad física (`.cafe-btn-primary`, `.cafe-btn-paper`, `.cafe-btn-sage`) con elevación táctil en hover (`-1.5px`), presión física (`+2px`) y foco de alto contraste.

### 2. Portada como escena envolvente de café (`TitleScreen` en `apps/web/src/components/Screens.tsx`)
- **Escenario arquitectónico a pantalla completa**:
  - Fondo SVG envolvente con ventanal francés arqueado, haz de sol de tarde, tres lámparas colgantes de latón y opalina, estanterías con botes de café y láminas botánicas, y zócalo de madera tallada (`wainscoting`) continuo en `1920×900`, `1280×800` y `390×844`.
- **Rincón vivo de barra (`title-cafe-scene`) + Carta de la Casa (`title-menu-card`)**:
  - `CafeCornerIllustration` con parallax suave de 3 capas al mover el puntero, vapor continuo en la taza (`animate-cafe-steam`), planta colgante con vaivén (`animate-cafe-plant`), gato dormido que mueve la cola (`animate-cafe-tail`), tocadiscos con vinilo y placa conmemorativa **O & A**.
  - En móvil (`390×844`) la ilustración conserva todo el encuadre (`preserveAspectRatio="xMidYMid meet"`, `104 px` de alto) y la carta de menú se despliega como hoja impresa sin scroll de página.
  - Platos numerados y jerarquizados con iconos SVG de línea de tinta hechos a medida: **Jugar contra bot** (recomendación del maître), **Crear sala**, **Unirse con código** (ticket perforado) y tira inferior de **Tutorial**, **Reglas** y **Ajustes**.

### 3. Lobby como mesa redonda preparada con 4 sillas (`LobbyScreen` en `apps/web/src/components/Screens.tsx`)
- **Mesa redonda central despejada + 4 sillas físicas alrededor (`lobby-table-scene`)**:
  - Disposición en 3 columnas en escritorio/tablet (`[Sillas 1 y 3 | Mesa redonda con mantel bordado | Sillas 2 y 4]`) para que la mesa redonda de madera con mantel de lino, 4 tazas de porcelana orientadas a cada silla, cruasanes y medallón **O & A** se vea completa y sin solapes.
  - Cada silla (`lobby-seat-0` .. `lobby-seat-3`) tiene respaldo curvo de madera, cojín tapizado, número de cubierto y sello inclinado de tinta verde (`✓ Listo`).
  - Código de sala sobre servilleta de reserva (`lobby-napkin-code`) con pespunte dorado y botón `✓ Sello copiado` (`lobby-copy-code-btn`).
  - Controles táctiles de comensales (`2, 3, 4 sillas`) y reloj de cortesía (`Sin reloj, 30 s, 60 s, 90 s, 120 s`) + pie con campanita de mostrador.

### 4. Tablero, mazo centrado en abanico, retratos 3/4 y pantalla final (`IllustratedBoard.tsx`, `CharacterPortrait.tsx`, `Modals.tsx`, `Screens.tsx`)
- **Tablero con profundidad de madera y luz cálida (`IllustratedBoard.tsx`)**:
  - Marco de madera con bisel, luz de tarde que sigue suavemente al puntero en escritorio y halo cálido bajo las mesas al pasar el ratón o enfocar sillas.
  - Sillas libres, válidas y compartidas diferenciadas con anillo ámbar/salvia; fichas sentadas (`seated-mini-tile`) con canto de cartón 3D.
- **Caricaturas 3/4 más expresivas (`CharacterPortrait.tsx`)**:
  - Sombras suaves bajo el rostro y barbilla (`cel-shading`), cuellos/solapas de vestuario por nación, bisel superior de cartulina e hitos de tinta más expresivos para las 12 naciones y el comodín.
- **Mazo centrado (`player-hand-dock`) y etiqueta de cata (`selected-tile-detail`)**:
  - Se conserva intacto el centrado matemático del mazo respecto al dock completo (`minmax(0,1fr) auto minmax(0,1fr)`).
  - Ligero abanico de mano (`-2.2°` a `+2.2°`) con elevación al pasar el puntero o seleccionar, y tarjeta de detalle con ojal de latón y cita del personaje.
  - En móvil (`390×844`), el logotipo de cabecera de partida oculta el texto `Cafetulia` (`hideTextOnMobile`) para que la píldora `Tu turno` se lea completa sin truncarse.
- **Modales y cuaderno de camarero (`Modals.tsx`, `Screens.tsx`)**:
  - Ajustes rediseñado como **Mesa de control del café · O & A**, Tutorial como **Cuaderno de bienvenida**, Reglas como **Edición impresa · O & A** y registro/chat como **Cuaderno de camarero · O & A**.
- **Final escenificado (`FinishedScreen`)**:
  - Ventanal nocturno de fondo, lluvia de 36 piezas de confeti de papel/latón y **Postal de despedida** con sello de victoria, desglose y placa **O & A**.

## Lista exacta de archivos modificados

- `package.json` y `apps/web/package.json` — `@fontsource/fraunces` y `@fontsource/nunito-sans`.
- `apps/web/src/index.css` y `src/index.css` — tipografía autoalojada, grano de papel, bordes dobles de imprenta, fichas con canto de cartón y keyframes de vapor/planta/gato/vinilo.
- `apps/web/src/art/CharacterPortrait.tsx` — caricaturas 3/4 con sombreado suave, cuellos/solapas, bisel de cartón y `CafetuliaLogo` con soporte `hideTextOnMobile`.
- `apps/web/src/components/IllustratedBoard.tsx` — marco de madera con bisel, foco cálido de puntero en el salón y profundidad de fichas en mesa.
- `apps/web/src/components/Screens.tsx` — escena arquitectónica completa en `TitleScreen`, mesa redonda central con 4 sillas en `LobbyScreen`, abanico de mano, etiqueta de cata, cuaderno de camarero y `FinishedScreen` como postal de despedida.
- `apps/web/src/components/Modals.tsx` — `SettingsContent`, `TutorialContent` y `RulesContent` con acabado editorial de café.
- `e2e/tests/smoke.spec.ts` — suite E2E v8 que verifica las 3 resoluciones sin scroll, centrado del mazo, sala perdida y genera las 7 capturas `ui-v8-*.png`.
- `docs/referencias/ui-v8-portada-1920.png` — portada en `1920×900`.
- `docs/referencias/ui-v8-portada-1280.png` — portada en `1280×800`.
- `docs/referencias/ui-v8-portada-movil.png` — portada móvil en `390×844`.
- `docs/referencias/ui-v8-lobby.png` — lobby con mesa redonda y 4 sillas en `1280×800`.
- `docs/referencias/ui-v8-partida-1920.png` — partida en curso en `1920×900` con mano centrada.
- `docs/referencias/ui-v8-partida-movil.png` — partida móvil en `390×844`.
- `docs/referencias/ui-v8-final.png` — pantalla final escenificada en `1280×800`.
- `docs/SESIONES.md`, `docs/DECISIONES.md`, `README.md` y `CAMBIOS.md` — documentación actualizada.
