import { createServer } from 'node:http';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { registerApiRoutes } from './apps/server/src/api/index.js';
import {
  defaultPersistenceStore,
  defaultRoomRegistry,
} from './apps/server/src/index.js';

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json());

  // Mount API routes both at root (/health, /rooms) and under /api (/api/health, /api/rooms)
  const apiRouter = express.Router();
  registerApiRoutes(
    apiRouter as unknown as express.Express,
    defaultRoomRegistry,
    defaultPersistenceStore,
  );
  app.use('/api', apiRouter);
  registerApiRoutes(app, defaultRoomRegistry, defaultPersistenceStore);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  const httpServer = createServer(app);
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '0.0.0.0';
  httpServer.listen(port, host, () => {
    console.log(`Cafetulia full-stack server running on http://${host}:${port}`);
  });
}

void startServer();
