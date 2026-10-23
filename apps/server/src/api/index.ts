import type { Express, Request, Response } from 'express';

export type HealthResponse = {
  status: 'ok';
};

export function getHealthPayload(): HealthResponse {
  return { status: 'ok' };
}

export function registerApiRoutes(app: Express): void {
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json(getHealthPayload());
  });
}
