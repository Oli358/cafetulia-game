# Skills del proyecto

Las skills de diseño viven en `.opencode/skills/` y se versionan con Cafetulia. Solo se cargan en este proyecto.

## `frontend-design`

- Fuente: <https://github.com/anthropics/skills/tree/main/skills/frontend-design>
- Autor: Anthropic
- Licencia: Apache 2.0 (`LICENSE.txt`)
- Uso: proponer dirección visual, tipografía, composición y crítica antes de tocar código.
- No tiene scripts ni dependencias.

## `avoid-ai-design`

- Fuente: <https://github.com/funboy322/avoid-ai-design>
- Commit instalado: `60f5853a706873da3a30b3ddf3cc29f9683c885c`
- Versión: `0.5.0`
- Licencia: MIT (`LICENSE`)
- Uso: auditar el menú y la UI existente, detectar tics de “diseño generado” y reescribir sin cambiar comportamiento.
- Incluye `references/` y el scanner opcional `scripts/detect.mjs` (Node 18+).
- Modo recomendado para empezar: `detect` (auditar sin editar).

## Flujo de diseño

1. Auditar con `avoid-ai-design` en modo `detect`.
2. Proponer 2–3 direcciones con `frontend-design`.
3. Elegir una y escribir un `DESIGN.md` con tokens, tipografía y principios.
4. Implementar solo el menú principal y revisar capturas en 390, 1280 y 1920.
