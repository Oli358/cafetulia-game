import { expect, test } from '@playwright/test';

test.describe('Cafetulia v3 E2E (P0 bugs, P1 mejoras, P2 técnico)', () => {
  test('Portada, Lobby y Partida sin scroll en 1280x800 y 390x844, cartas claras, avatares y tablero limpio', async ({
    page,
  }) => {
    // 1. Verificar Portada en móvil 390x844 SIN SCROLL (P0.1)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.getByTestId('title-screen')).toBeVisible();

    const titleMobileScroll = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(titleMobileScroll.scrollHeight).toBeLessThanOrEqual(titleMobileScroll.innerHeight + 1);

    // 2. Verificar Portada en desktop 1280x800 SIN SCROLL (P0.1)
    await page.setViewportSize({ width: 1280, height: 800 });
    const titleDesktopScroll = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(titleDesktopScroll.scrollHeight).toBeLessThanOrEqual(titleDesktopScroll.innerHeight + 1);

    // 3. Elegir un avatar prehecho en Portada (P1.2)
    await page.getByTestId('avatar-option-gato').click();

    // Abrir Reglas y cerrar (P1.1)
    await page.getByTestId('title-rules-btn').click();
    await expect(
      page.getByRole('heading', { name: 'Reglamento oficial de Cafetulia' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar' }).click();

    // 4. Crear sala y verificar Lobby SIN SCROLL en 390x844 y 1280x800 (P0.1)
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

    // 5. Verificar Partida en 1280x800 y 390x844 SIN SCROLL
    await expect(page.getByTestId('papercraft-board')).toBeVisible();
    await expect(page.getByTestId('bar-strip')).toBeVisible();
    await expect(page.getByTestId('player-hand-dock')).toBeVisible();

    const playDesktopScroll = await page.evaluate(
      () => document.documentElement.scrollHeight <= window.innerHeight + 1,
    );
    expect(playDesktopScroll).toBe(true);

    // 6. Verificar cartas claras (P0.6): cinta de país + badge MUJER/HOMBRE
    const genderBadges = await page.getByTestId('card-gender-badge').allInnerTexts();
    expect(genderBadges.length).toBeGreaterThan(0);
    for (const txt of genderBadges) {
      expect(['MUJER', 'HOMBRE']).toContain(txt.trim());
    }

    // 7. Verificar P0.7: sillas normales vacías sin bandera, banderas solo en mesas y sillas compartidas
    const normalChairSvgCount = await page
      .locator('[data-seat-shared="false"]')
      .first()
      .locator('svg')
      .count();
    expect(normalChairSvgCount).toBe(0);

    const sharedChairSvgCount = await page
      .locator('[data-seat-shared="true"]')
      .first()
      .locator('svg')
      .count();
    expect(sharedChairSvgCount).toBe(2);

    // 8. Verificar modal 3D lazy-loaded "Ver café" (P1.4 & P2.2)
    await page.getByTestId('open-3d-cafe-btn').click();
    await expect(page.getByTestId('cafe-3d-modal')).toBeVisible();
    await expect(page.getByTestId('cafe-3d-diorama')).toBeVisible();
    await page.getByTestId('close-3d-cafe-btn').click();

    // 9. Verificar Partida en móvil 390x844 SIN SCROLL
    await page.setViewportSize({ width: 390, height: 844 });
    const playMobileScroll = await page.evaluate(
      () => document.documentElement.scrollHeight <= window.innerHeight + 1,
    );
    expect(playMobileScroll).toBe(true);
  });
});
