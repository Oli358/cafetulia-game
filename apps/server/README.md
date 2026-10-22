# apps/server — Servidor

Servidor del juego: **Node.js + Colyseus + SQLite**.

**Estado:** pendiente de implementación.

## Contenido previsto

- `src/rooms/` — sala de juego, lobby, espectadores y reconexión.
- `src/persistence/` — SQLite + Drizzle, partidas e historial corto.
- `src/api/` — salud, creación de salas, futuras cuentas y estadísticas.
- `src/admin/` — dashboard de administrador (v1.1).

El servidor es la **autoridad**: valida todas las jugadas con `packages/engine`.

Ver [`docs/ARQUITECTURA.md`](../../docs/ARQUITECTURA.md).
