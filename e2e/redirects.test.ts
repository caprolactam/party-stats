import { test, expect } from '@playwright/test'

test.describe('redirects', () => {
  test.skip('/areasにアクセスすると全国の地域選択ページにリダイレクトされる', async ({ page }) => {
    await page.goto('/areas')

    await expect(page).toHaveURL(/areas\/[a-z0-9_-]+/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('地域')
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('全国')
  })
})
