# Plan maestro — Proyecto Café

> Documento vivo. Última actualización: 2026-10-22.

## 1. Visión

Un **café-diorama 2.5D**, cozy y online, fiel al tablero de *Café International*, para jugar **2–4 personas** desde el móvil o el PC. La experiencia debe sentirse como sentarse en el café real: mismas mesas, mismas sillas compartidas, misma tensión en la barra, pero con animaciones, sonido y detalles que hagan sonreír.

## 2. Principios

1. **Fidelidad primero.** El motor replica el reglamento; el arte embellece, no cambia reglas.
2. **Motor puro y compartido.** Reglas en TypeScript puro, sin React ni Three. Cliente y servidor usan exactamente lo mismo.
3. **Servidor autoritativo.** El cliente propone jugadas; el servidor valida, aplica y sincroniza.
4. **Mobile-first real.** PWA, uso con una mano, 60 fps en gama media y modo 2D de respaldo.
5. **Cozy sin ruido.** Animaciones precisas, sonido suave, UI limpia; nada de sobresaturar.
6. **Arte original.** Inspiración cómica y papercraft, pero assets propios para poder monetizar sin conflictos.
7. **Código mantenible.** Tests, CI, documentación y estructura clara desde el día uno.

## 3. Alcance

### v1.0 — objetivo 20–22 de noviembre de 2026

- 2–4 jugadores online en **sala privada por código/link**.
- Reglas completas y fieles, con opciones configurables en la sala.
- **2.5D**: tablero 2D fiel al original + fichas, sillas, mesas y barra en 3D.
- **Bots básicos** configurables en la sala (si faltan jugadores).
- **Espectadores**.
- **Chat de texto con emotes**, efímero (se difumina con la inactividad y reaparece al escribir). Separado del registro de eventos por turnos.
- **Temporizador opcional** por turno, máximo 180 s, con jugada automática sensata al agotarse.
- **Reconexión de 15 s**; si no vuelve, expulsión. Sus fichas de la mano vuelven a la bolsa; los invitados ya sentados se quedan. Si vuelve, entra como espectador.
- **Revancha** solo con voto unánime; si no, se vuelve a la sala.
- **Historial corto** de unas 5 partidas.
- **Tutorial sencillo** y reglas accesibles desde el menú principal.
- **Estadísticas locales** en el dispositivo (victorias, partidas, rivales, etc.).
- **PWA** para iPhone y Android; jugable en móvil y PC.
- Despliegue en **Render** (plan gratuito; se valorará alternativa si el arranque en frío molesta).

### v1.1 — diciembre 2026 / enero 2027

- **Cuentas sencillas** (sin datos personales) y estadísticas globales.
- **Dashboard de administrador** para ver partidas, jugadores y métricas.
- **Matchmaking público** además de las salas privadas.
- **Modo asíncrono** por correspondencia (apuntado; depende de que el servidor esté siempre levantado).
- Opción de **eliminación por deuda** seleccionable en la sala.
- Más arte, logros y personalización del café.

### v1.2 — 2027

- Inglés, monetización, temporadas y más modos de juego.

## 4. Stack

| Pieza | Tecnología | Motivo |
|---|---|---|
| Cliente | Vite + React + TypeScript | Iteración rápida, UI flexible |
| 3D | React Three Fiber + Drei | Three.js con componentes React |
| Estado cliente | Zustand | Ligero; las reglas no viven en React |
| Estilo | Tailwind CSS + componentes propios | Look limpio tipo Apple + calidez cozy |
| Animación UI | Motion / CSS | Microinteracciones precisas |
| Animación 3D | React Spring / maath | Movimientos suaves y satisfactorios |
| Online | Colyseus + Node.js | Salas, reconexión y estado autoritativo |
| Persistencia | SQLite + Drizzle | Simple; migrable a Postgres si escala |
| Sonido | Howler | Música, ambiente y SFX |
| PWA | vite-plugin-pwa | Instalable sin tiendas |
| Tests | Vitest + fast-check + Playwright | Reglas, simulación y E2E |
| Deploy | Render | Sencillo y gratuito para empezar |

**Alternativas descartadas:** Unity WebGL (pesado en móvil web), Godot web (export menos maduro), Babylon.js (bueno, pero menor ecosistema React), Next.js (no hace falta SSR).

## 5. Arquitectura

Resumen: monorepo con `apps/web`, `apps/server`, `packages/engine`, `packages/content` y `packages/ui`. El motor de reglas es puro y determinista; el servidor es la autoridad; el cliente puede previsualizar porque usa el mismo motor. Detalle completo en [`ARQUITECTURA.md`](ARQUITECTURA.md).

## 6. Dirección de arte

**2.5D papercraft**: tablero 2D fiel al original, con fichas, sillas, mesas y barra en 3D sobresaliendo ligeramente. Cámara en picado o ligeramente inclinada, fija, con zoom. UI limpia tipo Apple, calidez Animal Crossing, personajes cómicos con arte original. Detalle completo en [`ARTE.md`](ARTE.md).

## 7. UX y funcionalidades

- **Portada:** crear mesa / unirse por código, nombre, ajustes de reglas.
- **Lobby:** jugadores, bots, espectadores, temporizador, opciones, listo.
- **Partida:** tablero, mano, manos rivales (públicas), marcador, barra, botones de acción.
- **Detalle de mesa:** país, ocupantes, equilibrio de sexos y puntos potenciales.
- **Final:** recuento, penalizaciones, ganador, revancha, compartir resultado.
- **Reglas/ayuda:** tutorial sencillo y reglamento consultable.
- **Historial:** últimas 5 partidas.
- **Accesibilidad:** color + bandera + patrón, reducción de movimiento, modo 2D.

## 8. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Reglas ambiguas entre ediciones | Alto | Preset configurable + foto del reglamento + tests |
| Rendimiento 3D en móvil | Alto | Presupuesto de rendimiento, instancing, modo 2D |
| Desincronización online | Alto | Motor compartido + servidor autoritativo + replay log |
| Alcance excesivo para la fecha | Alto | v1.0 cerrado; el resto a v1.1 |
| Arte inconsistente | Medio | Style guide + prueba de estilo temprana |
| Render free se duerme | Medio | Keep-alive o alternativa gratuita; el modo asíncrono espera |
| Conflictos de marca/arte | Medio | Nombre y arte originales; comprobar antes de publicar |
| Burnout | Medio | Entregas semanales jugables; playtests frecuentes |

## 9. Decisiones abiertas

- **Nombre comercial** (ver [`NOMBRES.md`](NOMBRES.md)).
- **Eliminación por deuda:** v1.0 permite saldo negativo; la opción estricta llega en v1.1.
- **Uptime del servidor** para el modo asíncrono.
- **Licencia y modelo de monetización** a largo plazo.

## 10. Próximos pasos

1. Recibir la **foto del tablero vacío**.
2. Elegir **nombre** y crear el repositorio definitivo.
3. Crear y validar el **`board.json`** (24 mesas / 68 sillas / 20 plazas de barra).
4. Hacer una **prueba de estilo** con 3 personajes + una mesa + la barra.
5. Montar el **scaffolding** del monorepo y empezar por el motor de reglas.
