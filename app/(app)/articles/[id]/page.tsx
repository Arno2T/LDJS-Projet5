import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleById } from "@/features/articles/actions";

/**
 * Article detail page (`/articles/[id]`).
 *
 * Server Component that displays a single article in full: title, date,
 * author, theme and content, with a link back to the article feed.
 * Triggers a 404 when the article does not exist.
 *
 * @param props - Route props. `params` is a Promise since Next.js 15.
 *
 * @remarks
 * The comments section shown in the Figma mockup is not implemented yet.
 */

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <article className="grid grid-cols-[auto_1fr] gap-x-5 py-6 pr-6 pl-[45px]">
      <Link
        href="/articles"
        aria-label="Retour aux articles"
        className="flex h-8 items-center"
      >
        <MoveLeft size={47} absoluteStrokeWidth />
      </Link>
      <h1 className="min-h-[48px] w-full min-w-0 max-w-[265px] text-2xl font-semibold md:max-w-[728px]">
        {article.title}
      </h1>

      <div className="col-span-2 min-w-0 md:col-span-1 md:col-start-2">
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xl">
          <span>{new Date(article.createdAt).toLocaleDateString("fr-FR")}</span>
          <span>{article.author.username}</span>
          <span className="basis-full md:basis-auto">{article.theme.name}</span>
        </div>
        <p className="mt-6 max-w-[728px] whitespace-pre-wrap">
          {article.content}
        </p>
      </div>
    </article>
  );
}
