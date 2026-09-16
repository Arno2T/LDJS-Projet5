import { getArticles } from "@/features/articles/actions";

export default async function Page() {
  const articles = await getArticles();

  const listArticles = articles.map((article) => {
    return (
      <li key={article.id}>
        <p>{article.title}</p>
        <p>{article.content}</p>
      </li>
    );
  });
  return <ul>{listArticles}</ul>;
}
