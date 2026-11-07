import { isLang, LANGS } from "@/i18n/config";
import { findPage, loadPages } from "@/lib/docs/load";
import { pageMarkdown } from "@/lib/seo/markdown";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.flatMap((lang) => loadPages(lang).map((page) => ({ lang, file: `${page.slug}.md` })));
}

export async function GET(_request: Request, { params }: RouteContext<"/md/[lang]/[file]">): Promise<Response> {
  const { lang, file } = await params;
  const page = isLang(lang) ? findPage(lang, file.replace(/\.md$/, "")) : undefined;
  if (!isLang(lang) || !page) return new Response("Not found", { status: 404 });
  return new Response(pageMarkdown(lang, page), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
