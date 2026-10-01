import { expect, test, type Page } from "@playwright/test";
import { projectLocale } from "./helpers";

const copy = {
  ar: {
    love: "حب",
    all: "الكل",
    under200: "أقل من 200 ر.س",
    priceAsc: "السعر: من الأقل",
    empty: "ما لقينا ورد بهذي الاختيارات",
    clear: "امسح التصفية",
    // Arabic counts 11–99 take the accusative singular: منتجًا.
    results15: "15 منتجًا",
  },
  en: {
    love: "Love",
    all: "All",
    under200: "Under SAR 200",
    priceAsc: "Price: low to high",
    empty: "No flowers match these choices",
    clear: "Clear filters",
    results15: "15 products",
  },
} as const;

const cards = (page: Page) => page.locator("main ul.grid > li");
const fromPrices = async (page: Page) =>
  (await cards(page).locator("p").allTextContents()).map((text) =>
    Number(text.replace(/[^\d.]/g, "")),
  );

test.describe("catalog", () => {
  test("lists every product with Latin-digit prices", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}/catalog`);
    await expect(page.getByRole("status")).toHaveText(copy[locale].results15);
    await expect(cards(page)).toHaveCount(15);
    await expect(page.locator("main")).not.toContainText(/[٠-٩]/);
  });

  test("filters by occasion and budget through the URL", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}/catalog`);

    await page
      .getByRole("group", { name: locale === "ar" ? "المناسبة" : "Occasion" })
      .getByRole("link", { name: copy[locale].love, exact: true })
      .click();
    await expect(page).toHaveURL(/occasion=love/);
    await expect(cards(page)).toHaveCount(4);

    await page.getByRole("link", { name: copy[locale].under200 }).click();
    await expect(page).toHaveURL(/occasion=love/);
    await expect(page).toHaveURL(/budget=under-200/);
    await expect(cards(page)).toHaveCount(1);

    // A shared URL restores the same view.
    await page.goto(`/${locale}/catalog?occasion=love&budget=under-200`);
    await expect(cards(page)).toHaveCount(1);
    await expect(
      page.getByRole("link", { name: copy[locale].under200 }),
    ).toHaveAttribute("aria-current", "true");
  });

  test("sorts by price", async ({ page }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}/catalog`);
    await page.getByRole("link", { name: copy[locale].priceAsc }).click();
    await expect(page).toHaveURL(/sort=price-asc/);
    const prices = await fromPrices(page);
    expect(prices).toHaveLength(15);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test("shows an empty state that clears filters", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}/catalog?occasion=founding-day&budget=700-plus`);
    await expect(page.getByText(copy[locale].empty)).toBeVisible();
    await page.getByRole("link", { name: copy[locale].clear }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/catalog$`));
    await expect(cards(page)).toHaveCount(15);
  });

  test("ignores invalid filter values", async ({ page }, testInfo) => {
    await page.goto(
      `/${projectLocale(testInfo)}/catalog?budget=free&sort=random`,
    );
    await expect(cards(page)).toHaveCount(15);
  });
});
