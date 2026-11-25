# Seguridad de Cafetulia

> Revisión del 25 de noviembre de 2026. Este documento resume la auditoría, los parches aplicados y lo que queda pendiente antes de publicar.

## 1. Veredicto

No se encontraron claves reales, tokens de terceros, contraseñas ni claves privadas en el árbol de trabajo ni en el historial de git. `.env` nunca estuvo versionado.

Sí había tres bloqueantes de perímetro, ya corregidos en el commit de seguridad:

1. La API REST confiaba en `playerId`/`senderId` enviados por el cliente. Cualquiera con el código de sala podía iniciar la partida, mover por otro jugador, cambiar la configuración o hablar como otra persona.
2. Los `playerId` se derivaban de los primeros 10 caracteres del token. El prefijo se publicaba en el snapshot y permitía una colisión para sobrescribir al anfitrión.
3. El túnel temporal de Cloudflare estaba sirviendo el build sin autenticación. Se detuvo y la URL dejó de responder.

La versión actual exige un token de sesión secreto para toda acción de sala. Los ids son aleatorios y no derivan del token. La bolsa, el estado del RNG y la semilla ya no se envían al cliente durante la partida.

## 2. Cambios aplicados

### Identidad y autorización

- `Authorization: Bearer <token>` obligatorio en `GET /rooms/:code` y en todas las acciones (`start`, `moves`, `config`, `ready`, `avatar`, `bots`, `chat`, `rematch`, `leave`).
- El servidor resuelve el miembro por token; el `playerId` público ya no es una credencial.
- Tokens de sesión de 32 bytes (`crypto.randomBytes`) generados en servidor si el cliente no aporta uno fuerte.
- `playerId` con `crypto.randomUUID()`, sin relación con el token.
- `joinOrReconnect` rechaza colisiones y nunca sobrescribe a un miembro existente.
- Los clientes envían su `guestToken` en cada petición; si el token guardado es antiguo o corto, se regenera.
- El `hostId` se migra al siguiente jugador conectado si el anfitrión se desconecta.

### Estado oculto

- Durante la partida el snapshot público sustituye la bolsa por placeholders de la misma longitud (`hidden_bag_*`), pone `rngState` y `seed` a 0 y oculta la semilla del evento `game_started`.
- Al terminar se revela el estado completo, porque ya no hay ventaja competitiva.
- El cliente sigue mostrando el contador de bolsa con `bag.length` y los logros se calculan con el estado final.

### DoS y abuso

- `express.json({ limit: '32kb', inflate: false })`.
- Rate limiting en memoria: 600 req/min por IP para `/rooms`, 30 salas/hora, 60 uniones/min, 180 jugadas/min y 60 mensajes de chat/min.
- `MAX_ROOMS = 500`, `MAX_MEMBERS_PER_ROOM = 12` (4 jugadores + 8 espectadores) y salas inactivas de más de 2 horas se eliminan.
- `POST /rooms/:code/leave` libera la silla; el lobby elimina al miembro que se va.
- Barrido de presencia cada 10 s: un miembro sin heartbeat durante 90 s pasa a desconectado y entra en la ventana de reconexión de 15 s.
- Se mantiene el temporizador de turno opcional y la jugada automática existente.

### Cabeceras y transporte

- `X-Powered-By` desactivado.
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy` restrictiva, `Cross-Origin-Opener-Policy` y `Cross-Origin-Resource-Policy`.
- CSP en producción: `default-src 'self'`, `script-src 'self' 'wasm-unsafe-eval'` (Three.js necesita WebAssembly), `style-src 'self' 'unsafe-inline'`, `img-src 'self' data: blob:`, `connect-src 'self'`, `frame-ancestors 'none'`.
- HSTS cuando la petición llega por HTTPS.
- `Cache-Control: no-store` en respuestas de sala e historial.
- `HOST` por defecto `127.0.0.1`; en Render se define `HOST=0.0.0.0` y `TRUST_PROXY=1`.

### Dependencias

- Eliminado `drizzle-orm`: solo se usaban definiciones de esquema, nunca el query builder; las consultas reales son SQL parametrizado con `node:sqlite`.
- Overrides de `body-parser >=1.20.9 <2` y `nanoid >=3.3.18` en `pnpm-workspace.yaml`.
- `pnpm install --frozen-lockfile` verificado.
- `pnpm audit --prod` baja de 9 a 3 avisos: 1 high de Zod (mitigado por el límite de 32 KB y esquemas acotados), 1 moderate de `uuid` y 1 low de `elliptic`, ambos en la pila de autenticación de Colyseus, que no se monta en el entrypoint actual.

### Limpieza

- Túnel de Cloudflare detenido y URL temporal retirada.
- `cloudflared.exe` fuera del repositorio y añadido a `.gitignore`.
- `.gitignore` cubre `data/`, `*.sqlite*`, `*.db`, `*.db-journal` y `cloudflared.exe`.
- Eliminado el script inline que envolvía `window.fetch` en los dos `index.html`.
- `render.yaml` usa `--frozen-lockfile=true`.
- Documentos actuales saneados: rutas locales, session IDs, IP de LAN y URLs de túneles sustituidos por placeholders. El historial de git sigue conteniendo los valores antiguos; limpiarlo requiere una reescritura coordinada.

## 3. Riesgos residuales antes de publicar

1. **Historial de git y PII.** El repositorio es público y los commits usan un email real. Si se quiere borrar, hay que reescribir el historial con `git filter-repo` y coordinar el push. También hay rutas locales y URLs de túneles en docs antiguos.
2. **`/history` es público.** Devuelve códigos de sala antiguos y nicknames. No permite acciones (las salas terminadas no aceptan jugadas), pero conviene reducirlo o exigir sesión si el juego se hace público.
3. **Rate limiter en memoria.** Suficiente para un solo proceso. Si se escala a varias instancias, mover a Redis o a un limitador compartido.
4. **SQLite síncrono.** `node:sqlite` bloquea el event loop y en Render Free vive en `/tmp` (efímero). Para producción real, usar disco persistente o Postgres.
5. **Zod 3 high.** El aviso afecta a colecciones enormes; el body está limitado a 32 KB y los esquemas son acotados. Actualizar a Zod 4 es una tarea aparte por el cambio de tipos.
6. **Colyseus no está montado en `server.ts`** y en `apps/server` queda detrás de `ENABLE_COLYSEUS=1`. El código WS sigue en el repo; si se activa, hay que añadir `onAuth`, validación de origen, límites de payload y rate limiting antes de exponerlo.
7. **Fondo de bar y foto del tablero.** La licencia del fondo sigue pendiente. La foto del tablero físico de _Café International_ no debe publicarse sin revisar derechos.
8. **CSP y preview.** Las cabeceras se aplican en `server.ts` (producción); `vite preview` no las añade. Usar el servidor full-stack para producción.
9. **Sin cuentas.** El token es la identidad. Si se pierde, se pierde el asiento; no hay recuperación. Para v1.0 es aceptable, pero conviene documentarlo en la UI.

## 4. Checklist antes de publicar

- [ ] Repo privado o historial limpio de emails/rutas/URLs temporales.
- [ ] Confirmar licencia del fondo y derechos de la foto del tablero.
- [ ] Revisar `docs/` y capturas por datos personales.
- [ ] Ejecutar `pnpm audit --prod` y decidir el residual de Zod/uuid/elliptic.
- [ ] Desplegar con `NODE_ENV=production`, `HOST=0.0.0.0`, `TRUST_PROXY=1` y HTTPS.
- [ ] No volver a tunelizar sin Cloudflare Access o autenticación delante.
- [ ] Probar dos clientes reales (dos perfiles/navegadores) con la nueva autenticación.
- [ ] Revisar logs: no deben incluir tokens ni cuerpos de chat.
- [ ] Configurar backups/retención de SQLite o migrar a una base gestionada.
