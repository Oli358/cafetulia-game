import type { Express, NextFunction, Request, Response } from 'express';

/**
 * Baseline hardening for every response.
 * The CSP is only enforced in production because Vite's dev client needs
 * inline scripts and a WebSocket connection for HMR.
 */
export function applySecurityHeaders(app: Express): void {
  app.disable('x-powered-by');
  if (process.env.TRUST_PROXY === '1') {
    app.set('trust proxy', 1);
  }

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "base-uri 'none'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "script-src 'self' 'wasm-unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob:",
          "font-src 'self'",
          "media-src 'self' blob:",
          "connect-src 'self'",
          "worker-src 'self' blob:",
          "manifest-src 'self'",
        ].join('; '),
      );
      if (_req.secure || _req.headers['x-forwarded-proto'] === 'https') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }
    }

    next();
  });
}
