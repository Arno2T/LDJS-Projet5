import { MoveDown, MoveUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/ArticleCard";
import { getArticles } from "@/features/articles/actions";
import Link from "next/link";

/**
 * Articles feed page (`/articles`).
 *
 * Server Component that lists the articles of the themes the current user is
 * subscribed to as a responsive grid of `ArticleCard`. An action bar above
 * the grid holds the "create article" link and the "sort by" link, which
 * toggles the order through the `?sort=` query parameter.
 *
 * @param props - Route props. `searchParams` is a Promise since Next.js 15;
 * `sort` is `"asc"` (oldest first), any other value means `"desc"` (newest
 * first, the default).
 *
 * @remarks
 * The `1272px` max width is derived from the cards (3 x 392px + gaps and
 * padding), not taken from the Figma mockup.
 */

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const articles = await getArticles(sort);

  const isAsc = sort === "asc";
  const nextSort = isAsc ? "desc" : "asc";
  const currentOrder = isAsc
    ? "du plus ancien au plus récent"
    : "du plus récent au plus ancien";

  return (
    <div className="mx-auto max-w-[1272px]">
      <div className="flex flex-col items-center gap-4 px-6 pt-6 md:flex-row md:justify-between">
        <Button size="lg" className="min-w-[153px]" asChild>
          <Link href="/articles/new">Créer un article</Link>
        </Button>
        <Button variant="ghost" className="font-bold" asChild>
          <Link
            href={`/articles?sort=${nextSort}`}
            aria-label={`Trier par date, ordre actuel : ${currentOrder}. Inverser l'ordre`}
          >
            Trier par
            {isAsc ? <MoveUp /> : <MoveDown />}
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
