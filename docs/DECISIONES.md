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
