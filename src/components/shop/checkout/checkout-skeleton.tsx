import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder for the checkout form while the cart is read and priced. */
export function CheckoutSkeleton() {
  return (
    <div
      className="grid min-h-[70vh] gap-6 lg:grid-cols-[1fr_22rem]"
      aria-busy="true"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 flex-1" />
          ))}
        </div>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
        <div className="flex gap-2 overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-24 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
