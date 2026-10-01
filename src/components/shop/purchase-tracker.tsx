"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Fires `purchase` once per order confirmation view (🪝 tracking stub, sends nothing). */
export function PurchaseTracker({
  orderNumber,
  value,
}: {
  orderNumber: string;
  value: number;
}) {
  useEffect(() => {
    track("purchase", { transaction_id: orderNumber, value, currency: "SAR" });
  }, [orderNumber, value]);
  return null;
}
