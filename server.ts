import { createServer } from 'node:http';
import express from 'express';
import { registerApiRoutes } from './apps/server/src/api/index.js';
import { defaultPersistenceStore, defaultRoomRegistry } from './apps/server/src/index.js';
import { applySecurityHeaders } from './apps/server/src/security.js';

async function startServer(): Promise<void> {
  const app = express();
  applySecurityHeaders(app);
  app.use(express.json({ limit: '32kb', inflate: false }));

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
    const { createServer: createViteServer } = await import('vite');
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
  const host = process.env.HOST ?? '127.0.0.1';
  httpServer.listen(port, host, () => {
    console.log(`Cafetulia full-stack server running on http://${host}:${port}`);
  });

  const presenceSweep = setInterval(() => {
    defaultRoomRegistry.sweepPresence();
  }, 10_000);
  presenceSweep.unref?.();
}

void startServer();
