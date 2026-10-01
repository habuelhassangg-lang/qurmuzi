import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { e2eFixtureDates } from "../../scripts/data/e2e-fixtures";
import { riyadhDateString } from "../../src/lib/utils/dates";
import { projectLocale, type Locale } from "./helpers";

const TEST_CLOCK_COOKIE = "qz-test-now";

async function axeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  return results.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );
}

const copy = {
  ar: {
    large: "كبير",
    chocolate: "شوكولاتة فاخرة",
    addToCart: "أضف للسلة",
    viewCart: "عرض السلة",
    checkout: "إتمام الطلب",
    recipientName: "اسم المستلم",
    recipientPhone: "جوال المستلم",
    riyadh: "الرياض",
    olaya: /العليا/,
    address: "العنوان بالتفصيل",
    next: "التالي",
    giftMessage: "رسالة كرت الإهداء (اختياري)",
    buyerName: "اسمك",
    buyerPhone: "جوالك",
    buyerEmail: "بريدك الإلكتروني",
    placeOrder: /أكّد الطلب/,
    success: "تم استلام طلبك 🌹",
    total: "433 ر.س",
    vat: "56.48 ر.س",
    tabby: "تابي",
    mobileError: "اكتب رقم جوال سعودي صحيح",
    emptyCart: "سلتك فاضية",
  },
  en: {
    large: "Large",
    chocolate: "Luxury chocolate",
    addToCart: "Add to cart",
    viewCart: "View cart",
    checkout: "Checkout",
    recipientName: "Recipient name",
    recipientPhone: "Recipient mobile",
    riyadh: "Riyadh",
    olaya: /Al Olaya/,
    address: "Full address",
    next: "Next",
    giftMessage: "Gift card message (optional)",
    buyerName: "Your name",
    buyerPhone: "Your mobile",
    buyerEmail: "Your email",
    placeOrder: /Place order/,
    success: "We've got your order 🌹",
    total: "SAR 433",
    vat: "SAR 56.48",
    tabby: "Tabby",
    mobileError: "Enter a valid Saudi mobile",
    emptyCart: "Your cart is empty",
  },
} as const;

async function addProductAndCheckout(page: Page, locale: Locale) {
  const c = copy[locale];
  await page.goto(`/${locale}/products/crimson-classic`);
  await page.getByText(c.large, { exact: true }).click();
  await page.getByText(c.chocolate).click();
  await page.getByRole("button", { name: c.addToCart }).click();
  await page.getByRole("button", { name: c.viewCart }).click();
  await expect(page.getByTestId("cart-subtotal")).toBeVisible();
  await page.getByRole("link", { name: c.checkout }).click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/checkout$`));
}

async function fillRecipient(page: Page, locale: Locale) {
  const c = copy[locale];
  await page.getByLabel(c.recipientName).fill("Sara Ahmed");
  await page.getByLabel(c.recipientPhone).fill("0501234567");
  await page.locator("#city").click();
  await page.getByRole("option", { name: c.riyadh }).click();
  await page.locator("#district").click();
  await page.getByRole("option", { name: c.olaya }).click();
  await page.getByLabel(c.address).fill("Tahlia Street, building 12");
  // Tomorrow (index 1) is never affected by the fixtures or the cut-off.
  await page.locator("[data-date]").nth(1).click();
  await page.locator('[data-slot-id][data-status="available"]').first().click();
}

async function fillBuyer(page: Page, locale: Locale) {
  const c = copy[locale];
  await page.getByLabel(c.buyerName).fill("Ahmed");
  await page.getByLabel(c.buyerPhone).fill("0551112222");
  await page.getByLabel(c.buyerEmail).fill("ahmed@example.com");
}

test.describe("purchase journey", () => {
  test("guest buys a bouquet with mada and sees the invoice", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    const c = copy[locale];
    const sentBodies: string[] = [];
    page.on("request", (request) => {
      const body = request.postData();
      if (body) sentBodies.push(body);
    });

    await addProductAndCheckout(page, locale);
    await fillRecipient(page, locale);
    await page.getByRole("button", { name: c.next }).click();
    await page.getByLabel(c.giftMessage).fill("Happy birthday 🌹");
    await page.getByRole("button", { name: c.next }).click();
    await fillBuyer(page, locale);
    await expect(page.getByTestId("card-form")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
    await expect(page.getByTestId("checkout-total").first()).toHaveText(
      c.total,
    );

    await page.getByRole("button", { name: c.placeOrder }).click();
    await expect(page).toHaveURL(/\/orders\/[0-9a-f-]{36}$/, {
      timeout: 15_000,
    });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(c.success);
    await expect(page.getByTestId("order-number")).toHaveText(
      /^QZ-\d{6}-[A-Z0-9]{6}$/,
    );
    await expect(page.getByTestId("invoice-total")).toHaveText(c.total);
    await expect(page.getByTestId("invoice-vat")).toHaveText(c.vat);
    await expect(page.getByTestId("zatca-qr").locator("svg")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
    await expect(page.locator("main")).not.toContainText(/[٠-٩]/);

    // Card data never leaves the browser.
    expect(sentBodies.some((body) => /4464|0400 ?0000/.test(body))).toBe(false);
    // The cart is emptied after the order.
    await expect(page.getByTestId("cart-count")).toHaveCount(0);
  });

  test("pays with Tabby: shows 4 installments and completes", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    const c = copy[locale];
    await addProductAndCheckout(page, locale);
    await fillRecipient(page, locale);
    await page.getByRole("button", { name: c.next }).click();
    await page.getByRole("button", { name: c.next }).click();
    await fillBuyer(page, locale);
    await page.getByRole("radio", { name: c.tabby }).click();
    await expect(
      page.getByTestId("installments").getByRole("listitem"),
    ).toHaveCount(4);
    await page.getByRole("button", { name: c.placeOrder }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      c.success,
      { timeout: 15_000 },
    );
  });

  test("validates the recipient step before moving on", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    const c = copy[locale];
    await addProductAndCheckout(page, locale);
    await page.getByLabel(c.recipientPhone).fill("12345");
    await page.getByRole("button", { name: c.next }).click();
    await expect(page.getByText(c.mobileError)).toBeVisible();
    await expect(page.getByLabel(c.recipientName)).toBeVisible();
  });

  test("checkout never scrolls sideways", async ({ page }, testInfo) => {
    const locale = projectLocale(testInfo);
    await addProductAndCheckout(page, locale);
    const width = page.viewportSize()!.width;
    // On mobile, overflowing content widens the layout viewport, so compare with the device width.
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  });

  test("checkout with an empty cart shows the empty state", async ({
    page,
  }, testInfo) => {
    const locale = projectLocale(testInfo);
    await page.goto(`/${locale}/checkout`);
    await expect(page.getByText(copy[locale].emptyCart)).toBeVisible();
  });
});

test.describe("delivery edge cases (server time, capacity, blackout)", () => {
  const today = riyadhDateString();
  const { fullSlotDate, blackoutDate } = e2eFixtureDates(today);

  async function openCheckoutAt(
    page: Page,
    locale: Locale,
    riyadhTime: string,
  ) {
    await page.context().addCookies([
      {
        name: TEST_CLOCK_COOKIE,
        value: `${today}T${riyadhTime}:00+03:00`,
        url: page.url() || "http://localhost:3000",
      },
    ]);
    await addProductAndCheckout(page, locale);
  }

  test("before the cut-off, today is open but early slots are not", async ({
    page,
    baseURL,
  }, testInfo) => {
    await page.goto(baseURL!);
    await openCheckoutAt(page, projectLocale(testInfo), "10:00");
    const todayButton = page.locator(`[data-date="${today}"]`);
    await expect(todayButton).toHaveAttribute("data-status", "available");
    await todayButton.click();
    await expect(
      page.locator('[data-slot-id][data-status="too-soon"]').first(),
    ).toBeDisabled();
    await expect(
      page.locator('[data-slot-id][data-status="available"]').first(),
    ).toBeEnabled();
  });

  test("after the cut-off, same-day delivery disappears", async ({
    page,
    baseURL,
  }, testInfo) => {
    await page.goto(baseURL!);
    await openCheckoutAt(page, projectLocale(testInfo), "15:00");
    const todayButton = page.locator(`[data-date="${today}"]`);
    await expect(todayButton).toHaveAttribute("data-status", "past-cutoff");
    await expect(todayButton).toBeDisabled();
  });

  test("a full slot is disabled", async ({ page, baseURL }, testInfo) => {
    await page.goto(baseURL!);
    await openCheckoutAt(page, projectLocale(testInfo), "10:00");
    await page.locator(`[data-date="${fullSlotDate}"]`).click();
    const firstSlot = page.locator("[data-slot-id]").first();
    await expect(firstSlot).toHaveAttribute("data-status", "full");
    await expect(firstSlot).toBeDisabled();
  });

  test("a blackout day cannot be chosen", async ({
    page,
    baseURL,
  }, testInfo) => {
    await page.goto(baseURL!);
    await openCheckoutAt(page, projectLocale(testInfo), "10:00");
    const blackout = page.locator(`[data-date="${blackoutDate}"]`);
    await expect(blackout).toHaveAttribute("data-status", "blackout");
    await expect(blackout).toBeDisabled();
  });
});
