/**
 * Mock payment methods behind one interface (CLAUDE.md section 7).
 * Nothing here talks to a real provider. `authorize()` runs in the browser
 * and returns a fake reference; the server only ever receives the method id
 * and that reference — never card numbers, OTPs or logins.
 */
import { calculateInstallments } from "./installments";

export const PAYMENT_METHODS = [
  "mada",
  "apple_pay",
  "stc_pay",
  "tabby",
  "tamara",
  "cash_on_delivery",
] as const;
export type PaymentMethodId = (typeof PAYMENT_METHODS)[number];

export type AuthorizeResult =
  { ok: true; reference: string } | { ok: false; reason: "declined" };

export type PaymentMethod = {
  id: PaymentMethodId;
  /** Buy now, pay later: split into 4 installments. */
  installments: boolean;
  authorize(totalHalalas: number): Promise<AuthorizeResult>;
};

function mockReference(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `MOCK-${prefix}-${random}`;
}

function mockMethod(
  id: PaymentMethodId,
  prefix: string,
  installments = false,
): PaymentMethod {
  return {
    id,
    installments,
    async authorize() {
      return { ok: true, reference: mockReference(prefix) };
    },
  };
}

export const paymentMethods: Record<PaymentMethodId, PaymentMethod> = {
  mada: mockMethod("mada", "MADA"),
  apple_pay: mockMethod("apple_pay", "APAY"),
  stc_pay: mockMethod("stc_pay", "STC"),
  tabby: mockMethod("tabby", "TABBY", true),
  tamara: mockMethod("tamara", "TAMARA", true),
  cash_on_delivery: mockMethod("cash_on_delivery", "COD"),
};

export { calculateInstallments };
