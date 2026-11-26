# Despliegue en Render

> Preparado el **26/11/2026** para la rama `home/menu-cafe-3d`.
> El objetivo es que el servidor no se duerma mientras hay una partida y dejar el despliegue listo para hoy.

## Qué queda preparado

- `render.yaml` con:
  - Rama `home/menu-cafe-3d` (cambiar a `main` tras el merge).
  - Node **24.20.0**, plan free, health check en `/health`.
  - `NODE_ENV=production` en ejecución, pero el build instala también devDependencies (`NODE_ENV=development` solo para `pnpm install`).
  - Sin `PORT` fijo: Render inyecta el suyo.
  - SQLite en `/tmp` (efímero en el plan free).
- `tsx` movido a **dependencies** para que `npx tsx server.ts` funcione en producción.
- **Latido del cliente** cada 25 s mientras la pantalla no es la portada (lobby, partida y final).
- **GitHub Action** `.github/workflows/render-keepalive.yml`: ping a `/health` cada 5 minutos.
- Documento de seguridad y rate limiting ya existente en `docs/SEGURIDAD.md`.

## Pasos para desplegar hoy

1. Subir la rama (ya está): `git push origin home/menu-cafe-3d`.
2. En Render: **New → Blueprint**, conectar el repo `Oli358/cafetulia-game` y aplicar `render.yaml`.
3. Si Render pregunta la rama, elegir `home/menu-cafe-3d`.
4. Esperar el build y abrir la URL del servicio. Comprobar `https://TU-URL.onrender.com/health` → `{"status":"ok"}`.
5. En GitHub: **Settings → Secrets and variables → Actions → Variables → New repository variable**:
   - Nombre: `RENDER_URL`
   - Valor: `https://TU-URL.onrender.com` (sin barra final)
6. Ejecutar a mano **Actions → Render keepalive → Run workflow** una vez y comprobar que sale en verde.
7. Probar en el móvil: crear sala, jugar un turno y dejar la pestaña abierta. El latido del cliente y el ping externo mantienen el servicio despierto.

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
2. **Externo:** GitHub Actions pings `/health` cada 5 minutos, aunque no haya nadie conectado. Es lo que mantiene el servicio despierto 24/7 en el plan free.

Notas:
- GitHub puede retrasar los workflows programados y los desactiva tras 60 días sin actividad en el repo; si pasa, se reactivan desde la pestaña Actions.
- **Los workflows programados de GitHub solo se ejecutan desde la rama por defecto (`main`).** Si Render despliega `home/menu-cafe-3d`, el ping automático no se ejecutará hasta mergear a `main`; el `workflow_dispatch` manual sí se puede lanzar desde esa rama.
- Alternativa independiente de la rama: un monitor HTTP gratuito tipo **UptimeRobot** cada 5 minutos apuntando a `https://TU-URL.onrender.com/health`. Es la opción más simple si no quieres mergear todavía.
- Si se quiere garantía total, el plan **Starter** de Render no duerme el servicio y permite disco persistente.
- El plan free tiene 750 h/mes; un servicio siempre encendido consume ~720 h/mes. No conviene tener varios servicios free siempre despiertos.

## Limitaciones del plan free

- **SQLite efímero** en `/tmp`: las salas se pierden al reiniciar o desplegar. Para partidas en vivo va bien; para persistencia real hace falta el plan Starter y el bloque `disk` del `render.yaml`.
- El servicio puede tardar unos segundos en despertar si el ping externo no está configurado.
- El `render.yaml` deja comentado el bloque `disk` para cuando se pase a Starter.

## Problemas típicos

- **502 al arrancar:** revisar los logs; `npx tsx server.ts` necesita `tsx` (ya está en dependencies).
- **Build falla en `tsc`:** comprobar que el buildCommand conserva `NODE_ENV=development` en el `pnpm install`; si se quita, no se instalan las devDependencies.
- **Health check falla:** no fijar `PORT`; Render debe inyectarlo. La ruta es `/health`.
- **Se duerme igualmente:** comprobar que la variable `RENDER_URL` existe y que el workflow `Render keepalive` se ejecuta; revisar la pestaña Actions.
