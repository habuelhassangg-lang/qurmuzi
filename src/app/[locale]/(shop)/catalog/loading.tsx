import { ProductCardSkeleton } from "@/components/shop/product-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CatalogLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8"
      aria-busy="true"
    >
      <Skeleton className="h-9 w-40" />
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex gap-2 overflow-hidden">
          {[0, 1, 2, 3, 4].map((chip) => (
            <Skeleton key={chip} className="h-11 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      ))}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
