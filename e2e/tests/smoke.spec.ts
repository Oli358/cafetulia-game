import { expect, test } from '@playwright/test';

test.describe('Cafetulia E2E (Claridad de tablero, fichas cuadradas sin texto, desplegables y 3D)', () => {
  test('Portada, Lobby y Partida sin scroll en 1280x800 y 390x844, fichas cuadradas con aria-label, leyenda, dock translúcido, desplegables y 3D', async ({
    page,
  }) => {
    // 1. Verificar Portada en móvil 390x844 SIN SCROLL
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.getByTestId('title-screen')).toBeVisible();

    const titleMobileScroll = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(titleMobileScroll.scrollHeight).toBeLessThanOrEqual(titleMobileScroll.innerHeight + 1);

    // 2. Verificar Portada en desktop 1280x800 SIN SCROLL
    await page.setViewportSize({ width: 1280, height: 800 });
    const titleDesktopScroll = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(titleDesktopScroll.scrollHeight).toBeLessThanOrEqual(titleDesktopScroll.innerHeight + 1);

    // 3. Probar desplegable de Avatar (P0.4)
    await page.getByTestId('avatar-dropdown-btn').click();
    await expect(page.getByTestId('avatar-dropdown-popover')).toBeVisible();
    await page.getByTestId('avatar-option-gato').click();
    await expect(page.getByTestId('avatar-dropdown-popover')).toBeHidden();

    // 4. Probar desplegable de Subtítulos (P0.4 & P1.2)
    await page.getByTestId('subtitles-dropdown-btn').click();
    await expect(page.getByTestId('subtitles-dropdown-popover')).toBeVisible();
    await page.getByTestId('subtitle-mode-key').click();
    await page.getByTestId('subtitle-style-comic').click();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('subtitles-dropdown-popover')).toBeHidden();

    // 5. Crear sala y verificar Lobby SIN SCROLL en 390x844 y 1280x800
    await page.getByTestId('create-room-btn').click();
    await expect(page.getByTestId('lobby-screen')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const lobbyMobileScroll = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(lobbyMobileScroll.scrollHeight).toBeLessThanOrEqual(lobbyMobileScroll.innerHeight + 1);

    await page.setViewportSize({ width: 1280, height: 800 });
    const lobbyDesktopScroll = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(lobbyDesktopScroll.scrollHeight).toBeLessThanOrEqual(lobbyDesktopScroll.innerHeight + 1);

    // Añadir bot y empezar partida
    await page.getByTestId('add-bot-btn').click();
    await page.getByTestId('start-game-btn').click();

    // 6. Verificar Partida en 1280x800 SIN SCROLL
    await expect(page.getByTestId('papercraft-board')).toBeVisible();
    await expect(page.getByTestId('bar-strip')).toBeVisible();
    await expect(page.getByTestId('player-hand-dock')).toBeVisible();

    const playDesktopScroll = await page.evaluate(
      () => document.documentElement.scrollHeight <= window.innerHeight + 1,
    );
    expect(playDesktopScroll).toBe(true);

    // 7. Verificar fichas cuadradas en la mano (P0.2 & P1.4):
    // - Sin texto visible dentro de las fichas
    // - Con aria-label descriptivo que incluye Mujer/Hombre
    const handTiles = page.getByTestId('hand-square-tile');
    const handCount = await handTiles.count();
    expect(handCount).toBe(5);

    for (let i = 0; i < handCount; i++) {
      const tile = handTiles.nth(i);
      const visibleText = (await tile.innerText()).trim();
      expect(visibleText).toBe('');
      const ariaLabel = await tile.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/Mujer|Hombre/);
    }

    // Al seleccionar una ficha cuadrada, aparece el panel de detalle con nombre, país, sexo y frase
    await handTiles.first().click();
    await expect(page.getByTestId('selected-tile-detail')).toBeVisible();
    const genderBadgeText = (await page.getByTestId('selected-gender-badge').innerText()).trim();
    expect(['MUJER', 'HOMBRE']).toContain(genderBadgeText);

    // 8. Verificar claridad del tablero (P0.1):
    // - Sillas normales vacías sin bandera (0 svg)
    // - Sillas compartidas vacías con 2 banderitas (2 svg)
    const normalChairSvgCount = await page
      .locator('[data-seat-shared="false"][data-seat-occupied="false"]')
      .first()
      .locator('svg')
      .count();
    expect(normalChairSvgCount).toBe(0);

    const sharedChairSvgCount = await page
      .locator('[data-seat-shared="true"][data-seat-occupied="false"]')
      .first()
      .locator('svg')
      .count();
    expect(sharedChairSvgCount).toBe(2);

    // Probar leyenda '?' en el header
    await page.getByTestId('board-legend-btn').click();
    await expect(page.getByTestId('board-legend-popover')).toBeVisible();
    await page.getByTestId('board-legend-btn').click();

    // Probar "Modo enfoque" al tocar una mesa
    await page.locator('[data-table-id]').first().click();
    await expect(page.getByTestId('table-detail-panel')).toBeVisible();
    await page.getByTestId('table-detail-panel').getByRole('button', { name: 'Cerrar' }).click();

    // 9. Verificar dock de mano translúcido y sin solaparse con el tablero (P0.3)
    const dockCheck = await page.evaluate(() => {
      const board = document.querySelector('[data-testid="papercraft-board"]');
      const dock = document.querySelector('[data-testid="player-hand-dock"]');
      if (!board || !dock) return { overlaps: true, hasBackdrop: false };
      const bRect = board.getBoundingClientRect();
      const dRect = dock.getBoundingClientRect();
      return {
        overlaps: bRect.bottom > dRect.top + 2,
        className: dock.className,
      };
    });
    expect(dockCheck.overlaps).toBe(false);
    expect(dockCheck.className).toContain('backdrop-blur');

    // 10. Verificar modal 3D lazy-loaded con presets de cámara (P1.1)
    await page.getByTestId('open-3d-cafe-btn').click();
    await expect(page.getByTestId('cafe-3d-modal')).toBeVisible();
    await expect(page.getByTestId('cafe-3d-diorama')).toBeVisible();
    await page.getByTestId('camera-preset-tables').click();
    await page.getByTestId('camera-preset-bar').click();
    await page.getByTestId('focus-table-3d-btn').click();
    await page.getByTestId('close-3d-cafe-btn').click();

    // 11. Verificar Partida en móvil 390x844 SIN SCROLL ni solape
    await page.setViewportSize({ width: 390, height: 844 });
    const playMobileCheck = await page.evaluate(() => {
      const board = document.querySelector('[data-testid="papercraft-board"]');
      const dock = document.querySelector('[data-testid="player-hand-dock"]');
      const bRect = board?.getBoundingClientRect();
      const dRect = dock?.getBoundingClientRect();
      return {
        noScroll: document.documentElement.scrollHeight <= window.innerHeight + 1,
        overlaps: bRect && dRect ? bRect.bottom > dRect.top + 2 : true,
      };
    });
    expect(playMobileCheck.noScroll).toBe(true);
    expect(playMobileCheck.overlaps).toBe(false);
  });
});
