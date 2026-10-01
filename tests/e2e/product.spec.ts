import { expect, test } from "@playwright/test";
import { isMobile, projectLocale } from "./helpers";

const copy = {
  ar: {
    name: "قرمزي الكلاسيكي",
    large: "كبير",
    chocolate: "شوكولاتة فاخرة",
    base: "249 ر.س",
    withExtras: "408 ر.س",
    promise: "اطلب قبل 2 ظهرًا ويوصل اليوم",
    substitution: "نستبدلها بوردة مشابهة",
    addToCart: "أضف للسلة",
  },
  en: {
    name: "Crimson Classic",
    large: "Large",
    chocolate: "Luxury chocolate",
    base: "SAR 249",
    withExtras: "SAR 408",
    promise: "Order before 2 PM for same-day delivery",
    substitution: "replace it with a similar one",
    addToCart: "Add to cart",
  },
} as const;

test.describe("product page", () => {
  test("opens from the catalog", async ({ page }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}/catalog`);
    await page
      .getByRole("link", { name: new RegExp(copy[locale].name) })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/${locale}/products/crimson-classic$`),
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      copy[locale].name,
    );
  });

  test("updates the price live when size and add-ons change", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}/products/crimson-classic`);
    const price = page.getByTestId("live-price");
    await expect(price).toHaveText(copy[locale].base);

    await page.getByText(copy[locale].large, { exact: true }).click();
    await page.getByText(copy[locale].chocolate).click();
    await expect(price).toHaveText(copy[locale].withExtras);
  });

  test("shows the delivery promise, substitution note and a reachable add-to-cart", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}/products/crimson-classic`);
    await expect(page.getByText(copy[locale].promise)).toBeVisible();
    await expect(page.getByText(copy[locale].substitution)).toBeVisible();
    const addToCart = page.getByRole("button", {
      name: copy[locale].addToCart,
    });
    await expect(addToCart).toBeVisible();
    // On mobile the bar is pinned to the bottom, so it is in view without scrolling.
    if (isMobile(testInfo)) await expect(addToCart).toBeInViewport();
  });

  test("has Product and BreadcrumbList JSON-LD and hreflang links", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}/products/crimson-classic`);

    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const data = blocks.map(
      (text) => JSON.parse(text) as Record<string, unknown>,
    );
    const product = data.find((d) => d["@type"] === "Product") as
      { offers: Record<string, unknown> } | undefined;
    expect(product?.offers).toMatchObject({
      priceCurrency: "SAR",
      lowPrice: "249.00",
      highPrice: "499.00",
    });
    expect(data.some((d) => d["@type"] === "BreadcrumbList")).toBe(true);

    await expect(
      page.locator('link[rel="alternate"][hreflang="ar-SA"]'),
    ).toHaveAttribute("href", /\/ar\/products\/crimson-classic$/);
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]'),
    ).toHaveAttribute("href", /\/en\/products\/crimson-classic$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/${locale}/products/crimson-classic$`),
    );
  });

  test("product image keeps a stable view-transition-name", async ({
    page,
  }, testInfo) => {
    await page.goto(`/${projectLocale(testInfo)}/products/crimson-classic`);
    const style = await page.locator("main img").first().getAttribute("style");
    expect(style).toContain("view-transition-name:product-crimson-classic");
  });

  test("unknown products return 404", async ({ page }, testInfo) => {
    const response = await page.goto(
      `/${projectLocale(testInfo)}/products/does-not-exist`,
    );
    expect(response?.status()).toBe(404);
  });
});

test("sitemap lists products in both languages", async ({ request }) => {
  const body = await (await request.get("/sitemap.xml")).text();
  expect(body).toContain("/ar/products/crimson-classic");
  expect(body).toContain("/en/products/crimson-classic");
  expect(body).toContain('hreflang="ar-SA"');
});
