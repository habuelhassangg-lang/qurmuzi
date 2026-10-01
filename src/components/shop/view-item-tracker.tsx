"use client";

import { useEffect } from "react";
import { track, type AnalyticsEventMap } from "@/lib/analytics";

/** Fires `view_item` once per product view (🪝 tracking stub, sends nothing). */
export function ViewItemTracker(props: AnalyticsEventMap["view_item"]) {
  const { item_id, item_name, value, currency } = props;
  useEffect(() => {
    track("view_item", { item_id, item_name, value, currency });
  }, [item_id, item_name, value, currency]);
  return null;
}
