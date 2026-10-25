# Cambios de la base v6

Base preparada el **2026-10-25** para el encargo `docs/ARGON/09-pulido-ui-v6.md`.
ZIP: `cafetulia-ui-v6.zip`.

## Integración de la entrega v5 de Argon

Archivos integrados desde `cafetulia (4).zip`:

- `apps/web/src/art/CharacterPortrait.tsx`
- `apps/web/src/components/IllustratedBoard.tsx`
- `apps/web/src/components/Modals.tsx`
- `apps/web/src/components/PapercraftBoard.tsx`
- `apps/web/src/components/Screens.tsx`
- `apps/web/src/store/gameStore.ts`
- `apps/web/src/utils/moveHelper.test.ts`
- `apps/web/src/main.tsx`
- `packages/ui/src/index.ts`
- `e2e/tests/smoke.spec.ts`

Se conservaron las salvaguardas del proyecto: Node 24.20.0, `pathToFileURL`, `DATABASE_URL`/`SQLITE_DB_PATH`, timeout de Vitest, Playwright local, `lib` DOM en e2e, `React.lazy` para el 3D y service worker solo en producción.

## Correcciones aplicadas por nosotros

- `apps/web/src/components/Screens.tsx`: etiquetas de fin de partida corregidas (`player_empty_hand`, `bag_threshold_reached`, `last_player_standing`).
- `apps/web/src/components/IllustratedBoard.tsx`: placa **O & A** (antes `O & C`).
- `apps/web/src/components/PapercraftBoard.tsx`: placa **O & A** (antes `O & C`).

## Documentación y evidencias nuevas

- `docs/SESIONES.md`: Sesión 016 con la integración, la auditoría y los bugs abiertos.
- `docs/DECISIONES.md`: D-070 a D-074.
- `docs/ARGON/09-pulido-ui-v6.md`: prompt completo del siguiente encargo.
- `docs/ARGON/README.md`: enlace al prompt 09.
- `README.md`: estado actualizado.
- `docs/referencias/ui-v5-partida-1920.png`
- `docs/referencias/ui-v5-partida-1280.png`
- `docs/referencias/ui-v5-partida-movil.png`
- `docs/referencias/ui-v5-menus.png`
- `docs/referencias/ui-v5-final.png`
- `CAMBIOS.md`: este archivo.

## Referencias de cartas

Las fotos de referencia van solo en `references/cards/` dentro del ZIP, **fuera del build y del repositorio final**. No se deben copiar a `apps/web/public` ni usar como arte final.

## Verificación

- `npx pnpm typecheck` ✅
- `npx pnpm test` ✅ (46 tests + simulación de 1000 partidas)
- `npx pnpm build` ✅
- `npx pnpm lint` ✅
- `npx pnpm test:e2e` ✅
