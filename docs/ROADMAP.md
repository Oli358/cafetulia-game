# Roadmap

> Fecha de referencia: 22 de octubre de 2026.
> **Ventana objetivo del aniversario: 20–22 de noviembre de 2026.**
> Estimación orientativa; se ajusta según el tiempo disponible.

## 1. Versiones

### v1.0 — “Aniversario” (20–22 nov 2026)

**Debe estar sí o sí:**

- 2–4 jugadores online en sala privada por código/link.
- Reglas completas y fieles, con presets configurables.
- Tablero 2D fiel + fichas, sillas, mesas y barra en 3D (2.5D papercraft).
- Tutorial sencillo y reglamento consultable.
- Chat de texto con emotes, efímero y separado del registro de eventos.
- Temporizador opcional (máx. 180 s) con jugada automática.
- Reconexión de 15 s, expulsión y modo espectador al volver.
- Revancha con voto unánime.
- Historial corto de 5 partidas.
- Estadísticas locales del dispositivo.
- PWA para iPhone y Android; móvil y PC.
- Despliegue en Render.

**Muy deseable:**

- Bots básicos configurables en la sala.
- Espectadores.
- Sonido y animaciones principales.
- Compartir resultado al terminar.

**Si la fecha aprieta, se recorta en este orden:**

1. Compartir resultado.
2. Espectadores.
3. Bots.
4. Historial de 5 partidas.
5. Animaciones secundarias.

**Nunca se recorta:** reglas, online 2–4, estabilidad, móvil y arte base.

### v1.1 — “Comunidad” (diciembre 2026 / enero 2027)

- Cuentas sencillas (sin datos personales).
- Estadísticas globales y dashboard de administrador.
- Matchmaking público además de salas privadas.
- Modo asíncrono por correspondencia (si el servidor puede estar siempre levantado).
- Opción de eliminación por deuda en la sala.
- Más animaciones, logros y personalización del café.
- Mejoras de accesibilidad y rendimiento.

### v1.2 — “Producto” (2027)

- Inglés y otros idiomas.
- Monetización (cosméticos, pase, etc.) con arte y nombre propios.
- Temporadas, eventos y más modos.
- Apps nativas solo si la demanda lo justifica.

## 2. Calendario v1.0

| Fechas | Fase | Entregable |
|---|---|---|
| 22–24 oct | Fundación | Nombre, repo, estructura, docs, `board.json` inicial, prueba de estilo |
| 25–30 oct | Motor | Motor de reglas + tests + hotseat 2D jugable |
| 31 oct–5 nov | Online | Salas 2–4, reconexión, despliegue en Render |
| 6–11 nov | Arte y feel | 2.5D, UI, animaciones, sonido, chat, temporizador, revancha |
| 12–16 nov | Completo | Bots, espectadores, tutorial, PWA, estadísticas locales, QA |
| 17–19 nov | Colchón | Bugs, rendimiento, despliegue final, detalles |
| **20–22 nov** | **Aniversario** | **v1.0 jugable y compartida** |

## 3. Hitos y criterios de “hecho”

| Hito | Criterio |
|---|---|
| Tablero validado | 24 mesas, 68 sillas, 28 compartidas, 20 plazas de barra |
| Motor | 1.000 partidas aleatorias sin estados ilegales y todos los tests en verde |
| Hotseat | Una partida completa de 2–4 jugadores en local sin errores |
| Online | Dos redes distintas, reconexión y ninguna desincronización |
| Arte | 60 fps en móvil de gama media y <10 MB de carga inicial |
| v1.0 | Tres partidas completas sin bloqueos en iPhone, Android y PC |

## 4. Riesgos de calendario

- **Arte:** es la variable más lenta. Mitigación: prueba de estilo temprana y set modular.
- **Render free:** se duerme por inactividad. Mitigación: keep-alive o alternativa gratuita.
- **Tiempo disponible:** variable. Mitigación: hitos semanales y recorte ordenado.
- **Scope creep:** cualquier idea nueva va a la lista de v1.1, no a la v1.0.
