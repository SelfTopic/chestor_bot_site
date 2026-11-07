import type { JsonLd as JsonLdData } from "@/lib/seo/jsonLd";

// «<» экранируется, чтобы текст из справки не закрыл тег script.
export function JsonLd({ data }: { data: JsonLdData | JsonLdData[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
