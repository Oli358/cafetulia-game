# Encargo Cafetulia v9 — Ajustes de móvil, turno y perfil

Trabajas sobre el ZIP `cafetulia-v9-ajustes.zip`. La base ya incluye una **primera pasada** de estos arreglos. Tu trabajo es revisarla, terminarla, pulirla y dejarla verificada. **No rehagas la v8 ni cambies reglas, motor, servidor o `board.json`.**

## Contexto

La v8 se probó en iPhone/PWA real. La dirección visual gusta y se siente fluida, pero aparecieron estos problemas concretos:

1. El botón de zoom está dentro del tablero, en la esquina superior derecha, y tapa la última silla de España.
2. Cuando quedan menos fichas, la mano deja de estar centrada y se va a la izquierda.
3. En móvil, con 4 jugadores, la píldora `Bolsa: N` queda dentro del scroll del marcador y parece parte del nombre de un jugador.
4. El selector de avatar es una cuadrícula incómoda; se quiere un **scroll horizontal** sencillo. Además, el apodo y la foto no deben poder cambiarse durante la partida.
5. El turno propio se nota poco; hace falta un aviso mucho más evidente.
6. En iPhone/PWA, la zona de la isla dinámica se ve blanca y no coincide con el fondo; el texto inferior de la portada no se lee. La vibración no funciona en iPhone.
7. La jugabilidad es fluida, pero “le falta algo”: más feedback de turno y de colocación.

## Arreglos obligatorios

### 1. Zoom sin tapar sillas

- Saca los controles de zoom/flechas **fuera del cuadrado del tablero**, en una fila propia encima de él (solo móvil).
- Nunca deben cubrir una mesa, silla, ficha ni la barra.
- Mantén el zoom 1.35×, las flechas de paneo y el botón de volver a 1×.
- A 390×844 no debe haber scroll de página ni solapes; el tablero puede reducirse unos píxeles para hacer sitio.

### 2. Mano siempre centrada

- La fila de fichas debe centrarse respecto al dock completo, con **3, 4 o 5 fichas**.
- No uses una rejilla fija de 5 columnas en móvil: usa flex centrado con fichas de tamaño estable (mínimo 44 px táctiles), y en escritorio mantén el abanico actual.
- El panel de detalle y los botones de confirmar/cambiar comodín no deben desplazar el centro.
- Verifica con 5 y con 3 fichas a 1920, 1280 y 390.

### 3. Marcador móvil con 4 jugadores

- La fila de jugadores puede hacer scroll horizontal, pero **`Bolsa: N` no puede formar parte de ese scroll** ni quedar encima de un nombre.
- En móvil, pon `Bolsa: N` en una fila separada debajo o en una zona fija con fondo; en escritorio puede seguir integrada.
- Comprueba que al desplazar hasta el último jugador se lee su nombre y puntuación sin que “Bolsa” parezca un jugador.

### 4. Avatar y perfil

- Cambia el selector de avatar a un **carrusel horizontal** con snap/scroll táctil, avatares grandes y etiqueta legible. Debe funcionar con teclado y mantener `role="radiogroup"`.
- En **partida y pantalla final**, el apodo y el avatar quedan **bloqueados**: no se pueden cambiar desde Ajustes ni desde la cabecera. Muestra el dato en modo lectura y un aviso claro.
- En portada y lobby sí se pueden cambiar.
- Mantén los 16 avatares prehechos y `avatarId`; no añadas subida de fotos.

### 5. Aviso de turno mucho más evidente

- Añade un **marco cálido animado alrededor de toda la pantalla** cuando es tu turno, con pulso lento (2–3 s). Debe verse en móvil y escritorio sin tapar la UI ni bloquear clics.
- Refuerza el aviso con un sonido corto de campana al empezar tu turno y, en Android, una vibración breve si el usuario la tiene activada.
- Respeta `prefers-reduced-motion`: sin pulso, pero con marco estático visible.
- No confundas “tu turno” con “turno del rival”: el marco solo aparece cuando `isMyTurn`.

### 6. iPhone / PWA / safe areas

- Añade `viewport-fit=cover` y safe areas para la isla dinámica y el home indicator.
- El fondo de la zona superior debe integrarse con el tema crema; no debe quedar una banda blanca plana. Usa `theme-color` coherente y, si iOS ignora el color, documenta la limitación y elige el acabado menos roto.
- No dejes texto pequeño pegado al borde inferior: oculta el footer prescindible en móvil o dale fondo/contraste y `padding-bottom: env(safe-area-inset-bottom)`.
- **iPhone no soporta `navigator.vibrate`**: no es un bug que se pueda arreglar con código. Usa sonido + marco visual como alternativa y etiqueta la opción como “vibración en Android”. No prometas vibración en iOS.

### 7. Game feel: que la jugada se sienta

- Al colocar una ficha: pequeño asentado/compresión, sonido ya existente y puntos que aparecen con claridad.
- Al completar una mesa o recibir una penalización: feedback visual breve y legible.
- Al cambiar de turno: transición suave del marco/píldora; sin bloquear.
- No añadas nuevas mecánicas ni pantallas; solo respuesta táctil/visual.

## Restricciones

- No toques reglas, `packages/engine`, `apps/server`, `packages/content/board.json`.
- Conserva todas las correcciones v6/v7/v8: cabecera, overlays, final, mano centrada, PWA, sala perdida, `O & A`.
- Mantén los 49 tests y los 2 E2E; añade comprobaciones para:
  - zoom fuera del tablero y sin solape;
  - mano centrada con 3 y 5 fichas;
  - bolsa separada del scroll con 4 jugadores;
  - avatar bloqueado en partida;
  - marco de turno visible.
- Nada de arte oficial, fotos, voz, nombres reales ni assets externos.
- No incluyas `.aistudio/`, `metadata.json`, `bun.lock` ni ZIPs viejos.

## Entrega

- ZIP con todos los archivos nuevos/modificados; sin `node_modules`, `dist`, `.git`, `test-results`, `playwright-report`.
- `CAMBIOS.md` con la lista exacta de archivos.
- Capturas: `ui-v9-movil-zoom.png`, `ui-v9-mano-3.png`, `ui-v9-marcador-4.png`, `ui-v9-turno.png`, `ui-v9-avatar-scroll.png`.
- Resumen de tests, capturas y problemas pendientes.
- Si algo de iPhone no se puede verificar sin dispositivo, dilo; no escribas “Ninguno”.

## Criterios de aceptación

- El zoom no tapa ninguna silla.
- La mano queda centrada con cualquier número de fichas.
- La bolsa no se confunde con un jugador en móvil.
- El avatar se elige con un scroll cómodo y queda bloqueado durante la partida.
- El turno propio se nota al instante, también con reduced motion.
- La PWA de iPhone no tiene una banda blanca fea ni texto inferior ilegible.
- La jugada se siente más tangible sin ralentizar el ritmo.
