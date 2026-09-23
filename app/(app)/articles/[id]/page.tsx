import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleById } from "@/features/articles/actions";
import { getCommentsByArticle } from "@/features/comments/actions";
import { CreateCommentForm } from "@/features/comments/CreateCommentForm";

/**
 * Article detail page (`/articles/[id]`).
 *
 * Server Component that displays a single article in full: title, date,
 * author, theme and content, with a link back to the article feed, followed
 * by its comments. Triggers a 404 when the article does not exist.
 *
 * Layout: the back arrow sits on its own row, except on large screens where
 * the header is a 3-column grid (`1fr minmax(0,800px) 1fr`) so the title lines
 * up with the content block below. Title, metadata and content share an
 * 800px centered column and are all left-aligned.
 *
 * @param props - Route props. `params` is a Promise since Next.js 15.
 */

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, comments] = await Promise.all([
    getArticleById(id),
    getCommentsByArticle(id),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <article className="px-6 py-6">
      <div className="grid grid-cols-1 gap-y-4 lg:grid-cols-[1fr_minmax(0,800px)_1fr] lg:items-center">
        {/* pl-[21px] + px-6 (24px) = 45px, same left offset as before */}
        <Link
          href="/articles"
          aria-label="Retour aux articles"
          className="flex h-8 items-center justify-self-start pl-[21px]"
        >
          <MoveLeft size={47} absoluteStrokeWidth />
        </Link>
        <h1 className="min-h-[48px] w-full min-w-0 max-w-[265px] text-left text-2xl font-semibold md:mx-auto md:max-w-[800px]">
          {article.title}
        </h1>
      </div>

      <div className="mx-auto mt-6 max-w-[800px]">
        <div className="flex flex-wrap justify-start gap-x-5 gap-y-2 text-xl">
          <span>{new Date(article.createdAt).toLocaleDateString("fr-FR")}</span>
          <span>{article.author.username}</span>
          <span className="basis-full md:basis-auto">{article.theme.name}</span>
        </div>
        <p className="mt-6 whitespace-pre-wrap">{article.content}</p>
      </div>

      <div className="mx-auto mt-6 max-w-[800px]">
        <hr className="border-border" />
        <h2 className="mt-6 mb-4 text-xl font-bold">Commentaires</h2>
        {comments.length === 0 ? (
          <p className="text-muted-foreground">
            Aucun commentaire pour le moment.
          </p>
        ) : (
          <ul className="flex list-none flex-col gap-4">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="flex flex-col gap-1 md:flex-row md:items-start md:justify-end md:gap-4"
              >
                <p className="text-right text-sm font-medium md:shrink-0 md:text-left">
                  {comment.author.username}
                </p>
                <div className="w-full min-h-[92px] self-start rounded-lg bg-[#EEEEEE] p-4 text-sm whitespace-pre-wrap md:w-[449px] md:min-h-[100px]">
                  {comment.content}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6">
          <CreateCommentForm articleId={article.id} />
        </div>
      </div>
    </article>
  );
}
