import { Skeleton } from "@/components/ui/skeleton";
import { CheckoutSkeleton } from "@/components/shop/checkout/checkout-skeleton";

export default function CheckoutLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <Skeleton className="mb-6 h-9 w-48" />
      <CheckoutSkeleton />
    </div>
  );
}
