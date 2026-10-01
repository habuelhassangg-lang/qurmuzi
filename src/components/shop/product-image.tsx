import { IMAGE_LARGE_WIDTH, IMAGE_SMALL_WIDTH } from "@/lib/catalog/images";
import { cn } from "@/lib/utils/cn";

type ProductImageProps = {
  /** Base path without size or extension, e.g. `/images/products/red-roses-1`. */
  path: string;
  alt: string;
  /** `sizes` attribute for responsive selection. */
  sizes: string;
  priority?: boolean;
  className?: string;
  /** 🪝 Shared-element transition (L1): a stable `view-transition-name`. */
  transitionName?: string;
};

/**
 * Pre-optimized 4:5 product image (AVIF → WebP fallback). Images are
 * generated at build time by `pnpm images`, so there is no runtime
 * image optimization cost.
 */
export function ProductImage({
  path,
  alt,
  sizes,
  priority,
  className,
  transitionName,
}: ProductImageProps) {
  const srcSet = (format: "avif" | "webp") =>
    `${path}-${IMAGE_SMALL_WIDTH}.${format} ${IMAGE_SMALL_WIDTH}w, ${path}-${IMAGE_LARGE_WIDTH}.${format} ${IMAGE_LARGE_WIDTH}w`;

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
      <img
        src={`${path}-${IMAGE_LARGE_WIDTH}.webp`}
        alt={alt}
        width={IMAGE_SMALL_WIDTH}
        height={(IMAGE_SMALL_WIDTH * 5) / 4}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        style={
          transitionName ? { viewTransitionName: transitionName } : undefined
        }
        className={cn(
          "aspect-[4/5] w-full rounded-xl bg-muted object-cover",
          className,
        )}
      />
    </picture>
  );
}
