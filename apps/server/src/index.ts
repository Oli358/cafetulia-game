import { createServer, type Server as HttpServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import express, { type Express } from 'express';
import Colyseus from 'colyseus';
import { registerApiRoutes, getHealthPayload } from './api/index.js';

export { getHealthPayload };

export function createApp(): Express {
  const app = express();
  app.use(express.json());
  registerApiRoutes(app);
  return app;
}

export function createColyseusServer(httpServer: HttpServer) {
  return new Colyseus.Server({
    server: httpServer,
  });
}

const isMainModule =
  typeof process !== 'undefined' &&
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  const port = Number(process.env.PORT ?? 2567);
  const app = createApp();
  const httpServer = createServer(app);
  createColyseusServer(httpServer);

  httpServer.listen(port, () => {
    console.log(`Cafetulia server listening on http://localhost:${port}`);
  });
}
