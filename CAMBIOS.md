# Base v7 para el encargo de menú, sonido y música

Fecha: **2026-10-25**.
ZIP: `cafetulia-v7.zip`.
Prompt: `docs/ARGON/10-menu-sonido-musica.md`.

## Qué contiene esta base

- La **v6 integrada y verificada**: cabecera en dos filas, menús exclusivos, final escenificado, placa `O & A`, cambio de comodín contextual, tablero con jerarquía, dock translúcido y drag opcional.
- **48 tests** en verde, `typecheck`, `build`, `lint` y E2E completos.
- Salvaguardas: Node 24.20.0, `pathToFileURL`, `DATABASE_URL`/`SQLITE_DB_PATH`, timeout de Vitest, Playwright local, `lib` DOM en e2e, `React.lazy` para el 3D y service worker solo en producción.

## Cambios de esta preparación

No se ha cambiado código de producción en esta sesión. Solo documentación y el encargo:

- `docs/ARGON/10-menu-sonido-musica.md` — prompt v7.
- `docs/ARGON/README.md` — enlace al prompt 10.
- `docs/SESIONES.md` — Sesión 019.
- `docs/DECISIONES.md` — D-075 a D-079 ya registradas en la sesión anterior.
- `README.md` — estado y pendientes.
- `CAMBIOS.md` — este archivo.
- `docs/referencias/ui-v6-*.png` — capturas de la base.

## Qué debe hacer Argon

Implementar el prompt 10 y devolver un ZIP con **todos** los archivos nuevos/modificados, sin `node_modules`, `dist`, `.git`, `test-results`, `playwright-report`, `.aistudio` ni ZIPs antiguos. Debe incluir su propio `CAMBIOS.md`.

## Referencias

Las fotos de cartas no son necesarias para este encargo y no se incluyen en el ZIP para mantenerlo ligero. No copies arte oficial.
