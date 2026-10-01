"use server";

import { getNow } from "@/lib/clock";
import { createOrder, type CreateOrderResult } from "@/lib/orders/create-order";

/** Guest checkout. All validation, pricing and capacity checks happen in `createOrder`. */
export async function createOrderAction(
  input: unknown,
): Promise<CreateOrderResult> {
  try {
    return await createOrder(input, await getNow());
  } catch (error) {
    console.error("createOrder failed", error);
    return { ok: false, error: "invalid" };
  }
}
