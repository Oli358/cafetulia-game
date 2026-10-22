# Fase 7 — Tests y calidad

**Objetivo:** asegurar que la v1.0 es estable y mantenible.

```text
TAREA: Refuerza los tests y la calidad de Cafetulia.

Contexto: lee 00-contexto.md y docs/ARQUITECTURA.md.

TESTS
1. Unitarios del motor:
   - Todas las reglas y casos límite de docs/REGLAS.md.
   - Puntuación, sillas compartidas, comodines, barra y fin de partida.
2. Propiedades con fast-check:
   - 1.000 partidas aleatorias con semilla.
   - Ningún estado ilegal.
   - Siempre termina.
   - La puntuación final coincide con la reconstrucción desde el log.
3. Validación del tablero:
   - 24 mesas, 68 sillas, 28 compartidas, 20 plazas de barra.
4. E2E con Playwright:
   - Crear sala, unirse por código, jugar, reconectar, terminar y revancha.
   - Viewport móvil y PWA.
5. Visuales:
   - Capturas de pantallas clave.
6. Rendimiento:
   - Lighthouse y presupuesto: < 10 MB, 60 fps, carga < 5 s en 4G.

CI
- GitHub Actions: install, lint, typecheck, test, build.
- Se ejecuta en cada push y pull request.

DOCUMENTACIÓN
- README con comandos.
- docs/ARQUITECTURA.md actualizado si cambia algo.
- docs/SESIONES.md y docs/DECISIONES.md al día.

CRITERIOS DE ACEPTACIÓN
- Todos los tests en verde.
- CI en verde en GitHub.
- Ningún error de tipo.
- Cobertura razonable del motor (objetivo > 90% en reglas).

AL TERMINAR
- Actualiza docs/SESIONES.md.
- Commit: test: suite completa y CI.
- Push a main.
```
