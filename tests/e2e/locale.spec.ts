import { expect, test } from "@playwright/test";

const expected = {
  ar: { dir: "rtl", brand: "قُرمُزي" },
  en: { dir: "ltr", brand: "Qurmuzi" },
} as const;

test.describe("locale shell", () => {
  test("renders with the right lang and dir", async ({ page }, testInfo) => {
    const locale = testInfo.project.metadata.locale as keyof typeof expected;
    const { dir, brand } = expected[locale];

    await page.goto(`/${locale}`);

    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", locale);
    await expect(html).toHaveAttribute("dir", dir);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(brand);
    await expect(page.getByRole("note")).toBeVisible();
  });

  test("has no horizontal scroll", async ({ page }, testInfo) => {
    const locale = testInfo.project.metadata.locale as string;
    await page.goto(`/${locale}`);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test("root redirects to Arabic by default", async ({ browser }) => {
  // No Accept-Language preference, so the default locale wins.
  const context = await browser.newContext({
    locale: undefined,
    extraHTTPHeaders: { "accept-language": "" },
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page).toHaveURL(/\/ar$/);
  await context.close();
});
