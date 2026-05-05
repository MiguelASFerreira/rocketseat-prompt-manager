import { test, expect, type Page } from '@playwright/test';

test('deve carregar a página inicial', async ({ page }: { page: Page }) => {
  await page.goto('http://localhost:3000');

  await expect(page.getByRole('heading', { name: 'Selecione um prompt'})).toBeVisible();
  await expect(page.getByText('Escolha um prompt da lista ao lado para visualizar e editar.')).toBeVisible();
});
