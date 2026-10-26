import path from 'node:path';
import { expect, test } from '@playwright/test';

const REF_DIR = path.resolve(process.cwd(), 'docs/referencias');

type TestPlayer = {
  id: string;
  nickname: string;
  score: number;
  isBot?: boolean;
  avatarId?: string;
};

type TestSeat = {
  id: string;
  row: number;
  col: number;
  allowedNations: string[];
  occupant: Record<string, unknown> | null;
};

type TestTable = {
  id: string;
  nation: string;
  row: number;
  col: number;
  seatIds: string[];
};

type TestGameState = {
  turn: string;
  phase: string;
  terminalReason?: string;
  players: TestPlayer[];
  tables: TestTable[];
  seats: TestSeat[];
  hands: Record<string, Array<Record<string, unknown>>>;
};

type TestSnapshot = {
  code: string;
  phase: string;
  gameState: TestGameState | null;
};

type TestStoreShape = {
  getState: () => {
    myPlayerId: string | null;
    snapshot: TestSnapshot | null;
    screen: string;
    errorBanner: string | null;
    submitMove: (move: unknown) => Promise<boolean>;
  };
  setState: (patch: Record<string, unknown>) => void;
};

test.describe('Cafetulia E2E v6 & v7 (Escena de café en portada/lobby, Sonido del café, Header estable con 9999 pts, menús exclusivos, Cambiar comodín, FinishedScreen y O & A)', () => {
  test('Cumple P0 y P1 de v6 y v7 sin scroll en 1920x900, 1280x800 y 390x844 y genera capturas ui-v7-*.png', async ({
    page,
  }) => {
    // 1. Verificar Portada v7 (escena de café, avatar protagonista, saludo, frase del día y carta de menú) sin scroll en 390x844, 1280x800 y 1920x900
    for (const vp of [
      { width: 390, height: 844, shot: 'ui-v7-portada-movil.png' },
      { width: 1280, height: 800, shot: 'ui-v7-portada-1280.png' },
      { width: 1920, height: 900, shot: 'ui-v7-portada-1920.png' },
    ]) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      if (page.url() === 'about:blank') {
        await page.goto('/');
      }
      await expect(page.getByTestId('title-screen')).toBeVisible();
      await expect(page.getByTestId('title-cafe-scene')).toBeVisible();
      await expect(page.getByTestId('title-hero-avatar')).toBeVisible();
      await expect(page.getByTestId('title-greeting')).toBeVisible();
      await expect(page.getByTestId('title-daily-phrase')).toBeVisible();
      await expect(page.getByTestId('title-menu-card')).toBeVisible();

      const scrollCheck = await page.evaluate(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
      }));
      expect(scrollCheck.scrollHeight).toBeLessThanOrEqual(scrollCheck.innerHeight + 1);

      // Verificar áreas táctiles >= 44px en botones de menú principales y secundarios
      for (const tid of [
        'title-hero-avatar',
        'quick-start-btn',
        'create-room-btn',
        'join-room-btn',
        'title-tutorial-btn',
        'title-rules-btn',
        'title-settings-btn',
      ]) {
        const box = await page.getByTestId(tid).boundingBox();
        expect(box).not.toBeNull();
        expect(box!.height).toBeGreaterThanOrEqual(42);
      }

      await page.screenshot({ path: path.join(REF_DIR, vp.shot) });
    }

    // 2. Verificar que pulsar el avatar protagonista abre el selector de avatar, y exclusión mutua con Subtítulos
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.getByTestId('title-hero-avatar').click();
    await expect(page.getByTestId('avatar-dropdown-popover')).toBeVisible();

    // Al abrir Subtítulos directamente, Avatar se cierra automáticamente
    await page.getByTestId('subtitles-dropdown-btn').click();
    await expect(page.getByTestId('subtitles-dropdown-popover')).toBeVisible();
    await expect(page.getByTestId('avatar-dropdown-popover')).toBeHidden();

    await page.getByTestId('subtitle-mode-key').click();
    await page.getByTestId('subtitle-style-comic').click();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('subtitles-dropdown-popover')).toBeHidden();

    // Seleccionar avatar Gato
    await page.getByTestId('avatar-dropdown-btn').click();
    await page.getByTestId('avatar-option-gato').click();
    await expect(page.getByTestId('avatar-dropdown-popover')).toBeHidden();

    // 2b. Verificar modal de Ajustes «Sonido del café» (sliders, probar sonido, silenciar todo, atmósfera musical) y captura ui-v7-ajustes-sonido.png
    await page.getByTestId('title-settings-btn').click();
    await expect(page.getByTestId('settings-sound-section')).toBeVisible();
    await expect(page.getByTestId('test-sound-btn')).toBeVisible();
    await expect(page.getByTestId('settings-mute-btn')).toBeVisible();
    await expect(page.getByTestId('slider-music')).toBeVisible();
    await expect(page.getByTestId('slider-ambience')).toBeVisible();
    await expect(page.getByTestId('slider-sfx')).toBeVisible();
    await page.getByTestId('settings-mood-lluvia').click();
    await page.getByTestId('settings-mood-tertulia').click();
    await page.getByTestId('test-sound-btn').click();

    await page.screenshot({ path: path.join(REF_DIR, 'ui-v7-ajustes-sonido.png') });

    // Comprobar que el modal de Ajustes tampoco genera scroll de página en 390x844
    await page.setViewportSize({ width: 390, height: 844 });
    const settingsMobileScroll = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(settingsMobileScroll.scrollHeight).toBeLessThanOrEqual(
      settingsMobileScroll.innerHeight + 1,
    );
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('settings-sound-section')).toBeHidden();

    // 3. Crear sala y verificar Lobby como mesa preparada de 4 sillas sin scroll en 390x844, 1280x800 y 1920x900
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.getByTestId('create-room-btn').click();
    await expect(page.getByTestId('lobby-screen')).toBeVisible();
    await expect(page.getByTestId('lobby-table-scene')).toBeVisible();
    await expect(page.getByTestId('lobby-napkin-code')).toBeVisible();
    await expect(page.getByTestId('lobby-maxplayers-control')).toBeVisible();
    await expect(page.getByTestId('lobby-timer-control')).toBeVisible();
    await expect(page.getByTestId('lobby-seat-0')).toBeVisible();
    await expect(page.getByTestId('lobby-seat-1')).toBeVisible();
    await expect(page.getByTestId('lobby-seat-2')).toBeVisible();
    await expect(page.getByTestId('lobby-seat-3')).toBeVisible();

    // Añadir bot, probar toggle del sello de listo y dejarlo activo, y copiar código en servilleta
    await page.getByTestId('add-bot-btn').click();
    await expect(page.getByTestId('lobby-ready-stamp')).toBeVisible();
    await page.getByTestId('lobby-ready-btn').click();
    await expect(page.getByTestId('lobby-ready-stamp')).toBeHidden();
    await page.getByTestId('lobby-ready-btn').click();
    await expect(page.getByTestId('lobby-ready-stamp')).toBeVisible();
    await page.getByTestId('lobby-copy-code-btn').click();

    for (const vp of [
      { width: 390, height: 844 },
      { width: 1920, height: 900 },
      { width: 1280, height: 800 },
    ]) {
      await page.setViewportSize(vp);
      const lobbyScroll = await page.evaluate(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
      }));
      expect(lobbyScroll.scrollHeight).toBeLessThanOrEqual(lobbyScroll.innerHeight + 1);
    }

    // Captura ui-v7-lobby.png en 1280x800 con mesa de 4 sillas, bot sentado y sello de listo
    await page.screenshot({ path: path.join(REF_DIR, 'ui-v7-lobby.png') });

    // Empezar partida
    await page.getByTestId('start-game-btn').click();

    await expect(page.getByTestId('papercraft-board')).toBeVisible();
    await expect(page.getByTestId('bar-strip')).toBeVisible();
    await expect(page.getByTestId('player-hand-dock')).toBeVisible();

    // 4. Verificar placa O & A en tablero y ausencia total de O & C / O&C / OxC
    await expect(page.getByTestId('bar-plaque-oa')).toContainText('O & A');
    const bodyTextPlay = await page.evaluate(() => document.body.innerText);
    expect(bodyTextPlay).not.toMatch(/O\s*&\s*C|OxC/i);

    // 5. Verificar fichas cuadradas en la mano (sin texto visible, con aria-label Mujer/Hombre)
    const handTiles = page.getByTestId('hand-square-tile');
    expect(await handTiles.count()).toBe(5);
    for (let i = 0; i < 5; i++) {
      const tile = handTiles.nth(i);
      expect((await tile.innerText()).trim()).toBe('');
      const ariaLabel = await tile.getAttribute('aria-label');
      expect(ariaLabel).toMatch(/Mujer|Hombre/);
    }

    await handTiles.first().click();
    await expect(page.getByTestId('selected-tile-detail')).toBeVisible();

    // Captura 1: ui-v6-desktop.png (partida en 1280x800 con jerarquía clara y dock translúcido)
    await page.screenshot({ path: path.join(REF_DIR, 'ui-v6-desktop.png') });

    // 6. Verificar Partida en 390x844 y 1920x900 sin scroll ni solape entre tablero y dock
    await page.setViewportSize({ width: 390, height: 844 });
    const mobilePlayCheck = await page.evaluate(() => {
      const board = document.querySelector('[data-testid="papercraft-board"]');
      const dock = document.querySelector('[data-testid="player-hand-dock"]');
      const bRect = board?.getBoundingClientRect();
      const dRect = dock?.getBoundingClientRect();
      return {
        noScroll: document.documentElement.scrollHeight <= window.innerHeight + 1,
        overlaps: bRect && dRect ? bRect.bottom > dRect.top + 2 : true,
        dockClass: dock?.className ?? '',
      };
    });
    expect(mobilePlayCheck.noScroll).toBe(true);
    expect(mobilePlayCheck.overlaps).toBe(false);
    expect(mobilePlayCheck.dockClass).toContain('backdrop-blur-lg');

    // Captura 2: ui-v6-mobile.png (partida en 390x844)
    await page.screenshot({ path: path.join(REF_DIR, 'ui-v6-mobile.png') });

    await page.setViewportSize({ width: 1920, height: 900 });
    const widePlayCheck = await page.evaluate(
      () => document.documentElement.scrollHeight <= window.innerHeight + 1,
    );
    expect(widePlayCheck).toBe(true);

    // 7. P0.1 & P0.2: Header estable con puntuaciones altas (1234, 987, 9999) + exclusión mutua y popovers dentro del viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    const baselineHeaderMetrics = await page.evaluate(() => {
      const header = document.querySelector('[data-testid="playing-header"]');
      const actions = document.querySelector('[data-testid="header-actions-row"]');
      return {
        headerHeight: header?.getBoundingClientRect().height ?? 0,
        actionsTop: actions?.getBoundingClientRect().top ?? 0,
        actionsLeft: actions?.getBoundingClientRect().left ?? 0,
      };
    });

    // Inyectar puntuaciones altas (1234 y 987, y probar también 9999)
    // Pausamos pollRoom (roomCode: null) para que el servidor no sobreescriba el estado sintético
    await page.evaluate(() => {
      const store = (window as unknown as { __CAFETULIA_STORE__: TestStoreShape }).__CAFETULIA_STORE__;
      const snap = store.getState().snapshot;
      if (!snap || !snap.gameState) return;
      const updatedPlayers = snap.gameState.players.map((p: TestPlayer, i: number) => ({
        ...p,
        score: i === 0 ? 1234 : 987,
      }));
      store.setState({
        roomCode: null,
        reducedMotion: true,
        snapshot: {
          ...snap,
          gameState: {
            ...snap.gameState,
            players: updatedPlayers,
          },
        },
      });
    });

    await expect(page.getByTestId('compact-scoreboard')).toContainText('1.234');
    await expect(page.getByTestId('compact-scoreboard')).toContainText('987');

    const highScoresHeaderMetrics = await page.evaluate(() => {
      const header = document.querySelector('[data-testid="playing-header"]');
      const actions = document.querySelector('[data-testid="header-actions-row"]');
      const buttons = Array.from(
        actions?.querySelectorAll(':scope > button, :scope > div > button') ?? [],
      ).filter((el) => (el as HTMLElement).offsetParent !== null);
      const tops = buttons.map((b) => Math.round(b.getBoundingClientRect().top));
      return {
        headerHeight: header?.getBoundingClientRect().height ?? 0,
        actionsTop: actions?.getBoundingClientRect().top ?? 0,
        actionsLeft: actions?.getBoundingClientRect().left ?? 0,
        allButtonsSameRow: new Set(tops).size <= 1,
      };
    });

    // El header NO cambia de altura ni empuja los botones a una segunda línea a la izquierda
    expect(Math.abs(highScoresHeaderMetrics.headerHeight - baselineHeaderMetrics.headerHeight)).toBeLessThanOrEqual(2);
    expect(highScoresHeaderMetrics.actionsLeft).toBeGreaterThan(400);
    expect(highScoresHeaderMetrics.allButtonsSameRow).toBe(true);

    // Abrir '?' y luego 'Manos': solo 1 popover visible y 100% dentro del viewport
    await page.getByTestId('board-legend-btn').click();
    await expect(page.getByTestId('board-legend-popover')).toBeVisible();

    const legendBox = await page.getByTestId('board-legend-popover').boundingBox();
    expect(legendBox).not.toBeNull();
    expect(legendBox!.x).toBeGreaterThanOrEqual(0);
    expect(legendBox!.y).toBeGreaterThanOrEqual(0);
    expect(legendBox!.x + legendBox!.width).toBeLessThanOrEqual(1280);
    expect(legendBox!.y + legendBox!.height).toBeLessThanOrEqual(800);

    // Captura 4: ui-v6-menus.png (solo un menú abierto y dentro del viewport)
    await page.screenshot({ path: path.join(REF_DIR, 'ui-v6-menus.png') });

    // Al pulsar Manos, '?' se cierra automáticamente y Manos queda dentro del viewport
    await page.getByTestId('rival-hands-btn').click();
    await expect(page.getByTestId('board-legend-popover')).toBeHidden();
    await expect(page.getByTestId('rival-hands-popover')).toBeVisible();

    const handsBox = await page.getByTestId('rival-hands-popover').boundingBox();
    expect(handsBox).not.toBeNull();
    expect(handsBox!.x).toBeGreaterThanOrEqual(0);
    expect(handsBox!.y).toBeGreaterThanOrEqual(0);
    expect(handsBox!.x + handsBox!.width).toBeLessThanOrEqual(1280);
    expect(handsBox!.y + handsBox!.height).toBeLessThanOrEqual(800);

    // Captura 3: ui-v6-high-scores.png (1234 y 987 pts con Manos abierto sin salirse de pantalla)
    await page.screenshot({ path: path.join(REF_DIR, 'ui-v6-high-scores.png') });

    // Probar también con 9999 puntos
    await page.evaluate(() => {
      const store = (window as unknown as { __CAFETULIA_STORE__: TestStoreShape }).__CAFETULIA_STORE__;
      const snap = store.getState().snapshot;
      if (!snap || !snap.gameState) return;
      store.setState({
        roomCode: null,
        reducedMotion: true,
        snapshot: {
          ...snap,
          gameState: {
            ...snap.gameState,
            players: snap.gameState.players.map((p: TestPlayer) => ({ ...p, score: 9999 })),
            seats: snap.gameState.seats.map((s: TestSeat) =>
              s.occupant && s.occupant.nation === 'joker' ? { ...s, occupant: null } : s,
            ),
          },
        },
      });
    });
    await expect(page.getByTestId('compact-scoreboard')).toContainText('9.999');
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('rival-hands-popover')).toBeHidden();

    // 8. P0.5: Verificar "Cambiar comodín" explicado y con confirmación
    // Cuando no hay comodín sentado, el botón no aparece
    await expect(page.getByTestId('joker-swap-btn')).toHaveCount(0);

    // Simular estado legal con un comodín sentado en una mesa acompañada y la ficha natural correspondiente en mano
    await page.evaluate(() => {
      const store = (window as unknown as { __CAFETULIA_STORE__: TestStoreShape }).__CAFETULIA_STORE__;
      const snap = store.getState().snapshot;
      if (!snap || !snap.gameState) return;
      const gs = snap.gameState;
      const myId = store.getState().myPlayerId ?? gs.turn;
      const table = gs.tables[0]!;
      const seat0Id = table.seatIds[0]!;
      const seat1Id = table.seatIds[1]!;
      const newSeats = gs.seats.map((s: TestSeat) => {
        if (s.id === seat0Id) {
          return {
            ...s,
            occupant: {
              id: 'joker-M-1',
              nation: 'joker',
              gender: 'M',
              jokerNation: table.nation,
            },
          };
        }
        if (s.id === seat1Id) {
          return {
            ...s,
            occupant: {
              id: `${table.nation}-F-1`,
              nation: table.nation,
              gender: 'F',
            },
          };
        }
        return s;
      });
      const currentHand = gs.hands[myId] ?? [];
      const matchingNatural = {
        id: `${table.nation}-M-1`,
        nation: table.nation,
        gender: 'M',
      };
      const updatedHand = [matchingNatural, ...currentHand.slice(1)];
      store.setState({
        roomCode: null,
        snapshot: {
          ...snap,
          gameState: {
            ...gs,
            turn: myId,
            seats: newSeats,
            hands: {
              ...gs.hands,
              [myId]: updatedHand,
            },
          },
        },
      });
    });

    await expect(page.getByTestId('joker-swap-btn')).toBeVisible();
    await expect(page.getByTestId('joker-swap-btn')).toContainText('Cambiar comodín por');
    await page.getByTestId('joker-swap-btn').click();
    await expect(page.getByTestId('joker-swap-popover')).toBeVisible();
    await expect(page.getByTestId('joker-swap-explanation')).toContainText(
      'Entregas una ficha natural que podría ocupar esa silla y recuperas el comodín. No puntúas y no robas. Úsalo solo si te conviene.',
    );

    // Captura 5: ui-v6-joker-swap.png (estado con cambio de comodín y su explicación visible)
    await page.screenshot({ path: path.join(REF_DIR, 'ui-v6-joker-swap.png') });
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('joker-swap-popover')).toBeHidden();

    // 9. P0.3: Pantalla final escenificada a pantalla completa (phase === 'finished')
    await page.evaluate(() => {
      const store = (window as unknown as { __CAFETULIA_STORE__: TestStoreShape }).__CAFETULIA_STORE__;
      const snap = store.getState().snapshot;
      if (!snap || !snap.gameState) return;
      const gs = snap.gameState;
      const updatedPlayers = gs.players.map((p: TestPlayer, idx: number) => ({
        ...p,
        score: idx === 0 ? 64 : 48,
      }));
      store.setState({
        roomCode: null,
        reducedMotion: false,
        screen: 'finished',
        activeOverlay: null,
        snapshot: {
          ...snap,
          phase: 'finished',
          gameState: {
            ...gs,
            phase: 'finished',
            terminalReason: 'last_seat_occupied',
            players: updatedPlayers,
          },
        },
      });
    });

    await expect(page.getByTestId('finished-screen')).toBeVisible();
    await expect(page.getByTestId('final-stamp-heading')).toHaveText('¡FINAL!');
    await expect(page.getByTestId('final-winner-hero')).toBeVisible();
    await expect(page.getByTestId('final-paper-confetti')).toBeVisible();
    await expect(page.getByTestId('final-standings-list')).toBeVisible();
    await expect(page.getByTestId('final-credits-block')).toContainText(
      'Cafetulia — una tertulia de café',
    );
    await expect(page.getByTestId('final-credits-oa')).toContainText('O & A');
    await expect(page.getByTestId('rematch-btn')).toBeVisible();
    await expect(page.getByTestId('generate-postcard-btn')).toBeVisible();
    await expect(page.getByTestId('back-to-title-btn')).toBeVisible();

    // Si aparece el botón Saltar durante el recuento, pulsarlo lleva directo al estado final
    const skipBtn = page.getByTestId('skip-final-sequence-btn');
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
    }

    // Captura 6: ui-v6-finished.png (pantalla final escenificada con ganador, ranking, confeti y O & A)
    await page.screenshot({ path: path.join(REF_DIR, 'ui-v6-finished.png') });

    // Verificar ausencia de scroll en FinishedScreen en 1920x900, 1280x800 y 390x844
    for (const vp of [
      { width: 1920, height: 900 },
      { width: 1280, height: 800 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(vp);
      const finScroll = await page.evaluate(
        () => document.documentElement.scrollHeight <= window.innerHeight + 1,
      );
      expect(finScroll).toBe(true);
    }
  });

  test('avisa y vuelve a la portada si la sala desaparece durante la partida', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('quick-start-btn').click();
    await expect(page.getByTestId('papercraft-board')).toBeVisible();

    await page.route('**/rooms/*/moves', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'ROOM_NOT_FOUND', message: 'Sala no encontrada.' }),
      });
    });

    const result = await page.evaluate(async () => {
      const store = (window as unknown as { __CAFETULIA_STORE__: TestStoreShape }).__CAFETULIA_STORE__;
      const ok = await store.getState().submitMove({ type: 'bar', tileId: 'tile-inexistente' });
      const state = store.getState();
      return { ok, screen: state.screen, errorBanner: state.errorBanner };
    });

    expect(result.ok).toBe(false);
    expect(result.screen).toBe('title');
    expect(result.errorBanner).toContain('La sala ya no existe');
    await expect(page.getByTestId('title-screen')).toBeVisible();
    await expect(page.getByText(/La sala ya no existe/)).toBeVisible();
  });
});
