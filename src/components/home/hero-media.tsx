import { preload } from "react-dom";
import { IMAGE_LARGE_WIDTH, IMAGE_SMALL_WIDTH } from "@/lib/catalog/images";

const HERO_PATH = "/images/home/hero-1";

/**
 * 🪝 Hero media slot. In the MVP it is a static, pre-sized image and the LCP
 * element. The L1 "crimson flower blooming on scroll" replaces this
 * component's contents only; the hero layout does not change.
 */
export function HeroMedia({ alt }: { alt: string }) {
  const srcSet = (format: "avif" | "webp") =>
    `${HERO_PATH}-${IMAGE_SMALL_WIDTH}.${format} ${IMAGE_SMALL_WIDTH}w, ${HERO_PATH}-${IMAGE_LARGE_WIDTH}.${format} ${IMAGE_LARGE_WIDTH}w`;
  const sizes = "(min-width: 768px) 40vw, 80vw";
  // Start the LCP image download from the <head>, ahead of scripts and fonts.
  preload(`${HERO_PATH}-${IMAGE_LARGE_WIDTH}.avif`, {
    as: "image",
    type: "image/avif",
    imageSrcSet: srcSet("avif"),
    imageSizes: sizes,
    fetchPriority: "high",
  });

  return (
    <div data-slot="hero-media" className="relative">
      <picture>
        <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
        <img
          src={`${HERO_PATH}-${IMAGE_LARGE_WIDTH}.webp`}
          alt={alt}
          width={IMAGE_SMALL_WIDTH}
          height={(IMAGE_SMALL_WIDTH * 5) / 4}
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          className="aspect-[4/5] w-full rounded-xl object-cover"
        />
      </picture>
    </div>
  );
}
