# Despliegue en Render

> Preparado el **26/11/2026** para la rama `main`, ya con la versión estable mergeada.
> El servidor se mantiene despierto **solo mientras hay una sala o partida abierta**. Sin ping externo 24/7.

## Qué queda preparado

- `render.yaml` con:
  - Rama `main` (versión estable).
  - Node **24.20.0**, plan free, health check en `/health`.
  - `NODE_ENV=production` en ejecución, pero el build instala también devDependencies (`NODE_ENV=development` solo para `pnpm install`).
  - Sin `PORT` fijo: Render inyecta el suyo.
  - SQLite en `/tmp` (efímero en el plan free).
- `tsx` movido a **dependencies** para que `npx tsx server.ts` funcione en producción.
- **Latido del cliente** cada 25 s mientras la pantalla es lobby, partida o final. En la portada no hay latido.
- **Sin GitHub Action de keepalive**: no hay pings programados ni gasto de horas cuando no jugáis.
- Documento de seguridad y rate limiting en `docs/SEGURIDAD.md`.

## Pasos para desplegar

1. Subir `main` (ya está): `git push origin main`.
2. En Render: **New → Blueprint**, conectar el repo `Oli358/cafetulia-game` y aplicar `render.yaml`.
3. Si Render pregunta la rama, elegir `main`.
4. Esperar el build y abrir la URL del servicio. Comprobar `https://TU-URL.onrender.com/health` → `{"status":"ok"}`.
5. Probar en el móvil: crear sala, jugar un turno y dejar la pestaña abierta. El latido del cliente mantiene el servicio despierto mientras jugáis.
6. Al cerrar la app o volver a la portada, el latido se detiene; Render puede dormir a los 15 minutos.

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

No hace falta configurar `RENDER_URL` ni ningún workflow de ping.

## Latido: cómo funciona

Render Free duerme el servicio tras **15 minutos sin tráfico**. La única capa es el cliente:

- Mientras está en **lobby, partida o pantalla final**, envía `GET /health?t=...` cada 25 s además del poll de la sala (1,5 s).
- En la **portada** no hay latido.
- Al cerrar la app o volver a la portada, deja de haber tráfico y Render puede dormir a los 15 minutos.
- No hay ping externo ni workflow programado: las **750 h/mes solo se gastan mientras hay una sala o partida abierta**.
- El primer acceso tras dormir tarda unos **50 s** (arranque en frío). Es el precio de no tener un ping 24/7.
- Si se quiere evitar el arranque en frío, el plan **Starter** no duerme el servicio; también se puede abrir la URL un minuto antes de jugar para despertarlo.

## Limitaciones del plan free

- **SQLite efímero** en `/tmp`: las salas se pierden al reiniciar o desplegar. Para partidas en vivo va bien; para persistencia real hace falta el plan Starter y el bloque `disk` del `render.yaml`.
- El servicio tarda ~50 s en despertar tras inactividad; es normal y no se puede evitar sin plan de pago o ping externo.
- El `render.yaml` deja comentado el bloque `disk` para cuando se pase a Starter.

## Problemas típicos

- **502 al arrancar:** revisar los logs; `npx tsx server.ts` necesita `tsx` (ya está en dependencies).
- **Build falla en `tsc`:** comprobar que el buildCommand conserva `NODE_ENV=development` en el `pnpm install`; si se quita, no se instalan las devDependencies.
- **Health check falla:** no fijar `PORT`; Render debe inyectarlo. La ruta es `/health`.
- **El servicio se duerme:** es el comportamiento esperado si no hay nadie en una sala. Al entrar a jugar se despierta solo; el primer acceso puede tardar ~50 s.
