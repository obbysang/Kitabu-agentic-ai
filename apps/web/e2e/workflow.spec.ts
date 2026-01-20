import { test, expect } from '@playwright/test'

test('invoice upload and settlement flow', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.click('text=RWA Invoice Settlement')
  const filePath = 'tests/fixtures/invoice.pdf'
  const input = page.locator('input[type="file"]')
  await input.setInputFiles(filePath)
  await expect(page.getByText('Extraction successful')).toBeVisible()
  await page.getByRole('button', { name: /Submit for x402 Settlement/i }).click()
})
