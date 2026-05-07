import { PrismaClient } from '@/generated/prisma/client';
import { test, expect } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';

test.describe('Busca de prompts na Sidebar', () => {
  test('filtra a lista de prompt em tem real baseado no termo digitado', async ({ page }) => {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    const prisma = new PrismaClient({ adapter });

    const uniqueAlpha = `E2E search Alpha ${Date.now()}`
    const uniqueBeta = `E2E search Beta ${Date.now()}`

    await prisma.prompt.createMany({
      data: [
        {
          title: uniqueAlpha,
          content: 'Content for Alpha',
        },
        {
          title: uniqueBeta,
          content: 'Content for Beta',
        },
      ],
    });

    await page.goto('/');

    const searchInpput = page.getByPlaceholder('Buscar prompts...');
    await expect(searchInpput).toBeVisible();

    await searchInpput.fill(uniqueAlpha);
    await expect(page.getByText(uniqueBeta)).toHaveCount(1);

    await searchInpput.fill(uniqueBeta);
    await expect(page.getByText(uniqueAlpha)).toHaveCount(1);

    const notExists = `E2E Search Not Exists ${Date.now()}`;
    await searchInpput.fill(notExists);
    await expect(page.getByText(notExists)).toHaveCount(0);
  })
})