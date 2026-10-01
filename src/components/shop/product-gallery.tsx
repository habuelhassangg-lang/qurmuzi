"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { ProductImage } from "./product-image";

type GalleryImage = { path: string; alt: string };

/** Main image + thumbnails. The first image is the LCP element. */
export function ProductGallery({
  images,
  transitionName,
}: {
  images: GalleryImage[];
  transitionName: string;
}) {
  const t = useTranslations("Product");
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];
  if (!current) return null;

  return (
    <div className="flex flex-col gap-3" aria-label={t("gallery")} role="group">
      <ProductImage
        key={current.path}
        path={current.path}
        alt={current.alt}
        sizes="(min-width: 768px) 50vw, 100vw"
        priority={active === 0}
        transitionName={active === 0 ? transitionName : undefined}
      />
      {images.length > 1 && (
        <ul className="flex gap-2">
          {images.map((image, index) => (
            <li key={image.path}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={t("showImage", { number: String(index + 1) })}
                aria-pressed={index === active}
                className={cn(
                  "block w-16 cursor-pointer overflow-hidden rounded-md border-2 transition-colors",
                  index === active
                    ? "border-crimson-600"
                    : "border-transparent hover:border-line",
                )}
              >
                <ProductImage
                  path={image.path}
                  alt=""
                  sizes="64px"
                  className="rounded-none"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
