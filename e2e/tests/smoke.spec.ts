import { expect, test } from '@playwright/test';

test.describe('Cafetulia E2E flujo completo', () => {
  test('portada, tutorial, reglamento, crear sala con bot y jugar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Cafetulia').first()).toBeVisible();

    // Abrir y cerrar reglamento
    await page.getByRole('button', { name: 'Reglamento' }).click();
    await expect(
      page.getByRole('heading', { name: 'Reglamento oficial de Cafetulia' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar' }).click();

    // Crear sala privada, añadir bot y empezar partida
    await page.getByTestId('create-room-btn').click();
    await expect(page.getByText(/Sala de espera/i)).toBeVisible();

    await page.getByTestId('add-bot-btn').click();
    await page.getByTestId('start-game-btn').click();

    // Verificar tablero y mano en partida
    await expect(page.getByTestId('papercraft-board')).toBeVisible();
    await expect(page.getByTestId('player-hand-dock')).toBeVisible();
  });
});
