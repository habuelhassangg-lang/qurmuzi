import { expect, test } from "@playwright/test";
import { isMobile, projectLocale } from "./helpers";

const copy = {
  ar: {
    cart: "السلة، فارغة",
    switchTo: "English",
    menu: "القائمة",
    catalog: "كل الورد",
  },
  en: {
    cart: "Cart, empty",
    switchTo: "العربية",
    menu: "Menu",
    catalog: "All flowers",
  },
} as const;

test.describe("header", () => {
  test("shows the logo, cart and language switcher", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}`);

    const header = page.getByRole("banner");
    await expect(
      header.getByRole("link", { name: copy[locale].cart }),
    ).toBeVisible();
    await expect(
      header.getByRole("link", { name: copy[locale].switchTo }),
    ).toBeVisible();
  });

  test("language switcher keeps the current page", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    const other = locale === "ar" ? "en" : "ar";
    await page.goto(`/${locale}/styleguide`);

    await page
      .getByRole("banner")
      .getByRole("link", { name: copy[locale].switchTo })
      .click();
    await expect(page).toHaveURL(new RegExp(`/${other}/styleguide$`));
    await expect(page.locator("html")).toHaveAttribute("lang", other);
  });

  test("navigation: inline on desktop, in a menu on mobile", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}`);
    const header = page.getByRole("banner");

    if (isMobile(testInfo)) {
      await expect(
        header.getByRole("link", { name: copy[locale].catalog }),
      ).toBeHidden();
      await header.getByRole("button", { name: copy[locale].menu }).click();
      await expect(
        page
          .getByRole("dialog")
          .getByRole("link", { name: copy[locale].catalog }),
      ).toBeVisible();
    } else {
      await expect(
        header.getByRole("button", { name: copy[locale].menu }),
      ).toBeHidden();
      await expect(
        header.getByRole("link", { name: copy[locale].catalog }),
      ).toBeVisible();
    }
  });

  test("tap targets in the header are at least 44px", async ({
    page,
  }, testInfo) => {
    await page.goto(`/${projectLocale(testInfo)}`);
    const targets = page
      .getByRole("banner")
      .locator("a:visible, button:visible");
    for (const box of await targets.evaluateAll((els) =>
      els
        .map((el) => el.getBoundingClientRect())
        .map(({ width, height }) => ({ width, height })),
    )) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test("footer shows the demo disclaimer", async ({ page }, testInfo) => {
  await page.goto(`/${projectLocale(testInfo)}`);
  await expect(page.getByRole("contentinfo")).toBeVisible();
});
