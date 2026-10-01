import { expect, test } from "@playwright/test";
import { projectLocale } from "./helpers";

const copy = {
  ar: {
    notFound: "ما لقينا هذي الصفحة",
    browse: "تصفح كل الورد",
    love: "حب",
    privacy: "سياسة الخصوصية",
    delivery: "التوصيل والبدائل",
    pdpl: "نظام حماية البيانات الشخصية",
    cutoff: "اطلب قبل 2 ظهرًا ويوصل اليوم",
    olaya: "العليا",
  },
  en: {
    notFound: "We couldn't find that page",
    browse: "Browse all flowers",
    love: "Love",
    privacy: "Privacy policy",
    delivery: "Delivery & substitutions",
    pdpl: "Personal Data Protection Law",
    cutoff: "Order before 2 PM for delivery today",
    olaya: "Al Olaya",
  },
} as const;

test.describe("404", () => {
  test("unknown pages return 404 with suggestions back into the shop", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    const response = await page.goto(`/${locale}/no-such-page/at-all`);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      copy[locale].notFound,
    );
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    await expect(
      page.getByRole("link", { name: copy[locale].love, exact: true }),
    ).toBeVisible();
    await page.getByRole("link", { name: copy[locale].browse }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/catalog$`));
  });

  test("an unknown product also gets the friendly 404", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    const response = await page.goto(`/${locale}/products/no-such-bouquet`);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      copy[locale].notFound,
    );
  });

  test("an unknown order id is a 404, not an error", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    expect((await page.goto(`/${locale}/orders/not-a-uuid`))?.status()).toBe(
      404,
    );
    expect(
      (
        await page.goto(
          `/${locale}/orders/00000000-0000-4000-8000-000000000000`,
        )
      )?.status(),
    ).toBe(404);
  });
});

test.describe("policy pages", () => {
  test("privacy explains the demo and PDPL rights, linked from the footer", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}`);
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: copy[locale].privacy })
      .click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/privacy$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      copy[locale].privacy,
    );
    await expect(page.getByRole("main")).toContainText(copy[locale].pdpl);
  });

  test("delivery policy shows the cut-off, substitutions and district fees from the database", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}`);
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: copy[locale].delivery })
      .click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/delivery-policy$`));
    await expect(page.getByRole("main")).toContainText(copy[locale].cutoff);
    await expect(
      page.getByRole("rowheader", { name: copy[locale].olaya }),
    ).toBeVisible();
  });
});
