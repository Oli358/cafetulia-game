# Encargo Cafetulia v8 — Dirección visual y animaciones

Trabajas sobre el ZIP `cafetulia-v8-visual.zip`, que contiene la **v7 integrada y verificada** más los arreglos de mano centrada, PWA, service worker y sala perdida. Este encargo es **exclusivamente visual y de movimiento**: no añadas funcionalidades nuevas, no cambies reglas y no rehagas el motor.

## Estado actual y límites

- **49 tests**, `typecheck`, `build`, `lint` y **2 tests E2E** en verde. No los rompas.
- La v7 ya tiene: portada con escena de café, avatar, saludo y carta de menú; lobby con mesa; 20 SFX de UI; música lo-fi de 24 compases; cabecera estable; menús exclusivos; tablero con jerarquía; fichas 3/4; `Cambiar comodín` contextual; final escenificado y placa `O & A`.
- **No toques** `packages/content/board.json`, `packages/engine`, `apps/server` ni la lógica de salas. No cambies reglas, turnos, puntuación, barra, comodines ni condiciones de fin.
- Conserva los `data-testid` existentes y el flujo funcional (crear/unirse, lobby, partida, revancha, PWA).
- Español estándar, sin lenguaje inclusivo, sin voz, sin fotos, sin nombres reales y sin arte oficial.
- Nada de imágenes externas, CDNs, fuentes remotas ni assets de *Café International*. Todo debe ser CSS/SVG original o fuentes autoalojadas.
- No añadas dependencias pesadas. Para tipografía puedes usar `@fontsource` (autoalojado) si hace falta.
- Respeta `prefers-reduced-motion` y la accesibilidad existente.

## Objetivo

Que Cafetulia deje de parecer una app web con tarjetas y empiece a parecer un **juego de café de autor**: papel, tinta, madera, cerámica, imprenta y luz de tarde. El movimiento debe ser cálido y táctil, no una colección de fades genéricos.

La referencia de dirección está en `docs/ARTE_BIBLE.md`. Tres palabras: **cálido, táctil, ordenado**. Nada de fotorrealismo, oscuridad, partículas a mansalva ni sombras duras.

## Mi corrección concreta sobre la v7 (no la ignores)

La v7 funciona, pero visualmente todavía tiene un problema: **parece una app con tarjetas, no una escena de café**. No es solo “añadir animaciones”; hay que corregir composición, materiales y jerarquía. Puntos concretos:

1. **Portada**: a 1280 sigue habiendo dos bloques rectangulares flotando sobre un fondo crema enorme. La ilustración del café es una ventana pequeña dentro de una tarjeta, no una escena que envuelva la pantalla. Hay que romper esa composición de dashboard.
2. **Lobby**: ahora mismo son cajas con textos y botones; no se ve una mesa con sillas. La “mesa” es conceptual, no visual. Hay que convertirla en una escena de mesa preparada, con avatares sentados y sillas vacías.
3. **Botones**: muchos son rectángulos con borde fino e iconos Lucide estándar. Eso es lo que más “AI” lo hace. Necesitan iconos propios, capas de papel, sombra de contacto y estados táctiles; no todos el mismo tratamiento.
4. **Tipografía**: no se están usando Fraunces/Nunito autoalojadas; el resultado es una serif y una sans del sistema, correctas pero genéricas. La tipografía es una parte enorme del carácter.
5. **Profundidad**: el tablero y las tarjetas están demasiado planos. Faltan canto, sombra de contacto, luz superior y textura de papel. Pero sin sombras duras ni ruido.
6. **Movimiento**: la transición de pantalla es un fade corto; los menús casi no reaccionan. Falta el lenguaje de vapor/papel, la elevación de cartas, el asentado de fichas y el cambio de turno.
7. **Móvil**: la escena de la portada queda reducida a una tira pequeña y la carta de menú ocupa casi todo. En móvil hay que dar más peso a la escena y que la carta parezca una hoja que se despliega, no un formulario.
8. **Ajustes**: es un modal de formulario limpio pero genérico. Debe parecer una mesa de control de café, con controles táctiles y etiquetas con carácter.
9. **Cartas**: las caras 3/4 van en la dirección correcta, pero algunas siguen pareciendo clipart vectorial. Necesitan línea de tinta más expresiva, accesorios y expresiones; menos “avatar plano”.
10. **Lo que NO hay que tocar**: la mano centrada, la cabecera de dos filas, los overlays exclusivos, la PWA, el aviso de sala perdida, la placa `O & A` y los 49 tests/2 E2E. Son correcciones ya ganadas.

Si al terminar una pantalla sigue pareciendo “una tarjeta con un formulario dentro”, no está terminada.

## Dirección visual

- Paleta de `ARTE_BIBLE.md`: crema, papel roto, café, terracota, caramelo, salvia, latón, azul tinta y rojo ladrillo. Usa el color con intención, no como decoración.
- Tipografía: **Fraunces** para títulos y números; **Nunito Sans** para interfaz. Autoalojadas y con pesos limitados. Si no puedes añadirlas, usa una serif y una sans coherentes, pero no dejes la actual mezcla genérica.
- Materiales: papel de algodón, cartulina, madera clara, cerámica, latón, tinta. Texturas sutiles de grano, fibra o imprenta; nada de ruido que ensucie la lectura.
- Bordes: imperfectos pero controlados; sellos, cinta washi, esquinas troqueladas, líneas de tinta. Evita el patrón “tarjeta blanca con `rounded-2xl` y sombra suave” repetido en todas partes.
- Iconos: dibujados a mano o SVG con línea de tinta; no uses los iconos genéricos de Lucide tal cual. Cada acción principal debe tener un icono con carácter.
- Jerarquía: una acción principal por pantalla; mucho aire; nada de microtexto amontonado. La calidez no justifica perder legibilidad.

## Portada

Convierte la portada en una **composición de escena**, no en dos tarjetas centradas:

- Escena de rincón de café en capas de papel: ventana arqueada con luz cálida, planta colgante, gato dormido, tocadiscos, mesa con mantel, taza con vapor y la placa `O & A`.
- El avatar del jugador forma parte de la escena (sentado o apoyado en la barra) y sigue abriendo el selector al pulsarlo.
- Saludo personalizado según hora y apodo, y frase del día integrada como pizarra o etiqueta.
- La carta de menú debe parecer impresa: cabecera, filetes, sellos, microcopy y acciones con iconos propios.
- **Jugar contra bot** es la acción protagonista: más grande, con una taza/servilleta que se levanta al pasar el ratón. **Crear sala** y **Unirse** son secundarias pero táctiles. Tutorial, Reglas y Ajustes van en una fila de “servicio”.
- En escritorio, la escena debe llenar el espacio; no dejes un fondo crema vacío con dos bloques flotando. En móvil, escena arriba y carta de menú abajo, sin scroll de página y con áreas táctiles de 44 px.
- Animación ambiental lenta y opcional: vapor, cola del gato, planta, vinilo, polvo en la luz. Respeta `reducedMotion`.
- Mantén `title-screen`, `quick-start-btn`, `create-room-btn`, `join-room-btn`, `avatar-dropdown-btn`, `subtitles-dropdown-btn`, etc.

## Lobby

Haz que se sienta como una mesa preparada, no como un panel de administración:

- Mesa central con mantel y cuatro sillas. Los avatares se sientan con una animación breve; las sillas vacías son invitaciones, no huecos.
- El código de sala va en una servilleta o tarjeta de reserva; al copiar, sello y sonido `uiCopy`.
- El botón de listo deja un sello visible en la silla; empezar suena a campana de mostrador.
- Los bots ocupan su silla con personalidad; los controles de jugadores y reloj son fichas/tokens táctiles, no selects grandes.
- Conserva toda la lógica y los testids (`lobby-screen`, `add-bot-btn`, `start-game-btn`, `lobby-ready-btn`, etc.).
- Añade micro-animaciones de entrada/salida, copia y listo; nada de rebotes excesivos.

## Tablero y mano

- Refuerza la lectura **mesa > ficha sentada > silla compartida > silla vacía > suelo**. La bandera de la mesa debe seguir siendo pequeña; la ficha sentada cuadrada debe dominar.
- Da profundidad de cartón: canto, sombra de contacto, luz superior suave y una textura de papel muy sutil. Nada de sombras negras duras.
- Mantén 24 mesas, 68 sillas, 28 compartidas y 20 plazas; no inventes ni muevas nada.
- Selección de ficha: elevación y ligera inclinación; sillas legales: pulso cálido; preview fantasma; colocación: la ficha “se asienta” con una pequeña compresión; puntos que flotan y se integran.
- Modo enfoque: atenúa el resto con un foco suave; no oscurezcas en exceso ni pierdas el contexto.
- Barra central: posavasos con valores claros; el siguiente hueco respira; la placa `O & A` integrada, no pegada.
- La mano debe seguir **centrada respecto al dock completo**. En escritorio, abanico sutil de cartas; en móvil, fila de 5 con 44 px. El dock es papel translúcido, no cristal genérico; las cartas son 100 % opacas.
- Panel de detalle seleccionado: como una ficha de cata o etiqueta de carta, no otra tarjeta blanca.
- Cambio de turno: un aviso breve, elegante y no intrusivo; no tapes el tablero.

## Cartas y personajes

- Mantén los 24 invitados (12 países × 2 sexos) y los 4 comodines; cero texto impreso dentro de la ficha.
- Refina las caricaturas 3/4 actuales: línea de tinta más segura, expresiones más irónicas, siluetas y accesorios con carácter, menos aspecto de clipart vectorial.
- País y sexo deben reconocerse de un vistazo sin recurrir a estereotipos ofensivos. Usa bandera de fondo, ropa, peinado, bigote/barba, accesorios y expresión.
- Paleta plana coherente con `ARTE_BIBLE.md`; sombreado suave; nada de degradados metálicos ni brillos plásticos.
- Los comodines deben ser inconfundibles: arlequín, antifaz, gorro, cuello rizado; 2 masculinos y 2 femeninos.
- Las fotos de `references/cards/` son solo inspiración de composición. No copies cartas oficiales ni las incluyas en `public/` o en el build.
- Animaciones opcionales muy sutiles al seleccionar (parpadeo, sorbo); no conviertas la mano en un circo.

## Menús, modales y ajustes

- Popovers, leyenda, manos, Tertulia, reglas, ajustes y 3D deben compartir el mismo lenguaje de papel impreso: cabecera con filete, sello, cinta o pestaña.
- Los menús deben seguir siendo mutuamente excluyentes, con clamp al viewport y cierre con Escape/clic fuera.
- Ajustes: sliders y toggles táctiles, sección de sonido clara, prueba de sonido y mute visible. No dupliques funciones.
- Tertulia: cuaderno de notas/recibo, no una lista de cards genéricas.
- Mantén la legibilidad y los testids.

## Final

La secuencia ya existe; llévala al nivel de una **postal de despedida**:

- Sello `¡FINAL!`, ganador grande, confeti de papel, ranking escalonado y créditos `O & A`.
- Fondo de mesa/ventana de café, no un modal administrativo.
- Más confeti y mejor distribución; créditos con entrada suave; botones de postal, portada y revancha.
- Respeta `reducedMotion` y el botón Saltar.

## Sistema de movimiento

- Usa `motion/react` y CSS; `MotionConfig` con reduced motion.
- Transiciones de pantalla con **vapor de café / papel** (200–320 ms), sin fundido plano ni destellos.
- Botones: hover con elevación/sombra, press con compresión y retorno; foco visible.
- Overlays: entrada/salida con escala 0.97→1 y opacidad; sin layout shift.
- Microinteracciones: sillas, cartas, monedas, puntos, turno, copia, listo, ajustes, subtítulos, confeti.
- Stagger en ranking y listas; no animaciones eternas; 60 fps; transform/opacity preferentemente.
- Todo debe funcionar con teclado y con `prefers-reduced-motion`.

## Fondos vivos y hover

Sí: quiero fondos animados y reactivos al puntero, pero **sutiles y de autor**, no una feria de partículas. La escena debe respirar y responder al jugador sin distraer del tablero.

- **Portada**: escena en capas con parallax muy leve al mover el ratón (ventana, planta, gato, tocadiscos, mesa y avatar a distintas profundidades, 3–8 px). El vapor de la taza sube en bucle lento; el gato mueve la cola; el vinilo gira; la luz de la ventana cambia muy despacio.
- **Hover de menú**: al pasar sobre **Jugar**, la taza se eleva un poco y sale una bocanada de vapor; al pasar sobre **Crear sala**, la servilleta/mantel se arruga y aparece un sello; al pasar sobre **Unirse**, la llave gira o se ilumina el ojo de la cerradura. Son micro-reacciones de 150–250 ms, no animaciones eternas.
- **Lobby**: al pasar sobre una silla, el avatar se endereza o la silla se acerca; al pasar sobre la servilleta del código, se levanta una esquina; al pasar sobre “Listo” o “Empezar”, el sello/campana reaccionan.
- **Tablero**: al pasar sobre una mesa, un foco cálido muy suave ilumina su bandera y sus sillas; al pasar sobre una silla legal, la ficha fantasma se asienta; al pasar sobre la barra, el siguiente posavasos respira. El fondo de madera puede tener un brillo de luz que sigue al puntero muy sutilmente, sin mover el tablero.
- **Fondos**: textura de papel/madera con una capa de luz ambiental animada (gradiente muy lento, grano casi imperceptible, sombra de vapor). Nada de canvas pesado ni decenas de partículas; usa CSS, SVG y transform/opacity.
- **Hover solo en escritorio**: en táctil no hay hover real; usa press/tap y animaciones ambientales. No escondas información solo en hover.
- **Rendimiento**: 60 fps, sin layout shift, sin animar `width`/`height`/`top`/`left`; respeta `prefers-reduced-motion` y ofrece un modo sin parallax.
- **No** pongas hover a todos los elementos a la vez. Elige 3–5 interacciones protagonistas por pantalla; el resto, estático y limpio.

## Móvil, rendimiento y accesibilidad

- 390×844 y 1920×900/1280×800: sin scroll de página, sin solapes, texto legible y 44 px táctiles.
- Safe areas/notch; PWA standalone; no cargues fuentes o imágenes externas.
- El 3D sigue lazy; no aumentes el bundle principal con assets pesados.
- Contraste suficiente; no uses solo color para país/sexo; mantén `aria-label` y foco.
- Comprueba que la mano sigue centrada en 1920 y 1280 y que no pisa el tablero en móvil.

## Qué NO hacer

- No cambies reglas, `board.json`, motor, servidor ni flujo de turnos.
- No añadas cuentas, matchmaking, async, admin, replay ni notificaciones push.
- No rehagas los 3D ni añadas nuevas mecánicas.
- No uses arte oficial, fotos, fuentes remotas ni iconos genéricos sin estilizar.
- No sacrifiques legibilidad por “más bonito”.

## Entrega

- ZIP con **todos** los archivos nuevos/modificados; sin `node_modules`, `dist`, `.git`, `test-results`, `playwright-report`, `.aistudio` ni ZIPs antiguos.
- `CAMBIOS.md` con la lista exacta de archivos y una nota de qué se ha tocado.
- Capturas:
  - `docs/referencias/ui-v8-portada-1920.png`
  - `ui-v8-portada-1280.png`
  - `ui-v8-portada-movil.png`
  - `ui-v8-lobby.png`
  - `ui-v8-partida-1920.png`
  - `ui-v8-partida-movil.png`
  - `ui-v8-final.png`
- Resumen final: qué has cambiado, archivos, tests, capturas y problemas pendientes.
- No escribas “Ninguno” si queda algo abierto.

## Criterios de aceptación

- La portada y el lobby se sienten como una escena de café de autor, no como un formulario con tarjetas.
- El tablero tiene profundidad, jerarquía y materiales coherentes; las fichas se leen mejor que las mesas.
- Los botones y transiciones tienen un lenguaje táctil común, no fades genéricos.
- Hay un fondo vivo sutil y al menos 3 interacciones hover memorables en portada/lobby/tablero, sin ruido ni pérdida de 60 fps.
- La mano sigue centrada y sin solapes en 1920, 1280 y 390.
- Se mantienen los 49 tests, los 2 E2E y todas las salvaguardas.
- No se han tocado reglas, tablero, servidor ni arte oficial.
