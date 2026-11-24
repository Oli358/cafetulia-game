# Registro de decisiones

> Documento vivo. Se añaden decisiones nuevas al final. Última actualización: 2026-10-22.

Estados posibles: **Cerrada**, **Pendiente**, **Aplazada**.

| ID | Fecha | Decisión | Estado | Notas |
|---|---|---|---|---|
| D-001 | 2026-10-22 | Base del juego: *Café International* de Rudi Hoffmann (1989) | Cerrada | Edición española estándar |
| D-002 | 2026-10-22 | Los 12 países son los del tablero físico, con “África” | Cerrada | Orden cíclico horario desde arriba a la izquierda: África, Italia, China, España, URS (Rusia), India, América, Alemania, Turquía, Cuba, Inglaterra y Francia. Cada país tiene 2 mesas |
| D-003 | 2026-10-22 | Regla base de máximo 2 hombres + 2 mujeres por mesa | Cerrada | Es la regla base, no una variante |
| D-004 | 2026-10-22 | La variante de 4 del mismo sexo no se implementa por ahora | Cerrada | Se podrá añadir como opción en una versión futura |
| D-005 | 2026-10-22 | Los comodines **no** pueden ir a la barra | Cerrada | Edición clásica |
| D-006 | 2026-10-22 | Empate: victoria compartida | Cerrada | Sin desempate competitivo |
| D-007 | 2026-10-22 | Jugador inicial: aleatorio, configurable en la sala | Cerrada | Alternar revancha como opción futura |
| D-008 | 2026-10-22 | Fidelidad máxima al tablero y reglamento originales | Cerrada | Las mejoras de calidad de vida se revisan una a una |
| D-009 | 2026-10-22 | 2–4 jugadores desde la primera versión | Cerrada | El motor y la UI se diseñan para 2–4 |
| D-010 | 2026-10-22 | Bots configurables en la sala antes de empezar | Cerrada | Nivel y cantidad seleccionables; si no hay bot, se juega con humanos |
| D-011 | 2026-10-22 | Tutorial sencillo y reglas accesibles desde el menú principal | Cerrada | Para todos los públicos |
| D-012 | 2026-10-22 | Sala privada por código/link; matchmaking público más adelante | Cerrada | Invitado por ahora; cuentas sencillas en v1.1 |
| D-013 | 2026-10-22 | Juego por turnos en tiempo real | Cerrada | El modo asíncrono por días se aplaza y se apunta |
| D-014 | 2026-10-22 | Sin chat de voz de ningún tipo | Cerrada | |
| D-015 | 2026-10-22 | Chat de texto con emotes, efímero | Cerrada | Se difumina con la inactividad y reaparece al escribir |
| D-016 | 2026-10-22 | El chat no se mezcla con el registro de eventos por turnos | Cerrada | Son dos flujos separados |
| D-017 | 2026-10-22 | Temporizador opcional por turno, máximo 180 s | Cerrada | Desactivado por defecto; segundos configurables |
| D-018 | 2026-10-22 | Al agotarse el temporizador, jugada automática sensata | Cerrada | Prioriza una colocación legal que puntúe; si no, barra; si no, pasa. Aviso en el registro de eventos, no en el chat |
| D-019 | 2026-10-22 | Reconexión de 15 s; después, expulsión | Cerrada | El expulsado puede volver como espectador |
| D-020 | 2026-10-22 | Las fichas de la mano del expulsado vuelven a la bolsa | Cerrada | Los invitados ya sentados se quedan en el tablero |
| D-021 | 2026-10-22 | En 2 jugadores, si uno es expulsado, la partida termina | Cerrada | Gana quien queda. En 3–4 la partida continúa |
| D-022 | 2026-10-22 | Espectadores sí; replay no; compartir resultado sí | Cerrada | El replay se puede estudiar más adelante |
| D-023 | 2026-10-22 | Revancha solo con voto unánime | Cerrada | Si no, se vuelve a la sala |
| D-024 | 2026-10-22 | Historial corto de unas 5 partidas | Cerrada | Ubicación y formato por definir |
| D-025 | 2026-10-22 | Estadísticas sí; dashboard de administrador sí | Cerrada | v1.0: estadísticas locales. v1.1: globales + dashboard |
| D-026 | 2026-10-22 | PWA; sin app nativa; solo navegador; solo online | Cerrada | iPhone y Android |
| D-027 | 2026-10-22 | Español primero; inglés y monetización más adelante | Cerrada | Sin lenguaje inclusivo |
| D-028 | 2026-10-22 | Solo nicknames; sin fotos, voz, notas ni nombres reales | Cerrada | Privacidad mínima |
| D-029 | 2026-10-22 | Dirección de arte: tablero 2D fiel + fichas y mobiliario 3D | Cerrada | 2.5D tipo papercraft |
| D-030 | 2026-10-22 | Estilo visual: UI limpia tipo Apple + calidez Animal Crossing + papercraft | Cerrada | Nada de sobresaturación |
| D-031 | 2026-10-22 | Personajes cómicos y fieles al espíritu del original, con arte propio | Cerrada | Sin copiar assets oficiales |
| D-032 | 2026-10-22 | Sonido lo-fi y ambiente de café; música libre de derechos o generada y revisada | Cerrada | Se probará también música con Gemini |
| D-033 | 2026-10-22 | Detalle personal sutil: placa con iniciales | Cerrada | Enfocado a público general, sin resultar cursi |
| D-034 | 2026-10-22 | Fecha objetivo: 20–22 de noviembre de 2026 | Cerrada | No el 18; online aunque se esté junto |
| D-035 | 2026-10-22 | Presupuesto: 0 € siempre que sea posible | Cerrada | Render free; arte propio o generado |
| D-036 | 2026-10-22 | Código mantenible, con tests y pensado para escalar | Cerrada | No es un prototipo desechable |
| D-037 | 2026-10-22 | Repositorio y estructura gestionados por el asistente | Cerrada | Registro de sesiones en `docs/SESIONES.md` |
| D-038 | 2026-10-22 | v1.0 con 2–4 jugadores, bots y espectadores; cuentas, admin y asíncrono en v1.1 | Cerrada | Se revisará si la fecha aprieta |
| D-039 | 2026-10-22 | Saldo negativo permitido en v1.0 | Cerrada | La eliminación por deuda será opción de sala en v1.1 |
| D-040 | 2026-10-22 | Fin de partida: las 4 condiciones clásicas | Cerrada | Última silla, plaza 20 de barra, jugador sin fichas, robar la cuarta por el final |
| D-041 | 2026-10-22 | Nombre comercial: **Cafetulia** | Cerrada | Repositorio: <https://github.com/Oli358/cafetulia-game> |
| D-042 | 2026-10-22 | Uptime del servidor para modo asíncrono | Aplazada | Depende del plan de Render; se revisa en v1.1 |
| D-043 | 2026-10-22 | Licencia y monetización | Pendiente | Se decide antes de publicar; arte y nombre originales desde ya |
| D-044 | 2026-10-22 | Las fotos del tablero son reales; las etiquetas impresas no son fiables | Cerrada | El tablero tiene 24 mesas y 12 países, 2 por país. Se ignoran los nombres/banderas erróneos (p. ej. “CANADÁ” donde debe ser Inglaterra) y se mapean los 12 países oficiales por posición |
| D-045 | 2026-10-22 | Candidatos de nombre preseleccionados | Pendiente | Ronda 3: Cafetulia, Cafetopía, Mesabella, Café de Toda la Vida, Café de Barrio, Partidita, ¿Nos Sentamos?, Candilejas. Ver `NOMBRES.md` |
| D-046 | 2026-10-22 | Repositorio Git local inicializado | Cerrada | Rama `main`, primer commit `d215a87`. Remoto de GitHub pendiente de nombre |
| D-047 | 2026-10-22 | Las fotos del tablero se guardan en `docs/referencias/` | Cerrada | `tablero-real-sin-fichas.png` y `tablero-real-con-fichas.jpg` |
| D-048 | 2026-10-22 | Repositorio remoto de GitHub | Cerrada | <https://github.com/Oli358/cafetulia-game.git>; rama `main` subida |
| D-049 | 2026-10-22 | Modelo de IA a probar: **Gemini 4 Argon** | Pendiente | Se probará en la prueba de estilo (arte y/o música); se evaluará su integración |
| D-050 | 2026-10-22 | Orden cíclico de los países | Cerrada | 12 países confirmados: África, Italia, China, España, URS (Rusia), India, América, Alemania, Turquía, Cuba, Inglaterra y Francia. Cada país tiene 2 mesas |
| D-051 | 2026-10-22 | Mapeo de las 24 mesas confirmado | Cerrada | Ver `docs/referencias/mapeo-mesas.md`; filas ajustadas para cuadrar con 24/68/28/20 |
| D-052 | 2026-10-22 | Generado `packages/content/board.json` | Cerrada | Validado: 24 mesas, 68 sillas, 28 compartidas, 20 plazas de barra |
| D-053 | 2026-10-22 | Instrucciones y prompts para Gemini 4 Argon | Cerrada | Ver `docs/ARGON/`; 8 fases listas para copiar y pegar |
| D-054 | 2026-10-23 | Biblia visual completa | Cerrada | Ver `docs/ARTE_BIBLE.md`: paleta, cámara, materiales, personajes, UI, animaciones y criterios de aceptación |
| D-055 | 2026-10-23 | Fase 2 completada e integrada | Cerrada | Motor de reglas de Argon integrado; 32 tests en verde y 1.000 partidas simuladas |
| D-056 | 2026-10-23 | Test de simulación asíncrono y timeout de 300 s | Cerrada | Cede el event loop cada 20 partidas para evitar el timeout de Vitest |
| D-057 | 2026-10-23 | ESLint permite non-null assertions en tests | Cerrada | Solo en `**/*.test.ts` y `**/tests/**/*.ts` |
| D-058 | 2026-10-25 | v2 integrada; v1.0 implementada | Cerrada | 42 tests, build, lint, E2E y UI 2.5D verificados en local |
| D-059 | 2026-10-25 | Node 22.5+ obligatorio; Node 24.20.0 LTS instalado | Cerrada | El servidor usa `node:sqlite`; Node 20 no lo soporta |
| D-060 | 2026-10-25 | `npx pnpm dev` arranca el servidor full-stack | Cerrada | API + Vite en <http://localhost:3000>; Playwright usa el mismo comando |
| D-061 | 2026-10-25 | Rejilla 2D con coordenadas 0–12 | Cerrada | Corrige el desplazamiento de filas/columnas del tablero |
| D-062 | 2026-10-25 | Rediseño de UI v1.1 integrado | Cerrada | Pantalla única sin scroll, tablero ilustrado, cartas 2:3, modal 3D y cajón de registro/chat |
| D-063 | 2026-10-25 | 24 personajes con nombre y frase + 2 comodines | Cerrada | `CHARACTER_ROSTER` en `packages/ui` |
| D-064 | 2026-10-25 | Monedas 1/5/10 con animación de ida y vuelta | Cerrada | Al puntuar vuelan a la bandeja; al penalizar, a la barra |
| D-065 | 2026-10-25 | v1.2 con bugs P0 y mejoras P1/P2 integrada | Cerrada | 46 tests, build, lint, E2E y jugada real verificados |
| D-066 | 2026-10-25 | 16 avatares prehechos y `avatarId` compartido | Cerrada | Cliente, servidor, API y tipos del motor; sin subir fotos |
| D-067 | 2026-10-25 | Subtítulos de eventos tipo Rocket League | Cerrada | Activables en Ajustes; cola de avisos y sonido |
| D-068 | 2026-10-25 | Monedas 1 negra / 5 roja / 10 azul y coin flip 3D | Cerrada | Pilas exactas, arco, giro y sombra; penalización inversa |
| D-069 | 2026-10-25 | Café Vivo 3D con invitados y 20 posavasos | Cerrada | Carga diferida con `lazy` + `Suspense` |
| D-070 | 2026-10-25 | La placa conmemorativa usa **O & A** | Cerrada | Inicial de Abril; corregida en tablero 2D y 3D. No volver a `O & C` |
| D-071 | 2026-10-25 | Clic/tap es la interacción principal; arrastrar será opcional | Cerrada | Accesibilidad y móvil primero. El drag, si se añade, será una mejora P2 y nunca la única forma de jugar |
| D-072 | 2026-10-25 | Sonido de moneda sintetizado, inspirado en el arcade clásico | Cerrada | Dos notas ascendentes y timbre brillante, sin samples ni melodías copiadas de Nintendo |
| D-073 | 2026-10-25 | Cabecera en dos filas, menús mutuamente excluyentes y popovers dentro del viewport | Cerrada | El marcador no desplaza las acciones; un solo overlay abierto; cierre con Escape, clic fuera o cambio de pantalla |
| D-074 | 2026-10-25 | Final escenificado por fases | Cerrada | Secuencia `¡FINAL!` → ganador → confeti → ranking → créditos, con botón de omitir y respeto a `prefers-reduced-motion` |
| D-075 | 2026-10-25 | La portada será una escena de café personalizada, no un formulario estático | Cerrada | Avatar y saludo según apodo/hora, escena ilustrada, botones con personalidad y microinteracciones; misma dirección en lobby y ajustes |
| D-076 | 2026-10-25 | SFX diferenciados por acción de UI | Cerrada | Sonidos cortos y sutiles para abrir/cerrar, confirmar, cancelar, cambiar de pestaña, listo, copiar, empezar y ajustes; mute global y volumen bajo |
| D-077 | 2026-10-25 | Música lo-fi con capas, melodía y variación | Cerrada | Mantener el estilo de café, pero con progresión más larga, secciones, transiciones entre pantallas y ducking; sin samples con copyright |
| D-078 | 2026-10-25 | Los ZIPs antiguos no se incluyen en `public/` ni en el build | Cerrada | El ZIP de Argon trajo `public/assets/aistudio/*.zip`; se excluyen y se añaden a `.gitignore` |
| D-079 | 2026-10-25 | Probar en teléfono real antes del siguiente despliegue | Cerrada | Validar audio, safe areas, PWA, táctil y rendimiento en iPhone/Android antes de Render |
| D-080 | 2026-10-25 | Scheduler Web Audio de 24 compases y `window.__CAFETULIA_STORE__` solo en dev/test | Cerrada | La música usa lookahead de `0.25 s` cada `85 ms` con 3 atmósferas (`Tertulia`, `Lluvia`, `Noche`), crossfade por pantalla y ducking; el store de pruebas no se expone en producción salvo entorno WebDriver |
| D-081 | 2026-10-25 | La mano se centra respecto al dock completo | Cerrada | Rejilla de tres columnas en escritorio (`minmax(0,1fr) auto minmax(0,1fr)`); el panel de detalle y las acciones no desplazan el mazo |
| D-082 | 2026-10-25 | PWA local con HTTPS temporal e iconos PNG | Cerrada | Service worker registrado desde el entry real `src/main.tsx`; iconos 192/512/maskable/apple; túnel de Cloudflare solo para la prueba en teléfono |
| D-083 | 2026-10-26 | Una sala perdida se trata como error de conexión, no como jugada inválida | Cerrada | Si `/moves` o el poll devuelven `404 ROOM_NOT_FOUND`, el cliente vuelve a la portada con un aviso claro y limpia la partida fantasma |
| D-084 | 2026-10-26 | Una sola jugada en vuelo y borrador limpio al cambiar de turno | Cerrada | Evita dobles envíos y que una selección vieja bloquee las sillas después de un rechazo o de un movimiento del rival |
| D-085 | 2026-10-26 | La v8 es un pase visual y de animación, no de funcionalidades | Cerrada | No se tocan reglas, motor, servidor, `board.json`, cuentas, matchmaking ni async; se prioriza composición, materiales, tipografía y movimiento |
| D-086 | 2026-10-26 | Dirección visual de la v8 basada en `ARTE_BIBLE.md` | Cerrada | Papel, tinta, madera y cerámica; Fraunces + Nunito Sans autoalojadas; escenas en portada/lobby y sistema de movimiento coherente |
| D-087 | 2026-10-26 | Escena arquitectónica envolvente en portada y mesa redonda central despejada en lobby | Cerrada | Fondo SVG de salón completo en portada y rejilla de 3 columnas en lobby (`[sillas izq | mesa redonda | sillas dcha]`) con las 7 capturas `ui-v8-*.png` verificadas |
| D-088 | 2026-11-24 | Portada v11: lata de café 3D procedural, tres mundos y scroll interno de dos actos | Cerrada | Unirse / Reservar / Café solo; el giro completo sella la reserva; se conservan los flujos, testids y la pantalla sin scroll del documento |
| D-089 | 2026-11-24 | El menú se inspira en el lenguaje de producto 3D de Dialed sin copiar sus assets ni su layout | Cerrada | Producto protagonista, mundo cromático por modo, ingredientes 3D y microinteracciones; arte, etiquetas y modelos originales de Cafetulia |
| D-090 | 2026-11-24 | Lobby v11: la sala es la última fase del giro y conserva un rincón 3D jugable | Cerrada | La lata y los granos se pueden girar/tocar mientras se espera; los controles de sala y los testids se mantienen |
| D-091 | 2026-11-24 | La lata v11 pasa a formato moderno con etiqueta de color completo por mundo y crossfade; el lobby recupera la mesa 2D | Cerrada | Feedback directo: texto editorial a la izquierda, lata flotante que cambia entera de color, ingredientes en onda con repulsión al cursor y mesa 2D con comensales; los ingredientes decorativos viven en los márgenes del lobby |
| D-092 | 2026-11-24 | La portada prioriza el nombre del juego; la mezcla/mundo pasa a etiqueta secundaria | Cerrada | CAFETULIA es el titular enorme; Tertulia/Lluvia/Noche viven en el chip de la casa, la etiqueta de la lata y la carta. No vendemos un producto: vendemos un juego |
| D-093 | 2026-11-24 | El scroll de portada es una secuencia cinematográfica, no un simple cambio de opacidad | Cerrada | La lata gira una vuelta completa, desciende y la carta sube; portada y carta no se solapan en el mismo tramo. Sin barrido duro de color: fondo en gradiente con crossfade |
| D-094 | 2026-11-24 | El lobby tiene fondo de ingredientes en tres capas con blur y profundidad | Cerrada | Capas lejos/medio/cerca con tamaños, opacidades y velocidades distintas; el panel es translúcido y los ajustes se pliegan en móvil |
| D-095 | 2026-11-24 | Un solo gesto de rueda completa el paso del póster al menú; el fondo del lobby se acelera y la etiqueta de la lata baja su corte superior | Cerrada | El usuario pidió un acceso directo al menú con un notch, más vida en el fondo del lobby y un hombro metálico más generoso en la lata |
| D-096 | 2026-11-25 | La portada v12 adopta la composición de póster de Dialed: titular gigante en dos líneas, lata abajo-centro recortada y papeles flotando con blur | Cerrada | Se replica el comportamiento y la jerarquía, no los assets: fondo crema, CAFETULIA. / EL JUEGO. en Fraunces 400, lata propia y papeles de comanda originales |
| D-097 | 2026-11-25 | El menú v12 pone el mundo gigante a la izquierda, la lata a la derecha y una carta compacta abajo a la izquierda | Cerrada | Las tres formas de jugar siguen en pestañas dentro de la misma carta; un notch entra al menú y la rueda cambia de mundo sin scroll de página |
| D-098 | 2026-11-25 | Café, canela y anís usan modelos GLB reales de Poly by Google; el resto de ingredientes sigue siendo procedural | Cerrada | Modelos CC BY 3.0 vía Poly Pizza, normalizados y con materiales clonados. Atribución en `docs/CREDITOS.md` y en Ajustes |
| D-099 | 2026-11-25 | No se usa `sodacans.glb` para la lata | Cerrada | 13,49 MB y 346.540 triángulos; la lata procedural actual es más ligera, coherente y ya tiene tres etiquetas con crossfade |
| D-100 | 2026-11-25 | En móvil, la portada usa título + lata recortada + una sola fila de acciones; la carta del menú es una hoja inferior | Cerrada | Se oculta la tarjeta secundaria de escritorio y se compacta la carta para que quepan formulario y CTA sin scroll interno |
| D-101 | 2026-11-25 | El objeto flotante de la portada es un vaso de café para llevar, no una lata | Cerrada | Feedback del usuario: la lata no encajaba con café. Vaso procedural troncocónico, tapa crema con boquilla, falda kraft y sello dorado; tres etiquetas y color de cuerpo por mundo |
| D-102 | 2026-11-25 | El layout de escritorio compacto cubre desde 901 px y usa cámara más abierta entre 901 y 1099 px | Cerrada | Arregla la ventana de PC a media anchura (~960 px): carta a la izquierda y vaso a la derecha, sin hoja inferior a todo el ancho. El móvil real queda por debajo de 900 px |
| D-103 | 2026-11-25 | La carta móvil se compacta: sin fila de ficha/subtítulos y con CTA a todo el ancho | Cerrada | Deja visible la parte superior del vaso y evita que la hoja inferior parezca un formulario estirado; los subtítulos siguen accesibles desde Ajustes |
