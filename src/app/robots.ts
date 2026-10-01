import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/ar/styleguide", "/en/styleguide"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
