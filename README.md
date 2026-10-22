# Cafetulia

> Juego digital cozy inspirado en *Café International* (Rudi Hoffmann, 1989).
> Repositorio: <https://github.com/Oli358/cafetulia-game>
> Nombre comercial decidido: **Cafetulia**.

Juego digital cozy, online y para **2–4 jugadores**, basado en **Café International** (Rudi Hoffmann, 1989, Spiel des Jahres). La propuesta es un **diorama 2.5D**: tablero 2D fiel al original + fichas, sillas, mesas y barra en 3D tipo papercraft. PWA jugable en móvil y PC.

---

## Estado actual

- **Fase 0 — Documentación y estructura.**
- Aún **no hay código**. Solo documentación y carpetas preparadas.
- Próximo hito: cerrar el nombre, validar las reglas con la foto del tablero y crear el primer `board.json`.

---

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/PLAN.md`](docs/PLAN.md) | Plan maestro: visión, alcance, stack y riesgos |
| [`docs/REGLAS.md`](docs/REGLAS.md) | Reglamento operativo y casos límite |
| [`docs/DECISIONES.md`](docs/DECISIONES.md) | Registro de decisiones del proyecto |
| [`docs/SESIONES.md`](docs/SESIONES.md) | Registro de sesiones de trabajo |
| [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) | Stack, arquitectura, datos y despliegue |
| [`docs/ARTE.md`](docs/ARTE.md) | Dirección de arte y pipeline de assets |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Versiones, fechas y alcance |
| [`docs/NOMBRES.md`](docs/NOMBRES.md) | Brainstorming de nombres |
| [`docs/ARGON/`](docs/ARGON/README.md) | Contexto y prompts para Gemini 4 Argon |
| [`packages/content/board.json`](packages/content/board.json) | Datos validados del tablero |

---

## Estructura del repositorio

```text
cafe-international/
├─ apps/
│  ├─ web/          Cliente React + React Three Fiber + UI + PWA
│  └─ server/       Servidor Colyseus + persistencia + API
├─ packages/
│  ├─ engine/       Motor de reglas puras (sin React ni Three)
│  ├─ content/      Datos: board.json, países, textos, presets
│  └─ ui/           Componentes de UI compartidos
├─ tools/           Importar tablero, optimizar assets, scripts
├─ e2e/             Pruebas end-to-end con Playwright
└─ docs/            Documentación del proyecto
```

---

## Reglas en una frase

Cada jugador siembra invitados en las mesas de su nacionalidad, respetando el equilibrio de sexos y aprovechando las **sillas compartidas** entre dos mesas; quien no encuentra sitio va a la **barra**, que reparte puntos al principio y penalizaciones después. Gana quien más puntos tiene al final.

---

## Notas legales

- Proyecto privado; **todos los derechos reservados** mientras no se decida licencia.
- Las mecánicas del juego no se protegen, pero el arte, el logotipo y el nombre original sí.
- El arte final será **original** (inspirado en el estilo cómico y papercraft, sin copiar assets oficiales) para permitir una futura monetización sin conflictos.
- No se usarán fotos, nombres reales ni notas de voz de los jugadores.

---

## Cómo se trabajará

- Cada sesión de trabajo se registra en [`docs/SESIONES.md`](docs/SESIONES.md).
- Cada decisión relevante se registra en [`docs/DECISIONES.md`](docs/DECISIONES.md).
- El roadmap y el alcance viven en [`docs/ROADMAP.md`](docs/ROADMAP.md).
- Los cambios se subirán a GitHub cuando el repositorio tenga nombre definitivo.
