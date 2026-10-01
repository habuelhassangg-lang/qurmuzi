/**
 * Tracking hook (🪝 L5). `track()` is called in the right places but sends
 * nothing: there are no vendors in the MVP. It already respects a consent
 * state, which defaults to "denied". When consent is granted it only emits a
 * local `qurmuzi:track` DOM event (no network), which tests can listen to.
 */

export type AnalyticsEventMap = {
  view_item: {
    item_id: string;
    item_name: string;
    value: number;
    currency: "SAR";
  };
  add_to_cart: {
    item_id: string;
    value: number;
    currency: "SAR";
    quantity: number;
  };
  begin_checkout: { value: number; currency: "SAR" };
  add_payment_info: { payment_type: string; value: number; currency: "SAR" };
  purchase: { transaction_id: string; value: number; currency: "SAR" };
};

export type AnalyticsEvent = keyof AnalyticsEventMap;
export type ConsentState = "granted" | "denied";

let consent: ConsentState = "denied";

export function getConsent(): ConsentState {
  return consent;
}

export function setConsent(state: ConsentState) {
  consent = state;
}

export function track<E extends AnalyticsEvent>(
  event: E,
  params: AnalyticsEventMap[E],
): boolean {
  if (consent !== "granted" || typeof window === "undefined") return false;
  window.dispatchEvent(
    new CustomEvent("qurmuzi:track", { detail: { event, params } }),
  );
  return true;
}
