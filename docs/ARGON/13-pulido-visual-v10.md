# Encargo Cafetulia v10 — pasada visual (sin tocar reglas)

Trabajas sobre el ZIP `cafetulia-v10-visual.zip`. La base incluye la v8 visual y los arreglos v9 de móvil, turno, avatar y safe areas. **No rehagas la dirección visual ni cambies reglas, motor, servidor o `packages/content/board.json`.** Esta es una pasada de arte, jerarquía y composición.

## Diagnóstico rápido

La app ya es cozy y legible, pero en escritorio el tablero se queda pequeño en medio de mucho espacio vacío. En móvil el tablero y el HUD compiten por atención. Las mesas y sillas se leen como iconos planos, las fichas de la mano parecen cartas de personaje y cuesta distinguir de un vistazo:

- qué mesa está libre, ocupada o completada;
- qué asiento es legal;
- qué ficha es la seleccionada;
- qué jugador tiene el turno;
- qué acción toca ahora.

La lobby y el final funcionan, pero son paneles de papel flotando sobre la escena; pueden integrarse mejor en el café. Los avatares y algunos iconos no tienen todavía un estilo original cohesionado.

## Objetivo

Subir el acabado visual sin añadir mecánicas ni pantallas nuevas. La partida debe sentirse como sentarse en una mesa de café: tablero protagonista, fichas táctiles, HUD discreto, feedback claro y una identidad de arte coherente.

## Prioridades

### P0 — Tablero protagonista

- En escritorio, aprovecha el espacio: sube el tablero a unos 800–950 px si la altura lo permite (1920×1080 y 1280×800), sin scroll. En móvil mantén el ancho actual y el zoom.
- Si hace falta llenar los laterales en escritorio, añade una **barra lateral de mesa** discreta: jugadores, puntos y última jugada. No metas controles nuevos.
- Da volumen a las mesas: mantel claro, borde de madera, sombra suave, número de mesa y estado (libre / ocupada / completada). Las sillas vacías deben ser fantasmas; las ocupadas, pequeñas sillas con el color del país.
- Refuerza la jerarquía de asientos: asiento legal = aro cálido y pulso suave; asiento inválido = atenuado; selección = elevación y sombra, nunca solo color.
- La barra central debe parecer la barra del café, no un panel de puntos: madera, taburetes, pizarra de penalizaciones y luz cálida.
- Conserva la cuadrícula, coordenadas, mesas y sillas exactas de `board.json`.

### P1 — Fichas de la mano

- Rediseña las fichas como **posavasos/tarjetas táctiles** con bandera grande, nombre del país y puntos; el retrato de personaje queda para el perfil del jugador, no para cada ficha.
- Si se conservan los personajes en la mano, que sean un detalle secundario y no la imagen principal; la bandera y el país deben leerse primero.
- La ficha seleccionada se eleva, crece un poco y proyecta sombra; las no jugables se atenúan sin desaparecer. El comodín tiene borde dorado y un símbolo propio, no solo texto.
- Añade un pequeño contador de fichas y un estado vacío elegante (Sin fichas · pide barra o espera turno).
- Mantén las fichas centradas con 3, 4 o 5, como en v9.

### P1 — HUD con jerarquía

- Una sola fila visual dominante: jugador activo, turno, puntos y bolsa. Los botones de reglas, sonido y ajustes quedan secundarios.
- Reduce el ruido de mayúsculas, microtextos y bordes negros; usa el mismo sistema de papel, madera y latón de la v8.
- En móvil, agrupa utilidades en un menú “Más” y deja siempre visibles: turno, puntos, bolsa y mano. Que el tablero gane altura.
- El aviso de turno propio debe seguir siendo inequívoco, pero elegante: marco cálido, no alarmas rojas.

### P2 — Lobby como mesa preparada

- Haz de la mesa central el escenario: cuatro sillas alrededor, avatares sentados, sellos de “Listo”, plazas libres fantasma.
- La comanda del anfitrión (cubiertos, reloj, dificultad) puede vivir en un panel lateral de pizarra; el CTA “Tocar timbre y empezar” debe ser el foco.
- En móvil, una sola columna: mesa, luego ajustes plegados, luego CTA. Sin scroll horizontal.
- Conserva código de sala, copiar, salir y estados de conexión.

### P2 — Final tipo postal

- Mantén la postal, pero con composición de podio: ganador grande, segundo/tercero en fila, monedas y confeti dentro de la postal, no por toda la pantalla.
- Quita solapes de la cinta “¡FINAL!” y los botones; acciones al pie: Revancha, Postal, Portada.
- La postal generada debe seguir siendo legible en móvil y compartible.

### P2 — Sistema de arte

- Unifica grosores de línea, sombras y radios: papel = fino; madera = grueso; latón = brillo contenido.
- Sustituye iconos improvisados/emoji por un set propio coherente (taza, llave, timbre, bolsa, reloj, ajustes).
- Revisa los 16 avatares para que parezcan de la misma familia original, con siluetas claras y sin aspecto de imagen generada. Nada de fotos ni arte oficial.
- Usa el acento de cada país como detalle secundario; la bandera y el nombre siguen siendo la información principal (no depender solo del color).
- Respeta la paleta crema, espresso, terracota, verde botella y latón de `docs/ARTE_BIBLE.md`.

### P3 — Accesibilidad y pulido

- Contraste AA en textos pequeños; tamaños mínimos legibles; foco visible en teclado.
- Objetivos táctiles de 44 px como mínimo.
- `prefers-reduced-motion`: sin pulsos ni confeti; deja estados estáticos claros.
- Safe areas de iPhone y 390×844 sin scroll de página.
- No sacrifiques rendimiento: animaciones CSS transform/opacity; la escena 3D sigue diferida.

## Qué NO hacer

- No cambies reglas, penalizaciones, puntuación, turnos, baraja ni `board.json`.
- No añadas cuentas, matchmaking, chat, voz, fotos, nombres reales, modo asíncrono ni nuevas pantallas.
- No rehagas la portada v8 ni la dirección de arte aceptada; pule.
- No metas assets externos, fuentes nuevas ni arte oficial de *Café International*.

## Entrega

- ZIP con el proyecto completo actualizado, sin `node_modules`, `dist`, `.git`, `test-results`, `playwright-report` ni ZIPs viejos.
- `CAMBIOS.md` con archivos tocados y decisiones visuales.
- Capturas: `ui-v10-partida-1920.png`, `ui-v10-partida-1280.png`, `ui-v10-partida-movil.png`, `ui-v10-lobby.png`, `ui-v10-final.png`, `ui-v10-mano.png`.
- Resumen de tests: typecheck, lint, unitarios, build y E2E. Si algo no se puede verificar en iPhone real, dilo.
- Lista de lo que queda para una v11; no infles el alcance.

## Criterios de aceptación

- En 1920 el tablero se siente protagonista, no perdido.
- En 390 se entiende mesa, asiento legal, ficha seleccionada y turno sin explicación.
- La mano se lee como fichas de país, no como galería de personajes.
- La lobby parece una mesa preparada y el CTA de empezar es obvio.
- El final parece una postal de café y no un modal de administración.
- La identidad visual sigue siendo Cafetulia: cálida, artesanal, original y legible.
