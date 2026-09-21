import { MoveDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/ArticleCard";
import { getArticles } from "@/features/articles/actions";

/**
 * Articles feed page (`/articles`).
 *
 * Server Component that lists the articles of the themes the current user is
 * subscribed to (newest first) as a responsive grid of `ArticleCard`. An
 * action bar above the grid holds the "create article" button and the
 * "sort by" control.
 * @param searchParams -
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const articles = await getArticles(sort);

  return (
    <div className="mx-auto max-w-[1272px]">
      <div className="flex flex-col items-center gap-4 px-6 pt-6 md:flex-row md:justify-between">
        <Button type="button" size="lg" className="min-w-[153px]">
          Créer un article
        </Button>
        <Button type="button" variant="ghost" className="font-bold">
          Trier par
          <MoveDown />
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
