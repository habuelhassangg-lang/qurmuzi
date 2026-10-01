import type { TestInfo } from "@playwright/test";

export type Locale = "ar" | "en";

export function projectLocale(testInfo: TestInfo): Locale {
  return testInfo.project.metadata.locale as Locale;
}

export function isMobile(testInfo: TestInfo): boolean {
  return testInfo.project.name.startsWith("mobile");
}
