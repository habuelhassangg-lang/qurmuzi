import { notFound } from "next/navigation";

/** Any unknown path under /ar or /en renders the localized 404 (with a 404 status). */
export default function CatchAllPage() {
  notFound();
}
