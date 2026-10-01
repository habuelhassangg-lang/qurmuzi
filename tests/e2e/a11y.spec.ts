import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { projectLocale, type Locale } from "./helpers";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function expectNoViolations(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
  }));
  expect(summary, `${label}: ${JSON.stringify(summary, null, 2)}`).toEqual([]);
}

async function addToCart(page: Page, locale: Locale) {
  await page.goto(`/${locale}/products/crimson-classic`);
  await page
    .getByRole("button", {
      name: locale === "ar" ? "أضف للسلة" : "Add to cart",
    })
    .click();
}

test.describe("accessibility (axe, WCAG 2.2 AA)", () => {
  const staticPages = [
    ["home", ""],
    ["catalog", "/catalog"],
    ["catalog filtered", "/catalog?occasion=love&budget=200-400"],
    ["catalog empty", "/catalog?occasion=founding-day&budget=700-plus"],
    ["product", "/products/crimson-classic"],
    ["privacy", "/privacy"],
    ["delivery policy", "/delivery-policy"],
    ["404", "/this-page-does-not-exist"],
  ] as const;

  for (const [label, path] of staticPages) {
    test(label, async ({ page }, testInfo) => {
      const locale = projectLocale(testInfo);
      await page.goto(`/${locale}${path}`);
      await page.waitForLoadState("networkidle").catch(() => undefined);
      await expectNoViolations(page, label);
    });
  }

  test("cart drawer and cart page", async ({ page }, testInfo) => {
    const locale = projectLocale(testInfo);
    await addToCart(page, locale);
    await page
      .getByRole("button", {
        name: locale === "ar" ? "عرض السلة" : "View cart",
      })
      .click();
    await expect(page.getByTestId("cart-subtotal")).toBeVisible();
    await expectNoViolations(page, "cart drawer");
    await page.goto(`/${locale}/cart`);
    await expect(page.getByTestId("cart-subtotal")).toBeVisible();
    await expectNoViolations(page, "cart page");
  });

  test("checkout steps", async ({ page }, testInfo) => {
    const locale = projectLocale(testInfo);
    await addToCart(page, locale);
    await page.goto(`/${locale}/checkout`);
    await expect(page.locator("[data-date]").first()).toBeVisible();
    await expectNoViolations(page, "checkout step 1");
    // Errors shown after a failed "Next" must also be accessible.
    await page
      .getByRole("button", { name: locale === "ar" ? "التالي" : "Next" })
      .click();
    await expectNoViolations(page, "checkout step 1 with errors");
  });
});
