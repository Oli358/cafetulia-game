# Despliegue en Render

> Preparado el **26/11/2026** para la rama `main`, ya con la versión estable mergeada.
> Prioridad: **poder jugar cuando apetezca**. El servicio se mantiene despierto con un ping externo cada 5 minutos; el latido del cliente cubre mientras jugáis.

## Qué queda preparado

- `render.yaml` con:
  - Rama `main` (versión estable).
  - Node **24.20.0**, plan free, health check en `/health`.
  - `NODE_ENV=production` en ejecución, pero el build instala también devDependencies (`NODE_ENV=development` solo para `pnpm install`).
  - Sin `PORT` fijo: Render inyecta el suyo.
  - SQLite en `/tmp` (efímero en el plan free).
- `tsx` movido a **dependencies** para que `npx tsx server.ts` funcione en producción.
- **Latido del cliente** cada 25 s mientras la pantalla es lobby, partida o final.
- **GitHub Action** `.github/workflows/render-keepalive.yml`: ping a `/health` cada 5 minutos para que el plan free no se duerma fuera de partida.
- Documento de seguridad y rate limiting en `docs/SEGURIDAD.md`.

## Pasos para desplegar

1. Subir `main` (ya está): `git push origin main`.
2. En Render: **New → Blueprint**, conectar el repo `Oli358/cafetulia-game` y aplicar `render.yaml`.
3. Si Render pregunta la rama, elegir `main`.
4. Esperar el build y abrir la URL del servicio. Comprobar `https://TU-URL.onrender.com/health` → `{"status":"ok"}`.
5. En GitHub: **Settings → Secrets and variables → Actions → Variables → New repository variable**:
   - Nombre: `RENDER_URL`
   - Valor: `https://TU-URL.onrender.com` (sin barra final)
6. Ejecutar a mano **Actions → Render keepalive → Run workflow** una vez y comprobar que sale en verde. Después se ejecutará solo cada 5 minutos.
7. Probar en el móvil: crear sala, jugar un turno y dejar la pestaña abierta. El latido del cliente mantiene el servicio despierto mientras jugáis.

## Variables de Render

| Variable | Valor |
| --- | --- |
| `NODE_VERSION` | `24.20.0` |
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `PORT` | **No fijar**; lo inyecta Render |
| `TRUST_PROXY` | `1` |
| `SQLITE_DB_PATH` | `/tmp/cafetulia.sqlite` |
| `DATABASE_URL` | `/tmp/cafetulia.sqlite` |

## Keepalive: cómo funciona

Render Free duerme el servicio tras **15 minutos sin tráfico**. Hay dos capas:

1. **Cliente:** mientras está en lobby, partida o pantalla final, envía `GET /health?t=...` cada 25 s además del poll de la sala (1,5 s).
2. **Externo:** GitHub Actions pings `/health` cada 5 minutos, aunque no haya nadie conectado. Es lo que mantiene el servicio disponible 24/7 en el plan free.

Notas:
- **Los workflows programados de GitHub solo se ejecutan desde la rama por defecto (`main`).** El workflow está en `main`; si algún día se despliega otra rama, el ping automático no se lanzará desde ella. El `workflow_dispatch` manual sí.
- GitHub puede retrasar los workflows programados y los desactiva tras 60 días sin actividad en el repo; si pasa, se reactivan desde la pestaña Actions.
- El plan free tiene 750 h/mes; un servicio siempre encendido consume ~720 h/mes. Es aceptable para Cafetulia; si se añaden más servicios free siempre despiertos, habrá que vigilar el total.
- Si se quiere garantía total sin depender de GitHub, el plan **Starter** de Render no duerme el servicio y permite disco persistente.

## Limitaciones del plan free

- **SQLite efímero** en `/tmp`: las salas se pierden al reiniciar o desplegar. Para partidas en vivo va bien; para persistencia real hace falta el plan Starter y el bloque `disk` del `render.yaml`.
- Si el ping externo falla o GitHub desactiva el workflow, el servicio puede dormirse y el primer acceso tardará ~50 s.
- El `render.yaml` deja comentado el bloque `disk` para cuando se pase a Starter.

## Problemas típicos

- **502 al arrancar:** revisar los logs; `npx tsx server.ts` necesita `tsx` (ya está en dependencies).
- **Build falla en `tsc`:** comprobar que el buildCommand conserva `NODE_ENV=development` en el `pnpm install`; si se quita, no se instalan las devDependencies.
- **Health check falla:** no fijar `PORT`; Render debe inyectarlo. La ruta es `/health`.
- **El servicio se duerme:** comprobar que la variable `RENDER_URL` existe y que el workflow `Render keepalive` está activo en Actions. El cliente solo mantiene el latido mientras hay una sala o partida.
