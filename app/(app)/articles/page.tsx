import ArticleCard from "@/components/ArticleCard";
import { getArticles } from "@/features/articles/actions";

export default async function Page() {
  const articles = await getArticles();

  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
