import { expect, test } from "@playwright/test";
import { projectLocale } from "./helpers";

const copy = {
  ar: {
    addToCart: "أضف للسلة",
    viewCart: "عرض السلة",
    increase: "زيادة الكمية",
    remove: /احذف/,
    empty: "سلتك فاضية",
    cartOne: "السلة، منتج واحد",
  },
  en: {
    addToCart: "Add to cart",
    viewCart: "View cart",
    increase: "Increase quantity",
    remove: /Remove/,
    empty: "Your cart is empty",
    cartOne: "Cart, 1 item",
  },
} as const;

test.describe("cart", () => {
  test("adds, updates quantity, persists across reloads, and removes", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    const c = copy[locale];
    await page.goto(`/${locale}/products/pink-dawn`);
    await page.getByRole("button", { name: c.addToCart }).click();
    await expect(page.getByRole("button", { name: c.cartOne })).toBeVisible();

    await page.getByRole("button", { name: c.viewCart }).click();
    await expect(page.getByTestId("cart-line")).toHaveCount(1);
    await page.getByRole("button", { name: c.increase }).click();
    await expect(page.getByTestId("cart-line-total")).toHaveText(
      locale === "ar" ? "378 ر.س" : "SAR 378",
    );

    // The cart survives a reload (localStorage) and only stores IDs.
    await page.reload();
    const saved = await page.evaluate(
      () => localStorage.getItem("qurmuzi-cart") ?? "",
    );
    expect(saved).toContain('"quantity":2');
    expect(saved).not.toMatch(/price/i);
    await expect(page.getByTestId("cart-count")).toHaveText("2");

    await page.goto(`/${locale}/cart`);
    await page.getByRole("button", { name: c.remove }).click();
    await expect(page.getByText(c.empty)).toBeVisible();
  });

  test("drops cart lines the server no longer recognises", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}`);
    await page.evaluate(() =>
      localStorage.setItem(
        "qurmuzi-cart",
        JSON.stringify({
          state: {
            lines: [
              {
                productId: 1,
                variantId: 9999,
                addOnIds: [],
                quantity: 1,
                key: "9999:",
              },
            ],
          },
          version: 1,
        }),
      ),
    );
    await page.goto(`/${locale}/cart`);
    await expect(page.getByText(copy[locale].empty)).toBeVisible();
  });
});
