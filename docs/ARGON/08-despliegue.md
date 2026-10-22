# Fase 8 — Despliegue

**Objetivo:** publicar la v1.0 en Render y dejarla jugable.

```text
TAREA: Despliega Cafetulia en Render.

Contexto: lee 00-contexto.md y docs/ARQUITECTURA.md.

DESPLIEGUE
1. Prepara el build de producción:
   - apps/web: build estático.
   - apps/server: servidor Node con Colyseus y SQLite.
   - Servir el cliente desde el servidor o desde un servicio estático.
2. Crea el servicio en Render:
   - Un servicio web para el servidor.
   - Un sitio estático para el cliente, o el mismo servicio sirviendo ambos.
   - Variables de entorno: PORT, DATABASE_URL, NODE_ENV, ADMIN_TOKEN.
3. Persistencia:
   - SQLite en un volumen persistente.
   - Backup diario si es posible.
4. Salud:
   - GET /health.
   - Keep-alive si el plan gratuito se duerme (respetando las condiciones de Render).
5. Dominio:
   - URL de Render para la v1.0.
   - Dominio propio más adelante.
6. Documentación:
   - README con la URL de producción y los pasos de despliegue.
   - docs/GIT.md actualizado si hace falta.

CRITERIOS DE ACEPTACIÓN
- La URL de producción carga en iPhone y PC.
- Dos personas pueden jugar una partida completa desde redes distintas.
- La reconexión funciona en producción.
- El servidor arranca limpio y el health check responde.

AL TERMINAR
- Actualiza docs/SESIONES.md.
- Commit: chore: despliegue en Render.
- Push a main.
```
