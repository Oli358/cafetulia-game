import { createServer, type Server as HttpServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import express, { type Express } from 'express';
import colyseusPkg, { type Server as ColyseusServerType } from 'colyseus';
import { registerApiRoutes, getHealthPayload } from './api/index.js';
import { CafetuliaColyseusRoom, defaultRoomRegistry, type RoomRegistry } from './rooms/index.js';
import { defaultPersistenceStore, type GamePersistenceStore } from './persistence/index.js';
import { applySecurityHeaders } from './security.js';

const { Server: ColyseusServer } = colyseusPkg;

export { getHealthPayload, CafetuliaColyseusRoom, defaultRoomRegistry, defaultPersistenceStore };
export * from './rooms/index.js';
export * from './persistence/index.js';

export function createApp(
  registry: RoomRegistry = defaultRoomRegistry,
  store: GamePersistenceStore = defaultPersistenceStore,
): Express {
  const app = express();
  applySecurityHeaders(app);
  app.use(express.json({ limit: '32kb', inflate: false }));
  registerApiRoutes(app, registry, store);
  return app;
}

export function createColyseusServer(httpServer: HttpServer): ColyseusServerType {
  const gameServer = new ColyseusServer({
    server: httpServer,
    gracefullyShutdown: false,
  });
  gameServer.define('cafetulia', CafetuliaColyseusRoom);
  return gameServer;
}

const isMainModule =
  typeof process !== 'undefined' &&
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  const port = Number(process.env.PORT ?? 2567);
  const host = process.env.HOST ?? '127.0.0.1';
  const app = createApp();
  const httpServer = createServer(app);
  // The REST client is the supported transport. The legacy Colyseus room is
  // opt-in until it has onAuth/origin/payload hardening.
  if (process.env.ENABLE_COLYSEUS === '1') {
    createColyseusServer(httpServer);
  }

  httpServer.listen(port, host, () => {
    console.log(`Cafetulia server listening on http://${host}:${port}`);
  });
}
